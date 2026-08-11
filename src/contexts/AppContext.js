import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_PETITIONS, MOCK_USER, SEED_NOTIFICATIONS, BADGES } from '../data/petitions';
import { LEVELS } from '../theme';
import { computeStreaks } from '../utils/helpers';
import { auth, FIREBASE_ENABLED } from '../config/firebase';
import { supabase, SUPABASE_ENABLED } from '../config/supabase';
import { apiRequest, API_BASE_URL } from '../config/api';
import { pushLocal, ensureDailyReminder } from '../utils/notifications';

const AppContext = createContext(null);
// The design's daily challenge is five signatures.
const DAILY_GOAL = 5;
const PROFILE_STORAGE_PREFIX = 'swipe4change:profile:';
const LAST_PROFILE_STORAGE_KEY = 'swipe4change:lastProfile';
const ACCOUNT_STORAGE_PREFIX = 'swipe4change:account:';
const LAST_ACCOUNT_STORAGE_KEY = 'swipe4change:lastAccount';

const createInitialContributions = () => {
  const map = {};
  const now = new Date();
  for (let i = 0; i < 30; i += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    map[day.toISOString().slice(0, 10)] = 0;
  }
  return map;
};

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'New',
    lastName: parts.slice(1).join(' ') || 'User',
  };
};

const demoUserId = (email = '') => `demo:${String(email || MOCK_USER.email).trim().toLowerCase()}`;

// A fresh account should not inherit the mock persona's identity fields.
const freshProfileFromEmail = (email = '') => {
  const handle = String(email).split('@')[0] || 'New User';
  const first = handle.replace(/[._-]+/g, ' ').trim().split(/\s+/)[0] || 'New';
  return {
    firstName: first.charAt(0).toUpperCase() + first.slice(1),
    lastName: '',
    location: '',
    address: '',
    profilePic: null,
    signature: null,
  };
};

const firebaseUserToProfile = (fbUser) => {
  const name = splitName(fbUser.displayName || '');
  return {
    id: fbUser.uid,
    firstName: name.firstName,
    lastName: name.lastName,
    email: fbUser.email || '',
    phoneNumber: fbUser.phoneNumber || '',
  };
};

const profileStorageKey = (identifier) => `${PROFILE_STORAGE_PREFIX}${String(identifier || '').toLowerCase()}`;
const accountStorageKey = (identifier) => `${ACCOUNT_STORAGE_PREFIX}${String(identifier || '').toLowerCase()}`;

const loadStoredProfile = async (identifier) => {
  if (!identifier) return null;
  try {
    const raw = await AsyncStorage.getItem(profileStorageKey(identifier));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Profile load failed:', error.message);
    return null;
  }
};

const persistProfile = async (profile) => {
  try {
    const encoded = JSON.stringify(profile);
    await AsyncStorage.setItem(LAST_PROFILE_STORAGE_KEY, encoded);
    const keys = [profile.id, profile.email].filter(Boolean);
    await Promise.all(keys.map((key) => AsyncStorage.setItem(profileStorageKey(key), encoded)));
  } catch (error) {
    console.warn('Profile save failed:', error.message);
  }
};

const loadStoredAccount = async (identifier) => {
  if (!identifier) return null;
  try {
    const raw = await AsyncStorage.getItem(accountStorageKey(identifier));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Account load failed:', error.message);
    return null;
  }
};

const persistAccount = async (account) => {
  try {
    const encoded = JSON.stringify(account);
    await AsyncStorage.setItem(LAST_ACCOUNT_STORAGE_KEY, encoded);
    const keys = [account.user?.id, account.user?.email].filter(Boolean);
    await Promise.all(keys.map((key) => AsyncStorage.setItem(accountStorageKey(key), encoded)));
  } catch (error) {
    console.warn('Account save failed:', error.message);
  }
};

const withoutEmptyValues = (profile = {}) => Object.fromEntries(
  Object.entries(profile).filter(([, value]) => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  })
);

const fetchRemoteProfile = async (identifier) => {
  if (!API_BASE_URL || !identifier) return null;
  try {
    const result = await apiRequest(`/api/user/${encodeURIComponent(identifier)}`);
    return withoutEmptyValues(result?.user || {});
  } catch (error) {
    console.warn('Remote profile load failed:', error.message);
    return null;
  }
};

const fetchRemoteAccountData = async (identifier) => {
  if (!API_BASE_URL || !identifier) return {};

  try {
    const [signaturesResult, savedResult, notificationsResult] = await Promise.all([
      apiRequest(`/api/user/${encodeURIComponent(identifier)}/signatures`),
      apiRequest(`/api/user/${encodeURIComponent(identifier)}/saved`),
      apiRequest(`/api/user/${encodeURIComponent(identifier)}/notifications`),
    ]);

    return {
      signedIds: (signaturesResult?.signatures || [])
        .map((item) => item.petitionId || item.petition_id)
        .filter(Boolean),
      savedIds: (savedResult?.saved || [])
        .map((item) => item.petitionId || item.petition_id)
        .filter(Boolean),
      notifications: (notificationsResult?.notifications || []).map(notificationFromRow),
    };
  } catch (error) {
    console.warn('Remote account activity load failed:', error.message);
    return {};
  }
};

const rowToPetition = (row) => ({
  id: row.id,
  title: row.title,
  summary: row.summary,
  category: row.category,
  organization: row.organization,
  location: row.location,
  signed: row.current_signatures || 0,
  goal: row.signature_goal || 100,
  urgency: row.urgency || 'medium',
  daysLeft: 30,
  weeklyIncrease: row.weekly_increase || 0,
  imageUrl: row.image_url,
  why: row.description || row.summary,
  ask: row.ask,
  affects: [],
  tags: row.tags || [],
  verified: Boolean(row.verified),
  recipient: row.recipient,
});

const petitionToRow = (petition) => ({
  title: petition.title,
  summary: petition.summary,
  description: petition.why || petition.summary,
  ask: petition.ask,
  image_url: petition.imageUrl,
  category: petition.category,
  organization: petition.organization,
  location: petition.location,
  urgency: petition.urgency,
  recipient: petition.recipient,
  tags: petition.tags || [],
  signature_goal: petition.goal,
  current_signatures: petition.signed || 0,
  weekly_increase: petition.weeklyIncrease || 0,
  status: petition.status || 'pending',
});

const notificationFromRow = (row) => ({
  id: row.id,
  type: row.type,
  title: row.title,
  body: row.body,
  read: Boolean(row.read),
  petitionId: row.petitionId || row.petition_id,
  recipient: row.recipient,
  situation: row.situation,
  ask: row.ask,
  verified: Boolean(row.verified),
  createdAt: row.createdAt || row.created_at,
});

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(FIREBASE_ENABLED);
  const [accountHydrated, setAccountHydrated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState(MOCK_USER);
  const hydratedRef = useRef(false);
  const [petitions, setPetitions] = useState(SEED_PETITIONS);
  const [deckIndex, setDeckIndex] = useState(0);
  const [signedIds, setSignedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [createdPetitions, setCreatedPetitions] = useState([]);

  const [contributions, setContributions] = useState(createInitialContributions);
  const [celebration, setCelebration] = useState(null);
  const clearCelebration = useCallback(() => setCelebration(null), []);

  const resetAccountState = useCallback((profile = MOCK_USER) => {
    setUser(profile);
    setDeckIndex(0);
    setSignedIds([]);
    setSavedIds([]);
    setDailyCount(0);
    setNotifications(SEED_NOTIFICATIONS);
    setCreatedPetitions([]);
    setContributions(createInitialContributions());
  }, []);

  const restoreAccount = useCallback((account, userOverride = {}) => {
    if (!account) return;
    if (account.user) {
      setUser((current) => ({ ...current, ...account.user, ...userOverride }));
    }
    setDeckIndex(0);
    setSignedIds(Array.isArray(account.signedIds) ? account.signedIds : []);
    setSavedIds(Array.isArray(account.savedIds) ? account.savedIds : []);
    if (typeof account.dailyCount === 'number') setDailyCount(account.dailyCount);
    else setDailyCount(0);
    setNotifications(Array.isArray(account.notifications) ? account.notifications : SEED_NOTIFICATIONS);
    setCreatedPetitions(Array.isArray(account.createdPetitions) ? account.createdPetitions : []);
    if (account.contributions) {
      setContributions({ ...createInitialContributions(), ...account.contributions });
    } else {
      setContributions(createInitialContributions());
    }
  }, []);

  useEffect(() => {
    if (FIREBASE_ENABLED && auth) {
      hydratedRef.current = true;
      setAccountHydrated(true);
      return undefined;
    }

    AsyncStorage.getItem(LAST_ACCOUNT_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          restoreAccount(JSON.parse(raw));
          setIsAuthenticated(true);
          return;
        }
        return AsyncStorage.getItem(LAST_PROFILE_STORAGE_KEY).then((profileRaw) => {
          if (profileRaw) setUser((current) => ({ ...current, ...JSON.parse(profileRaw) }));
        });
      })
      .catch((error) => console.warn('Last account load failed:', error.message))
      .finally(() => {
        hydratedRef.current = true;
        setAccountHydrated(true);
      });
    return undefined;
  }, [restoreAccount]);

  useEffect(() => {
    if (!accountHydrated || !isAuthenticated) return;
    persistAccount({
      user,
      signedIds,
      savedIds,
      dailyCount,
      notifications,
      createdPetitions,
      contributions,
      updatedAt: new Date().toISOString(),
    });
    persistProfile(user);
  }, [
    accountHydrated,
    contributions,
    createdPetitions,
    dailyCount,
    notifications,
    savedIds,
    signedIds,
    user,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) {
      setAuthLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const base = firebaseUserToProfile(fbUser);
        const account = await loadStoredAccount(base.id) || await loadStoredAccount(base.email);
        const stored = account?.user || await loadStoredProfile(base.id) || await loadStoredProfile(base.email);
        const remote = await fetchRemoteProfile(base.id);
        const remoteAccount = await fetchRemoteAccountData(base.id);
        const next = { ...MOCK_USER, ...freshProfileFromEmail(base.email), ...base, ...(stored || {}), ...(remote || {}), id: base.id, email: base.email };
        resetAccountState(next);
        if (account) restoreAccount(account, next);
        setUser(next);
        if (Object.prototype.hasOwnProperty.call(remoteAccount, 'signedIds')) {
          setSignedIds(remoteAccount.signedIds);
        }
        if (Object.prototype.hasOwnProperty.call(remoteAccount, 'savedIds')) {
          setSavedIds(remoteAccount.savedIds);
        }
        if (Object.prototype.hasOwnProperty.call(remoteAccount, 'notifications')) {
          setNotifications(remoteAccount.notifications);
        }
        persistProfile(next);
        setIsAuthenticated(true);
      } else {
        resetAccountState(MOCK_USER);
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    });
  }, [resetAccountState, restoreAccount]);

  useEffect(() => {
    if (API_BASE_URL) {
      apiRequest('/api/petitions')
        .then((result) => {
          if (result?.petitions?.length) {
            // Merge with seeds so external sources (Regulations.gov, Action
            // Network) appear alongside the built-in petitions.
            setPetitions((current) => {
              const incomingIds = new Set(result.petitions.map((petition) => petition.id));
              return [...result.petitions, ...current.filter((petition) => !incomingIds.has(petition.id))];
            });
          }
        })
        .catch((error) => console.warn('API petition load failed:', error.message));
      return;
    }

    if (!SUPABASE_ENABLED || !supabase) return;

    supabase
      .from('petitions')
      .select('*')
      .in('status', ['approved', 'active', 'pending'])
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn('Supabase petition load failed:', error.message);
          return;
        }
        if (data?.length) {
          setPetitions(data.map(rowToPetition));
        }
      });
  }, []);

  useEffect(() => {
    setDeckIndex(0);
  }, [user.interests]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    // Mirror in-app events to the system tray on devices.
    pushLocal(notification.title, notification.body);
  }, []);

  // Ask for notification permission and set the evening streak reminder once
  // the user is actually signed in.
  useEffect(() => {
    if (isAuthenticated) ensureDailyReminder();
  }, [isAuthenticated]);

  const login = useCallback(async (email, password) => {
    setAuthError('');
    if (FIREBASE_ENABLED && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const accountId = demoUserId(normalizedEmail);
    const account = await loadStoredAccount(accountId) || await loadStoredAccount(normalizedEmail);
    const stored = account?.user || await loadStoredProfile(accountId) || await loadStoredProfile(normalizedEmail);
    const remote = await fetchRemoteProfile(stored?.id || accountId);
    const remoteAccount = await fetchRemoteAccountData(stored?.id || accountId);
    const next = {
      ...MOCK_USER,
      ...(stored || remote ? {} : freshProfileFromEmail(normalizedEmail)),
      id: stored?.id || accountId,
      email: normalizedEmail || remote?.email || stored?.email || MOCK_USER.email,
      ...(stored || {}),
      ...(remote || {}),
    };
    resetAccountState(next);
    if (account) restoreAccount(account, next);
    setUser(next);
    if (Object.prototype.hasOwnProperty.call(remoteAccount, 'signedIds')) {
      setSignedIds(remoteAccount.signedIds);
    }
    if (Object.prototype.hasOwnProperty.call(remoteAccount, 'savedIds')) {
      setSavedIds(remoteAccount.savedIds);
    }
    if (Object.prototype.hasOwnProperty.call(remoteAccount, 'notifications')) {
      setNotifications(remoteAccount.notifications);
    }
    persistProfile(next);
    setIsAuthenticated(true);
  }, [resetAccountState, restoreAccount]);

  const signup = useCallback(async ({ fullName, email, password, ...profile }) => {
    setAuthError('');
    const name = splitName(fullName);

    if (FIREBASE_ENABLED && auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: `${name.firstName} ${name.lastName}` });
      const next = { ...MOCK_USER, ...name, email, id: credential.user.uid, ...profile, interests: [], onboarded: false };
      resetAccountState(next);
      setUser(next);
      persistProfile(next);
      setIsAuthenticated(true);
      apiRequest('/api/user', {
        method: 'POST',
        body: JSON.stringify({ firebaseUid: credential.user.uid, ...name, email, ...profile }),
      }).catch((error) => console.warn('Profile sync failed:', error.message));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const next = { ...MOCK_USER, ...freshProfileFromEmail(normalizedEmail), ...name, email: normalizedEmail, id: demoUserId(normalizedEmail), ...profile, interests: [], onboarded: false };
    resetAccountState(next);
    setUser(next);
    persistProfile(next);
    apiRequest('/api/user', {
      method: 'POST',
      body: JSON.stringify({ firebaseUid: next.id, ...name, email: normalizedEmail, ...profile }),
    }).catch((error) => console.warn('Profile sync failed:', error.message));
    setIsAuthenticated(true);
  }, [resetAccountState]);

  const logout = useCallback(async () => {
    if (FIREBASE_ENABLED && auth) {
      await firebaseSignOut(auth);
    }
    await AsyncStorage.multiRemove([LAST_ACCOUNT_STORAGE_KEY, LAST_PROFILE_STORAGE_KEY])
      .catch((error) => console.warn('Session clear failed:', error.message));
    resetAccountState(MOCK_USER);
    setIsAuthenticated(false);
  }, [resetAccountState]);

  const updateUser = useCallback((data) => {
    setUser((current) => {
      const next = { ...current, ...data };
      if (API_BASE_URL) {
        apiRequest('/api/user', {
          method: 'POST',
          body: JSON.stringify({
            firebaseUid: next.id,
            firstName: next.firstName,
            lastName: next.lastName,
            email: next.email,
            location: next.location,
            address: next.address,
            interests: next.interests,
            signature: next.signature,
            profilePicUrl: next.profilePic,
            twoFactorEnabled: next.twoFactorEnabled,
            twoFactorMethod: next.twoFactorMethod,
            phoneNumber: next.phoneNumber,
            phoneVerified: next.phoneVerified,
            phoneVerifiedAt: next.phoneVerifiedAt,
          }),
        }).catch((error) => console.warn('Profile sync failed:', error.message));
      }
      persistProfile(next);
      return next;
    });
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const createPetition = useCallback((data) => {
    const petition = {
      ...data,
      id: `cp_${Date.now()}`,
      signed: 0,
      weeklyIncrease: 0,
      daysLeft: 30,
      status: 'pending',
      createdBy: user.id,
    };

    setCreatedPetitions((current) => [petition, ...current]);
    setPetitions((current) => [petition, ...current]);
    addNotification({
      type: 'petition_created',
      title: 'Petition submitted',
      body: `"${petition.title}" is under review.`,
      petitionId: petition.id,
      verified: false,
    });

    if (API_BASE_URL) {
      apiRequest('/api/petitions', {
        method: 'POST',
        body: JSON.stringify({ petition, firebaseUid: user.id }),
      })
        .then((result) => {
          if (!result?.petition) return;
          setCreatedPetitions((current) => current.map((item) => (
            item.id === petition.id ? { ...item, ...result.petition } : item
          )));
          setPetitions((current) => current.map((item) => (
            item.id === petition.id ? { ...item, ...result.petition } : item
          )));
        })
        .catch((error) => console.warn('Petition sync failed:', error.message));
    } else if (SUPABASE_ENABLED && supabase) {
      supabase.from('petitions').insert(petitionToRow(petition)).then(({ error }) => {
        if (error) console.warn('Petition sync failed:', error.message);
      });
    }

    return petition;
  }, [addNotification, user.id]);

  const personalizedPetitions = useMemo(() => {
    if (!user.interests?.length) return petitions;
    const interested = petitions.filter((petition) => user.interests.includes(petition.category));
    const rest = petitions.filter((petition) => !user.interests.includes(petition.category));
    return [...interested, ...rest];
  }, [petitions, user.interests]);

  const advanceDeck = useCallback(() => setDeckIndex((index) => index + 1), []);
  const rewindDeck = useCallback(() => setDeckIndex((index) => Math.max(0, index - 1)), []);
  // "Reset feed" puts every petition back in the deck, as the design does.
  const resetDeck = useCallback(() => { setDeckIndex(0); setSignedIds([]); }, []);
  const getPetitionById = useCallback((id) => petitions.find((petition) => petition.id === id), [petitions]);

  const signPetition = useCallback((petitionId, details = {}) => {
    if (signedIds.includes(petitionId)) return false;

    const petition = petitions.find((item) => item.id === petitionId);
    const nextSigned = (petition?.signed || 0) + 1;

    setSignedIds((current) => [petitionId, ...current]);
    setPetitions((list) => list.map((item) => (
      item.id === petitionId ? { ...item, signed: item.signed + 1 } : item
    )));

    const nextDaily = dailyCount + 1;
    setDailyCount(nextDaily);

    const today = new Date().toISOString().slice(0, 10);
    setContributions((current) => ({ ...current, [today]: (current[today] || 0) + 1 }));

    const count = signedIds.length + 1;
    const levelBefore = LEVELS.find((l) => signedIds.length >= l.min && signedIds.length <= l.max) || LEVELS[0];
    const levelAfter = LEVELS.find((l) => count >= l.min && count <= l.max) || LEVELS[0];
    const streakDays = computeStreaks(contributions).current;

    // Exactly the design's three celebration cases, in its priority order:
    // first signature, then a level up, then completing the daily five.
    if (count === 1) {
      setCelebration({
        icon: 'celebration',
        kicker: 'BADGE UNLOCKED',
        title: 'First Sign',
        sub: 'You joined your first campaign. Seven more badges to go.',
        color: '#fbbf24',
        from: '#3a2a05',
        to: '#d6a527',
      });
    } else if (levelAfter.level > levelBefore.level) {
      setCelebration({
        icon: 'emoji_events',
        kicker: 'LEVEL UP',
        title: levelAfter.name,
        sub: `You reached level ${levelAfter.level}. Your voice carries further now.`,
        color: levelAfter.color,
        from: '#2a1e5f',
        to: '#7c5cff',
      });
    } else if (nextDaily === DAILY_GOAL) {
      setCelebration({
        icon: 'local_fire_department',
        kicker: 'DAILY GOAL',
        title: `${DAILY_GOAL} for ${DAILY_GOAL}`,
        sub: `Daily challenge complete. Streak extended to ${streakDays + 1} days.`,
        color: '#fbbf24',
        from: '#3a2410',
        to: '#c27a2e',
      });
    }

    if (levelAfter.level > levelBefore.level) {
      addNotification({
        type: 'level_up',
        title: `You reached ${levelAfter.name}`,
        body: `Level ${levelAfter.level} unlocked. Keep signing to reach the next tier.`,
        verified: false,
      });
    }

    if (petition && petition.goal > 0 && nextSigned >= petition.goal) {
      addNotification({
        type: 'goal_reached',
        title: `${petition.title} hit its goal`,
        body: `${petition.goal.toLocaleString()} signatures reached. The petition now heads to its recipient.`,
        petitionId,
        recipient: petition.recipient,
        situation: petition.why,
        ask: petition.ask,
        verified: petition.verified,
      });
    }

    apiRequest('/api/sign', {
      method: 'POST',
      body: JSON.stringify({
        firebaseUid: user.id,
        petitionId,
        comment: details.comment || '',
        signer: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          location: user.location,
          signature: user.signature,
        },
      }),
    }).catch((error) => console.warn('Signature sync failed:', error.message));

    return true;
  }, [addNotification, contributions, dailyCount, petitions, signedIds, user]);

  const toggleSave = useCallback((petitionId) => {
    setSavedIds((current) => {
      const saved = current.includes(petitionId);
      const next = saved ? current.filter((id) => id !== petitionId) : [petitionId, ...current];
      apiRequest('/api/save', {
        method: 'POST',
        body: JSON.stringify({ firebaseUid: user.id, petitionId, saved: !saved }),
      }).catch((error) => console.warn('Saved petition sync failed:', error.message));
      return next;
    });
  }, [user.id]);

  const reportPetition = useCallback(async (petitionId, { reason, details } = {}) => {
    if (!API_BASE_URL) throw new Error('Reports require the backend API to be running.');
    const petition = petitions.find((item) => item.id === petitionId);
    if (!petition) throw new Error('Petition not found');

    const result = await apiRequest('/api/report', {
      method: 'POST',
      body: JSON.stringify({
        petitionId,
        petition,
        reason,
        details,
        firebaseUid: user.id,
        reporter: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      }),
    });

    addNotification({
      type: 'petition_reported',
      title: 'Report submitted',
      body: `"${petition.title}" was sent for review.`,
      petitionId,
      verified: false,
    });

    return result;
  }, [addNotification, petitions, user]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const streak = useMemo(() => computeStreaks(contributions), [contributions]);

  // Each badge decides for itself from the same tally, matching the design's
  // BADGES table.
  const badgeCounts = useMemo(() => {
    const signedPetitions = signedIds
      .map((id) => petitions.find((petition) => petition.id === id))
      .filter(Boolean);
    return {
      signed: signedIds.length,
      created: createdPetitions.length,
      saved: savedIds.length,
      causes: new Set(signedPetitions.map((petition) => petition.category)).size,
      streak: streak.current,
    };
  }, [createdPetitions, petitions, savedIds, signedIds, streak]);

  const earnedBadges = useMemo(
    () => BADGES.filter((badge) => badge.test(badgeCounts)),
    [badgeCounts],
  );

  const value = useMemo(() => ({
    isAuthenticated,
    authLoading,
    accountHydrated,
    authError,
    setAuthError,
    firebaseEnabled: FIREBASE_ENABLED,
    supabaseEnabled: SUPABASE_ENABLED,
    apiEnabled: Boolean(API_BASE_URL),
    user,
    login,
    signup,
    logout,
    updateUser,
    petitions: personalizedPetitions,
    allPetitions: petitions,
    deckIndex,
    signedIds,
    savedIds,
    dailyCount,
    DAILY_GOAL,
    advanceDeck,
    rewindDeck,
    signPetition,
    toggleSave,
    reportPetition,
    resetDeck,
    getPetitionById,
    contributions,
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    createdPetitions,
    createPetition,
    earnedBadges,
    badgeCounts,
    streak,
    celebration,
    setCelebration,
    clearCelebration,
  }), [
    badgeCounts,
    streak,
    addNotification,
    advanceDeck,
    celebration,
    clearCelebration,
    accountHydrated,
    authError,
    authLoading,
    contributions,
    createPetition,
    createdPetitions,
    dailyCount,
    deckIndex,
    earnedBadges,
    getPetitionById,
    isAuthenticated,
    login,
    logout,
    markNotificationRead,
    notifications,
    personalizedPetitions,
    petitions,
    resetDeck,
    rewindDeck,
    reportPetition,
    savedIds,
    signPetition,
    signedIds,
    signup,
    toggleSave,
    unreadCount,
    updateUser,
    user,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

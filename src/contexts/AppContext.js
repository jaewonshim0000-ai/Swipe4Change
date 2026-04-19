import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SEED_PETITIONS, MOCK_USER, SEED_NOTIFICATIONS, BADGES } from '../data/petitions';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(MOCK_USER);

  const login = useCallback(() => setIsAuthenticated(true), []);
  const signup = useCallback((data) => {
    setUser((u) => ({ ...u, ...data }));
    setIsAuthenticated(true);
  }, []);
  const logout = useCallback(() => setIsAuthenticated(false), []);
  const updateUser = useCallback((data) => setUser((u) => ({ ...u, ...data })), []);

  const [petitions, setPetitions] = useState(SEED_PETITIONS);
  const [deckIndex, setDeckIndex] = useState(0);
  const [signedIds, setSignedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [dailyCount, setDailyCount] = useState(0);
  const DAILY_GOAL = 10;

  // Contribution calendar
  const [contributions, setContributions] = useState(() => {
    const m = {};
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      m[d.toISOString().slice(0, 10)] = 0;
    }
    return m;
  });

  // Notifications
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const addNotification = useCallback((n) => {
    setNotifications((prev) => [{ ...n, id: `n_${Date.now()}`, read: false, createdAt: new Date().toISOString() }, ...prev]);
  }, []);
  const markNotificationRead = useCallback((id) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }, []);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Created petitions
  const [createdPetitions, setCreatedPetitions] = useState([]);
  const createPetition = useCallback((data) => {
    const p = { ...data, id: `cp_${Date.now()}`, signed: 0, weeklyIncrease: 0, daysLeft: 30, status: 'pending' };
    setCreatedPetitions((c) => [p, ...c]);
    setPetitions((prev) => [p, ...prev]);
    addNotification({ type: 'petition_created', title: 'Petition submitted', body: `"${p.title}" is under review.`, petitionId: p.id, verified: false });
    return p;
  }, [addNotification]);

  // Personalized deck (filter by interests)
  const personalizedPetitions = useMemo(() => {
    if (!user.interests || user.interests.length === 0) return petitions;
    const interested = petitions.filter((p) => user.interests.includes(p.category));
    const rest = petitions.filter((p) => !user.interests.includes(p.category));
    return [...interested, ...rest];
  }, [petitions, user.interests]);

  const advanceDeck = useCallback(() => setDeckIndex((i) => i + 1), []);

  const signPetition = useCallback((petitionId) => {
    setSignedIds((s) => {
      if (s.includes(petitionId)) return s;
      const next = [petitionId, ...s];
      // Check badge thresholds
      const count = next.length;
      BADGES.filter((b) => b.type === 'signs' && b.threshold === count).forEach((b) => {
        addNotification({ type: 'badge_earned', title: `Badge earned: ${b.name}`, body: b.desc, verified: false });
      });
      // Level up
      const thresholds = { 6: 'Supporter', 21: 'Advocate', 51: 'Changemaker', 101: 'Catalyst' };
      if (thresholds[count]) {
        addNotification({ type: 'level_up', title: 'Level up!', body: `You've reached ${thresholds[count]} status!`, verified: false });
      }
      return next;
    });
    setPetitions((list) => list.map((p) => (p.id === petitionId ? { ...p, signed: p.signed + 1 } : p)));
    setDailyCount((d) => Math.min(DAILY_GOAL, d + 1));
    const today = new Date().toISOString().slice(0, 10);
    setContributions((c) => ({ ...c, [today]: (c[today] || 0) + 1 }));
  }, [addNotification]);

  const toggleSave = useCallback((pid) => {
    setSavedIds((s) => s.includes(pid) ? s.filter((x) => x !== pid) : [pid, ...s]);
  }, []);
  const resetDeck = useCallback(() => setDeckIndex(0), []);
  const getPetitionById = useCallback((id) => petitions.find((p) => p.id === id), [petitions]);

  // Earned badges
  const earnedBadges = useMemo(() => {
    const signCount = signedIds.length;
    const createCount = createdPetitions.length;
    const savedCount = savedIds.length;
    const signedPetitions = signedIds.map((id) => petitions.find((p) => p.id === id)).filter(Boolean);
    const catCount = new Set(signedPetitions.map((p) => p.category)).size;
    const climateSigns = signedPetitions.filter((p) => p.category === 'Climate').length;

    return BADGES.filter((b) => {
      switch (b.type) {
        case 'signs': return signCount >= b.threshold;
        case 'created': return createCount >= b.threshold;
        case 'saved': return savedCount >= b.threshold;
        case 'categories': return catCount >= b.threshold;
        case 'cat_Climate': return climateSigns >= b.threshold;
        default: return false;
      }
    });
  }, [signedIds, createdPetitions, savedIds, petitions]);

  return (
    <AppContext.Provider value={{
      isAuthenticated, user, login, signup, logout, updateUser,
      petitions: personalizedPetitions, allPetitions: petitions,
      deckIndex, signedIds, savedIds, dailyCount, DAILY_GOAL,
      advanceDeck, signPetition, toggleSave, resetDeck, getPetitionById,
      contributions, notifications, unreadCount, addNotification, markNotificationRead,
      createdPetitions, createPetition, earnedBadges,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};

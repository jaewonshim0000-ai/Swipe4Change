import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS } from '../theme';
import { hPress } from '../utils/haptics';
import { useApp } from '../contexts/AppContext';

import CelebrationOverlay from '../components/CelebrationOverlay';
import Press from '../components/Press';
import Icon from '../components/Icon';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SwipeFeedScreen from '../screens/SwipeFeedScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ActivityGamificationScreen from '../screens/ActivityGamificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PetitionDetailScreen from '../screens/PetitionDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CreatePetitionScreen from '../screens/CreatePetitionScreen';
import SavedPetitionsScreen from '../screens/SavedPetitionsScreen';
import SecurityScreen from '../screens/SecurityScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.surface,
    card: COLORS.surface,
    text: COLORS.onSurface,
    border: 'rgba(255,255,255,.07)',
    primary: COLORS.primary,
  },
};

// A tab icon: 46x28 pill that tints when the tab is active. The caption is
// supplied separately as `tabBarLabel` — the navigator renders the icon twice
// (active and inactive) to cross-fade between them, so putting the caption in
// here would draw it twice too.
function TabIcon({ icon, focused, badge }) {
  const color = focused ? COLORS.primary : 'rgba(255,255,255,.42)';
  return (
    <View style={[t.pill, focused && t.pillActive]}>
      <Icon name={icon} size={24} fill={focused ? 1 : 0} weight={focused ? 500 : 400} color={color} />
      {badge > 0 ? (
        <View style={t.badge}>
          <Text style={t.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const tabLabel = (label) => ({ focused }) => (
  <Text style={[t.label, { color: focused ? COLORS.primary : 'rgba(255,255,255,.36)' }]}>
    {label.toUpperCase()}
  </Text>
);

function Placeholder() { return null; }

function TabNavigator({ navigation }) {
  const { savedIds, signedIds } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // The design's bar is a translucent layer the feed runs under, with a
        // gradient that deepens toward the bottom edge.
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {Platform.OS !== 'web' ? (
              <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />
            ) : null}
            <LinearGradient
              colors={['rgba(10,14,25,.4)', 'rgba(10,14,25,.94)']}
              locations={[0, 0.4]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: Platform.OS === 'ios' ? 84 : 76,
          paddingTop: 8,
          paddingHorizontal: 12,
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,.07)',
          elevation: 0,
        },
        tabBarItemStyle: { height: 52, paddingTop: 0 },
        tabBarIconStyle: { flex: 0 },
        tabBarLabelStyle: { marginTop: 3 },
      }}
    >
      <Tab.Screen
        name="FeedTab"
        component={SwipeFeedScreen}
        options={{
          tabBarLabel: tabLabel('Feed'),
          tabBarIcon: ({ focused }) => <TabIcon icon="auto_awesome_motion" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{
          tabBarLabel: tabLabel('Discover'),
          tabBarIcon: ({ focused }) => <TabIcon icon="travel_explore" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={Placeholder}
        options={{
          tabBarButton: () => (
            <Press
              fill
              style={f.slot}
              scale={0.9}
              haptic={hPress}
              onPress={() => navigation.navigate('CreatePetition')}
            >
              <LinearGradient
                colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={f.fab}
              >
                <Icon name="add" size={24} weight={700} color={COLORS.onTertiary} />
              </LinearGradient>
            </Press>
          ),
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedPetitionsScreen}
        options={{
          tabBarLabel: tabLabel('Saved'),
          tabBarIcon: ({ focused }) => <TabIcon icon="bookmark" focused={focused} badge={savedIds.length} />,
        }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityGamificationScreen}
        options={{
          tabBarLabel: tabLabel('Activity'),
          tabBarIcon: ({ focused }) => <TabIcon icon="insights" focused={focused} badge={signedIds.length} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, user } = useApp();
  const needsOnboarding = isAuthenticated && user.onboarded === false;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            {/* Every overlay in the design rises from the bottom. */}
            <Stack.Screen name="PetitionDetail" component={PetitionDetailScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="CreatePetition" component={CreatePetitionScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Security" component={SecurityScreen} options={{ animation: 'slide_from_bottom' }} />
          </>
        )}
      </Stack.Navigator>
      {isAuthenticated ? <CelebrationOverlay /> : null}
    </NavigationContainer>
  );
}

const t = StyleSheet.create({
  pill: {
    position: 'relative',
    width: 46, height: 28, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: 'rgba(177,197,255,.14)' },
  badge: {
    position: 'absolute', top: -1, right: 2,
    minWidth: 14, height: 14, paddingHorizontal: 3, borderRadius: 7,
    backgroundColor: COLORS.primaryContainer,
    borderWidth: 2, borderColor: '#0d111c',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontFamily: FONTS.monoBold, fontSize: 9, color: '#fff' },
  label: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 0.9 },
});

const f = StyleSheet.create({
  slot: { alignItems: 'center', justifyContent: 'flex-start' },
  fab: {
    marginTop: -16,
    width: 50, height: 50, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65, shadowRadius: 12, elevation: 12,
  },
});

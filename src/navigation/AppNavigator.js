import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';

import AuthScreen from '../screens/AuthScreen';
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
  ...DefaultTheme, dark: true,
  colors: { ...DefaultTheme.colors, background: COLORS.surface, card: COLORS.surface, text: COLORS.onSurface, border: 'rgba(255,255,255,0.05)', primary: COLORS.primary },
};

function TabIcon({ name, focused, badge }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name={name} size={22} color={focused ? COLORS.primary : 'rgba(255,255,255,0.4)'} />
      {!focused && badge > 0 && (
        <View style={bS.badge}><Text style={bS.text}>{badge > 9 ? '9+' : badge}</Text></View>
      )}
    </View>
  );
}
const bS = StyleSheet.create({
  badge: { position: 'absolute', top: -2, right: -8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  text: { color: '#690005', fontSize: 9, fontWeight: '900' },
});

function Placeholder() { return null; }

function TabNavigator({ navigation }) {
  const { savedIds, signedIds } = useApp();
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'rgba(15,19,30,0.92)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
        height: Platform.OS === 'ios' ? 88 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 10, paddingTop: 8,
        ...(Platform.OS === 'ios' && { position: 'absolute', bottom: 0, left: 0, right: 0 }),
      },
      tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    }}>
      <Tab.Screen name="FeedTab" component={SwipeFeedScreen} options={{ tabBarLabel: 'Feed', tabBarIcon: ({ focused }) => <TabIcon name="dynamic-feed" focused={focused} /> }} />
      <Tab.Screen name="DiscoverTab" component={DiscoverScreen} options={{ tabBarLabel: 'Discover', tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} /> }} />
      <Tab.Screen name="CreateTab" component={Placeholder}
        options={{ tabBarLabel: '', tabBarIcon: () => (
          <View style={fS.fab}><LinearGradient colors={[COLORS.tertiary, COLORS.tertiaryContainer]} style={fS.fabG}><MaterialIcons name="add" size={26} color={COLORS.onTertiary} /></LinearGradient></View>
        )}}
        listeners={{ tabPress: (e) => { e.preventDefault(); navigation.navigate('CreatePetition'); } }}
      />
      <Tab.Screen name="SavedTab" component={SavedPetitionsScreen} options={{ tabBarLabel: 'Saved', tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'bookmark' : 'bookmark-border'} focused={focused} badge={savedIds.length} /> }} />
<<<<<<< HEAD
      <Tab.Screen name="ActivityTab" component={ActivityGamificationScreen} options={{ tabBarLabel: 'Activity', tabBarIcon: ({ focused }) => <TabIcon name="insights" focused={focused} badge={signedIds.length} /> }} />
=======
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="account-circle" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
const fS = StyleSheet.create({
  fab: { marginTop: -20, shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  fabG: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

export default function AppNavigator() {
  const { isAuthenticated } = useApp();
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="PetitionDetail" component={PetitionDetailScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal', animation: 'slide_from_right' }} />
            <Stack.Screen name="CreatePetition" component={CreatePetitionScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Security" component={SecurityScreen} options={{ presentation: 'modal', animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

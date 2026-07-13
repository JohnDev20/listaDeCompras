import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingCart, Settings } from 'lucide-react-native';
import { colors } from '@/constants/theme';

import HomeScreen from './home';
import FavoritesScreen from './favorites';
import SettingsScreen from './settings';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.light.primary,
        tabBarInactiveTintColor: colors.light.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.light.border,
          backgroundColor: colors.light.surface,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Minhas Listas',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

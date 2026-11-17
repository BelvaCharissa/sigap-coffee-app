import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import FaskesDirectoryScreen from '../screens/FaskesDirectoryScreen';
import SafeRouteScreen from '../screens/SafeRouteScreen';
import KartuSiagaScreen from '../screens/KartuSiagaScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Beranda') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Faskes') {
              iconName = focused ? 'medical' : 'medical-outline';
            } else if (route.name === 'Rute') {
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            } else if (route.name === 'Edukasi') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <Ionicons name={iconName} size={22} color={color} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen
          name="Beranda"
          component={HomeScreen}
          options={{ tabBarLabel: 'Beranda' }}
        />
        <Tab.Screen
          name="Faskes"
          component={FaskesDirectoryScreen}
          options={{ tabBarLabel: 'Faskes & Obat' }}
        />
        <Tab.Screen
          name="Rute"
          component={SafeRouteScreen}
          options={{ tabBarLabel: 'Rute Aman' }}
        />
        <Tab.Screen
          name="Edukasi"
          component={KartuSiagaScreen}
          options={{ tabBarLabel: 'Kartu Siaga' }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profil' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    height: Platform.OS === 'ios' ? 88 : 66,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconContainer: {
    padding: 3,
    borderRadius: 12,
  },
  iconContainerActive: {
    backgroundColor: colors.primaryPastel,
  },
});

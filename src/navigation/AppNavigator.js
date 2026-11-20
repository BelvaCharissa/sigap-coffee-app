import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Screens
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FaskesDirectoryScreen from '../screens/FaskesDirectoryScreen';
import SafeRouteScreen from '../screens/SafeRouteScreen';
import KartuSiagaScreen from '../screens/KartuSiagaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FaskesDetailScreen from '../screens/FaskesDetailScreen';
import KartuDetailScreen from '../screens/KartuDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Center Action Button (Mirrors the circular action button from mockup)
function CenterSiagaButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.centerBtnWrapper}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.centerBtnInner}>
        <Ionicons name="shield-half" size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

// Bottom Tab Navigator (Dark Green Floating Dock Style matching the reference)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.45)',
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Beranda') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Faskes') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Rute') {
            iconName = focused ? 'navigate' : 'navigate-outline';
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
        options={{ tabBarLabel: 'Faskes' }}
      />
      <Tab.Screen
        name="Edukasi"
        component={KartuSiagaScreen}
        options={{
          tabBarLabel: 'Siaga',
          tabBarButton: (props) => <CenterSiagaButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Rute"
        component={SafeRouteScreen}
        options={{ tabBarLabel: 'Rute' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator (Landing -> Login -> MainTabs)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="FaskesDetail" component={FaskesDetailScreen} />
        <Stack.Screen name="KartuDetail" component={KartuDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 20,
    right: 20,
    backgroundColor: '#1B2E24',
    borderRadius: 32,
    height: 60,
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    paddingHorizontal: 12,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 14,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  centerBtnWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtnInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#52B788',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#1B2E24',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FaskesDirectoryScreen from '../screens/FaskesDirectoryScreen';
import SafeRouteScreen from '../screens/SafeRouteScreen';
import KartuSiagaScreen from '../screens/KartuSiagaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FaskesDetailScreen from '../screens/FaskesDetailScreen';
import KartuDetailScreen from '../screens/KartuDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Center Action Button (Mirrors the circular action button from mockup)
function CenterSiagaButton({ children, onPress }) {
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

// Bottom Tab Navigator (Sleek Floating Dock Style matching the reference)
function MainTabNavigator() {
  return (
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
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Rute') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={iconName} size={20} color={color} />
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
        options={{ tabBarLabel: 'Rute Aman' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator (Kombinasi Stack + Tab)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="FaskesDetail" component={FaskesDetailScreen} />
        <Stack.Screen name="KartuDetail" component={KartuDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    elevation: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: -2,
  },
  iconContainer: {
    padding: 3,
    borderRadius: 10,
  },
  iconContainerActive: {
    backgroundColor: colors.primaryPastel,
  },
  centerBtnWrapper: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtnInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

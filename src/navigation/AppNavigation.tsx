/**
 * Navigation Container
 * Main navigation setup with authentication flow and multi-tenant support
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ObjectListScreen from '../screens/ObjectListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InstanceSelectionScreen from '../screens/InstanceSelectionScreen';
import AddEditInstanceScreen from '../screens/AddEditInstanceScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Class Definitions' }}
      />
      <Stack.Screen
        name="ObjectList"
        component={ObjectListScreen as any}
        options={({ route }: any) => ({
          title: route.params?.classDefinition?.name || 'Objects',
        })}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ headerShown: false, title: 'Home' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  const { isAuthenticated, loadAuthData } = useAuthStore();
  const { instances, activeInstance, loadInstances } = useInstanceStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load authentication and instance data on app start
    const initApp = async () => {
      await Promise.all([loadAuthData(), loadInstances()]);
      setIsLoading(false);
    };
    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no instances configured, show instance selection first
  const hasInstances = instances.length > 0;
  const showInstanceSelection = !hasInstances && !isAuthenticated;

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabs />
      ) : (
        <Stack.Navigator>
          {showInstanceSelection ? (
            <>
              <Stack.Screen
                name="InstanceSelection"
                component={InstanceSelectionScreen}
                options={{ title: 'Select Pimcore Instance' }}
              />
              <Stack.Screen
                name="AddInstance"
                component={AddEditInstanceScreen}
                options={{ title: 'Add Instance' }}
              />
              <Stack.Screen
                name="EditInstance"
                component={AddEditInstanceScreen}
                options={{ title: 'Edit Instance' }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InstanceSelection"
                component={InstanceSelectionScreen}
                options={{ title: 'Select Pimcore Instance' }}
              />
              <Stack.Screen
                name="AddInstance"
                component={AddEditInstanceScreen}
                options={{ title: 'Add Instance' }}
              />
              <Stack.Screen
                name="EditInstance"
                component={AddEditInstanceScreen}
                options={{ title: 'Edit Instance' }}
              />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

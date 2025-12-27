/**
 * Navigation Container
 * Main navigation setup with authentication flow and multi-tenant support
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ObjectListScreen from '../screens/ObjectListScreen';
import ObjectDetailScreen from '../screens/ObjectDetailScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InstanceSelectionScreen from '../screens/InstanceSelectionScreen';
import AddEditInstanceScreen from '../screens/AddEditInstanceScreen';
import AssetsScreen from '../screens/AssetsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Data Objects Stack Navigator
function DataObjectsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Objekt-Baum' }}
      />
      <Stack.Screen
        name="FolderDetail"
        component={FolderDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ObjectList"
        component={ObjectListScreen as any}
        options={({ route }: any) => ({
          title: route.params?.classDefinition?.name || 'Objects',
        })}
      />
      <Stack.Screen
        name="ObjectDetail"
        component={ObjectDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.object?.key || 'Object Detail',
        })}
      />
    </Stack.Navigator>
  );
}

// Assets Stack Navigator (placeholder)
function AssetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AssetsHome"
        component={AssetsScreen}
        options={{ title: 'Assets' }}
      />
    </Stack.Navigator>
  );
}

// Documents Stack Navigator (placeholder)
function DocumentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DocumentsHome"
        component={DocumentsScreen}
        options={{ title: 'Documents' }}
      />
    </Stack.Navigator>
  );
}

// Main Tabs with Data Objects, Assets, and Documents
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'cube';

          if (route.name === 'DataObjects') {
            iconName = 'database';
          } else if (route.name === 'Assets') {
            iconName = 'image-multiple';
          } else if (route.name === 'Documents') {
            iconName = 'file-document-multiple';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DataObjects"
        component={DataObjectsStack}
        options={{ title: 'Data-Objects' }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsStack}
        options={{ title: 'Assets' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStack}
        options={{ title: 'Documents' }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator with burger menu and main tabs
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.userButton}
          >
            <MaterialCommunityIcons name="account-circle" size={32} color="#6200ee" />
          </TouchableOpacity>
        ),
        drawerActiveTintColor: '#6200ee',
        drawerInactiveTintColor: 'gray',
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          title: 'Pimcore Voyager',
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
      {/* Placeholder menu items */}
      <Drawer.Screen
        name="PlaceholderSearch"
        component={PlaceholderScreen}
        options={{
          title: 'Search',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="PlaceholderNotifications"
        component={PlaceholderScreen}
        options={{
          title: 'Notifications',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
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
        <DrawerNavigator />
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
  userButton: {
    marginRight: 16,
    padding: 4,
  },
});

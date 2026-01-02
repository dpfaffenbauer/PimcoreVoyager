/**
 * Navigation Container
 * Main navigation setup with authentication flow and multi-tenant support
 */

import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigation, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';
import { THEME } from '../config/constants';
import { CustomDrawer } from '../components/CustomDrawer';
import { FloatingActionMenu } from '../components/FloatingActionMenu';

import LoginScreen from '../screens/LoginScreen';
import DataObjectsScreen from '../screens/DataObjectsScreen';
import ObjectListScreen from '../screens/ObjectListScreen';
import ObjectDetailScreen from '../screens/ObjectDetailScreen';
import FolderDetailScreen from '../screens/FolderDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InstanceSelectionScreen from '../screens/InstanceSelectionScreen';
import AddEditInstanceScreen from '../screens/AddEditInstanceScreen';
import AssetsScreen from '../screens/AssetsScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import DocumentDetailScreen from '../screens/DocumentDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import NotesScreen from '../screens/NotesScreen';
import DependenciesScreen from '../screens/DependenciesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Drawer state context
const DrawerContext = React.createContext<{
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}>({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => React.useContext(DrawerContext);

// Burger menu button component
function BurgerMenuButton() {
  const { openDrawer } = useDrawer();
  return (
    <TouchableOpacity onPress={openDrawer} style={styles.burgerButton}>
      <MaterialCommunityIcons name="menu" size={26} color="#333" />
    </TouchableOpacity>
  );
}

// Data Objects Stack Navigator
function DataObjectsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={DataObjectsScreen}
        options={{
          title: 'Datenobjekte',
          headerLeft: () => <BurgerMenuButton />,
        }}
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
      <Stack.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: 'Properties' }}
      />
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: 'Notes' }}
      />
      <Stack.Screen
        name="Dependencies"
        component={DependenciesScreen}
        options={{ title: 'Dependencies' }}
      />
    </Stack.Navigator>
  );
}

// Assets Stack Navigator
function AssetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AssetsHome"
        component={AssetsScreen}
        options={{
          title: 'Assets',
          headerLeft: () => <BurgerMenuButton />,
        }}
      />
      <Stack.Screen
        name="AssetDetail"
        component={AssetDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.asset?.filename || 'Asset',
        })}
      />
      <Stack.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: 'Properties' }}
      />
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: 'Notes' }}
      />
      <Stack.Screen
        name="Dependencies"
        component={DependenciesScreen}
        options={{ title: 'Dependencies' }}
      />
    </Stack.Navigator>
  );
}

// Documents Stack Navigator
function DocumentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DocumentsHome"
        component={DocumentsScreen}
        options={{
          title: 'Documents',
          headerLeft: () => <BurgerMenuButton />,
        }}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.document?.key || 'Dokument',
        })}
      />
      <Stack.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: 'Properties' }}
      />
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: 'Notes' }}
      />
      <Stack.Screen
        name="Dependencies"
        component={DependenciesScreen}
        options={{ title: 'Dependencies' }}
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
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle-outline';

          switch (route.name) {
            case 'DataObjects':
              iconName = 'database';
              break;
            case 'Assets':
              iconName = 'image-multiple';
              break;
            case 'Documents':
              iconName = 'file-document-multiple';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME.ACTIVE_TINT_COLOR,
        tabBarInactiveTintColor: THEME.INACTIVE_TINT_COLOR,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DataObjects"
        component={DataObjectsStack}
        options={{ title: 'Objekte' }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsStack}
        options={{ title: 'Assets' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStack}
        options={{ title: 'Dokumente' }}
      />
    </Tab.Navigator>
  );
}

// Settings Stack Navigator (accessible via FAB)
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Einstellungen' }}
      />
      <Stack.Screen
        name="InstanceSelection"
        component={InstanceSelectionScreen}
        options={{ title: 'Instanzen verwalten' }}
      />
      <Stack.Screen
        name="AddInstance"
        component={AddEditInstanceScreen}
        options={{ title: 'Instanz hinzufügen' }}
      />
      <Stack.Screen
        name="EditInstance"
        component={AddEditInstanceScreen}
        options={{ title: 'Instanz bearbeiten' }}
      />
    </Stack.Navigator>
  );
}

// Navigation ref for external access
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

// FAB with navigation access (must be inside NavigationContainer)
function FABWithNavigation() {
  const navigation = useNavigation<any>();

  const fabItems = [
    {
      key: 'settings',
      icon: 'cog' as const,
      color: '#666',
      backgroundColor: '#fff',
      onPress: () => {
        console.log('Settings pressed, navigating...');
        navigation.navigate('Settings');
      },
    },
    {
      key: 'add',
      icon: 'plus-box' as const,
      color: '#666',
      backgroundColor: '#fff',
      onPress: () => console.log('Add new'),
    },
    {
      key: 'search',
      icon: 'magnify' as const,
      color: '#666',
      backgroundColor: '#fff',
      onPress: () => {
        console.log('Search pressed, navigating...');
        navigation.navigate('Search');
      },
    },
  ];

  return (
    <FloatingActionMenu
      items={fabItems}
      mainIcon="account-circle"
      mainBackgroundColor={THEME.PRIMARY_COLOR}
    />
  );
}

// Main Tabs wrapper with FAB overlay
function MainTabsWithFAB() {
  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
      <FABWithNavigation />
    </View>
  );
}

// Root stack for modal screens
const RootStackNav = createStackNavigator();

function RootNavigatorWithFAB() {
  return (
    <RootStackNav.Navigator>
      <RootStackNav.Screen
        name="MainTabs"
        component={MainTabsWithFAB}
        options={{ headerShown: false }}
      />
      <RootStackNav.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <RootStackNav.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Suche',
          presentation: 'modal',
        }}
      />
    </RootStackNav.Navigator>
  );
}

// Main App with Drawer
function MainAppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuthStore();

  // Use navigationRef for drawer navigation (since drawer is outside navigator)
  const navigateTo = (screen: string) => {
    if (navigationRef.current) {
      navigationRef.current.navigate(screen as never);
    }
  };

  const drawerItems = [
    {
      key: 'home',
      label: 'Home',
      icon: 'home' as const,
      onPress: () => navigateTo('MainTabs'),
    },
    {
      key: 'search',
      label: 'Suche',
      icon: 'magnify' as const,
      onPress: () => navigateTo('Search'),
    },
    {
      key: 'settings',
      label: 'Einstellungen',
      icon: 'cog' as const,
      onPress: () => navigateTo('Settings'),
    },
    {
      key: 'logout',
      label: 'Abmelden',
      icon: 'logout' as const,
      onPress: () => logout(),
    },
  ];

  return (
    <DrawerContext.Provider
      value={{
        isOpen: drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
      }}
    >
      <View style={{ flex: 1 }}>
        <RootNavigatorWithFAB />
        <CustomDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={drawerItems}
        />
      </View>
    </DrawerContext.Provider>
  );
}

export default function AppNavigation() {
  const { isAuthenticated, loadAuthData } = useAuthStore();
  const { instances, loadInstances } = useInstanceStore();
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
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? (
        <MainAppContent />
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
  burgerButton: {
    marginLeft: 16,
    padding: 4,
  },
});

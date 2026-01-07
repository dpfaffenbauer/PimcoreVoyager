import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as AntProvider } from '@ant-design/react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import AppNavigation from './src/navigation/AppNavigation';
import { antTheme } from './src/config/antTheme';

export default function App() {
  // Load Ant Design icon fonts
  const [fontsLoaded] = useFonts({
    antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    antfill: require('@ant-design/icons-react-native/fonts/antfill.ttf'),
  });

  // Show loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AntProvider theme={antTheme}>
        <StatusBar style="auto" />
        <AppNavigation />
      </AntProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

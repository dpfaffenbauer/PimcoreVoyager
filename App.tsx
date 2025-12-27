/**
 * Main App Component
 * Pimcore Voyager - Mobile Companion App for Pimcore
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigation from './src/navigation/AppNavigation';

export default function App() {
  return (
    <PaperProvider>
      <AppNavigation />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

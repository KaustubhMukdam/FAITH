import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './packages/mobile/src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

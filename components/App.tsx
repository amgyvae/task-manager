import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { Slot } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <PaperProvider>
      <Slot />
      <Toast />
    </PaperProvider>
    
  );
}

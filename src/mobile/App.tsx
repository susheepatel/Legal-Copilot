import React from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import { MobileAuthProvider, useMobileAuth } from './context/MobileAuthContext';
import { MobileDataProvider } from './context/MobileDataContext';
import { AuthScreen } from './screens/AuthScreen';
import { BottomTabNavigator } from './navigation/RootNavigator';
import { theme } from './theme';

const MainNavigator: React.FC = () => {
  const { user, isLoading } = useMobileAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <MobileDataProvider>
      <BottomTabNavigator />
    </MobileDataProvider>
  );
};

export default function App() {
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.colors.bg,
      card: theme.colors.bgCard,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={customDarkTheme}>
        <MobileAuthProvider>
          <StatusBar barStyle="light-content" />
          <MainNavigator />
        </MobileAuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


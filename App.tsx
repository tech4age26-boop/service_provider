import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageScreen } from './screens/LanguageScreen';
import {
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { AuthScreen } from './screens/auth/AuthScreen';
import { TechnicianDashboard } from './tabBar/TechnicianDashboard';
import { ProviderDashboard } from './tabBar/ProviderDashboard';
import { CashierDashboard } from './tabBar/CashierDashboard';

import { ThemeContext, lightTheme, darkTheme, useTheme } from './theme/ThemeContext';
export { useTheme };

function App(): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'individual' | 'workshop' | string | null>(null);
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const selected = await AsyncStorage.getItem('has-selected-language');
      setIsLanguageSelected(selected === 'true');
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.type);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsLanguageSelected(false);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (loading || isLanguageSelected === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#F4C430" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        {!isLanguageSelected ? (
          <LanguageScreen onSelect={() => setIsLanguageSelected(true)} />
        ) : isAuthenticated ? (
          userRole === 'workshop' ? (
            <ProviderDashboard onLogout={() => {
              setIsAuthenticated(false);
              setUserRole(null);
            }} />
          ) : userRole === 'cashier' ? (
            <CashierDashboard onLogout={() => {
              setIsAuthenticated(false);
              setUserRole(null);
            }} />
          ) : (
            <TechnicianDashboard onLogout={() => {
              setIsAuthenticated(false);
              setUserRole(null);
            }} />
          )
        ) : (
          <AuthScreen onLogin={initializeApp} />
        )}
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}

export default App;

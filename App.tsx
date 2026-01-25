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
import { CashierPOSScreen } from './screens/Cashier/CashierPOSScreen';

import { ThemeContext, lightTheme, darkTheme, useTheme } from './theme/ThemeContext';
import { RBACProvider, useRBAC } from './context/RBACContext';
export { useTheme };

function MainContent({ initializeApp, isAuthenticated, userRole, onLogout }: any) {
  const { initialize } = useRBAC();

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        initialize(JSON.parse(userData));
      }
    };
    if (isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated]);

  return (
    <>
      {!isAuthenticated ? (
        <AuthScreen onLogin={initializeApp} />
      ) : userRole === 'workshop' ? (
        <ProviderDashboard onLogout={onLogout} />
      ) : userRole === 'cashier' ? ( // Fallback to cashier POS
        <CashierPOSScreen onLogout={onLogout} />
      ) : (
        <TechnicianDashboard onLogout={onLogout} />
      )}
    </>
  );
}

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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading || isLanguageSelected === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#F4C430" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      <RBACProvider>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={theme.background}
          />
          {!isLanguageSelected ? (
            <LanguageScreen onSelect={() => setIsLanguageSelected(true)} />
          ) : (
            <MainContent
              initializeApp={initializeApp}
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              onLogout={handleLogout}
            />
          )}
        </SafeAreaProvider>
      </RBACProvider>
    </ThemeContext.Provider>
  );
}

export default App;

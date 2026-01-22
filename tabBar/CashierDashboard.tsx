import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

import { CashierNavigation } from '../navigation/cashier/CashierNavigation';
import { CashierSettingsScreen } from '../screens/cashier/CashierSettingsScreen';

const Tab = createBottomTabNavigator();

interface CashierDashboardProps {
    onLogout?: () => void;
}

function Tabs({ onLogout }: CashierDashboardProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.tint,
                tabBarInactiveTintColor: theme.subText,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.tabBarBackground,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={CashierNavigation}
                options={{
                    tabBarLabel: 'POS',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-grid" size={size} color={color} />
                    ),
                }}
            />



            <Tab.Screen
                name="Settings"
                options={{
                    tabBarLabel: t('settings.settings_title') || 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog" size={size} color={color} />
                    ),
                }}
            >
                {(props) => <CashierSettingsScreen {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

export function CashierDashboard({ onLogout }: CashierDashboardProps) {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.container}>
                <NavigationContainer>
                    <Tabs onLogout={onLogout} />
                </NavigationContainer>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

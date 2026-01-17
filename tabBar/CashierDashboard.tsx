import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { TechnicianNavigation } from '../navigation/technician/technician-navigation';
import { TechnicianOrderNavigation } from '../navigation/technician/technician-order.navigation';
import { TechnicianSettingsStack } from '../navigation/technician/TechnicianSettingsStack';
import { useTheme } from '../App'

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
                component={TechnicianNavigation}
                options={{
                    tabBarLabel: t('common.dashboard'),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Orders"
                component={TechnicianOrderNavigation}
                options={{
                    tabBarLabel: t('orders.title'),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="clipboard-list"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Transactions"
                component={TechnicianNavigation}
                options={{
                    tabBarLabel: t('wallet.transactions'),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="cash-multiple"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Settings"
                options={{
                    tabBarLabel: t('settings.settings_title'),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-cog"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            >
                {(props) => <TechnicianSettingsStack {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

export function CashierDashboard({ onLogout }: CashierDashboardProps) {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer>
                    <Tabs onLogout={onLogout} />
                </NavigationContainer>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

/**
 * Provider Dashboard with Bottom Tab Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { ProviderHomeScreen } from '../screens/Provider/ProviderHomeScreen';
import { ProviderOrdersScreen } from '../screens/Provider/ProviderOrdersScreen';
import { ProductsServicesScreen } from '../screens/Provider/ProductsServicesScreen';
import { ProviderSettingsStackNavigator } from '../navigation/ProviderSettingsStackNavigator';

import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

interface ProviderDashboardProps {
    onLogout?: () => void;
}

export function ProviderDashboard({ onLogout }: ProviderDashboardProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: theme.tint,
                    tabBarInactiveTintColor: theme.subText,
                    tabBarStyle: {
                        backgroundColor: theme.tabBarBackground,
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 8,
                        elevation: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        borderTopWidth: 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                    },
                    headerShown: false,
                }}>
                <Tab.Screen
                    name="Home"
                    options={{
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="home" size={size} color={color} />
                        ),
                    }}
                >
                    {(props) => <ProviderHomeScreen {...props} onLogout={onLogout} />}
                </Tab.Screen>
                <Tab.Screen
                    name="Orders"
                    component={ProviderOrdersScreen}
                    options={{
                        tabBarLabel: t('orders.title'),
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="SettingsTab"
                    options={{
                        tabBarLabel: t('settings.settings_title'),
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="cog" size={size} color={color} />
                        ),
                    }}
                    listeners={({ navigation }) => ({
                        tabPress: (e) => {
                            e.preventDefault();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SettingsHome' }],
                            });
                            navigation.navigate('SettingsTab');
                        },
                    })}
                >
                    {(props) => <ProviderSettingsStackNavigator {...props} onLogout={onLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
}

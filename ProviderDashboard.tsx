/**
 * Provider Dashboard with Bottom Tab Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProviderHomeScreen } from './screens/ProviderHomeScreen';
import { ProviderEmployeesScreen } from './screens/ProviderEmployeesScreen';
import { ProviderOrdersScreen } from './screens/ProviderOrdersScreen';
import { ProductsServicesScreen } from './screens/ProductsServicesScreen';
import { ProviderSettingsScreen } from './screens/ProviderSettingsScreen';

import { useTheme } from './App';

const Tab = createBottomTabNavigator();

export function ProviderDashboard() {
    const { theme } = useTheme();

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
                        borderTopWidth: 0, // Remove default border
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                    },
                    headerShown: false,
                }}>
                <Tab.Screen
                    name="Home"
                    component={ProviderHomeScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Products"
                    component={ProductsServicesScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="package-variant" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Employees"
                    component={ProviderEmployeesScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="account-group" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Orders"
                    component={ProviderOrdersScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Settings"
                    component={ProviderSettingsScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="cog" size={size} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

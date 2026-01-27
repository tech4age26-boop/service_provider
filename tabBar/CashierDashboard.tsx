import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CashierNavigation } from '../navigation/CashierNavigation';

interface CashierDashboardProps {
    onLogout: () => void;
}

export function CashierDashboard({ onLogout }: CashierDashboardProps) {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer>
                    <CashierNavigation onLogout={onLogout} />
                </NavigationContainer>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

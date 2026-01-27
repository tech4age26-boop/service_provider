import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CashierPOSScreen } from '../screens/Cashier/CashierPOSScreen';
import { PendingOrdersScreen } from '../screens/Cashier/PendingOrdersScreen';
import { CompletedOrdersScreen } from '../screens/Cashier/CompletedOrdersScreen';
import { ProcessingOrdersScreen } from '../screens/Cashier/ProcessingOrdersScreen';

export type CashierStackParamList = {
    CashierPOS: undefined;
    PendingOrders: undefined;
    ProcessingOrders: undefined;
    CompletedOrders: undefined;
};

const Stack = createNativeStackNavigator<CashierStackParamList>();

interface CashierNavigationProps {
    onLogout: () => void;
}

export function CashierNavigation({ onLogout }: CashierNavigationProps) {
    return (
        <Stack.Navigator
            initialRouteName="CashierPOS"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CashierPOS">
                {(props) => <CashierPOSScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="PendingOrders" component={PendingOrdersScreen} />
            <Stack.Screen name="ProcessingOrders" component={ProcessingOrdersScreen} />
            <Stack.Screen name="CompletedOrders" component={CompletedOrdersScreen} />
        </Stack.Navigator>
    );
}

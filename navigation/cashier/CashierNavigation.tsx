import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CashierHomeScreen } from '../../screens/cashier/CashierHomeScreen';

import { SelectProductScreen } from '../../screens/cashier/walkin/SelectProductScreen';
import { SelectServicesScreen } from '../../screens/cashier/walkin/SelectServicesScreen';
import { CustomerDetailsScreen } from '../../screens/cashier/walkin/CustomerDetailsScreen';
import { CheckoutScreen } from '../../screens/cashier/walkin/CheckoutScreen';

import { CashierNotificationsScreen } from '../../screens/cashier/CashierNotificationsScreen';

const Stack = createStackNavigator();

export function CashierNavigation() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CashierHome" component={CashierHomeScreen} />
            <Stack.Screen name="Notifications" component={CashierNotificationsScreen} />
            <Stack.Screen name="SelectProduct" component={SelectProductScreen} />
            <Stack.Screen name="SelectServices" component={SelectServicesScreen} />
            <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
    );
}

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProviderSettingsScreen } from '../screens/Provider/ProviderSettingsScreen';
import { ProviderEmployeesScreen } from '../screens/Provider/ProviderEmployeesScreen';
import { EditProfileScreen } from '../screens/technician/EditProfileScreen';
import { PaymentInfoScreen } from '../screens/technician/PaymentInfoScreen';
import { InventoryScreen } from '../screens/Provider/InventoryScreen';
import { CategoryScreen } from '../screens/Provider/CategoryScreen';
import { ProductsServicesScreen } from '../screens/Provider/ProductsServicesScreen';
import { SuppliersScreen } from '../screens/Provider/SuppliersScreen';

const Stack = createStackNavigator();

interface ProviderSettingsStackProps {
    onLogout?: () => void;
}

export function ProviderSettingsStackNavigator({ onLogout }: ProviderSettingsStackProps) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsHome">
                {(props) => <ProviderSettingsScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Employees" component={ProviderEmployeesScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PaymentInfo" component={PaymentInfoScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="OurServices" component={ProductsServicesScreen} />
            <Stack.Screen name="Suppliers" component={SuppliersScreen} />
            {/* Add other provider specific settings screens here if needed */}
        </Stack.Navigator>
    );
}

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { EditProfileScreen } from '../../screens/technician/EditProfileScreen';
import { PaymentInfoScreen } from '../../screens/technician/PaymentInfoScreen';
import { TechnicianSettingsScreen } from '../../screens/technician/TechnicianSettingsScreen';

const Stack = createStackNavigator();

interface SettingsStackProps {
    onLogout?: () => void;
}

export function SettingsStackNavigator({ onLogout }: SettingsStackProps) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsHome">
                {(props) => <TechnicianSettingsScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PaymentInfo" component={PaymentInfoScreen} />
        </Stack.Navigator>
    );
}

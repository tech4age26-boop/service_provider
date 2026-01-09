import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TechnicianSettingsScreen } from '../../screens/technician/TechnicianSettingsScreen';
import { EditProfileScreen } from '../../screens/technician/EditProfileScreen';
import { PaymentInfoScreen } from '../../screens/technician/PaymentInfoScreen';
import { SettingsLanguageScreen } from '../../screens/technician/SettingsLanguageScreen';
import { MyCertificationsScreen } from '../../screens/technician/MyCertificationsScreen';
import { HelpCenterScreen } from '../../screens/technician/HelpCenterScreen.tsx';
import { TermsPrivacyScreen } from '../../screens/technician/TermsPrivacyScreen';
import { TransactionsHistoryScreen } from '../../screens/technician/TransactionsHistoryScreen';
import { PaymentMethodDetailScreen } from '../../screens/technician/PaymentMethodDetailScreen';

const Stack = createStackNavigator();

interface TechnicianSettingsStackProps {
    onLogout?: () => void;
}

export function TechnicianSettingsStack({ onLogout }: TechnicianSettingsStackProps) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SettingsHome">
                {(props) => <TechnicianSettingsScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PaymentInfo" component={PaymentInfoScreen} />
            <Stack.Screen name="SettingsLanguage" component={SettingsLanguageScreen} />
            <Stack.Screen name="MyCertifications" component={MyCertificationsScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
            <Stack.Screen name="TransactionsHistory" component={TransactionsHistoryScreen} />
            <Stack.Screen name="PaymentMethodDetail" component={PaymentMethodDetailScreen} />
        </Stack.Navigator>
    );
}

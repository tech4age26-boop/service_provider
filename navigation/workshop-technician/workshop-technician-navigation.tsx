import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkshopTechnicianHomeScreen } from '../../screens/workshop-technician/WorkshopTechnicianHomeScreen';
import { NotificationScreen } from '../../screens/technician/notification-screen';

export type WorkshopTechnicianStackParamList = {
    WorkshopTechnicianHome: undefined;
    Notification: undefined;
};

const Stack = createNativeStackNavigator<WorkshopTechnicianStackParamList>();

export function WorkshopTechnicianNavigation() {
    return (
        <Stack.Navigator
            initialRouteName="WorkshopTechnicianHome"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="WorkshopTechnicianHome" component={WorkshopTechnicianHomeScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
        </Stack.Navigator>
    );
}

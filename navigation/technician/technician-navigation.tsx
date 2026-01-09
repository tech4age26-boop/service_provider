import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TechnicianHomeScreen } from '../../screens/technician/TechnicianHomeScreen';
import { TaskDetailScreen } from '../../screens/technician/task-details.screen';
import { NotificationScreen } from '../../screens/technician/notification-screen';
import { TechnicianOrdersScreen } from '../../screens/technician/TechnicianOrdersScreen';

interface Task {
  id: string;
  service: string;
  customer: string;
  location: string;
  eta?: string;
  scheduled?: string;
  status: 'active' | 'next' | 'completed';
}

export type TechnicianStackParamList = {
  TechnicianHome: undefined;
  TaskDetailScreen: { task: Task };
  Notification: undefined;
  TechnicianOrdersScreen: undefined;
};

const Stack = createNativeStackNavigator<TechnicianStackParamList>();

export function TechnicianNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="TechnicianHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TechnicianHome" component={TechnicianHomeScreen} />
      <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}

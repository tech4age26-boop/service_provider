import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TechnicianHomeScreen } from '../../screens/technician/TechnicianHomeScreen';
import { TaskDetailScreen } from '../../screens/technician/task-details.screen';
import { NotificationScreen } from '../../screens/technician/notification-screen';
import { TechnicianOrdersScreen } from '../../screens/technician/TechnicianOrdersScreen';

export type TechnicianStackParamList = {
  TaskDetailScreen: { task: any };
  TechnicianOrdersScreen: undefined;
};

const Stack = createNativeStackNavigator<TechnicianStackParamList>();

export function TechnicianOrderNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="TechnicianOrdersScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TechnicianOrdersScreen"
        component={TechnicianOrdersScreen}
      />
      <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}

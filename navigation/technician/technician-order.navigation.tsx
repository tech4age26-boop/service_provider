import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TechnicianHomeScreen } from '../../screens/technician/TechnicianHomeScreen';
import { TaskDetailScreen } from '../../screens/technician/task-details.screen';
import { NotificationScreen } from '../../screens/technician/notification-screen';
import { TechnicianOrdersScreen } from '../../screens/technician/TechnicianOrdersScreen';
import { TechnicianFeedbackScreen } from '../../screens/technician/TechnicianFeedbackScreen';

export type TechnicianStackParamList = {
  TaskDetailScreen: { task: any };
  TechnicianOrdersScreen: undefined;
  TechnicianFeedback: { task: any };
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
      <Stack.Screen name="TechnicianFeedback" component={TechnicianFeedbackScreen} />
    </Stack.Navigator>
  );
}

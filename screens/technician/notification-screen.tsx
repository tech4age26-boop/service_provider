import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AppBody from '../../components/app_body/app-body';
import { useTheme } from '../../App';
import TechnicianHeader from '../../components/technician_header/technician-header';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'success';
}

interface NotificationScreenProps {
  navigation: any;
}

export function NotificationScreen({ navigation }: NotificationScreenProps) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Task Assigned',
        message: 'You have a new task: Brake Service at Al Olaya, Riyadh.',
        time: '10 mins ago',
        type: 'info',
      },
      {
        id: '2',
        title: 'Task Completed',
        message: 'Task "Battery Replacement" has been marked as completed.',
        time: '2 hours ago',
        type: 'success',
      },
      {
        id: '3',
        title: 'Schedule Change',
        message: 'Task "Oil Change" has been rescheduled to 5:00 PM.',
        time: 'Yesterday',
        type: 'alert',
      },
      {
        id: '4',
        title: 'Reminder',
        message: 'You have an upcoming task: AC Repair at Riyadh Center.',
        time: 'Tomorrow 4:30 PM',
        type: 'info',
      },
    ];
    setNotifications(demoNotifications);
  };

  const getIcon = (type: string) => {
    if (type === 'success') return <FontAwesome5 name="check-circle" size={22} color="#2ECC71" solid />;
    if (type === 'alert') return <MaterialCommunityIcons name="alert-circle" size={22} color="#FF3B30" />;
    return <MaterialCommunityIcons name="information" size={22} color="#007AFF" />;
  };

  return (
    <AppBody style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      {/* <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <TouchableOpacity onPress={() => setNotifications([])}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View> */}
      <TechnicianHeader title="Notifications" onBackPress={() => {navigation.goBack()}} />

      <ScrollView style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color="#999" />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No notifications yet
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={[styles.notificationCard, { backgroundColor: theme.cardBackground }]}
            >
              <View style={styles.notificationHeader}>
                {getIcon(notification.type)}
                <Text style={[styles.notificationTitle, { color: theme.text }]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationTime, { color: '#999' }]}>
                  {notification.time}
                </Text>
              </View>
              <Text style={[styles.notificationMessage, { color: theme.text }]}>
                {notification.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </AppBody>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, paddingTop: 12 },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginHorizontal: 8 },
  notificationTime: { fontSize: 12 },
  notificationMessage: { fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, marginTop: 12 },
});

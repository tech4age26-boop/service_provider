import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../App';
import AppBody from '../../components/app_body/app-body';

interface Task {
  id: string;
  service: string;
  customer: string;
  location: string;
  eta?: string;
  scheduled?: string;
  status: 'active' | 'next' | 'completed';
}

interface Props {
  navigation: any;
}

export function TechnicianHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadUserData();
    loadTasks();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('user_data');
      if (data) setUserData(JSON.parse(data));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTasks = () => {
    const demoTasks: Task[] = [
      {
        id: '1',
        service: 'Brake Service',
        customer: 'Ali Khan',
        location: 'Al Olaya, Riyadh',
        eta: '15 mins',
        status: 'active',
      },
      {
        id: '2',
        service: 'Battery Replacement',
        customer: 'David Wilson',
        location: 'King Fahd Rd, Riyadh',
        scheduled: '4:30 PM',
        status: 'next',
      },
      {
        id: '3',
        service: 'Oil Change',
        customer: 'Fatima Zahra',
        location: 'Olaya District',
        scheduled: 'Yesterday',
        status: 'completed',
      },
      {
        id: '4',
        service: 'AC Repair',
        customer: 'Mohammed Ali',
        location: 'Riyadh Center',
        scheduled: 'Yesterday',
        status: 'completed',
      },
    ];
    setTasks(demoTasks);
  };

  const renderTask = (task: Task) => {
    let badgeColor = '#FFF3CD';
    let textColor = '#856404';
    let statusLabel = t('status.in_transit');
    let iconName = 'tools';

    if (task.status === 'next') {
      badgeColor = '#D1ECF1';
      textColor = '#0C5460';
      statusLabel = t('status.next_task');
      iconName = 'calendar-alt';
    } else if (task.status === 'completed') {
      badgeColor = '#D4EDDA';
      textColor = '#155724';
      statusLabel = t('status.completed');
      iconName = 'check-circle';
    }

    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TaskDetailScreen', { task })}
      >
        <View style={styles.orderHeader}>
          <FontAwesome5 name={iconName} size={20} color={textColor} solid />
          <Text style={[styles.orderTitle, { color: theme.text }]}>
            {task.service}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.statusText, { color: textColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.orderCustomer}>
          {t('common.customer')}: {task.customer}
        </Text>
        <Text style={styles.orderCustomer}>
          {t('common.location')}: {task.location}
        </Text>
        {task.eta && (
          <Text style={styles.orderTime}>
            {t('common.eta')}: {task.eta}
          </Text>
        )}
        {task.scheduled && (
          <Text style={styles.orderTime}>
            {t('common.scheduled')}: {task.scheduled}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const nextTasks = tasks.filter((t) => t.status === 'next');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <AppBody style={{ flex: 1 }}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.cardBackground,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
      >
        {userData?.logoUrl ? (
          <Image
            source={{ uri: userData.logoUrl }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              borderWidth: 2,
              borderColor: '#F4C430',
            }}
          />
        ) : (
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#F4C430',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="account-wrench"
              size={30}
              color="#1C1C1E"
            />
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.greeting}>
            {t('home.welcome_back')},{' '}
            {userData?.ownerName || t('common.user')}! 👋
          </Text>
          <Text style={[styles.shopName, { color: theme.text }]}>
            {userData?.workshopName || 'Filter Technician'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('Notification')}
        >
          <FontAwesome5 name="bell" size={22} color="#1C1C1E" solid />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.statsContainer}>
          <View
            style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
          >
            <FontAwesome5 name="tasks" size={26} color="#F4C430" solid />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {tasks.length}
            </Text>
            <Text style={styles.statLabel}>{t('home.my_tasks')}</Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
          >
            <FontAwesome5 name="star" size={26} color="#FFB800" solid />
            <Text style={[styles.statNumber, { color: theme.text }]}>4.9</Text>
            <Text style={styles.statLabel}>{t('home.rating')}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View
            style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
          >
            <FontAwesome5
              name="money-bill-wave"
              size={26}
              color="#2ECC71"
              solid
            />
            <Text style={[styles.statNumber, { color: theme.text }]}>$450</Text>
            <Text style={styles.statLabel}>{t('home.earnings_today')}</Text>
          </View>

          <View
            style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
          >
            <FontAwesome5
              name="map-marker-alt"
              size={26}
              color="#007AFF"
              solid
            />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {activeTasks.length}
            </Text>
            <Text style={styles.statLabel}>{t('home.onsite_visits')}</Text>
          </View>
        </View>

        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Active Tasks
              </Text>
            </View>
            {activeTasks.map(renderTask)}
          </View>
        )}

        {nextTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Next Tasks
              </Text>
            </View>
            {nextTasks.map(renderTask)}
          </View>
        )}

        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Completed Tasks
              </Text>
            </View>
            {completedTasks.map(renderTask)}
          </View>
        )}
      </ScrollView>
    </AppBody>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 12,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F4C430',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  viewAll: {
    fontSize: 14,
    color: '#F4C430',
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
});

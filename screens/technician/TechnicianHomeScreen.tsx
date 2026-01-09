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
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface Task {
  id: string;
  service: string;
  customer: string;
  location: string;
  eta?: string;
  scheduled?: string;
  status: 'active' | 'next' | 'completed';
}

interface UserData {
  logoUrl?: string;
  ownerName?: string;
  workshopName?: string;
}

interface Props {
  navigation: any;
}

export function TechnicianHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    loadTasks();
    setLoading(false);
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('user_data');
      if (data) {
        const parsedData = JSON.parse(data) as UserData;
        setUserData(parsedData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
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
    let badgeColor = colors.primaryLight;
    let textColor = colors.primary;
    let statusLabel = t('status.in_transit');
    let iconName = 'tools';

    if (task.status === 'next') {
      badgeColor = 'rgba(0, 122, 255, 0.15)';
      textColor = colors.info;
      statusLabel = t('status.next_task');
      iconName = 'calendar-alt';
    } else if (task.status === 'completed') {
      badgeColor = colors.successLight;
      textColor = colors.success;
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
          <View style={[styles.taskIconContainer, { backgroundColor: badgeColor }]}>
            <FontAwesome5 name={iconName} size={18} color={textColor} solid />
          </View>
          <Text style={[styles.orderTitle, { color: theme.text }]}>
            {task.service}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.statusText, { color: textColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text style={[styles.orderCustomer, { color: theme.subText }]}>
          {t('common.customer')}: {task.customer}
        </Text>
        <Text style={[styles.orderCustomer, { color: theme.subText }]}>
          {t('common.location')}: {task.location}
        </Text>
        {task.eta && (
          <Text style={[styles.orderTime, { color: theme.text }]}>
            {t('common.eta')}: {task.eta}
          </Text>
        )}
        {task.scheduled && (
          <Text style={[styles.orderTime, { color: theme.text }]}>
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
            style={[styles.profileImage, { borderColor: theme.tint }]}
          />
        ) : (
          <View style={[styles.profilePlaceholder, { backgroundColor: theme.tint }]}>
            <MaterialCommunityIcons
              name="account-wrench"
              size={30}
              color={colors.secondary}
            />
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.greeting, { color: theme.subText }]}>
            {t('home.welcome_back')},{' '}
            {userData?.ownerName || t('common.user')}! 👋
          </Text>
          <Text style={[styles.shopName, { color: theme.text }]}>
            {userData?.workshopName || t('common.filter_technician')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.notificationIcon, { backgroundColor: theme.inputBackground }]}
          onPress={() => navigation.navigate('Notification')}
        >
          <FontAwesome5 name="bell" size={20} color={theme.text} solid />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Today's Earnings */}
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.successLight }]}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.success} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>1,250</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>
              {t('home.earnings_today')} SAR
            </Text>
          </View>

          {/* Active Jobs */}
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
              <MaterialCommunityIcons name="briefcase-clock" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {activeTasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>
              {t('home.active_jobs')}
            </Text>
          </View>

          {/* Completion Rate */}
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
              <MaterialCommunityIcons name="chart-line" size={24} color={colors.info} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>98%</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>
              {t('home.completion_rate')}
            </Text>
          </View>

          {/* Average Rating */}
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 204, 0, 0.15)' }]}>
              <MaterialCommunityIcons name="star" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>4.9</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>
              {t('home.rating')}
            </Text>
          </View>
        </View>

        {/* Active Tasks Section */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('home.active_orders')}
              </Text>
            </View>
            {activeTasks.map(renderTask)}
          </View>
        )}

        {/* Next Tasks Section */}
        {nextTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('status.next_task')}
              </Text>
            </View>
            {nextTasks.map(renderTask)}
          </View>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('orders.completed')}
              </Text>
            </View>
            {completedTasks.map(renderTask)}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBody>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    ...typography.caption,
    marginBottom: 2,
  },
  shopName: {
    ...typography.subheader,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    ...typography.header,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.subheader,
  },
  orderCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: {
    flex: 1,
    ...typography.body,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  orderCustomer: {
    ...typography.caption,
    marginBottom: 4,
  },
  orderTime: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 4,
  },
});

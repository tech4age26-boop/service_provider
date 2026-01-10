import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AppBody from '../../components/app_body/app-body';
import { useTheme } from '../../theme/ThemeContext';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { colors } from '../../theme/colors';

import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'success';
  read?: boolean;
}

interface NotificationScreenProps {
  navigation: any;
}

export function NotificationScreen({ navigation }: NotificationScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        title: t('status.next_task'), 
        message: 'You have a new task: Brake Service at Al Olaya, Riyadh.',
        time: '10 mins ago',
        type: 'info',
        read: false,
      },
    ];
    const demo: Notification[] = [
        {
        id: '1',
        title: 'New Task Assigned',
        message: 'You have a new task: Brake Service at Al Olaya, Riyadh.',
        time: '10 mins ago',
        type: 'info',
        read: false,
      },
       {
        id: '2',
        title: 'Task Completed',
        message: 'Task "Battery Replacement" has been marked as completed.',
        time: '2 hours ago',
        type: 'success',
        read: false,
      },
    ];
     setNotifications(demo);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      t('settings.notifications_page.clear_confirm_title'),
      t('settings.notifications_page.clear_confirm_msg'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.notifications_page.clear_all'),
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const getIconConfig = (type: string) => {
    if (type === 'success') {
      return {
        icon: <FontAwesome5 name="check-circle" size={24} color={colors.success} solid />,
        bgColor: colors.successLight,
      };
    }
    if (type === 'alert') {
      return {
        icon: <MaterialCommunityIcons name="alert-circle" size={24} color={colors.danger} />,
        bgColor: colors.dangerLight,
      };
    }
    return {
      icon: <MaterialCommunityIcons name="information" size={24} color={colors.info} />,
      bgColor: 'rgba(0, 122, 255, 0.15)',
    };
  };

  // ...

  return (
    <AppBody style={[styles.container, { backgroundColor: theme.background }]}>
      <TechnicianHeader
        title={t('settings.notifications_page.title')}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          notifications.length > 0 ? (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
              <MaterialCommunityIcons name="delete-sweep" size={24} color={colors.danger} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.inputBackground }]}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={theme.subText} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {t('settings.notifications_page.empty_title')}
            </Text>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {t('settings.notifications_page.empty_msg')}
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const iconConfig = getIconConfig(notification.type);
            return (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderLeftColor: notification.read ? theme.border : colors.primary,
                  }
                ]}
              >
                <View style={styles.cardContent}>
                  {/* Icon Container */}
                  <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
                    {iconConfig.icon}
                  </View>

                  {/* Content */}
                  <View style={styles.textContent}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.notificationTitle, { color: theme.text }]}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.notificationMessage, { color: theme.subText }]} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.subText }]}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={theme.subText} />
                      {' '}{notification.time}
                    </Text>
                  </View>

                  {/* Clear Icon */}
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color={theme.subText} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </AppBody>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  clearAllButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  notificationCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
  },
  clearButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

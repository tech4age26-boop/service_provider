import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { colors } from '../../theme/colors';

const API_BASE_URL = 'https://filter-server.vercel.app';

interface Task {
  id: string;
  service: string;
  customer: string;
  location: string;
  eta?: string;
  scheduled?: string;
  status: 'active' | 'next' | 'completed' | 'pending' | 'in-progress';
  originalOrder?: any;
}

interface RouteParams {
  task: Task;
}

interface TaskDetailProps {
  route: {
    params: RouteParams;
  };
  navigation: any;
}

export function TaskDetailScreen({ route, navigation }: TaskDetailProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [task, setTask] = React.useState<Task>(route?.params?.task);
  const [updating, setUpdating] = React.useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      const orderId = task.originalOrder?._id;

      if (!orderId) {
        Alert.alert('Error', 'Order ID not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/update-order-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTask({ ...task, status: newStatus as any });
        Alert.alert('Success', `Status updated to ${newStatus}`);
        if (newStatus === 'completed') {
          navigation.goBack();
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update Status Error:', error);
      Alert.alert('Error', 'Network request failed');
    } finally {
      setUpdating(false);
    }
  };

  // Safety check for task data
  if (!task) {
    return (
      <AppBody style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: theme.text }}>{t('technician.task_not_found')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#007AFF' }}>{t('technician.go_back')}</Text>
        </TouchableOpacity>
      </AppBody>
    );
  }

  const openMaps = () => {
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        task.location
      )}`;
      Linking.openURL(url).catch((err) => {
        console.error('Failed to open maps:', err);
      });
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  // Demo customer review data
  const customerReview = {
    rating: 4.8,
    comment: 'Great service, very professional and fast!',
  };

  return (
    <AppBody style={[styles.container, { backgroundColor: theme.background }]}>
      <TechnicianHeader title={t('technician.task_details')} onBackPress={() => { navigation.goBack() }} />

      <ScrollView style={styles.content}>
        {/* Task Info */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.taskTitle, { color: theme.text }]}>
              {task.service}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: task.status === 'completed' ? '#D4EDDA' : task.status === 'next' ? '#D1ECF1' : '#FFF3CD' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: task.status === 'completed' ? '#155724' : task.status === 'next' ? '#0C5460' : '#856404' }
              ]}>
                {task.status === 'completed' ? t('status.completed') : task.status === 'next' ? t('status.next_task') : t('status.active')}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={20} color="#F4C430" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {t('common.customer')}: {task.customer}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#007AFF" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {t('common.location')}: {task.location}
            </Text>
          </View>

          {task.eta && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="clock" size={20} color="#FFB800" />
              <Text style={[styles.infoText, { color: theme.text }]}>
                {t('common.eta')}: {task.eta}
              </Text>
            </View>
          )}

          {task.scheduled && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="calendar-alt" size={20} color="#2ECC71" />
              <Text style={[styles.infoText, { color: theme.text }]}>
                {t('common.scheduled')}: {task.scheduled}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
            <FontAwesome5 name="map-marked-alt" size={18} color="#FFF" />
            <Text style={styles.mapButtonText}>{t('technician.view_on_map')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('technician.task_steps')}</Text>
          <View style={styles.checklistItem}>
            {task.status === 'completed' ? (
              <MaterialCommunityIcons name="check-circle" size={20} color="#2ECC71" />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#F4C430" />
            )}
            <Text style={[styles.checkText, { color: theme.text }]}>{t('technician.arrive_location')}</Text>
          </View>
          <View style={styles.checklistItem}>
            {task.status === 'completed' ? (
              <MaterialCommunityIcons name="check-circle" size={20} color="#2ECC71" />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#F4C430" />
            )}
            <Text style={[styles.checkText, { color: theme.text }]}>{t('technician.perform_service')}: {task.service}</Text>
          </View>
          <View style={styles.checklistItem}>
            {task.status === 'completed' ? (
              <MaterialCommunityIcons name="check-circle" size={20} color="#2ECC71" />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#F4C430" />
            )}
            <Text style={[styles.checkText, { color: theme.text }]}>{t('technician.verify_complete')}</Text>
          </View>
        </View>

        {/* Bill Summary Section */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('technician.bill_summary')}</Text>

          {/* Service Item */}
          <View style={styles.billRow}>
            <Text style={[styles.billItemText, { color: theme.text }]}>{task.service}</Text>
            <Text style={[styles.billItemPrice, { color: theme.text }]}>
              {(() => {
                const getPrice = (s: string) => {
                  if (s.includes(t('services.oil_change')) || s.includes('Oil')) return 150;
                  if (s.includes(t('services.brake_service')) || s.includes('Brake')) return 320;
                  if (s.includes(t('services.battery_replacement')) || s.includes('Battery')) return 450;
                  return 200; // Default
                };
                const price = getPrice(task.service);
                return `${price} ${t('wallet.sar')}`;
              })()}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Calculations */}
          {(() => {
            const getPrice = (s: string) => {
              if (s.includes(t('services.oil_change')) || s.includes('Oil')) return 150;
              if (s.includes(t('services.brake_service')) || s.includes('Brake')) return 320;
              if (s.includes(t('services.battery_replacement')) || s.includes('Battery')) return 450;
              return 200;
            };
            const price = getPrice(task.service);
            const fees = price * 0.10;
            const net = price - fees;

            return (
              <>
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: theme.subText }]}>{t('technician.item_total')}</Text>
                  <Text style={[styles.billValue, { color: theme.text }]}>{price} {t('wallet.sar')}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: theme.subText }]}>{t('technician.platform_fees')} (10%)</Text>
                  <Text style={[styles.billValue, { color: '#FF3B30' }]}>-{fees.toFixed(0)} {t('wallet.sar')}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.billRow}>
                  <Text style={[styles.billLabelBold, { color: theme.text }]}>{t('technician.net_earnings')}</Text>
                  <Text style={[styles.billValueBold, { color: '#34C759' }]}>{net.toFixed(0)} {t('wallet.sar')}</Text>
                </View>
                <Text style={[styles.vatNote, { color: theme.subText }]}>{t('technician.vat_included')}</Text>
              </>
            );
          })()}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('technician.customer_review')}</Text>
          <View style={styles.reviewRow}>
            <FontAwesome5 name="star" size={16} color="#FFB800" />
            <Text style={[styles.reviewRating, { color: theme.text }]}>
              {customerReview.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.reviewComment, { color: theme.text }]}>
            "{customerReview.comment}"
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {task.status !== 'completed' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2ECC71' }, updating && { opacity: 0.7 }]}
                disabled={updating}
                onPress={() => updateStatus('in-progress')}
              >
                {updating ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.actionButtonText}>{t('technician.start_task')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F4C430' }, updating && { opacity: 0.7 }]}
                disabled={updating}
                onPress={() => updateStatus('completed')}
              >
                {updating ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.actionButtonText}>{t('technician.mark_completed')}</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary, marginHorizontal: 0 }]}
              onPress={() => navigation.navigate('TechnicianFeedback', { task })}
            >
              <Text style={styles.actionButtonText}>{t('technician.give_feedback')}</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold' as const },
  content: { flex: 1 },
  card: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' as const },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' as const },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoText: { fontSize: 14 },
  mapButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  mapButtonText: { color: '#FFF', fontWeight: '600' as const, marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' as const, marginBottom: 12 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  checkText: { fontSize: 14 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  reviewRating: { fontSize: 14, fontWeight: '600' as const },
  reviewComment: { fontSize: 14, fontStyle: 'italic' },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12 },
  actionButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  actionButtonText: { color: '#1C1C1E', fontWeight: '600' as const },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  billItemText: { fontSize: 16, fontWeight: '500' as const },
  billItemPrice: { fontSize: 16, fontWeight: '600' as const },
  divider: { height: 1, marginVertical: 12 },
  billLabel: { fontSize: 14 },
  billValue: { fontSize: 14, fontWeight: '500' as const },
  billLabelBold: { fontSize: 16, fontWeight: 'bold' as const },
  billValueBold: { fontSize: 16, fontWeight: 'bold' as const },
  vatNote: { fontSize: 12, marginTop: 8, textAlign: 'right', fontStyle: 'italic' as const },
});

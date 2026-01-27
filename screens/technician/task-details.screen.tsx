import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../constants/api';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface Task {
  id: string;
  service: string;
  customer: string;
  location: string;
  eta?: string;
  scheduled?: string;
  status: 'active' | 'next' | 'completed' | 'pending' | 'in-progress';
  originalOrder?: any;
  taskIndex?: number;
  products?: any[];
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
  const [task, setTask] = useState<Task>(route?.params?.task);
  const [updating, setUpdating] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [taskProducts, setTaskProducts] = useState<any[]>(route?.params?.task?.products || []);

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      const orderId = task.originalOrder?._id;

      if (!orderId) {
        Alert.alert('Error', 'Order ID not found');
        return;
      }

      const payload: any = {
        orderId: orderId,
        status: newStatus,
      };

      // If it's a sub-task, use taskIndex
      if (task.taskIndex !== undefined && task.taskIndex >= 0) {
        payload.taskIndex = task.taskIndex;
      }

      const response = await fetch(`${API_BASE_URL}/api/update-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const providerId = userData.workshopId || userData.providerId; // Technician's workshop

        const response = await fetch(`${API_BASE_URL}/api/inventory?providerId=${providerId}`);
        const result = await response.json();
        if (result.success) {
          setInventory(result.items || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleAddProduct = (item: any) => {
    const existing = taskProducts.find(p => p.productId === item._id);
    if (existing) {
      setTaskProducts(taskProducts.map(p =>
        p.productId === item._id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setTaskProducts([...taskProducts, {
        productId: item._id,
        name: item.name,
        price: item.sellingPrice || item.price,
        quantity: 1
      }]);
    }
  };

  const updateTaskProducts = async () => {
    try {
      setUpdating(true);
      const orderId = task.originalOrder?._id;

      const payload: any = {
        orderId,
        products: taskProducts
      };

      if (task.taskIndex !== undefined && task.taskIndex >= 0) {
        payload.taskIndex = task.taskIndex;
      }

      const response = await fetch(`${API_BASE_URL}/api/update-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Products updated successfully');
        setShowProductModal(false);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update products');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenProductModal = () => {
    setShowProductModal(true);
    fetchInventory();
  };

  const openMaps = () => {
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.location)}`;
      Linking.openURL(url).catch((err) => console.error('Failed to open maps:', err));
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

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

  return (
    <AppBody style={[styles.container, { backgroundColor: theme.background }]}>
      <TechnicianHeader title={t('technician.task_details')} onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Info */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.taskTitle, { color: theme.text }]}>{task.service}</Text>
            <View style={[styles.statusBadge, { backgroundColor: task.status === 'completed' ? '#D4EDDA' : task.status === 'next' ? '#D1ECF1' : '#FFF3CD' }]}>
              <Text style={[styles.statusText, { color: task.status === 'completed' ? '#155724' : task.status === 'next' ? '#0C5460' : '#856404' }]}>
                {task.status === 'completed' ? t('status.completed') : task.status === 'next' ? t('status.next_task') : t('status.active')}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={20} color="#F4C430" />
            <Text style={[styles.infoText, { color: theme.text }]}>{t('common.customer')}: {task.customer}</Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#007AFF" />
            <Text style={[styles.infoText, { color: theme.text }]}>{t('common.location')}: {task.location}</Text>
          </View>


        </View>

        {/* Products Management */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Products Used</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#F4C430', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}
              onPress={handleOpenProductModal}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#000' }}>Manage Products</Text>
            </TouchableOpacity>
          </View>

          {taskProducts.length === 0 ? (
            <Text style={{ color: theme.subText, fontStyle: 'italic', textAlign: 'center' }}>No products added yet.</Text>
          ) : (
            taskProducts.map((p, idx) => (
              <View key={idx} style={styles.billRow}>
                <Text style={[styles.billItemText, { color: theme.text }]}>{p.name} x{p.quantity}</Text>
                <Text style={[styles.billItemPrice, { color: theme.text }]}>{(parseFloat(p.price || p.sellingPrice || 0) * (p.quantity || 1)).toFixed(2)} SAR</Text>
              </View>
            ))
          )}
        </View>

        {/* Status Actions */}
        <View style={styles.actionContainer}>
          {task.status === 'completed' ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary, marginHorizontal: 0 }]}
              onPress={() => navigation.navigate('TechnicianFeedback', { task })}
            >
              <Text style={styles.actionButtonText}>{t('technician.give_feedback')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: (task.status === 'active' || task.status === 'in-progress') ? '#F4C430' : '#2ECC71' },
                updating && { opacity: 0.7 },
                { marginHorizontal: 0 }
              ]}
              disabled={updating}
              onPress={() => updateStatus((task.status === 'active' || task.status === 'in-progress') ? 'completed' : 'in-progress')}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {(task.status === 'active' || task.status === 'in-progress')
                    ? t('technician.mark_completed')
                    : t('technician.start_task')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Product Management Modal */}
      <Modal visible={showProductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Manage Products</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Current Selected:</Text>
              <ScrollView style={{ maxHeight: 150, marginBottom: 15 }}>
                {taskProducts.map((p, idx) => (
                  <View key={idx} style={[styles.selectedProductItem, { backgroundColor: theme.inputBackground }]}>
                    <Text style={{ color: theme.text, flex: 1 }}>{p.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity onPress={() => {
                        const newProds = [...taskProducts];
                        if (newProds[idx].quantity > 1) {
                          newProds[idx].quantity--;
                          setTaskProducts(newProds);
                        } else {
                          setTaskProducts(newProds.filter((_, i) => i !== idx));
                        }
                      }}>
                        <MaterialCommunityIcons name="minus-circle-outline" size={22} color="#FF3B30" />
                      </TouchableOpacity>
                      <Text style={{ color: theme.text, fontWeight: 'bold' }}>{p.quantity}</Text>
                      <TouchableOpacity onPress={() => {
                        const newProds = [...taskProducts];
                        newProds[idx].quantity++;
                        setTaskProducts(newProds);
                      }}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={22} color="#2ECC71" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <Text style={{ color: theme.text, fontWeight: 'bold', marginVertical: 10 }}>Inventory Items:</Text>
              {loadingInventory ? (
                <ActivityIndicator color="#F4C430" style={{ marginTop: 20 }} />
              ) : (
                <ScrollView>
                  {inventory.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.inventoryItem, { borderBottomColor: theme.border }]}
                      onPress={() => handleAddProduct(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontWeight: '600' }}>{item.name}</Text>
                        <Text style={{ color: theme.subText, fontSize: 12 }}>Stock: {item.stock} | {item.sellingPrice} SAR</Text>
                      </View>
                      <MaterialCommunityIcons name="plus-box" size={24} color="#F4C430" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: '#F4C430', marginTop: 20 }]}
              onPress={updateTaskProducts}
              disabled={updating}
            >
              {updating ? <ActivityIndicator color="#000" /> : <Text style={[styles.mapButtonText, { color: '#000' }]}>Update Order Products</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppBody>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  card: { borderRadius: 16, padding: 16, margin: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoText: { fontSize: 14 },
  mapButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  mapButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  billItemText: { fontSize: 14, fontWeight: '500' },
  billItemPrice: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12, marginBottom: 20 },
  actionButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  actionButtonText: { color: '#1C1C1E', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', height: '85%', padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  selectedProductItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginBottom: 5 },
  inventoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
});

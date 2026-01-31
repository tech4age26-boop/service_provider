import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

const API_BASE_URL = 'https://filter-server.vercel.app';

interface Order {
    _id: string;
    customerId?: string;
    customerName: string;
    customerVatNo?: string;
    customerPhone?: string;
    vehicleDetails: {
        make: string;
        model: string;
        plate: string;
        odometerReading?: string;
    };
    technicianName: string;
    technicianId?: string;
    totalAmount?: number;
    status: string;
    products?: any[];
    serviceType: string;
}

interface PendingOrdersScreenProps {
    navigation: any;
}

export function PendingOrdersScreen({ navigation }: PendingOrdersScreenProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const providerId = userData.workshopId || userData.id || userData._id;
                const response = await fetch(`${API_BASE_URL}/api/provider-orders?providerId=${providerId}`);
                const result = await response.json();
                if (result.success) {
                    const allOrders = result.orders || result.data || [];
                    const pendingOrders = allOrders.filter((o: Order) => o.status === 'pending');
                    setOrders(pendingOrders);
                }
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Pending Orders</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.subText }]}>{orders.length} orders pending</Text>
                </View>
                <TouchableOpacity onPress={fetchPendingOrders} style={styles.refreshButton}>
                    <MaterialCommunityIcons name="refresh" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#F4C430" style={{ marginTop: 50 }} />
                ) : orders.length === 0 ? (
                    <View style={styles.centerContent}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={60} color={theme.subText} />
                        <Text style={[styles.emptyText, { color: theme.subText }]}>No pending orders</Text>
                    </View>
                ) : (
                    <View style={{ gap: 12 }}>
                        {orders.map((order) => (
                            <TouchableOpacity key={order._id} style={[styles.orderCard, { backgroundColor: theme.cardBackground }]} onPress={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                                <View style={styles.orderHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.orderTitle, { color: theme.text }]}>{order.serviceType}</Text>
                                        <Text style={[styles.orderId, { color: theme.subText }]}>Order ID: #{order._id?.slice(-6).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.statusBadge}><Text style={styles.statusText}>PENDING</Text></View>
                                </View>
                                <View style={styles.orderDetails}>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="account" size={16} color={theme.subText} />
                                        <Text style={[styles.detailText, { color: theme.text }]}>{order.customerName}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="car" size={16} color={theme.subText} />
                                        <Text style={[styles.detailText, { color: theme.text }]}>{order.vehicleDetails?.plate} - {order.vehicleDetails?.model}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="account-wrench" size={16} color={theme.subText} />
                                        <Text style={[styles.detailText, { color: theme.text }]}>Assigned: {order.technicianName}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Details Modal */}
            <Modal visible={showOrderModal} transparent animationType="fade" onRequestClose={() => setShowOrderModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.pickerContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Order Details</Text>
                            <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        {selectedOrder && (
                            <ScrollView>
                                <View style={{ gap: 10 }}>
                                    <Text style={{ color: theme.subText }}>CUSTOMER: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.customerName}</Text></Text>
                                    <Text style={{ color: theme.subText }}>VEHICLE: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.vehicleDetails?.plate}</Text></Text>
                                    <Text style={{ color: theme.subText }}>SERVICE: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.serviceType}</Text></Text>
                                    <Text style={{ color: theme.subText }}>TECH: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.technicianName}</Text></Text>
                                    {selectedOrder.customerPhone && <Text style={{ color: theme.subText }}>PHONE: <Text style={{ color: theme.text }}>{selectedOrder.customerPhone || selectedOrder.customerId}</Text></Text>}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    backButton: { marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 12 },
    refreshButton: { padding: 5 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16 },
    orderCard: { padding: 15, borderRadius: 12, marginVertical: 5, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderTitle: { fontSize: 16, fontWeight: 'bold' },
    orderId: { fontSize: 11 },
    statusBadge: { backgroundColor: '#FFF9E6', padding: 4, borderRadius: 4 },
    statusText: { color: '#F4C430', fontSize: 10, fontWeight: 'bold' },
    orderDetails: { gap: 5 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    pickerContent: { width: '85%', maxHeight: '70%', padding: 20, borderRadius: 15 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
});

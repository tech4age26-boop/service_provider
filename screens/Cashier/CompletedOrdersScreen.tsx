import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Alert,
    TextInput,
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

interface CompletedOrdersScreenProps {
    navigation: any;
}

export function CompletedOrdersScreen({ navigation }: CompletedOrdersScreenProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [allServices, setAllServices] = useState<any[]>([]);
    const [allTechnicians, setAllTechnicians] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [filteredTechs, setFilteredTechs] = useState<any[]>([]);

    // Pickers visibility
    const [pickerType, setPickerType] = useState<'service' | 'product' | 'technician' | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    // Selection for task
    const [newService, setNewService] = useState<any>(null);
    const [newProduct, setNewProduct] = useState<any>(null);
    const [newTechnician, setNewTechnician] = useState<any>(null);
    const [saveLoading, setSaveLoading] = useState(false);

    // Editable Details
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [vatNo, setVatNo] = useState('');
    const [plate, setPlate] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [odometer, setOdometer] = useState('');

    useEffect(() => {
        fetchCompletedOrders();
    }, []);

    const fetchCompletedOrders = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const providerId = userData.workshopId || userData.id || userData._id;
                const response = await fetch(`${API_BASE_URL}/api/provider-orders?providerId=${providerId}`);
                const result = await response.json();
                if (result.success) {
                    const completedOrders = result.data.filter((o: Order) => o.status === 'completed');
                    setOrders(completedOrders);
                }
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchManagementData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const providerId = userData.workshopId || userData.id || userData._id;

                const sRes = await fetch(`${API_BASE_URL}/api/services?providerId=${providerId}`);
                const sData = await sRes.json();
                if (sData.success) setAllServices(sData.data);

                const tRes = await fetch(`${API_BASE_URL}/api/employees?workshopId=${providerId}`);
                const tData = await tRes.json();
                if (tData.success) {
                    const techsOnly = tData.data.filter((e: any) => e.employeeType === 'Technician');
                    setAllTechnicians(techsOnly);
                }
            }
        } catch (error) {
            console.error('Fetch Management Data Error:', error);
        }
    };

    const handleDeleteOrder = (orderId: string) => {
        Alert.alert(
            'Delete Order',
            'Are you sure you want to delete this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/delete-order`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId })
                            });
                            const result = await response.json();
                            if (result.success) fetchCompletedOrders();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete order');
                        }
                    }
                }
            ]
        );
    };

    const handleEditPress = (order: Order) => {
        setEditingOrder(order);
        setCustomerName(order.customerName || '');
        setCustomerPhone(order.customerPhone || order.customerId || '');
        setVatNo(order.customerVatNo || '');
        setPlate(order.vehicleDetails?.plate || '');
        setMake(order.vehicleDetails?.make || '');
        setModel(order.vehicleDetails?.model || '');
        setOdometer(order.vehicleDetails?.odometerReading || '');

        setShowEditModal(true);
        fetchManagementData();
        setNewService(null);
        setNewProduct(null);
        setNewTechnician(null);
    };

    const handleServiceSelect = async (service: any) => {
        setNewService(service);
        setNewProduct(null);
        setNewTechnician(null);
        setShowPicker(false);

        const techs = allTechnicians.filter(t => {
            if (!service.specialization) return true;
            return t.specialization === service.specialization || t.specialization === 'General' || !t.specialization;
        });
        setFilteredTechs(techs.length > 0 ? techs : allTechnicians);

        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            const userData = JSON.parse(userDataStr || '{}');
            const providerId = userData.workshopId || userData.id || userData._id;

            const sid = service._id || service.id;
            // First try fetching products linked to this service
            let pRes = await fetch(`${API_BASE_URL}/api/inventory?providerId=${providerId}&serviceId=${sid}`);
            let pData = await pRes.json();

            if (pData.success && pData.items && pData.items.length > 0) {
                setFilteredProducts(pData.items);
            } else {
                pRes = await fetch(`${API_BASE_URL}/api/inventory?providerId=${providerId}`);
                pData = await pRes.json();
                if (pData.success && pData.items) {
                    setFilteredProducts(pData.items);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveOrder = async () => {
        if (!newService || !newTechnician) {
            Alert.alert('Error', 'Please select a service and a technician');
            return;
        }

        try {
            setSaveLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            const userData = JSON.parse(userDataStr || '{}');

            const payload = {
                orderId: editingOrder._id,
                isNewTask: true, // Flag for backend to append to the same document
                customerId: editingOrder.customerId || editingOrder.customerName,
                customerName: customerName,
                customerPhone: customerPhone,
                customerVatNo: vatNo,
                technicianId: newTechnician._id,
                technicianName: newTechnician.name,
                providerId: userData.workshopId || userData.id || userData._id,
                vehicleDetails: {
                    plate: plate,
                    make: make,
                    model: model,
                    odometerReading: odometer,
                    year: editingOrder.vehicleDetails?.year || new Date().getFullYear().toString()
                },
                serviceType: newService.name,
                products: newProduct ? [{
                    productId: newProduct._id,
                    name: newProduct.name,
                    quantity: 1,
                    price: newProduct.sellingPrice || newProduct.price,
                    total: newProduct.sellingPrice || newProduct.price
                }] : [],
                status: 'pending' // Re-set entire document status to pending
            };

            const response = await fetch(`${API_BASE_URL}/api/update-order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                Alert.alert('Success', 'New task added to the existing document and moved to Pending list');
                setShowEditModal(false);
                fetchCompletedOrders();
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error('Save Order Error:', error);
            Alert.alert('Error', 'Failed to add new task to order');
        } finally {
            setSaveLoading(false);
        }
    };

    const openPicker = (type: 'service' | 'product' | 'technician') => {
        if (type === 'product' && !newService) {
            Alert.alert('Info', 'Please select a service first');
            return;
        }
        if (type === 'technician' && !newService) {
            Alert.alert('Info', 'Please select a service first');
            return;
        }
        setPickerType(type);
        setShowPicker(true);
    };

    const renderPickerContent = () => {
        let items: any[] = [];
        let onSelect: (item: any) => void = () => { };
        let title = '';

        if (pickerType === 'service') {
            items = allServices;
            onSelect = handleServiceSelect;
            title = 'Select Service';
        } else if (pickerType === 'product') {
            items = filteredProducts;
            onSelect = (p) => { setNewProduct(p); setShowPicker(false); };
            title = 'Select Product';
        } else if (pickerType === 'technician') {
            items = filteredTechs;
            onSelect = (t) => { setNewTechnician(t); setShowPicker(false); };
            title = 'Select Technician';
        }

        return (
            <View style={styles.modalOverlay}>
                <View style={[styles.pickerContent, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
                        <TouchableOpacity onPress={() => setShowPicker(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {items.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: theme.subText, marginVertical: 20 }}>No items available</Text>
                        ) : (
                            items.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.pickerItem}
                                    onPress={() => onSelect(item)}
                                >
                                    <Text style={{ color: theme.text, fontSize: 16 }}>{item.name}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Completed Orders</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.subText }]}>{orders.length} orders completed</Text>
                </View>
                <TouchableOpacity onPress={fetchCompletedOrders} style={styles.refreshButton}>
                    <MaterialCommunityIcons name="refresh" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#F4C430" style={{ marginTop: 50 }} />
                ) : orders.length === 0 ? (
                    <View style={styles.centerContent}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={60} color={theme.subText} />
                        <Text style={[styles.emptyText, { color: theme.subText }]}>No completed orders</Text>
                    </View>
                ) : (
                    <View style={{ gap: 12 }}>
                        {orders.map((order) => (
                            <TouchableOpacity key={order._id} style={[styles.orderCard, { backgroundColor: theme.cardBackground }]} onPress={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                                <View style={styles.orderHeader}>
                                    <Text style={[styles.orderTitle, { color: theme.text }]}>{order.serviceType}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.statusText, { color: '#4CAF50' }]}>COMPLETED</Text></View>
                                </View>
                                <View style={styles.orderDetails}>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="account" size={16} color={theme.subText} />
                                        <Text style={[styles.detailText, { color: theme.text }]}>{order.customerName}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="car" size={16} color={theme.subText} />
                                        <Text style={[styles.detailText, { color: theme.text }]}>{order.vehicleDetails?.plate}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="cash" size={16} color={theme.subText} />
                                        <Text style={[styles.detailText, { color: theme.text, fontWeight: 'bold' }]}>{order.totalAmount?.toFixed(2)} SAR</Text>
                                    </View>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F4C430' }]} onPress={() => handleEditPress(order)}>
                                        <MaterialCommunityIcons name="pencil" size={18} color="#1C1C1E" />
                                        <Text style={[styles.actionBtnText, { color: '#1C1C1E' }]}>Edit / Manage</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFE5E5' }]} onPress={() => handleDeleteOrder(order._id)}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FF3B30" />
                                        <Text style={[styles.actionBtnText, { color: '#FF3B30' }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <Modal visible={showEditModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.editModalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Order Details</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ gap: 15, paddingBottom: 20 }}>
                                <Text style={styles.sectionHeader}>Customer Information</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="Name" value={customerName} onChangeText={setCustomerName} />
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="Phone" value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" />
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="VAT No." value={vatNo} onChangeText={setVatNo} />

                                <Text style={styles.sectionHeader}>Vehicle Information</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="Plate No." value={plate} onChangeText={setPlate} />
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TextInput style={[styles.input, { flex: 1, backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="Make" value={make} onChangeText={setMake} />
                                    <TextInput style={[styles.input, { flex: 1, backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="Model" value={model} onChangeText={setModel} />
                                </View>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]} placeholder="Odometer" value={odometer} onChangeText={setOdometer} keyboardType="numeric" />

                                <View style={styles.divider} />
                                <Text style={styles.sectionHeader}>Task Assignment (Add Service)</Text>

                                <TouchableOpacity style={[styles.selectInput, { backgroundColor: theme.inputBackground }]} onPress={() => openPicker('service')}>
                                    <Text style={{ color: newService ? theme.text : theme.subText }}>
                                        {newService ? newService.name : 'Select Service'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.selectInput, { backgroundColor: theme.inputBackground }]} onPress={() => openPicker('product')}>
                                    <Text style={{ color: newProduct ? theme.text : theme.subText }}>
                                        {newProduct ? newProduct.name : 'Select Product'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.selectInput, { backgroundColor: theme.inputBackground }]} onPress={() => openPicker('technician')}>
                                    <Text style={{ color: newTechnician ? theme.text : theme.subText }}>
                                        {newTechnician ? newTechnician.name : 'Select Technician'}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveOrder} disabled={saveLoading}>
                                    {saveLoading ? <ActivityIndicator color="#1C1C1E" /> : <Text style={styles.saveBtnText}>Update & Save Order</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Selection Picker Modal */}
            <Modal visible={showPicker} transparent animationType="fade">
                {renderPickerContent()}
            </Modal>

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
                                    {selectedOrder.totalAmount && <Text style={{ color: theme.subText }}>TOTAL: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.totalAmount.toFixed(2)} SAR</Text></Text>}
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
    orderCard: { padding: 15, borderRadius: 12, marginVertical: 8, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderTitle: { fontSize: 16, fontWeight: 'bold' },
    statusBadge: { padding: 4, borderRadius: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    orderDetails: { gap: 5 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 14 },
    cardActions: { flexDirection: 'row', gap: 10, marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 5 },
    actionBtnText: { fontSize: 12, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    editModalContent: { width: '95%', height: '90%', padding: 20, borderRadius: 20 },
    pickerContent: { width: '85%', maxHeight: '70%', padding: 20, borderRadius: 15 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#F4C430', marginBottom: 5 },
    input: { padding: 12, borderRadius: 10, fontSize: 15 },
    selectInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', marginBottom: 10 },
    pickerItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    divider: { height: 1.5, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 10 },
    saveBtn: { backgroundColor: '#F4C430', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: '#1C1C1E', fontWeight: 'bold', fontSize: 17 },
});

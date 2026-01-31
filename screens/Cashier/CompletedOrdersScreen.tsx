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
    Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import Share from 'react-native-share';

const API_BASE_URL = 'https://filter-server.vercel.app';

interface ProductItem {
    productId?: string;
    name: string;
    price?: number;
    sellingPrice?: number;
    quantity: number;
    discount?: number;
    total: number;
}

interface Order {
    _id: string;
    customerId?: string;
    customerName: string;
    customerVatNo?: string;
    customerPhone?: string;
    providerId?: string;
    workshopName?: string;
    workshopLogo?: string | null;
    technicianName: string;
    technicianId?: string;
    vehicleDetails: {
        make?: string;
        model?: string;
        year?: string;
        plate?: string;
        odometerReading?: string;
    };
    serviceType: string;
    products?: ProductItem[];
    totalAmount?: number;
    taxAmount?: number;
    discountAmount?: number;
    paymentStatus?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
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
    const [showInvoiceSlip, setShowInvoiceSlip] = useState(false);
    const [invoiceShareLoading, setInvoiceShareLoading] = useState(false);
    const [saveInvoiceLoading, setSaveInvoiceLoading] = useState(false);

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
                    const allOrders = result.orders || result.data || [];
                    const completedOrders = allOrders.filter((o: Order) => o.status === 'completed' || o.status === 'delivered');
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

    const getInvoiceAsText = (order: Order): string => {
        const lines: string[] = [];
        lines.push('━━━━━━ INVOICE ━━━━━━');
        lines.push(order.workshopName || 'Workshop');
        lines.push('─────────────────────');
        lines.push('Customer: ' + order.customerName);
        if (order.customerPhone) lines.push('Phone: ' + order.customerPhone);
        if (order.customerVatNo) lines.push('VAT: ' + order.customerVatNo);
        lines.push('─────────────────────');
        const v = order.vehicleDetails;
        const vehicleStr = [v?.make, v?.model, v?.year].filter(Boolean).join(' ');
        lines.push('Vehicle: ' + (vehicleStr || '-'));
        lines.push('Plate: ' + (v?.plate || '-'));
        if (v?.odometerReading) lines.push('Odometer: ' + v.odometerReading);
        lines.push('─────────────────────');
        lines.push('Service: ' + order.serviceType);
        lines.push('Technician: ' + order.technicianName);
        lines.push('─────────────────────');
        lines.push('Products:');
        if (order.products && order.products.length > 0) {
            order.products.forEach(p => {
                const total = p.total ?? (p.price != null ? p.price * p.quantity : 0);
                lines.push(`  • ${p.name} x${p.quantity} = ${total.toFixed(2)} SAR`);
            });
        } else {
            lines.push('  No products');
        }
        lines.push('─────────────────────');
        if (order.discountAmount != null && order.discountAmount > 0) lines.push('Discount: -' + order.discountAmount.toFixed(2) + ' SAR');
        if (order.taxAmount != null && order.taxAmount > 0) lines.push('Tax: ' + order.taxAmount.toFixed(2) + ' SAR');
        lines.push('TOTAL: ' + (order.totalAmount?.toFixed(2) ?? '0.00') + ' SAR');
        lines.push('─────────────────────');
        lines.push('Payment: ' + (order.paymentStatus || 'pending').toUpperCase());
        lines.push('Date: ' + (order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()));
        lines.push('Order #' + (order._id || '').slice(-8));
        lines.push('━━━━━━━━━━━━━━━━━━━━');
        return lines.join('\n');
    };

    const shareInvoice = async (openWhatsAppOnly: boolean) => {
        if (!selectedOrder) return;
        const message = getInvoiceAsText(selectedOrder);
        try {
            setInvoiceShareLoading(true);
            if (openWhatsAppOnly) {
                await Share.shareSingle({
                    social: Share.Social.WHATSAPP,
                    message: message,
                    type: 'text/plain',
                });
            } else {
                await Share.open({
                    message: message,
                    title: 'Invoice',
                });
            }
        } catch (error: any) {
            if (error?.message?.includes('User did not share') || error?.message?.includes('cancel')) return;
            if (openWhatsAppOnly) Linking.openURL('https://wa.me/');
            else Alert.alert('Error', 'Could not share.');
        } finally {
            setInvoiceShareLoading(false);
        }
    };

    const openGenerateInvoice = () => {
        setShowOrderModal(false);
        setShowInvoiceSlip(true);
    };

    const saveToSalesInvoiceAndDeleteOrder = async () => {
        if (!selectedOrder) return;
        Alert.alert(
            'Save Invoice & Remove Order',
            'This will save the invoice to records and remove the order from completed list. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save & Remove',
                    onPress: async () => {
                        try {
                            setSaveInvoiceLoading(true);
                            const orderPayload = typeof selectedOrder._id === 'string'
                                ? selectedOrder
                                : { ...selectedOrder, _id: (selectedOrder._id?.$oid ?? selectedOrder._id?.toString?.() ?? selectedOrder._id) };
                            const response = await fetch(`${API_BASE_URL}/api/sales-invoice/save-and-complete`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ order: orderPayload })
                            });
                            const result = await response.json();
                            if (result.success) {
                                setShowInvoiceSlip(false);
                                setSelectedOrder(null);
                                fetchCompletedOrders();
                                Alert.alert('Done', 'Invoice saved to records and order removed.');
                            } else {
                                Alert.alert('Error', result.message || 'Failed to save invoice');
                            }
                        } catch (error) {
                            console.error('Save Sales Invoice Error:', error);
                            Alert.alert('Error', 'Could not save invoice. Try again.');
                        } finally {
                            setSaveInvoiceLoading(false);
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

            {/* Details Modal - Completed Order: main action = Generate Invoice */}
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
                            <>
                                <ScrollView>
                                    <View style={{ gap: 10 }}>
                                        <Text style={{ color: theme.subText }}>CUSTOMER: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.customerName}</Text></Text>
                                        <Text style={{ color: theme.subText }}>VEHICLE: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.vehicleDetails?.plate}</Text></Text>
                                        <Text style={{ color: theme.subText }}>SERVICE: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.serviceType}</Text></Text>
                                        <Text style={{ color: theme.subText }}>TECH: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.technicianName}</Text></Text>
                                        {selectedOrder.totalAmount != null && <Text style={{ color: theme.subText }}>TOTAL: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedOrder.totalAmount.toFixed(2)} SAR</Text></Text>}
                                    </View>
                                </ScrollView>
                                <TouchableOpacity style={[styles.generateInvoiceBtn, { backgroundColor: '#F4C430' }]} onPress={openGenerateInvoice}>
                                    <MaterialCommunityIcons name="file-document-outline" size={22} color="#1C1C1E" />
                                    <Text style={[styles.generateInvoiceBtnText, { color: '#1C1C1E' }]}>Generate Invoice</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Invoice Slip Modal - full order info, Save & WhatsApp */}
            <Modal visible={showInvoiceSlip} transparent animationType="slide" onRequestClose={() => setShowInvoiceSlip(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.invoiceModalContent, styles.invoiceModalContentFixed, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Invoice</Text>
                            <TouchableOpacity onPress={() => setShowInvoiceSlip(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.invoiceScrollView} contentContainerStyle={styles.invoiceScrollContent} showsVerticalScrollIndicator={true}>
                            {selectedOrder && (
                                <View style={styles.invoiceShotWrap}>
                                    <View style={[styles.invoiceSlip, { backgroundColor: '#fff', borderColor: theme.border }]}>
                                        <Text style={styles.invoiceSlipTitle}>{selectedOrder.workshopName || 'Workshop'}</Text>
                                        <View style={styles.invoiceDivider} />
                                        <Text style={styles.invoiceLabel}>Customer</Text>
                                        <Text style={styles.invoiceValue}>{selectedOrder.customerName}</Text>
                                        {(selectedOrder.customerPhone != null && selectedOrder.customerPhone !== '') && <Text style={styles.invoiceValueSmall}>Phone: {selectedOrder.customerPhone}</Text>}
                                        {(selectedOrder.customerVatNo != null && selectedOrder.customerVatNo !== '') && <Text style={styles.invoiceValueSmall}>VAT: {selectedOrder.customerVatNo}</Text>}
                                        <View style={styles.invoiceDivider} />
                                        <Text style={styles.invoiceLabel}>Vehicle</Text>
                                        <Text style={styles.invoiceValue}>{[selectedOrder.vehicleDetails?.make, selectedOrder.vehicleDetails?.model, selectedOrder.vehicleDetails?.year].filter(Boolean).join(' ')}</Text>
                                        <Text style={styles.invoiceValueSmall}>Plate: {selectedOrder.vehicleDetails?.plate || '-'}</Text>
                                        {(selectedOrder.vehicleDetails?.odometerReading != null && selectedOrder.vehicleDetails.odometerReading !== '') && <Text style={styles.invoiceValueSmall}>Odometer: {selectedOrder.vehicleDetails.odometerReading}</Text>}
                                        <View style={styles.invoiceDivider} />
                                        <Text style={styles.invoiceLabel}>Service & Technician</Text>
                                        <Text style={styles.invoiceValue}>{selectedOrder.serviceType}</Text>
                                        <Text style={styles.invoiceValueSmall}>Technician: {selectedOrder.technicianName}</Text>
                                        <View style={styles.invoiceDivider} />
                                        <Text style={styles.invoiceLabel}>Products</Text>
                                        {(selectedOrder.products && selectedOrder.products.length > 0) ? (
                                            selectedOrder.products.map((p, i) => (
                                                <View key={i} style={styles.invoiceProductRow}>
                                                    <Text style={styles.invoiceProductName}>{p.name} x{p.quantity}</Text>
                                                    <Text style={styles.invoiceProductTotal}>{p.total?.toFixed(2) ?? (p.price != null ? (p.price * p.quantity).toFixed(2) : '0.00')} SAR</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.invoiceValueSmall}>No products</Text>
                                        )}
                                        <View style={styles.invoiceDivider} />
                                        {(selectedOrder.discountAmount != null && selectedOrder.discountAmount > 0) && (
                                            <View style={styles.invoiceTotalRow}>
                                                <Text style={styles.invoiceTotalLabel}>Discount</Text>
                                                <Text style={styles.invoiceTotalValue}>-{selectedOrder.discountAmount.toFixed(2)} SAR</Text>
                                            </View>
                                        )}
                                        {(selectedOrder.taxAmount != null && selectedOrder.taxAmount > 0) && (
                                            <View style={styles.invoiceTotalRow}>
                                                <Text style={styles.invoiceTotalLabel}>Tax</Text>
                                                <Text style={styles.invoiceTotalValue}>{selectedOrder.taxAmount.toFixed(2)} SAR</Text>
                                            </View>
                                        )}
                                        <View style={styles.invoiceTotalRow}>
                                            <Text style={[styles.invoiceTotalLabel, { fontWeight: 'bold', fontSize: 16 }]}>Total</Text>
                                            <Text style={[styles.invoiceTotalValue, { fontWeight: 'bold', fontSize: 16 }]}>{selectedOrder.totalAmount?.toFixed(2) ?? '0.00'} SAR</Text>
                                        </View>
                                        <View style={styles.invoiceDivider} />
                                        <Text style={styles.invoiceValueSmall}>Payment: {(selectedOrder.paymentStatus || 'pending').toUpperCase()}</Text>
                                        <Text style={styles.invoiceValueSmall}>Date: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : new Date().toLocaleString()}</Text>
                                        <Text style={styles.invoiceValueSmall}>Order #{(selectedOrder._id || '').slice(-8)}</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                        {selectedOrder && (
                            <View style={styles.invoiceActions}>
                                <TouchableOpacity style={[styles.invoiceActionBtn, styles.invoiceCheckBtn]} onPress={saveToSalesInvoiceAndDeleteOrder} disabled={saveInvoiceLoading}>
                                    {saveInvoiceLoading ? <ActivityIndicator color="#fff" size="small" /> : <MaterialCommunityIcons name="check-circle" size={28} color="#fff" />}
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.invoiceActionBtn, { backgroundColor: '#25D366' }]} onPress={() => shareInvoice(true)} disabled={invoiceShareLoading}>
                                    {invoiceShareLoading ? <ActivityIndicator color="#fff" size="small" /> : <MaterialCommunityIcons name="whatsapp" size={28} color="#fff" />}
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.invoiceActionBtn, { backgroundColor: '#F4C430' }]} onPress={() => shareInvoice(false)} disabled={invoiceShareLoading}>
                                    {invoiceShareLoading ? <ActivityIndicator color="#1C1C1E" size="small" /> : <MaterialCommunityIcons name="share-variant" size={28} color="#1C1C1E" />}
                                </TouchableOpacity>
                            </View>
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
    generateInvoiceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, marginTop: 16, gap: 8 },
    generateInvoiceBtnText: { fontSize: 16, fontWeight: 'bold' },
    invoiceModalContent: { width: '95%', maxHeight: '90%', padding: 16, borderRadius: 16 },
    invoiceModalContentFixed: { height: '85%', maxHeight: '90%' },
    invoiceScrollView: { flex: 1, minHeight: 0 },
    invoiceScrollContent: { paddingBottom: 20, flexGrow: 1 },
    invoiceShotWrap: { alignSelf: 'stretch' },
    invoiceSlip: { padding: 16, borderRadius: 12, borderWidth: 1 },
    invoiceDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 8 },
    invoiceSlipTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center', marginBottom: 8 },
    invoiceLabel: { fontSize: 12, color: '#666', marginTop: 6, marginBottom: 2 },
    invoiceValue: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
    invoiceValueSmall: { fontSize: 13, color: '#444', marginTop: 2 },
    invoiceProductRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    invoiceProductName: { fontSize: 14, color: '#1C1C1E', flex: 1 },
    invoiceProductTotal: { fontSize: 14, color: '#1C1C1E', fontWeight: '600' },
    invoiceTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    invoiceTotalLabel: { fontSize: 14, color: '#1C1C1E' },
    invoiceTotalValue: { fontSize: 14, color: '#1C1C1E' },
    invoiceActions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', flexWrap: 'wrap' },
    invoiceActionBtn: { flex: 1, minWidth: 56, alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12 },
    invoiceCheckBtn: { backgroundColor: '#22C55E' },
});

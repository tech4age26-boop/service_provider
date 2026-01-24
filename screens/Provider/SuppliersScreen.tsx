import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../constants/api';

interface Supplier {
    _id: string;
    name: string;
    number: string;
    address?: string;
    taxId?: string;
    status?: string;
}



export function SuppliersScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSupplierForDetail, setSelectedSupplierForDetail] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        address: '',
        taxId: '',
    });

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchSuppliers();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchSuppliers = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            // Fetch Suppliers
            const sResponse = await fetch(`${API_BASE_URL}/api/suppliers?providerId=${providerId}`);
            const sResult = await sResponse.json();
            if (sResult.success) {
                setSuppliers(sResult.suppliers || []);
            }

            // Fetch Invoices
            const iResponse = await fetch(`${API_BASE_URL}/api/invoices?providerId=${providerId}`);
            const iResult = await iResponse.json();
            if (iResult.success) {
                setInvoices(iResult.invoices || []);
            }

            // Fetch Expenses
            const eResponse = await fetch(`${API_BASE_URL}/api/expenses?providerId=${providerId}`);
            const eResult = await eResponse.json();
            if (eResult.success) {
                setExpenses(eResult.expenses || []);
            }

        } catch (e) {
            console.error('Fetch Data Error:', e);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.number) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }
        try {
            setIsSaving(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, providerId })
            });
            const result = await response.json();
            if (result.success) {
                setSuppliers([result.supplier, ...suppliers]);
                setFormData({ name: '', number: '', address: '', taxId: '' });
                setShowAddModal(false);
                // Success alert removed as requested
            } else {
                Alert.alert('Error', result.message || 'Failed to add supplier');
            }
        } catch (e) {
            console.error('Add Supplier Error:', e);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSupplier = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                setSuppliers(prev => prev.filter(s => s._id !== id));
            } else {
                Alert.alert('Error', result.message || 'Failed to delete');
            }
        } catch (e) {
            console.error('Delete Supplier Error:', e);
            Alert.alert('Error', 'Network request failed');
        }
    };

    const handleMarkInactive = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'inactive' })
            });
            const result = await response.json();
            if (result.success) {
                setSuppliers(prev => prev.map(s => (s._id === id ? { ...s, status: 'inactive' } : s)));
            } else {
                Alert.alert('Error', result.message || 'Failed to update');
            }
        } catch (e) {
            console.error('Inactive Supplier Error:', e);
            Alert.alert('Error', 'Network request failed');
        }
    };

    const openWhatsApp = (number: string) => {
        const phone = number.replace(/[^\d+]/g, '');
        Linking.openURL(`whatsapp://send?phone=${phone}`);
    };

    const callNumber = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    const renderRightActions = (supplier: Supplier) => (
        <View style={styles.rowActionsRight}>
            <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#25D366' }]} onPress={() => openWhatsApp(supplier.number)}>
                <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#34C759' }]} onPress={() => callNumber(supplier.number)}>
                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderLeftActions = (id: string, status?: string) => (
        <View style={styles.rowActionsLeft}>
            <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: status === 'inactive' ? '#34C759' : '#C7C7CC' }]} onPress={() => handleMarkInactive(id)}>
                <MaterialCommunityIcons name={status === 'inactive' ? "check" : "pause"} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#FF3B30' }]} onPress={() => handleDeleteSupplier(id)}>
                <MaterialCommunityIcons name="delete" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderDetailModal = () => {
        if (!selectedSupplierForDetail) return null;

        const supplierInvoices = invoices.filter(inv => inv.supplierId === selectedSupplierForDetail._id);
        const supplierExpenses = expenses.filter(exp => exp.recipientId === selectedSupplierForDetail._id && exp.paidTo === 'Supplier');

        const totalDebt = supplierInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const totalPaid = supplierExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const outstanding = totalDebt - totalPaid;

        // Combine and sort history
        const history = [
            ...supplierInvoices.map(inv => ({ ...inv, type: 'debt' })),
            ...supplierExpenses.map(exp => ({ ...exp, type: 'payment' }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
            <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedSupplierForDetail.name}</Text>
                                <Text style={{ color: theme.subText }}>{selectedSupplierForDetail.number}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statBox, { borderColor: theme.border }]}>
                                <Text style={styles.statBoxLabel}>Outstanding</Text>
                                <Text style={[styles.statBoxValue, { color: '#FF3B30' }]}>{outstanding.toFixed(2)} SAR</Text>
                            </View>
                            <View style={[styles.statBox, { borderColor: theme.border }]}>
                                <Text style={styles.statBoxLabel}>Paid Amount</Text>
                                <Text style={[styles.statBoxValue, { color: '#2ECC71' }]}>{totalPaid.toFixed(2)} SAR</Text>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Transaction History</Text>

                        {history.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <MaterialCommunityIcons name="file-document-outline" size={50} color={theme.subText} />
                                <Text style={{ color: theme.subText, marginTop: 10 }}>No transactions recorded</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {history.map((item) => (
                                    <View key={item._id} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialCommunityIcons
                                                name={item.type === 'debt' ? "arrow-up-circle" : "arrow-down-circle"}
                                                size={24}
                                                color={item.type === 'debt' ? "#FF3B30" : "#2ECC71"}
                                                style={{ marginRight: 10 }}
                                            />
                                            <View>
                                                <Text style={[styles.historyRef, { color: theme.text }]}>
                                                    {item.type === 'debt' ? `Inv: ${item.referenceNumber}` : (item.description || 'Payment')}
                                                </Text>
                                                <Text style={{ color: theme.subText, fontSize: 12 }}>{new Date(item.date).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.historyAmount, { color: item.type === 'debt' ? theme.text : "#2ECC71" }]}>
                                            {item.type === 'debt' ? '' : '- '}
                                            {(item.totalAmount || item.amount).toFixed(2)} SAR
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Suppliers</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <MaterialCommunityIcons name="plus" size={24} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#F4C430" />
                </View>
            ) : suppliers.filter(s => s.status !== 'inactive').length === 0 && suppliers.filter(s => s.status === 'inactive').length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="truck-outline" size={60} color={theme.subText} />
                    <Text style={{ color: theme.subText, fontSize: 16, marginTop: 10 }}>No suppliers yet</Text>
                    <TouchableOpacity
                        style={[styles.emptyAddBtn, { backgroundColor: '#F4C430' }]}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Text style={styles.emptyAddBtnText}>Add Your First Supplier</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {suppliers.filter(s => s.status !== 'inactive').map((s) => (
                        <Swipeable
                            key={s._id}
                            renderRightActions={() => renderRightActions(s)}
                            renderLeftActions={() => renderLeftActions(s._id, s.status)}
                        >
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => { setSelectedSupplierForDetail(s); setShowDetailModal(true); }}
                            >
                                <View style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                    <View style={styles.itemMain}>
                                        <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                            <MaterialCommunityIcons name="truck" size={24} color="#F4C430" />
                                        </View>
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemName, { color: theme.text }]}>{s.name}</Text>
                                            <Text style={styles.itemSku}>Phone: {s.number}</Text>
                                            {s.address ? (
                                                <Text style={[styles.itemSku]} numberOfLines={1}>Address: {s.address}</Text>
                                            ) : null}
                                        </View>
                                        <View style={styles.itemPriceBox}>
                                            <Text style={[styles.priceLabel, { color: theme.subText }]}>Outstanding</Text>
                                            <Text style={[styles.itemPrice, { color: '#FF3B30' }]}>
                                                {(
                                                    invoices.filter(inv => inv.supplierId === s._id).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) -
                                                    expenses.filter(exp => exp.recipientId === s._id && exp.paidTo === 'Supplier').reduce((sum, exp) => sum + (exp.amount || 0), 0)
                                                ).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Swipeable>
                    ))}

                    {suppliers.filter(s => s.status === 'inactive').length > 0 && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={{ marginBottom: 8, color: theme.subText, fontWeight: '700' }}>Inactive</Text>
                            {suppliers.filter(s => s.status === 'inactive').map((s) => (
                                <Swipeable
                                    key={s._id}
                                    renderRightActions={() => renderRightActions(s)}
                                    renderLeftActions={() => renderLeftActions(s._id, s.status)}
                                >
                                    <View style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                        <View style={styles.itemMain}>
                                            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                                <MaterialCommunityIcons name="truck" size={24} color="#C7C7CC" />
                                            </View>
                                            <View style={styles.itemInfo}>
                                                <Text style={[styles.itemName, { color: theme.text }]}>{s.name}</Text>
                                                <Text style={styles.itemSku}>Phone: {s.number}</Text>
                                                {s.address ? (
                                                    <Text style={[styles.itemSku]} numberOfLines={1}>Address: {s.address}</Text>
                                                ) : null}
                                            </View>
                                            <View style={styles.itemPriceBox}>
                                                <Text style={[styles.priceLabel, { color: theme.subText }]}>Outstanding</Text>
                                                <Text style={[styles.itemPrice, { color: '#FF3B30' }]}>
                                                    {(
                                                        invoices.filter(inv => inv.supplierId === s._id).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) -
                                                        expenses.filter(exp => exp.recipientId === s._id && exp.paidTo === 'Supplier').reduce((sum, exp) => sum + (exp.amount || 0), 0)
                                                    ).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Swipeable>
                            ))}
                        </View>
                    )}
                    <View style={{ height: 80 }} />
                </ScrollView>
            )}

            <Modal
                statusBarTranslucent
                visible={showAddModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Supplier</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Supplier Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="e.g. ABC Trading"
                                    placeholderTextColor={theme.subText}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Phone Number *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    keyboardType="phone-pad"
                                    placeholder="e.g. +9665xxxxxxx"
                                    placeholderTextColor={theme.subText}
                                    value={formData.number}
                                    onChangeText={(text) => setFormData({ ...formData, number: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Address</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Street, City"
                                    placeholderTextColor={theme.subText}
                                    value={formData.address}
                                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Tax ID</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="e.g. 1234567890"
                                    placeholderTextColor={theme.subText}
                                    value={formData.taxId}
                                    onChangeText={(text) => setFormData({ ...formData, taxId: text })}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: '#F4C430' }, isSaving && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#1C1C1E" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Supplier</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            {renderDetailModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: { padding: 4 },
    title: { fontSize: 20, fontWeight: 'bold' },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    scrollContent: { padding: 20 },
    itemCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    itemMain: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    itemSku: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
    itemPriceBox: { alignItems: 'flex-end', flex: 1 },
    priceLabel: { fontSize: 11, marginBottom: 2 },
    itemPrice: { fontSize: 13, fontWeight: 'bold', color: '#2ECC71' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    emptyAddBtn: {
        marginTop: 20,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyAddBtnText: { fontWeight: 'bold', color: '#1C1C1E' },
    content: { padding: 20 },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
    formItem: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        borderWidth: 1,
    },
    saveBtn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    saveBtnText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    supplierName: { fontSize: 15, fontWeight: '600' },
    supplierDetail: { fontSize: 12, marginTop: 2 },
    rowActionsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        height: '100%',
        justifyContent: 'center',
    },
    rowActionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
        height: '100%',
        justifyContent: 'center',
    },
    actionBtnCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statBox: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statBoxLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 5,
    },
    statBoxValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    historyRef: {
        fontSize: 15,
        fontWeight: '600',
    },
    historyAmount: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Supplier {
    _id: string;
    name: string;
    number: string;
    address?: string;
    taxId?: string;
    status?: string;
}

const API_BASE_URL = 'https://filter-server.vercel.app';

export function SuppliersScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        address: '',
        taxId: '',
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/suppliers?providerId=${providerId}`);
            const result = await response.json();
            if (result.success) {
                setSuppliers(result.suppliers || []);
            }
        } catch (e) {
            console.error('Fetch Suppliers Error:', e);
            Alert.alert('Error', 'Failed to load suppliers');
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

    const renderRightActions = (id: string) => (
        <View style={styles.rowActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.inactiveBtn]} onPress={() => handleMarkInactive(id)}>
                <MaterialCommunityIcons name="pause" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteSupplier(id)}>
                <MaterialCommunityIcons name="delete" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }] }>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }] }>
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
                        <Swipeable key={s._id} renderRightActions={() => renderRightActions(s._id)}>
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
                                        {s.taxId ? (
                                            <Text style={[styles.priceLabel, { color: theme.subText }]}>Tax ID</Text>
                                        ) : null}
                                        <Text style={styles.itemPrice}>{s.taxId || ''}</Text>
                                    </View>
                                </View>
                            </View>
                        </Swipeable>
                    ))}

                    {suppliers.filter(s => s.status === 'inactive').length > 0 && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={{ marginBottom: 8, color: theme.subText, fontWeight: '700' }}>Inactive</Text>
                            {suppliers.filter(s => s.status === 'inactive').map((s) => (
                                <Swipeable key={s._id} renderRightActions={() => renderRightActions(s._id)}>
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
                                                {s.taxId ? (
                                                    <Text style={[styles.priceLabel, { color: theme.subText }]}>Tax ID</Text>
                                                ) : null}
                                                <Text style={styles.itemPrice}>{s.taxId || ''}</Text>
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
});

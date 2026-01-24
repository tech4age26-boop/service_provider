/**
 * Provider Dashboard - Inventory Management Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { API_BASE_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

interface InventoryItem {
    _id: string;
    name: string;
    purchasePrice: string | number;
    sellingPrice: string | number;
    stock: string | number;
    sku: string;
    category: string;
    status: 'active' | 'inactive';
    images?: string[];
    unitOfMeasurement?: string;
    taxPercentage?: number;
}



export function InventoryScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [customCategories, setCustomCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        purchasePrice: '',
        sellingPrice: '',
        stock: '',
        sku: '',
        category: 'Filters',
        status: 'active' as 'active' | 'inactive',
        unitOfMeasurement: 'Unit',
        taxPercentage: '',
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [])
    );

    const fetchCategories = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/inventory-categories?providerId=${providerId}&type=product`);
            const result = await response.json();

            if (result.success) {
                setCustomCategories(result.categories);
            }
        } catch (error) {
            console.error('Fetch Categories Error:', error);
        }
    };

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/inventory?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                setItems(result.items);
            }
        } catch (error) {
            console.error('Fetch Inventory Error:', error);
            Alert.alert('Error', 'Failed to load inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.purchasePrice || !formData.sellingPrice || !formData.stock) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setIsSaving(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, providerId }),
            });

            const result = await response.json();

            if (result.success) {
                setItems([result.item, ...items]);
                setShowAddModal(false);
                setFormData({ name: '', purchasePrice: '', sellingPrice: '', stock: '', sku: '', category: 'Filters', status: 'active', unitOfMeasurement: 'Unit', taxPercentage: '' });
                // Success alert removed as requested
            } else {
                Alert.alert('Error', result.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Save Inventory Error:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSaving(false);
        }
    };

    const generateSKU = () => {
        const random = Math.floor(Math.random() * 100000).toString().padStart(6, '0');
        setFormData({ ...formData, sku: `INV-${random}` });
    };

    const handleDeleteItem = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                setItems((prev) => prev.filter((it) => it._id !== id));
            } else {
                Alert.alert('Error', result.message || 'Failed to delete');
            }
        } catch (e) {
            console.error('Delete Inventory Error:', e);
            Alert.alert('Error', 'Network request failed');
        }
    };

    const handleMarkInactive = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'inactive' })
            });
            const result = await response.json();
            if (result.success) {
                setItems((prev) => prev.map((it) => (it._id === id ? { ...it, status: 'inactive' } : it)));
            } else {
                Alert.alert('Error', result.message || 'Failed to update status');
            }
        } catch (e) {
            console.error('Inactive Inventory Error:', e);
            Alert.alert('Error', 'Network request failed');
        }
    };

    const handleMarkActive = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' })
            });
            const result = await response.json();
            if (result.success) {
                setItems((prev) => prev.map((it) => (it._id === id ? { ...it, status: 'active' } : it)));
            } else {
                Alert.alert('Error', result.message || 'Failed to update status');
            }
        } catch (e) {
            console.error('Activate Inventory Error:', e);
            Alert.alert('Error', 'Network request failed');
        }
    };

    const renderRightActions = (itemId: string, status?: string) => (
        <View style={styles.rowActions}>
            {status === 'inactive' ? (
                <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#34C759' }]} onPress={() => handleMarkActive(itemId)}>
                    <MaterialCommunityIcons name="check" size={20} color="#fff" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#C7C7CC' }]} onPress={() => handleMarkInactive(itemId)}>
                    <MaterialCommunityIcons name="pause" size={20} color="#fff" />
                </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtnCircle, { backgroundColor: '#FF3B30' }]} onPress={() => handleDeleteItem(itemId)}>
                <MaterialCommunityIcons name="delete" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Inventory</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]} onPress={() => navigation.navigate('AddInvoice')}>
                        <MaterialCommunityIcons name="file-document-plus" size={24} color="#F4C430" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                        <MaterialCommunityIcons name="plus" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#F4C430" />
                </View>
            ) : items.filter(i => i.status !== 'inactive').length === 0 && items.filter(i => i.status === 'inactive').length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="package-variant-closed" size={60} color={theme.subText} />
                    <Text style={{ color: theme.subText, fontSize: 16, marginTop: 10 }}>Your inventory is empty</Text>
                    <TouchableOpacity
                        style={[styles.emptyAddBtn, { backgroundColor: '#F4C430' }]}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Text style={styles.emptyAddBtnText}>Add Your First Product</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Active Items */}
                    {items.filter(i => i.status !== 'inactive').map((item) => (
                        <Swipeable key={item._id} renderRightActions={() => renderRightActions(item._id, 'active')}>
                            <View style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                <View style={styles.itemMain}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                        <MaterialCommunityIcons name="package-variant" size={24} color="#F4C430" />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={styles.itemSku}>SKU: {item.sku} | {item.category}</Text>
                                        <View style={styles.stockRow}>
                                            <Text style={[styles.stockText, { color: Number(item.stock) < 10 ? '#FF3B30' : theme.subText }]}>
                                                In Stock: {item.stock}{item.unitOfMeasurement ? ` ${item.unitOfMeasurement}` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.itemPriceBox}>
                                        <Text style={[styles.priceLabel, { color: theme.subText }]}>Purchase: {item.purchasePrice} SAR</Text>
                                        <Text style={styles.itemPrice}>Selling: {item.sellingPrice} SAR</Text>
                                    </View>
                                </View>
                            </View>
                        </Swipeable>
                    ))}

                    {/* Inactive Section */}
                    {items.filter(i => i.status === 'inactive').length > 0 && (
                        <View style={{ marginTop: 12 }}>
                            <Text style={{ marginBottom: 8, color: theme.subText, fontWeight: '700' }}>Inactive</Text>
                            {items.filter(i => i.status === 'inactive').map((item) => (
                                <Swipeable key={item._id} renderRightActions={() => renderRightActions(item._id, 'inactive')}>
                                    <View style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                        <View style={styles.itemMain}>
                                            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                                <MaterialCommunityIcons name="package-variant" size={24} color="#C7C7CC" />
                                            </View>
                                            <View style={styles.itemInfo}>
                                                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                                <Text style={styles.itemSku}>SKU: {item.sku} | {item.category}</Text>
                                                <View style={styles.stockRow}>
                                                    <Text style={[styles.stockText, { color: theme.subText }]}>
                                                        In Stock: {item.stock}{item.unitOfMeasurement ? ` ${item.unitOfMeasurement}` : ''}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.itemPriceBox}>
                                                <Text style={[styles.priceLabel, { color: theme.subText }]}>Purchase: {item.purchasePrice} SAR</Text>
                                                <Text style={styles.itemPrice}>Selling: {item.sellingPrice} SAR</Text>
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

            {/* Add Inventory Modal */}
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
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Product</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Product Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="e.g. Synthetic Oil 5W30"
                                    placeholderTextColor={theme.subText}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                                <View style={styles.categoryRow}>
                                    {[
                                        'Filters', 'Brake Pads', 'Fluids', 'Other',
                                        ...customCategories.map(c => c.name)
                                    ].map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.catChip,
                                                { borderColor: theme.border, backgroundColor: formData.category === cat ? '#F4C430' : 'transparent' }
                                            ]}
                                            onPress={() => setFormData({ ...formData, category: cat })}
                                        >
                                            <Text style={[styles.catChipText, { color: formData.category === cat ? '#000' : theme.text }]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formItem, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.text }]}>Purchase Price *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                        placeholder="0.00"
                                        placeholderTextColor={theme.subText}
                                        keyboardType="numeric"
                                        value={formData.purchasePrice}
                                        onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
                                    />
                                </View>
                                <View style={[styles.formItem, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={[styles.label, { color: theme.text }]}>Selling Price *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                        placeholder="0.00"
                                        placeholderTextColor={theme.subText}
                                        keyboardType="numeric"
                                        value={formData.sellingPrice}
                                        onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Stock Quantity *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="0"
                                    placeholderTextColor={theme.subText}
                                    keyboardType="numeric"
                                    value={formData.stock}
                                    onChangeText={(text) => setFormData({ ...formData, stock: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Unit of Measurement</Text>
                                <View style={styles.categoryRow}>
                                    {['Unit', 'Box', 'Liter', 'Pack', 'Piece'].map((unit) => (
                                        <TouchableOpacity
                                            key={unit}
                                            style={[
                                                styles.catChip,
                                                { borderColor: theme.border, backgroundColor: formData.unitOfMeasurement === unit ? '#F4C430' : 'transparent' }
                                            ]}
                                            onPress={() => setFormData({ ...formData, unitOfMeasurement: unit })}
                                        >
                                            <Text style={[styles.catChipText, { color: formData.unitOfMeasurement === unit ? '#000' : theme.text }]}>{unit}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Tax Percentage</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="e.g. 15"
                                    placeholderTextColor={theme.subText}
                                    keyboardType="numeric"
                                    value={formData.taxPercentage}
                                    onChangeText={(text) => setFormData({ ...formData, taxPercentage: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>SKU / Product Code</Text>
                                <View style={styles.skuRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.border, marginBottom: 0 }]}
                                        placeholder="Enter or Generate"
                                        placeholderTextColor={theme.subText}
                                        value={formData.sku}
                                        onChangeText={(text) => setFormData({ ...formData, sku: text })}
                                    />
                                    <TouchableOpacity
                                        style={[styles.genBtn, { backgroundColor: '#F4C430' }]}
                                        onPress={generateSKU}
                                    >
                                        <Text style={styles.genBtnText}>Generate</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: '#F4C430' }, isSaving && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#1C1C1E" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Add Product to Inventory</Text>
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
    stockRow: { flexDirection: 'row', alignItems: 'center' },
    stockText: { fontSize: 13, fontWeight: '600' },
    itemPriceBox: { alignItems: 'flex-end', flex: 1 },
    priceLabel: { fontSize: 11, marginBottom: 2 },
    itemPrice: { fontSize: 13, fontWeight: 'bold', color: '#2ECC71' },
    rowActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
    },
    actionBtnCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
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
    formItem: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        borderWidth: 1,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    catChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    catChipText: { fontSize: 13, fontWeight: '600' },
    skuRow: { flexDirection: 'row', gap: 10 },
    genBtn: {
        borderRadius: 12,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genBtnText: { fontSize: 13, fontWeight: 'bold' },
    saveBtn: {
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    emptyAddBtn: {
        marginTop: 20,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyAddBtnText: { fontWeight: 'bold', color: '#1C1C1E' },
});

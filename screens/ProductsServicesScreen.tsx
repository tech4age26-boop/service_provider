/**
 * Provider Dashboard - Products & Services Screen
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Service {
    id: string;
    name: string;
    price: string;
    duration: string;
    category: 'service' | 'product';
}

import { useTheme } from '../App';

export function ProductsServicesScreen() {
    const { theme } = useTheme();
    const [items, setItems] = useState<Service[]>([
        { id: '1', name: 'Oil Change', price: '$50', duration: '30 mins', category: 'service' },
        { id: '2', name: 'Brake Pads', price: '$120', duration: '1 hour', category: 'product' },
        { id: '3', name: 'Tire Rotation', price: '$30', duration: '20 mins', category: 'service' },
        { id: '4', name: 'Air Filter', price: '$25', duration: '-', category: 'product' },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'services' | 'products'>('all');
    const [newItem, setNewItem] = useState({ name: '', price: '', duration: '', category: 'service' as 'service' | 'product' });

    const filteredItems = items.filter(item => {
        if (activeTab === 'all') return true;
        if (activeTab === 'services') return item.category === 'service';
        if (activeTab === 'products') return item.category === 'product';
        return true;
    });

    const handleAddItem = () => {
        if (newItem.name && newItem.price) {
            const item: Service = {
                id: Date.now().toString(),
                name: newItem.name,
                price: newItem.price,
                duration: newItem.duration || '-',
                category: newItem.category,
            };
            setItems([...items, item]);
            setNewItem({ name: '', price: '', duration: '', category: 'service' });
            setShowAddModal(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>Products & Services</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}>
                    <MaterialCommunityIcons name="plus" size={20} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'all' && styles.activeTabText,
                        activeTab !== 'all' && { color: theme.subText }
                    ]}>
                        All ({items.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'services' && styles.activeTab]}
                    onPress={() => setActiveTab('services')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'services' && styles.activeTabText,
                        activeTab !== 'services' && { color: theme.subText }
                    ]}>
                        Services
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'products' && styles.activeTab]}
                    onPress={() => setActiveTab('products')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'products' && styles.activeTabText,
                        activeTab !== 'products' && { color: theme.subText }
                    ]}>
                        Products
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Items List */}
            <ScrollView style={styles.content}>
                {filteredItems.map((item) => (
                    <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.itemHeader}>
                            <View style={styles.itemInfo}>
                                <MaterialCommunityIcons
                                    name={item.category === 'service' ? 'wrench' : 'package-variant'}
                                    size={24}
                                    color="#F4C430"
                                />
                                <View style={styles.itemDetails}>
                                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={styles.itemDuration}>
                                        {item.category === 'service' ? `Duration: ${item.duration}` : 'Product'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.itemPrice}>{item.price}</Text>
                        </View>
                        <View style={[styles.itemActions, { borderTopColor: theme.border }]}>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.background }]}>
                                <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
                                <Text style={styles.actionBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: theme.background }]}>
                                <MaterialCommunityIcons name="delete" size={18} color="#FF3B30" />
                                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add Modal */}
            <Modal
                visible={showAddModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Item</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Category Selection */}
                        <View style={styles.categoryContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryBtn,
                                    { borderColor: theme.border },
                                    newItem.category === 'service' && styles.categoryBtnActive
                                ]}
                                onPress={() => setNewItem({ ...newItem, category: 'service' })}>
                                <MaterialCommunityIcons
                                    name="wrench"
                                    size={20}
                                    color={newItem.category === 'service' ? '#F4C430' : theme.subText}
                                />
                                <Text style={[
                                    styles.categoryText,
                                    { color: theme.subText },
                                    newItem.category === 'service' && styles.categoryTextActive
                                ]}>
                                    Service
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.categoryBtn,
                                    { borderColor: theme.border },
                                    newItem.category === 'product' && styles.categoryBtnActive
                                ]}
                                onPress={() => setNewItem({ ...newItem, category: 'product' })}>
                                <MaterialCommunityIcons
                                    name="package-variant"
                                    size={20}
                                    color={newItem.category === 'product' ? '#F4C430' : theme.subText}
                                />
                                <Text style={[
                                    styles.categoryText,
                                    { color: theme.subText },
                                    newItem.category === 'product' && styles.categoryTextActive
                                ]}>
                                    Product
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }
                            ]}
                            placeholder="Name"
                            placeholderTextColor={theme.subText}
                            value={newItem.name}
                            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                        />
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }
                            ]}
                            placeholder="Price (e.g., $50)"
                            placeholderTextColor={theme.subText}
                            value={newItem.price}
                            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                        />
                        {newItem.category === 'service' && (
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }
                                ]}
                                placeholder="Duration (e.g., 30 mins)"
                                placeholderTextColor={theme.subText}
                                value={newItem.duration}
                                onChangeText={(text) => setNewItem({ ...newItem, duration: text })}
                            />
                        )}

                        <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
                            <Text style={styles.saveButtonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 4,
        margin: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#F4C430',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#1C1C1E',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    itemCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemDetails: {
        marginLeft: 12,
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    itemDuration: {
        fontSize: 13,
        color: '#8E8E93',
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        gap: 6,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    deleteBtn: {
        backgroundColor: '#FFE5E5',
    },
    deleteBtnText: {
        color: '#FF3B30',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    categoryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        gap: 8,
    },
    categoryBtnActive: {
        borderColor: '#F4C430',
        backgroundColor: '#FFF9E6',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    categoryTextActive: {
        color: '#1C1C1E',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    saveButton: {
        backgroundColor: '#F4C430',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
});

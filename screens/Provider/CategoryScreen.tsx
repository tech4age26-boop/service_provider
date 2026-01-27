/**
 * Provider Dashboard - Category Management Screen
 */

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';

const API_BASE_URL = 'https://filter-server.vercel.app';

export function CategoryScreen({ navigation }: any) {
    const { theme } = useTheme();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [catType, setCatType] = useState<'product' | 'service'>('product');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/inventory-categories?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                setCategories(result.categories);
            }
        } catch (error) {
            console.error('Fetch Categories Error:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newCatName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        try {
            setIsSaving(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/inventory-categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId,
                    name: newCatName.trim(),
                    type: catType,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setCategories([result.category, ...categories]);
                setShowAddModal(false);
                setNewCatName('');
                Alert.alert('Success', 'Category added');
            } else {
                Alert.alert('Error', result.message || 'Failed to add category');
            }
        } catch (error) {
            console.error('Save Category Error:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/inventory-categories/${id}`, {
                                method: 'DELETE'
                            });
                            const result = await response.json();
                            if (result.success) {
                                setCategories(categories.filter(c => c._id !== id));
                            } else {
                                Alert.alert('Error', result.message || 'Failed to delete');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete category');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Manage Categories</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <MaterialCommunityIcons name="plus" size={24} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#F4C430" />
                </View>
            ) : categories.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="tag-outline" size={60} color={theme.subText} />
                    <Text style={{ color: theme.subText, fontSize: 16, marginTop: 10 }}>No custom categories yet</Text>
                    <TouchableOpacity
                        style={[styles.emptyAddBtn, { backgroundColor: '#F4C430' }]}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Text style={styles.emptyAddBtnText}>Add Your First Category</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {categories.map((cat) => (
                        <View key={cat._id} style={[styles.catCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.catInfo}>
                                <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                    <MaterialCommunityIcons name={cat.type === 'service' ? "wrench" : "package-variant"} size={20} color="#F4C430" />
                                </View>
                                <View>
                                    <Text style={[styles.catName, { color: theme.text }]}>{cat.name}</Text>
                                    <Text style={[styles.catTypeText, { color: theme.subText }]}>{cat.type === 'service' ? 'Service' : 'Product'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(cat._id, cat.name)}>
                                <MaterialCommunityIcons name="delete-outline" size={22} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <View style={{ height: 80 }} />
                </ScrollView>
            )}

            {/* Add Modal */}
            <Modal
                transparent
                visible={showAddModal}
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>New Category</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Category Name"
                            placeholderTextColor={theme.subText}
                            value={newCatName}
                            onChangeText={setNewCatName}
                            autoFocus
                        />

                        <Text style={[styles.typeLabel, { color: theme.text }]}>Category Type:</Text>
                        <View style={styles.typeSelector}>
                            {(['product', 'service'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.typeBtn,
                                        { borderColor: theme.border },
                                        catType === t && { backgroundColor: theme.tint, borderColor: theme.tint }
                                    ]}
                                    onPress={() => setCatType(t)}
                                >
                                    <MaterialCommunityIcons
                                        name={t === 'service' ? "wrench" : "package-variant"}
                                        size={18}
                                        color={catType === t ? '#000' : theme.subText}
                                    />
                                    <Text style={[styles.typeBtnText, { color: catType === t ? '#000' : theme.text }]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>


                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.background }]}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#F4C430' }]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? <ActivityIndicator size="small" color="#000" /> : <Text style={[styles.modalBtnText, { color: '#000' }]}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    catCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    catInfo: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    catName: { fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', padding: 25, borderRadius: 24, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', borderRadius: 12, padding: 15, borderWidth: 1, marginBottom: 20, fontSize: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBtnText: { fontWeight: 'bold' },
    emptyAddBtn: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    emptyAddBtnText: { fontWeight: 'bold', color: '#1C1C1E' },
    catTypeText: { fontSize: 12, marginTop: 2 },
    typeLabel: { width: '100%', fontSize: 14, fontWeight: '600', marginBottom: 10 },
    typeSelector: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 25 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8 },
    typeBtnText: { fontSize: 14, fontWeight: '600' },
});

/**
 * Provider Dashboard - Department Management Screen
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
import { API_BASE_URL } from '../../constants/api';



export function DepartmentScreen({ navigation }: any) {
    const { theme } = useTheme();
    const [departments, setDepartments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/departments?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                setDepartments(result.departments);
            }
        } catch (error) {
            console.error('Fetch Departments Error:', error);
            Alert.alert('Error', 'Failed to load departments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newDeptName.trim()) {
            Alert.alert('Error', 'Please enter a department name');
            return;
        }

        try {
            setIsSaving(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId,
                    name: newDeptName.trim(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                setDepartments([result.department, ...departments]);
                setShowAddModal(false);
                setNewDeptName('');
                Alert.alert('Success', 'Department added');
            } else {
                Alert.alert('Error', result.message || 'Failed to add department');
            }
        } catch (error) {
            console.error('Save Department Error:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        Alert.alert(
            'Delete Department',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
                                method: 'DELETE'
                            });
                            const result = await response.json();
                            if (result.success) {
                                setDepartments(departments.filter(d => d._id !== id));
                            } else {
                                Alert.alert('Error', result.message || 'Failed to delete');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete department');
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
                <Text style={[styles.title, { color: theme.text }]}>Manage Departments</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <MaterialCommunityIcons name="plus" size={24} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#F4C430" />
                </View>
            ) : departments.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="office-building" size={60} color={theme.subText} />
                    <Text style={{ color: theme.subText, fontSize: 16, marginTop: 10 }}>No departments yet</Text>
                    <TouchableOpacity
                        style={[styles.emptyAddBtn, { backgroundColor: '#F4C430' }]}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Text style={styles.emptyAddBtnText}>Add Your First Department</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {departments.map((dept) => (
                        <View key={dept._id} style={[styles.deptCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.deptInfo}>
                                <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                    <MaterialCommunityIcons name="office-building" size={20} color="#F4C430" />
                                </View>
                                <View>
                                    <Text style={[styles.deptName, { color: theme.text }]}>{dept.name}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(dept._id, dept.name)}>
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
                        <Text style={[styles.modalTitle, { color: theme.text }]}>New Department</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Department Name"
                            placeholderTextColor={theme.subText}
                            value={newDeptName}
                            onChangeText={setNewDeptName}
                            autoFocus
                        />

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
    deptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    deptInfo: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    deptName: { fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', padding: 25, borderRadius: 24, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', borderRadius: 12, padding: 15, borderWidth: 1, marginBottom: 20, fontSize: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBtnText: { fontWeight: 'bold' },
    emptyAddBtn: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    emptyAddBtnText: { fontWeight: 'bold', color: '#1C1C1E' },
});

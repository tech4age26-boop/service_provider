/**
 * Provider Dashboard - Employees Screen
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
    Image,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { API_BASE_URL } from '../../constants/api';

interface Employee {
    _id: string; // From MongoDB
    id?: string; // Legacy/UI
    name: string;
    number: string;
    employeeType: string;
    password?: string;
    salary: string;
    commission: string;
    status: 'active' | 'inactive';
    avatar?: string;
}



const EMPLOYEE_ROLES = ['Technician', 'Cashier'];
const { width } = Dimensions.get('window');

// --- Reusable Components ---

const FormLabel = ({ text, required, theme }: { text: string, required?: boolean, theme: any }) => (
    <Text style={[styles.label, { color: theme.text }]}>
        {text} {required && <Text style={{ color: '#FF3B30' }}>*</Text>}
    </Text>
);

const FormInput = ({
    label,
    required,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    theme
}: any) => (
    <View style={{ marginBottom: 16 }}>
        <FormLabel text={label} required={required} theme={theme} />
        <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, marginBottom: 0 }]}
            placeholder={placeholder}
            placeholderTextColor={theme.inputPlaceholder || '#999'}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
        />
    </View>
);

const DetailRow = ({ icon, label, value, theme }: any) => (
    <View style={styles.detailRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            <MaterialCommunityIcons name={icon} size={20} color={theme.subText} style={{ marginRight: 8 }} />
            <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
        </View>
        <Text style={[styles.detailValue, { color: theme.text }]}>{value || '-'}</Text>
    </View>
);

// --- Custom Alert Modal ---
const CustomAlert = ({ visible, title, message, buttons, onClose, theme }: any) => (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={[styles.customAlertContainer, { backgroundColor: theme.cardBackground }]}>
                {title && <Text style={[styles.customAlertTitle, { color: theme.text }]}>{title}</Text>}
                {message && <Text style={[styles.customAlertMessage, { color: theme.subText }]}>{message}</Text>}

                <View style={[styles.customAlertButtonsContainer]}>
                    {buttons.map((btn: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.customAlertButton,
                                // Dynamic background for different styles
                                { backgroundColor: btn.style === 'destructive' ? '#FFE5E5' : (btn.style === 'cancel' ? theme.background : theme.background) },
                                index > 0 && { marginTop: 8 }
                            ]}
                            onPress={() => {
                                if (btn.onPress) btn.onPress();
                                else onClose();
                            }}>
                            <Text style={[
                                styles.customAlertButtonText,
                                { color: btn.style === 'destructive' ? '#FF3B30' : (btn.style === 'cancel' ? theme.subText : '#007AFF'), fontWeight: btn.style === 'cancel' ? '600' : 'bold' }
                            ]}>
                                {btn.text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    </Modal>
);

import { useNavigation } from '@react-navigation/native';

export function ProviderEmployeesScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();


    // --- State ---
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [workshopId, setWorkshopId] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Custom Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', buttons: [] as any[] });

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);

    const initialFormState: Partial<Employee> = {
        name: '',
        number: '',
        employeeType: '',
        password: '',
        salary: '0',
        commission: '0',
        status: 'active',
        avatar: undefined,
    };

    const [newEmployee, setNewEmployee] = useState<Partial<Employee>>(initialFormState);

    // --- API Interactions ---

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadEmployees();
        });
        return unsubscribe;
    }, [navigation]);

    const loadEmployees = async () => {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            if (userData) {
                const user = JSON.parse(userData);
                const wId = user.id || user._id;
                setWorkshopId(wId);

                // Fetch Employees
                const empResponse = await fetch(`${API_BASE_URL}/api/employees?workshopId=${wId}`);
                const empResult = await empResponse.json();
                if (empResult.success) {
                    setEmployees(empResult.data);
                }

                // Fetch Expenses
                const expResponse = await fetch(`${API_BASE_URL}/api/expenses?providerId=${wId}`);
                const expResult = await expResponse.json();
                if (expResult.success) {
                    setExpenses(expResult.expenses || []);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Actions ---

    // Helper to show custom alert
    const showAlert = (title: string, message: string, buttons: any[]) => {
        setAlertConfig({ title, message, buttons });
        setAlertVisible(true);
    };

    const closeAlert = () => {
        setAlertVisible(false);
    };

    const handleImagePick = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
        if (result.assets && result.assets.length > 0) {
            setNewEmployee({ ...newEmployee, avatar: result.assets[0].uri });
        }
    };

    const removeImage = () => {
        setNewEmployee({ ...newEmployee, avatar: undefined });
    };

    const validateForm = () => {
        const missingFields: string[] = [];
        const invalidFields: string[] = [];

        if (!newEmployee.name) missingFields.push('Name');
        if (!newEmployee.number) missingFields.push('Phone Number');
        if (!newEmployee.employeeType) missingFields.push('Employee Type');
        if (!isEditing && !newEmployee.password) missingFields.push('Password');

        // Salary Validation
        if (newEmployee.salary === undefined || newEmployee.salary === '') {
            missingFields.push('Salary');
        } else if (isNaN(Number(newEmployee.salary)) || Number(newEmployee.salary) < 0) {
            invalidFields.push('Salary must be a valid number');
        }

        // Commission Validation
        if (newEmployee.commission !== undefined && newEmployee.commission !== '') {
            if (isNaN(Number(newEmployee.commission)) || Number(newEmployee.commission) < 0 || Number(newEmployee.commission) > 100) {
                invalidFields.push('Commission must be between 0 and 100');
            }
        }

        if (missingFields.length > 0) {
            showAlert('Missing Fields', `Please fill the following required fields:\n\n${missingFields.join('\n')}`, [{ text: 'OK', onPress: closeAlert }]);
            return false;
        }

        if (invalidFields.length > 0) {
            showAlert('Invalid Input', `Please correct the following errors:\n\n${invalidFields.join('\n')}`, [{ text: 'OK', onPress: closeAlert }]);
            return false;
        }

        return true;
    };

    const handleSaveEmployee = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const endpoint = isEditing ? `${API_BASE_URL}/api/employees/${newEmployee._id}` : `${API_BASE_URL}/api/employees`;
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                ...newEmployee,
                workshopId: workshopId,
                salary: newEmployee.salary?.toString(),
                commission: newEmployee.commission?.toString(),
            };

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                setShowAddModal(false);
                setNewEmployee(initialFormState);
                setIsEditing(false);
                loadEmployees(); // Refresh list
                Alert.alert('Success', isEditing ? 'Employee updated' : 'Employee added');
            } else {
                Alert.alert('Error', result.message || 'Action failed');
            }
        } catch (error) {
            console.error('Save employee error:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditStart = (employee: Employee) => {
        setNewEmployee({ ...employee });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDelete = (id: string, fromDetail: boolean = false) => {
        if (fromDetail) setShowDetailModal(false);
        closeAlert();

        setTimeout(() => {
            showAlert('Delete Employee', 'Are you sure you want to delete this employee?', [
                { text: 'Cancel', style: 'cancel', onPress: () => { if (fromDetail) setShowDetailModal(true); closeAlert(); } },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
                                method: 'DELETE',
                            });
                            const result = await response.json();
                            if (result.success) {
                                setEmployees(employees.filter(e => e._id !== id));
                                closeAlert();
                            } else {
                                Alert.alert('Error', result.message || 'Delete failed');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network request failed');
                        }
                    }
                }
            ]);
        }, 100);
    };

    const handleShowOptions = (employee: Employee) => {
        showAlert(
            'Employee Options',
            `Manage ${employee.name}`,
            [
                { text: 'Edit', onPress: () => { closeAlert(); handleEditStart(employee); } },
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(employee._id) },
                { text: 'Cancel', style: 'cancel', onPress: closeAlert },
            ]
        );
    };

    const openAddModal = () => {
        setNewEmployee(initialFormState);
        setIsEditing(false);
        setShowAddModal(true);
    };

    const openDetailModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
    };

    const handleCall = (phoneNumber: string) => {
        if (!phoneNumber) return;
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        const url = `tel:${cleanNumber}`;
        Linking.openURL(url).catch(err => {
            console.error('An error occurred', err);
            Alert.alert('Error', 'Could not open phone dialer');
        });
    };

    const handleWhatsApp = (phoneNumber: string) => {
        if (!phoneNumber) return;
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        // Default Saudi prefix if 10 digits starting with 05 or 9 digits starting with 5
        let waNumber = cleanNumber;
        if (cleanNumber.length === 10 && cleanNumber.startsWith('05')) {
            waNumber = `966${cleanNumber.substring(1)}`;
        } else if (cleanNumber.length === 9 && cleanNumber.startsWith('5')) {
            waNumber = `966${cleanNumber}`;
        }

        const url = `https://wa.me/${waNumber}`;
        Linking.openURL(url).catch(err => {
            console.error('An error occurred', err);
            Alert.alert('Error', 'Could not open WhatsApp');
        });
    };

    if (isLoading && employees.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.tint} />
                <Text style={{ color: theme.subText, marginTop: 12 }}>Loading Employees...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('employees.title')}</Text>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <MaterialCommunityIcons name="plus" size={20} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {employees.length === 0 ? (
                    <View style={{ marginTop: 60, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="account-group-outline" size={80} color={theme.border} />
                        <Text style={{ color: theme.subText, marginTop: 16, fontSize: 16 }}>No employees registered yet</Text>
                    </View>
                ) : employees.map((employee) => (
                    <TouchableOpacity
                        key={employee._id}
                        style={[styles.employeeCard, { backgroundColor: theme.cardBackground }]}
                        onPress={() => openDetailModal(employee)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.employeeInfo}>
                            <View style={styles.avatarContainer}>
                                {employee.avatar ? (
                                    <Image source={{ uri: employee.avatar as string }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
                                        <MaterialCommunityIcons name="account" size={24} color={theme.subText} />
                                    </View>
                                )}
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: employee.status === 'active' ? '#2ECC71' : '#999', borderColor: theme.cardBackground }
                                ]} />
                            </View>
                            <View style={styles.employeeDetails}>
                                <Text style={[styles.employeeName, { color: theme.text }]} numberOfLines={1}>{employee.name}</Text>
                                <Text style={styles.employeeRole}>{employee.employeeType}</Text>
                            </View>
                        </View>
                        {/* Actions: Phone, WhatsApp, AND 3-Dots */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.background }]}
                                onPress={() => handleCall(employee.number)}
                            >
                                <MaterialCommunityIcons name="phone" size={20} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.background }]}
                                onPress={() => handleWhatsApp(employee.number)}
                            >
                                <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[{ alignSelf: 'center' }]} onPress={() => handleShowOptions(employee)}>
                                <MaterialCommunityIcons name="dots-vertical" size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal statusBarTranslucent visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{isEditing ? t('common.edit') : t('common.add')} {t('employees.name')}</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {/* Profile Picture */}
                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <TouchableOpacity onPress={handleImagePick} style={{ position: 'relative' }}>
                                    {newEmployee.avatar ? (
                                        <Image source={{ uri: newEmployee.avatar }} style={styles.modalAvatar} />
                                    ) : (
                                        <View style={[styles.modalAvatar, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.border }]}>
                                            <MaterialCommunityIcons name="camera-plus" size={32} color={theme.subText} />
                                        </View>
                                    )}
                                    {newEmployee.avatar && (
                                        <TouchableOpacity style={styles.removeAvatarBtn} onPress={removeImage}>
                                            <MaterialCommunityIcons name="close" size={14} color="#FFF" />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                                <Text style={{ color: theme.subText, marginTop: 8 }}>Profile Picture (Optional)</Text>
                            </View>

                            {/* Status */}
                            <View style={[styles.formRow, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }]}>
                                <FormLabel text={`Status: ${newEmployee.status === 'active' ? 'Active' : 'Inactive'}`} theme={theme} />
                                <Switch
                                    value={newEmployee.status === 'active'}
                                    onValueChange={(val) => setNewEmployee({ ...newEmployee, status: val ? 'active' : 'inactive' })}
                                    trackColor={{ false: "#767577", true: "#F4C430" }}
                                    thumbColor={"#FFFFFF"}
                                />
                            </View>

                            <FormInput label="Full Name" required value={newEmployee.name} onChangeText={(text: string) => setNewEmployee({ ...newEmployee, name: text })} placeholder="e.g. John Doe" theme={theme} />

                            <FormInput label="Phone Number" required value={newEmployee.number} onChangeText={(text: string) => setNewEmployee({ ...newEmployee, number: text })} placeholder="e.g. 5xxxxxxx" keyboardType="phone-pad" theme={theme} />

                            <FormInput label="Account Password" required={!isEditing} value={newEmployee.password} onChangeText={(text: string) => setNewEmployee({ ...newEmployee, password: text })} placeholder={isEditing ? "(Leave blank to keep current)" : "Enter login password"} theme={theme} />

                            {/* Role Dropdown */}
                            <View style={{ marginBottom: 16 }}>
                                <FormLabel text="Employee Type" required theme={theme} />
                                <TouchableOpacity
                                    style={[styles.dropdownSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
                                    onPress={() => setIsRoleOpen(!isRoleOpen)}>
                                    <Text style={{ color: newEmployee.employeeType ? theme.text : theme.subText }}>{newEmployee.employeeType || 'Select Role'}</Text>
                                    <MaterialCommunityIcons name={isRoleOpen ? "chevron-up" : "chevron-down"} size={20} color={theme.subText} />
                                </TouchableOpacity>

                                {isRoleOpen && (
                                    <View style={[styles.dropdownList, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        {EMPLOYEE_ROLES.map((role) => (
                                            <TouchableOpacity
                                                key={role}
                                                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                onPress={() => { setNewEmployee({ ...newEmployee, employeeType: role }); setIsRoleOpen(false); }}>
                                                <Text style={{ color: theme.text }}>{role}</Text>
                                                {newEmployee.employeeType === role && <MaterialCommunityIcons name="check" size={16} color="#F4C430" />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <FormInput label="Salary (SAR)" required value={newEmployee.salary} onChangeText={(text: string) => setNewEmployee({ ...newEmployee, salary: text })} placeholder="0.00" keyboardType="numeric" theme={theme} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormInput label="Commission (%)" value={newEmployee.commission} onChangeText={(text: string) => setNewEmployee({ ...newEmployee, commission: text })} placeholder="0" keyboardType="numeric" theme={theme} />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
                                onPress={handleSaveEmployee}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#1C1C1E" />
                                ) : (
                                    <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Employee'}</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Detail Modal */}
            <Modal statusBarTranslucent visible={showDetailModal} transparent={true} animationType="fade" onRequestClose={() => setShowDetailModal(false)}>
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    {selectedEmployee && (
                        <View style={[styles.detailModalContent, { backgroundColor: theme.cardBackground }]}>
                            <View style={styles.detailHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {selectedEmployee.avatar ? (
                                        <Image source={{ uri: selectedEmployee.avatar as string }} style={styles.detailAvatar} />
                                    ) : (
                                        <View style={[styles.detailAvatar, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
                                            <MaterialCommunityIcons name="account" size={40} color={theme.subText} />
                                        </View>
                                    )}
                                    <View style={{ marginLeft: 16, flex: 1 }}>
                                        <Text style={[styles.detailTitle, { color: theme.text, width: '80%' }]}>{selectedEmployee.name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: selectedEmployee.status === 'active' ? '#E8F5E9' : '#FFEBEE' }]}>
                                            <Text style={[styles.statusText, { color: selectedEmployee.status === 'active' ? '#2ECC71' : '#FF3B30' }]}>
                                                {selectedEmployee.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.detailSection}>
                                    <View style={styles.detailRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', width: 100 }}>
                                            <MaterialCommunityIcons name="phone-outline" size={20} color={theme.subText} style={{ marginRight: 8 }} />
                                            <Text style={[styles.detailLabel, { color: theme.subText }]}>Phone</Text>
                                        </View>
                                        <Text style={[styles.detailValue, { color: theme.text, marginRight: 8 }]}>{selectedEmployee.number}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TouchableOpacity onPress={() => handleCall(selectedEmployee.number)} style={styles.miniActionBtn}>
                                                <MaterialCommunityIcons name="phone" size={18} color="#007AFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleWhatsApp(selectedEmployee.number)} style={styles.miniActionBtn}>
                                                <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <DetailRow icon="briefcase-outline" label="Role" value={selectedEmployee.employeeType} theme={theme} />
                                    <DetailRow icon="cash" label="Salary" value={`${selectedEmployee.salary} SAR`} theme={theme} />
                                    <DetailRow icon="percent-outline" label="Commission" value={`${selectedEmployee.commission || '0'} %`} theme={theme} />

                                    {/* Financial Summary */}
                                    <View style={{ marginTop: 20, padding: 15, borderRadius: 12, backgroundColor: theme.background }}>
                                        <Text style={{ fontWeight: 'bold', color: theme.text, marginBottom: 10 }}>Payment Summary</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text style={{ color: theme.subText }}>Salary Paid:</Text>
                                            <Text style={{ color: '#2ECC71', fontWeight: 'bold' }}>
                                                {expenses.filter(e => e.recipientId === selectedEmployee._id && e.category === 'Salaries').reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)} SAR
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ color: theme.subText }}>Advance Given:</Text>
                                            <Text style={{ color: '#F4C430', fontWeight: 'bold' }}>
                                                {expenses.filter(e => e.recipientId === selectedEmployee._id && e.category === 'Advance').reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)} SAR
                                            </Text>
                                        </View>
                                    </View>

                                    {/* History */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                                        <Text style={{ fontWeight: 'bold', color: theme.text }}>Payment History</Text>
                                        <View style={{ backgroundColor: theme.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ fontSize: 10, color: theme.subText }}>Last 10 Records</Text>
                                        </View>
                                    </View>

                                    {expenses.filter(e => e.recipientId === selectedEmployee._id).length === 0 ? (
                                        <View style={{ padding: 20, alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="cash-remove" size={40} color={theme.subText} />
                                            <Text style={{ color: theme.subText, fontSize: 12, marginTop: 8 }}>No payments found for this employee</Text>
                                        </View>
                                    ) : (
                                        expenses.filter(e => e.recipientId === selectedEmployee._id)
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .slice(0, 10) // Show only last 10
                                            .map((exp, idx) => (
                                                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: exp.category === 'Salaries' ? '#E8F5E9' : '#FFF3E0', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                                            <MaterialCommunityIcons
                                                                name={exp.category === 'Salaries' ? "cash" : "hand-coin"}
                                                                size={18}
                                                                color={exp.category === 'Salaries' ? '#2ECC71' : '#F4C430'}
                                                            />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{exp.category}</Text>
                                                            <Text style={{ color: theme.subText, fontSize: 12 }}>{exp.description || 'No description'}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ alignItems: 'flex-end' }}>
                                                        <Text style={{ color: theme.text, fontWeight: 'bold' }}>{exp.amount.toFixed(2)} SAR</Text>
                                                        <Text style={{ color: theme.subText, fontSize: 10 }}>{new Date(exp.date).toLocaleDateString()}</Text>
                                                    </View>
                                                </View>
                                            ))
                                    )}
                                </View>
                            </ScrollView>

                            <View style={[styles.detailActions, { borderTopColor: theme.border }]}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: theme.background }]}
                                    onPress={() => {
                                        setShowDetailModal(false);
                                        handleEditStart(selectedEmployee);
                                    }}>
                                    <MaterialCommunityIcons name="pencil" size={20} color="#007AFF" />
                                    <Text style={styles.actionBtnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: theme.background }]}
                                    onPress={() => handleDelete(selectedEmployee._id, true)}>
                                    <MaterialCommunityIcons name="delete" size={20} color="#FF3B30" />
                                    <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            {/* Custom Alert Modal */}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={closeAlert}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4C430', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, paddingHorizontal: 20 },
    employeeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    employeeInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarContainer: { position: 'relative', marginRight: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    statusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFF' },
    employeeDetails: { flex: 1 },
    employeeName: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
    employeeRole: { fontSize: 14, color: '#8E8E93', marginBottom: 2 },
    employeeSalary: { fontSize: 12, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 8 },
    actionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
    modalAvatar: { width: 100, height: 100, borderRadius: 50 },
    removeAvatarBtn: { position: 'absolute', top: 0, right: 0, backgroundColor: '#FF3B30', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Form Styles
    input: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    saveButton: { backgroundColor: '#F4C430', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
    saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    formRow: { flexDirection: 'row' },
    dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    dropdownList: { borderRadius: 12, borderWidth: 1, marginBottom: 16, maxHeight: 200 },
    dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },

    // Detail Modal
    detailModalContent: { backgroundColor: '#FFFFFF', padding: 24, margin: 20, borderRadius: 24, maxHeight: '80%', width: width - 40, alignSelf: 'center' },
    detailHeader: { marginBottom: 20 },
    detailAvatar: { width: 80, height: 80, borderRadius: 40 },
    detailTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    closeBtn: { position: 'absolute', top: 0, right: 0 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    detailSection: { marginBottom: 20 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    detailLabel: { fontSize: 14, fontWeight: '600' },
    detailValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
    detailActions: { flexDirection: 'row', gap: 12, paddingTop: 20, borderTopWidth: 1 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: '#F0F0F0', gap: 6 },
    actionBtnText: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
    deleteBtn: { backgroundColor: '#FFE5E5' },
    deleteBtnText: { color: '#FF3B30' },

    // Custom Alert Styles
    customAlertContainer: { width: '85%', borderRadius: 16, padding: 20, alignItems: 'center' },
    customAlertTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    customAlertMessage: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
    customAlertButtonsContainer: { width: '100%' },
    customAlertButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    customAlertButtonText: { fontSize: 16 },
    miniActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
});
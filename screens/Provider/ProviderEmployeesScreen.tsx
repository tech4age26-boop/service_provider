/**
 * Provider Dashboard - Employees Screen
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
    Image,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

interface Employee {

    id: string;
    name: string;
    role: string;
    salary: string;
    status: 'active' | 'inactive';
    avatar?: string;
}

const EMPLOYEE_ROLES = ['Cashier', 'Technician', 'Senior Technician', 'Assistant', 'Electrician'];
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

export function ProviderEmployeesScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();


    // --- State ---
    const [employees, setEmployees] = useState<Employee[]>([
        { id: '1', name: 'Ahmed Ali', role: 'Senior Mechanic', salary: '5000', status: 'active', avatar: undefined }, // Using undefined for default icon logic if we don't have local assets
        { id: '2', name: 'Mohammed Hassan', role: 'Technician', salary: '4000', status: 'active', avatar: undefined },
        { id: '3', name: 'Khalid Omar', role: 'Assistant', salary: '3000', status: 'active', avatar: undefined },
        { id: '4', name: 'Youssef Ibrahim', role: 'Electrician', salary: '4500', status: 'inactive', avatar: undefined },
    ]);

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
        role: '',
        salary: '',
        status: 'active',
        avatar: undefined,
    };

    const [newEmployee, setNewEmployee] = useState<Partial<Employee>>(initialFormState);

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
        if (!newEmployee.role) missingFields.push('Employee Type');

        // Salary Validation
        if (!newEmployee.salary) {
            missingFields.push('Salary');
        } else if (isNaN(Number(newEmployee.salary)) || Number(newEmployee.salary) < 0) {
            invalidFields.push('Salary must be a valid number');
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

    const handleSaveEmployee = () => {
        if (!validateForm()) return;

        if (isEditing) {
            setEmployees(employees.map(emp => emp.id === newEmployee.id ? { ...emp, ...newEmployee } as Employee : emp));
        } else {
            const employee: Employee = {
                id: Date.now().toString(),
                name: newEmployee.name!,
                role: newEmployee.role!,
                salary: newEmployee.salary!,
                status: newEmployee.status || 'active',
                avatar: newEmployee.avatar,
            };
            setEmployees([...employees, employee]);
        }

        setShowAddModal(false);
        setNewEmployee(initialFormState);
        setIsEditing(false);
    };

    const handleEditStart = (employee: Employee) => {
        setNewEmployee({ ...employee });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDelete = (id: string, fromDetail: boolean = false) => {
        // Close detail modal first if open to avoid overlay issues, usually not needed with state but safer visually
        if (fromDetail) setShowDetailModal(false);
        closeAlert(); // Close menu alert if open

        setTimeout(() => {
            showAlert('Delete Employee', 'Are you sure you want to delete this employee?', [
                { text: 'Cancel', style: 'cancel', onPress: () => { if (fromDetail) setShowDetailModal(true); closeAlert(); } }, // Re-open detail if cancelled from detail? Optional.
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setEmployees(employees.filter(e => e.id !== id));
                        closeAlert();
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
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(employee.id) },
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
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {employees.map((employee) => (
                    <TouchableOpacity
                        key={employee.id}
                        style={[styles.employeeCard, { backgroundColor: theme.cardBackground }]}
                        onPress={() => openDetailModal(employee)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.employeeInfo}>
                            <View style={styles.avatarContainer}>
                                {employee.avatar ? (
                                    <Image source={{ uri: employee.avatar }} style={styles.avatar} />
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
                                <Text style={[styles.employeeName, { color: theme.text }]}>{employee.name}</Text>
                                <Text style={styles.employeeRole}>{employee.role}</Text>
                            </View>
                        </View>
                        {/* Actions: Phone, Message, AND 3-Dots */}
                        <View style={styles.actions}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.background }]}>
                                <MaterialCommunityIcons name="phone" size={20} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.background }]}>
                                <MaterialCommunityIcons name="message" size={20} color="#007AFF" />
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

                            {/* Role Dropdown */}
                            <View style={{ marginBottom: 16 }}>
                                <FormLabel text="Employee Type" required theme={theme} />
                                <TouchableOpacity
                                    style={[styles.dropdownSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
                                    onPress={() => setIsRoleOpen(!isRoleOpen)}>
                                    <Text style={{ color: newEmployee.role ? theme.text : theme.subText }}>{newEmployee.role || 'Select Role'}</Text>
                                    <MaterialCommunityIcons name={isRoleOpen ? "chevron-up" : "chevron-down"} size={20} color={theme.subText} />
                                </TouchableOpacity>

                                {isRoleOpen && (
                                    <View style={[styles.dropdownList, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        {EMPLOYEE_ROLES.map((role) => (
                                            <TouchableOpacity
                                                key={role}
                                                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                onPress={() => { setNewEmployee({ ...newEmployee, role: role }); setIsRoleOpen(false); }}>
                                                <Text style={{ color: theme.text }}>{role}</Text>
                                                {newEmployee.role === role && <MaterialCommunityIcons name="check" size={16} color="#F4C430" />}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <FormInput label="Salary (SAR)" required value={newEmployee.salary} onChangeText={(text: string) => setNewEmployee({ ...newEmployee, salary: text })} placeholder="0.00" keyboardType="numeric" theme={theme} />

                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmployee}>
                                <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Employee'}</Text>
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
                                        <Image source={{ uri: selectedEmployee.avatar }} style={styles.detailAvatar} />
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
                                    <DetailRow icon="briefcase-outline" label="Role" value={selectedEmployee.role} theme={theme} />
                                    <DetailRow icon="cash" label="Salary" value={`${selectedEmployee.salary} SAR`} theme={theme} />
                                    <DetailRow icon="card-account-details-outline" label="ID" value={`EMP-${selectedEmployee.id}`} theme={theme} />
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
                                    onPress={() => handleDelete(selectedEmployee.id, true)}>
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
    detailModalContent: { backgroundColor: '#FFFFFF', padding: 24, margin: 20, borderRadius: 24, maxHeight: '80%', width: width - 40, alignSelf: 'center', bottom: '10%' },
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
});
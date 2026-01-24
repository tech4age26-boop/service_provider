import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://filter-server.vercel.app';

interface Expense {
    _id: string;
    amount: number;
    description: string;
    paidTo: string;
    date: string;
    category: string;
}

export function ExpensesScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [expenseDate, setExpenseDate] = useState(new Date());

    // Selection Modal State
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [selectionType, setSelectionType] = useState<'paidTo' | 'category' | 'recipient'>('paidTo');
    const [selectionOptions, setSelectionOptions] = useState<any[]>([]);

    // Data lists for selection
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paidTo: '',
        category: '',
        customCategory: '',
        recipientId: '',
        recipientName: ''
    });

    const paidToOptions = ['Employee', 'Supplier', 'Customer', 'Others'];
    const operationalOptions = ['Salaries', 'Advance', 'Outstanding', 'Rent', 'Utilities', 'Maintenance', 'Personal', 'Others'];

    const handleOpenPicker = (type: 'paidTo' | 'category' | 'recipient') => {
        setSelectionType(type);
        if (type === 'paidTo') {
            setSelectionOptions(paidToOptions);
        } else if (type === 'category') {
            if (formData.paidTo === 'Supplier') {
                setSelectionOptions(['Outstanding']);
            } else {
                setSelectionOptions(operationalOptions);
            }
        } else if (type === 'recipient') {
            if (formData.paidTo === 'Supplier') {
                setSelectionOptions(allSuppliers.map(s => ({ id: s._id, name: s.name })));
            } else if (formData.paidTo === 'Employee') {
                setSelectionOptions(allEmployees.map(e => ({ id: e._id, name: e.name })));
            }
        }
        setShowSelectionModal(true);
    };

    const handleSelectOption = (option: any) => {
        if (selectionType === 'paidTo') {
            const opt = typeof option === 'string' ? option : option.name;
            let newCategory = formData.category;
            if (opt === 'Supplier') newCategory = 'Outstanding';

            setFormData({
                ...formData,
                paidTo: opt,
                category: newCategory,
                customCategory: '',
                recipientId: '',
                recipientName: ''
            });
        } else if (selectionType === 'category') {
            const opt = typeof option === 'string' ? option : option.name;
            setFormData({ ...formData, category: opt, customCategory: opt === 'Others' ? formData.customCategory : '' });
        } else if (selectionType === 'recipient') {
            setFormData({ ...formData, recipientId: option.id, recipientName: option.name });
        }
        setShowSelectionModal(false);
    };

    const renderSelectionModal = () => (
        <Modal visible={showSelectionModal} transparent animationType="fade">
            <TouchableOpacity
                style={styles.selectionOverlay}
                activeOpacity={1}
                onPress={() => setShowSelectionModal(false)}
            >
                <View style={[styles.selectionContent, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.selectionTitle, { color: theme.text }]}>
                        {selectionType === 'paidTo' ? 'Select Paid To Whom' :
                            selectionType === 'recipient' ? `Select ${formData.paidTo}` :
                                'Select Operational Expenses'}
                    </Text>
                    <ScrollView>
                        {selectionOptions.map((opt) => {
                            const name = typeof opt === 'string' ? opt : opt.name;
                            const id = typeof opt === 'string' ? opt : opt.id;
                            const isSelected = selectionType === 'recipient' ? formData.recipientId === id :
                                selectionType === 'paidTo' ? formData.paidTo === name :
                                    formData.category === name;

                            return (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.optionItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handleSelectOption(opt)}
                                >
                                    <Text style={[styles.optionText, { color: theme.text }]}>{name}</Text>
                                    {isSelected && (
                                        <MaterialCommunityIcons name="check" size={20} color="#F4C430" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = currentMonth.toLocaleString('default', { month: 'long' });

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return (
            <Modal transparent visible={showCalendar} animationType="fade">
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <View style={[styles.calendarContainer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month - 1))}>
                                <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
                            </TouchableOpacity>
                            <Text style={[styles.calendarMonthYear, { color: theme.text }]}>{monthName} {year}</Text>
                            <TouchableOpacity onPress={() => setCurrentMonth(new Date(year, month + 1))}>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.daysHeader}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <Text key={d} style={styles.dayLabel}>{d}</Text>
                            ))}
                        </View>
                        <View style={styles.daysGrid}>
                            {days.map((day, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.dayButton,
                                        day === null && { opacity: 0 },
                                        day !== null && expenseDate.getDate() === day && expenseDate.getMonth() === month && expenseDate.getFullYear() === year && { backgroundColor: '#F4C430', borderRadius: 20 }
                                    ]}
                                    disabled={day === null}
                                    onPress={() => {
                                        if (day) {
                                            setExpenseDate(new Date(year, month, day));
                                            setShowCalendar(false);
                                        }
                                    }}
                                >
                                    <Text style={[styles.dayText, { color: day === null ? 'transparent' : theme.text }]}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeCalendarBtn} onPress={() => setShowCalendar(false)}>
                            <Text style={{ color: '#F4C430', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchExpenses();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            // Fetch Expenses
            const expResponse = await fetch(`${API_BASE_URL}/api/expenses?providerId=${providerId}`);
            const expResult = await expResponse.json();
            if (expResult.success) {
                setExpenses(expResult.expenses || []);
            }

            // Fetch Suppliers
            const supResponse = await fetch(`${API_BASE_URL}/api/suppliers?providerId=${providerId}`);
            const supResult = await supResponse.json();
            if (supResult.success) {
                setAllSuppliers(supResult.suppliers || []);
            }

            // Fetch Employees
            const empResponse = await fetch(`${API_BASE_URL}/api/employees?workshopId=${providerId}`);
            const empResult = await empResponse.json();
            if (empResult.success) {
                setAllEmployees(empResult.data || []);
            }

        } catch (e) {
            console.error('Fetch Data Error:', e);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveExpense = async () => {
        if (!formData.amount || !formData.description || !formData.paidTo || !formData.category) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if ((formData.paidTo === 'Supplier' || formData.paidTo === 'Employee') && !formData.recipientId) {
            Alert.alert('Error', `Please select a ${formData.paidTo}`);
            return;
        }

        try {
            setIsSaving(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    category: formData.category === 'Others' ? formData.customCategory : formData.category,
                    providerId,
                    date: expenseDate.toISOString()
                })
            });

            const result = await response.json();
            if (result.success) {
                setExpenses([result.expense, ...expenses]);
                setShowAddModal(false);
                setFormData({
                    amount: '',
                    description: '',
                    paidTo: '',
                    category: '',
                    customCategory: '',
                    recipientId: '',
                    recipientName: ''
                });
                setExpenseDate(new Date());
            } else {
                Alert.alert('Error', result.message || 'Failed to save expense');
            }
        } catch (e) {
            console.error('Save Expense Error:', e);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                setExpenses(prev => prev.filter(e => e._id !== id));
            }
        } catch (e) {
            console.error('Delete Expense Error:', e);
        }
    };

    const renderRightActions = (id: string) => (
        <View style={styles.rowActions}>
            <TouchableOpacity
                style={[styles.actionBtnCircle, { backgroundColor: '#FF3B30' }]}
                onPress={() => {
                    Alert.alert('Delete', 'Are you sure?', [
                        { text: 'Cancel' },
                        { text: 'Delete', onPress: () => handleDeleteExpense(id), style: 'destructive' }
                    ]);
                }}
            >
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
                <Text style={[styles.title, { color: theme.text }]}>Expenses</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <MaterialCommunityIcons name="plus" size={24} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#F4C430" />
                </View>
            ) : expenses.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="cash-remove" size={60} color={theme.subText} />
                    <Text style={{ color: theme.subText, fontSize: 16, marginTop: 10 }}>No expenses found</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {expenses.map((expense) => (
                        <Swipeable key={expense._id} renderRightActions={() => renderRightActions(expense._id)}>
                            <View style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                <View style={styles.itemMain}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                        <MaterialCommunityIcons name="cash" size={24} color="#F4C430" />
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, { color: theme.text }]}>{expense.description}</Text>
                                        <Text style={styles.itemSub}>{expense.paidTo} | {expense.category}</Text>
                                        <Text style={styles.itemDate}>{new Date(expense.date).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={styles.itemPriceBox}>
                                        <Text style={styles.itemPrice}>{expense.amount.toFixed(2)} SAR</Text>
                                    </View>
                                </View>
                            </View>
                        </Swipeable>
                    ))}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            {/* Add Expense Modal */}
            <Modal visible={showAddModal} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Expense</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Amount (SAR) *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="0.00"
                                    placeholderTextColor={theme.subText}
                                    keyboardType="numeric"
                                    value={formData.amount}
                                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="e.g. Electricity Bill"
                                    placeholderTextColor={theme.subText}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                />
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Paid To Whom *</Text>
                                <TouchableOpacity
                                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]}
                                    onPress={() => handleOpenPicker('paidTo')}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: formData.paidTo ? theme.text : theme.subText }}>
                                            {formData.paidTo || "Select who was paid"}
                                        </Text>
                                        <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {(formData.paidTo === 'Supplier' || formData.paidTo === 'Employee') && (
                                <View style={styles.formItem}>
                                    <Text style={[styles.label, { color: theme.text }]}>Select {formData.paidTo} *</Text>
                                    <TouchableOpacity
                                        style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]}
                                        onPress={() => handleOpenPicker('recipient')}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: formData.recipientId ? theme.text : theme.subText }}>
                                                {formData.recipientName || `Select specific ${formData.paidTo}`}
                                            </Text>
                                            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
                                <TouchableOpacity
                                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]}
                                    onPress={() => setShowCalendar(true)}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: theme.text }}>{expenseDate.toLocaleDateString()}</Text>
                                        <MaterialCommunityIcons name="calendar" size={20} color={theme.subText} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formItem}>
                                <Text style={[styles.label, { color: theme.text }]}>
                                    {formData.paidTo === 'Supplier' ? 'Payment Type' : 'Operational Expenses *'}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' },
                                        formData.paidTo === 'Supplier' && { opacity: 0.8 }
                                    ]}
                                    onPress={() => formData.paidTo !== 'Supplier' && handleOpenPicker('category')}
                                    activeOpacity={formData.paidTo === 'Supplier' ? 1 : 0.7}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: formData.category ? theme.text : theme.subText }}>
                                            {formData.category || "Select operational expense"}
                                        </Text>
                                        {formData.paidTo !== 'Supplier' && (
                                            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {formData.category === 'Others' && (
                                <View style={styles.formItem}>
                                    <Text style={[styles.label, { color: theme.text }]}>Custom Operational Expense Name *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                        placeholder="Enter custom expense name"
                                        placeholderTextColor={theme.subText}
                                        value={formData.customCategory}
                                        onChangeText={(text) => setFormData({ ...formData, customCategory: text })}
                                    />
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: '#F4C430', opacity: isSaving ? 0.7 : 1 }]}
                                onPress={handleSaveExpense}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#1C1C1E" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Expense</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            {renderCalendar()}
            {renderSelectionModal()}
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
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    itemDate: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
    itemPriceBox: { alignItems: 'flex-end' },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF3B30' },
    rowActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        height: '100%',
    },
    actionBtnCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    formItem: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        borderWidth: 1,
    },
    suggestionRow: {
        flexDirection: 'row',
        marginTop: 8,
        flexWrap: 'wrap',
        gap: 8
    },
    suggestionChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    calendarContainer: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        alignSelf: 'center',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    calendarMonthYear: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    dayLabel: {
        color: '#8E8E93',
        fontSize: 12,
        width: 30,
        textAlign: 'center',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayButton: {
        width: '14.28%',
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    dayText: {
        fontSize: 14,
    },
    closeCalendarBtn: {
        alignItems: 'center',
        marginTop: 15,
        padding: 10,
    },
    selectionOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionContent: {
        width: '85%',
        maxHeight: '60%',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    selectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 16,
    },
});

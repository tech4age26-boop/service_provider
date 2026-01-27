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
import { API_BASE_URL } from '../../constants/api';

const { width, height } = Dimensions.get('window');



interface Supplier {
    _id: string;
    name: string;
    number: string;
}

interface Product {
    _id: string;
    name: string;
    sellingPrice: string | number;
    purchasePrice: string | number;
    stock: string | number;
    sku: string;
    unitOfMeasurement?: string;
    taxRate?: number;
}

interface InvoiceItem {
    productId: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    taxRate: number; // Percentage
    taxAmount: number;
    taxableAmount: number;
    total: number; // Subtotal including tax
    unit: string;
    sellingPrice: number; // To calculate profit
}

interface Invoice {
    _id: string;
    referenceNumber: string;
    date: string;
    supplierId: string;
    totalAmount: number;
    taxAmount: number;
    discount: number;
    items: InvoiceItem[];
}

export function AddInvoiceScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // List State
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    // Form State
    const [referenceNumber, setReferenceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [isFilterCalendar, setIsFilterCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [discount, setDiscount] = useState('0');

    // Filter State
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [showSupplierModal, setShowSupplierModal] = useState(false);

    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [showProductModal, setShowProductModal] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchInitialData();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) {
                console.error('No user data found in storage');
                setIsLoading(false);
                return;
            }
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            if (!providerId) {
                console.error('No providerId found in user data');
                setIsLoading(false);
                return;
            }

            // Fetch Suppliers
            try {
                const res = await fetch(`${API_BASE_URL}/api/suppliers?providerId=${providerId}`);
                const data = await res.json();
                if (data.success) setSuppliers(data.suppliers || []);
            } catch (e) {
                console.error('Fetch Suppliers Error:', e);
            }

            // Fetch Invoices
            try {
                const res = await fetch(`${API_BASE_URL}/api/invoices?providerId=${providerId}`);
                const data = await res.json();
                if (data.success) setInvoices(data.invoices || []);
            } catch (e) {
                console.error('Fetch Invoices Error:', e);
            }

            // Fetch Inventory & Products
            let combinedProducts: Product[] = [];
            try {
                const res = await fetch(`${API_BASE_URL}/api/inventory?providerId=${providerId}`);
                const data = await res.json();
                if (data.success) combinedProducts = [...(data.items || [])];
            } catch (e) {
                console.error('Fetch Inventory Error:', e);
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/products?providerId=${providerId}`);
                const data = await res.json();
                if (data.success) {
                    const pItems = (data.items || []).filter((i: any) => i.category === 'product');
                    pItems.forEach((p: any) => {
                        if (!combinedProducts.find(cp => cp._id === (p._id || p.id))) {
                            combinedProducts.push({
                                _id: p._id || p.id,
                                name: p.name,
                                sellingPrice: p.sellingPrice || p.price || 0,
                                purchasePrice: p.purchasePrice || 0,
                                stock: p.stock || 0,
                                sku: p.sku || '',
                                unitOfMeasurement: p.unitOfMeasurement || 'Pcs',
                                taxRate: p.taxRate || 15
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('Fetch Products Error:', e);
            }

            try {
                const eRes = await fetch(`${API_BASE_URL}/api/expenses?providerId=${providerId}`);
                const eData = await eRes.json();
                if (eData.success) setExpenses(eData.expenses || []);
            } catch (e) {
                console.error('Fetch Expenses Error:', e);
            }

            setAllProducts(combinedProducts);

        } catch (error) {
            console.error('General Fetch Error:', error);
            Alert.alert('Connection Error', 'Please check your internet connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/invoices?providerId=${providerId}`);
            const result = await response.json();
            if (result.success) {
                setInvoices(result.invoices || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddProduct = (product: Product) => {
        const exists = invoiceItems.find(item => item.productId === product._id);
        if (exists) {
            Alert.alert('Already Added', 'This product is already in the invoice.');
            return;
        }

        const qty = 1;
        const price = Number(product.purchasePrice) || 0;
        const taxRate = Number(product.taxRate) || 15;
        const taxableAmount = qty * price;
        const taxAmount = (taxableAmount * taxRate) / 100;

        const newItem: InvoiceItem = {
            productId: product._id,
            name: product.name,
            quantity: qty,
            purchasePrice: price,
            taxRate: taxRate,
            taxAmount: taxAmount,
            taxableAmount: taxableAmount,
            total: taxableAmount + taxAmount,
            unit: product.unitOfMeasurement || 'Pcs',
            sellingPrice: Number(product.sellingPrice) || 0
        };

        setInvoiceItems([...invoiceItems, newItem]);
        setShowProductModal(false);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...invoiceItems];
        const item = { ...newItems[index] };

        if (field === 'quantity') item.quantity = Number(value) || 0;
        else if (field === 'purchasePrice') item.purchasePrice = Number(value) || 0;
        else if (field === 'taxRate') item.taxRate = Number(value) || 0;

        item.taxableAmount = item.quantity * item.purchasePrice;
        item.taxAmount = (item.taxableAmount * item.taxRate) / 100;
        item.total = item.taxableAmount + item.taxAmount;

        newItems[index] = item;
        setInvoiceItems(newItems);
    };

    const removeItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const calculateTotalExclVAT = () => invoiceItems.reduce((sum, item) => sum + item.taxableAmount, 0);
    const calculateTotalVAT = () => invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const calculateNetProfit = () => invoiceItems.reduce((sum, item) => {
        const profitPerUnit = item.sellingPrice - item.purchasePrice;
        return sum + (profitPerUnit * item.quantity);
    }, 0);

    const totalExclVAT = calculateTotalExclVAT();
    const discountVal = Number(discount) || 0;
    const totalAfterDiscount = totalExclVAT - discountVal;
    const totalVAT = calculateTotalVAT();
    const grandTotal = totalAfterDiscount + totalVAT;
    const totalProfit = calculateNetProfit();

    const handleSaveInvoice = async () => {
        if (!referenceNumber || !selectedSupplier || invoiceItems.length === 0) {
            Alert.alert('Error', 'Please fill reference number, select a supplier and add at least one product.');
            return;
        }

        try {
            setIsSaving(true);
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            const providerId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId,
                    supplierId: selectedSupplier._id,
                    referenceNumber,
                    date: invoiceDate.toISOString(),
                    items: invoiceItems,
                    totalExclVAT,
                    discount: discountVal,
                    taxAmount: totalVAT,
                    totalAmount: grandTotal,
                    netProfit: totalProfit
                })
            });

            const result = await response.json();
            if (result.success) {
                Alert.alert('Success', 'Invoice added successfully');
                setShowAddModal(false);
                resetForm();
                fetchInvoices();
            } else {
                Alert.alert('Error', result.message || 'Failed to save invoice');
            }
        } catch (error) {
            console.error('Save Invoice Error:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setReferenceNumber('');
        setInvoiceDate(new Date());
        setSelectedSupplier(null);
        setInvoiceItems([]);
        setDiscount('0');
    };

    const getSupplierName = (id: string) => suppliers.find(s => s._id === id)?.name || 'Unknown Supplier';

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
                <View style={styles.modalOverlay}>
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
                                        day !== null && invoiceDate.getDate() === day && invoiceDate.getMonth() === month && invoiceDate.getFullYear() === year && { backgroundColor: '#F4C430', borderRadius: 20 }
                                    ]}
                                    disabled={day === null}
                                    onPress={() => {
                                        if (day) {
                                            const selected = new Date(year, month, day);
                                            if (isFilterCalendar) {
                                                setFilterDate(selected);
                                            } else {
                                                setInvoiceDate(selected);
                                            }
                                            setShowCalendar(false);
                                            setIsFilterCalendar(false);
                                        }
                                    }}
                                >
                                    <Text style={[styles.dayText, { color: day === null ? 'transparent' : theme.text }]}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeCalendarBtn} onPress={() => { setShowCalendar(false); setIsFilterCalendar(false); }}>
                            <Text style={{ color: '#F4C430', fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderRightActions = (invoice: Invoice) => (
        <View style={styles.rowActions}>
            <TouchableOpacity
                style={styles.actionBtnCircle}
                onPress={() => { setSelectedInvoice(invoice); setShowDetailModal(true); }}
            >
                <MaterialCommunityIcons name="eye" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderLeftActions = (invoice: Invoice) => (
        <View style={styles.rowActions}>
            <TouchableOpacity
                style={[styles.actionBtnCircle, { backgroundColor: '#FF3B30' }]}
                onPress={() => {
                    Alert.alert('Delete Invoice', 'Are you sure you want to delete this invoice?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}`, {
                                        method: 'DELETE'
                                    });
                                    const result = await response.json();
                                    if (result.success) {
                                        setInvoices(prev => prev.filter(i => i._id !== invoice._id));
                                    } else {
                                        Alert.alert('Error', result.message || 'Failed to delete invoice');
                                    }
                                } catch (error) {
                                    console.error('Delete Invoice Error:', error);
                                    Alert.alert('Error', 'Network request failed');
                                }
                            }
                        }
                    ]);
                }}
            >
                <MaterialCommunityIcons name="delete" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#F4C430" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Purchase Invoices</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: filterDate ? '#F4C430' : theme.background, borderWidth: 1, borderColor: theme.border }]}
                        onPress={() => {
                            if (filterDate) {
                                setFilterDate(null);
                            } else {
                                setIsFilterCalendar(true);
                                setShowCalendar(true);
                            }
                        }}
                    >
                        <MaterialCommunityIcons
                            name={filterDate ? "calendar-remove" : "calendar-search"}
                            size={24}
                            color={filterDate ? '#fff' : theme.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                        <MaterialCommunityIcons name="plus" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* List Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {invoices
                    .filter(inv => !filterDate || new Date(inv.date).toDateString() === filterDate.toDateString())
                    .length === 0 ? (
                    <View style={styles.center}>
                        <MaterialCommunityIcons name="file-document-outline" size={60} color={theme.subText} />
                        <Text style={{ color: theme.subText, fontSize: 16, marginTop: 10 }}>No invoices found</Text>

                    </View>
                ) : (
                    invoices
                        .filter(inv => !filterDate || new Date(inv.date).toDateString() === filterDate.toDateString())
                        .map((invoice) => (
                            <Swipeable
                                key={invoice._id}
                                renderRightActions={() => renderRightActions(invoice)}
                                renderLeftActions={() => renderLeftActions(invoice)}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => { setSelectedInvoice(invoice); setShowDetailModal(true); }}
                                >
                                    <View style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                        <View style={styles.itemMain}>
                                            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                                <MaterialCommunityIcons name="file-document" size={24} color="#F4C430" />
                                            </View>
                                            <View style={styles.itemInfo}>
                                                <Text style={[styles.itemName, { color: theme.text }]}>{invoice.referenceNumber}</Text>
                                                <Text style={styles.itemSku}>{getSupplierName(invoice.supplierId)}</Text>
                                                <View style={{ marginTop: 2 }}>
                                                    <Text style={{ fontSize: 10, color: '#FF3B30' }}>
                                                        Out: {(
                                                            invoices.filter(inv => inv.supplierId === invoice.supplierId).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) -
                                                            expenses.filter(exp => exp.recipientId === invoice.supplierId && exp.paidTo === 'Supplier').reduce((sum, exp) => sum + (exp.amount || 0), 0)
                                                        ).toFixed(2)} SAR
                                                    </Text>
                                                </View>
                                                <View style={styles.stockRow}>
                                                    <MaterialCommunityIcons name="calendar" size={14} color={theme.subText} style={{ marginRight: 4 }} />
                                                    <Text style={[styles.stockText, { color: theme.subText }]}>
                                                        {new Date(invoice.date).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.itemPriceBox}>
                                                <Text style={[styles.priceLabel, { color: theme.subText }]}>Total</Text>
                                                <Text style={styles.itemPrice}>{invoice.totalAmount.toFixed(2)} SAR</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Swipeable>
                        ))
                )}
            </ScrollView>

            {/* Add Invoice Modal (The Form) */}
            <Modal visible={showAddModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Invoice</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.75 }}>
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.label, { color: theme.text, fontSize: 11 }]}>Ref Number</Text>
                                        <TextInput
                                            style={[styles.input, { height: 45, padding: 10, fontSize: 13, backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                            placeholder="INV-XXXX"
                                            value={referenceNumber}
                                            onChangeText={setReferenceNumber}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.label, { color: theme.text, fontSize: 11 }]}>Date</Text>
                                        <TouchableOpacity
                                            style={[styles.input, { height: 45, padding: 10, backgroundColor: theme.background, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                                            onPress={() => { setIsFilterCalendar(false); setShowCalendar(true); }}
                                        >
                                            <Text style={{ fontSize: 12, color: theme.text }}>{invoiceDate.toLocaleDateString()}</Text>
                                            <MaterialCommunityIcons name="calendar" size={16} color="#F4C430" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formItem}>
                                    <Text style={[styles.label, { color: theme.text }]}>Supplier</Text>
                                    <TouchableOpacity
                                        style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                                        onPress={() => setShowSupplierModal(true)}
                                    >
                                        <Text style={{ color: selectedSupplier ? theme.text : theme.subText }}>
                                            {selectedSupplier ? selectedSupplier.name : 'Select Supplier'}
                                        </Text>
                                        <MaterialCommunityIcons name="chevron-down" size={20} color={theme.subText} />
                                    </TouchableOpacity>

                                    {selectedSupplier && (
                                        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 12, color: theme.subText }}>Current Outstanding:</Text>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FF3B30' }}>
                                                {(
                                                    invoices.filter(inv => inv.supplierId === selectedSupplier._id).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) -
                                                    expenses.filter(exp => exp.recipientId === selectedSupplier._id && exp.paidTo === 'Supplier').reduce((sum, exp) => sum + (exp.amount || 0), 0)
                                                ).toFixed(2)} SAR
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Invoice Items</Text>
                                    <TouchableOpacity style={styles.addBtnSmall} onPress={() => setShowProductModal(true)}>
                                        <MaterialCommunityIcons name="plus" size={20} color="#1C1C1E" />
                                    </TouchableOpacity>
                                </View>

                                {invoiceItems.map((item, index) => (
                                    <View key={item.productId} style={[styles.productLine, { borderBottomColor: theme.border }]}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
                                                <View style={{ backgroundColor: theme.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                    <Text style={{ fontSize: 10, color: theme.subText }}>{item.unit}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => removeItem(index)}>
                                                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.lineControls}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.smallLabel}>Qty</Text>
                                                <TextInput
                                                    style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                                    keyboardType="numeric"
                                                    value={item.quantity.toString()}
                                                    onChangeText={(val) => updateItem(index, 'quantity', val)}
                                                />
                                            </View>
                                            <View style={{ flex: 1.5 }}>
                                                <Text style={styles.smallLabel}>Price</Text>
                                                <TextInput
                                                    style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                                    keyboardType="numeric"
                                                    value={item.purchasePrice.toString()}
                                                    onChangeText={(val) => updateItem(index, 'purchasePrice', val)}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.smallLabel}>VAT %</Text>
                                                <TextInput
                                                    style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                                    keyboardType="numeric"
                                                    value={item.taxRate.toString()}
                                                    onChangeText={(val) => updateItem(index, 'taxRate', val)}
                                                />
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                            <View>
                                                <Text style={styles.tinyLabel}>Taxable: <Text style={{ color: theme.text }}>{item.taxableAmount.toFixed(2)}</Text></Text>
                                            </View>
                                            <View>
                                                <Text style={styles.tinyLabel}>VAT: <Text style={{ color: theme.text }}>{item.taxAmount.toFixed(2)}</Text></Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.tinyLabel, { fontWeight: 'bold' }]}>Subtotal: <Text style={{ color: '#F4C430' }}>{item.total.toFixed(2)}</Text></Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                {invoiceItems.length > 0 && (
                                    <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Total (Excl. VAT)</Text>
                                            <Text style={styles.summaryValue}>{totalExclVAT.toFixed(2)} SAR</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Discount</Text>
                                            <TextInput
                                                style={[styles.summaryInput, { color: theme.text, borderColor: theme.border }]}
                                                keyboardType="numeric"
                                                value={discount}
                                                onChangeText={setDiscount}
                                            />
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Total (Excl. VAT) after Discount</Text>
                                            <Text style={styles.summaryValue}>{totalAfterDiscount.toFixed(2)} SAR</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Total VAT</Text>
                                            <Text style={styles.summaryValue}>{totalVAT.toFixed(2)} SAR</Text>
                                        </View>
                                        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 10, marginTop: 5 }]}>
                                            <Text style={[styles.summaryLabel, { fontWeight: 'bold', fontSize: 16 }]}>Grand Total</Text>
                                            <Text style={[styles.summaryValue, { fontWeight: 'bold', fontSize: 18, color: '#2ECC71' }]}>{grandTotal.toFixed(2)} SAR</Text>
                                        </View>
                                        <View style={[styles.summaryRow, { marginTop: 10 }]}>
                                            <Text style={[styles.summaryLabel, { fontStyle: 'italic' }]}>Net Profit (Potential)</Text>
                                            <Text style={[styles.summaryValue, { fontStyle: 'italic', fontWeight: 'bold' }]}>{totalProfit.toFixed(2)} SAR</Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: '#F4C430' }, isSaving && { opacity: 0.7 }]}
                                    onPress={handleSaveInvoice}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <ActivityIndicator size="small" color="#1C1C1E" /> : <Text style={styles.saveBtnText}>Save</Text>}
                                </TouchableOpacity>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showSupplierModal || showProductModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{showSupplierModal ? 'Select Supplier' : 'Select Product'}</Text>
                            <TouchableOpacity onPress={() => { setShowSupplierModal(false); setShowProductModal(false); }}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: height * 0.6 }}>
                            {showSupplierModal ? suppliers.map(s => (
                                <TouchableOpacity key={s._id} style={[styles.listItem, { borderBottomColor: theme.border }]} onPress={() => { setSelectedSupplier(s); setShowSupplierModal(false); }}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.background }]}><MaterialCommunityIcons name="truck-outline" size={24} color="#F4C430" /></View>
                                    <Text style={[styles.listItemText, { color: theme.text }]}>{s.name}</Text>
                                </TouchableOpacity>
                            )) : allProducts.map(p => (
                                <TouchableOpacity key={p._id} style={[styles.listItem, { borderBottomColor: theme.border }]} onPress={() => handleAddProduct(p)}>
                                    <View style={[styles.iconBox, { backgroundColor: theme.background }]}><MaterialCommunityIcons name="package-variant" size={24} color="#F4C430" /></View>
                                    <View style={{ flex: 1, marginLeft: 15 }}>
                                        <Text style={[styles.itemName, { color: theme.text }]}>{p.name}</Text>
                                        <Text style={{ fontSize: 12, color: theme.subText }}>Stock: {p.stock} | Unit: {p.unitOfMeasurement}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Detail Modal */}
            <Modal visible={showDetailModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, maxHeight: '60%' }]}>
                        {selectedInvoice && (
                            <>
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(244, 196, 48, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        <MaterialCommunityIcons name="file-document-check" size={30} color="#F4C430" />
                                    </View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{selectedInvoice.referenceNumber}</Text>
                                    <Text style={{ fontSize: 14, color: theme.subText }}>{new Date(selectedInvoice.date).toLocaleDateString()}</Text>
                                </View>

                                <ScrollView>
                                    <View style={{ gap: 12 }}>
                                        <View style={styles.detailRow}>
                                            <Text style={{ color: theme.subText }}>Supplier</Text>
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>{getSupplierName(selectedInvoice?.supplierId || '')}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={{ color: theme.subText }}>Products Count</Text>
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>{selectedInvoice?.items?.length || 0}</Text>
                                        </View>
                                        <View style={styles.dashedLine} />
                                        <View style={styles.detailRow}>
                                            <Text style={{ color: theme.subText }}>Total (Excl. VAT)</Text>
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>{selectedInvoice?.totalAmount ? (selectedInvoice.totalAmount - (selectedInvoice.taxAmount || 0)).toFixed(2) : '0.00'} SAR</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={{ color: theme.subText }}>Total VAT</Text>
                                            <Text style={{ color: theme.text, fontWeight: '600' }}>{selectedInvoice?.taxAmount?.toFixed(2) || '0.00'} SAR</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Grand Total</Text>
                                            <Text style={{ color: '#2ECC71', fontWeight: 'bold', fontSize: 18 }}>{selectedInvoice?.totalAmount?.toFixed(2) || '0.00'} SAR</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <TouchableOpacity
                                    style={[styles.saveBtn, { marginTop: 20 }]}
                                    onPress={() => setShowDetailModal(false)}
                                >
                                    <Text style={styles.saveBtnText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {renderCalendar()}
        </View >
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
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '90%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    formItem: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        borderWidth: 1,
    },
    addBtnSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productLine: { paddingVertical: 12, borderBottomWidth: 1 },
    productName: { fontSize: 14, fontWeight: 'bold' },
    lineControls: { flexDirection: 'row', gap: 8 },
    smallLabel: { fontSize: 9, color: '#8E8E93', marginBottom: 4 },
    smallInput: {
        borderRadius: 8,
        padding: 8,
        fontSize: 13,
        borderWidth: 1,
    },
    tinyLabel: { fontSize: 10, color: '#8E8E93' },
    summaryCard: {
        borderRadius: 16,
        padding: 15,
        marginTop: 20,
        borderWidth: 1,
        gap: 8,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 12, color: '#8E8E93' },
    summaryValue: { fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
    summaryInput: { width: 80, borderBottomWidth: 1, textAlign: 'right', fontSize: 13, paddingVertical: 2 },
    saveBtn: {
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    saveBtnText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
    listItemText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
    calendarContainer: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: '20%',
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
    rowActions: {
        marginBottom: 12,
        marginLeft: 10,
        height: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtnCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F4C430',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    dashedLine: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        marginVertical: 4,
    },
});

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { API_BASE_URL } from '../../constants/api';
import { colors as themeColors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export function CorporateCustomersScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modals visibility
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user_data');
            if (!userDataString) return;
            const userData = JSON.parse(userDataString);
            const workshopId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/corporate-customers?workshopId=${workshopId}`);
            const result = await response.json();

            if (result.success) {
                setCustomers(result.customers);
            }
        } catch (error) {
            console.error('Fetch Corporate Customers Error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill in Name, Phone, and Password');
            return;
        }

        setIsSubmitting(true);
        try {
            const userDataString = await AsyncStorage.getItem('user_data');
            const userData = JSON.parse(userDataString!);
            const workshopId = userData.id || userData._id;

            const response = await fetch(`${API_BASE_URL}/api/register-corporate-customer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, phone, email, password, workshopId
                }),
            });

            const result = await response.json();

            if (result.success) {
                Alert.alert('Success', 'Corporate customer added successfully');
                setIsAddModalVisible(false);
                resetForm();
                fetchCustomers();
            } else {
                Alert.alert('Error', result.message || 'Failed to add customer');
            }
        } catch (error) {
            Alert.alert('Error', 'Network request failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPhone('');
        setEmail('');
        setPassword('');
    };

    const renderCustomerItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.customerCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => {
                setSelectedCustomer(item);
                setIsDetailsModalVisible(true);
            }}
        >
            <View style={[styles.customerIcon, { backgroundColor: themeColors.primaryLight }]}>
                <MaterialCommunityIcons name="office-building" size={24} color={themeColors.primary} />
            </View>
            <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: theme.text }]}>{item.name}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.subText} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Corporate Customers</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                </View>
            ) : (
                <FlatList
                    data={customers}
                    renderItem={renderCustomerItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    onRefresh={() => {
                        setIsRefreshing(true);
                        fetchCustomers();
                    }}
                    refreshing={isRefreshing}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="account-group-outline" size={80} color={theme.border} />
                            <Text style={[styles.emptyText, { color: theme.subText }]}>No corporate customers linked yet.</Text>
                        </View>
                    }
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: themeColors.primary }]}
                onPress={() => setIsAddModalVisible(true)}
            >
                <MaterialCommunityIcons name="plus" size={32} color="#000" />
            </TouchableOpacity>

            <Modal
                statusBarTranslucent
                visible={isAddModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1, justifyContent: 'flex-end' }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.addModalContent, { backgroundColor: theme.background }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Add Corporate Customer</Text>
                                <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.formSection}>
                                    <Text style={[styles.label, { color: theme.text }]}>Company Name *</Text>
                                    <TextInput
                                        style={[styles.modalInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                                        placeholder="Acme Corp"
                                        placeholderTextColor={theme.subText}
                                        value={name}
                                        onChangeText={setName}
                                    />

                                    <Text style={[styles.label, { color: theme.text }]}>Phone Number *</Text>
                                    <TextInput
                                        style={[styles.modalInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                                        placeholder="5xxxxxxxx"
                                        placeholderTextColor={theme.subText}
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                    />

                                    <Text style={[styles.label, { color: theme.text }]}>Password *</Text>
                                    <TextInput
                                        style={[styles.modalInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={theme.subText}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                    />

                                    <Text style={[styles.label, { color: theme.text }]}>Email (Optional)</Text>
                                    <TextInput
                                        style={[styles.modalInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
                                        placeholder="contact@company.com"
                                        placeholderTextColor={theme.subText}
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: themeColors.primary }]}
                                    onPress={handleAddCustomer}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitButtonText}>Add Customer</Text>}
                                </TouchableOpacity>
                                <View style={{ height: 30 }} />
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Details Modal */}
            <Modal
                visible={isDetailsModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDetailsModalVisible(false)}
            >
                <View style={styles.centeredModalOverlay}>
                    <View style={[styles.detailsModalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.detailsHeader}>
                            <View style={[styles.detailsIcon, { backgroundColor: themeColors.primaryLight }]}>
                                <MaterialCommunityIcons name="office-building" size={40} color={themeColors.primary} />
                            </View>
                            <Text style={[styles.detailsName, { color: theme.text }]}>{selectedCustomer?.name}</Text>
                        </View>

                        <View style={styles.detailsBody}>
                            <DetailRow icon="phone" label="Phone" value={selectedCustomer?.phone} theme={theme} />
                            <DetailRow icon="email" label="Email" value={selectedCustomer?.email || 'N/A'} theme={theme} />
                            <DetailRow icon="calendar" label="Registered On" value={new Date(selectedCustomer?.createdAt).toLocaleDateString()} theme={theme} />
                            <DetailRow icon="shield-check" label="Status" value={selectedCustomer?.status} theme={theme} isStatus />
                        </View>

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: themeColors.primary }]}
                            onPress={() => setIsDetailsModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function DetailRow({ icon, label, value, theme, isStatus = false }: any) {
    return (
        <View style={styles.detailRow}>
            <MaterialCommunityIcons name={icon} size={20} color={themeColors.primary} style={{ marginRight: 12 }} />
            <View>
                <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
                <Text style={[
                    styles.detailValue,
                    { color: theme.text },
                    isStatus && { color: themeColors.success, fontWeight: 'bold', textTransform: 'uppercase' }
                ]}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 100 },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        elevation: 2,
    },
    customerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    customerInfo: { flex: 1 },
    customerName: { fontSize: 16, fontWeight: 'bold' },
    customerType: { fontSize: 13, marginTop: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16 },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContentWrapper: { width: '100%' },
    addModalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: height * 0.85,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    formSection: { gap: 15 },
    label: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
    modalInput: {
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    typeOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
    },
    typeOptionText: { fontSize: 14, fontWeight: '600' },
    submitButton: {
        height: 55,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
    },
    submitButtonText: { fontSize: 16, fontWeight: 'bold' },
    centeredModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailsModalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    detailsHeader: { alignItems: 'center', marginBottom: 24 },
    detailsIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    detailsName: { fontSize: 22, fontWeight: 'bold' },
    detailsType: { fontSize: 16, marginTop: 4 },
    detailsBody: { width: '100%', gap: 16, marginBottom: 30 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailLabel: { fontSize: 12, marginBottom: 2 },
    detailValue: { fontSize: 15, fontWeight: '600' },
    closeButton: {
        width: '100%',
        height: 55,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: { fontSize: 16, fontWeight: 'bold' },
});

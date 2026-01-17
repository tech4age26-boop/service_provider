import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface OrderReport {
    id: string;
    customerName: string;
    service: string;
    amount: number;
    status: 'completed' | 'pending' | 'cancelled';
    date: string;
}

interface Props {
    navigation: any;
}

export function WorkshopTechnicianReportsScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [orders, setOrders] = useState<OrderReport[]>([]);
    const [earnings, setEarnings] = useState({
        total: 0,
        completed: 0,
        pending: 0,
    });

    useEffect(() => {
        loadReports(startDate, endDate);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
            loadReports(selectedDate, endDate);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEndDate(selectedDate);
            loadReports(startDate, selectedDate);
        }
    };

    const loadReports = (start: Date, end: Date) => {
        console.log('Loading reports from', start, 'to', end);

        // Mock data with various dates - replace with API call
        const allOrders: OrderReport[] = [
            {
                id: '1',
                customerName: 'Ahmed Ali',
                service: 'Oil Change',
                amount: 150,
                status: 'completed',
                date: '2026-01-10',
            },
            {
                id: '2',
                customerName: 'Mohammed Hassan',
                service: 'Brake Service',
                amount: 350,
                status: 'completed',
                date: '2026-01-12',
            },
            {
                id: '3',
                customerName: 'Fatima Zahra',
                service: 'AC Repair',
                amount: 450,
                status: 'pending',
                date: '2026-01-15',
            },
            {
                id: '4',
                customerName: 'Omar Abdullah',
                service: 'Engine Diagnostics',
                amount: 500,
                status: 'completed',
                date: '2026-01-16',
            },
            {
                id: '5',
                customerName: 'Sara Ibrahim',
                service: 'Tire Replacement',
                amount: 800,
                status: 'completed',
                date: '2026-01-17',
            },
            {
                id: '6',
                customerName: 'Khalid Ahmed',
                service: 'Battery Service',
                amount: 200,
                status: 'pending',
                date: '2026-01-18',
            },
            {
                id: '7',
                customerName: 'Layla Hassan',
                service: 'Car Wash',
                amount: 50,
                status: 'completed',
                date: '2026-01-20',
            },
        ];

        // Filter orders by date range
        const filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.date);
            const startOfDay = new Date(start);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);

            return orderDate >= startOfDay && orderDate <= endOfDay;
        });

        setOrders(filteredOrders);

        // Calculate earnings from filtered orders
        const completedEarnings = filteredOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.amount, 0);
        const pendingEarnings = filteredOrders
            .filter(o => o.status === 'pending')
            .reduce((sum, o) => sum + o.amount, 0);

        setEarnings({
            total: completedEarnings + pendingEarnings,
            completed: completedEarnings,
            pending: pendingEarnings,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return colors.success;
            case 'pending':
                return '#FF9800';
            case 'cancelled':
                return '#FF3B30';
            default:
                return theme.subText;
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'completed':
                return colors.successLight;
            case 'pending':
                return 'rgba(255, 152, 0, 0.15)';
            case 'cancelled':
                return '#FFE5E5';
            default:
                return theme.inputBackground;
        }
    };

    return (
        <AppBody style={{ flex: 1 }}>
            {/* Enhanced Header with Profile */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerSubtitle, { color: theme.subText }]}>
                        {t('reports.title')}
                    </Text>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Earnings & Orders
                    </Text>
                </View>
                <View style={[styles.profilePicture, { backgroundColor: colors.primaryLight }]}>
                    <MaterialCommunityIcons name="account" size={28} color={colors.primary} />
                </View>
            </View>

            <ScrollView
                style={[styles.container, { backgroundColor: theme.background }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Date Range Picker - Enhanced Design */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="calendar-range" size={20} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            {t('reports.select_date_range')}
                        </Text>
                    </View>

                    <View style={styles.datePickerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.dateLabel, { color: theme.subText }]}>
                                {t('common.from')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.dateButton, { backgroundColor: theme.cardBackground, borderColor: colors.primary, borderWidth: 1.5 }]}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                                <Text style={[styles.dateText, { color: theme.text }]}>
                                    {formatDate(startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={[styles.dateLabel, { color: theme.subText }]}>
                                {t('common.to')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.dateButton, { backgroundColor: theme.cardBackground, borderColor: colors.primary, borderWidth: 1.5 }]}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                                <Text style={[styles.dateText, { color: theme.text }]}>
                                    {formatDate(endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={handleStartDateChange}
                        />
                    )}

                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={handleEndDateChange}
                        />
                    )}
                </View>

                {/* Earnings Summary - Enhanced Design */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialCommunityIcons name="cash-multiple" size={20} color={colors.success} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            {t('reports.earnings_summary')}
                        </Text>
                    </View>

                    <View style={[styles.earningsCard, { backgroundColor: colors.primaryLight }]}>
                        <View style={styles.totalEarningRow}>
                            <View>
                                <Text style={[styles.earningLabel, { color: colors.primary }]}>
                                    {t('reports.total_earnings')}
                                </Text>
                                <Text style={[styles.earningAmount, { color: colors.primary }]}>
                                    {earnings.total} {t('wallet.sar')}
                                </Text>
                            </View>
                            <View style={[styles.earningIcon, { backgroundColor: colors.primary }]}>
                                <MaterialCommunityIcons name="trending-up" size={24} color="#FFF" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.earningsBreakdown}>
                        <View style={[styles.breakdownCard, { backgroundColor: theme.cardBackground }]}>
                            <View style={[styles.breakdownIcon, { backgroundColor: colors.successLight }]}>
                                <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                            </View>
                            <Text style={[styles.breakdownLabel, { color: theme.subText }]}>
                                {t('orders.completed')}
                            </Text>
                            <Text style={[styles.breakdownValue, { color: colors.success }]}>
                                {earnings.completed} {t('wallet.sar')}
                            </Text>
                        </View>

                        <View style={[styles.breakdownCard, { backgroundColor: theme.cardBackground }]}>
                            <View style={[styles.breakdownIcon, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                                <MaterialCommunityIcons name="clock-outline" size={20} color="#FF9800" />
                            </View>
                            <Text style={[styles.breakdownLabel, { color: theme.subText }]}>
                                {t('orders.pending')}
                            </Text>
                            <Text style={[styles.breakdownValue, { color: '#FF9800' }]}>
                                {earnings.pending} {t('wallet.sar')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('reports.order_details')}
                    </Text>

                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <View
                                key={order.id}
                                style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}
                            >
                                <View style={styles.orderHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.orderCustomer, { color: theme.text }]}>
                                            {order.customerName}
                                        </Text>
                                        <Text style={[styles.orderService, { color: theme.subText }]}>
                                            {order.service}
                                        </Text>
                                        <Text style={[styles.orderDate, { color: theme.subText }]}>
                                            {new Date(order.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.orderAmount, { color: theme.text }]}>
                                            {order.amount} {t('wallet.sar')}
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: getStatusBgColor(order.status) },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: getStatusColor(order.status) },
                                                ]}
                                            >
                                                {t(`orders.${order.status}`)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={48} color={theme.subText} />
                            <Text style={[styles.emptyText, { color: theme.subText }]}>
                                {t('reports.no_orders')}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        ...typography.subheader,
    },
    datePickerRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateLabel: {
        ...typography.caption,
        marginBottom: 8,
        fontWeight: '600',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateText: {
        ...typography.body,
        fontWeight: '600',
    },
    earningsCard: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    totalEarningRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    earningRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    earningLabel: {
        ...typography.caption,
        fontWeight: '600',
        marginBottom: 8,
    },
    earningAmount: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    earningIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earningsBreakdown: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    breakdownCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    breakdownIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    breakdownLabel: {
        ...typography.caption,
        marginBottom: 4,
    },
    breakdownValue: {
        ...typography.body,
        fontWeight: 'bold',
    },
    earningValue: {
        ...typography.body,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    orderCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderCustomer: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: 4,
    },
    orderService: {
        ...typography.caption,
        marginBottom: 2,
    },
    orderDate: {
        ...typography.caption,
        fontSize: 11,
    },
    orderAmount: {
        ...typography.body,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    emptyState: {
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        ...typography.body,
    },
});


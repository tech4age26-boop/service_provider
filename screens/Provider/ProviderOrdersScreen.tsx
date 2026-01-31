/**
 * Provider Dashboard - Orders Screen
 */

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { API_BASE_URL } from '../../constants/api';



export function ProviderOrdersScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Date Range State - Default to wide range
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Stats State
    const [stats, setStats] = useState({
        todayCount: 0,
        completedCount: 0,
        totalRevenue: 0
    });

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        resetAndFetch();
    }, [startDate, endDate, activeTab]);

    const resetAndFetch = () => {
        setPage(1);
        setOrders([]);
        setHasMore(true);
        fetchOrders(1);
    };

    const fetchOrders = async (pageNum: number) => {
        if (pageNum === 1) setIsLoading(true);
        else setLoadingMore(true);

        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const providerId = userData.workshopId || userData.id || userData._id;

                const queryStatus = activeTab === 'active' ? 'active' : 'completed';
                // Widen status check to ensure we don't miss any 'active' variants
                const statusParam = activeTab === 'active'
                    ? 'pending,in progress,ready,accepted,assigned,arrived,started'
                    : 'completed,delivered,cancelled';

                const url = `${API_BASE_URL}/api/provider-orders?providerId=${providerId}&page=${pageNum}&limit=5&startDate=${startDate}&endDate=${endDate}&status=${encodeURIComponent(statusParam)}`;

                const response = await fetch(url);
                const result = await response.json();

                if (result.success) {
                    const newOrders = result.orders || [];

                    if (pageNum === 1) {
                        setOrders(newOrders);
                    } else {
                        setOrders(prev => [...prev, ...newOrders]);
                    }

                    // Check if we reached end
                    if (newOrders.length < 5) {
                        setHasMore(false);
                    } else {
                        setHasMore(true);
                    }

                    // Optional: If API returns totals, use them. Else calculate on current view (which is partial)
                    // For now, let's roughly calculate stats on loaded orders + maybe some previous totals if available
                    // or just show "Loaded" stats
                    calculateStats(pageNum === 1 ? newOrders : [...orders, ...newOrders]);

                } else {
                    if (pageNum === 1) setOrders([]);
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
            if (pageNum === 1) setOrders([]);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
            setIsRefreshing(false);
        }
    };

    const loadMore = () => {
        if (!hasMore || isLoading || loadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        resetAndFetch();
    };

    const calculateStats = (orderList: any[]) => {
        // Simple calculation based on loaded orders
        let todayC = 0;
        let compC = 0;
        let revenue = 0;
        const today = new Date().toISOString().split('T')[0];

        orderList.forEach(order => {
            const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
            if (orderDateStr === today) todayC++;
            if (order.status === 'completed' || order.status === 'delivered') {
                compC++;
                revenue += parseFloat(order.totalAmount || order.amount || 0);
            }
        });
        setStats({ todayCount: todayC, completedCount: compC, totalRevenue: revenue });
    };

    // Orders are already filtered by API based on status param
    const filteredOrders = orders;

    const [showCalendar, setShowCalendar] = useState<{ visible: boolean, type: 'start' | 'end' }>({ visible: false, type: 'start' });
    const [currentViewDate, setCurrentViewDate] = useState(new Date());

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#007AFF';
            case 'in progress': return '#FFA500';
            case 'completed':
            case 'delivered': return '#2ECC71';
            case 'cancelled': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handleDateSelect = (day: number) => {
        const date = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        if (showCalendar.type === 'start') setStartDate(dateStr);
        else setEndDate(dateStr);
        setShowCalendar({ ...showCalendar, visible: false });
    };

    const renderCalendar = () => {
        const year = currentViewDate.getFullYear();
        const month = currentViewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = currentViewDate.toLocaleString('default', { month: 'long' });

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return (
            <Modal transparent visible={showCalendar.visible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.calendarContainer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={() => setCurrentViewDate(new Date(year, month - 1))}>
                                <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
                            </TouchableOpacity>
                            <Text style={[styles.calendarMonthYear, { color: theme.text }]}>{monthName} {year}</Text>
                            <TouchableOpacity onPress={() => setCurrentViewDate(new Date(year, month + 1))}>
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
                                        day !== null && (showCalendar.type === 'start' ? startDate : endDate).split('-')[2] === day?.toString().padStart(2, '0') && { backgroundColor: '#F4C430', borderRadius: 20 }
                                    ]}
                                    disabled={day === null}
                                    onPress={() => day && handleDateSelect(day)}
                                >
                                    <Text style={[styles.dayText, { color: day === null ? 'transparent' : theme.text }]}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.closeCalendarBtn} onPress={() => setShowCalendar({ ...showCalendar, visible: false })}>
                            <Text style={{ color: '#F4C430', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('orders.title')}</Text>
            </View>

            {/* Tracking Summary Card */}
            <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Today</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.todayCount}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Completed</Text>
                        <Text style={[styles.statValue, { color: '#2ECC71' }]}>{stats.completedCount}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Revenue</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalRevenue.toFixed(2)} SAR</Text>
                    </View>
                </View>
            </View>

            {/* Calendar Modal */}
            {renderCalendar()}

            {/* Date Range Picker */}
            <View style={styles.dateFilterContainer}>
                <View style={styles.dateInputWrapper}>
                    <Text style={styles.dateLabel}>From:</Text>
                    <TouchableOpacity
                        style={[styles.dateInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, flexDirection: 'row', alignItems: 'center' }]}
                        onPress={() => setShowCalendar({ visible: true, type: 'start' })}
                    >
                        <MaterialCommunityIcons name="calendar-range" size={16} color={theme.subText} style={{ marginRight: 8 }} />
                        <Text style={{ color: theme.text }}>{startDate}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.dateInputWrapper}>
                    <Text style={styles.dateLabel}>To:</Text>
                    <TouchableOpacity
                        style={[styles.dateInput, { backgroundColor: theme.cardBackground, borderColor: theme.border, flexDirection: 'row', alignItems: 'center' }]}
                        onPress={() => setShowCalendar({ visible: true, type: 'end' })}
                    >
                        <MaterialCommunityIcons name="calendar-range" size={16} color={theme.subText} style={{ marginRight: 8 }} />
                        <Text style={{ color: theme.text }}>{endDate}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.filterBtn} onPress={resetAndFetch}>
                    <MaterialCommunityIcons name="filter-variant" size={20} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            {/* Presets */}
            <View style={styles.presetsContainer}>
                <TouchableOpacity
                    style={[styles.presetBtn, { backgroundColor: theme.cardBackground }]}
                    onPress={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setStartDate(today);
                        setEndDate(today);
                    }}
                >
                    <Text style={[styles.presetText, { color: theme.text }]}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.presetBtn, { backgroundColor: theme.cardBackground }]}
                    onPress={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setStartDate(start.toISOString().split('T')[0]);
                        setEndDate(end.toISOString().split('T')[0]);
                    }}
                >
                    <Text style={[styles.presetText, { color: theme.text }]}>Last 7 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.presetBtn, { backgroundColor: theme.cardBackground }]}
                    onPress={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        setStartDate(start.toISOString().split('T')[0]);
                        setEndDate(now.toISOString().split('T')[0]);
                    }}
                >
                    <Text style={[styles.presetText, { color: theme.text }]}>This Month</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground, marginTop: 10 }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'active' && styles.activeTabText,
                        activeTab !== 'active' && { color: theme.subText }
                    ]}>
                        {t('orders.active')} ({orders.filter(o => o.status !== 'completed' && o.status !== 'delivered' && o.status !== 'cancelled').length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'completed' && styles.activeTabText,
                        activeTab !== 'completed' && { color: theme.subText }
                    ]}>
                        {t('orders.completed')} ({orders.filter(o => o.status === 'completed' || o.status === 'delivered').length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <FlatList
                style={styles.content}
                data={orders}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item: order }) => (
                    <TouchableOpacity style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.orderHeader}>
                            <View>
                                <Text style={[styles.orderService, { color: theme.text }]}>{order.serviceType || order.items?.[0]?.name || 'Service'}</Text>
                                <Text style={{ fontSize: 12, color: theme.subText }}>#{order._id?.slice(-6).toUpperCase()}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status.toUpperCase()}</Text>
                            </View>
                        </View>
                        <View style={styles.orderRow}>
                            <MaterialCommunityIcons name="account" size={16} color={theme.subText} />
                            <Text style={[styles.orderCustomer, { color: theme.subText }]}>{order.customerName || order.customer?.name || 'Guest Customer'}</Text>
                        </View>
                        <View style={styles.orderRow}>
                            <MaterialCommunityIcons name="car" size={16} color={theme.subText} />
                            <Text style={[styles.orderCustomer, { color: theme.subText }]}>
                                {order.vehicleDetails?.brand || order.vehicle?.brand} {order.vehicleDetails?.model || order.vehicle?.model}
                            </Text>
                        </View>
                        <View style={styles.orderRow}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.subText} />
                            <Text style={[styles.orderTime, { color: theme.subText }]}>
                                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        {activeTab === 'completed' && (
                            <View style={[styles.orderActions, { borderTopColor: theme.border }]}>
                                <Text style={[styles.orderAmount, { textAlign: 'right' }]}>{order.totalAmount || order.amount || '0.00'} SAR</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color={theme.border} />
                            <Text style={{ color: theme.subText, marginTop: 10 }}>No orders found for this period</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="small" color={theme.tint} />
                        </View>
                    ) : <View style={{ height: 100 }} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#F4C430']} tintColor={theme.text} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
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
    orderCard: {
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
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderService: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ECC71',
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    orderCustomer: {
        fontSize: 14,
        color: '#8E8E93',
    },
    orderTime: {
        fontSize: 13,
        color: '#8E8E93',
    },
    orderActions: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    viewButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F4C430',
    },
    // Tracking/Stats Styles
    statsCard: {
        margin: 20,
        marginBottom: 10,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#F0F0F0',
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateFilterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 10,
    },
    dateInputWrapper: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        color: '#8E8E93',
        marginBottom: 4,
    },
    dateInput: {
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 10,
        fontSize: 13,
    },
    filterBtn: {
        marginTop: 15,
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    presetsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
        marginTop: 10,
    },
    presetBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    presetText: {
        fontSize: 12,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        elevation: 5,
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
        width: 40,
        textAlign: 'center',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayButton: {
        width: '14.28%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    dayText: {
        fontSize: 14,
    },
    closeCalendarBtn: {
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
});

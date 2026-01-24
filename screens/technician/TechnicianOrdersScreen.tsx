import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { API_BASE_URL } from '../../constants/api';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface TechnicianOrder {
    id: string;
    service: string;
    customer: string;
    phone?: string;
    location?: string;
    vehicle: string;
    time: string;
    status: string;
    rawStatus: 'active' | 'next' | 'completed' | 'pending';
    statusColor: string;
    amount?: string;
}

interface TechnicianOrdersScreenProps {
    navigation: {
        navigate: (screen: string, params: { task: any }) => void;
    };
}

const truncateText = (text: string, maxWords: number) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
};

export function TechnicianOrdersScreen({ navigation }: TechnicianOrdersScreenProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [orders, setOrders] = useState<TechnicianOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const handleUpdateStatus = async (order: any, newStatus: string) => {
        try {
            setUpdatingOrderId(order.id);
            const response = await fetch(`${API_BASE_URL}/api/update-order-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.originalOrder._id,
                    status: newStatus,
                }),
            });

            const result = await response.json();
            if (result.success) {
                Alert.alert('Success', `Task updated to ${newStatus}`);
                fetchOrders(); // Refresh list
            } else {
                Alert.alert('Error', result.message || 'Failed to update task');
            }
        } catch (error) {
            console.error('Update Status Error:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const fetchOrders = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            console.log('Fetching orders, user_data:', userDataStr);

            if (!userDataStr) {
                console.log('No user data found in storage');
                setIsLoading(false);
                return;
            }

            const userData = JSON.parse(userDataStr);
            const providerId = userData.id;
            console.log('Using providerId for fetch:', providerId);

            if (!providerId) {
                console.log('No provider ID found in user data');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/provider-orders?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                console.log(`Successfully fetched ${result.data?.length} orders`);
                const mappedOrders: TechnicianOrder[] = result.data.map((order: any) => {
                    // Map server status to UI status
                    let uiStatus = order.status;
                    let color = '#FF9500'; // Default Orange
                    let raw: any = 'pending';

                    if (order.status === 'completed') {
                        uiStatus = t('status.completed');
                        color = '#34C759';
                        raw = 'completed';
                    } else if (order.status === 'in-progress' || order.status === 'active') {
                        uiStatus = t('status.active');
                        color = '#FF9500';
                        raw = 'active';
                    } else if (order.status === 'pending') {
                        uiStatus = t('status.pending');
                        color = '#007AFF';
                        raw = 'next';
                    }

                    return {
                        id: order._id.toString().slice(-6).toUpperCase(),
                        service: order.serviceType,
                        customer: order.customerName || t('common.customer'),
                        phone: order.customerPhone || '',
                        location: order.address || order.location?.address || 'Riyadh',
                        vehicle: `${order.vehicleDetails?.make || ''} ${order.vehicleDetails?.model || ''} ${order.vehicleDetails?.year || ''}`,
                        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: uiStatus,
                        rawStatus: raw,
                        statusColor: color,
                        amount: order.products?.reduce((sum: number, p: any) => sum + (p.price || 0), 0) || '0',
                        originalOrder: order // Keep full order for navigation
                    };
                });
                setOrders(mappedOrders);
            } else {
                console.log('Server returned error:', result.message);
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
            Alert.alert('Error', 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const handleCall = (phone: string) => {
        if (phone) Linking.openURL(`tel:${phone}`);
    };

    const handleNavigate = (location: string) => {
        if (!location) return;
        const url = Platform.select({
            ios: `maps:0,0?q=${encodeURIComponent(location)}`,
            android: `geo:0,0?q=${encodeURIComponent(location)}`,
        });
        if (url) Linking.openURL(url);
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'pending') {
            return order.rawStatus !== 'completed';
        } else {
            return order.rawStatus === 'completed';
        }
    });

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.tint + '10' }]}>
                <MaterialCommunityIcons
                    name={activeTab === 'pending' ? 'calendar-blank' : 'history'}
                    size={64}
                    color={theme.tint}
                />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {activeTab === 'pending' ? t('technician.no_ongoing_orders') : t('technician.no_history_orders')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.subText }]}>
                {t('technician.ready_for_work')}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <AppBody style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.tint} />
            </AppBody>
        );
    }

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <TechnicianHeader title={t('technician.jobs_title')} />

            <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.tab, activeTab === 'pending' && { backgroundColor: theme.tint }]}
                    onPress={() => setActiveTab('pending')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'pending' ? { color: '#000' } : { color: theme.subText }
                    ]}>
                        {t('technician.ongoing')}
                    </Text>
                    {filteredOrders.length > 0 && activeTab === 'pending' && (
                        <View style={[styles.badge, { backgroundColor: '#000' }]}>
                            <Text style={[styles.badgeText, { color: theme.tint }]}>
                                {filteredOrders.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.tab, activeTab === 'completed' && { backgroundColor: theme.tint }]}
                    onPress={() => setActiveTab('completed')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'completed' ? { color: '#000' } : { color: theme.subText }
                    ]}>
                        {t('technician.history')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
                }
            >
                {filteredOrders.length === 0 ? renderEmptyState() : (
                    filteredOrders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            activeOpacity={0.9}
                            style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}
                            onPress={() => navigation.navigate('TaskDetailScreen', {
                                task: {
                                    ...order,
                                    status: order.rawStatus,
                                    scheduled: order.time,
                                }
                            })}
                        >
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>#{order.id}</Text>
                                    <Text style={[styles.orderService, { color: theme.text }]}>{order.service}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '15' }]}>
                                    <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="account-outline" size={18} color={theme.subText} />
                                    <Text style={[styles.infoText, { color: theme.text }]}>{order.customer}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="car-outline" size={18} color={theme.subText} />
                                    <Text style={[styles.infoText, { color: theme.text }]}>{order.vehicle}</Text>
                                </View>
                                {activeTab === 'pending' ? (
                                    <View style={styles.infoItem}>
                                        <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={theme.subText} />
                                        <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
                                            {truncateText(order.location || '', 4)}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.infoItem}>
                                        <MaterialCommunityIcons name="currency-usd" size={18} color={colors.success} />
                                        <Text style={[styles.infoText, { color: colors.success, fontWeight: '700' }]}>{order.amount} {t('wallet.sar')}</Text>
                                    </View>
                                )}
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={18} color={theme.subText} />
                                    <Text style={[styles.infoText, { color: theme.text }]}>{order.time}</Text>
                                </View>
                            </View>

                            {activeTab === 'pending' && (
                                <View style={styles.actionRow}>
                                    {order.rawStatus === 'next' ? (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: '#2ECC71' }]}
                                            onPress={() => handleUpdateStatus(order, 'active')}
                                            disabled={updatingOrderId === order.id}
                                        >
                                            {updatingOrderId === order.id ? (
                                                <ActivityIndicator size="small" color="#000" />
                                            ) : (
                                                <>
                                                    <MaterialCommunityIcons name="play-circle-outline" size={18} color="#000" />
                                                    <Text style={[styles.actionButtonText, { color: '#000' }]}>{t('technician.start_task')}</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: '#F4C430' }]}
                                            onPress={() => handleUpdateStatus(order, 'completed')}
                                            disabled={updatingOrderId === order.id}
                                        >
                                            {updatingOrderId === order.id ? (
                                                <ActivityIndicator size="small" color="#000" />
                                            ) : (
                                                <>
                                                    <MaterialCommunityIcons name="check-circle-outline" size={18} color="#000" />
                                                    <Text style={[styles.actionButtonText, { color: '#000' }]}>{t('technician.mark_completed')}</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: theme.tint + '15' }]}
                                        onPress={() => handleCall(order.phone!)}
                                        disabled={!order.phone}
                                    >
                                        <MaterialCommunityIcons name="phone" size={18} color={theme.tint} />
                                        <Text style={[styles.actionButtonText, { color: theme.tint }]}>{t('technician.call_customer')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]}
                                        onPress={() => handleNavigate(order.location!)}
                                    >
                                        <MaterialCommunityIcons name="navigation-variant" size={18} color="#1E88E5" />
                                        <Text style={[styles.actionButtonText, { color: '#1E88E5' }]}>{t('technician.navigate')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    orderCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        marginBottom: 2,
    },
    orderService: {
        fontSize: 18,
        fontWeight: '800',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 12,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        gap: 6,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});

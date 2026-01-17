import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface Order {
    id: string;
    customerName: string;
    service: string;
    amount: number;
    status: 'pending' | 'accepted' | 'completed';
    createdAt: string;
}

interface Props {
    navigation: any;
}

export function WorkshopTechnicianHomeScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
    });
    const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await AsyncStorage.getItem('user_data');
            if (data) {
                setUserData(JSON.parse(data));
            }
            loadStats();
            loadIncomingOrders();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadStats = () => {
        // Mock data - replace with API call
        setStats({
            totalOrders: 45,
            pendingOrders: 8,
            totalEarnings: 12500,
        });
    };

    const loadIncomingOrders = () => {
        // Mock data - replace with API call
        const mockOrders: Order[] = [
            {
                id: '1',
                customerName: 'Ahmed Ali',
                service: 'Oil Change',
                amount: 150,
                status: 'pending',
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                customerName: 'Mohammed Hassan',
                service: 'Brake Service',
                amount: 350,
                status: 'pending',
                createdAt: new Date().toISOString(),
            },
        ];
        setIncomingOrders(mockOrders);
    };

    const handleAcceptOrder = (orderId: string) => {
        // Handle accept order - API call
        console.log('Accepting order:', orderId);
        setIncomingOrders(incomingOrders.filter(order => order.id !== orderId));
    };

    const handleDeclineOrder = (orderId: string) => {
        // Handle decline order - API call
        console.log('Declining order:', orderId);
        setIncomingOrders(incomingOrders.filter(order => order.id !== orderId));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <AppBody style={{ flex: 1 }}>
            {/* Enhanced Header with Profile */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.profilePicture, { backgroundColor: colors.primaryLight }]}>
                    <MaterialCommunityIcons name="account" size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.greeting, { color: theme.subText }]}>
                        {t('home.welcome_back')}
                    </Text>
                    <Text style={[styles.shopName, { color: theme.text }]}>
                        {userData?.workshopName || 'Workshop Technician'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.notificationIcon, { backgroundColor: theme.inputBackground }]}
                    onPress={() => navigation.navigate('Notification')}
                >
                    <MaterialCommunityIcons name="bell" size={20} color={theme.text} />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={[styles.container, { backgroundColor: theme.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
                            <MaterialCommunityIcons name="clipboard-list" size={24} color={colors.primary} />
                        </View>
                        <Text style={[styles.statNumber, { color: theme.text }]}>{stats.totalOrders}</Text>
                        <Text style={[styles.statLabel, { color: theme.subText }]}>
                            {t('home.total_orders')}
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                            <MaterialCommunityIcons name="clock-alert" size={24} color="#FF9800" />
                        </View>
                        <Text style={[styles.statNumber, { color: theme.text }]}>{stats.pendingOrders}</Text>
                        <Text style={[styles.statLabel, { color: theme.subText }]}>
                            {t('orders.pending')}
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground, width: '100%' }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.successLight }]}>
                            <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.success} />
                        </View>
                        <Text style={[styles.statNumber, { color: theme.text }]}>
                            {stats.totalEarnings.toLocaleString()} {t('wallet.sar')}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.subText }]}>
                            {t('home.total_earnings')}
                        </Text>
                    </View>
                </View>

                {/* Incoming Orders Section */}
                {incomingOrders.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="bell-ring" size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {t('orders.incoming')}
                            </Text>
                            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.badgeText}>{incomingOrders.length}</Text>
                            </View>
                        </View>

                        {incomingOrders.map((order) => (
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
                                    </View>
                                    <Text style={[styles.orderAmount, { color: colors.primary }]}>
                                        {order.amount} {t('wallet.sar')}
                                    </Text>
                                </View>

                                <View style={styles.orderActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.declineButton]}
                                        onPress={() => handleDeclineOrder(order.id)}
                                    >
                                        <MaterialCommunityIcons name="close" size={18} color="#FF3B30" />
                                        <Text style={styles.declineButtonText}>{t('common.decline')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.acceptButton]}
                                        onPress={() => handleAcceptOrder(order.id)}
                                    >
                                        <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                                        <Text style={styles.acceptButtonText}>{t('common.accept')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Quick Action - Reports Only */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.success} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            {t('common.quick_actions')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.quickActionCardFull, { backgroundColor: colors.primaryLight }]}
                        onPress={() => navigation.navigate('Reports')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
                            <MaterialCommunityIcons name="chart-line" size={28} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.quickActionTitle, { color: colors.primary }]}>
                                {t('reports.title')}
                            </Text>
                            <Text style={[styles.quickActionSubtitle, { color: colors.primary }]}>
                                View earnings and order details
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
                    </TouchableOpacity>
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
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        ...typography.caption,
        marginBottom: 2,
        fontWeight: '600',
    },
    shopName: {
        ...typography.subheader,
    },
    notificationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF3B30',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statNumber: {
        ...typography.header,
        marginBottom: 4,
    },
    statLabel: {
        ...typography.caption,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        ...typography.subheader,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
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
        marginBottom: 12,
    },
    orderCustomer: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: 4,
    },
    orderService: {
        ...typography.caption,
    },
    orderAmount: {
        ...typography.body,
        fontWeight: 'bold',
    },
    orderActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    declineButton: {
        backgroundColor: '#FFE5E5',
    },
    declineButtonText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: colors.primary,
    },
    acceptButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    quickActionCardFull: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    quickActionCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    quickActionText: {
        ...typography.caption,
        fontWeight: '600',
    },
});


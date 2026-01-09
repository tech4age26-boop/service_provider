import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { colors } from '../../theme/colors';

interface TechnicianOrder {
    id: string;
    service: string;
    customer: string;
    phone?: string;
    location?: string;
    vehicle: string;
    time: string;
    status: string;
    statusColor: string;
    amount?: string;
}

interface TechnicianOrdersScreenProps {
    navigation: {
        navigate: (screen: string, params: { task: TechnicianOrder }) => void;
    };
}

const truncateText = (text: string, maxWords: number) => {
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

    const pendingOrders: TechnicianOrder[] = [
        { 
            id: 'ORD-8821', 
            service: t('services.oil_change'), 
            customer: 'Khalid Mansour', 
            phone: '+966501234567',
            location: 'Al Olaya, Riyadh, King Fahd Road Tower B', 
            vehicle: 'Toyota Camry 2023',
            time: 'ASAP', 
            status: t('status.in_transit'), 
            statusColor: '#FF9500' 
        },
        { 
            id: 'ORD-8822', 
            service: t('services.tire_service'), 
            customer: 'Sara Al-Otaibi', 
            phone: '+966509876543',
            location: 'King Fahd District, Riyadh City Center Mall', 
            vehicle: 'Lexus RX 2022',
            time: '11:30 AM', 
            status: t('status.pending'), 
            statusColor: '#007AFF' 
        },
    ];

    const completedOrders: TechnicianOrder[] = [
        { 
            id: 'ORD-8790', 
            service: t('services.battery_replacement'), 
            customer: 'Ahmed Al-Saud', 
            time: 'Today, 9:00 AM', 
            amount: 'SR 450', 
            vehicle: 'BMW X5 2021',
            status: t('status.completed'),
            statusColor: '#34C759' 
        },
        { 
            id: 'ORD-8785', 
            service: t('services.brake_service'), 
            customer: 'Fahad Mohammed', 
            time: 'Yesterday', 
            amount: 'SR 320', 
            vehicle: 'Honda Accord 2020',
            status: t('status.completed'),
            statusColor: '#34C759' 
        },
    ];

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleNavigate = (location: string) => {
        const url = Platform.select({
            ios: `maps:0,0?q=${location}`,
            android: `geo:0,0?q=${location}`,
        });
        if (url) Linking.openURL(url);
    };

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

    const orders = activeTab === 'pending' ? pendingOrders : completedOrders;

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
                    {pendingOrders.length > 0 && (
                        <View style={[styles.badge, { backgroundColor: activeTab === 'pending' ? '#000' : theme.tint }]}>
                            <Text style={[styles.badgeText, { color: activeTab === 'pending' ? theme.tint : '#000' }]}>
                                {pendingOrders.length}
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
            >
                {orders.length === 0 ? renderEmptyState() : (
                    orders.map((order) => (
                        <TouchableOpacity 
                            key={order.id} 
                            activeOpacity={0.9}
                            style={[styles.orderCard, { backgroundColor: theme.cardBackground }]} 
                            onPress={() => navigation.navigate('TaskDetailScreen', { task: order })}
                        >
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>{order.id}</Text>
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
                                        <Text style={[styles.infoText, { color: colors.success, fontWeight: '700' }]}>{order.amount}</Text>
                                    </View>
                                )}
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="clock-outline" size={18} color={theme.subText} />
                                    <Text style={[styles.infoText, { color: theme.text }]}>{order.time}</Text>
                                </View>
                            </View>

                            {activeTab === 'pending' && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { backgroundColor: theme.tint + '15' }]}
                                        onPress={() => handleCall(order.phone!)}
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
                                    <TouchableOpacity 
                                        style={[styles.actionButton, { backgroundColor: '#F2F2F7' }]}
                                        onPress={() => navigation.navigate('TaskDetailScreen', { task: order })}
                                    >
                                        <Text style={[styles.actionButtonText, { color: '#8E8E93' }]}>{t('technician.details')}</Text>
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

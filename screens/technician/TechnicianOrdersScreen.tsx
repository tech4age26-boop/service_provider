/**
 * Technician Dashboard - Orders Screen
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../App';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader  from '../../components/technician_header/technician-header';
export function TechnicianOrdersScreen({navigation}: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    const pendingOrders = [
        { id: '1', service: 'Roadside Assistance', location: 'King Fahd Rd, Riyadh', time: 'Urgent', status: 'In Transit', statusColor: '#FFA500' },
        { id: '2', service: 'Tire Change', location: 'Takhassusi St, Riyadh', time: '11:30 AM', status: 'Pending', statusColor: '#007AFF' },
    ];

    const completedOrders = [
        { id: '3', service: 'Battery Jumpstart', customer: 'Ahmed Ali', time: 'Today, 9:00 AM', amount: '$45', statusColor: '#2ECC71' },
        { id: '4', service: 'Fuel Delivery', customer: 'Sara Khan', time: 'Yesterday', amount: '$30', statusColor: '#2ECC71' },
    ];

    return (
        <AppBody> 
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('technician.jobs_title')}</Text>
            </View> */}
            <TechnicianHeader title={t('technician.jobs_title')} onBackPress={() => {}} />
            <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'pending' && styles.activeTabText,
                        activeTab !== 'pending' && { color: theme.subText }
                    ]}>
                        {t('technician.ongoing')} ({pendingOrders.length})
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
                        {t('technician.history')} ({completedOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'pending' ? (
                    pendingOrders.map((order) => (
                        <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardBackground }]} onPress={()=>navigation.navigate('TaskDetailScreen', { task: order } )}>
                            <View style={styles.orderHeader}>
                                <Text style={[styles.orderService, { color: theme.text }]}>{order.service}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
                                    <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
                                </View>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="map-marker" size={16} color={theme.subText} />
                                <Text style={[styles.orderCustomer, { color: theme.subText }]}>{order.location}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.subText} />
                                <Text style={[styles.orderTime, { color: theme.subText }]}>{order.time}</Text>
                            </View>
                            <View style={[styles.orderActions, { borderTopColor: theme.border }]}>
                                <TouchableOpacity style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>{t('technician.open_navigation')}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))

                ) : (
                    completedOrders.map((order) => (
                        <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardBackground }]} onPress={()=>navigation.navigate('TaskDetailScreen', { task: order } )}>
                            <View style={styles.orderHeader}>
                                <Text style={[styles.orderService, { color: theme.text }]}>{order.service}</Text>
                                <Text style={styles.orderAmount}>{order.amount}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="account-check" size={16} color={theme.subText} />
                                <Text style={[styles.orderCustomer, { color: theme.subText }]}>{order.customer}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color="#2ECC71" />
                                <Text style={[styles.orderTime, { color: theme.subText }]}>{t('status.completed')} {order.time}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // header: {
    //     padding: 20,
    //     backgroundColor: '#FFFFFF',
    // },
    // title: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     color: '#1C1C1E',
    // },
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
});

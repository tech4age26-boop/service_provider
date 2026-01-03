/**
 * Provider Dashboard - Orders Screen
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

import { useTheme } from '../App';

export function ProviderOrdersScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    const activeOrders = [
        { id: '1', service: 'Oil Change', customer: 'John Smith', time: '30 mins ago', status: 'In Progress', statusColor: '#FFA500' },
        { id: '2', service: 'Brake Repair', customer: 'Sarah Johnson', time: '2:00 PM Today', status: 'Pending', statusColor: '#007AFF' },
        { id: '3', service: 'Tire Replacement', customer: 'Mike Wilson', time: '4:00 PM Today', status: 'Scheduled', statusColor: '#8E8E93' },
    ];

    const completedOrders = [
        { id: '4', service: 'AC Repair', customer: 'Emma Davis', time: 'Yesterday', amount: '$150', statusColor: '#2ECC71' },
        { id: '5', service: 'Engine Diagnostics', customer: 'David Brown', time: '2 days ago', amount: '$200', statusColor: '#2ECC71' },
        { id: '6', service: 'Car Wash', customer: 'Lisa Anderson', time: '3 days ago', amount: '$30', statusColor: '#2ECC71' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>Orders</Text>
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}>
                    <Text style={[
                        styles.tabText,
                        activeTab === 'active' && styles.activeTabText,
                        activeTab !== 'active' && { color: theme.subText }
                    ]}>
                        Active ({activeOrders.length})
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
                        Completed ({completedOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            <ScrollView style={styles.content}>
                {activeTab === 'active' ? (
                    activeOrders.map((order) => (
                        <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                            <View style={styles.orderHeader}>
                                <Text style={[styles.orderService, { color: theme.text }]}>{order.service}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
                                    <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
                                </View>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="account" size={16} color={theme.subText} />
                                <Text style={[styles.orderCustomer, { color: theme.subText }]}>{order.customer}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.subText} />
                                <Text style={[styles.orderTime, { color: theme.subText }]}>{order.time}</Text>
                            </View>
                            <View style={[styles.orderActions, { borderTopColor: theme.border }]}>
                                <TouchableOpacity style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    completedOrders.map((order) => (
                        <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                            <View style={styles.orderHeader}>
                                <Text style={[styles.orderService, { color: theme.text }]}>{order.service}</Text>
                                <Text style={styles.orderAmount}>{order.amount}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="account" size={16} color={theme.subText} />
                                <Text style={[styles.orderCustomer, { color: theme.subText }]}>{order.customer}</Text>
                            </View>
                            <View style={styles.orderRow}>
                                <MaterialCommunityIcons name="check-circle" size={16} color="#2ECC71" />
                                <Text style={[styles.orderTime, { color: theme.subText }]}>Completed {order.time}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
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
});

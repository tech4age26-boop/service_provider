/**
 * Provider Dashboard - Home Screen
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../App';

export function ProviderHomeScreen() {
    const { theme } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.greeting}>Welcome Back! 👋</Text>
                <Text style={[styles.shopName, { color: theme.text }]}>AutoFix Pro Center</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <MaterialCommunityIcons name="clipboard-check" size={28} color="#F4C430" />
                    <Text style={[styles.statNumber, { color: theme.text }]}>24</Text>
                    <Text style={styles.statLabel}>Active Orders</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <MaterialCommunityIcons name="account-group" size={28} color="#2ECC71" />
                    <Text style={[styles.statNumber, { color: theme.text }]}>8</Text>
                    <Text style={styles.statLabel}>Employees</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <MaterialCommunityIcons name="cash" size={28} color="#007AFF" />
                    <Text style={[styles.statNumber, { color: theme.text }]}>$3,240</Text>
                    <Text style={styles.statLabel}>Revenue Today</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                    <MaterialCommunityIcons name="star" size={28} color="#FFB800" />
                    <Text style={[styles.statNumber, { color: theme.text }]}>4.8</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </View>
            </View>

            {/* Recent Orders */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Orders</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.orderHeader}>
                        <Text style={[styles.orderTitle, { color: theme.text }]}>Oil Change Service</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#FFF3CD' }]}>
                            <Text style={[styles.statusText, { color: '#856404' }]}>In Progress</Text>
                        </View>
                    </View>
                    <Text style={styles.orderCustomer}>Customer: John Smith</Text>
                    <Text style={styles.orderTime}>Started 30 mins ago</Text>
                </View>

                <View style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.orderHeader}>
                        <Text style={[styles.orderTitle, { color: theme.text }]}>Brake Repair</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#D1ECF1' }]}>
                            <Text style={[styles.statusText, { color: '#0C5460' }]}>Pending</Text>
                        </View>
                    </View>
                    <Text style={styles.orderCustomer}>Customer: Sarah Johnson</Text>
                    <Text style={styles.orderTime}>Scheduled for 2:00 PM</Text>
                </View>
            </View>
        </ScrollView>
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 4,
    },
    shopName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    viewAll: {
        fontSize: 14,
        color: '#F4C430',
        fontWeight: '600',
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
        marginBottom: 8,
    },
    orderTitle: {
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
    orderCustomer: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    orderTime: {
        fontSize: 12,
        color: '#999',
    },
});

/**
 * Provider Dashboard - Employees Screen
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../App';

export function ProviderEmployeesScreen() {
    const { theme } = useTheme();
    const [employees] = useState([
        { id: '1', name: 'Ahmed Ali', role: 'Senior Mechanic', status: 'active', avatar: require('../assets/user_avatar.png') },
        { id: '2', name: 'Mohammed Hassan', role: 'Technician', status: 'active', avatar: require('../assets/user_avatar.png') },
        { id: '3', name: 'Khalid Omar', role: 'Assistant', status: 'active', avatar: require('../assets/user_avatar.png') },
        { id: '4', name: 'Youssef Ibrahim', role: 'Electrician', status: 'offline', avatar: require('../assets/user_avatar.png') },
    ]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>Employees</Text>
                <TouchableOpacity style={styles.addButton}>
                    <MaterialCommunityIcons name="plus" size={20} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {employees.map((employee) => (
                    <View key={employee.id} style={[styles.employeeCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.employeeInfo}>
                            <View style={styles.avatarContainer}>
                                <Image source={employee.avatar} style={styles.avatar} />
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: employee.status === 'active' ? '#2ECC71' : '#999', borderColor: theme.cardBackground }
                                ]} />
                            </View>
                            <View style={styles.employeeDetails}>
                                <Text style={[styles.employeeName, { color: theme.text }]}>{employee.name}</Text>
                                <Text style={styles.employeeRole}>{employee.role}</Text>
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.background }]}>
                                <MaterialCommunityIcons name="phone" size={20} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.background }]}>
                                <MaterialCommunityIcons name="message" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    employeeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    employeeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    employeeDetails: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    employeeRole: {
        fontSize: 14,
        color: '#8E8E93',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

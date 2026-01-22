import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DUMMY_NOTIFICATIONS = [
    {
        id: '1',
        title: 'New Service Added',
        message: 'Ceramic Coating service is now available in the system.',
        time: '2 hours ago',
        read: false,
        icon: 'star-circle',
        color: '#F4C430'
    },
    {
        id: '2',
        title: 'System Maintenance',
        message: 'System will be down for maintenance tonight at 2 AM.',
        time: '5 hours ago',
        read: true,
        icon: 'server',
        color: '#FF3B30'
    },
    {
        id: '3',
        title: 'Low Stock Alert',
        message: 'Synthetic Oil 5W-30 stock is running low.',
        time: '1 day ago',
        read: true,
        icon: 'alert-circle',
        color: '#FF9500'
    },
    {
        id: '4',
        title: 'Welcome!',
        message: 'Welcome to the new Cashier POS Dashboard.',
        time: '2 days ago',
        read: true,
        icon: 'emoticon-happy',
        color: '#2ECC71'
    }
];

export const CashierNotificationsScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
    const insets = useSafeAreaInsets();

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: theme.cardBackground, opacity: item.read ? 0.7 : 1 }
            ]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                    {!item.read && <View style={styles.dot} />}
                </View>
                <Text style={[styles.message, { color: theme.subText }]} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={[styles.time, { color: theme.subText }]}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.topHeader, { backgroundColor: theme.cardBackground, paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.screenTitle, { color: theme.text }]}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        elevation: 2,
    },
    screenTitle: { fontSize: 24, fontWeight: 'bold' },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    content: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: 16, fontWeight: 'bold' },
    message: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
    time: { fontSize: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F4C430' },
});

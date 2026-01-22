import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, Dimensions, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://filter-server.vercel.app';
const { width } = Dimensions.get('window');

// Dummy Data
const DUMMY_PRODUCTS = [
    { _id: 'd1', name: 'Full Synthetic Oil Change', price: '150', category: 'service', serviceTypes: ['Oil Replacement', 'Filter Check', 'Fluid Top-up'], color: '#FF6B6B' },
    { _id: 'd2', name: 'Premium Car Wash', price: '50', category: 'service', serviceTypes: ['Exterior Wash', 'Interior Vacuum', 'Tire Shine'], color: '#4ECDC4' },
    { _id: 'd3', name: 'Brake Pad Replacement', price: '300', category: 'service', serviceTypes: ['Front Pads', 'Rear Pads', 'Rotor Check'], color: '#45B7D1' },
    { _id: 'd4', name: 'AC Recharge', price: '200', category: 'service', serviceTypes: ['Gas Refill', 'Leak Check', 'Filter Clean'], color: '#96CEB4' },
    { _id: 'd5', name: 'Battery Replacement', price: '450', category: 'service', serviceTypes: ['New Battery', 'Terminal Cleaning', 'Charging Test'], color: '#FFEEAD' },
    { _id: 'd6', name: 'Tire Rotation', price: '80', category: 'service', serviceTypes: ['4-Wheel Rotation', 'Pressure Check', 'Balancing'], color: '#D4A5A5' }
];

export const CashierHomeScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<any[]>(DUMMY_PRODUCTS);
    const [loading, setLoading] = useState(false);
    const [cashierName, setCashierName] = useState('Cashier');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setCashierName(userData.name || userData.ownerName || 'Cashier');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item, index }: any) => {
        return (
            <TouchableOpacity
                style={[styles.productCard, { backgroundColor: theme.cardBackground }]}
                onPress={() => navigation.navigate('SelectServices', { product: item })}
                activeOpacity={0.9}
            >
                <View style={[styles.cardHeader]}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.tint + '20' }]}>
                        <MaterialCommunityIcons name="car-cog" size={24} color={theme.tint} />
                    </View>
                    <Text style={[styles.priceTag, { color: theme.tint }]}>{item.price} SAR</Text>
                </View>

                <View style={styles.cardContent}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.categoryText, { color: theme.subText }]}>{item.category.toUpperCase()}</Text>
                </View>

                <View style={[styles.addButton, { backgroundColor: theme.tint }]}>
                    <MaterialCommunityIcons name="plus" size={20} color="#000" />
                    <Text style={styles.addButtonText}>Add Order</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, paddingTop: Math.max(insets.top, 20) }]}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={[styles.dashboardTitle, { color: theme.tint }]}>Cashier Dashboard</Text>
                        <Text style={[styles.userName, { color: theme.text }]}>Hello, {cashierName}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.background }]}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={24} color={theme.text} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <MaterialCommunityIcons name="history" size={24} color={theme.tint} />
                        <View style={styles.statInfo}>
                            <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                            <Text style={[styles.statLabel, { color: theme.subText }]}>Orders Done</Text>
                        </View>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <MaterialCommunityIcons name="cash-multiple" size={24} color={theme.success} />
                        <View style={styles.statInfo}>
                            <Text style={[styles.statValue, { color: theme.text }]}>1,450</Text>
                            <Text style={[styles.statLabel, { color: theme.subText }]}>Today's Sales</Text>
                        </View>
                    </View>
                </View>

                {/* Search */}
                <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.subText} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search products & services..."
                        placeholderTextColor={theme.subText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={theme.subText} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Grid Content */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: theme.subText }}>No services found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
        // paddingTop is handled inline
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dashboardTitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    userName: { fontSize: 22, fontWeight: 'bold' },
    iconBtn: { padding: 8, borderRadius: 12 },
    badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    statInfo: { marginLeft: 12 },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 12 },

    searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F8F9FA' },
    searchInput: { flex: 1, paddingHorizontal: 8, fontSize: 16, paddingVertical: 0 },

    grid: { padding: 16 },
    row: { justifyContent: 'space-between' },
    productCard: {
        width: (width - 48) / 2, // 2 columns
        borderRadius: 16,
        marginBottom: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        justifyContent: 'space-between'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    iconContainer: { padding: 8, borderRadius: 10 },
    priceTag: { fontSize: 14, fontWeight: 'bold' },
    cardContent: { marginBottom: 12 },
    productName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    categoryText: { fontSize: 11, fontWeight: '600' },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6
    },
    addButtonText: { fontSize: 13, fontWeight: 'bold', color: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://filter-server.vercel.app';

export const SelectProductScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (!userDataStr) return;
            const userData = JSON.parse(userDataStr);
            // If cashier, use their providerId (implied they belong to one)
            // Assuming cashier user object has providerId or is linked.
            // For now, assuming cashier IS the provider or has providerId
            const providerId = userData.providerId || userData.id;

            const response = await fetch(`${API_BASE_URL}/api/products?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                // Filter for "service" categories as these are the main entry points
                setItems(result.items.filter((i: any) => i.category === 'service'));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('SelectServices', { product: item })}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="car-wrench" size={32} color={theme.tint} />
            </View>
            <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.price, { color: theme.tint }]}>{item.price} SAR</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.subText} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={[styles.title, { color: theme.text }]}>Select Service/Product</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id || item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: theme.subText, marginTop: 50 }}>
                            No services found.
                        </Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold' },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    price: { fontSize: 14, fontWeight: '600' },
});

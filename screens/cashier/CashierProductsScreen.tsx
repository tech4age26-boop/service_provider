import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const API_BASE_URL = 'https://filter-server.vercel.app';

export const CashierProductsScreen = () => {
    const { theme } = useTheme();
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
            const providerId = userData.providerId || userData.id;

            const response = await fetch(`${API_BASE_URL}/api/products?providerId=${providerId}`);
            const result = await response.json();

            if (result.success) {
                setItems(result.items);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name={item.category === 'service' ? "car-wrench" : "package-variant"}
                    size={28}
                    color={theme.tint}
                />
            </View>
            <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.details, { color: theme.subText }]}>
                    {item.category === 'service' ? 'Service' : 'Product'}
                    {item.stock ? ` • Stock: ${item.stock}` : ''}
                </Text>
            </View>
            <Text style={[styles.price, { color: theme.tint }]}>{item.price} SAR</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Products & Services</Text>
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
                            No items found.
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
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    details: { fontSize: 12 },
    price: { fontSize: 16, fontWeight: 'bold' },
});

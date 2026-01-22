import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SelectServicesScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const { product } = route.params;
    const insets = useSafeAreaInsets();
    // product.serviceTypes is the list of available sub-services
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const toggleService = (service: string) => {
        if (selectedServices.includes(service)) {
            setSelectedServices(selectedServices.filter(s => s !== service));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const handleNext = () => {
        navigation.navigate('CustomerDetails', {
            product,
            selectedServices
        });
    };

    const renderItem = ({ item }: any) => {
        const isSelected = selectedServices.includes(item);
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: theme.cardBackground, borderColor: isSelected ? theme.tint : 'transparent', borderWidth: 1 }
                ]}
                onPress={() => toggleService(item)}
            >
                <Text style={[styles.name, { color: theme.text }]}>{item}</Text>
                {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.tint} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>{product.name}</Text>
                <Text style={[styles.subtitle, { color: theme.subText }]}>Select Services Included</Text>
            </View>

            <FlatList
                data={product.serviceTypes || []}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: theme.subText, marginTop: 50 }}>
                        No sub-services defined.
                    </Text>
                }
            />

            <View style={[styles.footer, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: theme.tint, opacity: selectedServices.length === 0 ? 0.5 : 1 }]}
                    onPress={handleNext}
                    disabled={selectedServices.length === 0}
                >
                    <Text style={styles.nextText}>Next</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginTop: 4 },
    list: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: '600' },
    footer: { padding: 20, elevation: 20 },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    nextText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});

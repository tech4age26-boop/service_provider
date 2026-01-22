import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FormInput = ({ label, value, onChange, placeholder, keyboardType = 'default', theme }: any) => (
    <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={theme.subText}
            keyboardType={keyboardType}
        />
    </View>
);

export const CustomerDetailsScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const { product, selectedServices } = route.params;
    const insets = useSafeAreaInsets();

    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicleMake, setVehicleMake] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehicleYear, setVehicleYear] = useState('');
    const [plateNumber, setPlateNumber] = useState('');

    const handleNext = () => {
        if (!customerName || !phone || !vehicleMake || !vehicleModel) {
            Alert.alert('Missing Info', 'Please fill in all required fields.');
            return;
        }

        navigation.navigate('Checkout', {
            product,
            selectedServices,
            customerDetails: {
                name: customerName,
                phone,
                vehicle: {
                    make: vehicleMake,
                    model: vehicleModel,
                    year: vehicleYear,
                    plate: plateNumber
                }
            }
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Customer Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.tint }]}>Customer Info</Text>
                    <FormInput label="Full Name *" value={customerName} onChange={setCustomerName} placeholder="John Doe" theme={theme} />
                    <FormInput label="Phone Number *" value={phone} onChange={setPhone} placeholder="050xxxxxxx" keyboardType="phone-pad" theme={theme} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.tint }]}>Vehicle Info</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <FormInput label="Make *" value={vehicleMake} onChange={setVehicleMake} placeholder="Toyota" theme={theme} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <FormInput label="Model *" value={vehicleModel} onChange={setVehicleModel} placeholder="Camry" theme={theme} />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <FormInput label="Year" value={vehicleYear} onChange={setVehicleYear} placeholder="2023" keyboardType="numeric" theme={theme} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <FormInput label="Plate Number" value={plateNumber} onChange={setPlateNumber} placeholder="ABC 1234" theme={theme} />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: theme.tint }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextText}>Review & Checkout</Text>
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
    content: { padding: 20, paddingBottom: 100 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { borderRadius: 12, padding: 14, borderWidth: 1, fontSize: 16 },
    row: { flexDirection: 'row' },
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

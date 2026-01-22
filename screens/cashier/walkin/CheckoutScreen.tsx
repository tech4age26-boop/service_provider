import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { useRef } from 'react';

const API_BASE_URL = 'https://filter-server.vercel.app';

export const CheckoutScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const { product, selectedServices, customerDetails } = route.params;
    const insets = useSafeAreaInsets();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const viewShotRef = useRef(null);

    const totalAmount = parseFloat(product.price || '0');

    const handlePlaceOrder = async () => {
        try {
            setIsProcessing(true);

            // Mocking User Data if missing for local testing
            let providerId = 'mock_provider_id';
            let workshopName = 'Mock Workshop';

            try {
                const userDataStr = await AsyncStorage.getItem('user_data');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    providerId = userData.providerId || userData.id || 'mock_provider_id';
                    workshopName = userData.workshopName || 'My Workshop';
                }
            } catch (e) {
                console.warn('Session data missing, using mock data.');
            }

            // Construct Order Object
            const orderData = {
                customerId: customerDetails.phone,
                providerId: providerId,
                workshopName: workshopName,
                technicianId: null,
                vehicleDetails: customerDetails.vehicle,
                serviceType: product.name,
                products: [{ ...product, price: totalAmount }],
                notSure: false,
                status: 'pending',
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone
            };

            // MOCKING API CALL for now as requested
            // const response = await fetch(`${API_BASE_URL}/api/orders`, ...);

            // Simulate network delay
            setTimeout(() => {
                setOrderId('ORDER-' + Math.floor(Math.random() * 10000));
                Alert.alert('Success', 'Order created successfully (Local Mock)!');
                setIsProcessing(false);
            }, 1500);

        } catch (error) {
            console.error('Order Error:', error);
            Alert.alert('Error', 'Something went wrong');
            setIsProcessing(false);
        }
    };

    const handleShareInvoice = async () => {
        try {
            const uri = await captureRef(viewShotRef, {
                format: 'jpg',
                quality: 0.8,
            });

            await Share.open({
                url: uri,
                message: `Invoice for Order #${orderId}`,
            });
        } catch (error) {
            console.error('Sharing Error:', error);
            // Alert.alert('Error', 'Could not share invoice.'); 
            // Share.open cancellation throws error, so silence it or check error code
        }
    };

    const InvoiceView = () => (
        <ViewShot ref={viewShotRef} style={[styles.invoiceContainer, { backgroundColor: '#fff' }]}>
            <View style={styles.invoiceHeader}>
                <View style={[styles.logoPlaceholder, { backgroundColor: theme.tint }]}>
                    <MaterialCommunityIcons name="car-wrench" size={32} color="#000" />
                </View>
                <View>
                    <Text style={styles.companyName}>SERVICE PROVIDER</Text>
                    <Text style={styles.companyDetails}>Industrial Area, Riyadh</Text>
                    <Text style={styles.companyDetails}>+966 50 123 4567</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.invoiceRow}>
                <View>
                    <Text style={styles.invoiceLabel}>Bill To:</Text>
                    <Text style={styles.invoiceValue}>{customerDetails.name}</Text>
                    <Text style={styles.invoiceSubValue}>{customerDetails.phone}</Text>
                    <Text style={styles.invoiceSubValue}>{customerDetails.vehicle.make} {customerDetails.vehicle.model} ({customerDetails.vehicle.plate})</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.invoiceLabel}>Invoice #</Text>
                    <Text style={styles.invoiceValue}>{orderId}</Text>
                    <Text style={styles.invoiceLabel}>Date</Text>
                    <Text style={styles.invoiceValue}>{new Date().toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Description</Text>
                <Text style={styles.tableHeaderText}>Amount</Text>
            </View>

            <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{product.name}</Text>
                <Text style={styles.tableCell}>{product.price} SAR</Text>
            </View>
            {selectedServices.map((s: string, i: number) => (
                <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { color: '#666', fontSize: 12 }]}>- {s}</Text>
                </View>
            ))}

            <View style={[styles.divider, { marginVertical: 20 }]} />

            <View style={styles.totalRow}>
                <Text style={styles.totalText}>TOTAL</Text>
                <Text style={styles.totalAmount}>{product.price} SAR</Text>
            </View>

            <View style={styles.invoiceFooter}>
                <Text style={styles.footerText}>Thank you for your business!</Text>
            </View>
        </ViewShot>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Order Summary</Text>

                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.subText }]}>Product</Text>
                        <Text style={[styles.value, { color: theme.text }]}>{product.name}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.subText }]}>Services</Text>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            {selectedServices.map((s: string, i: number) => (
                                <Text key={i} style={[styles.value, { color: theme.text }]}>{s}</Text>
                            ))}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: theme.tint }]}>{product.price} SAR</Text>
                    </View>
                </View>

                {orderId && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>Invoice Preview</Text>
                        <InvoiceView />
                    </View>
                )}

                {!orderId && (
                    <View style={[styles.card, { backgroundColor: theme.cardBackground, marginTop: 16 }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Customer Info</Text>
                        <Text style={[styles.text, { color: theme.text }]}>{customerDetails.name}</Text>
                        <Text style={[styles.text, { color: theme.subText }]}>{customerDetails.phone}</Text>
                        <Text style={[styles.text, { color: theme.subText, marginTop: 4 }]}>
                            {customerDetails.vehicle.make} {customerDetails.vehicle.model} ({customerDetails.vehicle.plate})
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.cardBackground }]}>
                {!orderId ? (
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: theme.tint }]}
                        onPress={handlePlaceOrder}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.btnText}>Generate Invoice & Order</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#25D366' }]}
                            onPress={handleShareInvoice}
                        >
                            <MaterialCommunityIcons name="whatsapp" size={24} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={[styles.btnText, { color: '#FFF' }]}>Share Invoice Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.cardBackground, borderWidth: 1, borderColor: theme.border }]}
                            onPress={() => navigation.popToTop()}
                        >
                            <Text style={[styles.btnText, { color: theme.text }]}>New Customer</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold' },
    content: { padding: 20 },
    card: { padding: 20, borderRadius: 16, shadowColor: '#000', elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 14 },
    value: { fontSize: 14, fontWeight: '600' },
    text: { fontSize: 14, marginBottom: 2 },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 12 },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold' },
    footer: { padding: 20, elevation: 20 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    btnText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    invoiceContainer: { padding: 20, borderRadius: 12, backgroundColor: '#fff', elevation: 3 },
    invoiceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    logoPlaceholder: { width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    companyName: { fontSize: 18, fontWeight: '900', color: '#000', textTransform: 'uppercase' },
    companyDetails: { fontSize: 12, color: '#555' },
    invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    invoiceLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
    invoiceValue: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 5 },
    invoiceSubValue: { fontSize: 12, color: '#333' },
    tableHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8, marginBottom: 8 },
    tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    tableCell: { fontSize: 14, color: '#333' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10 },
    totalText: { fontSize: 16, fontWeight: '900', color: '#000' },
    totalAmount: { fontSize: 18, fontWeight: '900', color: '#000' },
    invoiceFooter: { marginTop: 30, alignItems: 'center' },
    footerText: { fontSize: 12, color: '#888', fontStyle: 'italic' },
});

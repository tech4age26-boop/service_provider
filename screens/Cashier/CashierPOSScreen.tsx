import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    Dimensions,
    ActivityIndicator,
    Modal
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { API_BASE_URL } from '../../constants/api';

const { width, height } = Dimensions.get('window');


interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    sellingPrice: number;
    category: string;
    image?: string;
    stock: number;
}

interface CartItem extends Product {
    quantity: number;
    discount: number;
}

interface CashierPOSScreenProps {
    onLogout: () => void;
}

export function CashierPOSScreen({ onLogout }: CashierPOSScreenProps) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useTranslation();

    const [services, setServices] = useState<string[]>([]);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sidebar State
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [discount, setDiscount] = useState('0');

    const [viewState, setViewState] = useState<'services' | 'products'>('services');

    const DUMMY_PRODUCTS: Product[] = [
        { _id: '1', name: 'Synthetic Oil 5W-30', description: 'Premium synthetic oil', price: 80, sellingPrice: 120, category: 'Oil Change', stock: 50 },
        { _id: '2', name: 'Standard Oil 10W-40', description: 'Standard engine oil', price: 40, sellingPrice: 65, category: 'Oil Change', stock: 100 },
        { _id: '3', name: 'Oil Filter Toyota', description: 'Original Oil Filter', price: 20, sellingPrice: 35, category: 'Filters', stock: 30 },
        { _id: '4', name: 'Air Filter Nissan', description: 'High flow air filter', price: 25, sellingPrice: 45, category: 'Filters', stock: 25 },
        { _id: '5', name: 'Brake Pads Front', description: 'Ceramic brake pads', price: 150, sellingPrice: 220, category: 'Brakes', stock: 15 },
        { _id: '6', name: 'Coolant Red', description: 'Long life coolant', price: 30, sellingPrice: 50, category: 'Fluids', stock: 40 },
        { _id: '7', name: 'Wiper Blades', description: 'All weather wipers', price: 15, sellingPrice: 30, category: 'Accessories', stock: 60 },
        { _id: '8', name: 'Basic Car Wash', description: 'Exterior wash', price: 25, sellingPrice: 40, category: 'Car Wash', stock: 999 },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const userDataStr = await AsyncStorage.getItem('user_data');

            let allProducts: Product[] = [];

            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                const providerId = userData.workshopId || userData.id || userData._id;
                try {
                    const response = await fetch(`${API_BASE_URL}/api/products?providerId=${providerId}`);
                    const result = await response.json();
                    if (result.success && result.products?.length > 0) {
                        allProducts = result.products || result.items || [];
                    }
                } catch (err) {
                    console.log('API Fetch failed, using dummy');
                }
            }

            if (allProducts.length === 0) {
                allProducts = DUMMY_PRODUCTS;
            }

            setProducts(allProducts);
            const cats = Array.from(new Set(allProducts.map((p: any) => p.category))).filter((c: any) => c) as string[];
            setServices(cats);

        } catch (e) {
            console.error('Fetch Error:', e);
            setProducts(DUMMY_PRODUCTS);
            const cats = Array.from(new Set(DUMMY_PRODUCTS.map((p: any) => p.category))).filter((c: any) => c) as string[];
            setServices(cats);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceSelect = (service: string) => {
        setSelectedService(service);
        setFilteredProducts(products.filter(p => p.category === service));
        setViewState('products');
    };

    const handleBackToServices = () => {
        setViewState('services');
        setSelectedService(null);
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantity('1');
        setDiscount('0');
        setShowSidebar(true);
    };

    const addToCart = () => {
        if (!selectedProduct) return;

        const qty = parseInt(quantity) || 1;
        const disc = parseFloat(discount) || 0;

        const existingItem = cart.find(item => item._id === selectedProduct._id);

        if (existingItem) {
            setCart(cart.map(item =>
                item._id === selectedProduct._id
                    ? { ...item, quantity: item.quantity + qty, discount: disc }
                    : item
            ));
        } else {
            setCart([...cart, { ...selectedProduct, quantity: qty, discount: disc }]);
        }
    };

    const handleProceed = () => {
        Alert.alert('Success', 'Order has been proceeded to technician!');
        setCart([]);
        setShowSidebar(false);
        setViewState('services');
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => {
            const price = item.sellingPrice || item.price || 0;
            const total = price * item.quantity;
            return sum + (total - item.discount);
        }, 0);
    };

    const StatsGrid = () => (
        <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.statIcon, { backgroundColor: '#FFF9E6' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#F4C430" />
                </View>
                <View>
                    <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                    <Text style={[styles.statLabel, { color: theme.subText }]}>Pending</Text>
                </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.statIcon, { backgroundColor: '#E1F5FE' }]}>
                    <MaterialCommunityIcons name="cached" size={24} color="#03A9F4" />
                </View>
                <View>
                    <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
                    <Text style={[styles.statLabel, { color: theme.subText }]}>Processing</Text>
                </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={24} color="#4CAF50" />
                </View>
                <View>
                    <Text style={[styles.statValue, { color: theme.text }]}>28</Text>
                    <Text style={[styles.statLabel, { color: theme.subText }]}>Completed</Text>
                </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.statIcon, { backgroundColor: '#F3E5F5' }]}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#9C27B0" />
                </View>
                <View>
                    <Text style={[styles.statValue, { color: theme.text }]}>{services.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.subText }]}>Total Services</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {viewState === 'products' && (
                        <TouchableOpacity onPress={handleBackToServices} style={{ marginRight: 10 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>POS Terminal</Text>
                        <Text style={{ color: theme.subText, fontSize: 12 }}>
                            {viewState === 'services' ? 'Dashboard' : selectedService}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                    <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 15 }} showsVerticalScrollIndicator={false}>
                {viewState === 'services' && (
                    <>
                        <StatsGrid />
                        <Text style={[styles.sectionTitle, { color: theme.text, marginVertical: 15 }]}>Main Services</Text>
                        <View style={styles.servicesGrid}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#F4C430" style={{ marginTop: 20 }} />
                            ) : services.length === 0 ? (
                                <View style={styles.center}>
                                    <MaterialCommunityIcons name="store-remove" size={50} color={theme.subText} />
                                    <Text style={{ color: theme.subText, marginTop: 10 }}>No services found</Text>
                                </View>
                            ) : (
                                services.map((service, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.serviceCard, { backgroundColor: theme.cardBackground }]}
                                        onPress={() => handleServiceSelect(service)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.serviceIconCircle, { backgroundColor: '#F4C430' }]}>
                                            <MaterialCommunityIcons name={service.toLowerCase().includes('wash') ? 'car-wash' : 'car-cog'} size={32} color="#1C1C1E" />
                                        </View>
                                        <Text style={[styles.serviceCardTitle, { color: theme.text }]}>{service}</Text>
                                        <View style={styles.serviceArrow}>
                                            <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </>
                )}

                {viewState === 'products' && (
                    <View style={styles.productsGrid}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 }}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{selectedService} Products</Text>
                            <TouchableOpacity onPress={handleBackToServices}>
                                <Text style={{ color: '#F4C430', fontWeight: 'bold' }}>Back to Services</Text>
                            </TouchableOpacity>
                        </View>
                        {filteredProducts.map((product) => (
                            <TouchableOpacity
                                key={product._id}
                                style={[styles.productCard, { backgroundColor: theme.cardBackground }]}
                                onPress={() => handleProductClick(product)}
                            >
                                <View style={[styles.productImagePlaceholder, { backgroundColor: theme.inputBackground }]}>
                                    <MaterialCommunityIcons name="tag-outline" size={40} color="#F4C430" />
                                </View>
                                <View style={{ padding: 12 }}>
                                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{product.name}</Text>
                                    <Text style={{ color: theme.subText, fontSize: 12, marginBottom: 4 }}>Stock: {product.stock}</Text>
                                    <Text style={[styles.productPrice, { color: theme.text }]}>
                                        {(product.sellingPrice || product.price || 0).toFixed(2)} SAR
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Cart Summary Bar (Optional if needed) */}
            {cart.length > 0 && viewState === 'products' && (
                <View style={[styles.cartBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
                    <View>
                        <Text style={{ color: theme.subText }}>Total: {cart.length} items</Text>
                        <Text style={[styles.totalAmount, { color: theme.text }]}>{calculateTotal().toFixed(2)} SAR</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F4C430' }]} onPress={() => setShowSidebar(true)}>
                        <Text style={{ color: '#1C1C1E', fontWeight: 'bold' }}>Review Order</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Sidebar Modal */}
            <Modal visible={showSidebar} transparent animationType="slide" onRequestClose={() => setShowSidebar(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.sidebarContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.sidebarHeader}>
                            <View>
                                <Text style={[styles.sidebarTitle, { color: theme.text }]}>Configuration</Text>
                                <Text style={{ color: '#F4C430', fontWeight: 'bold' }}>{selectedService}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowSidebar(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedProduct && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.productDetailBox}>
                                    <View style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: theme.inputBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        <MaterialCommunityIcons name="tag-outline" size={30} color="#F4C430" />
                                    </View>
                                    <Text style={[styles.detailName, { color: theme.text }]}>{selectedProduct.name}</Text>
                                    <Text style={[styles.detailPrice, { color: theme.text }]}>
                                        {(selectedProduct.sellingPrice || selectedProduct.price || 0).toFixed(2)} <Text style={{ fontSize: 14, color: theme.subText }}>SAR</Text>
                                    </Text>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Quantity</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <TouchableOpacity
                                            style={[styles.qtyBtn, { backgroundColor: theme.inputBackground }]}
                                            onPress={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                                        >
                                            <MaterialCommunityIcons name="minus" size={24} color={theme.text} />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[styles.qtyInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
                                            value={quantity}
                                            keyboardType="numeric"
                                            onChangeText={setQuantity}
                                            textAlign="center"
                                        />
                                        <TouchableOpacity
                                            style={[styles.qtyBtn, { backgroundColor: theme.inputBackground }]}
                                            onPress={() => setQuantity((parseInt(quantity) + 1).toString())}
                                        >
                                            <MaterialCommunityIcons name="plus" size={24} color={theme.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Discount (SAR)</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
                                        value={discount}
                                        keyboardType="numeric"
                                        onChangeText={setDiscount}
                                        placeholder="0.00"
                                        placeholderTextColor={theme.subText}
                                    />
                                </View>

                                <View style={[styles.summaryBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF9E6' }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ color: theme.subText }}>Subtotal</Text>
                                        <Text style={{ color: theme.text }}>{((selectedProduct.sellingPrice || 0) * parseInt(quantity || '1')).toFixed(2)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ color: theme.subText }}>Discount</Text>
                                        <Text style={{ color: '#FF3B30' }}>- {parseFloat(discount || '0').toFixed(2)}</Text>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 8 }} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Total</Text>
                                        <Text style={{ color: '#F4C430', fontWeight: 'bold', fontSize: 18 }}>
                                            {(((selectedProduct.sellingPrice || 0) * parseInt(quantity || '1')) - parseFloat(discount || '0')).toFixed(2)} SAR
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ gap: 12, marginTop: 10 }}>
                                    <TouchableOpacity
                                        style={styles.mainActionBtn}
                                        onPress={() => {
                                            addToCart();
                                            handleProceed();
                                        }}
                                    >
                                        <Text style={styles.mainActionText}>Proceed to Tech</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color="#1C1C1E" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.skipBtn}
                                        onPress={() => setShowSidebar(false)}
                                    >
                                        <Text style={{ color: theme.subText, fontWeight: '700' }}>Skip</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, elevation: 2, shadowOpacity: 0.05 },
    headerTitle: { fontSize: 20, fontWeight: '800' },
    logoutBtn: { padding: 8, backgroundColor: '#FFE5E5', borderRadius: 8 },

    center: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },

    // Stats Grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    statCard: { flex: 1, minWidth: '45%', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowOpacity: 0.05 },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 12 },

    sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Services Grid
    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    serviceCard: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, elevation: 2, shadowOpacity: 0.1, shadowRadius: 8, height: 90 },
    serviceIconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    serviceCardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
    serviceArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' },

    // Products Grid
    productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    productCard: { width: '48%', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowOpacity: 0.05 },
    productImagePlaceholder: { height: 100, alignItems: 'center', justifyContent: 'center' },
    productName: { fontSize: 14, fontWeight: '600', marginBottom: 8, height: 40 },
    productPrice: { fontSize: 16, fontWeight: 'bold' },

    // Sidebar
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', justifyContent: 'flex-end' },
    sidebarContent: { width: '85%', maxWidth: 400, height: '100%', padding: 24, borderTopLeftRadius: 30, borderBottomLeftRadius: 30, elevation: 5 },
    sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    sidebarTitle: { fontSize: 24, fontWeight: '800' },

    productDetailBox: { marginBottom: 30 },
    detailName: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    detailPrice: { fontSize: 26, fontWeight: '900' },

    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },

    qtyBtn: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    qtyInput: { flex: 1, height: 50, borderRadius: 12, fontSize: 18, fontWeight: 'bold' },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 15, fontSize: 16 },

    summaryBox: { padding: 20, borderRadius: 16, marginBottom: 20 },

    mainActionBtn: { backgroundColor: '#F4C430', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 4 },
    mainActionText: { fontWeight: '800', fontSize: 16, color: '#1C1C1E' },
    skipBtn: { height: 55, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

    // Cart Bar
    cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopWidth: 1, elevation: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    totalAmount: { fontSize: 20, fontWeight: '900' },
    actionBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }
});

/**
 * Provider Dashboard - Products & Services Screen
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Image,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

interface Service {
    id: string;
    name: string;
    price: string;
    duration: string;
    category: 'service' | 'product';
    images?: string[];
    subCategory?: string; // The specific dropdown category
    stock?: string;
    sku?: string;
    status?: 'active' | 'inactive';
    serviceTypes?: string[];
}

const SERVICE_CATEGORIES = ['Diagnostics', 'Quick Service', 'Tuning', 'Detailing', 'Oil Change', 'Tires & Alignment', 'Engine', 'Electrical'];
const PRODUCT_CATEGORIES = ['Brake Pads', 'Filters', 'Fluids', 'Tires', 'Accessories', 'Engine Parts', 'Tools'];
const { width } = Dimensions.get('window');

// --- Reusable Components ---

const FormLabel = ({ text, required, theme }: { text: string, required?: boolean, theme: any }) => (
    <Text style={[styles.label, { color: theme.text }]}>
        {text} {required && <Text style={{ color: '#FF3B30' }}>*</Text>}
    </Text>
);

const FormInput = ({
    label,
    required,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    theme
}: any) => (
    <View style={{ marginBottom: 16 }}>
        <FormLabel text={label} required={required} theme={theme} />
        <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, marginBottom: 0 }]}
            placeholder={placeholder}
            placeholderTextColor={theme.inputPlaceholder || '#999'}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
        />
    </View>
);

const DetailRow = ({ icon, label, value, theme }: any) => (
    <View style={styles.detailRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            <MaterialCommunityIcons name={icon} size={20} color={theme.subText} style={{ marginRight: 8 }} />
            <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
        </View>
        <Text style={[styles.detailValue, { color: theme.text }]}>{value || '-'}</Text>
    </View>
);

// --- Custom Alert Modal ---
const CustomAlert = ({ visible, title, message, buttons, onClose, theme }: any) => (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <View style={[styles.customAlertContainer, { backgroundColor: theme.cardBackground }]}>
                {title && <Text style={[styles.customAlertTitle, { color: theme.text }]}>{title}</Text>}
                {message && <Text style={[styles.customAlertMessage, { color: theme.subText }]}>{message}</Text>}

                <View style={[styles.customAlertButtonsContainer]}>
                    {buttons.map((btn: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.customAlertButton,
                                // Dynamic background for different styles
                                { backgroundColor: btn.style === 'destructive' ? '#FFE5E5' : (btn.style === 'cancel' ? theme.background : theme.background) },
                                index > 0 && { marginTop: 8 }
                            ]}
                            onPress={() => {
                                if (btn.onPress) btn.onPress();
                                else onClose();
                            }}>
                            <Text style={[
                                styles.customAlertButtonText,
                                { color: btn.style === 'destructive' ? '#FF3B30' : (btn.style === 'cancel' ? theme.subText : '#007AFF'), fontWeight: btn.style === 'cancel' ? '600' : 'bold' }
                            ]}>
                                {btn.text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    </Modal>
);

export function ProductsServicesScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();


    // --- State ---
    const [items, setItems] = useState<Service[]>([
        { id: '1', name: 'Oil Change', price: '50', duration: '30', category: 'service', subCategory: 'Oil Change', status: 'active', serviceTypes: ['Oil Change'] },
        { id: '2', name: 'Brake Pads', price: '120', duration: '60', category: 'product', subCategory: 'Brake Pads', status: 'active', stock: '15', sku: 'PRD-12345' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Service | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'services' | 'products'>('all');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Custom Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', buttons: [] as any[] });

    const initialFormState: Partial<Service> = {
        name: '',
        price: '',
        duration: '',
        category: 'service',
        subCategory: '',
        images: [],
        stock: '',
        sku: '',
        status: 'active',
        serviceTypes: []
    };

    const [newItem, setNewItem] = useState<Partial<Service>>(initialFormState);

    const filteredItems = items.filter(item => {
        if (activeTab === 'all') return true;
        if (activeTab === 'services') return item.category === 'service';
        if (activeTab === 'products') return item.category === 'product';
        return true;
    });

    // --- Actions ---

    const showAlert = (title: string, message: string, buttons: any[]) => {
        setAlertConfig({ title, message, buttons });
        setAlertVisible(true);
    };

    const closeAlert = () => {
        setAlertVisible(false);
    };

    const switchFormType = (type: 'service' | 'product') => {
        if (newItem.category !== type) {
            setNewItem({
                ...initialFormState,
                category: type,
                subCategory: type === 'product' ? PRODUCT_CATEGORIES[0] : '',
            });
            setIsCategoryOpen(false);
        }
    };

    const handleImagePick = async () => {
        const currentImages = newItem.images || [];
        if (currentImages.length >= 4) {
            showAlert('Limit Reached', 'You can upload a maximum of 4 images.', [{ text: 'OK', onPress: closeAlert }]);
            return;
        }

        const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 4 - currentImages.length });

        if (result.assets) {
            const newUris = result.assets.map(a => a.uri).filter(u => u !== undefined) as string[];
            setNewItem({ ...newItem, images: [...currentImages, ...newUris] });
        }
    };

    const removeImage = (index: number) => {
        const currentImages = newItem.images || [];
        setNewItem({ ...newItem, images: currentImages.filter((_, i) => i !== index) });
    };

    const generateSKU = () => {
        const prefix = newItem.category === 'service' ? 'SVC' : 'PRD';
        const random = Math.floor(Math.random() * 100000).toString().padStart(6, '0');
        setNewItem({ ...newItem, sku: `${prefix}-${random}` });
    };

    const validateForm = () => {
        const missingFields: string[] = [];
        const invalidFields: string[] = [];

        if (!newItem.name) missingFields.push('Product Name');

        // Price Validation
        if (!newItem.price) {
            missingFields.push('Price');
        } else if (isNaN(Number(newItem.price)) || Number(newItem.price) < 0) {
            invalidFields.push('Price must be a valid number');
        }

        if (newItem.category === 'product') {
            if (!newItem.subCategory) missingFields.push('Category');
            // Stock Validation
            if (!newItem.stock) {
                missingFields.push('Stock Quantity');
            } else if (isNaN(Number(newItem.stock)) || !Number.isInteger(Number(newItem.stock)) || Number(newItem.stock) < 0) {
                invalidFields.push('Stock Quantity must be a valid integer');
            }
            if (!newItem.sku) missingFields.push('SKU');
        } else {
            if (!newItem.serviceTypes || newItem.serviceTypes.length === 0) missingFields.push('Service Type');
            // Duration Validation
            if (!newItem.duration) {
                missingFields.push('Duration');
            } else if (isNaN(Number(newItem.duration)) || Number(newItem.duration) <= 0) {
                invalidFields.push('Duration must be a valid number (minutes)');
            }
        }

        if (missingFields.length > 0) {
            showAlert('Missing Fields', `Please fill the following required fields:\n\n${missingFields.join('\n')}`, [{ text: 'OK', onPress: closeAlert }]);
            return false;
        }

        if (invalidFields.length > 0) {
            showAlert('Invalid Input', `Please correct the following errors:\n\n${invalidFields.join('\n')}`, [{ text: 'OK', onPress: closeAlert }]);
            return false;
        }

        return true;
    };

    const handleSaveItem = () => {
        if (!validateForm()) return;

        if (isEditing) {
            setItems(items.map(item => item.id === newItem.id ? { ...item, ...newItem } as Service : item));
        } else {
            const item: Service = {
                id: Date.now().toString(),
                name: newItem.name!,
                price: newItem.price!,
                duration: newItem.duration || '-',
                category: newItem.category || 'service',
                subCategory: newItem.subCategory,
                images: newItem.images,
                stock: newItem.stock,
                sku: newItem.sku,
                status: newItem.status,
                serviceTypes: newItem.serviceTypes
            };
            setItems([...items, item]);
        }

        setShowAddModal(false);
        setNewItem(initialFormState);
        setIsEditing(false);
    };

    const handleEditStart = (item: Service) => {
        setNewItem({ ...item });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDelete = (id: string, fromDetail: boolean = false) => {
        if (fromDetail) setShowDetailModal(false);

        // Slight delay to allow modal transition if any
        setTimeout(() => {
            showAlert('Delete Item', 'Are you sure you want to delete this item?', [
                { text: 'Cancel', style: 'cancel', onPress: () => { if (fromDetail) setShowDetailModal(true); closeAlert(); } },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setItems(items.filter(i => i.id !== id));
                        closeAlert();
                    }
                }
            ]);
        }, 100);
    };

    const openAddModal = () => {
        const defaultCategory = activeTab === 'products' ? 'product' : 'service';
        setNewItem({
            ...initialFormState,
            category: defaultCategory,
            subCategory: defaultCategory === 'product' ? PRODUCT_CATEGORIES[0] : '',
        });
        setIsEditing(false);
        setShowAddModal(true);
    };

    const openDetailModal = (item: Service) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const toggleServiceType = (type: string) => {
        const currentTypes = newItem.serviceTypes || [];
        if (currentTypes.includes(type)) {
            setNewItem({ ...newItem, serviceTypes: currentTypes.filter(t => t !== type) });
        } else {
            setNewItem({ ...newItem, serviceTypes: [...currentTypes, type] });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header and Tabs */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('products.title')}</Text>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <MaterialCommunityIcons name="plus" size={20} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
                {[
                    { key: 'all', label: t('common.view_all') },
                    { key: 'services', label: t('products.services') },
                    { key: 'products', label: t('products.parts') }
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key as any)}>
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText, activeTab !== tab.key && { color: theme.subText }]}>
                            {tab.label} ({tab.key === 'all' ? items.length : items.filter(i => i.category === (tab.key === 'services' ? 'service' : 'product')).length})
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.itemCard, { backgroundColor: theme.cardBackground, opacity: item.status === 'inactive' ? 0.6 : 1 }]}
                        onPress={() => openDetailModal(item)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.itemHeader}>
                            <View style={styles.itemInfo}>
                                <MaterialCommunityIcons
                                    name={item.category === 'service' ? 'wrench' : 'package-variant'}
                                    size={24}
                                    color="#F4C430"
                                />
                                <View style={styles.itemDetails}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                        {item.status === 'inactive' && <Text style={{ fontSize: 10, color: '#FF3B30', fontWeight: 'bold' }}>INACTIVE</Text>}
                                    </View>
                                    <Text style={styles.itemDuration}>
                                        {item.category === 'service'
                                            ? `${item.serviceTypes?.slice(0, 2).join(', ') || item.subCategory}`
                                            : item.subCategory
                                        } • {item.category === 'service' ? `${item.duration} min` : `Stock: ${item.stock || '-'}`}
                                        {item.category === 'service' && (item.serviceTypes?.length || 0) > 2 && ` +${(item.serviceTypes?.length || 0) - 2}`}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.itemPrice}>{item.price} SAR</Text>
                        </View>
                        <View style={[styles.itemActions, { borderTopColor: theme.border }]}>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.background }]} onPress={() => handleEditStart(item)}>
                                <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
                                <Text style={styles.actionBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: theme.background }]} onPress={() => handleDelete(item.id)}>
                                <MaterialCommunityIcons name="delete" size={18} color="#FF3B30" />
                                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal statusBarTranslucent visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{isEditing ? 'Edit' : 'Add'} {newItem.category === 'service' ? 'Service' : 'Product'}</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {/* Type Switcher */}
                            {!isEditing && (
                                <View style={styles.categoryContainer}>
                                    {['service', 'product'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.categoryBtn, { borderColor: theme.border }, newItem.category === type && styles.categoryBtnActive]}
                                            onPress={() => switchFormType(type as any)}>
                                            <MaterialCommunityIcons name={type === 'service' ? "wrench" : "package-variant"} size={20} color={newItem.category === type ? '#F4C430' : theme.subText} />
                                            <Text style={[styles.categoryText, { color: theme.subText }, newItem.category === type && styles.categoryTextActive]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Status */}
                            <View style={[styles.formRow, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }]}>
                                <FormLabel text={`Status: ${newItem.status === 'active' ? 'Active' : 'Inactive'}`} theme={theme} />
                                <Switch
                                    value={newItem.status === 'active'}
                                    onValueChange={(val) => setNewItem({ ...newItem, status: val ? 'active' : 'inactive' })}
                                    trackColor={{ false: "#767577", true: "#F4C430" }}
                                    thumbColor={"#FFFFFF"}
                                />
                            </View>

                            {/* Images */}
                            <FormLabel text={`Images (${newItem.images?.length || 0}/4)`} theme={theme} />
                            <View style={styles.imageScroll}>
                                <TouchableOpacity style={[styles.addImageBtn, { borderColor: theme.border }]} onPress={handleImagePick}>
                                    <MaterialCommunityIcons name="camera-plus" size={24} color={theme.subText} />
                                </TouchableOpacity>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {newItem.images?.map((uri, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image source={{ uri }} style={styles.uploadedImage} />
                                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                                                <MaterialCommunityIcons name="close" size={12} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <FormInput label="Product Name" required value={newItem.name} onChangeText={(text: string) => setNewItem({ ...newItem, name: text })} placeholder="Name" theme={theme} />

                            {/* Category - Product Only */}
                            {newItem.category === 'product' && (
                                <View style={{ marginBottom: 16 }}>
                                    <FormLabel text="Category" required theme={theme} />
                                    <TouchableOpacity
                                        style={[styles.dropdownSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
                                        onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
                                        <Text style={{ color: newItem.subCategory ? theme.text : theme.subText }}>{newItem.subCategory || 'Select Category'}</Text>
                                        <MaterialCommunityIcons name={isCategoryOpen ? "chevron-up" : "chevron-down"} size={20} color={theme.subText} />
                                    </TouchableOpacity>

                                    {isCategoryOpen && (
                                        <View style={[styles.dropdownList, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                            {PRODUCT_CATEGORIES.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                    onPress={() => { setNewItem({ ...newItem, subCategory: cat }); setIsCategoryOpen(false); }}>
                                                    <Text style={{ color: theme.text }}>{cat}</Text>
                                                    {newItem.subCategory === cat && <MaterialCommunityIcons name="check" size={16} color="#F4C430" />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Service Types - Service Only */}
                            {newItem.category === 'service' && (
                                <View style={{ marginBottom: 16 }}>
                                    <FormLabel text="Service Type (Multi Select)" required theme={theme} />
                                    <View style={styles.chipContainer}>
                                        {SERVICE_CATEGORIES.map((type) => {
                                            const isSelected = newItem.serviceTypes?.includes(type);
                                            return (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[styles.chip, { backgroundColor: isSelected ? '#1C1C1E' : theme.background, borderColor: theme.border }]}
                                                    onPress={() => toggleServiceType(type)}>
                                                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>{type}</Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <FormInput label="Price (SAR)" required value={newItem.price} onChangeText={(text: string) => setNewItem({ ...newItem, price: text })} placeholder="0.00" keyboardType="numeric" theme={theme} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    {newItem.category === 'product' ? (
                                        <FormInput label="Stock Quantity" required value={newItem.stock} onChangeText={(text: string) => setNewItem({ ...newItem, stock: text })} placeholder="0" keyboardType="numeric" theme={theme} />
                                    ) : (
                                        <FormInput label="Duration (min)" required value={newItem.duration} onChangeText={(text: string) => setNewItem({ ...newItem, duration: text })} placeholder="30" keyboardType="numeric" theme={theme} />
                                    )}
                                </View>
                            </View>

                            {newItem.category === 'product' && (
                                <>
                                    <FormLabel text="SKU / Product Code" required theme={theme} />
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, backgroundColor: theme.background, borderColor: theme.border, color: theme.text, marginBottom: 0 }]}
                                            placeholder="Enter or Generate"
                                            placeholderTextColor={theme.subText}
                                            value={newItem.sku}
                                            onChangeText={(text) => setNewItem({ ...newItem, sku: text })}
                                        />
                                        <TouchableOpacity
                                            style={[styles.saveButton, { marginTop: 0, justifyContent: 'center', paddingHorizontal: 15, backgroundColor: '#F4C430' }]}
                                            onPress={generateSKU}>
                                            <Text style={[styles.saveButtonText, { color: '#1C1C1E', fontSize: 13 }]}>Generate</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                                <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Item'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Detail Modal */}
            <Modal statusBarTranslucent visible={showDetailModal} transparent={true} animationType="fade" onRequestClose={() => setShowDetailModal(false)}>
                <View style={styles.modalOverlay}>
                    {selectedItem && (
                        <View style={[styles.detailModalContent, { backgroundColor: theme.cardBackground }]}>
                            {/* Detail Header */}
                            <View style={styles.detailHeader}>
                                <View>
                                    <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedItem.name}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: selectedItem.status === 'active' ? '#E8F5E9' : '#FFEBEE' }]}>
                                        <Text style={[styles.statusText, { color: selectedItem.status === 'active' ? '#2ECC71' : '#FF3B30' }]}>
                                            {selectedItem.status?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeBtn}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Images */}
                                {selectedItem.images && selectedItem.images.length > 0 ? (
                                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.detailImageScroll}>
                                        {selectedItem.images.map((uri, i) => (
                                            <Image key={i} source={{ uri }} style={styles.detailImage} resizeMode="cover" />
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={[styles.detailImagePlaceholder, { backgroundColor: theme.background }]}>
                                        <MaterialCommunityIcons name="image-off" size={40} color={theme.subText} />
                                        <Text style={{ color: theme.subText, marginTop: 8 }}>No Images Available</Text>
                                    </View>
                                )}

                                {/* Details Info */}
                                <View style={styles.detailSection}>
                                    <DetailRow icon="tag-outline" label="Category" value={selectedItem.category.toUpperCase()} theme={theme} />

                                    {selectedItem.category === 'product' ? (
                                        <>
                                            <DetailRow icon="shape-outline" label="Type" value={selectedItem.subCategory} theme={theme} />
                                            <DetailRow icon="barcode" label="SKU" value={selectedItem.sku} theme={theme} />
                                            <DetailRow icon="cube-outline" label="Stock" value={selectedItem.stock} theme={theme} />
                                        </>
                                    ) : (
                                        <>
                                            <DetailRow icon="format-list-bulleted" label="Services" value={selectedItem.serviceTypes?.join(', ')} theme={theme} />
                                            <DetailRow icon="clock-outline" label="Duration" value={`${selectedItem.duration} min`} theme={theme} />
                                        </>
                                    )}

                                    <DetailRow icon="cash" label="Price" value={`${selectedItem.price} SAR`} theme={theme} />
                                </View>
                            </ScrollView>

                            <View style={[styles.detailActions, { borderTopColor: theme.border }]}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: theme.background }]}
                                    onPress={() => {
                                        setShowDetailModal(false);
                                        handleEditStart(selectedItem);
                                    }}>
                                    <MaterialCommunityIcons name="pencil" size={20} color="#007AFF" />
                                    <Text style={styles.actionBtnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.deleteBtn, { backgroundColor: theme.background }]}
                                    onPress={() => handleDelete(selectedItem.id, true)}>
                                    <MaterialCommunityIcons name="delete" size={20} color="#FF3B30" />
                                    <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            {/* Custom Alert Modal */}
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={closeAlert}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E' },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4C430', alignItems: 'center', justifyContent: 'center' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 4, margin: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    tab: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    activeTab: { backgroundColor: '#F4C430' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    activeTabText: { color: '#1C1C1E' },
    content: { flex: 1, paddingHorizontal: 20 },
    itemCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemDetails: { marginLeft: 12, flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
    itemDuration: { fontSize: 13, color: '#8E8E93' },
    itemPrice: { fontSize: 18, fontWeight: 'bold', color: '#2ECC71' },
    itemActions: { flexDirection: 'row', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: '#F0F0F0', gap: 6 },
    actionBtnText: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
    deleteBtn: { backgroundColor: '#FFE5E5' },
    deleteBtnText: { color: '#FF3B30' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
    categoryContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    categoryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: '#E0E0E0', gap: 8 },
    categoryBtnActive: { borderColor: '#F4C430', backgroundColor: '#FFF9E6' },
    categoryText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    categoryTextActive: { color: '#1C1C1E' },
    input: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    saveButton: { backgroundColor: '#F4C430', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
    saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    formRow: { flexDirection: 'row' },
    imageScroll: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
    addImageBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    imageWrapper: { position: 'relative', marginRight: 12 },
    uploadedImage: { width: 80, height: 80, borderRadius: 12 },
    removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    dropdownList: { borderRadius: 12, borderWidth: 1, marginBottom: 16, maxHeight: 200 },
    dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
    chipText: { fontSize: 13, fontWeight: '500' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
    // Detail Modal Styles
    detailModalContent: { backgroundColor: '#FFFFFF', padding: 24, margin: 20, borderRadius: 24, maxHeight: '80%', width: width - 40, alignSelf: 'center', bottom: '10%' },
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    detailTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, flex: 1, marginRight: 16 },
    closeBtn: { padding: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    detailImageScroll: { marginBottom: 20, height: 200, maxWidth: width - 88 },
    detailImage: { width: width - 88, height: 200, borderRadius: 12, marginRight: 0 },
    detailImagePlaceholder: { height: 150, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    detailSection: { marginBottom: 20 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    detailLabel: { fontSize: 14, fontWeight: '600' },
    detailValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
    detailActions: { flexDirection: 'row', gap: 12, paddingTop: 20, borderTopWidth: 1 },
    // Custom Alert Styles
    customAlertContainer: { width: '85%', borderRadius: 16, padding: 20, alignItems: 'center' },
    customAlertTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    customAlertMessage: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
    customAlertButtonsContainer: { width: '100%' },
    customAlertButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    customAlertButtonText: { fontSize: 16 },
});

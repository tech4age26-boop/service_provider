import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Switch,
    Keyboard,
    Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { CustomInput } from '../common/custom-input';
import { colors } from '../../theme/colors';

import { Service, SheetMode } from '../../types';

interface AddEditSheetProps {
    visible: boolean;
    initialData: Partial<Service> | null;
    mode: SheetMode;
    type: 'service' | 'product';
    onSave: (data: Partial<Service>) => void;
    onClose: () => void;
}

const SERVICE_CATEGORIES = [
    'Diagnostics',
    'Quick Service',
    'Tuning',
    'Detailing',
    'Oil Change',
    'Tires & Alignment',
    'Engine',
    'Electrical',
    'Other',
];

const PRODUCT_CATEGORIES = [
    'Brake Pads',
    'Filters',
    'Fluids',
    'Tires',
    'Accessories',
    'Engine Parts',
    'Tools',
];

const UOM_OPTIONS = [
    'Pcs',
    'Litre',
    'Kgs',
    'Box',
    'Carton',
    'Bermil',
];

export const AddEditSheet = ({
    visible,
    initialData,
    mode,
    type,
    onSave,
    onClose,
}: AddEditSheetProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    console.log('AddEditSheet Render: visible=', visible, 'mode=', mode, 'type=', type);

    const [formData, setFormData] = useState<Partial<Service>>({});
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isUomOpen, setIsUomOpen] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setFormData(initialData);
            } else {
                resetForm();
            }
        }
    }, [visible, initialData, type]);

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            duration: '',
            category: type,
            subCategory: type === 'product' ? PRODUCT_CATEGORIES[0] : '',
            images: [],
            stock: '',
            sku: '',
            status: 'active',
            serviceTypes: [],
            company: '',
            description: '',
            purchasePrice: '',
            uom: type === 'product' ? UOM_OPTIONS[0] : '',
            otherServiceName: '',
        });
    };

    const handleSave = () => {
        if (!formData.name || !formData.price) {
            return;
        }
        onSave(formData);
        Keyboard.dismiss();
    };

    const handleImagePick = async () => {
        const currentImages = formData.images || [];
        if (currentImages.length >= 4) return;

        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 4 - currentImages.length,
        });

        if (result.assets) {
            const newUris = result.assets
                .map((a) => a.uri)
                .filter((u) => u !== undefined) as string[];
            setFormData({ ...formData, images: [...currentImages, ...newUris] });
        }
    };

    const removeImage = (index: number) => {
        const currentImages = formData.images || [];
        setFormData({
            ...formData,
            images: currentImages.filter((_, i) => i !== index),
        });
    };

    const toggleServiceType = (sType: string) => {
        const current = formData.serviceTypes || [];
        if (current.includes(sType)) {
            setFormData({
                ...formData,
                serviceTypes: current.filter((t) => t !== sType),
            });
        } else {
            setFormData({ ...formData, serviceTypes: [...current, sType] });
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.modalOverlay}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={[styles.sheetContainer, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.dragIndicator} />
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.header}>
                        <View style={{ width: 40 }} />
                        <Text style={[styles.title, { color: theme.text }]}>
                            {mode === 'edit' ? t('common.edit') : t('common.add')}{' '}
                            {type === 'service' ? t('products.services') : t('products.parts')}
                        </Text>
                        <TouchableOpacity 
                            style={[styles.closeButton, { borderColor: theme.border }]} 
                            onPress={onClose}
                        >
                            <MaterialCommunityIcons name="close" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Name */}
                    <CustomInput
                        label={type === 'service' ? t('technician.service_name') : t('products.product_name')}
                        required
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder={type === 'service' ? "ex. Full Synthetic Oil Change" : "ex. Premium Brake Pads"}
                    />

                    {/* Price & Stock/Duration */}
                    <View style={styles.rowInputs}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <CustomInput
                                label={type === 'product' ? "Selling Price (SAR)" : `${t('products.price')} (SAR)`}
                                required
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                        </View>

                        {type === 'product' && (
                            <View style={{ flex: 1 }}>
                                <CustomInput
                                    label="Purchase Price (SAR)"
                                    required
                                    value={formData.purchasePrice}
                                    onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                />
                            </View>
                        )}

                        {type === 'service' && (
                            <View style={{ flex: 1 }}>
                                <CustomInput
                                    label={t('technician.duration_min')}
                                    required
                                    value={formData.duration}
                                    onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                    keyboardType="numeric"
                                    placeholder="30"
                                />
                            </View>
                        )}
                    </View>

                    {type === 'product' && (
                        <View style={styles.rowInputs}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <CustomInput
                                    label={t('products.stock_qty')}
                                    required
                                    value={formData.stock}
                                    onChangeText={(text) => setFormData({ ...formData, stock: text })}
                                    keyboardType="numeric"
                                    placeholder="100"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>UOM</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdown,
                                        { backgroundColor: theme.inputBackground, borderColor: theme.border, paddingVertical: 12 },
                                    ]}
                                    onPress={() => setIsUomOpen(!isUomOpen)}
                                >
                                    <Text style={{ color: formData.uom ? theme.text : theme.subText, fontSize: 14 }}>
                                        {formData.uom || 'Select'}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name={isUomOpen ? 'chevron-up' : 'chevron-down'}
                                        size={18}
                                        color={theme.subText}
                                    />
                                </TouchableOpacity>
                                {isUomOpen && (
                                    <View
                                        style={[
                                            styles.dropdownList,
                                            { backgroundColor: theme.inputBackground, borderColor: theme.border, position: 'absolute', top: 75, left: 0, right: 0, zIndex: 1000 },
                                        ]}
                                    >
                                        <ScrollView style={{ maxHeight: 150 }}>
                                            {UOM_OPTIONS.map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                    onPress={() => {
                                                        setFormData({ ...formData, uom: opt });
                                                        setIsUomOpen(false);
                                                    }}
                                                >
                                                    <Text style={{ color: theme.text }}>{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Category (Product) or Types (Service) */}
                    {type === 'product' && (
                        <>
                            <Text style={[styles.label, { color: theme.text }]}>{t('products.category')}</Text>
                            <TouchableOpacity
                                style={[
                                    styles.dropdown,
                                    { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                ]}
                                onPress={() => setIsCategoryOpen(!isCategoryOpen)}
                            >
                                <Text style={{ color: formData.subCategory ? theme.text : theme.subText }}>
                                    {formData.subCategory || t('products.select_category')}
                                </Text>
                                <MaterialCommunityIcons
                                    name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={theme.subText}
                                />
                            </TouchableOpacity>
                            {isCategoryOpen && (
                                <View
                                    style={[
                                        styles.dropdownList,
                                        { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                    ]}
                                >
                                    {PRODUCT_CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => {
                                                setFormData({ ...formData, subCategory: cat });
                                                setIsCategoryOpen(false);
                                            }}
                                        >
                                            <Text style={{ color: theme.text }}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            <CustomInput
                                label={t('products.company_name')}
                                value={formData.company}
                                onChangeText={(text) => setFormData({ ...formData, company: text })}
                                placeholder="ex. Bosch, Toyota"
                                style={{ marginTop: 0 }}
                            />
                            <CustomInput
                                label={t('products.sku')}
                                value={formData.sku}
                                onChangeText={(text) => setFormData({ ...formData, sku: text })}
                                placeholder="ex. P-12345"
                            />
                        </>
                    )}

                    {type === 'service' && (
                        <>
                            <Text style={[styles.label, { color: theme.text }]}>
                                Service Types
                            </Text>
                            <View style={styles.chipContainer}>
                                {SERVICE_CATEGORIES.map((cat) => {
                                    const isSelected = formData.serviceTypes?.includes(cat);
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: isSelected
                                                        ? theme.tint
                                                        : theme.inputBackground,
                                                    borderColor: theme.border,
                                                },
                                            ]}
                                            onPress={() => toggleServiceType(cat)}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    { color: isSelected ? '#1C1C1E' : theme.text },
                                                ]}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {formData.serviceTypes?.includes('Other') && (
                                <CustomInput
                                    label="Other Service Name"
                                    required
                                    value={formData.otherServiceName || ''}
                                    onChangeText={(text) => setFormData({ ...formData, otherServiceName: text })}
                                    placeholder="Enter service name"
                                />
                            )}
                        </>
                    )}

                    <CustomInput
                        label={t('common.description')}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder={t('common.description_placeholder')}
                        multiline
                        style={{ height: 80, textAlignVertical: 'top' }}
                    />

                    {/* Image Picker */}
                    <Text style={[styles.label, { color: theme.text }]}>
                        {t('registration.profile_photo')}
                    </Text>
                    <View style={styles.imageRow}>
                        <TouchableOpacity
                            style={[styles.addImageBtn, { borderColor: theme.border }]}
                            onPress={handleImagePick}
                        >
                            <MaterialCommunityIcons
                                name="camera-plus"
                                size={24}
                                color={theme.subText}
                            />
                        </TouchableOpacity>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {formData.images?.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.uploadedImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageBtn}
                                        onPress={() => removeImage(index)}
                                    >
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={12}
                                            color="#FFF"
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Status Switch */}
                    <View style={styles.rowBetween}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: 0, marginTop: 0 }]}>
                            {type === 'product' ? t('products.available') : t('employees.status')}
                        </Text>
                        <Switch
                            value={formData.status === 'active'}
                            onValueChange={(val) =>
                                setFormData({ ...formData, status: val ? 'active' : 'inactive' })
                            }
                            trackColor={{ false: '#767577', true: theme.tint }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>

                    <View style={{ height: 40 }} />

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.tint }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                    </TouchableOpacity>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        zIndex: 9999, // Ensure it's on top of everything
        elevation: 9999,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheetContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%', // Limit height to avoid top notch
        width: '100%',
        paddingTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dragIndicator: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#CCC',
        alignSelf: 'center',
        marginBottom: 10,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 20, // Reduced from 60
    },
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginVertical: 12,
    },
    rowInputs: {
        flexDirection: 'row',
    },
    imageRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    addImageBtn: {
        width: 70,
        height: 70,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    uploadedImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.danger,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownList: {
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 4,
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    saveButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
});

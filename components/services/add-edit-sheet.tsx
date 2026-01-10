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
    'diagnostics',
    'quick_service',
    'tuning',
    'detailing',
    'oil_change',
    'tire_alignment',
    'engine',
    'electrical',
    'other',
];

const PRODUCT_CATEGORIES = [
    'brake_pads',
    'filters',
    'fluids',
    'tires',
    'accessories',
    'engine_parts',
    'tools',
];

const UOM_OPTIONS = [
    'pcs',
    'litre',
    'kgs',
    'box',
    'carton',
    'bermil',
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

    // Dynamic Lists State
    const [productCategories, setProductCategories] = useState(PRODUCT_CATEGORIES);
    const [uomOptions, setUomOptions] = useState(UOM_OPTIONS);

    // Adding New Item State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingUom, setIsAddingUom] = useState(false);
    const [newUom, setNewUom] = useState('');

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
                                label={type === 'product' ? `${t('products.selling_price')} (${t('wallet.sar')})` : `${t('products.price')} (${t('wallet.sar')})`}
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
                                    label={`${t('products.purchase_price')} (${t('wallet.sar')})`}
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
                                <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>{t('products.uom')}</Text>
                                {isAddingUom ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <View style={{ flex: 1 }}>
                                            <CustomInput
                                                value={newUom}
                                                onChangeText={setNewUom}
                                                placeholder={t('products.enter_uom')}
                                                style={{ marginTop: 0 }}
                                            />
                                        </View>
                                        <TouchableOpacity 
                                            style={[styles.saveSmallBtn, { backgroundColor: theme.tint }]}
                                            onPress={() => {
                                                if (newUom.trim()) {
                                                    const cleanUom = newUom.trim().replace(/\s+/g, '_').toLowerCase();
                                                    if (!uomOptions.includes(cleanUom)) {
                                                        setUomOptions([...uomOptions, cleanUom]);
                                                    }
                                                    setFormData({ ...formData, uom: cleanUom });
                                                    setNewUom('');
                                                    setIsAddingUom(false);
                                                }
                                            }}
                                        >
                                            <MaterialCommunityIcons name="check" size={18} color="#000" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.saveSmallBtn, { backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.border }]}
                                            onPress={() => {
                                                setIsAddingUom(false);
                                                setNewUom('');
                                            }}
                                        >
                                            <MaterialCommunityIcons name="close" size={18} color={theme.text} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[
                                                styles.dropdown,
                                                { backgroundColor: theme.inputBackground, borderColor: theme.border, paddingVertical: 12 },
                                            ]}
                                            onPress={() => setIsUomOpen(!isUomOpen)}
                                        >
                                            <Text style={{ color: formData.uom ? theme.text : theme.subText, fontSize: 14 }}>
                                                {formData.uom ? (uomOptions.includes(formData.uom) ? t(`products.uom_options.${formData.uom}`) : formData.uom) : t('products.select')}
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
                                                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                                    {uomOptions.map((opt) => (
                                                        <TouchableOpacity
                                                            key={opt}
                                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                            onPress={() => {
                                                                setFormData({ ...formData, uom: opt });
                                                                setIsUomOpen(false);
                                                            }}
                                                        >
                                                            <Text style={{ color: theme.text }}>{t(`products.uom_options.${opt}`) !== `products.uom_options.${opt}` ? t(`products.uom_options.${opt}`) : opt}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                    <TouchableOpacity
                                                        style={[styles.dropdownItem, { borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                                                        onPress={() => {
                                                            setIsUomOpen(false);
                                                            setIsAddingUom(true);
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons name="plus" size={16} color={theme.tint} />
                                                        <Text style={{ color: theme.tint, fontWeight: '700' }}>{t('common.add_new')}</Text>
                                                    </TouchableOpacity>
                                                </ScrollView>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Category (Product) or Types (Service) */}
                    {type === 'product' && (
                        <>
                            <Text style={[styles.label, { color: theme.text }]}>{t('products.category')}</Text>
                            {isAddingCategory ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <View style={{ flex: 1 }}>
                                        <CustomInput
                                            value={newCategory}
                                            onChangeText={setNewCategory}
                                            placeholder={t('products.enter_category')}
                                            style={{ marginTop: 0 }}
                                        />
                                    </View>
                                    <TouchableOpacity 
                                        style={[styles.saveSmallBtn, { backgroundColor: theme.tint }]}
                                        onPress={() => {
                                            if (newCategory.trim()) {
                                                const cleanCat = newCategory.trim().replace(/\s+/g, '_').toLowerCase();
                                                if (!productCategories.includes(cleanCat)) {
                                                    setProductCategories([...productCategories, cleanCat]);
                                                }
                                                setFormData({ ...formData, subCategory: cleanCat });
                                                setNewCategory('');
                                                setIsAddingCategory(false);
                                            }
                                        }}
                                    >
                                        <MaterialCommunityIcons name="check" size={18} color="#000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.saveSmallBtn, { backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.border }]}
                                        onPress={() => {
                                            setIsAddingCategory(false);
                                            setNewCategory('');
                                        }}
                                    >
                                        <MaterialCommunityIcons name="close" size={18} color={theme.text} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.dropdown,
                                            { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                        ]}
                                        onPress={() => setIsCategoryOpen(!isCategoryOpen)}
                                    >
                                        <Text style={{ color: formData.subCategory ? theme.text : theme.subText }}>
                                            {formData.subCategory ? (productCategories.includes(formData.subCategory) ? t(`products.categories.${formData.subCategory}`) : formData.subCategory.replace(/_/g, ' ')) : t('products.select_category')}
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
                                            {productCategories.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                                    onPress={() => {
                                                        setFormData({ ...formData, subCategory: cat });
                                                        setIsCategoryOpen(false);
                                                    }}
                                                >
                                                    <Text style={{ color: theme.text }}>{t(`products.categories.${cat}`) !== `products.categories.${cat}` ? t(`products.categories.${cat}`) : cat.replace(/_/g, ' ')}</Text>
                                                </TouchableOpacity>
                                            ))}
                                            <TouchableOpacity
                                                style={[styles.dropdownItem, { borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                                                onPress={() => {
                                                    setIsCategoryOpen(false);
                                                    setIsAddingCategory(true);
                                                }}
                                            >
                                                <MaterialCommunityIcons name="plus" size={16} color={theme.tint} />
                                                <Text style={{ color: theme.tint, fontWeight: '700' }}>{t('common.add_new')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </>
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
                                {t('products.service_types')}
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
                                                {t(`products.categories.${cat}`)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {formData.serviceTypes?.includes('other') && (
                                <CustomInput
                                    label={t('products.other_service_name')}
                                    required
                                    value={formData.otherServiceName || ''}
                                    onChangeText={(text) => setFormData({ ...formData, otherServiceName: text })}
                                    placeholder={t('products.enter_service_name')}
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
    saveSmallBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

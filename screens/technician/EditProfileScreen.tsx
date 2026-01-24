import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { CustomInput } from '../../components/common/custom-input';
import { SettingsHeader } from '../../components/common/SettingsHeader';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

import { API_BASE_URL } from '../../constants/api';
export function EditProfileScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        ownerName: '',
        workshopName: '',
        fullName: '',
        phone: '',
        phoneCode: '+966',
        email: '',
        address: '',
        bio: '',
        crNumber: '',
        vatNumber: '',
        iqamaId: '',
        drivingLicenseNumber: '',
        logo: null as string | null,
        frontPhoto: null as string | null,
        vatCertificate: null as string | null,
        crDocument: null as string | null,
        iqamaIdAttach: null as string | null,
        drivingLicenseAttach: null as string | null,
    });

    React.useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('user_data');
            if (storedData) {
                const userData = JSON.parse(storedData);
                console.log('Stored User Data:', userData);

                // Fetch latest data from API to ensure we have ALL fields
                try {
                    const response = await fetch(`${API_BASE_URL}/api/providers/${userData.id || userData._id}`);
                    const result = await response.json();

                    if (result.success && result.provider) {
                        const fullData = result.provider;
                        console.log('Full User Data from API:', fullData);
                        setUser(fullData);
                        setFormData({
                            ownerName: fullData.ownerName || '',
                            workshopName: fullData.workshopName || '',
                            fullName: fullData.fullName || '',
                            phone: fullData.mobileNumber || '',
                            phoneCode: '+966',
                            email: fullData.email || '',
                            address: fullData.address || '',
                            bio: fullData.bio || '',
                            crNumber: fullData.crNumber || '',
                            vatNumber: fullData.vatNumber || '',
                            iqamaId: fullData.iqamaId || '',
                            drivingLicenseNumber: fullData.drivingLicenseNumber || '',
                            logo: fullData.logoUrl || null,
                            frontPhoto: fullData.frontPhotoUrl || null,
                            vatCertificate: fullData.vatCertificateUrl || null,
                            crDocument: fullData.crDocumentUrl || null,
                            iqamaIdAttach: fullData.iqamaIdAttachUrl || null,
                            drivingLicenseAttach: fullData.drivingLicenseAttachUrl || null,
                        });
                        return; // Successfully loaded from API
                    }
                } catch (apiError) {
                    console.error('Error fetching latest user data:', apiError);
                }

                // Fallback to stored data if API fails
                setUser(userData);
                setFormData({
                    ownerName: userData.ownerName || '',
                    workshopName: userData.workshopName || '',
                    fullName: userData.fullName || '',
                    phone: userData.mobileNumber || '',
                    phoneCode: '+966',
                    email: userData.email || '',
                    address: userData.address || '',
                    bio: userData.bio || '',
                    crNumber: userData.crNumber || '',
                    vatNumber: userData.vatNumber || '',
                    iqamaId: userData.iqamaId || '',
                    drivingLicenseNumber: userData.drivingLicenseNumber || '',
                    logo: userData.logoUrl || null,
                    frontPhoto: userData.frontPhotoUrl || null,
                    vatCertificate: userData.vatCertificateUrl || null,
                    crDocument: userData.crDocumentUrl || null,
                    iqamaIdAttach: userData.iqamaIdAttachUrl || null,
                    drivingLicenseAttach: userData.drivingLicenseAttachUrl || null,
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user?._id) return;
        setSaving(true);
        try {
            const form = new FormData();

            if (user?.type === 'workshop') {
                form.append('ownerName', formData.ownerName);
                form.append('workshopName', formData.workshopName);
                form.append('crNumber', formData.crNumber);
                form.append('vatNumber', formData.vatNumber);
            } else {
                form.append('fullName', formData.fullName);
                form.append('iqamaId', formData.iqamaId);
                form.append('drivingLicenseNumber', formData.drivingLicenseNumber);
            }

            form.append('mobileNumber', formData.phone);
            form.append('email', formData.email);
            form.append('address', formData.address);
            form.append('bio', formData.bio);

            const imageFields = [
                'logo', 'frontPhoto', 'vatCertificate', 'crDocument',
                'iqamaIdAttach', 'drivingLicenseAttach'
            ];

            imageFields.forEach(field => {
                const uri = (formData as any)[field];
                if (uri && uri.startsWith('file://')) {
                    const fileName = uri.split('/').pop();
                    form.append(field, {
                        uri: uri,
                        name: fileName || `${field}.jpg`,
                        type: 'image/jpeg',
                    } as any);
                }
            });

            const response = await fetch(`${API_BASE_URL}/api/providers/${user._id}`, {
                method: 'PUT',
                body: form,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                // Update local storage
                await AsyncStorage.setItem('user_data', JSON.stringify(result.user));
                Alert.alert(t('messages.success'), t('messages.profile_updated'));
                navigation.goBack();
            } else {
                Alert.alert('Error', result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Something went wrong while saving');
        } finally {
            setSaving(false);
        }
    };

    const handleImagePick = async (field: string) => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.8,
        });
        if (result.assets && result.assets[0].uri) {
            setFormData({ ...formData, [field]: result.assets[0].uri });
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader
                title={t('settings.edit_profile')}
                rightElement={
                    saving ? (
                        <ActivityIndicator size="small" color={theme.tint} />
                    ) : (
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={[styles.avatarSection, { backgroundColor: theme.cardBackground }]}>
                    <TouchableOpacity onPress={() => handleImagePick('logo')} style={styles.avatarWrapper}>
                        {formData.logo ? (
                            <Image source={{ uri: formData.logo }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.inputBackground }]}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color={theme.subText} />
                            </View>
                        )}
                        <View style={styles.editIconBadge}>
                            <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.changePhotoText, { color: theme.tint }]}>{t('settings.change_photo')}</Text>
                </View>

                {/* Personal Info */}
                <Text style={styles.sectionTitle}>{t('settings.personal_details')}</Text>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <CustomInput
                        label={user?.type === 'workshop' ? t('registration.owner_name') : t('registration.full_name')}
                        value={user?.type === 'workshop' ? formData.ownerName : formData.fullName}
                        onChangeText={(text) => setFormData(
                            user?.type === 'workshop'
                                ? { ...formData, ownerName: text }
                                : { ...formData, fullName: text }
                        )}
                        placeholder={t('placeholders.your_name')}
                    />
                    <CustomInput
                        label={t('auth.mobile')}
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        placeholder="+966..."
                        keyboardType="phone-pad"
                    />
                    <CustomInput
                        label={t('auth.email')}
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        placeholder="email@example.com"
                        keyboardType="email-address"
                    />
                </View>

                {/* Business Info */}
                <Text style={styles.sectionTitle}>{t('settings.work_status')}</Text>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    {user?.type === 'workshop' ? (
                        <>
                            <CustomInput
                                label={t('registration.workshop_name')}
                                value={formData.workshopName}
                                onChangeText={(text) => setFormData({ ...formData, workshopName: text })}
                                placeholder={t('placeholders.business_name')}
                            />
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <CustomInput
                                        label={t('registration.cr_number')}
                                        value={formData.crNumber}
                                        onChangeText={(text) => setFormData({ ...formData, crNumber: text })}
                                        placeholder={t('placeholders.cr_placeholder')}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <CustomInput
                                        label={t('registration.vat_number')}
                                        value={formData.vatNumber}
                                        onChangeText={(text) => setFormData({ ...formData, vatNumber: text })}
                                        placeholder={t('placeholders.vat_placeholder')}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <CustomInput
                                    label={t('registration.iqama_id')}
                                    value={formData.iqamaId}
                                    onChangeText={(text) => setFormData({ ...formData, iqamaId: text })}
                                    placeholder="2xxxxxxxxxx"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <CustomInput
                                    label={t('registration.driving_license')}
                                    value={formData.drivingLicenseNumber}
                                    onChangeText={(text) => setFormData({ ...formData, drivingLicenseNumber: text })}
                                    placeholder="1xxxxxxxxxx"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    <CustomInput
                        label={t('common.description')}
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        placeholder={t('placeholders.service_desc')}
                        multiline
                        style={{ height: 80, textAlignVertical: 'top' }}
                    />
                    <CustomInput
                        label={t('registration.work_address')}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        placeholder={t('placeholders.search_address')}
                    />
                </View>

                {/* Attachments Section */}
                <Text style={styles.sectionTitle}>{t('registration.attachments')}</Text>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.attachmentGrid}>
                        <AttachmentItem
                            label={t('registration.front_photo')}
                            uri={formData.frontPhoto}
                            onPress={() => handleImagePick('frontPhoto')}
                            theme={theme}
                        />
                        {user?.type === 'workshop' ? (
                            <>
                                <AttachmentItem
                                    label={t('registration.vat_certificate_attach')}
                                    uri={formData.vatCertificate}
                                    onPress={() => handleImagePick('vatCertificate')}
                                    theme={theme}
                                />
                                <AttachmentItem
                                    label={t('registration.cr_attach')}
                                    uri={formData.crDocument}
                                    onPress={() => handleImagePick('crDocument')}
                                    theme={theme}
                                />
                            </>
                        ) : (
                            <>
                                <AttachmentItem
                                    label={t('registration.iqama_id_attach')}
                                    uri={formData.iqamaIdAttach}
                                    onPress={() => handleImagePick('iqamaIdAttach')}
                                    theme={theme}
                                />
                                <AttachmentItem
                                    label={t('registration.driving_license_attach')}
                                    uri={formData.drivingLicenseAttach}
                                    onPress={() => handleImagePick('drivingLicenseAttach')}
                                    theme={theme}
                                />
                            </>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppBody>
    );
}

const AttachmentItem = ({ label, uri, onPress, theme }: any) => {
    return (
        <View style={styles.attachmentItem}>
            <Text style={[styles.attachmentLabel, { color: theme.text }]}>{label}</Text>
            <TouchableOpacity
                onPress={onPress}
                style={[styles.attachmentBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
            >
                {uri ? (
                    <Image source={{ uri }} style={styles.attachmentImage} />
                ) : (
                    <MaterialCommunityIcons name="camera-plus" size={24} color={theme.subText} />
                )}
                <View style={styles.attachmentEditBadge}>
                    <MaterialCommunityIcons name="pencil" size={10} color="#FFF" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    changePhotoText: {
        fontWeight: '600',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
    },
    attachmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    attachmentItem: {
        width: '48%',
        marginBottom: 16,
    },
    attachmentLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    attachmentBox: {
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    attachmentImage: {
        width: '100%',
        height: '100%',
    },
    attachmentEditBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: colors.primary,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    }
});

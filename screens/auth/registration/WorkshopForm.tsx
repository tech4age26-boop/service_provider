import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { AuthInput } from '../components/AuthInput';
import { AuthImagePicker } from '../components/AuthImagePicker';
import { launchImageLibrary } from 'react-native-image-picker';

interface WorkshopFormProps {
    onSubmit: (data: any) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export const WorkshopForm = ({ onSubmit, onBack, isLoading }: WorkshopFormProps) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        workshopName: '',
        ownerName: '',
        crNumber: '',
        vatNumber: '',
        mobileNumber: '',
        password: '',
        address: '',
        logo: null as string | null,
        frontPhoto: null as string | null,
        vatCertificate: null as string | null,
        crDocument: null as string | null,
        selectedServices: [] as string[],
        offersOutdoorServices: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const handlePickImage = async (field: 'logo' | 'frontPhoto' | 'vatCertificate' | 'crDocument') => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        if (result.assets && result.assets[0]?.uri) {
            setFormData({ ...formData, [field]: result.assets[0].uri });
        }
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                <Text style={styles.backText}>{t('registration.change_type')}</Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>{t('registration.workshop_details')}</Text>
                <Text style={styles.subtitle}>{t('registration.workshop_setup_subtitle')}</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('registration.business_details')}</Text>
                    <AuthInput
                        label={t('registration.workshop_name')}
                        placeholder={t('registration.workshop_name_placeholder')}
                        icon="store"
                        value={formData.workshopName}
                        onChangeText={(text) => setFormData({ ...formData, workshopName: text })}
                    />

                    <View style={styles.row}>
                        <View style={styles.flex1}>
                            <AuthInput
                                label={t('registration.cr_number')}
                                placeholder="1234567890"
                                icon="file-document-outline"
                                keyboardType="numeric"
                                value={formData.crNumber}
                                onChangeText={(text) => setFormData({ ...formData, crNumber: text })}
                            />
                        </View>
                        <View style={styles.flex1}>
                            <AuthInput
                                label={t('registration.vat_number')}
                                placeholder="321654987"
                                icon="receipt"
                                keyboardType="numeric"
                                value={formData.vatNumber}
                                onChangeText={(text) => setFormData({ ...formData, vatNumber: text })}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('registration.personal_details')}</Text>
                    <AuthInput
                        label={t('registration.owner_name')}
                        placeholder={t('registration.owner_name_placeholder')}
                        icon="account"
                        value={formData.ownerName}
                        onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                    />

                    <View style={styles.loginIdWrapper}>
                        <AuthInput
                            label={t('auth.mobile')}
                            placeholder="+966 50 000 0000"
                            icon="phone"
                            keyboardType="phone-pad"
                            value={formData.mobileNumber}
                            onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
                        />
                        <View style={styles.loginIdNote}>
                            <MaterialCommunityIcons name="information-outline" size={14} color={colors.primary} />
                            <Text style={styles.loginIdText}>{t('registration.username_note')}</Text>
                        </View>
                    </View>

                    <View style={styles.passwordWrapper}>
                        <AuthInput
                            label={t('auth.password')}
                            placeholder="••••••••"
                            icon="lock-outline"
                            secureTextEntry={!showPassword}
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}>
                            <MaterialCommunityIcons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.subText}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('registration.address')}</Text>
                    <AuthInput
                        label={t('registration.address_label')}
                        placeholder={t('registration.address_placeholder')}
                        icon="map-marker-outline"
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('registration.attachments')}</Text>
                    <View style={styles.attachmentGrid}>
                        <AuthImagePicker
                            label={t('registration.upload_logo')}
                            imageUri={formData.logo}
                            onPickImage={() => handlePickImage('logo')}
                            placeholderIcon="store-search"
                        />
                        <AuthImagePicker
                            label={t('registration.front_photo')}
                            imageUri={formData.frontPhoto}
                            onPickImage={() => handlePickImage('frontPhoto')}
                            placeholderIcon="camera-outline"
                        />
                        <AuthImagePicker
                            label={t('registration.vat_certificate_attach')}
                            imageUri={formData.vatCertificate}
                            onPickImage={() => handlePickImage('vatCertificate')}
                            placeholderIcon="file-certificate"
                        />
                        <AuthImagePicker
                            label={t('registration.cr_attach')}
                            imageUri={formData.crDocument}
                            onPickImage={() => handlePickImage('crDocument')}
                            placeholderIcon="file-document-outline"
                        />
                    </View>
                </View>

                {/* Services Selection - Inline */}
                <View style={styles.servicesSection}>
                    <Text style={styles.sectionTitle}>{t('registration.select_services')}</Text>
                    <Text style={styles.servicesSubtitle}>{t('registration.services_subtitle')}</Text>

                    {/* Row 1 */}
                    <View style={styles.servicesRow}>
                        <TouchableOpacity
                            style={[styles.serviceCard, formData.selectedServices.includes('1') && styles.serviceCardSelected]}
                            onPress={() => {
                                const services = formData.selectedServices.includes('1')
                                    ? formData.selectedServices.filter(s => s !== '1')
                                    : [...formData.selectedServices, '1'];
                                setFormData({ ...formData, selectedServices: services });
                            }}>
                            <View style={[styles.serviceIcon, formData.selectedServices.includes('1') && styles.serviceIconSelected]}>
                                <MaterialCommunityIcons name="car-wash" size={24} color={formData.selectedServices.includes('1') ? '#fff' : colors.primary} />
                            </View>
                            <Text style={styles.serviceLabel}>{t('services.car_wash')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.serviceCard, formData.selectedServices.includes('2') && styles.serviceCardSelected]}
                            onPress={() => {
                                const services = formData.selectedServices.includes('2')
                                    ? formData.selectedServices.filter(s => s !== '2')
                                    : [...formData.selectedServices, '2'];
                                setFormData({ ...formData, selectedServices: services });
                            }}>
                            <View style={[styles.serviceIcon, formData.selectedServices.includes('2') && styles.serviceIconSelected]}>
                                <MaterialCommunityIcons name="oil" size={24} color={formData.selectedServices.includes('2') ? '#fff' : colors.primary} />
                            </View>
                            <Text style={styles.serviceLabel}>{t('services.oil_change')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.serviceCard, formData.selectedServices.includes('3') && styles.serviceCardSelected]}
                            onPress={() => {
                                const services = formData.selectedServices.includes('3')
                                    ? formData.selectedServices.filter(s => s !== '3')
                                    : [...formData.selectedServices, '3'];
                                setFormData({ ...formData, selectedServices: services });
                            }}>
                            <View style={[styles.serviceIcon, formData.selectedServices.includes('3') && styles.serviceIconSelected]}>
                                <MaterialCommunityIcons name="tire" size={24} color={formData.selectedServices.includes('3') ? '#fff' : colors.primary} />
                            </View>
                            <Text style={styles.serviceLabel}>{t('services.tire_service')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.servicesRow}>
                        <TouchableOpacity
                            style={[styles.serviceCard, formData.selectedServices.includes('4') && styles.serviceCardSelected]}
                            onPress={() => {
                                const services = formData.selectedServices.includes('4')
                                    ? formData.selectedServices.filter(s => s !== '4')
                                    : [...formData.selectedServices, '4'];
                                setFormData({ ...formData, selectedServices: services });
                            }}>
                            <View style={[styles.serviceIcon, formData.selectedServices.includes('4') && styles.serviceIconSelected]}>
                                <MaterialCommunityIcons name="car-brake-alert" size={24} color={formData.selectedServices.includes('4') ? '#fff' : colors.primary} />
                            </View>
                            <Text style={styles.serviceLabel}>{t('services.brake_service')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.serviceCard, formData.selectedServices.includes('5') && styles.serviceCardSelected]}
                            onPress={() => {
                                const services = formData.selectedServices.includes('5')
                                    ? formData.selectedServices.filter(s => s !== '5')
                                    : [...formData.selectedServices, '5'];
                                setFormData({ ...formData, selectedServices: services });
                            }}>
                            <View style={[styles.serviceIcon, formData.selectedServices.includes('5') && styles.serviceIconSelected]}>
                                <MaterialCommunityIcons name="engine" size={24} color={formData.selectedServices.includes('5') ? '#fff' : colors.primary} />
                            </View>
                            <Text style={styles.serviceLabel}>{t('services.engine_diagnostics')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.serviceCard, formData.selectedServices.includes('6') && styles.serviceCardSelected]}
                            onPress={() => {
                                const services = formData.selectedServices.includes('6')
                                    ? formData.selectedServices.filter(s => s !== '6')
                                    : [...formData.selectedServices, '6'];
                                setFormData({ ...formData, selectedServices: services });
                            }}>
                            <View style={[styles.serviceIcon, formData.selectedServices.includes('6') && styles.serviceIconSelected]}>
                                <MaterialCommunityIcons name="snowflake" size={24} color={formData.selectedServices.includes('6') ? '#fff' : colors.primary} />
                            </View>
                            <Text style={styles.serviceLabel}>{t('services.ac_repair')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.outdoorContainer}>
                    <View style={styles.outdoorHeader}>
                        <MaterialCommunityIcons name="map-marker-radius" size={24} color={colors.primary} />
                        <Text style={styles.outdoorTitle}>{t('registration.outdoor_services')}</Text>
                    </View>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, formData.offersOutdoorServices && styles.toggleBtnActive]}
                            onPress={() => setFormData({ ...formData, offersOutdoorServices: true })}>
                            <Text style={[styles.toggleBtnText, formData.offersOutdoorServices && styles.toggleBtnTextActive]}>
                                {t('common.yes')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, !formData.offersOutdoorServices && styles.toggleBtnActive]}
                            onPress={() => setFormData({ ...formData, offersOutdoorServices: false })}>
                            <Text style={[styles.toggleBtnText, !formData.offersOutdoorServices && styles.toggleBtnTextActive]}>
                                {t('common.no')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.trustSection}>
                    <View style={styles.trustLine} />
                    <View style={styles.trustBadge}>
                        <MaterialCommunityIcons name="shield-check" size={16} color={colors.primary} />
                        <Text style={styles.trustText}>{t('registration.secure_verified')}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}>
                    <Text style={styles.submitButtonText}>{t('registration.submit')}</Text>
                    <View style={styles.submitIconCircle}>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    backText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 10,
        fontFamily: typography.fontFamily,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 6,
        fontFamily: typography.fontFamily,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.subText,
        fontFamily: typography.fontFamily,
        lineHeight: 22,
        fontWeight: '500',
    },
    form: {
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.text,
        fontFamily: typography.fontFamily,
        marginBottom: 4,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    flex1: {
        flex: 1,
    },
    loginIdWrapper: {
        marginBottom: 8,
    },
    loginIdNote: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
        marginTop: -12, // Pull closer to input
    },
    loginIdText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
        fontFamily: typography.fontFamily,
    },
    passwordWrapper: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 18,
        top: 40,
        padding: 6,
    },
    attachmentGrid: {
        gap: 0,
    },
    outdoorContainer: {
        backgroundColor: colors.white,
        borderRadius: 28,
        padding: 24,
        marginTop: 20,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    outdoorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 20,
    },
    outdoorTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.text,
        fontFamily: typography.fontFamily,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: 14,
    },
    toggleBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    toggleBtnActive: {
        backgroundColor: colors.white,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    toggleBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.subText,
        fontFamily: typography.fontFamily,
    },
    toggleBtnTextActive: {
        color: colors.text,
        fontWeight: '800',
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 22,
        height: 68,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 10,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.secondary,
        marginRight: 14,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.5,
    },
    submitIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    trustSection: {
        marginTop: 10,
        alignItems: 'center',
    },
    trustLine: {
        width: '100%',
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 24,
        opacity: 0.5,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    trustText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.subText,
        fontFamily: typography.fontFamily,
    },
    servicesSection: {
        marginTop: 16,
        marginBottom: 8,
    },
    servicesSubtitle: {
        fontSize: 13,
        color: colors.subText,
        marginBottom: 16,
        fontFamily: typography.fontFamily,
    },
    servicesRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    serviceCard: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 8,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
    },
    serviceCardSelected: {
        borderColor: colors.primary,
        backgroundColor: '#FFFEF5',
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    serviceIconSelected: {
        backgroundColor: colors.primary,
    },
    serviceLabel: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: typography.fontFamily,
        lineHeight: 16,
    },
});

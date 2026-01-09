import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { AuthInput } from '../components/AuthInput';
import { AuthServiceSelector } from '../components/AuthServiceSelector';
import { AuthImagePicker } from '../components/AuthImagePicker';
import { AuthAddressSearch } from '../components/AuthAddressSearch';
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
        latitude: 0,
        longitude: 0,
        logo: null as string | null,
        selectedServices: [] as string[],
        offersOutdoorServices: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const handlePickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        if (result.assets && result.assets[0]?.uri) {
            setFormData({ ...formData, logo: result.assets[0].uri });
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
                <Text style={styles.subtitle}>{t('registration.workshop_setup_subtitle') || "Complete your business profile"}</Text>
            </View>

            <View style={styles.form}>
                <AuthInput
                    label={t('registration.workshop_name')}
                    placeholder={t('registration.workshop_name_placeholder') || "AutoFix Pro Center"}
                    icon="store"
                    value={formData.workshopName}
                    onChangeText={(text) => setFormData({ ...formData, workshopName: text })}
                />

                <AuthInput
                    label={t('registration.owner_name')}
                    placeholder={t('registration.owner_name_placeholder') || "Alex Johnson"}
                    icon="account"
                    value={formData.ownerName}
                    onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
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

                <AuthInput
                    label={t('auth.mobile')}
                    placeholder="+966 50 000 0000"
                    icon="phone"
                    keyboardType="phone-pad"
                    value={formData.mobileNumber}
                    onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
                />

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

                <AuthAddressSearch
                    label={t('registration.address_label') || "Workshop Location"}
                    addressQuery={formData.address}
                    onAddressChange={(text) => setFormData({ ...formData, address: text })}
                    onSelectSuggestion={(item) => setFormData({ 
                        ...formData, 
                        address: item.display_name,
                        latitude: parseFloat(item.lat),
                        longitude: parseFloat(item.lon)
                    })}
                />

                <AuthImagePicker
                    label={t('registration.upload_logo')}
                    imageUri={formData.logo}
                    onPickImage={handlePickImage}
                    placeholderIcon="store-search"
                />

                <AuthServiceSelector
                    selectedServices={formData.selectedServices}
                    onToggleService={(id) => {
                        const services = formData.selectedServices.includes(id)
                            ? formData.selectedServices.filter(s => s !== id)
                            : [...formData.selectedServices, id];
                        setFormData({ ...formData, selectedServices: services });
                    }}
                />

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
                        <Text style={styles.trustText}>{t('registration.secure_verified') || "Secure & Verified Registration"}</Text>
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
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    flex1: {
        flex: 1,
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
        marginTop: 40,
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
        marginTop: 32,
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
});

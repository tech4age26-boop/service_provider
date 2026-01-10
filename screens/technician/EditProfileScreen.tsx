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
import { typography } from '../../theme/typography';
import { SettingsHeader } from '../../components/common/SettingsHeader';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../../theme/colors';

export function EditProfileScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        ownerName: 'Anas Saleem',
        workshopName: 'Filter Tech Services',
        phone: '+966 55 123 4567',
        email: 'anas@filter.sa',
        address: 'Olaya Street, Riyadh',
        bio: 'Professional technician with 5 years of experience in luxury cars.',
        crNumber: '1010101010',
        vatNumber: '300000000000003',
        logo: null as string | null,
    });

    const handleSave = () => {
        Alert.alert(t('messages.success'), t('messages.profile_updated'));
        navigation.goBack();
    };

    const handleImagePick = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
        });
        if (result.assets && result.assets[0].uri) {
            setFormData({ ...formData, logo: result.assets[0].uri });
        }
    };

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader
                title={t('settings.edit_profile')}
                rightElement={
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>{t('common.save')}</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Avatar Section */}
                <View style={[styles.avatarSection, { backgroundColor: theme.cardBackground }]}>
                    <TouchableOpacity onPress={handleImagePick} style={styles.avatarWrapper}>
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
                        label={t('registration.owner_name')}
                        value={formData.ownerName}
                        onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
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
                    <CustomInput
                        label={t('registration.workshop_name')}
                        value={formData.workshopName}
                        onChangeText={(text) => setFormData({ ...formData, workshopName: text })}
                        placeholder={t('placeholders.business_name')}
                    />
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
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppBody>
    );
}

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
    }
});

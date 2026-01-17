import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface Props {
    navigation: any;
    onLogout?: () => void;
}

export function WorkshopTechnicianSettingsScreen({ navigation, onLogout }: Props) {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [isAvailable, setIsAvailable] = React.useState(true);

    const handleLogout = async () => {
        Alert.alert(
            t('common.logout'),
            t('messages.logout_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('user_data');
                        if (onLogout) onLogout();
                    },
                },
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.inputBackground }]}>
                <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: theme.subText }]}>{subtitle}</Text>}
            </View>
            {showArrow && <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />}
        </TouchableOpacity>
    );

    const SettingToggle = ({ icon, title, subtitle, value, onValueChange }: any) => (
        <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.inputBackground }]}>
                <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: theme.subText }]}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor="#FFFFFF"
            />
        </View>
    );

    return (
        <AppBody style={{ flex: 1 }}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>
                    {t('settings.settings_title')}
                </Text>
            </View>

            <ScrollView
                style={[styles.container, { backgroundColor: theme.background }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Work Status */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>
                        {t('settings.work_status')}
                    </Text>
                    <SettingToggle
                        icon="account-check"
                        title={t('settings.available_to_work')}
                        subtitle={isAvailable ? 'You are currently available' : 'You are currently unavailable'}
                        value={isAvailable}
                        onValueChange={setIsAvailable}
                    />
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>
                        {t('settings.appearance')}
                    </Text>
                    <SettingToggle
                        icon="theme-light-dark"
                        title={t('settings.dark_mode')}
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                    />
                </View>

                {/* Account */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>
                        {t('settings.account')}
                    </Text>
                    <SettingItem
                        icon="account-edit"
                        title={t('settings.edit_profile')}
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="wallet"
                        title={t('settings.payment_info')}
                        subtitle="Manage your payout methods"
                        onPress={() => { }}
                    />
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>
                        {t('settings.preferences')}
                    </Text>
                    <SettingItem
                        icon="translate"
                        title={t('settings.language_title')}
                        subtitle="English"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="bell"
                        title={t('settings.notifications')}
                        onPress={() => { }}
                    />
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subText }]}>
                        {t('settings.help_support')}
                    </Text>
                    <SettingItem
                        icon="help-circle"
                        title={t('settings.faq')}
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="file-document"
                        title={t('settings.terms_privacy')}
                        onPress={() => { }}
                    />
                </View>

                {/* Logout */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: '#FFE5E5' }]}
                        onPress={handleLogout}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
                        <Text style={styles.logoutText}>{t('common.logout')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        ...typography.caption,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTitle: {
        ...typography.body,
        fontWeight: '600',
    },
    settingSubtitle: {
        ...typography.caption,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 16,
    },
});

/**
 * Technician Dashboard - Settings Screen
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { typography } from '../../theme/typography';

interface TechnicianSettingsScreenProps {
    onLogout?: () => void;
    navigation?: any;
}

export function TechnicianSettingsScreen({ onLogout, navigation }: TechnicianSettingsScreenProps) {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [availableToWork, setAvailableToWork] = React.useState(true);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('user_data');
            if (onLogout) {
                onLogout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderSettingItem = (
        icon: string,
        label: string,
        onPress?: () => void,
        rightElement?: React.ReactNode,
        isDestructive: boolean = false
    ) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FFE5E5' : theme.inputBackground }]}>
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={isDestructive ? '#FF3B30' : theme.text}
                    />
                </View>
                <Text style={[
                    styles.settingText,
                    { color: isDestructive ? '#FF3B30' : theme.text }
                ]}>
                    {label}
                </Text>
            </View>
            {rightElement || (
                onPress && (
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                )
            )}
        </TouchableOpacity>
    );

    return (
        <AppBody style={{ backgroundColor: theme.background, gap: 10 }}>
            <TechnicianHeader title={t('settings.settings_title')} />
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={styles.sectionTitle}>{t('settings.work_status')}</Text>
                    {renderSettingItem(
                        "clock-fast",
                        t('settings.available_to_work'),
                        undefined,
                        <Switch
                            value={availableToWork}
                            onValueChange={setAvailableToWork}
                            trackColor={{ false: '#767577', true: '#F4C430' }}
                            thumbColor={availableToWork ? '#FFFFFF' : '#f4f3f4'}
                        />
                    )}
                </View>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={styles.sectionTitle}>{t('settings.account')}</Text>

                    {renderSettingItem(
                        "account-edit",
                        t('settings.edit_profile'),
                        () => navigation?.navigate('EditProfile')
                    )}

                    {renderSettingItem(
                        "wallet",
                        t('settings.my_wallet'),
                        () => navigation?.navigate('PaymentInfo')
                    )}
                    {renderSettingItem(
                        "certificate",
                        t('settings.my_certifications'),
                        () => navigation?.navigate('MyCertifications')
                    )}
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
                    {renderSettingItem(
                        "theme-light-dark",
                        t('settings.dark_mode'),
                        undefined,
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: '#F4C430' }}
                            thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
                        />
                    )}
                    {renderSettingItem(
                        "bell-outline",
                        t('settings.job_notifications'),
                        undefined,
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#767577', true: '#F4C430' }}
                            thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
                        />
                    )}
                    {renderSettingItem(
                        "translate",
                        t('settings.language_title', 'Language'),
                        () => navigation?.navigate('SettingsLanguage')
                    )}
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={styles.sectionTitle}>{t('settings.help_support')}</Text>
                    {renderSettingItem(
                        "help-circle-outline",
                        t('settings.help_support'),
                        () => navigation?.navigate('HelpCenter')
                    )}
                    {renderSettingItem(
                        "file-document-outline",
                        t('settings.terms_privacy'),
                        () => navigation?.navigate('TermsPrivacy')
                    )}
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBackground, marginBottom: 30 }]}>
                    {renderSettingItem(
                        "logout",
                        t('common.logout'),
                        handleLogout,
                        undefined,
                        true
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        marginHorizontal: 20, // Increased specific unified margin
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        marginTop: 16,
        marginBottom: 10,
        marginLeft: 24, // Align with card content but offset for header
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        fontFamily: typography.fontFamily,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1, // Ensure text takes available space
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 15,
        fontWeight: '500',
        fontFamily: typography.fontFamily,
        flex: 1, // distinct text wrapping
    },
});

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
import { useTheme } from '../../App';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';

interface TechnicianSettingsScreenProps {
    onLogout?: () => void;
}

export function TechnicianSettingsScreen({ onLogout }: TechnicianSettingsScreenProps) {
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

    return (
        <AppBody>
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('settings.settings_title')}</Text>
            </View> */}
            <TechnicianHeader title={t('settings.settings_title')}  />


            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>{t('settings.work_status')}</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="clock-fast" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>{t('settings.available_to_work')}</Text>
                    </View>
                    <Switch
                        value={availableToWork}
                        onValueChange={setAvailableToWork}
                        trackColor={{ false: '#767577', true: '#F4C430' }}
                    />
                </View>
            </View>

            {/* Preferences */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="theme-light-dark" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>{t('settings.dark_mode')}</Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: '#F4C430' }}
                    />
                </View>

                <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="bell-outline" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>{t('settings.job_notifications')}</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#767577', true: '#F4C430' }}
                    />
                </View>
            </View>

            {/* Personal Details */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>{t('settings.personal_details')}</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="account-edit" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>{t('settings.edit_profile')}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="bank" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>{t('settings.payment_info')}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.cardBackground }]}
                onPress={handleLogout}
            >
                <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>{t('common.logout')}</Text>
            </TouchableOpacity>


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
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 16,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
});

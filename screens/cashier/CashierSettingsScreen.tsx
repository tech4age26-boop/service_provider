import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, I18nManager } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CashierSettingsProps {
    onLogout?: () => void;
}

export const CashierSettingsScreen = ({ onLogout }: CashierSettingsProps) => {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    const changeLanguage = async (lang: string) => {
        if (lang === i18n.language) return;

        const isRTL = lang === 'ar';
        await AsyncStorage.setItem('user-language', lang);

        // This usually requires a restart to fully apply RTL
        Alert.alert(
            'Language Change',
            'App needs to restart to apply language changes.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restart',
                    onPress: async () => {
                        await i18n.changeLanguage(lang);
                        I18nManager.forceRTL(isRTL);
                        RNRestart.Restart();
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, children }: any) => (
        <View style={[styles.item, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                    <MaterialCommunityIcons name={icon} size={20} color={theme.text} />
                </View>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
            </View>
            {children}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { marginTop: Math.max(insets.top, 20) }]}>
                <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: theme.subText }]}>Preferences</Text>

                <SettingItem icon="theme-light-dark" title="Dark Mode">
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: theme.tint }}
                        thumbColor={"#f4f3f4"}
                    />
                </SettingItem>

                <SettingItem icon="translate" title="Language">
                    <View style={styles.langContainer}>
                        <TouchableOpacity
                            style={[
                                styles.langBtn,
                                i18n.language === 'en' && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => changeLanguage('en')}
                        >
                            <Text style={[
                                styles.langText,
                                { color: i18n.language === 'en' ? '#000' : theme.subText }
                            ]}>EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.langBtn,
                                i18n.language === 'ar' && { backgroundColor: theme.tint }
                            ]}
                            onPress={() => changeLanguage('ar')}
                        >
                            <Text style={[
                                styles.langText,
                                { color: i18n.language === 'ar' ? '#000' : theme.subText }
                            ]}>AR</Text>
                        </TouchableOpacity>
                    </View>
                </SettingItem>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: theme.subText }]}>Account</Text>
                <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: '#FFE5E5' }]}
                    onPress={onLogout}
                >
                    <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
                    <Text style={[styles.logoutText, { color: '#FF3B30' }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        // marginTop handled inline
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    section: { marginBottom: 30 },
    sectionHeader: { marginBottom: 10, fontWeight: '600', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '600' },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    langContainer: { flexDirection: 'row', gap: 8 },
    langBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
    langText: { fontSize: 12, fontWeight: '700' },
});

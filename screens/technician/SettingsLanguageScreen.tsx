import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { SettingsHeader } from '../../components/common/SettingsHeader';

export function SettingsLanguageScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();

    const changeLanguage = async (lang: string) => {
        const isRTL = lang === 'ar';
        const currentLang = i18n.language;

        if (currentLang === lang) return;

        await AsyncStorage.setItem('user-language', lang);
        i18n.changeLanguage(lang);

        if (I18nManager.isRTL !== isRTL) {
            I18nManager.allowRTL(isRTL);
            I18nManager.forceRTL(isRTL);
            setTimeout(() => {
                RNRestart.Restart();
            }, 100);
        } else {
            navigation.goBack();
        }
    };

    const renderLangItem = (langCode: string, name: string, nativeName: string) => {
        const isSelected = i18n.language === langCode;

        return (
            <TouchableOpacity
                style={[styles.langItem, { backgroundColor: theme.cardBackground }]}
                onPress={() => changeLanguage(langCode)}
            >
                <View style={styles.langInfo}>
                    <Text style={[styles.langName, { color: theme.text }]}>{name}</Text>
                    <Text style={[styles.langNative, { color: theme.subText }]}>{nativeName}</Text>
                </View>
                {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.tint} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            {/* <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>{t('settings.language_title', 'Language')}</Text>
                <View style={{ width: 40 }} />
            </View> */}

            <SettingsHeader title={t('settings.language_title', 'Language')} />

            <View style={styles.content}>
                {renderLangItem('en', 'English', 'English')}
                {renderLangItem('ar', 'Arabic', 'العربية')}
            </View>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: typography.fontFamily,
    },
    content: {
        padding: 20,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    langInfo: {
        flexDirection: 'column',
    },
    langName: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: typography.fontFamily,
        marginBottom: 4,
    },
    langNative: {
        fontSize: 14,
        fontFamily: typography.fontFamily,
    },
});

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { SettingsHeader } from '../../components/common/SettingsHeader';

export function TermsPrivacyScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader title={t('settings.terms_privacy')} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.heading, { color: theme.text }]}>{t('settings.intro_title')}</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        {t('settings.intro_content')}
                    </Text>

                    <Text style={[styles.heading, { color: theme.text }]}>{t('settings.usage_title')}</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        {t('settings.usage_content')}
                    </Text>

                    <Text style={[styles.heading, { color: theme.text }]}>{t('settings.payment_terms_title')}</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        {t('settings.payment_terms_content')}
                    </Text>

                    <Text style={[styles.heading, { color: theme.text }]}>{t('settings.privacy_policy_title')}</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        {t('settings.privacy_policy_content')}
                    </Text>
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
    card: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
        fontFamily: typography.fontFamily,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
        fontFamily: typography.fontFamily,
    },
});

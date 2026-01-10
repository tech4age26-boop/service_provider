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

export function HelpCenterScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const faqItems = [
        { id: '1', question: t('faq.q1'), answer: t('faq.a1') },
        { id: '2', question: t('faq.q2'), answer: t('faq.a2') },
        { id: '3', question: t('faq.q3'), answer: t('faq.a3') },
        { id: '4', question: t('faq.q4'), answer: t('faq.a4') },
        { id: '5', question: t('faq.q5'), answer: t('faq.a5') },
    ];

    const contactMethods = [
        { id: 'chat', icon: 'chat-processing', title: t('settings.live_chat'), subtitle: t('settings.chat_subtitle') },
        { id: 'email', icon: 'email-outline', title: t('settings.send_email'), subtitle: 'support@filter.sa' },
        { id: 'phone', icon: 'phone-outline', title: t('settings.call_us'), subtitle: '+966 800 123 4567' },
    ];

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader title={t('settings.help_support')} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.contact_support')}</Text>
                <View style={styles.contactGrid}>
                    {contactMethods.map((method) => (
                        <TouchableOpacity key={method.id} style={[styles.contactCard, { backgroundColor: theme.cardBackground }]}>
                            <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                                <MaterialCommunityIcons name={method.icon} size={24} color={theme.tint} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactTitle, { color: theme.text }]}>{method.title}</Text>
                                <Text style={[styles.contactSub, { color: theme.subText }]}>{method.subtitle}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.border} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>{t('settings.faq')}</Text>
                {faqItems.map((item) => (
                    <View key={item.id} style={[styles.faqCard, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.faqQuestion, { color: theme.text }]}>{item.question}</Text>
                        <Text style={[styles.faqAnswer, { color: theme.subText }]}>{item.answer}</Text>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 16,
        marginTop: 8,
        fontFamily: typography.fontFamily,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contactGrid: {
        gap: 12,
        marginBottom: 32,
    },
    contactCard: {
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: typography.fontFamily,
    },
    contactSub: {
        fontSize: 13,
        marginTop: 2,
        fontFamily: typography.fontFamily,
    },
    faqCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        fontFamily: typography.fontFamily,
        lineHeight: 22,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: typography.fontFamily,
    },
});

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
                    <Text style={[styles.heading, { color: theme.text }]}>1. Introduction</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        Welcome to Filter. By using our application, you agree to these Terms and Conditions. Please read them carefully.
                    </Text>

                    <Text style={[styles.heading, { color: theme.text }]}>2. Service Usage</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        Technicians are expected to provide high-quality service and maintain professional conduct at all times. Failure to do so may result in account suspension.
                    </Text>

                    <Text style={[styles.heading, { color: theme.text }]}>3. Payments</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        Payments are processed securely. Filter takes a commission on each completed job. Payouts are made weekly.
                    </Text>

                    <Text style={[styles.heading, { color: theme.text }]}>4. Privacy Policy</Text>
                    <Text style={[styles.paragraph, { color: theme.subText }]}>
                        We value your privacy. Your personal data is only used for order processing and service improvement. We do not sell your data to third parties.
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

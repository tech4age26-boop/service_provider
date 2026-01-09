import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { SettingsHeader } from '../../components/common/SettingsHeader';
import { colors } from '../../theme/colors';

export function PaymentMethodDetailScreen({ route, navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { method } = route.params || {};

    if (!method) {
        return (
            <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
                <SettingsHeader title="Error" />
                <View style={styles.content}>
                    <Text style={{ color: theme.text }}>No payment method data found.</Text>
                </View>
            </AppBody>
        );
    }

    const handleSave = () => {
        Alert.alert(t('messages.success'), "Payment method settings updated successfully.");
        navigation.goBack();
    };

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader title={method.label} />
            
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerSection}>
                    <View style={[styles.iconContainer, { backgroundColor: `${method.color}15` }]}>
                        <MaterialCommunityIcons name={method.icon} size={48} color={method.color} />
                    </View>
                    <Text style={[styles.methodTitle, { color: theme.text }]}>{method.label}</Text>
                    {method.subtitle && <Text style={styles.methodSubtitle}>{method.subtitle}</Text>}
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.subText }]}>Status</Text>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
                        </View>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.subText }]}>Integration Type</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>Direct API</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.subText }]}>Settlement Period</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>24 - 48 Hours</Text>
                    </View>
                </View>

                <View style={[styles.noticeBox, { backgroundColor: theme.tint + '10' }]}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={theme.tint} />
                    <Text style={[styles.noticeText, { color: theme.tint }]}>
                        All transactions via {method.label} are securely processed and encrypted. Settlements are made to your primary bank account.
                    </Text>
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.black }]} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    methodTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    methodSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    infoCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    noticeBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        marginLeft: 12,
        lineHeight: 18,
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});

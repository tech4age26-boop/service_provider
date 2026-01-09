import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { SettingsHeader } from '../../components/common/SettingsHeader';
import { colors } from '../../theme/colors';

interface PaymentMethod {
    id: string;
    icon: string;
    label: string;
    color: string;
    subtitle?: string;
}

interface PaymentGroup {
    title: string;
    methods: PaymentMethod[];
}

export function PaymentInfoScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
        wallet: true,
        mada: true,
        visa: true,
        cash: true,
        bank: false,
        tabby: false,
        tamara: false,
        credit: false,
    });

    const toggleMethod = (id: string) => {
        setEnabledMethods(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const paymentGroups: PaymentGroup[] = [
        {
            title: "Digital & Direct",
            methods: [
                { id: 'wallet', icon: 'wallet-outline', label: t('wallet.method_wallet'), color: '#5856D6' },
                { id: 'cash', icon: 'cash-multiple', label: t('wallet.method_cash'), color: '#34C759' },
                { id: 'bank', icon: 'bank', label: t('wallet.method_bank'), color: '#FF9500' },
            ]
        },
        {
            title: "Cards & Online",
            methods: [
                { id: 'mada', icon: 'credit-card', label: t('wallet.method_mada'), color: '#007AFF' },
                { id: 'visa', icon: 'card-account-details-outline', label: t('wallet.method_visa'), color: '#1A1F71' },
            ]
        },
        {
            title: "Buy Now Pay Later",
            methods: [
                { id: 'tabby', icon: 'clock-fast', label: t('wallet.method_tabby'), color: '#00D1C1' },
                { id: 'tamara', icon: 'calendar-clock', label: t('wallet.method_tamara'), color: '#FF2D55' },
            ]
        },
        {
            title: "Corporate",
            methods: [
                { id: 'credit', icon: 'office-building', label: t('wallet.method_credit'), color: '#8E8E93', subtitle: t('wallet.method_credit_subtitle') },
            ]
        }
    ];

    const transactions = [
        { id: '1', type: 'payout', amount: '-$500.00', date: 'Today, 2:30 PM', status: 'Processing' },
        { id: '2', type: 'earning', amount: '+$150.00', date: 'Yesterday, 4:15 PM', status: 'Completed', detail: 'Oil Change - #ORD-123' },
        { id: '3', type: 'earning', amount: '+$80.00', date: 'Yesterday, 1:00 PM', status: 'Completed', detail: 'Brake Check - #ORD-120' },
        { id: '4', type: 'payout', amount: '-$1200.00', date: 'Jan 5, 2024', status: 'Completed' },
    ];

    const renderTransaction = ({ item }: any) => (
        <View style={[styles.transactionItem, { borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'earning' ? colors.successLight : colors.primaryLight }]}>
                <MaterialCommunityIcons
                    name={item.type === 'earning' ? 'arrow-down-left' : 'arrow-up-right'}
                    size={20}
                    color={item.type === 'earning' ? colors.success : colors.primary}
                />
            </View>
            <View style={styles.transDetails}>
                <Text style={[styles.transTitle, { color: theme.text }]}>
                    {item.type === 'earning' ? 'Payment Received' : 'Payout Withdrawal'}
                </Text>
                <Text style={styles.transSub}>{item.detail || item.status}</Text>
            </View>
            <View style={styles.transRight}>
                <Text style={[styles.transAmount, { color: item.type === 'earning' ? theme.success : theme.text }]}>
                    {item.amount}
                </Text>
                <Text style={styles.transDate}>{item.date}</Text>
            </View>
        </View>
    );

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader title={t('settings.payment_info')} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.balanceCard, { backgroundColor: theme.tint }]}>
                    <Text style={styles.balanceLabel}>{t('wallet.total_balance')}</Text>
                    <Text style={styles.balanceAmount}>$1,250.00</Text>
                    <View style={styles.balanceRow}>
                        <View>
                            <Text style={styles.miniLabel}>{t('wallet.available')}</Text>
                            <Text style={styles.miniValue}>$850.00</Text>
                        </View>
                        <View style={styles.divider} />
                        <View>
                            <Text style={styles.miniLabel}>{t('wallet.pending')}</Text>
                            <Text style={styles.miniValue}>$400.00</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.withdrawButton}>
                        <Text style={styles.withdrawText}>{t('wallet.request_withdrawal')}</Text>
                    </TouchableOpacity>
                </View>


                {/* Accepted Payment Methods */}
                <View style={[styles.sectionHeader, { marginTop: 24, marginBottom: 16 }]}>
                    <Text style={styles.sectionTitle}>{t('wallet.payment_methods')}</Text>
                    <Text style={styles.sectionSubtitle}>Toggle methods you accept from customers</Text>
                </View>

                {paymentGroups.map((group, gIdx) => (
                    <View key={group.title} style={{ marginBottom: 20 }}>
                        <Text style={[styles.groupTitle, { color: theme.subText }]}>{group.title}</Text>
                        <View style={[styles.paymentMethodsGrid, { backgroundColor: theme.cardBackground }]}>
                            {group.methods.map((method, mIdx) => (
                                <TouchableOpacity 
                                    key={method.id} 
                                    activeOpacity={0.7}
                                    style={[
                                        styles.paymentMethodItem, 
                                        { borderBottomColor: theme.border, borderBottomWidth: mIdx === group.methods.length - 1 ? 0 : 1 }
                                    ]}
                                    onPress={() => navigation.navigate('PaymentMethodDetail', { method })}
                                >
                                    <View style={[styles.methodIconBox, { backgroundColor: `${method.color}10` }]}>
                                        <MaterialCommunityIcons name={method.icon} size={22} color={method.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.methodLabel, { color: enabledMethods[method.id] ? theme.text : theme.subText }]}>
                                            {method.label}
                                        </Text>
                                        {method.subtitle && <Text style={styles.methodSubtitle}>{method.subtitle}</Text>}
                                    </View>
                                    <Switch
                                        value={enabledMethods[method.id]}
                                        onValueChange={() => toggleMethod(method.id)}
                                        trackColor={{ false: '#767577', true: theme.tint }}
                                        thumbColor={'#FFFFFF'}
                                        ios_backgroundColor="#3e3e3e"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('wallet.recent_transactions')}</Text>
                <View style={[styles.historyParams, { backgroundColor: theme.cardBackground }]}>
                    {transactions.map(item => (
                        <View key={item.id}>
                            {renderTransaction({ item })}
                        </View>
                    ))}
                    <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('TransactionsHistory')}>
                        <Text style={[styles.viewAllText, { color: theme.subText }]}>{t('wallet.view_all_transactions')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 40,
    },
    balanceCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#F4C430',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
    balanceLabel: {
        color: 'rgba(0,0,0,0.5)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    balanceAmount: {
        color: '#000',
        fontSize: 40,
        fontWeight: '800',
        marginBottom: 24,
    },
    balanceRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 24,
    },
    miniLabel: {
        color: 'rgba(0,0,0,0.4)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    miniValue: {
        color: '#000',
        fontSize: 20,
        fontWeight: '700',
    },
    withdrawButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    withdrawText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        // paddingHorizontal: 20,
        gap:20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    
    },
    addLink: {
        fontWeight: '700',
        fontSize: 14,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    bankIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: 'rgba(244, 196, 48, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bankName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    bankAccount: {
        fontSize: 14,
        color: '#8E8E93',
    },
    historyParams: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 8,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transDetails: {
        flex: 1,
    },
    transTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    transSub: {
        fontSize: 13,
        color: '#8E8E93',
    },
    transRight: {
        alignItems: 'flex-end',
    },
    transAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    transDate: {
        fontSize: 11,
        color: '#8E8E93',
    },
    viewAllBtn: {
        padding: 16,
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
    },
    paymentMethodsGrid: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    methodIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    methodLabel: {
        fontSize: 17,
        fontWeight: '700',
    },
    methodSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
    },
    sectionSubtitle: {
        fontSize: 10,
        color: '#8E8E93',
    },
    groupTitle: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    }
});

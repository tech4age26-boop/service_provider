import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { SettingsHeader } from '../../components/common/SettingsHeader';
import { colors } from '../../theme/colors';

export function TransactionsHistoryScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const transactions = [
        { id: '1', type: 'payout', amount: '-$500.00', date: 'Today, 2:30 PM', status: 'Processing' },
        { id: '2', type: 'earning', amount: '+$150.00', date: 'Yesterday, 4:15 PM', status: 'Completed', detail: 'Oil Change - #ORD-123' },
        { id: '3', type: 'earning', amount: '+$80.00', date: 'Yesterday, 1:00 PM', status: 'Completed', detail: 'Brake Check - #ORD-120' },
        { id: '4', type: 'payout', amount: '-$1200.00', date: 'Jan 5, 2024', status: 'Completed' },
        { id: '5', type: 'earning', amount: '+$220.00', date: 'Jan 4, 2024', status: 'Completed', detail: 'Full Service - #ORD-115' },
        { id: '6', type: 'earning', amount: '+$45.00', date: 'Jan 3, 2024', status: 'Completed', detail: 'Car Wash - #ORD-112' },
    ];

    const renderTransaction = ({ item }: any) => (
        <View style={[styles.transactionItem, { borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'earning' ? colors.successLight : colors.primaryLight }]}>
                <MaterialCommunityIcons
                    name={item.type === 'earning' ? 'arrow-down-left' : 'arrow-up-right'}
                    size={22}
                    color={item.type === 'earning' ? colors.success : colors.primary}
                />
            </View>
            <View style={styles.transDetails}>
                <Text style={[styles.transTitle, { color: theme.text }]}>
                    {item.type === 'earning' ? t('wallet.payment_received') : t('wallet.payout_withdrawal')}
                </Text>
                <Text style={styles.transSub}>{item.detail || item.status}</Text>
            </View>
            <View style={styles.transRight}>
                <Text style={[styles.transAmount, { color: item.type === 'earning' ? colors.success : theme.text }]}>
                    {item.amount}
                </Text>
                <Text style={styles.transDate}>{item.date}</Text>
            </View>
        </View>
    );

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader title={t('wallet.recent_transactions')} />
            
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </AppBody>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
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
});

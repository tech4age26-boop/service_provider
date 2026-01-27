import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { SettingsHeader } from '../../components/common/SettingsHeader';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

interface Card {
    id: string;
    brand: 'visa' | 'mastercard' | 'mada';
    last4: string;
    expiry: string;
    holder: string;
    isDefault: boolean;
    color: string;
}

export function PaymentInfoScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [savedCards, setSavedCards] = useState<Card[]>([
        {
            id: '1',
            brand: 'visa',
            last4: '4242',
            expiry: '12/26',
            holder: 'ANAS SALEEM',
            isDefault: true,
            color: colors.secondary
        },
        {
            id: '2',
            brand: 'mastercard',
            last4: '8888',
            expiry: '09/25',
            holder: 'ANAS SALEEM',
            isDefault: false,
            color: '#3A3A3A'
        },
        {
            id: '3',
            brand: 'mada',
            last4: '1234',
            expiry: '09/25',
            holder: 'ANAS SALEEM',
            isDefault: false,
            color: '#3A3A3A'
        },
    ]);

    const [cardFormData, setCardFormData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handleOpenModal = (card?: Card) => {
        if (card) {
            setEditingCardId(card.id);
            setCardFormData({
                number: `•••• •••• •••• ${card.last4}`,
                expiry: card.expiry,
                cvv: '•••',
                name: card.holder
            });
        } else {
            setEditingCardId(null);
            setCardFormData({ number: '', expiry: '', cvv: '', name: '' });
        }
        setModalVisible(true);
    };

    const handleSaveCard = () => {
        if (editingCardId) {
            setSavedCards(savedCards.map(c =>
                c.id === editingCardId
                    ? { ...c, holder: cardFormData.name.toUpperCase(), expiry: cardFormData.expiry }
                    : c
            ));
        } else {
            const card: Card = {
                id: Math.random().toString(),
                brand: cardFormData.number.startsWith('4') ? 'visa' : (cardFormData.number.startsWith('5') ? 'mastercard' : 'mada'),
                last4: cardFormData.number.slice(-4),
                expiry: cardFormData.expiry,
                holder: cardFormData.name.toUpperCase(),
                isDefault: savedCards.length === 0,
                color: colors.secondary
            };
            setSavedCards([...savedCards, card]);
        }
        setModalVisible(false);
    };

    const removeCard = (id: string) => {
        setSavedCards(savedCards.filter(c => c.id !== id));
    };

    const transactions = [
        { id: '1', type: 'payout', amount: '-$500.00', date: 'Today, 2:30 PM', status: 'Processing' },
        { id: '2', type: 'earning', amount: '+$150.00', date: 'Yesterday, 4:15 PM', status: 'Completed', detail: 'Oil Change - #ORD-123' },
        { id: '3', type: 'earning', amount: '+$80.00', date: 'Yesterday, 1:00 PM', status: 'Completed', detail: 'Brake Check - #ORD-120' },
        { id: '4', type: 'payout', amount: '-$1200.00', date: 'Jan 5, 2024', status: 'Completed' },
    ];

    const CreditCard = ({ card }: { card: Card }) => {
        // Guaranteed valid icon names for the card brand area
        const getIconName = () => {
            switch (card.brand) {
                case 'visa': return 'credit-card-chip-outline';
                case 'mastercard': return 'credit-card-scan-outline';
                case 'mada': return 'credit-card-wireless-outline';
                default: return 'credit-card-outline';
            }
        };

        return (
            <View style={styles.cardContainer}>
                <View style={[styles.cardVisual, { backgroundColor: card.color }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardChip} />
                        <MaterialCommunityIcons
                            name={getIconName()}
                            size={42}
                            color={colors.primary}
                        />
                    </View>

                    <Text style={styles.cardNumberText}>••••  ••••  ••••  {card.last4}</Text>

                    <View style={styles.cardFooter}>
                        <View>
                            <Text style={styles.cardLabelText}>{t('wallet.cardholder_name')}</Text>
                            <Text style={styles.cardValueText}>{card.holder}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.cardLabelText}>{t('wallet.expiry_date')}</Text>
                            <Text style={styles.cardValueText}>{card.expiry}</Text>
                        </View>
                    </View>

                    {card.isDefault && (
                        <View style={styles.defaultIndicator}>
                            <MaterialCommunityIcons name="check-decagram" size={12} color={colors.primary} />
                            <Text style={styles.defaultIndicatorText}>{t('wallet.default_badge')}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => handleOpenModal(card)}
                    >
                        <MaterialCommunityIcons name="circle-edit-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: 'rgba(255, 59, 48, 0.2)' }]}
                        onPress={() => removeCard(card.id)}
                    >
                        <MaterialCommunityIcons name="minus-circle-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderTransaction = (item: any) => (
        <View key={item.id} style={[styles.transactionRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.transactionIcon, { backgroundColor: item.type === 'earning' ? colors.successLight : colors.primaryLight }]}>
                <MaterialCommunityIcons
                    name={item.type === 'earning' ? 'arrow-bottom-left' : 'arrow-top-right'}
                    size={20}
                    color={item.type === 'earning' ? colors.success : colors.primary}
                />
            </View>
            <View style={styles.transactionMain}>
                <Text style={[styles.transactionTitle, { color: theme.text }]}>
                    {item.type === 'earning' ? t('wallet.payment_received') : t('wallet.payout_withdrawal')}
                </Text>
                {/* Date text explicitly using theme.subText for dark mode visibility */}
                <Text style={[styles.transactionDate, { color: theme.subText }]}>{item.date}</Text>
            </View>
            <View style={styles.transactionEnd}>
                <Text style={[styles.transactionAmount, { color: item.type === 'earning' ? colors.success : theme.text }]}>
                    {item.amount}
                </Text>
                {/* Status text explicitly using theme.subText for dark mode visibility */}
                <Text style={[styles.transactionStatus, { color: theme.subText }]}>{item.status === 'Processing' ? t('wallet.processing') : t('wallet.completed')}</Text>
            </View>
        </View>
    );

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader title={t('settings.payment_info')} />

            <ScrollView
                contentContainerStyle={styles.mainContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium gold & black Balance Card */}
                <View style={styles.balanceSection}>
                    <View style={[styles.balanceCardPremium, { borderBottomColor: colors.primary, borderBottomWidth: 1 }]}>
                        <View style={styles.balanceCardTop}>
                            <View>
                                <Text style={styles.balanceLabelPremium}>{t('wallet.total_balance')}</Text>
                                <Text style={styles.balanceAmountPremium}>{t('wallet.currency')} 1,250.00</Text>
                            </View>
                            <View style={styles.balanceIconBadge}>
                                <MaterialCommunityIcons name="safe-square-outline" size={30} color={colors.primary} />
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>{t('wallet.balance_available')}</Text>
                                <Text style={styles.statValue}>{t('wallet.sar')} 850.00</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>{t('wallet.balance_pending')}</Text>
                                <Text style={styles.statValue}>{t('wallet.sar')} 400.00</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.expressWithdrawBtn}>
                        <Text style={styles.expressWithdrawText}>{t('wallet.request_withdrawal')}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Saved Cards Header */}
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('wallet.saved_cards')}</Text>
                    <TouchableOpacity style={styles.premiumAddBtn} onPress={() => handleOpenModal()}>
                        <MaterialCommunityIcons name="plus-circle" size={18} color={colors.secondary} />
                        <Text style={styles.premiumAddText}>{t('wallet.add_card')}</Text>
                    </TouchableOpacity>
                </View>

                {savedCards.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalCards}
                        snapToInterval={width * 0.85}
                        decelerationRate="fast"
                    >
                        {savedCards.map(card => (
                            <CreditCard key={card.id} card={card} />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.emptyStateContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <MaterialCommunityIcons name="credit-card-off-outline" size={50} color={theme.subText} />
                        <Text style={[styles.emptyStateTitle, { color: theme.subText }]}>{t('wallet.no_cards')}</Text>
                    </View>
                )}

                {/* Transactions Section */}
                <View style={styles.transactionsHeader}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('wallet.recent_transactions')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TransactionsHistory')}>
                        <Text style={styles.seeAllText}>{t('common.view_all')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.transactionsList, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    {transactions.map(item => renderTransaction(item))}
                </View>
            </ScrollView>

            {/* Add/Edit Card Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={[styles.modalSheet, { backgroundColor: theme.cardBackground }]}
                    >
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={[styles.sheetTitle, { color: theme.text }]}>
                                {editingCardId ? t('wallet.edit_card') : t('wallet.add_card')}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close-circle" size={26} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('wallet.cardholder_name')}</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    placeholder={t('wallet.holder_placeholder')}
                                    placeholderTextColor={theme.subText}
                                    value={cardFormData.name}
                                    onChangeText={(text) => setCardFormData({ ...cardFormData, name: text })}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('wallet.card_number')}</Text>
                                <TextInput
                                    style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    placeholder={t('wallet.card_number_placeholder')}
                                    placeholderTextColor={theme.subText}
                                    keyboardType="numeric"
                                    maxLength={19}
                                    editable={!editingCardId}
                                    value={cardFormData.number}
                                    onChangeText={(text) => setCardFormData({ ...cardFormData, number: text })}
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.fieldGroup, { flex: 1.5 }]}>
                                    <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('wallet.expiry_date')}</Text>
                                    <TextInput
                                        style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        placeholder={t('wallet.expiry_placeholder')}
                                        placeholderTextColor={theme.subText}
                                        maxLength={5}
                                        value={cardFormData.expiry}
                                        onChangeText={(text) => setCardFormData({ ...cardFormData, expiry: text })}
                                    />
                                </View>
                                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 16 }]}>
                                    <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('wallet.cvv')}</Text>
                                    <TextInput
                                        style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        placeholder="•••"
                                        placeholderTextColor={theme.subText}
                                        keyboardType="numeric"
                                        maxLength={3}
                                        secureTextEntry
                                        editable={!editingCardId}
                                        value={cardFormData.cvv}
                                        onChangeText={(text) => setCardFormData({ ...cardFormData, cvv: text })}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.primarySaveBtn} onPress={handleSaveCard}>
                                <Text style={styles.primarySaveBtnText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    balanceSection: {
        marginBottom: 32,
    },
    balanceCardPremium: {
        backgroundColor: colors.secondary,
        borderRadius: 24,
        padding: 24,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
    },
    balanceCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    balanceLabelPremium: {
        color: 'rgba(255, 255, 255, 0.5)',
        ...typography.caption,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    balanceAmountPremium: {
        color: colors.primary,
        ...typography.header,
        fontSize: 34,
        fontWeight: '900',
        marginTop: 4,
    },
    balanceIconBadge: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 18,
        padding: 16,
    },
    statItem: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginHorizontal: 16,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        ...typography.caption,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statValue: {
        color: '#FFF',
        ...typography.subheader,
        fontSize: 17,
        fontWeight: '800',
        marginTop: 4,
    },
    expressWithdrawBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        marginTop: -16,
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    expressWithdrawText: {
        color: colors.secondary,
        ...typography.button,
        fontSize: 14,
        marginRight: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        ...typography.subheader,
        fontWeight: '900',
        letterSpacing: 0.2,
    },
    premiumAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    premiumAddText: {
        ...typography.button,
        fontSize: 13,
        color: colors.secondary,
        marginLeft: 6,
    },
    horizontalCards: {
        paddingRight: 20,
        paddingBottom: 10,
    },
    cardContainer: {
        width: width * 0.8,
        marginRight: 20,
    },
    cardVisual: {
        height: 185,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardChip: {
        width: 45,
        height: 32,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cardNumberText: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardLabelText: {
        color: 'rgba(255,255,255,0.5)',
        ...typography.caption,
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardValueText: {
        color: '#FFF',
        ...typography.body,
        fontSize: 13,
        fontWeight: '800',
    },
    cardActions: {
        flexDirection: 'row',
        position: 'absolute',
        top: 12,
        right: 12,
        gap: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultIndicator: {
        position: 'absolute',
        bottom: 75,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    defaultIndicatorText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
        marginLeft: 4,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 16,
    },
    seeAllText: {
        color: colors.primary,
        ...typography.button,
        fontSize: 14,
    },
    transactionsList: {
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionMain: {
        flex: 1,
        marginLeft: 16,
    },
    transactionTitle: {
        ...typography.body,
        fontWeight: '800',
        marginBottom: 2,
    },
    transactionDate: {
        ...typography.caption,
        fontWeight: '600',
    },
    transactionEnd: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        ...typography.body,
        fontWeight: '900',
        marginBottom: 2,
    },
    transactionStatus: {
        ...typography.caption,
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(128,128,128,0.3)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    sheetTitle: {
        ...typography.header,
        fontSize: 22,
    },
    closeBtn: {
        padding: 4,
    },
    formContainer: {
        gap: 20,
    },
    fieldGroup: {
        gap: 8,
    },
    fieldLabel: {
        ...typography.caption,
        fontWeight: '800',
        marginLeft: 4,
    },
    formInput: {
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 60,
        ...typography.body,
        borderWidth: 1,
    },
    formRow: {
        flexDirection: 'row',
    },
    primarySaveBtn: {
        backgroundColor: colors.primary,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    primarySaveBtnText: {
        color: colors.secondary,
        ...typography.button,
        fontSize: 18,
        letterSpacing: 1,
    },
    emptyStateContainer: {
        height: 200,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyStateTitle: {
        marginTop: 16,
        ...typography.body,
        fontWeight: '800',
    },
});

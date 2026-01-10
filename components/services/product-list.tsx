import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Service } from '../../types';
import { colors } from '../../theme/colors';

interface ProductListProps {
    data: Service[];
    onEdit: (item: Service) => void;
    onDelete: (id: string) => void;
}

export const ProductList = ({ data, onEdit, onDelete }: ProductListProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const renderRightActions = (id: string) => {
        return (
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => onDelete(id)}
                >
                    <MaterialCommunityIcons name="delete" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Service }) => {
        const isInactive = item.status === 'inactive';
        const stockCount = parseInt(item.stock || '0');
        const isLowStock = stockCount < 5 && stockCount > 0;
        const isOutOfStock = stockCount === 0;

        return (
            <View style={styles.cardWrapper}>
                <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: theme.cardBackground }]}
                        onPress={() => onEdit(item)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.imageContainer}>
                            {item.images && item.images.length > 0 ? (
                                <Image source={{ uri: item.images[0] }} style={styles.image} />
                            ) : (
                                <View style={[styles.imagePlaceholder, { backgroundColor: theme.inputBackground }]}>
                                    <MaterialCommunityIcons
                                        name="package-variant"
                                        size={32}
                                        color={theme.subText}
                                    />
                                </View>
                            )}
                            {isOutOfStock && (
                                <View style={styles.outOfStockOverlay}>
                                    <Text style={styles.outOfStockText}>OUT</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.info}>
                            <View style={styles.headerRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <View style={styles.companyRow}>
                                        <MaterialCommunityIcons name="domain" size={12} color={theme.subText} />
                                        <Text style={styles.companyText}> {item.company || t('products.generic')}</Text>
                                    </View>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.price, { color: theme.tint }]}>
                                        {item.price}
                                        <Text style={[styles.currency, { color: theme.text }]}> {t('wallet.sar')}</Text>
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.detailsRow}>
                                <View style={[styles.skuBadge, { backgroundColor: theme.inputBackground }]}>
                                    <Text style={[styles.skuText, { color: theme.subText }]}>{t('products.sku_label')}: {item.sku || 'N/A'}</Text>
                                </View>

                                <View style={[
                                    styles.stockBadge,
                                    isOutOfStock ? { backgroundColor: colors.dangerLight } :
                                        isLowStock ? { backgroundColor: colors.warning + '20' } :
                                            { backgroundColor: colors.successLight }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={isOutOfStock ? "close-circle" : "check-circle"}
                                        size={12}
                                        color={isOutOfStock ? colors.danger : isLowStock ? colors.warning : colors.success}
                                    />
                                    <Text style={[
                                        styles.stockText,
                                        { color: isOutOfStock ? colors.danger : isLowStock ? colors.warning : colors.success }
                                    ]}>
                                        {' '}{isOutOfStock ? t('products.out_of_stock') : `${item.stock || 0} ${t('products.in_stock')}`}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.footerRow}>
                                <View style={[styles.categoryTag, { borderColor: theme.border }]}>
                                    <Text style={[styles.categoryText, { color: theme.subText }]}>
                                        {item.subCategory || t('products.general')}
                                    </Text>
                                </View>

                                {isInactive && (
                                    <View style={[styles.statusTag, { backgroundColor: colors.dangerLight }]}>
                                        <Text style={[styles.statusText, { color: colors.danger }]}>{t('status.inactive')}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Swipeable>
            </View>
        );
    };

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 100 }} />}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 20,
    },
    cardWrapper: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingVertical: 4,
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyText: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
    },
    currency: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    skuBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    skuText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'monospace', // Monospaced for tech feel
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '600',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '500',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    actionsContainer: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAction: {
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
});

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Service } from '../../types';
import { colors } from '../../theme/colors';

interface ServiceListProps {
    data: Service[];
    onEdit: (item: Service) => void;
    onDelete: (id: string) => void;
}

export const ServiceList = ({ data, onEdit, onDelete }: ServiceListProps) => {
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
        return (
            <View style={styles.cardWrapper}>
                <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: theme.cardBackground }]}
                        onPress={() => onEdit(item)}
                        activeOpacity={0.9}
                    >
                        {/* Header: Icon & Name & Price */}
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: isInactive ? theme.border : colors.primaryLight }]}>
                                <MaterialCommunityIcons
                                    name="car-wrench"
                                    size={28}
                                    color={isInactive ? theme.subText : theme.tint}
                                />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                                <Text style={styles.duration}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color={theme.subText} /> {item.duration} {t('technician.duration_min')}
                                </Text>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={[styles.price, { color: theme.success }]}>{item.price}</Text>
                                <Text style={[styles.currency, { color: theme.success }]}>{t('wallet.sar')}</Text>
                            </View>
                        </View>

                        {/* Service Types Tags */}
                        {item.serviceTypes && item.serviceTypes.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {item.serviceTypes.slice(0, 3).map((type, index) => (
                                    <View key={index} style={[styles.tag, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.tagText, { color: theme.subText }]}>
                                            {type === 'Other' ? (item.otherServiceName || type) : type}
                                        </Text>
                                    </View>
                                ))}
                                {item.serviceTypes.length > 3 && (
                                    <Text style={[styles.moreTags, { color: theme.subText }]}>+{item.serviceTypes.length - 3}</Text>
                                )}
                            </View>
                        )}

                        {/* Footer: Status Badge */}
                        <View style={styles.cardFooter}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: isInactive ? colors.dangerLight : colors.successLight }
                            ]}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: isInactive ? colors.danger : colors.success }
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: isInactive ? colors.danger : colors.success }
                                ]}>
                                    {isInactive ? t('status.inactive') : t('status.active')}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
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
        paddingBottom: 100,
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
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    duration: {
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
        marginTop: 2,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        alignItems: 'center',
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    moreTags: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    actionsContainer: {
        width: 80,
        height: '100%',
    },
    deleteAction: {
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
});

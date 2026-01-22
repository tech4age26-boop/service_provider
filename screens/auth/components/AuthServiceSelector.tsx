import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const SERVICES = [
    { id: '1', key: 'car_wash', icon: 'car-wash-outline' },
    { id: '2', key: 'oil_change', icon: 'oil-lamp' },
    { id: '3', key: 'tire_service', icon: 'tire' },
    { id: '4', key: 'brake_service', icon: 'car-brake-alert' },
    { id: '5', key: 'engine_diagnostics', icon: 'engine-outline' },
    { id: '6', key: 'ac_repair', icon: 'snowflake' },
];

// Split services into rows of 3
const ROW_1 = SERVICES.slice(0, 3);
const ROW_2 = SERVICES.slice(3, 6);

interface AuthServiceSelectorProps {
    selectedServices: string[];
    onToggleService: (id: string) => void;
}

export const AuthServiceSelector = ({ selectedServices, onToggleService }: AuthServiceSelectorProps) => {
    const { t } = useTranslation();

    const renderServiceItem = (item: typeof SERVICES[0], isSelected: boolean) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
            onPress={() => onToggleService(item.id)}
            activeOpacity={0.7}>
            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color={isSelected ? colors.white : colors.primary}
                />
            </View>
            <Text
                style={[styles.serviceText, isSelected && styles.serviceTextSelected]}
                numberOfLines={2}>
                {t(`services.${item.key}`)}
            </Text>
            {isSelected && (
                <View style={styles.checkBadge}>
                    <MaterialCommunityIcons name="check-bold" size={8} color={colors.white} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('registration.select_services')}</Text>
            <Text style={styles.subtitle}>{t('registration.services_subtitle')}</Text>

            <View style={styles.row}>
                {ROW_1.map((item) => renderServiceItem(item, selectedServices.includes(item.id)))}
            </View>
            <View style={styles.row}>
                {ROW_2.map((item) => renderServiceItem(item, selectedServices.includes(item.id)))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 13,
        color: colors.subText,
        marginBottom: 16,
        fontFamily: typography.fontFamily,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    serviceItem: {
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: colors.white,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 6,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        position: 'relative',
    },
    serviceItemSelected: {
        borderColor: colors.primary,
        backgroundColor: '#FFFEF5',
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    iconContainerSelected: {
        backgroundColor: colors.primary,
    },
    serviceText: {
        fontSize: 10,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: typography.fontFamily,
        lineHeight: 13,
    },
    serviceTextSelected: {
        color: colors.text,
        fontWeight: '700',
    },
    checkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.white,
    },
});

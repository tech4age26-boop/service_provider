import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
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

interface AuthServiceSelectorProps {
    selectedServices: string[];
    onToggleService: (id: string) => void;
}

export const AuthServiceSelector = ({ selectedServices, onToggleService }: AuthServiceSelectorProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('registration.select_services')}</Text>
            <Text style={styles.subtitle}>{t('registration.services_subtitle')}</Text>
            
            <View style={styles.grid}>
                {SERVICES.map((item) => {
                    const isSelected = selectedServices.includes(item.id);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.serviceItem,
                                isSelected && styles.serviceItemSelected
                            ]}
                            onPress={() => onToggleService(item.id)}
                            activeOpacity={0.7}>
                            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                                <MaterialCommunityIcons
                                    name={item.icon as any}
                                    size={28}
                                    color={isSelected ? colors.white : colors.primary}
                                />
                            </View>
                            <Text style={[
                                styles.serviceText,
                                isSelected && styles.serviceTextSelected
                            ]}>
                                {t(`services.${item.key}`)}
                            </Text>
                            {isSelected && (
                                <View style={styles.checkBadge}>
                                    <MaterialCommunityIcons name="check-bold" size={12} color={colors.white} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
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
        marginBottom: 20,
        fontFamily: typography.fontFamily,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    serviceItem: {
        width: '45.5%',
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        margin: 8,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    serviceItemSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconContainerSelected: {
        backgroundColor: colors.primary,
    },
    serviceText: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: typography.fontFamily,
        lineHeight: 18,
    },
    serviceTextSelected: {
        color: colors.text,
        fontWeight: '800',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
});

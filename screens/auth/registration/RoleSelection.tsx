import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

interface RoleSelectionProps {
    onSelect: (role: 'workshop' | 'individual') => void;
    onBack: () => void;
}

export const RoleSelection = ({ onSelect, onBack }: RoleSelectionProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>{t('common.register')}</Text>
                <Text style={styles.subtitle}>{t('registration.role_selection_subtitle')}</Text>
            </View>

            <View style={styles.cardsContainer}>
                <TouchableOpacity 
                    style={styles.card} 
                    onPress={() => onSelect('workshop')}
                    activeOpacity={0.8}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="office-building" size={32} color={colors.primary} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{t('registration.type_workshop')}</Text>
                        <Text style={styles.cardDescription}>{t('registration.workshop_desc')}</Text>
                    </View>
                    <View style={styles.arrowCircle}>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subText} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.card} 
                    onPress={() => onSelect('individual')}
                    activeOpacity={0.8}>
                    <View style={[styles.iconCircle, { backgroundColor: '#E6F0FF' }]}>
                        <MaterialCommunityIcons name="account-wrench" size={32} color="#007AFF" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{t('registration.type_individual')}</Text>
                        <Text style={styles.cardDescription}>{t('registration.individual_desc')}</Text>
                    </View>
                    <View style={styles.arrowCircle}>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subText} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        marginBottom: 48,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 10,
        fontFamily: typography.fontFamily,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: colors.subText,
        fontFamily: typography.fontFamily,
        lineHeight: 24,
        fontWeight: '500',
    },
    cardsContainer: {
        gap: 24,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: '#FFF9E6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flex: 1,
        marginLeft: 20,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 6,
        fontFamily: typography.fontFamily,
    },
    cardDescription: {
        fontSize: 14,
        color: colors.subText,
        lineHeight: 22,
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ServiceProductTabsProps {
    activeTab: 'services' | 'products';
    onTabChange: (tab: 'services' | 'products') => void;
    counts?: { services: number; products: number };
}

export const ServiceProductTabs = ({
    activeTab,
    onTabChange,
    counts = { services: 0, products: 0 },
}: ServiceProductTabsProps) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'services' && styles.activeTab,
                    {
                        backgroundColor:
                            activeTab === 'services' ? theme.tint : 'transparent',
                    },
                ]}
                onPress={() => onTabChange('services')}
            >
                <Text
                    style={[
                        styles.tabText,
                        {
                            color: activeTab === 'services' ? '#1C1C1E' : theme.subText,
                            fontWeight: activeTab === 'services' ? 'bold' : '600',
                        },
                    ]}
                >
                    {t('products.services')} ({counts.services})
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'products' && styles.activeTab,
                    {
                        backgroundColor:
                            activeTab === 'products' ? theme.tint : 'transparent',
                    },
                ]}
                onPress={() => onTabChange('products')}
            >
                <Text
                    style={[
                        styles.tabText,
                        {
                            color: activeTab === 'products' ? '#1C1C1E' : theme.subText,
                            fontWeight: activeTab === 'products' ? 'bold' : '600',
                        },
                    ]}
                >
                    {t('products.parts')} ({counts.products})
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 6,
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
    },
});

import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';

interface FABProps {
    onPress: () => void;
    icon?: string;
    label?: string;
}

export const FAB = ({ onPress, icon = 'plus', label }: FABProps) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.tint }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <MaterialCommunityIcons name={icon} size={24} color="#1C1C1E" />
            {label && <Text style={styles.label}>{label}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 60,
        elevation: 6,
        shadowColor: '#F4C430',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        minHeight: 56,
        zIndex: 9999,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginLeft: 8,
    },
});

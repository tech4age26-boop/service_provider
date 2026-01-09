import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TextInputProps } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

interface AuthInputProps extends TextInputProps {
    label?: string;
    icon?: string;
    error?: string;
}

export const AuthInput = ({ label, icon, error, ...props }: AuthInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                error && styles.inputError
            ]}>
                {icon && (
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={isFocused ? colors.primary : (error ? colors.danger : colors.subText)}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    placeholderTextColor={colors.subText}
                    style={styles.input}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 4,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
    },
    inputFocused: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.1,
        elevation: 6,
    },
    inputError: {
        borderColor: colors.danger,
    },
    icon: {
        marginRight: 12,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
    errorText: {
        color: colors.danger,
        fontSize: 12,
        marginLeft: 4,
        fontFamily: typography.fontFamily,
    },
});

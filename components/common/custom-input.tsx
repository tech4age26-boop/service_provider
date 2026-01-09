import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';

interface CustomInputProps extends TextInputProps {
    label?: string;
    required?: boolean;
    error?: string;
}

export const CustomInput = ({
    label,
    required,
    error,
    style,
    ...props
}: CustomInputProps) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, { color: theme.text }]}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: error ? colors.danger : theme.border,
                    },
                    style,
                ]}
                placeholderTextColor={theme.subText}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        color: colors.danger,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    errorText: {
        fontSize: 12,
        color: colors.danger,
        marginTop: 4,
    },
});

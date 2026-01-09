import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { useNavigation } from '@react-navigation/native';

interface SettingsHeaderProps {
    title: string;
    rightElement?: React.ReactNode;
    style?: ViewStyle;
    onBack?: () => void;
}

export function SettingsHeader({ title, rightElement, style, onBack }: SettingsHeaderProps) {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }, style]}>
            <TouchableOpacity
                onPress={handleBack}
                style={[styles.backButton, { backgroundColor: theme.background }]}
            >
                <MaterialCommunityIcons
                    name="arrow-left"
                    size={22}
                    color={theme.text}
                />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {title}
            </Text>

            <View style={styles.rightContainer}>
                {rightElement || <View style={{ width: 24 }} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 10,
        borderBottomWidth: 1,
        //     paddingHorizontal: 20,
        // paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 5,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: typography.fontFamily,
        flex: 1,
        textAlign: 'center',
    },
    rightContainer: {
        minWidth: 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginRight: -8,
    }
});

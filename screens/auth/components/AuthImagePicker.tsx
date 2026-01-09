import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

interface AuthImagePickerProps {
    imageUri: string | null;
    onPickImage: () => void;
    label?: string;
    placeholderIcon?: string;
}

export const AuthImagePicker = ({ 
    imageUri, 
    onPickImage, 
    label, 
    placeholderIcon = 'image-plus' 
}: AuthImagePickerProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={[styles.uploadArea, imageUri && styles.uploadAreaActive]}
                onPress={onPickImage}
                activeOpacity={0.7}>
                {imageUri ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        <View style={styles.changeBadge}>
                            <MaterialCommunityIcons name="camera-refresh" size={16} color={colors.white} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name={placeholderIcon} size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>{t('registration.upload_photo')}</Text>
                        <Text style={styles.uploadSubtitle}>{t('registration.file_requirements')}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        gap: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 4,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.5,
    },
    uploadArea: {
        backgroundColor: colors.white,
        borderRadius: 24,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'dashed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 3,
        overflow: 'hidden',
    },
    uploadAreaActive: {
        borderStyle: 'solid',
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    previewContainer: {
        width: '100%',
        height: '100%',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    changeBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        fontFamily: typography.fontFamily,
    },
    uploadSubtitle: {
        fontSize: 13,
        color: colors.subText,
        marginTop: 6,
        fontFamily: typography.fontFamily,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

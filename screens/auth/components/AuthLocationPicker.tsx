import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

interface AuthLocationPickerProps {
    onLocationDetected: (lat: number, lon: number, address: string) => void;
    label?: string;
    currentAddress?: string;
}
declare const navigator: {
    geolocation: {
        getCurrentPosition: (
            success: (position: any) => void,
            error?: (error: any) => void,
            options?: any
        ) => void;
    };
};

export const AuthLocationPicker = ({ 
    onLocationDetected, 
    label,
    currentAddress 
}: AuthLocationPickerProps) => {
    const { t } = useTranslation();
    const [isDetecting, setIsDetecting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>(
        currentAddress ? 'success' : 'idle'
    );

    const detectLocation = async () => {
        setIsDetecting(true);
        setStatus('detecting');
        const geo = (globalThis as any).navigator?.geolocation || (navigator as any).geolocation;
        
        if (geo) {
            geo.getCurrentPosition(
                async (position: any) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                            {
                                headers: {
                                    'User-Agent': 'FilterApp/1.0',
                                },
                            }
                        );
                        const data = await response.json();
                        const address = data.display_name || `${latitude}, ${longitude}`;
                        
                        onLocationDetected(latitude, longitude, address);
                        setStatus('success');
                    } catch (error) {
                        console.error('Reverse geocoding error:', error);
                        onLocationDetected(latitude, longitude, `${latitude}, ${longitude}`);
                        setStatus('success');
                    } finally {
                        setIsDetecting(false);
                    }
                },
                (error: any) => {
                    console.error('Geolocation error:', error);
                    setIsDetecting(false);
                    setStatus('error');
                    Alert.alert(
                        'Location Error',
                        'Failed to detect your location. Please ensure GPS is enabled and permissions are granted.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() }
                        ]
                    );
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            setIsDetecting(false);
            setStatus('error');
            Alert.alert('Error', 'Geolocation is not supported on this device');
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <View style={styles.pickerWrapper}>
                <TouchableOpacity
                    style={[
                        styles.pickerButton,
                        status === 'success' && styles.pickerButtonSuccess,
                        status === 'error' && styles.pickerButtonError
                    ]}
                    onPress={detectLocation}
                    disabled={isDetecting}>
                    
                    <View style={styles.iconCircle}>
                        {isDetecting ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <MaterialCommunityIcons 
                                name={status === 'success' ? 'map-check' : 'map-marker-radius'} 
                                size={24} 
                                color={status === 'success' ? colors.success : colors.primary} 
                            />
                        )}
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.buttonTitle}>
                            {isDetecting ? t('registration.detecting_location') : 
                             status === 'success' ? t('registration.location_found') : 
                             t('registration.detect_location')}
                        </Text>
                        <Text style={[
                            styles.helperText,
                            status === 'success' && styles.successText
                        ]} numberOfLines={2}>
                            {currentAddress || t('registration.location_helper')}
                        </Text>
                    </View>

                    {status === 'success' && (
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                    )}
                </TouchableOpacity>
            </View>
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
    pickerWrapper: {
        borderRadius: 20,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: colors.border,
        minHeight: 80,
    },
    pickerButtonSuccess: {
        borderColor: colors.success + '40', 
        backgroundColor: colors.success + '08', 
    },
    pickerButtonError: {
        borderColor: colors.danger + '40',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.text,
        fontFamily: typography.fontFamily,
        marginBottom: 4,
    },
    helperText: {
        fontSize: 13,
        color: colors.subText,
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
    successText: {
        color: colors.text,
        fontWeight: '600',
    },
});

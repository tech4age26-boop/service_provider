import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    ImageBackground,
    Alert,
    Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoleSelection } from './registration/RoleSelection';
import { WorkshopForm } from './registration/WorkshopForm';
import { TechnicianForm } from './registration/TechnicianForm';
import { colors } from '../../theme/colors';

interface RegistrationScreenProps {
    onBack: () => void;
    onRegister: () => void;
}

const API_BASE_URL = 'https://filter-server.vercel.app';

const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
    return (
        <View style={styles.progressContainer}>
            {[1, 2].map((step) => (
                <React.Fragment key={step}>
                    <View style={[
                        styles.progressCircle,
                        currentStep >= step && styles.progressCircleActive
                    ]}>
                        <View style={[
                            styles.progressInner,
                            currentStep >= step && styles.progressInnerActive
                        ]} />
                    </View>
                    {step === 1 && (
                        <View style={[
                            styles.progressLine,
                            currentStep > 1 && styles.progressLineActive
                        ]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
};

export function RegistrationScreen({ onBack, onRegister }: RegistrationScreenProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState<'role' | 'workshop' | 'technician'>('role');
    const [isLoading, setIsLoading] = useState(false);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [step]);

    const handleRoleSelect = (role: 'workshop' | 'individual') => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        setStep(role === 'workshop' ? 'workshop' : 'technician');
    };

    const handleBackToRole = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        setStep('role');
    };

    const handleRegister = async (formData: any) => {
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('type', step === 'workshop' ? 'workshop' : 'individual');
            data.append('offersOutdoorServices', formData.offersOutdoorServices.toString());
            data.append('services', JSON.stringify(formData.selectedServices));
            data.append('address', formData.address);
            data.append('latitude', formData.latitude.toString());
            data.append('longitude', formData.longitude.toString());
            data.append('password', formData.password);

            if (step === 'workshop') {
                data.append('workshopName', formData.workshopName);
                data.append('ownerName', formData.ownerName);
                data.append('crNumber', formData.crNumber);
                data.append('vatNumber', formData.vatNumber);
                data.append('mobileNumber', formData.mobileNumber);
                
                if (formData.logo) {
                    data.append('logo', {
                        uri: formData.logo,
                        type: 'image/jpeg',
                        name: 'logo.jpg',
                    } as any);
                }
            } else {
                data.append('fullName', formData.fullName);
                data.append('iqamaId', formData.iqamaId);
                data.append('mobileNumber', formData.mobileNumber);

                if (formData.logo) {
                    data.append('logo', {
                        uri: formData.logo,
                        type: 'image/jpeg',
                        name: 'profile.jpg',
                    } as any);
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = await response.json();

            if (result.success) {
                const userData = {
                    id: result.providerId || result.provider?._id,
                    type: result.provider?.type,
                    companyName: result.provider?.workshopName || 'Individual Technician',
                    ownerName: result.provider?.fullName || result.provider?.workshopName || 'Provider',
                    logoUrl: result.provider?.logoUrl || null,
                };
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
                Alert.alert('Success', t('registration.success_msg'));
                onRegister();
            } else {
                Alert.alert('Error', result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Error', 'Network Request Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/car_workshop.png')}
            style={styles.background}
            blurRadius={2}>
            <View style={styles.overlay} />
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <ProgressIndicator currentStep={step === 'role' ? 1 : 2} />
                
                <Animated.View style={[
                    styles.animatedContent, 
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    {step === 'role' && (
                        <RoleSelection 
                            onSelect={handleRoleSelect} 
                            onBack={onBack} 
                        />
                    )}
                    
                    {step === 'workshop' && (
                        <WorkshopForm 
                            onSubmit={handleRegister} 
                            onBack={handleBackToRole}
                            isLoading={isLoading}
                        />
                    )}

                    {step === 'technician' && (
                        <TechnicianForm 
                            onSubmit={handleRegister} 
                            onBack={handleBackToRole}
                            isLoading={isLoading}
                        />
                    )}
                </Animated.View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    animatedContent: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        marginBottom: 10,
    },
    progressCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    progressCircleActive: {
        borderColor: colors.primary,
    },
    progressInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'transparent',
    },
    progressInnerActive: {
        backgroundColor: colors.primary,
    },
    progressLine: {
        width: 60,
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: colors.primary,
    },
});


import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegistrationScreen } from '../../screens/auth/RegistrationScreen';
import { ProviderDashboard } from '../../tabBar/ProviderDashboard';
import { TechnicianDashboard } from '../../tabBar/TechnicianDashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface AuthScreenProps {
    onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showRegistration, setShowRegistration] = useState(true);
    const [dashboardType, setDashboardType] = useState<'provider' | 'technician' | null>(null);
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    if (dashboardType === 'provider') {
        return <ProviderDashboard onLogout={() => setDashboardType(null)} />;
    }

    if (dashboardType === 'technician') {
        return <TechnicianDashboard onLogout={() => setDashboardType(null)} />;
    }

    const handleRegisterSuccess = async () => {
        try {
            const data = await AsyncStorage.getItem('user_data');
            if (data) {
                const user = JSON.parse(data);
                if (user.type === 'individual') {
                    setDashboardType('technician');
                } else {
                    setDashboardType('provider');
                }
            }
        } catch (e) {
            setDashboardType('provider');
        }
        setShowRegistration(false);
    };

    if (showRegistration) {
        return <RegistrationScreen
            onBack={() => setShowRegistration(false)}
            onRegister={handleRegisterSuccess}
        />;
    }

    return (
        <ImageBackground
            source={require('../../assets/car_workshop.png')}
            style={authStyles.background}
            blurRadius={2}>
            <View style={authStyles.overlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={authStyles.container}>
                <ScrollView
                    contentContainerStyle={[
                        authStyles.scrollContent,
                        { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}>
                    <View style={authStyles.headerSection}>
                        <View style={authStyles.logoBadge}>
                            <Text style={authStyles.logoText}>FILTER</Text>
                        </View>
                        <Text style={authStyles.welcomeTitle}>{t('common.login')}</Text>
                        <Text style={authStyles.tagline}>{t('auth.tagline')}</Text>
                    </View>

                    <View style={authStyles.formContainer}>
                        <View style={authStyles.inputWrapper}>
                            <Text style={authStyles.inputLabel}>{t('auth.email')}</Text>
                            <View style={authStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color={colors.subText}
                                    style={authStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('auth.email_placeholder') || "Enter your email"}
                                    placeholderTextColor={colors.subText}
                                    style={authStyles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                            <View style={authStyles.inputWrapper}>
                        <Text style={authStyles.inputLabel}>{t('auth.password')}</Text>
                            <View style={authStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color={colors.subText}
                                    style={authStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.subText}
                                    style={authStyles.input}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={authStyles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.subText}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={authStyles.forgotPassword}>
                            <Text style={authStyles.forgotPasswordText}>
                                {t('auth.forgot_password')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={authStyles.loginButton} onPress={onLogin}>
                            <Text style={authStyles.loginButtonText}>{t('common.login')}</Text>
                            <View style={authStyles.buttonIconCircle}>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={18}
                                    color={colors.primary}
                                />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={authStyles.technicianLink}
                            onPress={() => setShowRegistration(true)}>
                            <Text style={authStyles.technicianText}>
                                {t('common.provider_question')}{' '}
                                <Text style={authStyles.technicianLinkText}>{t('common.apply_here')}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const authStyles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBadge: {
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 4,
        fontFamily: typography.fontFamily,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
        fontFamily: typography.fontFamily,
    },
    tagline: {
        fontSize: 14,
        color: colors.subText,
        fontWeight: '500',
        letterSpacing: 0.5,
        fontFamily: typography.fontFamily,
    },
    formContainer: {
        gap: 20,
    },
    inputWrapper: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 4,
        fontFamily: typography.fontFamily,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontFamily: typography.fontFamily,
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -4,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: colors.subText,
        fontWeight: '600',
        fontFamily: typography.fontFamily,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 18,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.secondary,
        marginRight: 12,
        fontFamily: typography.fontFamily,
    },
    buttonIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    technicianLink: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    technicianText: {
        fontSize: 14,
        color: colors.subText,
        fontFamily: typography.fontFamily,
    },
    technicianLinkText: {
        color: colors.primary,
        fontWeight: '700',
    },
});

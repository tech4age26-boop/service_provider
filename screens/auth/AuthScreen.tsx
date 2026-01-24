
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
    ActivityIndicator,
    Alert,
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
import { API_BASE_URL } from '../../constants/api';

interface AuthScreenProps {
    onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
    const [selectedRole, setSelectedRole] = useState<'owner' | 'technician' | 'cashier' | 'individual'>('owner');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegistration, setShowRegistration] = useState(true);
    const [dashboardType, setDashboardType] = useState<'provider' | 'technician' | null>(null);
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();



    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Please enter both phone and password');
            return;
        }

        setIsLoggingIn(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone.trim(),
                    password: password,
                    role: selectedRole
                }),
            });

            const result = await response.json();

            if (result.success) {
                await AsyncStorage.setItem('user_data', JSON.stringify(result.user));

                // Show specific alert for employees as requested
                if (selectedRole === 'technician' || selectedRole === 'cashier') {
                    Alert.alert('Success', `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} found in database`, [
                        { text: 'OK', onPress: () => onLogin() }
                    ]);
                } else {
                    onLogin();
                }
            } else {
                Alert.alert('Login Failed', result.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Error', 'Network or server error. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const roles_list = [
        { id: 'owner', label: 'Workshop Owner', icon: 'store' },
        { id: 'technician', label: 'Technician', icon: 'wrench' },
        { id: 'cashier', label: 'Cashier', icon: 'cash-register' },
        { id: 'individual', label: 'Freelancer', icon: 'account-wrench' },
    ];

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
                        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
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
                        {/* Role Selection */}
                        <View style={authStyles.inputWrapper}>
                            <Text style={authStyles.inputLabel}>Select Login Role</Text>
                            <View style={authStyles.roleGrid}>
                                {roles_list.map((r) => (
                                    <TouchableOpacity
                                        key={r.id}
                                        style={[
                                            authStyles.roleCard,
                                            selectedRole === r.id && authStyles.roleCardActive
                                        ]}
                                        onPress={() => setSelectedRole(r.id as any)}>
                                        <MaterialCommunityIcons
                                            name={r.icon}
                                            size={22}
                                            color={selectedRole === r.id ? colors.secondary : colors.primary}
                                        />
                                        <Text style={[
                                            authStyles.roleCardText,
                                            selectedRole === r.id && authStyles.roleCardTextActive
                                        ]}>
                                            {r.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={authStyles.inputWrapper}>
                            <Text style={authStyles.inputLabel}>{t('auth.mobile')}</Text>
                            <View style={authStyles.phoneInputGroup}>
                                <View style={authStyles.countryCodeBadge}>
                                    <Text style={authStyles.countryCodeText}>+966</Text>
                                    <View style={authStyles.verticalDivider} />
                                </View>
                                <View style={authStyles.inputContainer}>
                                    <TextInput
                                        placeholder={t('auth.phone_placeholder') || "5xxxxxxxxx"}
                                        placeholderTextColor={colors.subText}
                                        style={authStyles.input}
                                        keyboardType="phone-pad"
                                        maxLength={9}
                                        value={phone}
                                        onChangeText={setPhone}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={authStyles.inputWrapper}>
                            <Text style={authStyles.inputLabel}>{t('auth.password')}</Text>
                            <View style={authStyles.inputContainer}>
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.subText}
                                    style={authStyles.input}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
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

                        <TouchableOpacity
                            style={[authStyles.loginButton, isLoggingIn && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={isLoggingIn}>
                            {isLoggingIn ? (
                                <ActivityIndicator color={colors.secondary} />
                            ) : (
                                <>
                                    <Text style={authStyles.loginButtonText}>{t('common.login')}</Text>
                                    <View style={authStyles.buttonIconCircle}>
                                        <MaterialCommunityIcons
                                            name="arrow-right"
                                            size={20}
                                            color={colors.primary}
                                        />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={authStyles.registerSection}>
                            <Text style={authStyles.dontHaveAccountText}>
                                {t('auth.dont_have_account')}
                            </Text>
                            <TouchableOpacity
                                style={authStyles.registerLink}
                                onPress={() => setShowRegistration(true)}>
                                <Text style={authStyles.registerLinkText}>
                                    {t('common.register')}
                                </Text>
                            </TouchableOpacity>
                        </View>
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 45,
    },
    logoBadge: {
        backgroundColor: colors.white,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 24,
        marginBottom: 28,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 12,
    },
    logoText: {
        fontSize: 34,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: 6,
        fontFamily: typography.fontFamily,
    },
    welcomeTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 10,
        fontFamily: typography.fontFamily,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 15,
        color: colors.subText,
        fontWeight: '600',
        letterSpacing: 0.3,
        fontFamily: typography.fontFamily,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    formContainer: {
        gap: 24,
    },
    inputWrapper: {
        gap: 10,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.text,
        marginLeft: 4,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.5,
    },
    phoneInputGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    countryCodeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 64,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        fontFamily: typography.fontFamily,
        marginRight: 10,
    },
    verticalDivider: {
        width: 1.5,
        height: 24,
        backgroundColor: colors.border,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 18,
        paddingHorizontal: 18,
        height: 64,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontFamily: typography.fontFamily,
        fontWeight: '600',
    },
    loginIdNote: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 6,
        marginTop: -4,
    },
    loginIdText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
        fontFamily: typography.fontFamily,
    },
    eyeIcon: {
        padding: 6,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -6,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: colors.subText,
        fontWeight: '700',
        fontFamily: typography.fontFamily,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 22,
        height: 68,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 10,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.secondary,
        marginRight: 14,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.5,
    },
    buttonIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    registerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
        gap: 8,
    },
    dontHaveAccountText: {
        fontSize: 14,
        color: colors.subText,
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
    registerLink: {
        paddingVertical: 4,
    },
    registerLinkText: {
        color: colors.primary,
        fontWeight: '800',
        fontSize: 15,
        fontFamily: typography.fontFamily,
    },
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    roleCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: 15,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        gap: 8,
    },
    roleCardActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    roleCardText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    roleCardTextActive: {
        color: colors.secondary,
    },
});

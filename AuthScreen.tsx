/**
 * Filter App - Login/Signup Screens
 *
 * @format
 */

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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegistrationScreen } from './RegistrationScreen';
import { ProviderDashboard } from './ProviderDashboard';

interface AuthScreenProps {
    onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRegistration, setShowRegistration] = useState(false);
    const [showProviderDashboard, setShowProviderDashboard] = useState(false);
    const insets = useSafeAreaInsets();

    if (showProviderDashboard) {
        return <ProviderDashboard />;
    }

    if (showRegistration) {
        return <RegistrationScreen
            onBack={() => setShowRegistration(false)}
            onRegister={() => setShowProviderDashboard(true)}
        />;
    }

    return (
        <ImageBackground
            source={require('./assets/car_workshop.png')}
            style={authStyles.background}
            blurRadius={5}>
            <View style={authStyles.overlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={authStyles.container}>
                <ScrollView
                    contentContainerStyle={[
                        authStyles.scrollContent,
                        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}>
                    {/* Logo */}
                    <View style={authStyles.logoContainer}>
                        <View style={authStyles.logoBadge}>
                            <Text style={authStyles.logoText}>FILTER</Text>
                        </View>
                        <Text style={authStyles.tagline}>PREMIUM AUTOMOTIVE SERVICE</Text>
                    </View>

                    {/* Tab Switcher */}
                    <View style={authStyles.tabContainer}>
                        <TouchableOpacity
                            style={[authStyles.tab, isLogin && authStyles.activeTab]}
                            onPress={() => setIsLogin(true)}>
                            <Text
                                style={[
                                    authStyles.tabText,
                                    isLogin && authStyles.activeTabText,
                                ]}>
                                Log In
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[authStyles.tab, !isLogin && authStyles.activeTab]}
                            onPress={() => setIsLogin(false)}>
                            <Text
                                style={[
                                    authStyles.tabText,
                                    !isLogin && authStyles.activeTabText,
                                ]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={authStyles.formContainer}>
                        {/* Email */}
                        <View style={authStyles.inputContainer}>
                            <MaterialCommunityIcons
                                name="email-outline"
                                size={20}
                                color="#8E8E93"
                                style={authStyles.inputIcon}
                            />
                            <TextInput
                                placeholder="Email Address"
                                placeholderTextColor="#8E8E93"
                                style={authStyles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Phone Number (Sign Up Only) */}
                        {!isLogin && (
                            <View style={authStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="phone-outline"
                                    size={20}
                                    color="#8E8E93"
                                    style={authStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder="Phone Number"
                                    placeholderTextColor="#8E8E93"
                                    style={authStyles.input}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        )}

                        {/* Password */}
                        <View style={authStyles.inputContainer}>
                            <MaterialCommunityIcons
                                name="lock-outline"
                                size={20}
                                color="#8E8E93"
                                style={authStyles.inputIcon}
                            />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#8E8E93"
                                style={authStyles.input}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={authStyles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}>
                                <MaterialCommunityIcons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#8E8E93"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password (Sign Up Only) */}
                        {!isLogin && (
                            <View style={authStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="lock-check-outline"
                                    size={20}
                                    color="#8E8E93"
                                    style={authStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#8E8E93"
                                    style={authStyles.input}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={authStyles.eyeIcon}
                                    onPress={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }>
                                    <MaterialCommunityIcons
                                        name={
                                            showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                                        }
                                        size={20}
                                        color="#8E8E93"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Forgot Password (Login Only) */}
                        {isLogin && (
                            <TouchableOpacity style={authStyles.forgotPassword}>
                                <Text style={authStyles.forgotPasswordText}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Continue Button */}
                        <TouchableOpacity style={authStyles.continueButton} onPress={onLogin}>
                            <Text style={authStyles.continueButtonText}>Continue</Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color="#1C1C1E"
                            />
                        </TouchableOpacity>

                        {/* Technician Link */}
                        <TouchableOpacity
                            style={authStyles.technicianLink}
                            onPress={() => setShowRegistration(true)}>
                            <Text style={authStyles.technicianText}>
                                Are you a individual or company?{' '}
                                <Text style={authStyles.technicianLinkText}>Apply here</Text>
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
        backgroundColor: 'rgba(240, 240, 245, 0.75)',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    logoBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    logoText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#F4C430',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#F4C430',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#1C1C1E',
    },
    formContainer: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1C1C1E',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    continueButton: {
        backgroundColor: '#F4C430',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#F4C430',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginRight: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        fontSize: 11,
        color: '#8E8E93',
        marginHorizontal: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    technicianLink: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    technicianText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    technicianLinkText: {
        color: '#F4C430',
        fontWeight: '600',
    },
});

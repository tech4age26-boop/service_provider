/**
 * Filter App - Provider/Technician Registration Screen
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
    Image,
    FlatList,
    Modal,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

interface RegistrationScreenProps {
    onBack: () => void;
    onRegister: () => void;
}

// Production Vercel URL
const API_BASE_URL = 'https://filter-server.vercel.app';
// const API_BASE_URL = 'http://10.0.2.2:5000'; // LOCAL DEBUGGING

const SERVICES = [
    { id: '1', key: 'car_wash', icon: 'car-wash' },
    { id: '2', key: 'oil_change', icon: 'oil' },
    { id: '3', key: 'tire_service', icon: 'tire' },
    { id: '4', key: 'brake_service', icon: 'car-brake-abs' },
    { id: '5', key: 'engine_diagnostics', icon: 'engine' },
    { id: '6', key: 'ac_repair', icon: 'air-conditioner' },
];

export function RegistrationScreen({ onBack, onRegister }: RegistrationScreenProps) {
    const { t } = useTranslation();
    const [registrationType, setRegistrationType] = useState<'workshop' | 'individual' | null>('workshop');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [offersOutdoorServices, setOffersOutdoorServices] = useState(false);

    // Image State
    const [logo, setLogo] = useState<string | null>(null);

    // Location State (Address Search)
    const [addressQuery, setAddressQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const insets = useSafeAreaInsets();


    const toggleService = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        if (result.assets && result.assets[0]?.uri) {
            setLogo(result.assets[0].uri);
        }
    };

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'FilterApp/1.0',
                    },
                }
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (text: string) => {
        setAddressQuery(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchSuggestions(text);
        }, 500);
    };

    const selectSuggestion = (item: any) => {
        setAddressQuery(item.display_name);
        setSelectedAddress(item);
        setLocation({
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
        });
        setSuggestions([]);
    };

    // Form State
    const [workshopName, setWorkshopName] = useState('');
    const [crNumber, setCrNumber] = useState('');
    const [vatNumber, setVatNumber] = useState('');

    const [fullName, setFullName] = useState('');
    const [iqamaId, setIqamaId] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        console.log('Register Button Pressed');
        if (!registrationType) {
            Alert.alert('Error', 'Please select a registration type');
            return;
        }

        try {
            console.log('Building Form Data...');
            const formData = new FormData();
            formData.append('type', registrationType);
            formData.append('offersOutdoorServices', offersOutdoorServices.toString());
            formData.append('services', JSON.stringify(selectedServices));

            if (registrationType === 'workshop') {
                console.log('Validating Workshop Data:', { workshopName, fullName, crNumber, vatNumber, hasLocation: !!location });

                if (!workshopName || !fullName || !crNumber || !vatNumber || !logo || !location) {
                    Alert.alert('Error', 'Please fill all fields (including Owner Name), select an address, and upload a logo');
                    return;
                }
                formData.append('workshopName', workshopName);
                formData.append('ownerName', fullName);
                formData.append('crNumber', crNumber);
                formData.append('vatNumber', vatNumber);
                formData.append('address', addressQuery);
                formData.append('latitude', location.latitude.toString());
                formData.append('longitude', location.longitude.toString());


                if (logo) {
                    console.log('Appending logo:', logo);
                    const logoFile = {
                        uri: Platform.OS === 'android' ? logo : logo.replace('file://', ''),
                        type: 'image/jpeg',
                        name: 'logo.jpg',
                    } as any;
                    formData.append('logo', logoFile);
                }

            } else {
                console.log('Validating Technician Data:', { fullName, iqamaId, mobileNumber, hasPassword: !!password });

                if (!fullName || !iqamaId || !mobileNumber || !password) {
                    Alert.alert('Error', 'Please fill all technician fields');
                    return;
                }
                formData.append('fullName', fullName);
                formData.append('iqamaId', iqamaId);
                formData.append('mobileNumber', mobileNumber);
                formData.append('password', password);

                if (location) {
                    formData.append('address', addressQuery);
                    formData.append('latitude', location.latitude.toString());
                    formData.append('longitude', location.longitude.toString());
                }


                if (logo) {
                    console.log('Appending logo:', logo);
                    const logoFile = {
                        uri: Platform.OS === 'android' ? logo : logo.replace('file://', ''),
                        type: 'image/jpeg',
                        name: 'profile.jpg',
                    } as any;
                    formData.append('logo', logoFile);
                }
            }

            const API_URL = `${API_BASE_URL}/api/register`;
            console.log('Sending request to:', API_URL);

            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Response Status:', response.status);
            const data = await response.json();
            console.log('Response Data:', data);

            if (data.success) {
                // Store user data in local storage
                const userData = {
                    id: data.providerId || data.provider?._id,
                    type: data.provider?.type,
                    companyName: data.provider?.workshopName || 'Individual Technician',
                    ownerName: data.provider?.fullName || data.provider?.workshopName || 'Provider',
                    logoUrl: data.provider?.logoUrl || null,
                };
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));

                Alert.alert('Success', t('registration.success_msg'));
                onRegister();
            } else {
                Alert.alert('Error', data.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Error', `Network Request Failed. \nDetails: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <ImageBackground
            source={require('./assets/car_workshop.png')}
            style={regStyles.background}
            blurRadius={5}>
            <View style={regStyles.overlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={regStyles.container}>
                <ScrollView
                    contentContainerStyle={[
                        regStyles.scrollContent,
                        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}>

                    {/* Back Button */}
                    <TouchableOpacity style={regStyles.backButton} onPress={onBack}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1C1C1E" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={regStyles.header}>
                        <Text style={regStyles.title}>{t('common.register')}</Text>
                        <Text style={regStyles.subtitle}>{t('auth.signup_title')}</Text>
                    </View>

                    {/* Type Switcher */}
                    <View style={regStyles.typeSwitcher}>
                        <TouchableOpacity
                            style={[
                                regStyles.typeSwitchButton,
                                registrationType === 'workshop' && regStyles.typeSwitchActive
                            ]}
                            onPress={() => setRegistrationType('workshop')}>
                            <MaterialCommunityIcons
                                name="office-building"
                                size={20}
                                color={registrationType === 'workshop' ? '#1C1C1E' : '#8E8E93'}
                            />
                            <Text style={[
                                regStyles.typeSwitchText,
                                registrationType === 'workshop' && regStyles.typeSwitchTextActive
                            ]}>
                                {t('registration.type_workshop')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                regStyles.typeSwitchButton,
                                registrationType === 'individual' && regStyles.typeSwitchActive
                            ]}
                            onPress={() => setRegistrationType('individual')}>
                            <MaterialCommunityIcons
                                name="account-wrench"
                                size={20}
                                color={registrationType === 'individual' ? '#1C1C1E' : '#8E8E93'}
                            />
                            <Text style={[
                                regStyles.typeSwitchText,
                                registrationType === 'individual' && regStyles.typeSwitchTextActive
                            ]}>
                                {t('registration.type_individual')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Workshop Registration Form */}
                    {registrationType === 'workshop' && (
                        <View style={regStyles.formContainer}>
                            <Text style={regStyles.formTitle}>{t('registration.workshop_details')}</Text>

                            {/* Workshop Name */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="store"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('registration.workshop_name')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    value={workshopName}
                                    onChangeText={setWorkshopName}
                                />
                            </View>

                            {/* Owner Name */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="account"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('registration.owner_name')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>

                            {/* CR Number */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="file-document-outline"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('registration.cr_number')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="numeric"
                                    value={crNumber}
                                    onChangeText={setCrNumber}
                                />
                            </View>

                            {/* VAT Number */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="receipt"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('registration.vat_number')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="numeric"
                                    value={vatNumber}
                                    onChangeText={setVatNumber}
                                />
                            </View>

                            {/* Mobile Number */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="phone"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('auth.mobile')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="phone-pad"
                                    value={mobileNumber}
                                    onChangeText={setMobileNumber}
                                />
                            </View>

                            {/* Password */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('auth.password')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    style={regStyles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#8E8E93"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Address Search */}
                            <View style={{ position: 'relative', zIndex: 1000 }}>
                                <View style={regStyles.inputContainer}>
                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={20}
                                        color="#8E8E93"
                                        style={regStyles.inputIcon}
                                    />
                                    <TextInput
                                        placeholder={t('registration.address_placeholder')}
                                        placeholderTextColor="#8E8E93"
                                        style={regStyles.input}
                                        value={addressQuery}
                                        onChangeText={handleSearchChange}
                                    />
                                    {isSearching && <View style={{ marginRight: 10 }}><MaterialCommunityIcons name="loading" size={16} color="#F4C430" /></View>}
                                </View>

                                {suggestions.length > 0 && (
                                    <View style={regStyles.suggestionsContainer}>
                                        <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                                            {suggestions.map((item, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={regStyles.suggestionItem}
                                                    onPress={() => selectSuggestion(item)}>
                                                    <MaterialCommunityIcons name="map-marker" size={16} color="#8E8E93" />
                                                    <Text style={regStyles.suggestionText} numberOfLines={2}>
                                                        {item.display_name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                                {addressQuery.length >= 3 && !isSearching && suggestions.length === 0 && !selectedAddress && (
                                    <View style={regStyles.suggestionsContainer}>
                                        <Text style={{ padding: 15, color: '#8E8E93', textAlign: 'center' }}>{t('registration.no_locations')}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Logo Upload */}
                            <TouchableOpacity
                                style={[regStyles.uploadContainer, logo && { borderColor: '#F4C430' }]}
                                onPress={pickImage}>
                                {logo ? (
                                    <Image source={{ uri: logo }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="image-plus" size={32} color="#8E8E93" />
                                        <Text style={regStyles.uploadText}>{t('registration.upload_logo')}</Text>
                                        <Text style={regStyles.uploadSubtext}>{t('registration.file_requirements')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Service Selection */}
                            <View style={regStyles.serviceSection}>
                                <Text style={regStyles.serviceSectionTitle}>{t('registration.select_services')}</Text>
                                <Text style={regStyles.serviceSectionSubtitle}>{t('registration.services_subtitle')}</Text>
                                <FlatList
                                    data={SERVICES}
                                    numColumns={2}
                                    scrollEnabled={false}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                regStyles.serviceItem,
                                                selectedServices.includes(item.id) && regStyles.serviceItemSelected
                                            ]}
                                            onPress={() => toggleService(item.id)}>
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={24}
                                                color={selectedServices.includes(item.id) ? '#F4C430' : '#8E8E93'}
                                            />
                                            <Text style={[
                                                regStyles.serviceItemText,
                                                selectedServices.includes(item.id) && regStyles.serviceItemTextSelected
                                            ]}>
                                                {t(`services.${item.key}`)}
                                            </Text>
                                            {selectedServices.includes(item.id) && (
                                                <View style={regStyles.checkMark}>
                                                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    contentContainerStyle={regStyles.serviceList}
                                />
                            </View>

                            {/* Outdoor Services */}
                            <View style={regStyles.outdoorContainer}>
                                <View style={regStyles.outdoorTextContainer}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={20} color="#1C1C1E" />
                                    <Text style={regStyles.outdoorTitle}>{t('registration.outdoor_services')}</Text>
                                </View>
                                <View style={regStyles.toggleButtons}>
                                    <TouchableOpacity
                                        style={[
                                            regStyles.toggleButton,
                                            offersOutdoorServices && regStyles.toggleButtonActive
                                        ]}
                                        onPress={() => setOffersOutdoorServices(true)}>
                                        <Text style={[
                                            regStyles.toggleButtonText,
                                            offersOutdoorServices && regStyles.toggleButtonTextActive
                                        ]}>
                                            {t('common.yes')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            regStyles.toggleButton,
                                            !offersOutdoorServices && regStyles.toggleButtonActive
                                        ]}
                                        onPress={() => setOffersOutdoorServices(false)}>
                                        <Text style={[
                                            regStyles.toggleButtonText,
                                            !offersOutdoorServices && regStyles.toggleButtonTextActive
                                        ]}>
                                            {t('common.no')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>


                            {/* Submit Button */}
                            <TouchableOpacity style={regStyles.submitButton} onPress={handleRegister}>
                                <Text style={regStyles.submitButtonText}>{t('registration.submit')}</Text>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#1C1C1E"
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Individual Technician Registration Form */}
                    {registrationType === 'individual' && (
                        <View style={regStyles.formContainer}>
                            <TouchableOpacity
                                style={regStyles.changeTypeButton}
                                onPress={() => setRegistrationType(null)}>
                                <Text style={regStyles.changeTypeText}>← {t('registration.change_type')}</Text>
                            </TouchableOpacity>

                            <Text style={regStyles.formTitle}>{t('registration.technician_details')}</Text>

                            {/* Name */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="account"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('registration.full_name')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>

                            {/* Iqama ID */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="card-account-details"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('registration.iqama_id')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="numeric"
                                    value={iqamaId}
                                    onChangeText={setIqamaId}
                                />
                            </View>

                            {/* Mobile Number */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="phone"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('auth.mobile')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="phone-pad"
                                    value={mobileNumber}
                                    onChangeText={setMobileNumber}
                                />
                            </View>

                            {/* Password */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder={t('auth.password')}
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    style={regStyles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#8E8E93"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Service Selection */}
                            <View style={regStyles.serviceSection}>
                                <Text style={regStyles.serviceSectionTitle}>{t('registration.select_services')}</Text>
                                <Text style={regStyles.serviceSectionSubtitle}>{t('registration.services_subtitle')}</Text>
                                <FlatList
                                    data={SERVICES}
                                    numColumns={2}
                                    scrollEnabled={false}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                regStyles.serviceItem,
                                                selectedServices.includes(item.id) && regStyles.serviceItemSelected
                                            ]}
                                            onPress={() => toggleService(item.id)}>
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={24}
                                                color={selectedServices.includes(item.id) ? '#F4C430' : '#8E8E93'}
                                            />
                                            <Text style={[
                                                regStyles.serviceItemText,
                                                selectedServices.includes(item.id) && regStyles.serviceItemTextSelected
                                            ]}>
                                                {t(`services.${item.key}`)}
                                            </Text>
                                            {selectedServices.includes(item.id) && (
                                                <View style={regStyles.checkMark}>
                                                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    contentContainerStyle={regStyles.serviceList}
                                />
                            </View>

                            {/* Outdoor Services */}
                            <View style={regStyles.outdoorContainer}>
                                <View style={regStyles.outdoorTextContainer}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={20} color="#1C1C1E" />
                                    <Text style={regStyles.outdoorTitle}>{t('registration.outdoor_services')}</Text>
                                </View>
                                <View style={regStyles.toggleButtons}>
                                    <TouchableOpacity
                                        style={[
                                            regStyles.toggleButton,
                                            offersOutdoorServices && regStyles.toggleButtonActive
                                        ]}
                                        onPress={() => setOffersOutdoorServices(true)}>
                                        <Text style={[
                                            regStyles.toggleButtonText,
                                            offersOutdoorServices && regStyles.toggleButtonTextActive
                                        ]}>
                                            {t('common.yes')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            regStyles.toggleButton,
                                            !offersOutdoorServices && regStyles.toggleButtonActive
                                        ]}
                                        onPress={() => setOffersOutdoorServices(false)}>
                                        <Text style={[
                                            regStyles.toggleButtonText,
                                            !offersOutdoorServices && regStyles.toggleButtonTextActive
                                        ]}>
                                            {t('common.no')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={regStyles.noteContainer}>
                                <MaterialCommunityIcons name="information" size={16} color="#8E8E93" />
                                <Text style={regStyles.noteText}>
                                    {t('registration.username_note')}
                                </Text>
                            </View>

                            {/* Address Search */}
                            <View style={{ position: 'relative', zIndex: 1000 }}>
                                <View style={regStyles.inputContainer}>
                                    <MaterialCommunityIcons
                                        name="map-marker-outline"
                                        size={20}
                                        color="#8E8E93"
                                        style={regStyles.inputIcon}
                                    />
                                    <TextInput
                                        placeholder={t('registration.work_address')}
                                        placeholderTextColor="#8E8E93"
                                        style={regStyles.input}
                                        value={addressQuery}
                                        onChangeText={handleSearchChange}
                                    />
                                    {isSearching && <View style={{ marginRight: 10 }}><MaterialCommunityIcons name="loading" size={16} color="#F4C430" /></View>}
                                </View>

                                {suggestions.length > 0 && (
                                    <View style={regStyles.suggestionsContainer}>
                                        <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                                            {suggestions.map((item, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={regStyles.suggestionItem}
                                                    onPress={() => selectSuggestion(item)}>
                                                    <MaterialCommunityIcons name="map-marker" size={16} color="#8E8E93" />
                                                    <Text style={regStyles.suggestionText} numberOfLines={2}>
                                                        {item.display_name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                                {addressQuery.length >= 3 && !isSearching && suggestions.length === 0 && !selectedAddress && (
                                    <View style={regStyles.suggestionsContainer}>
                                        <Text style={{ padding: 15, color: '#8E8E93', textAlign: 'center' }}>{t('registration.no_locations')}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Logo/Profile Image Upload */}
                            <Text style={[regStyles.serviceSectionTitle, { marginTop: 20 }]}>{t('registration.profile_photo')}</Text>
                            <TouchableOpacity
                                style={[regStyles.uploadContainer, logo && { borderColor: '#F4C430' }]}
                                onPress={pickImage}>
                                {logo ? (
                                    <Image source={{ uri: logo }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="image-plus" size={32} color="#8E8E93" />
                                        <Text style={regStyles.uploadText}>{t('registration.upload_photo')}</Text>
                                        <Text style={regStyles.uploadSubtext}>{t('registration.file_requirements')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Submit Button */}
                            <TouchableOpacity style={regStyles.submitButton} onPress={handleRegister}>
                                <Text style={regStyles.submitButtonText}>{t('registration.submit')}</Text>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#1C1C1E"
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const regStyles = StyleSheet.create({
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#8E8E93',
    },
    typeContainer: {
        gap: 16,
    },
    typeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    typeIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF9E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    typeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 8,
    },
    typeDescription: {
        fontSize: 13,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 12,
    },
    changeTypeButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    changeTypeText: {
        fontSize: 14,
        color: '#F4C430',
        fontWeight: '600',
    },
    formContainer: {
        gap: 16,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 8,
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
    inputPlaceholder: {
        flex: 1,
        fontSize: 15,
        color: '#8E8E93',
    },
    eyeIcon: {
        padding: 4,
    },
    uploadContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    uploadText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 12,
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: '#8E8E93',
    },
    submitButton: {
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
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginRight: 8,
    },
    serviceSection: {
        marginTop: 8,
    },
    serviceSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    serviceSectionSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 12,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 9999,
        borderWidth: 1,
        borderColor: '#F0F0F5',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F5',
        gap: 10,
    },
    suggestionText: {
        fontSize: 14,
        color: '#1C1C1E',
        flex: 1,
    },
    serviceList: {
        gap: 12,
    },
    serviceItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        margin: 6,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        position: 'relative',
    },
    serviceItemSelected: {
        borderColor: '#F4C430',
        backgroundColor: '#FFF9E6',
    },
    serviceItemText: {
        fontSize: 13,
        color: '#1C1C1E',
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    serviceItemTextSelected: {
        color: '#1C1C1E',
        fontWeight: 'bold',
    },
    checkMark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F4C430',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    outdoorContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    outdoorTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    outdoorTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    toggleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    toggleButtonActive: {
        backgroundColor: '#FFF9E6',
        borderColor: '#F4C430',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    toggleButtonTextActive: {
        color: '#1C1C1E',
    },
    typeSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        gap: 8,
    },
    typeSwitchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    typeSwitchActive: {
        backgroundColor: '#F4C430',
    },
    typeSwitchText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
    },
    typeSwitchTextActive: {
        color: '#1C1C1E',
    },
    mapButtons: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#F4C430',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
    },
    cancelButtonText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#1C1C1E',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

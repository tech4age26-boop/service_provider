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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface RegistrationScreenProps {
    onBack: () => void;
    onRegister: () => void;
}

const SERVICES = [
    { id: '1', name: 'Car Wash', icon: 'car-wash' },
    { id: '2', name: 'Oil Change', icon: 'oil' },
    { id: '3', name: 'Tire Service', icon: 'tire' },
    { id: '4', name: 'Brake Service', icon: 'car-brake-abs' },
    { id: '5', name: 'Engine Diagnostics', icon: 'engine' },
    { id: '6', name: 'AC Repair', icon: 'air-conditioner' },
];

export function RegistrationScreen({ onBack, onRegister }: RegistrationScreenProps) {
    const [registrationType, setRegistrationType] = useState<'workshop' | 'individual'>('workshop');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [offersOutdoorServices, setOffersOutdoorServices] = useState(false);

    // Image State
    const [logo, setLogo] = useState<string | null>(null);
    const [frontPhoto, setFrontPhoto] = useState<string | null>(null);

    // Location State
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: 24.7136,
        longitude: 46.6753, // Default to Riyadh
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const insets = useSafeAreaInsets();

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const pickImage = async (type: 'logo' | 'front') => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        if (result.assets && result.assets[0]?.uri) {
            if (type === 'logo') {
                setLogo(result.assets[0].uri);
            } else {
                setFrontPhoto(result.assets[0].uri);
            }
        }
    };

    const handleMapPress = (e: any) => {
        setLocation(e.nativeEvent.coordinate);
    };

    const handleConfirmLocation = () => {
        if (location) {
            setShowMap(false);
        } else {
            Alert.alert('Please select a location on the map');
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
                        <Text style={regStyles.title}>Join as Provider</Text>
                        <Text style={regStyles.subtitle}>Fill in your details to get started</Text>
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
                                Workshop
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
                                Technician
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Workshop Registration Form */}
                    {registrationType === 'workshop' && (
                        <View style={regStyles.formContainer}>
                            <Text style={regStyles.formTitle}>Workshop Details</Text>

                            {/* Workshop Name */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="store"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder="Workshop Name"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
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
                                    placeholder="CR Number"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="numeric"
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
                                    placeholder="VAT Number"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Google Map Location */}
                            <TouchableOpacity
                                style={regStyles.inputContainer}
                                onPress={() => setShowMap(true)}>
                                <MaterialCommunityIcons
                                    name="map-marker"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <Text style={[
                                    regStyles.inputPlaceholder,
                                    location && { color: '#1C1C1E' }
                                ]}>
                                    {location ? `Selected: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Select Location on Map'}
                                </Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color="#8E8E93"
                                />
                            </TouchableOpacity>

                            {/* Logo Upload */}
                            <TouchableOpacity
                                style={[regStyles.uploadContainer, logo && { borderColor: '#F4C430' }]}
                                onPress={() => pickImage('logo')}>
                                {logo ? (
                                    <Image source={{ uri: logo }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="image-plus" size={32} color="#8E8E93" />
                                        <Text style={regStyles.uploadText}>Upload Workshop Logo</Text>
                                        <Text style={regStyles.uploadSubtext}>PNG, JPG (Max 5MB)</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Service Selection */}
                            <View style={regStyles.serviceSection}>
                                <Text style={regStyles.serviceSectionTitle}>Select Your Services</Text>
                                <Text style={regStyles.serviceSectionSubtitle}>Choose one or more services you provide</Text>
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
                                                {item.name}
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
                                    <Text style={regStyles.outdoorTitle}>Do you offer outdoor services?</Text>
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
                                            Yes
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
                                            No
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Front Photo Upload */}
                            <TouchableOpacity
                                style={[regStyles.uploadContainer, frontPhoto && { borderColor: '#F4C430' }]}
                                onPress={() => pickImage('front')}>
                                {frontPhoto ? (
                                    <Image source={{ uri: frontPhoto }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="camera" size={32} color="#8E8E93" />
                                        <Text style={regStyles.uploadText}>Upload Front Photo</Text>
                                        <Text style={regStyles.uploadSubtext}>PNG, JPG (Max 5MB)</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Submit Button */}
                            <TouchableOpacity style={regStyles.submitButton} onPress={onRegister}>
                                <Text style={regStyles.submitButtonText}>Submit Registration</Text>
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
                                <Text style={regStyles.changeTypeText}>← Change Type</Text>
                            </TouchableOpacity>

                            <Text style={regStyles.formTitle}>Individual Technician Registration</Text>

                            {/* Name */}
                            <View style={regStyles.inputContainer}>
                                <MaterialCommunityIcons
                                    name="account"
                                    size={20}
                                    color="#8E8E93"
                                    style={regStyles.inputIcon}
                                />
                                <TextInput
                                    placeholder="Full Name"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
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
                                    placeholder="Iqama ID"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="numeric"
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
                                    placeholder="Mobile Number"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    keyboardType="phone-pad"
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
                                    placeholder="Password"
                                    placeholderTextColor="#8E8E93"
                                    style={regStyles.input}
                                    secureTextEntry={!showPassword}
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
                                <Text style={regStyles.serviceSectionTitle}>Select Your Services</Text>
                                <Text style={regStyles.serviceSectionSubtitle}>Choose one or more services you provide</Text>
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
                                                {item.name}
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
                                    <Text style={regStyles.outdoorTitle}>Do you offer outdoor services?</Text>
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
                                            Yes
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
                                            No
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={regStyles.noteContainer}>
                                <MaterialCommunityIcons name="information" size={16} color="#8E8E93" />
                                <Text style={regStyles.noteText}>
                                    Your mobile number will be your login username
                                </Text>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity style={regStyles.submitButton}>
                                <Text style={regStyles.submitButtonText}>Submit Registration</Text>
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

            {/* Map Modal */}
            <Modal
                visible={showMap}
                animationType="slide"
                onRequestClose={() => setShowMap(false)}>
                <View style={{ flex: 1 }}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={{ flex: 1 }}
                        region={mapRegion}
                        onPress={handleMapPress}>
                        {location && <Marker coordinate={location} />}
                    </MapView>

                    <View style={regStyles.mapButtons}>
                        <TouchableOpacity
                            style={regStyles.cancelButton}
                            onPress={() => setShowMap(false)}>
                            <Text style={regStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={regStyles.confirmButton}
                            onPress={handleConfirmLocation}>
                            <Text style={regStyles.confirmButtonText}>Confirm Location</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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

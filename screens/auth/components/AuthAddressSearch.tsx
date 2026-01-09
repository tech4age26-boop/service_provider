import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

interface AuthAddressSearchProps {
    addressQuery: string;
    onAddressChange: (query: string) => void;
    onSelectSuggestion: (item: any) => void;
    label?: string;
}

export const AuthAddressSearch = ({ 
    addressQuery, 
    onAddressChange, 
    onSelectSuggestion,
    label 
}: AuthAddressSearchProps) => {
    const { t } = useTranslation();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        onAddressChange(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchSuggestions(text);
        }, 500);
    };

    const handleSelect = (item: any) => {
        setSuggestions([]);
        onSelectSuggestion(item);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={20}
                        color={colors.subText}
                        style={styles.icon}
                    />
                    <TextInput
                        placeholder={t('registration.address_placeholder')}
                        placeholderTextColor={colors.subText}
                        style={styles.input}
                        value={addressQuery}
                        onChangeText={handleSearchChange}
                    />
                    {isSearching && (
                        <ActivityIndicator 
                            size="small" 
                            color={colors.primary} 
                            style={styles.loading} 
                        />
                    )}
                </View>

                {suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <ScrollView keyboardShouldPersistTaps="handled" style={styles.suggestionsScroll}>
                            {suggestions.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSelect(item)}>
                                    <View style={styles.markerCircle}>
                                        <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                                    </View>
                                    <Text style={styles.suggestionText} numberOfLines={2}>
                                        {item.display_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        gap: 10,
        zIndex: 1000,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 4,
        fontFamily: typography.fontFamily,
        letterSpacing: 0.5,
    },
    inputWrapper: {
        position: 'relative',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
    },
    icon: {
        marginRight: 12,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
    loading: {
        marginLeft: 8,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 66,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 9999,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    suggestionsScroll: {
        maxHeight: 280,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 14,
    },
    markerCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FFF9E6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestionText: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
        lineHeight: 20,
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
});

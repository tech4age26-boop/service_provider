import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';

interface ProviderSettingsScreenProps {
    onLogout?: () => void;
    navigation?: any;
}

export function ProviderSettingsScreen({ onLogout, navigation }: ProviderSettingsScreenProps) {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const { t } = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [autoAcceptOrders, setAutoAcceptOrders] = React.useState(false);


    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('user_data');
            if (onLogout) {
                onLogout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };



    // ... (inside component)

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('settings.settings_title')}</Text>
            </View>

            {/* Workshop Profile */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
                <TouchableOpacity
                    style={[styles.settingItem, { borderBottomColor: theme.border }]}
                    onPress={() => navigation?.navigate('EditProfile')}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="store" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Workshop Details</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.settingItem, { borderBottomColor: theme.border }]}
                    onPress={() => navigation?.navigate('Employees')}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="account-group" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Manage Employees</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.settingItem, { borderBottomColor: theme.border }]}
                    onPress={() => navigation?.navigate('PaymentInfo')}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="wallet" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Wallet</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="wrench" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Services & Pricing</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Appearance */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
                <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>{t('settings.dark_mode')}</Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: '#F4C430' }}
                        thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
                    />
                </View>
            </View>

            {/* Notifications */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
                <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="bell" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Push Notifications</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#767577', true: '#F4C430' }}
                        thumbColor={'#FFFFFF'}
                    />
                </View>
                <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="inbox-arrow-down" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Auto-Accept Orders</Text>
                    </View>
                    <Switch
                        value={autoAcceptOrders}
                        onValueChange={setAutoAcceptOrders}
                        trackColor={{ false: '#767577', true: '#F4C430' }}
                        thumbColor={'#FFFFFF'}
                    />
                </View>
            </View>

            {/* Business Hours */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>BUSINESS</Text>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Business Hours</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="map-marker" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Location & Radius</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Support */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>SUPPORT</Text>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="help-circle" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Help Center</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: theme.inputBackground }]}>
                            <MaterialCommunityIcons name="shield-check" size={20} color={theme.text} />
                        </View>
                        <Text style={[styles.settingText, { color: theme.text }]}>Terms & Conditions</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.cardBackground }]}
                onPress={handleLogout}
            >
                <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>{t('common.logout')}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: typography.fontFamily,
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
        paddingHorizontal: 20,
        borderRadius: 0, // Cleaner look
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 16,
        marginBottom: 12,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        fontFamily: typography.fontFamily,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        color: '#1C1C1E',
        fontFamily: typography.fontFamily,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
        fontFamily: typography.fontFamily,
    },
});

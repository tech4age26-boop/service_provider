/**
 * Provider Dashboard - Settings Screen
 */

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
import { useTheme } from '../App';

export function ProviderSettingsScreen() {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [autoAcceptOrders, setAutoAcceptOrders] = React.useState(false);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            </View>

            {/* Workshop Profile */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>WORKSHOP PROFILE</Text>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="store" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Workshop Details</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="cash" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Payment Settings</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="wrench" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Services & Pricing</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Appearance */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>APPEARANCE</Text>
                <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="theme-light-dark" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
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
                <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
                <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="bell" size={22} color={theme.iconColor} />
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
                        <MaterialCommunityIcons name="inbox-arrow-down" size={22} color={theme.iconColor} />
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
                        <MaterialCommunityIcons name="clock-outline" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Business Hours</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="map-marker" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Location & Radius</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Support */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.sectionTitle}>SUPPORT</Text>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="help-circle" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Help Center</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.settingLeft}>
                        <MaterialCommunityIcons name="shield-check" size={22} color={theme.iconColor} />
                        <Text style={[styles.settingText, { color: theme.text }]}>Terms & Conditions</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.cardBackground }]}>
                <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>Log Out</Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 16,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: '#1C1C1E',
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
    },
});

/**
 * Provider Dashboard - Home Screen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    Animated,
    Easing,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

export function ProviderHomeScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [userData, setUserData] = useState<any>(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const sidebarWidth = Dimensions.get('window').width * 0.75;
    const slideAnim = useRef(new Animated.Value(sidebarWidth)).current;

    useEffect(() => {
        loadUserData();
    }, []);

    const toggleSidebar = (show: boolean) => {
        if (show) {
            setIsSidebarVisible(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: sidebarWidth,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(() => setIsSidebarVisible(false));
        }
    };

    const loadUserData = async () => {
        try {
            const data = await AsyncStorage.getItem('user_data');
            if (data) {
                setUserData(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.greeting}>{t('home.welcome_back')}, {userData?.ownerName || t('common.user')}! 👋</Text>
                            <Text style={[styles.shopName, { color: theme.text }]} numberOfLines={1}>
                                {userData?.workshopName || 'Filter Workshop'}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {userData?.logoUrl ? (
                                <Image
                                    source={{ uri: userData.logoUrl }}
                                    style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#F4C430' }}
                                />
                            ) : (
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4C430', alignItems: 'center', justifyContent: 'center' }}>
                                    <MaterialCommunityIcons name="account" size={26} color="#1C1C1E" />
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.menuIconButton, { marginLeft: 10 }]}
                                onPress={() => toggleSidebar(true)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="menu" size={30} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <MaterialCommunityIcons name="clipboard-check" size={28} color="#F4C430" />
                        <Text style={[styles.statNumber, { color: theme.text }]}>24</Text>
                        <Text style={styles.statLabel}>{t('home.active_orders')}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <MaterialCommunityIcons name="account-group" size={28} color="#2ECC71" />
                        <Text style={[styles.statNumber, { color: theme.text }]}>8</Text>
                        <Text style={styles.statLabel}>{t('home.employees')}</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <MaterialCommunityIcons name="cash" size={28} color="#007AFF" />
                        <Text style={[styles.statNumber, { color: theme.text }]}>$3,240</Text>
                        <Text style={styles.statLabel}>{t('home.revenue_today')}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <MaterialCommunityIcons name="star" size={28} color="#FFB800" />
                        <Text style={[styles.statNumber, { color: theme.text }]}>4.8</Text>
                        <Text style={styles.statLabel}>{t('home.rating')}</Text>
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.recent_orders')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>{t('common.view_all')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.orderHeader}>
                            <Text style={[styles.orderTitle, { color: theme.text }]}>Oil Change Service</Text>
                            <View style={[styles.statusBadge, { backgroundColor: '#FFF3CD' }]}>
                                <Text style={[styles.statusText, { color: '#856404' }]}>{t('status.in_progress')}</Text>
                            </View>
                        </View>
                        <Text style={styles.orderCustomer}>Customer: John Smith</Text>
                        <Text style={styles.orderTime}>Started 30 mins ago</Text>
                    </View>

                    <View style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.orderHeader}>
                            <Text style={[styles.orderTitle, { color: theme.text }]}>Brake Repair</Text>
                            <View style={[styles.statusBadge, { backgroundColor: '#D1ECF1' }]}>
                                <Text style={[styles.statusText, { color: '#0C5460' }]}>{t('status.pending')}</Text>
                            </View>
                        </View>
                        <Text style={styles.orderCustomer}>Customer: Sarah Johnson</Text>
                        <Text style={styles.orderTime}>Scheduled for 2:00 PM</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sidebar Modal */}
            <Modal
                transparent
                visible={isSidebarVisible}
                animationType="none"
                onRequestClose={() => toggleSidebar(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Background Overlay Dimmer */}
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => toggleSidebar(false)}
                    >
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                    </TouchableOpacity>

                    {/* Sidebar Content (Right side with animation) */}
                    <Animated.View
                        style={[
                            styles.sidebarContainer,
                            {
                                backgroundColor: theme.cardBackground,
                                alignSelf: 'flex-end',
                                transform: [{ translateX: slideAnim }]
                            }
                        ]}
                    >
                        <View style={[styles.sidebarHeader, { backgroundColor: theme.background }]}>
                            <View style={styles.profileSection}>
                                <View style={styles.sidebarLogoWrapper}>
                                    {userData?.logoUrl ? (
                                        <Image source={{ uri: userData.logoUrl }} style={styles.sidebarLogo} />
                                    ) : (
                                        <View style={[styles.sidebarLogo, { backgroundColor: '#F4C430', alignItems: 'center', justifyContent: 'center' }]}>
                                            <MaterialCommunityIcons name="account" size={40} color="#1C1C1E" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>
                                        {userData?.workshopName || 'Filter Workshop'}
                                    </Text>
                                    <Text style={styles.profileEmail} numberOfLines={1}>{userData?.ownerName}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => toggleSidebar(false)} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.sidebarLinks}>
                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab', { screen: 'PaymentInfo' });
                                }}
                            >
                                <MaterialCommunityIcons name="wallet-outline" size={24} color="#2196F3" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Wallet</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab', { screen: 'OurServices' });
                                }}
                            >
                                <MaterialCommunityIcons name="tools" size={24} color="#F4C430" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Our Services</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab', { screen: 'Inventory' });
                                }}
                            >
                                <MaterialCommunityIcons name="archive-plus-outline" size={24} color="#4CAF50" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Add Inventory</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab', { screen: 'Suppliers' });
                                }}
                            >
                                <MaterialCommunityIcons name="truck-outline" size={24} color="#00BCD4" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Add Supplier</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sidebarLink} onPress={() => toggleSidebar(false)}>
                                <MaterialCommunityIcons name="file-chart-outline" size={24} color="#FF9800" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Sales Report</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab', { screen: 'Employees' });
                                }}
                            >
                                <MaterialCommunityIcons name="account-multiple-plus-outline" size={24} color="#9C27B0" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Add Employees</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab', { screen: 'Category' });
                                }}
                            >
                                <MaterialCommunityIcons name="tag-plus-outline" size={24} color="#E91E63" style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Manage Categories</Text>
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <TouchableOpacity
                                style={styles.sidebarLink}
                                onPress={() => {
                                    toggleSidebar(false);
                                    navigation.navigate('SettingsTab');
                                }}
                            >
                                <MaterialCommunityIcons name="cog-outline" size={24} color={theme.subText} style={styles.linkIcon} />
                                <Text style={[styles.linkText, { color: theme.text }]}>Settings</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.sidebarFooter}>
                            <Text style={styles.versionText}>Version 1.0.0</Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 4,
    },
    shopName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    viewAll: {
        fontSize: 14,
        color: '#F4C430',
        fontWeight: '600',
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderCustomer: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    orderTime: {
        fontSize: 12,
        color: '#999',
    },
    menuIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    sidebarContainer: {
        width: Dimensions.get('window').width * 0.75,
        height: '100%',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    sidebarHeader: {
        padding: 20,
        paddingTop: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sidebarLogoWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F4C430',
    },
    sidebarLogo: {
        width: '100%',
        height: '100%',
    },
    profileInfo: {
        marginLeft: 12,
        flex: 1,
    },
    profileName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileEmail: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 5,
    },
    sidebarLinks: {
        flex: 1,
        padding: 10,
        marginTop: 10,
    },
    sidebarLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 5,
    },
    linkIcon: {
        width: 30,
        marginRight: 15,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 15,
        marginHorizontal: 15,
        opacity: 0.1,
    },
    sidebarFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    versionText: {
        fontSize: 11,
        color: '#8E8E93',
    },
});

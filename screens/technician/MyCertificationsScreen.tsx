import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import { typography } from '../../theme/typography';
import { SettingsHeader } from '../../components/common/SettingsHeader';

export function MyCertificationsScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    // Mock data for certificates
    const certificates = [
        { id: '1', title: 'ASE Certified Master Technician', issuer: 'National Institute for Automotive Service Excellence', date: '2023', status: 'Active' },
        { id: '2', title: 'Toyota Hybrid System Certified', issuer: 'Toyota Motor Corp', date: '2022', status: 'Active' },
    ];

    return (
        <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
            <SettingsHeader
                title={t('settings.my_certifications')}
                rightElement={
                    <TouchableOpacity style={{ padding: 8 }}>
                        <MaterialCommunityIcons name="plus" size={24} color={theme.tint} />
                    </TouchableOpacity>
                }
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionDescription}>
                    Upload and manage your professional certifications to build trust with customers.
                </Text>

                {certificates.map((cert) => (
                    <View key={cert.id} style={[styles.certCard, { backgroundColor: theme.cardBackground }]}>
                        <View style={[styles.certIconBox, { backgroundColor: 'rgba(244, 196, 48, 0.15)' }]}>
                            <MaterialCommunityIcons name="certificate" size={28} color={theme.tint} />
                        </View>
                        <View style={styles.certInfo}>
                            <Text style={[styles.certTitle, { color: theme.text }]}>{cert.title}</Text>
                            <Text style={[styles.certIssuer, { color: theme.subText }]}>{cert.issuer} • {cert.date}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.statusText, { color: '#2E7D32' }]}>{cert.status}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <MaterialCommunityIcons name="dots-vertical" size={20} color={theme.subText} />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={[styles.uploadBox, { borderColor: theme.border }]}>
                    <MaterialCommunityIcons name="cloud-upload" size={40} color={theme.subText} />
                    <Text style={[styles.uploadText, { color: theme.text }]}>Tap to upload new certificate</Text>
                    <Text style={[styles.uploadSub, { color: theme.subText }]}>PDF, JPG, PNG (Max 5MB)</Text>
                </TouchableOpacity>
            </ScrollView>
        </AppBody>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    addButton: {
        padding: 8,
        marginRight: -8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: typography.fontFamily,
    },
    content: {
        padding: 20,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 20,
        lineHeight: 20,
        fontFamily: typography.fontFamily,
    },
    certCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    certIconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    certInfo: {
        flex: 1,
    },
    certTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: typography.fontFamily,
    },
    certIssuer: {
        fontSize: 13,
        marginBottom: 8,
        fontFamily: typography.fontFamily,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: typography.fontFamily,
    },
    moreButton: {
        padding: 4,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        fontFamily: typography.fontFamily,
    },
    uploadSub: {
        fontSize: 13,
        marginTop: 4,
        fontFamily: typography.fontFamily,
    },
});

/**
 * Technician Dashboard - Services Screen
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../App';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';

export function TechnicianServicesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [services, setServices] = useState([
    { id: '1', name: 'Roadside Assistance', enabled: true, icon: 'car-side' },
    { id: '2', name: 'Tire Repair', enabled: true, icon: 'tire' },
    {
      id: '3',
      name: 'Battery Service',
      enabled: false,
      icon: 'battery-charging',
    },
    { id: '4', name: 'Oil Change (on-site)', enabled: true, icon: 'oil' },
    {
      id: '5',
      name: 'Computer Diagnostics',
      enabled: false,
      icon: 'laptop-car',
    },
  ]);

  const toggleService = (id: string) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  return (
    <AppBody>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* <View style={[styles.header, { backgroundColor: theme.cardBackground }]}> */}
        {/* <Text style={[styles.title, { color: theme.text }]}>{t('technician.services_title')}</Text>
                <Text style={styles.subtitle}>{t('technician.services_subtitle')}</Text> */}

        {/* </View> */}
        <TechnicianHeader
          title={t('technician.services_title')}
          subtitle={t('technician.services_subtitle')}
          onBackPress={() => {}}
        />

        <ScrollView style={styles.content}>
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            {services.map((service, index) => (
              <View
                key={service.id}
                style={[
                  styles.serviceItem,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: index === services.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.serviceLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: service.enabled
                          ? '#F4C43020'
                          : '#F5F5F5',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={22}
                      color={service.enabled ? '#F4C430' : '#8E8E93'}
                    />
                  </View>
                  <Text style={[styles.serviceName, { color: theme.text }]}>
                    {service.name}
                  </Text>
                </View>
                <Switch
                  value={service.enabled}
                  onValueChange={() => toggleService(service.id)}
                  trackColor={{ false: '#767577', true: '#F4C430' }}
                  thumbColor={service.enabled ? '#FFF' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={20} color="#1C1C1E" />
            <Text style={styles.addButtonText}>
              {t('technician.add_service_type')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AppBody>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#F4C430',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
});

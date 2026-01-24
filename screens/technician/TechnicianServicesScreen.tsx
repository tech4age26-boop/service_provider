import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../constants/api';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';

import { ServiceProductTabs } from '../../components/services/service-product-tabs';
import { ServiceList } from '../../components/services/service-list';
import { AddEditSheet } from '../../components/services/add-edit-sheet';
import { FAB } from '../../components/common/FAB';

import { Service, SheetMode } from '../../types';



export function TechnicianServicesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<'services'>('services');
  const [sheetMode, setSheetMode] = useState<SheetMode>('add');
  const [editingItem, setEditingItem] = useState<Partial<Service> | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);
      const providerId = userData.id || userData._id;

      const response = await fetch(`${API_BASE_URL}/api/products?providerId=${providerId}`);
      const result = await response.json();

      if (result.success) {
        setServices(result.items.filter((i: any) => i.category === 'service'));
        setProducts(result.items.filter((i: any) => i.category === 'product'));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    console.log('Opening Add Sheet');
    setSheetMode('add');
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: Service) => {
    console.log('Editing Item', item);
    setSheetMode('edit');
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSave = async (data: Partial<Service>) => {
    try {
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);
      const providerId = userData.id || userData._id;

      const formData = new FormData();
      formData.append('providerId', providerId);
      formData.append('name', data.name!);
      formData.append('price', data.price!);
      formData.append('category', activeTab === 'services' ? 'service' : 'product');
      formData.append('status', data.status || 'active');

      if (activeTab === 'services') {
        formData.append('duration', data.duration || '0');
        formData.append('serviceTypes', JSON.stringify(data.serviceTypes || []));
        if (data.otherServiceName) formData.append('otherServiceName', data.otherServiceName);
      } else {
        formData.append('subCategory', data.subCategory || '');
        formData.append('stock', data.stock || '0');
        formData.append('sku', data.sku || '');
        formData.append('uom', data.uom || '');
      }

      // Handle images
      const existingImages: string[] = [];
      data.images?.forEach((img) => {
        if (img.startsWith('http')) {
          existingImages.push(img);
        } else {
          formData.append('images', {
            uri: img,
            type: 'image/jpeg',
            name: 'photo.jpg',
          } as any);
        }
      });
      formData.append('existingImages', JSON.stringify(existingImages));

      const isEditing = sheetMode === 'edit';
      const url = isEditing
        ? `${API_BASE_URL}/api/products/${(editingItem as any)?._id || (editingItem as any)?.id}`
        : `${API_BASE_URL}/api/products`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result.success) {
        fetchItems();
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Network request failed');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      t('common.delete'),
      t('common.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (result.success) {
                fetchItems();
              }
            } catch (error) {
              console.error('Delete error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
        <TechnicianHeader
          title={t('technician.services_title')}
          subtitle={t('technician.services_subtitle')}
        />

        {/* Note: ServiceProductTabs hidden as per request to have only services */}
        <View style={{ height: 10 }} />

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={theme.tint} />
            </View>
          ) : (
            <ServiceList data={services as any} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </View>

        <FAB
          onPress={handleOpenAdd}
          label={activeTab === 'services' ? t('technician.add_service_type') : t('products.add_new')}
        />

        <AddEditSheet
          visible={modalVisible}
          initialData={editingItem}
          mode={sheetMode}
          type={activeTab === 'services' ? 'service' : 'product'}
          onSave={handleSave}
          onClose={() => setModalVisible(false)}
        />
      </AppBody>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTheme } from '../../theme/ThemeContext';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';

import { ServiceProductTabs } from '../../components/services/service-product-tabs';
import { ServiceList } from '../../components/services/service-list';
import { ProductList } from '../../components/services/product-list';
import { AddEditSheet } from '../../components/services/add-edit-sheet';
import { FAB } from '../../components/common/FAB';

import { Service, SheetMode } from '../../types';

export function TechnicianServicesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [sheetMode, setSheetMode] = useState<SheetMode>('add');
  const [editingItem, setEditingItem] = useState<Partial<Service> | null>(null);

  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Roadside Assistance',
      price: '150',
      duration: '45',
      category: 'service',
      serviceTypes: ['Roadside Assistance', 'Tire Repair'],
      status: 'active',
    },
    {
      id: '2',
      name: 'Oil Change',
      price: '80',
      duration: '30',
      category: 'service',
      serviceTypes: ['Oil Change'],
      status: 'active',
    },
  ]);

  const [products, setProducts] = useState<Service[]>([
    {
      id: '101',
      name: 'Brake Pads (Toyota)',
      price: '250',
      duration: '-',
      category: 'product',
      subCategory: 'Brake Pads',
      stock: '15',
      sku: 'BP-TY-001',
      status: 'active',
    },
    {
      id: '102',
      name: 'Synthetic Oil 5W-30',
      price: '60',
      duration: '-',
      category: 'product',
      subCategory: 'Fluids',
      stock: '45',
      sku: 'OIL-SYN-530',
      status: 'active',
    },
  ]);

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

  const handleSave = (data: Partial<Service>) => {
    if (sheetMode === 'add') {
      const newItem = { ...data, id: Date.now().toString() } as Service;
      if (activeTab === 'services') {
        setServices((prev) => [...prev, newItem]);
      } else {
        setProducts((prev) => [...prev, newItem]);
      }
    } else {
      if (data.category === 'service') {
        setServices((prev) =>
          prev.map((item) => (item.id === editingItem?.id ? { ...item, ...data } as Service : item))
        );
      } else {
        setProducts((prev) =>
          prev.map((item) => (item.id === editingItem?.id ? { ...item, ...data } as Service : item))
        );
      }
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'services') {
      setServices((prev) => prev.filter((item) => item.id !== id));
    } else {
      setProducts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppBody style={{ flex: 1, backgroundColor: theme.background }}>
        <TechnicianHeader
          title={t('technician.services_title')}
          subtitle={t('technician.services_subtitle')}
        />

        <ServiceProductTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{ services: services.length, products: products.length }}
        />

        <View style={styles.content}>
          {activeTab === 'services' ? (
            <ServiceList data={services as any} onEdit={handleEdit} onDelete={handleDelete} />
          ) : (
            <ProductList data={products as any} onEdit={handleEdit} onDelete={handleDelete} />
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
});

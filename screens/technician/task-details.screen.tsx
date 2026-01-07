import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTheme } from '../../App';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';

interface TaskDetailProps {
  route: any;
  navigation: any;
}

export function TaskDetailScreen({ route, navigation }: TaskDetailProps) {
  const { theme } = useTheme();
  const task = route.params.task;

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      task.location
    )}`;
    Linking.openURL(url);
  };

  // Demo customer review data
  const customerReview = {
    rating: 4.8,
    comment: 'Great service, very professional and fast!',
  };

  return (
    <AppBody style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Task Details
        </Text>
        <View style={{ width: 22 }} /> 
      </View> */} 

      <TechnicianHeader title="Task Details" onBackPress={() => {navigation.goBack()}} />

      <ScrollView style={styles.content}>
        {/* Task Info */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.taskTitle, { color: theme.text }]}>
              {task.service}
            </Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: task.status === 'completed' ? '#D4EDDA' : task.status === 'next' ? '#D1ECF1' : '#FFF3CD' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: task.status === 'completed' ? '#155724' : task.status === 'next' ? '#0C5460' : '#856404' }
              ]}>
                {task.status === 'completed' ? 'Completed' : task.status === 'next' ? 'Next Task' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={20} color="#F4C430" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Customer: {task.customer}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#007AFF" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Location: {task.location}
            </Text>
          </View>

          {task.eta && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="clock" size={20} color="#FFB800" />
              <Text style={[styles.infoText, { color: theme.text }]}>
                ETA: {task.eta}
              </Text>
            </View>
          )}

          {task.scheduled && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="calendar-alt" size={20} color="#2ECC71" />
              <Text style={[styles.infoText, { color: theme.text }]}>
                Scheduled: {task.scheduled}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
            <FontAwesome5 name="map-marked-alt" size={18} color="#FFF" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Task Steps</Text>
          <View style={styles.checklistItem}>
            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#F4C430" />
            <Text style={[styles.checkText, { color: theme.text }]}>Arrive at customer location</Text>
          </View>
          <View style={styles.checklistItem}>
            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#F4C430" />
            <Text style={[styles.checkText, { color: theme.text }]}>Perform service: {task.service}</Text>
          </View>
          <View style={styles.checklistItem}>
            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={20} color="#F4C430" />
            <Text style={[styles.checkText, { color: theme.text }]}>Verify and complete</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Customer Review</Text>
          <View style={styles.reviewRow}>
            <FontAwesome5 name="star" size={16} color="#FFB800" />
            <Text style={[styles.reviewRating, { color: theme.text }]}>
              {customerReview.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.reviewComment, { color: theme.text }]}>
            "{customerReview.comment}"
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {task.status !== 'completed' && (
            <>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ECC71' }]}>
                <Text style={styles.actionButtonText}>Start Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F4C430' }]}>
                <Text style={styles.actionButtonText}>Mark as Completed</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </AppBody>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1 },
  card: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoText: { fontSize: 14 },
  mapButton: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  mapButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  checkText: { fontSize: 14 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  reviewRating: { fontSize: 14, fontWeight: '600' },
  reviewComment: { fontSize: 14, fontStyle: 'italic' },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12 },
  actionButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  actionButtonText: { color: '#1C1C1E', fontWeight: '600' },
});

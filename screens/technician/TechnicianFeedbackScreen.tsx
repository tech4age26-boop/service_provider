import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AppBody from '../../components/app_body/app-body';
import TechnicianHeader from '../../components/technician_header/technician-header';
import { useTheme } from '../../theme/ThemeContext';
import { colors } from '../../theme/colors';

interface FeedbackScreenProps {
  navigation: any;
  route: any;
}

export function TechnicianFeedbackScreen({ navigation, route }: FeedbackScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // In a real app, send data to backend here
    Alert.alert(t('feedback.success_msg'));
    navigation.goBack();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <FontAwesome5 
                    name="star" 
                    size={32} 
                    solid={i <= rating} 
                    color={i <= rating ? colors.warning : theme.border} 
                    style={{ marginHorizontal: 4 }}
                />
            </TouchableOpacity>
        )
    }
    return stars;
  };

  return (
    <AppBody style={[styles.container, { backgroundColor: theme.background }]}>
      <TechnicianHeader title={t('feedback.title')} onBackPress={() => navigation.goBack()} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.label, { color: theme.text }]}>{t('feedback.rating_label')}</Text>
            <View style={styles.starContainer}>
                {renderStars()}
            </View>

            <TextInput
                style={[styles.input, { 
                    backgroundColor: theme.inputBackground, 
                    color: theme.text,
                    borderColor: theme.border 
                }]}
                placeholder={t('feedback.comment_placeholder')}
                placeholderTextColor={theme.subText}
                multiline
                numberOfLines={5}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
            />

            <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary, opacity: rating > 0 ? 1 : 0.6 }]}
                onPress={handleSubmit}
                disabled={rating === 0}
            >
                <Text style={styles.submitText}>{t('feedback.submit_btn')}</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppBody>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    marginBottom: 24,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

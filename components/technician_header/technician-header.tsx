import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../App';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface TechnicianHeaderProps {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
}

const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
}) => {
  // const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.row}>
          {onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={[styles.backButton, { backgroundColor: theme.background }]}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color={theme.text}
              />
            </TouchableOpacity>
          )}

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.subText }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export default TechnicianHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:20
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#F4C430',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});

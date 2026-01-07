/**
 * Filter App
 *
 * @format
 */

import React, { useState, createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageScreen } from './screens/LanguageScreen';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthScreen } from './AuthScreen';
import { TechnicianDashboard } from './TechnicianDashboard';

const lightTheme = {
  mode: 'light',
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#1C1C1E',
  subText: '#8E8E93',
  border: '#F0F0F0',
  iconColor: '#1C1C1E',
  tabBarBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  tint: '#F4C430',
  success: '#2ECC71',
  tagBg: '#E8F1FF',
  tagText: '#007AFF',
};

const darkTheme = {
  mode: 'dark',
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  subText: '#A1A1AA',
  border: '#333333',
  iconColor: '#FFFFFF',
  tabBarBackground: '#1E1E1E',
  inputBackground: '#2C2C2E',
  tint: '#F4C430',
  success: '#2ECC71',
  tagBg: '#1A2A40',
  tagText: '#4DA3FF',
};

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => { },
  isDarkMode: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}
function App(): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const selected = await AsyncStorage.getItem('has-selected-language');
      setIsLanguageSelected(selected === 'true');
      const userData = await AsyncStorage.getItem('user_data');
      setIsAuthenticated(!!userData);
    } catch (error) {
      setIsLanguageSelected(false);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (loading || isLanguageSelected === null) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <ActivityIndicator size="large" color="#F4C430" /> 
    </View>
  );
}
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        {!isLanguageSelected ? (
          <LanguageScreen onSelect={() => setIsLanguageSelected(true)} />
        ) : isAuthenticated ? (
          <TechnicianDashboard onLogout={() => setIsAuthenticated(false)} />
        ) : (
          <AuthScreen onLogin={() => setIsAuthenticated(true)} />
        )}
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}


function MainApp() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Home');
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <View style={styles.contentContainer}>
        {activeTab === 'Home' && <HomeScreen />}
        {activeTab === 'Find' && <FindScreen />}
        {activeTab === 'Orders' && <OrdersScreen />}
        {activeTab === 'Settings' && <SettingsScreen />}
      </View>

      <BottomTabs
        paddingBottom={insets.bottom > 0 ? insets.bottom : 20}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </View>
  );
}

function HomeScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('./assets/user_avatar.png')}
              style={[styles.avatar, { borderColor: theme.cardBackground }]}
            />
            <View style={[styles.onlineBadge, { borderColor: theme.cardBackground }]} />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
            <Text style={[styles.userName, { color: theme.text }]}>Alex Johnson</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.bellButton, { backgroundColor: theme.cardBackground }]}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={[styles.notificationDot, { borderColor: theme.cardBackground }]} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Find a workshop, service..."
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.subText}
          />
          <TouchableOpacity>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>FILTER Certified</Text>
          <Text style={styles.verifiedBadge}>✓</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollPadding}>
        <WorkshopCard
          image={require('./assets/car_workshop.png')}
          title="AutoFix Pro Center"
          rating="4.8"
          distance="2.5 mi"
          location="Downtown Area"
          tags={['Diagnostics', 'Quick Service']}
          isSponsored={true}
        />
        <WorkshopCard
          image={require('./assets/tires_wheel.png')}
          title="Turbo Mechanics"
          rating="4.5"
          distance="1.8 mi"
          location="Westside"
          tags={['Tuning']}
          isSponsored={true}
        />
      </ScrollView>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Favorites</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollPadding}>
        <FavoriteCard
          image={require('./assets/tires_wheel.png')}
          title="Downtown Tire & Wheel"
          subtitle="0.8 mi • 120 Main St"
          tag="Tires & Alignment"
        />
        <FavoriteCard
          image={require('./assets/car_workshop.png')}
          title="Quick Lube Station"
          subtitle="3.1 mi • Highway 9"
          tag="Oil Change"
        />
      </ScrollView>
      <View style={styles.emergencyContainer}>
        <View style={styles.emergencyContent}>
          <Text style={styles.emergencyTitle}>Need Emergency Help?</Text>
          <Text style={styles.emergencySubtitle}>
            24/7 Roadside assistance is just a tap away.
          </Text>
        </View>
        <TouchableOpacity style={styles.sosButton}>
          <Text style={styles.sosTextSmall}>SOS</Text>
          <Text style={styles.sosTextLarge}>Get Help</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function FindScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={[styles.header, { paddingBottom: 5 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.sectionTitle, { fontSize: 24, color: theme.text }]}>Find Workshops</Text>
        </View>
        <TouchableOpacity style={[styles.bellButton, { backgroundColor: theme.cardBackground }]}>
          <MaterialCommunityIcons name="filter-variant" size={24} color={theme.iconColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by name, service..."
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.subText}
          />
        </View>
      </View>

      <View style={styles.listPadding}>
        <WorkshopCard
          image={require('./assets/car_workshop.png')}
          title="AutoFix Pro Center"
          rating="4.8"
          distance="2.5 mi"
          location="Downtown Area"
          tags={['Diagnostics', 'Quick Service']}
          isSponsored={true}
          fullWidth={true}
        />
        <WorkshopCard
          image={require('./assets/tires_wheel.png')}
          title="Speedy Repair Hub"
          rating="4.6"
          distance="4.2 mi"
          location="North Hills"
          tags={['Engine', 'Tuning']}
          fullWidth={true}
        />
        <WorkshopCard
          image={require('./assets/car_workshop.png')}
          title="Premium Auto Care"
          rating="5.0"
          distance="5.0 mi"
          location="Eastside"
          tags={['Detailing', 'Oil Change']}
          isNew={true}
          fullWidth={true}
        />
      </View>
    </ScrollView>
  );
}

function OrdersScreen() {
  const { theme } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { fontSize: 24, color: theme.text }]}>My Orders</Text>
      </View>

      {/* Current Orders */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 16 }]}>Current Orders</Text>
      </View>

      <View style={styles.listPadding}>
        <OrderCard
          title="Oil Change & Inspection"
          shopName="AutoFix Pro Center"
          date="Today, 2:00 PM"
          status="In Progress"
          statusColor="#F4C430"
          image={require('./assets/car_workshop.png')}
        />
      </View>

      {/* Previous Orders */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 16 }]}>Previous Orders</Text>
      </View>

      <View style={styles.listPadding}>
        <OrderCard
          title="Tire Replacement"
          shopName="Downtown Tire & Wheel"
          date="Dec 15, 2024"
          status="Completed"
          statusColor="#2ECC71"
          image={require('./assets/tires_wheel.png')}
        />
        <OrderCard
          title="Brake Pad Replacement"
          shopName="Quick Lube Station"
          date="Nov 28, 2024"
          status="Completed"
          statusColor="#2ECC71"
          image={require('./assets/car_workshop.png')}
        />
      </View>

    </ScrollView>
  );
}

function SettingsScreen() {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}>

      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { fontSize: 24, color: theme.text }]}>Settings</Text>
      </View>

      <View style={styles.listPadding}>
        {/* Appearance Section */}
        <Text style={[styles.settingsHeader, { color: theme.subText }]}>APPEARANCE</Text>

        <View style={[styles.settingsCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <MaterialCommunityIcons name="theme-light-dark" size={22} color={theme.text} />
              </View>
              <Text style={[styles.settingsLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#F4C430" }}
              thumbColor={isDarkMode ? "#FFFFFF" : "#f4f3f4"}
            />
          </View>
        </View>
        <Text style={[styles.settingsHeader, { color: theme.subText, marginTop: 24 }]}>ACCOUNT</Text>

        <View style={[styles.settingsCard, { backgroundColor: theme.cardBackground }]}>
          <SettingsItem icon="account" label="Edit Profile" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem icon="credit-card" label="Payment Methods" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem icon="bell" label="Notifications" />
        </View>
        <Text style={[styles.settingsHeader, { color: theme.subText, marginTop: 24 }]}>MORE</Text>

        <View style={[styles.settingsCard, { backgroundColor: theme.cardBackground }]}>
          <SettingsItem icon="help-circle" label="Help & Support" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem icon="logout" label="Log Out" color="#FF3B30" />
        </View>

      </View>
    </ScrollView>
  );
}
function WorkshopCard({ image, title, rating, distance, location, tags, isSponsored, isNew, fullWidth }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }, fullWidth && styles.fullWidthCard]}>
      <View style={styles.cardImageContainer}>
        <Image source={image} style={styles.cardImage} />
        {isSponsored && (
          <View style={styles.sponsoredTag}>
            <Text style={styles.sponsoredText}>SPONSORED</Text>
          </View>
        )}
        {isNew && (
          <View style={[styles.sponsoredTag, { backgroundColor: '#2ECC71' }]}>
            <Text style={[styles.sponsoredText, { color: 'white' }]}>NEW</Text>
          </View>
        )}
        <TouchableOpacity style={styles.heartButton}>
          <Text style={styles.heartIcon}>🤍</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
          <View style={[styles.ratingContainer, { backgroundColor: theme.background }]}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={[styles.ratingText, { color: theme.text }]}>{rating}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>{distance} • {location}</Text>
        <View style={styles.tagsRow}>
          {tags.map((tag: string, index: number) => (
            <View key={index} style={[styles.tag, index === 1 ? styles.greenTag : null, { backgroundColor: index === 1 ? '#E6F9EF' : theme.tagBg }]}>
              <Text style={[styles.tagText, index === 1 ? styles.greenTagText : null, { color: index === 1 ? '#2ECC71' : theme.tagText }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function FavoriteCard({ image, title, subtitle, tag }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.miniCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.miniCardImageContainer}>
        <Image source={image} style={styles.miniCardImage} />
        <TouchableOpacity style={styles.favHeartButton}>
          <Text style={styles.heartIconFilled}>💛</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.miniCardContent}>
        <Text style={[styles.miniCardTitle, { color: theme.text }]}>{title}</Text>
        <Text style={styles.miniCardSubtitle}>{subtitle}</Text>
        <View style={styles.miniCardFooter}>
          <View style={[styles.smallTag, { backgroundColor: theme.background }]}>
            <Text style={[styles.smallTagText, { color: theme.subText }]}>{tag}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.bookText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function OrderCard({ title, shopName, date, status, statusColor, image }: any) {
  const { theme } = useTheme();
  return (
    <View style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}>
      <Image source={image} style={styles.orderImage} />
      <View style={styles.orderContent}>
        <View style={styles.orderHeader}>
          <Text style={[styles.orderTitle, { color: theme.text }]}>{title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
        <Text style={styles.shopName}>{shopName}</Text>
        <Text style={styles.orderDate}>{date}</Text>
      </View>
    </View>
  );
}

function SettingsItem({ icon, label, color }: any) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.settingsItem}>
      <View style={styles.settingsLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color || theme.text} />
        </View>
        <Text style={[styles.settingsLabel, { color: color || theme.text }]}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={theme.subText} />
    </TouchableOpacity>
  );
}

function BottomTabs({
  paddingBottom,
  activeTab,
  setActiveTab
}: {
  paddingBottom: number,
  activeTab: string,
  setActiveTab: (tab: string) => void
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.bottomNavContainer, { paddingBottom, backgroundColor: theme.tabBarBackground }]}>
      <TabItem
        icon="home"
        label="Home"
        isActive={activeTab === 'Home'}
        onPress={() => setActiveTab('Home')}
      />
      <TabItem
        icon="magnify"
        label="Find"
        isActive={activeTab === 'Find'}
        onPress={() => setActiveTab('Find')}
      />
      <TabItem
        icon="clipboard-list-outline"
        label="Orders"
        isActive={activeTab === 'Orders'}
        onPress={() => setActiveTab('Orders')}
      />
      <TabItem
        icon="cog-outline"
        label="Settings"
        isActive={activeTab === 'Settings'}
        onPress={() => setActiveTab('Settings')}
      />
    </View>
  );
}

function TabItem({ icon, label, isActive, onPress }: any) {
  const { theme } = useTheme();
  const activeColor = theme.tint;
  const inactiveColor = "#999";

  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialCommunityIcons
        name={icon}
        size={28}
        color={isActive ? activeColor : inactiveColor}
      />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive, { color: isActive ? activeColor : inactiveColor }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ECC71',
    borderWidth: 2,
  },
  welcomeTextContainer: {
    justifyContent: 'center',
  },
  welcomeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bellIcon: {
    fontSize: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 5,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 6,
  },
  verifiedBadge: {
    color: '#007AFF', 
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#F4C430',
    fontWeight: '600',
  },
  horizontalScrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    width: 280,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  fullWidthCard: {
    width: '100%',
    marginRight: 0,
    marginBottom: 20,
  },
  cardImageContainer: {
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sponsoredTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F4C430',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1C1C1E',
    letterSpacing: 0.5,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
    color: '#FFF',
  },
  cardContent: {
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingStar: {
    fontSize: 10,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  greenTag: {
    backgroundColor: '#E6F9EF',
  },
  greenTagText: {
    color: '#2ECC71',
  },

  miniCard: {
    width: 260,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  miniCardImageContainer: {
    height: 120,
    position: 'relative',
  },
  miniCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favHeartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    backgroundColor: '#FFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  heartIconFilled: {
    fontSize: 14,
  },
  miniCardContent: {
    padding: 12,
  },
  miniCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  miniCardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  miniCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  smallTagText: {
    fontSize: 11,
  },
  bookText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F4C430',
  },
  emergencyContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#F4C430',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#F4C430',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyContent: {
    flex: 1,
    marginRight: 15,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: '#1C1C1E',
    opacity: 0.8,
    lineHeight: 18,
  },
  sosButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTextSmall: {
    color: '#F4C430',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sosTextLarge: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  orderContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  shopName: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  navLabelActive: {
    fontWeight: 'bold',
  },
});

export default App;

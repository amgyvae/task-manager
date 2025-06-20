// File: app/profile.tsx

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  TextInput,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Switch,
} from 'react-native';
import { Text, ProgressBar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const quotes = [
  'Discipline equals freedom. – Jocko Willink',
  'Push yourself, because no one else is going to do it for you.',
  'Success doesn’t just find you. You have to go out and get it.',
  'Great things never come from comfort zones.',
  'The harder you work for something, the greater you’ll feel when you achieve it.',
  'Don’t watch the clock; do what it does. Keep going.',
  'Dream it. Wish it. Do it.',
];

const totalXpForLevel = (lvl: number) => {
  let total = 0;
  for (let i = 1; i <= lvl; i++) {
    total += 50 + (i - 1) * 25;
  }
  return total;
};

export default function ProfileScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0,
  });
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [quote, setQuote] = useState('');
  const [chartData, setChartData] = useState<number[]>([]);

  const [name, setName] = useState('Qara Lux');
  const [email, setEmail] = useState('lux@qara.app');
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);

  const [darkMode, setDarkMode] = useState(false);
  const systemTheme = useColorScheme();

  const loadStats = async () => {
    const stored = await AsyncStorage.getItem('tasks');
    const profileData = await AsyncStorage.getItem('profile');
    const uri = await AsyncStorage.getItem('avatarUri');
    const themePref = await AsyncStorage.getItem('darkMode');

    if (uri) setAvatarUri(uri);
    if (themePref) setDarkMode(themePref === 'true');

    if (profileData) {
      const { name, email } = JSON.parse(profileData);
      setName(name);
      setEmail(email);
    }

    if (stored) {
      const tasks = JSON.parse(stored);
      const total = tasks.length;
      const completed = tasks.filter((t: any) => t.status === 'Completed').length;
      const cancelled = tasks.filter((t: any) => t.status === 'Cancelled').length;
      const inProgress = tasks.filter((t: any) => t.status === 'In Progress').length;

      setStats({ total, completed, cancelled, inProgress });

      const xpCalc = completed * 20 + inProgress * 5;
      setXp(xpCalc);

      let lvl = 1;
      while (xpCalc >= totalXpForLevel(lvl)) lvl++;
      setLevel(lvl);

      const weeklyStats = Array(7).fill(0);
      tasks.forEach((t: any) => {
      try {
          const dateObj = new Date(t.date);
          if (!isNaN(dateObj.getTime())) {
          const diff = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24);
          if (diff >= 0 && diff <= 6) {
              weeklyStats[6 - Math.floor(diff)] += 1;
          }
          }
      } catch (err) {
          console.warn('Invalid task date:', t.date);
      }
      });
      setChartData(weeklyStats);
    }

    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(random);
  };

  const saveProfile = async () => {
    await AsyncStorage.setItem('profile', JSON.stringify({ name: editName, email: editEmail }));
    setName(editName);
    setEmail(editEmail);
    setEditModal(false);
  };

  const toggleTheme = async (val: boolean) => {
    setDarkMode(val);
    await AsyncStorage.setItem('darkMode', val.toString());
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const clearTasks = async () => {
    Alert.alert('Clear All Tasks?', 'This will delete all your tasks permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('tasks');
          setStats({ total: 0, completed: 0, cancelled: 0, inProgress: 0 });
          setXp(0);
          setLevel(1);
        },
      },
    ]);
  };

  const xpRequired = 50 + (level - 1) * 25;
  const xpCurrent = xp - totalXpForLevel(level - 1);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      await AsyncStorage.setItem('avatarUri', result.assets[0].uri);
    }
  };

  const themeColors = darkMode ? ['#0f172a', '#000c40'] : ['#93c5fd', '#a5b4fc'];
  const themeBackground = darkMode ? '#0f172a' : '#fff';
  const textColor = darkMode ? '#f8fafc' : '#1e293b';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeBackground }}>
      <LinearGradient
        colors={themeColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={avatarUri ? { uri: avatarUri } : require('@/assets/images/icon.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        <TouchableOpacity onPress={() => setEditModal(true)}>
          <Text style={{ color: '#fff', marginTop: 8, textDecorationLine: 'underline' }}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.stats}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>🎖 Level {level}</Text>
        <Animated.View entering={FadeIn}><ProgressBar progress={xpCurrent / xpRequired} color="#ef4444" style={styles.progress} /></Animated.View>
        <Text style={[styles.label, { color: textColor }]}>💯 XP: {xpCurrent} / {xpRequired}</Text>

        <View style={styles.cardRow}>
        {[
            { label: 'Total', value: stats.total, icon: '📋', bg: '#f1f5f9' },
            { label: 'Done', value: stats.completed, icon: '✅', bg: '#dcfce7' },
            { label: 'Progress', value: stats.inProgress, icon: '🔄', bg: '#fef9c3' },
            { label: 'Cancelled', value: stats.cancelled, icon: '❌', bg: '#fee2e2' },
        ].map((item, idx) => (
            <View key={idx} style={[styles.statCard, { backgroundColor: item.bg }]}>
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
            </View>
        ))}
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>📈 Weekly Activity</Text>
        <LineChart
          data={{
            labels: ['6d', '5d', '4d', '3d', '2d', '1d', 'Now'],
            datasets: [{ data: chartData.length === 7 ? chartData : [0, 0, 0, 0, 0, 0, 0] }],
          }}        
          width={screenWidth * 0.9}
          height={220}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: themeBackground,
            backgroundGradientFrom: themeBackground,
            backgroundGradientTo: themeBackground,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            labelColor: (opacity = 1) => textColor,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#ef4444',
            },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 12 }}
        />

        {(level >= 2 || stats.completed >= 5) && <Text style={{ marginTop: 10, color: textColor }}>🏅 Badge Unlocked</Text>}
        {level >= 5 && <Text style={{ color: textColor }}>🥇 Master Achiever</Text>}

        <Button mode="contained" onPress={clearTasks} style={styles.clearBtn} buttonColor="#ef4444">
          Clear All Tasks
        </Button>

        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: textColor }}>🌗 Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleTheme} />
        </View>
      </View>

      <View style={styles.quoteBox}>
        <Text style={styles.quote}>“{quote}”</Text>
      </View>

      <Modal visible={editModal} animationType="slide">
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: themeBackground }}>
          <Text style={{ fontSize: 20, marginBottom: 10, color: textColor }}>Edit Profile</Text>
          <TextInput
            value={editName}
            onChangeText={setEditName}
            placeholder="Name"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            value={editEmail}
            onChangeText={setEditEmail}
            placeholder="Email"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <Button mode="contained" onPress={saveProfile} style={{ marginTop: 20 }}>
            Save
          </Button>
          <Button onPress={() => setEditModal(false)} style={{ marginTop: 10 }}>
            Cancel
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#eee',
  },
  stats: {
    marginTop: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  label: {
    marginBottom: 10,
  },
  progress: {
    width: screenWidth * 0.8,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  countRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 10,
    gap: 4,
  },
  clearBtn: {
    marginTop: 20,
    borderRadius: 8,
  },
  quoteBox: {
    marginTop: 40,
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  quote: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#92400e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: '#111',
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    width: screenWidth * 0.4,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#444',
  },
  
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Task from '../../components/Task';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Badge, Button, Card, IconButton, TextInput } from 'react-native-paper';
import { useContext } from 'react';

type TaskType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
};

export default function HomeScreen() {
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [location, setLocation] = useState('');
  const [tasks, setTasks] = useState<TaskType[]>([]);

  const router = useRouter();
  const params = useLocalSearchParams();

  const formattedDate = format(date, 'yyyy-MM-dd HH:mm');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (params?.lat && params?.lng) {
        try {
          const reverse = await Location.reverseGeocodeAsync({
            latitude: parseFloat(params.lat as string),
            longitude: parseFloat(params.lng as string),
          });

          if (reverse.length > 0) {
            const { name, street, city, region, country } = reverse[0];
            const formatted = `${street || ''} ${name || ''}, ${city || ''}, ${region || ''}, ${country || ''}`.trim();
            setLocation(formatted);
          } else {
            setLocation(`Lat: ${params.lat}, Lng: ${params.lng}`);
          }
        } catch (e) {
          setLocation(`Lat: ${params.lat}, Lng: ${params.lng}`);
        }
      }
    };

    fetchAddress();
  }, [params]);

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.log('Saving error:', e);
    }
  };

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.log('Loading error:', e);
    }
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Location is required');
      return;
    }
  
    const newTask: TaskType = {
      id: Date.now().toString(),
      title,
      description,
      date: formattedDate,
      location,
      status: 'In Progress',
    };
  
    setTasks([...tasks, newTask]);
    setTitle('');
    setDescription('');
    setDate(new Date());
    setLocation('');
    Keyboard.dismiss();
  };
  

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateStatus = (id: string, newStatus: TaskType['status']) => {
    setTasks(sortedTasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'date') return a.date.localeCompare(b.date);
    return a.status.localeCompare(b.status);
  });  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>📋 Add New Task</Text>
  
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
        />
  
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowPicker(true)}>
          <Text style={{ color: '#555' }}>🕒 {formattedDate}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={onChangeDate}
          />
        )}
  
        <TextInput
          label="Address (or pick from map)"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          mode="outlined"
        />
  
        <Button
          icon="map-marker"
          mode="outlined"
          onPress={() => router.push('select-location')}
          style={styles.mapBtn}
        >
          Pick from Map
        </Button>
  
        <Button
          mode="contained"
          onPress={handleAddTask}
          style={styles.addBtn}
          buttonColor="#3b82f6"
        >
          Add Task
        </Button>

        <Button
          mode="outlined"
          onPress={() => setSortBy(sortBy === 'date' ? 'status' : 'date')}
          style={{ marginBottom: 12 }}
        >
          Sort by: {sortBy === 'date' ? '🕒 Date' : '📌 Status'}
        </Button>

  
        <Text style={styles.heading}>🗂 Task List</Text>
  
        {sortedTasks.map((task) => (
          <Card key={task.id} style={styles.card} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}>
            <Card.Content>
              <View style={styles.row}>
                <Text style={styles.title}>{task.title}</Text>
                <Badge style={[styles.badge, { backgroundColor: statusColors[task.status] }]}>{task.status}</Badge>
              </View>
              <Text style={styles.sub}>📅 {task.date}</Text>
              <Text style={styles.sub}>📍 {task.location}</Text>
              <View style={styles.actions}>
                <IconButton icon="check" iconColor="#10b981" onPress={() => updateStatus(task.id, 'Completed')} />
                <IconButton icon="close" iconColor="#ef4444" onPress={() => updateStatus(task.id, 'Cancelled')} />
                <IconButton icon="rotate-right" iconColor="#f59e0b" onPress={() => updateStatus(task.id, 'In Progress')} />
                <IconButton icon="delete" iconColor="#6b7280" onPress={() => deleteTask(task.id)} />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );  
}

const statusColors = {
  'In Progress': '#f59e0b',
  'Completed': '#10b981',
  'Cancelled': '#ef4444',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  datePicker: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  mapBtn: {
    marginBottom: 12,
  },
  addBtn: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sub: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
});


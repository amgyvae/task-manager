import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, Badge } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

type TaskType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
};

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [task, setTask] = useState<TaskType | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) {
        const all: TaskType[] = JSON.parse(stored);
        const found = all.find((t) => t.id === id);
        if (found) {
          setTask(found);
          setDate(new Date(found.date));
        }
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!task?.title.trim() || !task.description.trim() || !task.location.trim()) {
      Alert.alert('All fields are required');
      return;
    }

    const stored = await AsyncStorage.getItem('tasks');
    if (stored) {
      let all: TaskType[] = JSON.parse(stored);
      all = all.map((t) =>
        t.id === id ? { ...task, date: date.toISOString().slice(0, 16).replace('T', ' ') } : t
      );
      await AsyncStorage.setItem('tasks', JSON.stringify(all));
      Toast.show({
        type: 'success',
        text1: '✅ Task updated!',
        visibilityTime: 2000,
        position: 'bottom',
      });
      router.back();
    }
  };

  const statusOptions: TaskType['status'][] = ['In Progress', 'Completed', 'Cancelled'];

  if (!task) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.title}>✏️ Edit Task</Text>

      <TextInput
        label="Title"
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Description"
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        style={styles.input}
        mode="outlined"
        multiline
      />
      <TextInput
        label="Location"
        value={task.location}
        onChangeText={(text) => setTask({ ...task, location: text })}
        style={styles.input}
        mode="outlined"
      />

      <Button mode="outlined" onPress={() => setShowPicker(true)} style={styles.input}>
        {date.toISOString().slice(0, 16).replace('T', ' ')}
      </Button>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={(_, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      <Text style={styles.subtitle}>📌 Status</Text>
      <View style={styles.statusRow}>
        {statusOptions.map((s) => (
          <Badge
            key={s}
            style={[
              styles.badge,
              {
                backgroundColor: s === task.status ? '#3b82f6' : '#d1d5db',
              },
            ]}
            onPress={() => setTask({ ...task, status: s })}
          >
            {s}
          </Badge>
        ))}
      </View>

      <Button mode="contained" onPress={handleSave} style={styles.saveBtn} buttonColor="#3b82f6">
        Save Task
      </Button>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  subtitle: {
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  saveBtn: {
    marginTop: 10,
    borderRadius: 8,
  },
});

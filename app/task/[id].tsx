import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Badge } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TaskType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
};

export default function TaskDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<TaskType | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      const stored = await AsyncStorage.getItem('tasks');
      if (stored) {
        const allTasks: TaskType[] = JSON.parse(stored);
        const found = allTasks.find((t) => t.id === id);
        if (found) setTask(found);
      }
    };
    loadTask();
  }, [id]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text variant="titleLarge">Task not found</Text>
      </View>
    );
  }

  const statusColor = {
    'In Progress': '#f59e0b',
    Completed: '#10b981',
    Cancelled: '#ef4444',
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={task.title} titleStyle={styles.cardTitle} />
        <Card.Content>
          <Text style={styles.label}>📝 Description</Text>
          <Text style={styles.value}>{task.description || '—'}</Text>

          <Text style={styles.label}>📅 Date & Time</Text>
          <Text style={styles.value}>{task.date}</Text>

          <Text style={styles.label}>📍 Location</Text>
          <Text style={styles.value}>{task.location}</Text>

          <Text style={styles.label}>📌 Status</Text>

          <Badge style={[styles.badge, { backgroundColor: statusColor[task.status] }]}>
            {task.status}
          </Badge>

          <TouchableOpacity style={styles.label} onPress={() => router.push({ pathname: '/task/edit', params: { id: task.id } })}>
            <Text>✏️ Edit</Text>
          </TouchableOpacity>
          
        </Card.Content>

      </Card>

      <Button
        icon="arrow-left"
        mode="contained"
        onPress={() => router.back()}
        style={styles.backBtn}
        buttonColor="#3b82f6"
      >
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 20,
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  label: {
    marginTop: 14,
    fontWeight: '600',
    color: '#374151',
  },
  value: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 14,
  },
  badge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    color: '#fff',
  },
  backBtn: {
    borderRadius: 8,
    marginTop: 10,
  },
});

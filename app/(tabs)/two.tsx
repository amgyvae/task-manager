import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card, Badge } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

type TaskType = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
};

export default function TabTwoScreen() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [filter, setFilter] = useState<'All' | TaskType['status']>('All');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem('tasks');
        if (stored) setTasks(JSON.parse(stored));
      };
      load();
    }, [])
  );  

  const statusColor = {
    'In Progress': '#f59e0b',
    Completed: '#10b981',
    Cancelled: '#ef4444',
  };

  const stats = {
    Completed: tasks.filter(t => t.status === 'Completed').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Cancelled: tasks.filter(t => t.status === 'Cancelled').length,
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <Animated.ScrollView entering={FadeIn.duration(500)} style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>📊 Task Statistics</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>✅ Completed:</Text>
            <Badge style={[styles.statBadge, { backgroundColor: '#10b981' }]}>
              {stats.Completed}
            </Badge>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>🔄 In Progress:</Text>
            <Badge style={[styles.statBadge, { backgroundColor: '#f59e0b' }]}>
              {stats['In Progress']}
            </Badge>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>❌ Cancelled:</Text>
            <Badge style={[styles.statBadge, { backgroundColor: '#ef4444' }]}>
              {stats.Cancelled}
            </Badge>
          </View>
        </Card.Content>
      </Card>


      <Text style={styles.heading}>🔍 Filter Tasks</Text>
      <View style={styles.filters}>
        <Button mode={filter === 'All' ? 'contained' : 'outlined'} onPress={() => setFilter('All')}>All</Button>
        <Button mode={filter === 'In Progress' ? 'contained' : 'outlined'} onPress={() => setFilter('In Progress')}>In Progress</Button>
        <Button mode={filter === 'Completed' ? 'contained' : 'outlined'} onPress={() => setFilter('Completed')}>Completed</Button>
        <Button mode={filter === 'Cancelled' ? 'contained' : 'outlined'} onPress={() => setFilter('Cancelled')}>Cancelled</Button>
      </View>

      {filtered.map((task) => (
        <Card key={task.id} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{task.title}</Text>
              <Badge style={{ backgroundColor: statusColor[task.status] }}>{task.status}</Badge>
            </View>
            <Text style={styles.sub}>📅 {task.date}</Text>
            <Text style={styles.sub}>📍 {task.location}</Text>
          </Card.Content>
        </Card>
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    alignItems: 'center'
  },
  statBadge: {
    fontSize: 13,
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center'
  },
});

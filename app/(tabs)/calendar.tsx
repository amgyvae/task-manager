// calendar.tsx (добавим полный экран с календарем и модалкой задач)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useColorScheme,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

export default function CalendarScreen() {
  const theme = useColorScheme();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasksByDate, setTasksByDate] = useState<Record<string, any[]>>({});
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);

  useEffect(() => {
    loadMarkedDates();
  }, []);

  const loadMarkedDates = async () => {
    const stored = await AsyncStorage.getItem('tasks');
    if (!stored) return;
    const tasks = JSON.parse(stored);
    const dateMap: any = {};
    const taskMap: Record<string, any[]> = {};

    tasks.forEach((t: any) => {
      const dateStr = format(new Date(t.date), 'yyyy-MM-dd');
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { marked: true, dotColor: '#60a5fa' };
        taskMap[dateStr] = [];
      }
      taskMap[dateStr].push(t);
    });

    setMarkedDates(dateMap);
    setTasksByDate(taskMap);
  };

  const handleDayPress = (day: any) => {
    const date = day.dateString;
    setSelectedDate(date);
    setFilteredTasks(tasksByDate[date] || []);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          selectedDayBackgroundColor: '#ef4444',
          todayTextColor: '#ef4444',
          arrowColor: '#ef4444',
          monthTextColor: '#1f2937',
          textMonthFontWeight: 'bold',
        }}
        style={{ marginBottom: 12 }}
      />

      <Modal visible={!!selectedDate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🗓 Tasks on {selectedDate}</Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            {filteredTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks found.</Text>
            ) : (
              <FlatList
                data={filteredTasks}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                  <View style={styles.taskRow}>
                    <View
                      style={[styles.dot, {
                        backgroundColor:
                          item.status === 'Completed' ? '#10b981'
                          : item.status === 'In Progress' ? '#f59e0b'
                          : '#ef4444',
                      }]}
                    />
                    <View>
                      <Text style={styles.taskText}>{item.title}</Text>
                      <Text style={styles.taskStatus}>({item.status})</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 40,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
    color: '#1f2937',
  },
  taskStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
});

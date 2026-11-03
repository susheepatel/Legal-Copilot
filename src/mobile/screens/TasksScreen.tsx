import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CheckSquare, Square, Calendar, AlertCircle } from 'lucide-react-native';
import { useMobileData } from '../context/MobileDataContext';
import { Task } from '../../types';
import { theme } from '../theme';

export const TasksScreen: React.FC = () => {
  const { tasks, updateTaskStatus } = useMobileData();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter(t =>
    activeTab === 'pending' ? t.status !== 'completed' : t.status === 'completed'
  );

  const toggleTask = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskStatus(task.id, nextStatus);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isCompleted = item.status === 'completed';
    const isHighPriority = item.priority === 'urgent' || item.priority === 'high';

    return (
      <TouchableOpacity
        style={[styles.card, isCompleted && styles.cardCompleted]}
        onPress={() => toggleTask(item)}
      >
        <TouchableOpacity style={styles.checkBtn} onPress={() => toggleTask(item)}>
          {isCompleted ? (
            <CheckSquare size={20} color={theme.colors.success} />
          ) : (
            <Square size={20} color={theme.colors.textDim} />
          )}
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
            {item.title}
          </Text>

          <View style={styles.taskMeta}>
            <View style={styles.dateRow}>
              <Calendar size={12} color={theme.colors.textDim} />
              <Text style={styles.dateText}>Due: {item.due_date || 'No deadline'}</Text>
            </View>

            {item.priority && (
              <View
                style={[
                  styles.priorityBadge,
                  isHighPriority ? styles.priorityHigh : styles.priorityNormal,
                ]}
              >
                {isHighPriority && <AlertCircle size={10} color={theme.colors.danger} />}
                <Text
                  style={[
                    styles.priorityText,
                    isHighPriority && { color: theme.colors.danger },
                  ]}
                >
                  {item.priority.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending Tasks ({tasks.filter(t => t.status !== 'completed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {activeTab} procedural tasks.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  tabRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  cardCompleted: {
    opacity: 0.6,
  },
  checkBtn: {
    marginRight: 12,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: theme.colors.dangerBg,
  },
  priorityNormal: {
    backgroundColor: theme.colors.bg,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
});


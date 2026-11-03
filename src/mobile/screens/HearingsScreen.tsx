import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import { useMobileData } from '../context/MobileDataContext';
import { Hearing } from '../../types';
import { theme } from '../theme';

export const HearingsScreen: React.FC = () => {
  const { hearings, urgentHearings3Days, upcomingHearings7Days } = useMobileData();
  const [filter, setFilter] = useState<'all' | 'urgent' | '7days'>('all');

  const getDisplayedHearings = () => {
    if (filter === 'urgent') return urgentHearings3Days;
    if (filter === '7days') return upcomingHearings7Days;
    return hearings;
  };

  const renderHearing = ({ item }: { item: Hearing }) => {
    const isUrgent = urgentHearings3Days.some(u => u.id === item.id);

    return (
      <View style={[styles.card, isUrgent && styles.cardUrgent]}>
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Calendar size={13} color={theme.colors.primaryLight} />
            <Text style={styles.dateText}>
              {new Date(item.hearing_date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <AlertCircle size={11} color={theme.colors.danger} />
              <Text style={styles.urgentText}>Urgent Listing</Text>
            </View>
          )}
        </View>

        <Text style={styles.courtName}>{item.court_name}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Clock size={12} color={theme.colors.textDim} />
            <Text style={styles.detailText}>{item.court_room || 'Courtroom 4'}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={12} color={theme.colors.textDim} />
            <Text style={styles.detailText}>{item.judge_name || 'Hon’ble Bench'}</Text>
          </View>
        </View>

        <View style={styles.purposeBox}>
          <Text style={styles.purposeLabel}>Purpose of Listing:</Text>
          <Text style={styles.purposeText}>{item.purpose || 'Arguments on Application'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({hearings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'urgent' && styles.filterBtnActive]}
          onPress={() => setFilter('urgent')}
        >
          <Text style={[styles.filterText, filter === 'urgent' && styles.filterTextActive]}>
            🔥 Urgent 3 Days ({urgentHearings3Days.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === '7days' && styles.filterBtnActive]}
          onPress={() => setFilter('7days')}
        >
          <Text style={[styles.filterText, filter === '7days' && styles.filterTextActive]}>
            Next 7 Days ({upcomingHearings7Days.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getDisplayedHearings()}
        keyExtractor={item => item.id}
        renderItem={renderHearing}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No court hearings found for this filter.</Text>
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
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardUrgent: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  courtName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  purposeBox: {
    backgroundColor: theme.colors.bg,
    padding: 8,
    borderRadius: 8,
  },
  purposeLabel: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginBottom: 2,
  },
  purposeText: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: '600',
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


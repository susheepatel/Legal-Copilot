import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  IndianRupee, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  ShieldCheck 
} from 'lucide-react-native';
import { useMobileAuth } from '../context/MobileAuthContext';
import { useMobileData } from '../context/MobileDataContext';
import { theme } from '../theme';

interface Props {
  navigation: any;
}

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, firm } = useMobileAuth();
  const {
    activeCasesCount,
    urgentHearings3Days,
    pendingTasksCount,
    totalOutstandingDues,
    upcomingHearings7Days,
    activityLogs,
  } = useMobileData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Chamber Header Card */}
      <View style={styles.chamberCard}>
        <View style={styles.chamberHeaderRow}>
          <View>
            <Text style={styles.advocateName}>{user?.full_name || 'Advocate'}</Text>
            <Text style={styles.chamberTitle}>{firm?.name || 'Verma & Associates Legal Chambers'}</Text>
          </View>
          <View style={styles.barBadge}>
            <ShieldCheck size={14} color={theme.colors.primaryLight} />
            <Text style={styles.barText}>{user?.bar_enrollment_no || 'Bar Verified'}</Text>
          </View>
        </View>
        <Text style={styles.jurisdictionText}>High Court of Delhi • Supreme Court of India</Text>
      </View>

      {/* 4 Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Cases')}
        >
          <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Briefcase size={20} color={theme.colors.primaryLight} />
          </View>
          <Text style={styles.statValue}>{activeCasesCount}</Text>
          <Text style={styles.statLabel}>Active Dockets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Hearings')}
        >
          <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.dangerBg }]}>
            <Calendar size={20} color={theme.colors.danger} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.danger }]}>{urgentHearings3Days.length}</Text>
          <Text style={styles.statLabel}>Urgent Hearings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Tasks')}
        >
          <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.warningBg }]}>
            <CheckSquare size={20} color={theme.colors.warning} />
          </View>
          <Text style={styles.statValue}>{pendingTasksCount}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Billing')}
        >
          <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.successBg }]}>
            <IndianRupee size={20} color={theme.colors.success} />
          </View>
          <Text style={[styles.statValue, { fontSize: 16 }]}>
            ₹{(totalOutstandingDues / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.statLabel}>Outstanding Dues</Text>
        </TouchableOpacity>
      </View>

      {/* Quick AI Statutory Actions */}
      <View style={styles.aiBanner}>
        <View style={styles.aiHeader}>
          <Sparkles size={18} color="#ffffff" />
          <Text style={styles.aiTitle}>Statutory AI Assistant</Text>
        </View>
        <Text style={styles.aiSubtitle}>
          Real-time BNS 2023 transition cross-mapping, limitation calculation, and bail grounds drafting.
        </Text>
        <TouchableOpacity
          style={styles.aiActionBtn}
          onPress={() => navigation.navigate('AICopilot')}
        >
          <Text style={styles.aiActionText}>Launch Legal AI Copilot</Text>
          <ChevronRight size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Upcoming Hearings Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cause List Listings (Next 7 Days)</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Hearings')}>
          <Text style={styles.sectionLink}>View All ({upcomingHearings7Days.length})</Text>
        </TouchableOpacity>
      </View>

      {upcomingHearings7Days.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No court hearings scheduled for the next 7 days.</Text>
        </View>
      ) : (
        upcomingHearings7Days.slice(0, 3).map(hearing => (
          <View key={hearing.id} style={styles.hearingCard}>
            <View style={styles.hearingDateCol}>
              <Text style={styles.hearingDay}>
                {new Date(hearing.hearing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
              <Text style={styles.hearingTime}>{hearing.court_room || '10:30 AM'}</Text>
            </View>
            <View style={styles.hearingInfoCol}>
              <Text style={styles.hearingCourt}>{hearing.court_name}</Text>
              <Text style={styles.hearingBench}>{hearing.judge_name || 'Courtroom 4'}</Text>
              <Text style={styles.hearingPurpose}>{hearing.purpose || 'Arguments'}</Text>
            </View>
          </View>
        ))
      )}

      {/* Audit Log Stream */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chamber Activity Audit Trail</Text>
      </View>
      {activityLogs.slice(0, 3).map(log => (
        <View key={log.id} style={styles.logCard}>
          <Clock size={14} color={theme.colors.textDim} />
          <View style={styles.logContent}>
            <Text style={styles.logAction}>
              <Text style={styles.logUser}>{log.user_name}: </Text>
              {log.action}
            </Text>
            <Text style={styles.logTarget}>{log.target}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  chamberCard: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chamberHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  advocateName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  chamberTitle: {
    fontSize: 12,
    color: theme.colors.primaryLight,
    marginTop: 2,
    fontWeight: '600',
  },
  barBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  barText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  jurisdictionText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  aiBanner: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  aiSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 17,
    marginBottom: 12,
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  aiActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryLight,
  },
  emptyCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  hearingCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  hearingDateCol: {
    width: 75,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingRight: 8,
    justifyContent: 'center',
  },
  hearingDay: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  hearingTime: {
    fontSize: 11,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  hearingInfoCol: {
    flex: 1,
    paddingLeft: 10,
  },
  hearingCourt: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  hearingBench: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  hearingPurpose: {
    fontSize: 11,
    color: theme.colors.warning,
    fontWeight: '600',
    marginTop: 2,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 12,
    color: theme.colors.text,
  },
  logUser: {
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  logTarget: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginTop: 2,
  },
});


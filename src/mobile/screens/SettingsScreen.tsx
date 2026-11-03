import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { User, ShieldCheck, Database, Server, LogOut, CheckCircle2 } from 'lucide-react-native';
import { useMobileAuth } from '../context/MobileAuthContext';
import { theme } from '../theme';

export const SettingsScreen: React.FC = () => {
  const { user, firm, isSupabaseConnected, logout } = useMobileAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.charAt(0) : 'A'}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{user?.full_name || 'Advocate'}</Text>
            <Text style={styles.profileRole}>{user?.role === 'admin' ? 'Chamber Managing Partner' : 'Associate Counsel'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.barBadge}>
          <ShieldCheck size={14} color={theme.colors.primaryLight} />
          <Text style={styles.barText}>Bar Enrollment: {user?.bar_enrollment_no || 'D/1482/2008'}</Text>
        </View>
      </View>

      {/* Chamber Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Chamber Firm Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Firm Name:</Text>
          <Text style={styles.val}>{firm?.name || 'Verma & Associates Legal Chambers'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Chamber Location:</Text>
          <Text style={styles.val}>New Delhi, India</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jurisdiction:</Text>
          <Text style={styles.val}>Supreme Court &amp; High Court</Text>
        </View>
      </View>

      {/* Database & Cloud Connection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Database &amp; AI Engine Status</Text>

        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Database size={16} color={theme.colors.success} />
            <Text style={styles.statusLabel}>Supabase Cloud Database</Text>
          </View>
          <View style={styles.activePill}>
            <CheckCircle2 size={12} color={theme.colors.success} />
            <Text style={styles.activeText}>Connected</Text>
          </View>
        </View>

        <View style={[styles.statusRow, { marginTop: 10 }]}>
          <View style={styles.statusLeft}>
            <Server size={16} color={theme.colors.primaryLight} />
            <Text style={styles.statusLabel}>Local Network Server</Text>
          </View>
          <Text style={styles.ipText}>10.164.120.82:3000</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <LogOut size={16} color={theme.colors.danger} />
        <Text style={styles.logoutText}>Sign Out of Chamber</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  profileRole: {
    fontSize: 12,
    color: theme.colors.primaryLight,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 11,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  barBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  barText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  val: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    padding: 10,
    borderRadius: 8,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  ipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primaryLight,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
});


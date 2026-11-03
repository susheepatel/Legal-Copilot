import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { IndianRupee, CheckCircle2, Clock, FileText } from 'lucide-react-native';
import { useMobileData } from '../context/MobileDataContext';
import { Invoice } from '../../types';
import { theme } from '../theme';

export const BillingScreen: React.FC = () => {
  const { invoices, totalOutstandingDues, updateInvoiceStatus } = useMobileData();

  const totalCollected = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const renderInvoice = ({ item }: { item: Invoice }) => {
    const isPaid = item.status === 'paid';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.invNumberRow}>
            <FileText size={14} color={theme.colors.primaryLight} />
            <Text style={styles.invNumber}>{item.invoice_number || `INV-${item.id.slice(-6)}`}</Text>
          </View>

          <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}>
            <Text style={[styles.statusText, isPaid ? styles.statusTextPaid : styles.statusTextPending]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.clientName}>{item.client_name || 'Client Retainer'}</Text>
        {item.case_title ? (
          <Text style={styles.caseTitle} numberOfLines={1}>{item.case_title}</Text>
        ) : null}

        <View style={styles.amountRow}>
          <View>
            <Text style={styles.amountLabel}>Fee Amount</Text>
            <Text style={styles.amountValue}>
              ₹{Number(item.amount).toLocaleString('en-IN')}
            </Text>
          </View>

          {!isPaid && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => updateInvoiceStatus(item.id, 'paid')}
            >
              <CheckCircle2 size={13} color="#ffffff" />
              <Text style={styles.payBtnText}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Financial Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Outstanding Dues</Text>
          <Text style={[styles.summaryVal, { color: theme.colors.danger }]}>
            ₹{totalOutstandingDues.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Collected</Text>
          <Text style={[styles.summaryVal, { color: theme.colors.success }]}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={item => item.id}
        renderItem={renderInvoice}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No invoices or billing memos found.</Text>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 17,
    fontWeight: '800',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: theme.colors.successBg,
  },
  statusPending: {
    backgroundColor: theme.colors.warningBg,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPaid: {
    color: theme.colors.success,
  },
  statusTextPending: {
    color: theme.colors.warning,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  caseTitle: {
    fontSize: 11,
    color: theme.colors.textDim,
    marginTop: 2,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  amountLabel: {
    fontSize: 10,
    color: theme.colors.textDim,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 1,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
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


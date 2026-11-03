import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Search, Plus, X, Calendar, MapPin, Hash, User, ShieldCheck } from 'lucide-react-native';
import { useMobileData } from '../context/MobileDataContext';
import { Case } from '../../types';
import { theme } from '../theme';

export const CasesScreen: React.FC = () => {
  const { cases, addCase } = useMobileData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourt, setFilterCourt] = useState<'All' | 'High Court' | 'Supreme Court' | 'District Court'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Case Form state
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [cnrNumber, setCnrNumber] = useState('');
  const [courtName, setCourtName] = useState('High Court of Delhi');
  const [caseType, setCaseType] = useState('Criminal (BNS)');
  const [stage, setStage] = useState('Admission & Interim Relief');
  const [opposingCounsel, setOpposingCounsel] = useState('');

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.case_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterCourt === 'All') return matchesSearch;
    return matchesSearch && c.court_name.toLowerCase().includes(filterCourt.toLowerCase());
  });

  const handleCreateCase = async () => {
    if (!caseTitle.trim() || !caseNumber.trim()) return;

    await addCase({
      firm_id: 'firm-delhi-001',
      client_id: 'client-001',
      case_title: caseTitle.trim(),
      case_number: caseNumber.trim(),
      court_name: courtName,
      case_type: caseType,
      status: 'active',
      opposing_counsel: opposingCounsel.trim() || 'Standing Counsel for State',
      assigned_lawyer_name: 'Adv. Rajesh Verma',
      filing_date: new Date().toISOString().split('T')[0],
      next_hearing_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });

    // Reset & close
    setCaseTitle('');
    setCaseNumber('');
    setCnrNumber('');
    setIsModalOpen(false);
  };

  const renderCaseCard = ({ item }: { item: Case }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.courtBadge}>{item.case_type}</Text>
      </View>

      <Text style={styles.cardTitle}>{item.case_title}</Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Hash size={13} color={theme.colors.textDim} />
          <Text style={styles.detailText}>{item.case_number}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={13} color={theme.colors.textDim} />
          <Text style={styles.detailText}>{item.court_name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Calendar size={13} color={theme.colors.primaryLight} />
          <Text style={[styles.detailText, { color: theme.colors.primaryLight, fontWeight: '600' }]}>
            Next Hearing: {item.next_hearing_date || 'Awaiting Listing'}
          </Text>
        </View>

        {item.opposing_counsel && (
          <View style={styles.detailRow}>
            <User size={13} color={theme.colors.textDim} />
            <Text style={styles.detailText}>Opposing: {item.opposing_counsel}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={theme.colors.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, case number, CNR..."
            placeholderTextColor={theme.colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {(['All', 'High Court', 'Supreme Court', 'District Court'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filterCourt === tab && styles.filterChipActive]}
              onPress={() => setFilterCourt(tab)}
            >
              <Text style={[styles.filterChipText, filterCourt === tab && styles.filterChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Case List */}
      <FlatList
        data={filteredCases}
        keyExtractor={item => item.id}
        renderItem={renderCaseCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching litigation dockets found.</Text>
          </View>
        }
      />

      {/* Floating Add Case Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Case Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File New Court Docket</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Case Title (Parties) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. State of NCT Delhi v. Rahul Anand"
                  placeholderTextColor={theme.colors.textDim}
                  value={caseTitle}
                  onChangeText={setCaseTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Case Number / Petition No. *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. CRL.M.C. 4280/2025"
                  placeholderTextColor={theme.colors.textDim}
                  value={caseNumber}
                  onChangeText={setCaseNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CNR Number (16-Digit E-Courts Number)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. DLHC010042802025"
                  placeholderTextColor={theme.colors.textDim}
                  value={cnrNumber}
                  onChangeText={setCnrNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Court / Forum</Text>
                <TextInput
                  style={styles.modalInput}
                  value={courtName}
                  onChangeText={setCourtName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Practice Area / Category</Text>
                <TextInput
                  style={styles.modalInput}
                  value={caseType}
                  onChangeText={setCaseType}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Procedural Stage</Text>
                <TextInput
                  style={styles.modalInput}
                  value={stage}
                  onChangeText={setStage}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Opposing Counsel / Standing Counsel</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Adv. K.S. Rathore (For Respondent)"
                  placeholderTextColor={theme.colors.textDim}
                  value={opposingCounsel}
                  onChangeText={setOpposingCounsel}
                />
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateCase}>
                <Text style={styles.modalSubmitBtnText}>Register Case in Chamber &amp; Supabase</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: theme.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: theme.colors.text,
    fontSize: 13,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  courtBadge: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalScroll: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: theme.colors.text,
    fontSize: 13,
  },
  modalSubmitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Search, Phone, Mail, Building, User, CheckCircle, Plus } from 'lucide-react-native';
import { useMobileData } from '../context/MobileDataContext';
import { Client } from '../../types';
import { theme } from '../theme';

export const ClientsScreen: React.FC = () => {
  const { clients } = useMobileData();
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase())) ||
    c.phone.includes(search)
  );

  const renderClient = ({ item }: { item: Client }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.clientName}>{item.name}</Text>
            {item.company_name && (
              <View style={styles.companyRow}>
                <Building size={11} color={theme.colors.textDim} />
                <Text style={styles.companyText}>{item.company_name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.kycBadge}>
          <CheckCircle size={11} color={theme.colors.success} />
          <Text style={styles.kycText}>KYC Verified</Text>
        </View>
      </View>

      <View style={styles.contactRow}>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
        >
          <Phone size={13} color={theme.colors.primaryLight} />
          <Text style={styles.contactText}>{item.phone}</Text>
        </TouchableOpacity>

        {item.email ? (
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL(`mailto:${item.email}`)}
          >
            <Mail size={13} color={theme.colors.textMuted} />
            <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {item.notes ? (
        <Text style={styles.notesText} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={theme.colors.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients by name, company, phone..."
            placeholderTextColor={theme.colors.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id}
        renderItem={renderClient}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No matching client records found.</Text>
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
  searchSection: {
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  companyText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kycText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  notesText: {
    fontSize: 11,
    color: theme.colors.textDim,
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    marginTop: 4,
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


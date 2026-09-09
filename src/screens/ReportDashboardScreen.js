import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const MOCK_REPORTS = [
  { id: '1', title: 'Complete Blood Count (CBC)', date: 'Sept 08, 2026', status: 'Normal', doctor: 'Dr. A. Sharma' },
  { id: '2', title: 'Lipid Panel', date: 'Aug 24, 2026', status: 'Requires Review', doctor: 'Dr. K. Patel' },
  { id: '3', title: 'Cardiology ECG Trace', date: 'July 15, 2026', status: 'Normal', doctor: 'Dr. S. Jenkins' },
];

export default function ReportDashboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Reports</Text>
        <Text style={styles.subtitle}>Verified medical records & diagnostics</Text>
      </View>

      <FlatList
        data={MOCK_REPORTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.badge, item.status === 'Normal' ? styles.badgeNormal : styles.badgeReview]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardInfo}>📅 {item.date}</Text>
              <Text style={styles.cardInfo}>👨‍⚕️ {item.doctor}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  header: { marginBottom: 20, marginTop: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  list: { gap: 12 },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeNormal: { backgroundColor: 'rgba(0, 191, 166, 0.2)' },
  badgeReview: { backgroundColor: 'rgba(255, 149, 0, 0.2)' },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { fontSize: 12, color: colors.textSecondary },
});

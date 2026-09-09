import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, glassmorphic } from '../utils/colors';

export default function ScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setLastResult({
        title: 'Prescription: Amoxicillin 500mg',
        dosage: '1 capsule three times daily',
        doctor: 'Dr. Sarah Jenkins, MD',
        date: new Date().toLocaleDateString(),
      });
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Document Scanner</Text>
        <Text style={styles.subtitle}>Scan prescriptions, lab reports, and vitals</Text>
      </View>

      <View style={styles.viewfinder}>
        <Feather name="camera" size={48} color={colors.primary} />
        <Text style={styles.viewfinderText}>
          {scanning ? 'Analyzing document...' : 'Position document within the frame'}
        </Text>
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={handleScan} disabled={scanning}>
        <Feather name={scanning ? 'loader' : 'maximize'} size={20} color="#000" />
        <Text style={styles.scanBtnText}>{scanning ? 'Processing...' : 'Capture & Analyze'}</Text>
      </TouchableOpacity>

      {lastResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Result</Text>
          <Text style={styles.resultItem}>📋 {lastResult.title}</Text>
          <Text style={styles.resultItem}>💊 Dosage: {lastResult.dosage}</Text>
          <Text style={styles.resultItem}>👨‍⚕️ Prescriber: {lastResult.doctor}</Text>
          <Text style={styles.resultItem}>📅 Scanned: {lastResult.date}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, alignItems: 'center' },
  header: { width: '100%', marginBottom: 24, marginTop: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  viewfinder: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0, 191, 166, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  viewfinderText: { color: colors.textSecondary, marginTop: 12, fontSize: 14 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  resultCard: {
    width: '100%',
    marginTop: 24,
    padding: 18,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  resultItem: { fontSize: 14, color: colors.textPrimary, marginBottom: 6 },
});

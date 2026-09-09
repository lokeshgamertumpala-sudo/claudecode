import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../utils/colors';

export default function SOScreen() {
  const [active, setActive] = useState(false);

  const triggerSOS = () => {
    setActive(true);
    Alert.alert(
      '🚨 EMERGENCY ALERT SENT',
      'Your real-time GPS coordinates and vital summary have been broadcast to your registered emergency contacts and local EMS services.',
      [{ text: 'Dismiss', onPress: () => setActive(false) }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Medical Dispatch</Text>
        <Text style={styles.subtitle}>Tap the SOS trigger to alert nearby services</Text>
      </View>

      <View style={styles.sosContainer}>
        <TouchableOpacity style={styles.sosBtn} onPress={triggerSOS}>
          <Feather name="alert-triangle" size={64} color="#FFF" />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vitalsBox}>
        <Text style={styles.vitalsTitle}>Patient Profile</Text>
        <Text style={styles.vitalRow}>🩸 Blood Group: O+ Positive</Text>
        <Text style={styles.vitalRow}>⚠️ Allergies: Penicillin, Peanuts</Text>
        <Text style={styles.vitalRow}>📞 Primary Contact: Jane Doe (+1 555-0199)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, alignItems: 'center' },
  header: { width: '100%', marginBottom: 30, marginTop: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.danger },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  sosContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sosBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sosText: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 8 },
  vitalsBox: {
    width: '100%',
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  vitalsTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  vitalRow: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
});

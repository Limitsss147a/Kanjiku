import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getQueueStats, cleanupOldQueueEntries } from '../services/database';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const s = await getQueueStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCleanup() {
    try {
      const deleted = await cleanupOldQueueEntries(48);
      Alert.alert('Sukses', `Dibersihkan: ${deleted} entri queue lama.`);
      loadStats();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pengaturan Widget & Sistem</Text>

      {stats && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Antrean (Queue)</Text>
          <Text style={styles.item}>Pending: {stats.pending}</Text>
          <Text style={styles.item}>Ditampilkan: {stats.displayed}</Text>
          <Text style={styles.item}>Dilewati: {stats.skipped}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cleanupButton} onPress={handleCleanup}>
          <Text style={styles.cleanupText}>Bersihkan Entri Queue Usang (&#62;48 Jam)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7EE',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 12,
  },
  item: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  actions: {
    marginTop: 10,
  },
  cleanupButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8452B',
    alignItems: 'center',
  },
  cleanupText: {
    color: '#D8452B',
    fontSize: 14,
    fontWeight: '600',
  },
});

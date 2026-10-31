import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { initDatabase, getRandomKanjiForWidget, getQueueStats } from '../services/database';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [kanji, setKanji] = useState<any>(null);
  const [queueStats, setQueueStats] = useState<{ pending: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await initDatabase();
      const [randomKanji, stats] = await Promise.all([
        getRandomKanjiForWidget(1),
        getQueueStats(),
      ]);
      setKanji(randomKanji[0] || null);
      setQueueStats(stats);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D8452B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Queue Stats */}
      {queueStats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsText}>
            Queue: {queueStats.pending} pending
          </Text>
        </View>
      )}

      {/* Random Kanji Card */}
      {kanji && (
        <TouchableOpacity
          style={styles.kanjiCard}
          onPress={() => navigation.navigate('KanjiDetail', { kanjiId: kanji.id })}
        >
          <Text style={styles.kanjiChar}>{kanji.character}</Text>
          <Text style={styles.kanjiMeaning}>{kanji.meaning}</Text>
          <Text style={styles.kanjiLevel}>N{kanji.jlpt}</Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Review')}
        >
          <Text style={styles.buttonText}>Mulai Review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={loadData}
        >
          <Text style={styles.buttonTextSecondary}>Kanji Baru</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF7EE',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FBF7EE',
  },
  statsCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  kanjiCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kanjiChar: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  kanjiMeaning: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  kanjiLevel: {
    fontSize: 14,
    color: '#D8452B',
    marginTop: 8,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: '#D8452B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8452B',
  },
  buttonTextSecondary: {
    color: '#D8452B',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#D8452B',
    fontSize: 16,
    textAlign: 'center',
  },
});

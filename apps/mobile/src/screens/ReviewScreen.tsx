import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getNextQueueEntry, getKanjiById, markQueueEntryDisplayed } from '../services/database';
import { calculateNextReview, Grade, SRSGrade } from '../services/srs';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

export default function ReviewScreen({ navigation }: Props) {
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [kanji, setKanji] = useState<any>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    loadNextCard();
  }, []);

  async function loadNextCard() {
    setLoading(true);
    setRevealed(false);
    try {
      const entry = await getNextQueueEntry();
      if (!entry) {
        setCurrentEntry(null);
        setKanji(null);
        return;
      }
      setCurrentEntry(entry);
      const k = await getKanjiById(entry.kanji_id);
      setKanji(k);
    } catch (err) {
      console.error('Failed to load review card:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrade(grade: number) {
    if (!currentEntry || !kanji) return;

    try {
      // Calculate SM-2 SRS updates (simplified for now)
      const now = Date.now();
      const srsResult = calculateNextReview(
        {
          repetitions: 0,
          interval: 1,
          ease: 2.5,
        } as any,
        grade as SRSGrade,
        now
      );

      // Mark queue item as displayed
      await markQueueEntryDisplayed(currentEntry.id);

      setReviewedCount((prev) => prev + 1);

      // Load next card
      loadNextCard();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Memuat kartu...</Text>
      </View>
    );
  }

  if (!kanji) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Selesai!</Text>
          <Text style={styles.emptySubtitle}>
            Tidak ada kanji yang perlu direview saat ini.
          </Text>
          <Text style={styles.statsText}>
            Total direview sesi ini: {reviewedCount} kanji
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.character}>{kanji.character}</Text>

        {revealed ? (
          <View style={styles.details}>
            <Text style={styles.meaning}>{kanji.meaning}</Text>
            <Text style={styles.readings}>
              Onyomi: {kanji.readings_on ? kanji.readings_on.join(', ') : '-'}
            </Text>
            <Text style={styles.readings}>
              Kunyomi: {kanji.readings_kun ? kanji.readings_kun.join(', ') : '-'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => setRevealed(true)}
          >
            <Text style={styles.revealText}>Tampilkan Jawaban</Text>
          </TouchableOpacity>
        )}
      </View>

      {revealed && (
        <View style={styles.grades}>
          <TouchableOpacity
            style={[styles.gradeButton, { backgroundColor: '#E74C3C' }]}
            onPress={() => handleGrade(Grade.AGAIN)}
          >
            <Text style={styles.gradeText}>Lupa (1)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gradeButton, { backgroundColor: '#E67E22' }]}
            onPress={() => handleGrade(Grade.HARD)}
          >
            <Text style={styles.gradeText}>Sulit (2)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gradeButton, { backgroundColor: '#2ECC71' }]}
            onPress={() => handleGrade(Grade.GOOD)}
          >
            <Text style={styles.gradeText}>Pas (3)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gradeButton, { backgroundColor: '#3498DB' }]}
            onPress={() => handleGrade(Grade.EASY)}
          >
            <Text style={styles.gradeText}>Mudah (4)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7EE',
    padding: 20,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 300,
    justifyContent: 'center',
  },
  character: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 24,
  },
  revealButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  revealText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    alignItems: 'center',
  },
  meaning: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 12,
    textAlign: 'center',
  },
  readings: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  grades: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  gradeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#D8452B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

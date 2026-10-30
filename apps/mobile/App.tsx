import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { initDatabase, getRandomKanjiForWidget } from './src/services/database';
import { Kanji } from './src/types/kanjiku';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [kanji, setKanji] = useState<Kanji | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        await initDatabase();
        const items = await getRandomKanjiForWidget(1);
        if (items && items.length > 0) {
          setKanji(items[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load kanji');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.subtext}>Loading Kanjiku DB...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kanji}>{kanji?.character || '字'}</Text>
      <Text style={styles.meaning}>{kanji?.meaning || 'Meaning'}</Text>
      <Text style={styles.subtext}>JLPT N{kanji?.jlpt} • Strokes: {kanji?.strokes}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf6f1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  kanji: {
    fontSize: 96,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  meaning: {
    fontSize: 22,
    color: '#333333',
    marginTop: 16,
    textTransform: 'capitalize',
  },
  subtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
  },
});
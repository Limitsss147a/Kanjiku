import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getKanjiById } from '../services/database';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'KanjiDetail'>;

export default function KanjiDetailScreen({ route, navigation }: Props) {
  const { kanjiId } = route.params;
  const [kanji, setKanji] = React.useState<any>(null);

  React.useEffect(() => {
    loadKanji();
  }, [kanjiId]);

  async function loadKanji() {
    try {
      const result = await getKanjiById(kanjiId);
      setKanji(result);
    } catch (err) {
      console.error('Failed to load kanji:', err);
    }
  }

  if (!kanji) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.character}>{kanji.character}</Text>
        <Text style={styles.level}>JLPT N{kanji.jlpt}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Arti (ID)</Text>
        <Text style={styles.value}>{kanji.meaning}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Onyomi</Text>
        <Text style={styles.value}>{kanji.readings_on ? kanji.readings_on.join(', ') : '-'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kunyomi</Text>
        <Text style={styles.value}>{kanji.readings_kun ? kanji.readings_kun.join(', ') : '-'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Jumlah Goresan</Text>
        <Text style={styles.value}>{kanji.strokes} goresan</Text>
      </View>

      {kanji.examples && kanji.examples.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Contoh Kata</Text>
          {kanji.examples.slice(0, 3).map((ex: any, i: number) => (
            <Text key={i} style={styles.example}>
              {ex.word} ({ex.reading}) — {ex.meaning}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Review')}
        >
          <Text style={styles.buttonText}>Mulai Review Kartu Ini</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonTextSecondary}>Tutup</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF7EE',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  character: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  level: {
    fontSize: 16,
    color: '#D8452B',
    fontWeight: '600',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#2D2D2D',
    lineHeight: 24,
  },
  example: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginTop: 4,
  },
  actions: {
    marginTop: 32,
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
});

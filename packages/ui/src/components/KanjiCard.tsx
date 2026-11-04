import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface KanjiCardProps {
  character: string;
  reading?: string;
  meaning?: string;
  jlptLevel?: number;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function KanjiCard({
  character,
  reading,
  meaning,
  jlptLevel,
  size = 'medium',
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: KanjiCardProps) {
  const theme = useTheme();

  const sizeMap = {
    small: { char: 48, padding: theme.spacing.sm },
    medium: { char: 72, padding: theme.spacing.md },
    large: { char: 96, padding: theme.spacing.lg },
  };

  const sizeCfg = sizeMap[size];

  const jlptColor = jlptLevel
    ? {
        5: theme.colors.accent,
        4: '#2196F3',
        3: '#FF9800',
        2: '#F44336',
        1: '#9C27B0',
      }[jlptLevel]
    : theme.colors.accent;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: sizeCfg.padding,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
    },
    character: {
      fontSize: sizeCfg.char,
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: sizeCfg.char * 1.1,
    },
    reading: {
      fontSize: size === 'large' ? 16 : 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    meaning: {
      fontSize: size === 'large' ? 14 : 11,
      color: jlptColor,
      marginTop: theme.spacing.xs,
      fontWeight: '500',
    },
    badge: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      backgroundColor: jlptColor,
      borderRadius: theme.radius.full,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
  });

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || `${character}, ${reading || ''} ${meaning || ''}`
      }
      accessibilityHint={
        accessibilityHint || `JLPT Level N${jlptLevel || '5'}`
      }
      accessibilityState={{ disabled }}
      android_ripple={{ color: theme.colors.accent, radius: 40 }}
    >
      <Text style={styles.character}>{character}</Text>
      {reading && <Text style={styles.reading}>{reading}</Text>}
      {meaning && <Text style={styles.meaning}>{meaning}</Text>}
      {jlptLevel && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>N{jlptLevel}</Text>
        </View>
      )}
    </Pressable>
  );
}

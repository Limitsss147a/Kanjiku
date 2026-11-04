import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { spacing, typography, radius } from '../tokens';

interface SeigaihaHeaderProps {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  waveColor?: string;
}

export const SeigaihaHeader: React.FC<SeigaihaHeaderProps> = ({
  title,
  subtitle,
  backgroundColor,
  waveColor,
}) => {
  const { colors } = useTheme();
  const bgColor = backgroundColor || colors.accent;
  const wColor = waveColor || `${colors.accent}40`;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: bgColor,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      overflow: 'hidden',
    },
    waveContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.15,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    wave: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: wColor,
      marginHorizontal: -20,
    },
    content: {
      position: 'relative',
      zIndex: 1,
    },
    title: {
      fontSize: typography.title.size,
      fontWeight: '700',
      color: colors.surface,
      marginBottom: subtitle ? spacing.xs : 0,
    },
    subtitle: {
      fontSize: typography.bodySmall.size,
      color: `${colors.surface}cc`,
      fontWeight: '400',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.wave} />
        ))}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

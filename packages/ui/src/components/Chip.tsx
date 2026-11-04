import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import { radius, typography, spacing } from '../tokens';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  removable = false,
  onRemove,
  variant = 'filled',
  size = 'md',
}) => {
  const { colors } = useTheme();

  const sizeMap = {
    sm: { px: spacing.sm, py: spacing.xs, fontSize: typography.label.size },
    md: { px: spacing.md, py: spacing.sm, fontSize: typography.bodySmall.size },
  };

  const { px, py, fontSize } = sizeMap[size];

  const bgColor = selected ? colors.accent : (variant === 'outlined' ? colors.surface : colors.divider);
  const textColor = selected ? colors.surface : colors.text;
  const borderColor = selected ? colors.accent : colors.border;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: px,
      paddingVertical: py,
      borderRadius: radius.full,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: borderColor,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    text: {
      fontSize,
      fontWeight: '500',
      color: textColor,
    },
    closeIcon: {
      fontSize: fontSize + 2,
      fontWeight: '700',
      color: textColor,
      marginLeft: spacing.xs,
    },
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.text}>{label}</Text>
      {removable && (
        <Pressable onPress={onRemove} style={{ padding: spacing.xs }}>
          <Text style={styles.closeIcon}>×</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { radius, motion, typography, spacing } from '../tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const { colors } = useTheme();

  const sizeMap = {
    sm: { px: spacing.sm, py: spacing.xs, fontSize: typography.label.size },
    md: { px: spacing.md, py: spacing.sm, fontSize: typography.body.size },
    lg: { px: spacing.lg, py: spacing.md, fontSize: typography.body.size },
  };

  const variantStyle = {
    primary: {
      bg: colors.accent,
      text: colors.surface,
      border: 'transparent',
    },
    secondary: {
      bg: colors.surface,
      text: colors.text,
      border: colors.border,
    },
    ghost: {
      bg: 'transparent',
      text: colors.accent,
      border: 'transparent',
    },
  };

  const { px, py, fontSize } = sizeMap[size];
  const { bg, text, border } = variantStyle[variant];

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: px,
      paddingVertical: py,
      borderRadius: radius.md,
      borderWidth: variant === 'secondary' ? 1 : 0,
      borderColor: border,
      backgroundColor: bg,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
    },
    text: {
      fontSize,
      fontWeight: '600',
      color: text,
      letterSpacing: 0.5,
    },
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={styles.text}>{loading ? '…' : label}</Text>
    </Pressable>
  );
}

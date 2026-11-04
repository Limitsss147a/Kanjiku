import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface EnsoRingProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export const EnsoRing: React.FC<EnsoRingProps> = ({
  size = 120,
  strokeWidth = 3,
  color,
  children,
}) => {
  const { colors } = useTheme();
  const ringColor = color || colors.accent;

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: ringColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopColor: 'transparent',
      borderRightColor: 'transparent',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

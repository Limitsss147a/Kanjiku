import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme';
import { radius, spacing } from '../tokens';

interface HankoStampProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  color?: string;
}

export const HankoStamp: React.FC<HankoStampProps> = ({
  text = '認',
  size = 'md',
  variant = 'solid',
  color,
}) => {
  const { colors } = useTheme();

  const sizeMap = {
    sm: { dim: 64, textSize: 24 },
    md: { dim: 96, textSize: 36 },
    lg: { dim: 128, textSize: 48 },
  };

  const { dim, textSize } = sizeMap[size];
  const stampColor = color || colors.accent;

  const styles = StyleSheet.create({
    container: {
      width: dim,
      height: dim,
      borderRadius: radius.full,
      borderWidth: variant === 'outline' ? 3 : 0,
      borderColor: stampColor,
      backgroundColor: variant === 'solid' ? stampColor : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ rotate: '-15deg' }],
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    text: {
      fontSize: textSize,
      fontWeight: '700',
      color: variant === 'solid' ? colors.surface : stampColor,
      letterSpacing: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

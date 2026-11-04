import React, { useEffect } from 'react';
import { Modal as RNModal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { radius, spacing, typography } from '../tokens';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  fullWidth?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  scrollable = false,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable ? { showsVerticalScrollIndicator: false } : {};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 0,
    },
    dialog: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      width: fullWidth ? '100%' : '85%',
      maxWidth: 480,
      marginHorizontal: 'auto',
      marginTop: 'auto',
      marginBottom: 'auto',
      maxHeight: '85%',
    },
    header: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: typography.title.size,
      fontWeight: '600',
      color: colors.text,
    },
    closeBtn: {
      padding: spacing.xs,
      borderRadius: radius.full,
      marginLeft: spacing.sm,
    },
    closeText: {
      fontSize: 24,
      lineHeight: 24,
      fontWeight: '300',
      color: colors.textSecondary,
    },
    content: {
      padding: spacing.md,
      flex: 1,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={onClose}
        >
          <View style={styles.dialog}>
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Pressable style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
            )}
            <ContentWrapper style={styles.content} {...contentProps}>
              {children}
            </ContentWrapper>
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </Pressable>
      </View>
    </RNModal>
  );
};

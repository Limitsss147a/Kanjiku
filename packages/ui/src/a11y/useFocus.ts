import { useState, useRef, useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export interface FocusState {
  isFocused: boolean;
  focusProps: {
    accessibilityRole?: 'button' | 'link' | 'image' | 'text';
    accessibilityState: { focused: boolean };
    onFocus: () => void;
    onBlur: () => void;
  };
}

/**
 * Hook untuk manage focus state accessibility
 * Usage: const { isFocused, focusProps } = useFocusState();
 * <Pressable {...focusProps} style={isFocused && styles.focused} />
 */
export function useFocusState(): FocusState {
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const focusProps = {
    accessibilityState: { focused: isFocused },
    onFocus,
    onBlur,
  };

  return { isFocused, focusProps };
}

/**
 * Hook to announce to screen reader
 * Usage: const announce = useAnnounce();
 * announce('Item added to favorites');
 */
export function useAnnounce() {
  return useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
}

/**
 * Hook to check screen reader status
 */
export function useScreenReader() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useState(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    return () => subscription.remove();
  });

  return { isScreenReaderEnabled };
}

/**
 * Hook to set focus to element
 */
export function useSetFocus<T extends { focus: () => void }>() {
  const ref = useRef<T>(null);

  const setFocus = useCallback(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return { ref, setFocus };
}

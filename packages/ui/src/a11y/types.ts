// Accessibility utilities for React Native
// WCAG 2.1 AA compliance helpers

import { ViewStyle, TextStyle } from 'react-native';

export interface A11yProps {
  /** Screen reader label (required for interactive elements) */
  accessibilityLabel?: string;
  /** Additional context for screen readers */
  accessibilityHint?: string;
  /** Role hint for assistive tech */
  accessibilityRole?: 'button' | 'link' | 'image' | 'text' | 'header' | 'footer';
  /** Element state for screen readers */
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  /** Custom accessibility actions */
  accessibilityActions?: Array<{
    name: string;
    label: string;
  }>;
}

// Minimum touch target (44x44pt per WCAG)
export const MIN_TOUCH_SIZE = 44;

// Focus indicator style (RN uses borderWidth for focus)
export const focusIndicator: ViewStyle = {
  borderWidth: 2,
  borderColor: '#0066CC',
};

// High contrast text style
export const highContrastText: TextStyle = {
  // Already handled by tokens (4.5:1+ ratio)
};

// Skip link (for web, RN uses accessibility hint instead)
export const skipLinkStyle: ViewStyle = {
  position: 'absolute',
  left: -9999,
};

// A11yLiveRegion for dynamic content updates
export const liveRegionConfig = {
  ariaLive: 'polite' as const,
  ariaAtomic: true,
};
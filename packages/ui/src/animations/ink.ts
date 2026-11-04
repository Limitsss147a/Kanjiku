// Ink spread animation (360ms total)
// Base: 100ms expand, 200ms fade, 60ms settle
export const inkSpread = {
  expand: {
    duration: 100,
    easing: 'ease-out',
    transform: 'scale(0.8) -> scale(1.0)',
  },
  fade: {
    duration: 200,
    easing: 'ease-in-out',
    opacity: '1.0 -> 0.0',
  },
  settle: {
    duration: 60,
    easing: 'ease-out',
    transform: 'scale(1.0) -> scale(0.95)',
  },
};

// Export for React Native Animated API
export type InkAnimation = typeof inkSpread;
export const inkSpreadConfig = {
  totalDuration: 360,
  useNativeDriver: true,
};

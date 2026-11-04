// Tap scale animation (120ms press feedback)
export const tapScale = {
  pressIn: {
    duration: 60,
    easing: 'ease-out',
    scale: 0.95,
  },
  pressOut: {
    duration: 60,
    easing: 'ease-in-out',
    scale: 1.0,
  },
};

export const tapScaleConfig = {
  totalDuration: 120,
  useNativeDriver: true,
};

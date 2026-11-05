import React from 'react';
import { NavigationContainer, LinkingOptions, createNativeStackNavigator } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@kanjiku/ui';
import { Linking } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import KanjiDetailScreen from '../screens/KanjiDetailScreen';
import ReviewScreen from '../screens/ReviewScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  KanjiDetail: { kanjiId: string; character?: string };
  Review: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['kanjiku://'],
  config: {
    screens: {
      KanjiDetail: {
        path: 'kanji/:character',
        parse: {
          character: (character: string) => character,
        },
      },
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url;
  },
};

export default function AppNavigator() {
  const { theme, colors } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style={theme === 'sumi' ? 'light' : 'dark'} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: colors.bg,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Kanjiku' }}
          />
          <Stack.Screen
            name="KanjiDetail"
            component={KanjiDetailScreen}
            options={{ title: 'Detail Kanji' }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ title: 'Review SRS' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Pengaturan' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
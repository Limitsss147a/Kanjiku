# Kanjiku

Japanese kanji learning app with home screen widgets for passive learning.

## Project Structure

```
kanjiku/
├── apps/
│   ├── mobile/           # React Native (Expo) app
│   └── widget-android/   # Kotlin widget module (Android)
├── packages/
│   ├── shared/           # Shared types, constants, SRS logic
│   ├── data-pipeline/    # ETL scripts (kanji data processing)
│   └── ui/               # Design tokens, theme
```

## Tech Stack

- **Mobile App**: React Native (Expo), TypeScript
- **Widget**: Kotlin, Jetpack Glance, WorkManager
- **Data**: SQLite, kanjiapi.dev, KanjiVG, Kanji alive

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
cd apps/mobile
npm start
```

## License

Code: MIT  
Data: CC BY-SA 4.0 (KANJIDIC, KanjiVG) / CC BY 4.0 (Kanji alive)
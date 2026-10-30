# Kanjiku

> Aplikasi belajar kanji pasif berbasis home screen widget. Lihat kanji baru setiap 15 menit tanpa effort.

**Fitur:**
- 📱 Home screen widget (iOS & Android) dengan kanji otomatis
- 🧠 Spaced Repetition (SM-2 algorithm)
- 🎨 7 traditional Japanese Wagara patterns sebagai background
- 💾 SQLite offline-first, 612 kanji (N5-N3)
- 🌐 Deep linking untuk quick review
- 🔔 Scheduled notifications
- 🚀 Zero internet required

---

## 📋 Project Structure

```
kanjiku/
├── apps/
│   ├── mobile/           # React Native (Expo) — main app
│   └── widget-android/   # Kotlin/Glance — Android widget
├── packages/
│   ├── shared/           # Types, SRS logic, constants
│   ├── data-pipeline/    # ETL: kanji, SVG, fonts, DB build
│   └── ui/               # Wagara patterns, design tokens
├── docs/                 # Development docs (local only)
├── .github/workflows/    # CI/CD (lint, test, build)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Mobile App** | React Native 0.88 (Expo 58) |
| **Widget** | Kotlin + Jetpack Glance 1.1 + WorkManager 15-min |
| **Data** | SQLite (sql.js for ETL, native on device) |
| **Package** | TypeScript 5.6, monorepo (npm workspaces) |
| **CI** | GitHub Actions (lint, test, build-android) |

---

## 📦 Data Sources

| Source | License | Use |
|--------|---------|-----|
| **kanjiapi.dev** / kanji-data npm | CC BY-SA 2.0 | Kanji meanings, readings, strokes |
| **KanjiVG** | CC BY-SA 3.0 | Stroke order SVG (optional) |
| **Kanji alive** | CC BY 4.0 | Audio pronunciation (optional) |
| **Noto Sans CJK** | OFL 1.1 | Embedded font subset |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- iOS 13+ / Android 6+ (runtime)
- Xcode (iOS) or Android Studio (Android)
- `pyftsubset` for font subsetting: `pip install fonttools`

### Install & Run

```bash
# Clone repo
git clone https://github.com/Limitsss147a/Kanjiku.git
cd Kanjiku

# Install root dependencies
npm install

# Start Expo dev server (web preview)
cd apps/mobile
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Or web (limited):
npm run web
```

### Build Database & Assets

```bash
# In packages/data-pipeline
cd ../../packages/data-pipeline
npm run pipeline
# Outputs:
# - output/kanjiku.db (SQLite, 224 KB)
# - output/kanji-raw.json (612 kanji)
# - output/fonts-manifest.json
```

---

## 📱 Features (Current)

### ✅ Implemented (Fase 0-1)
- [x] 612 kanji database (N5-N3)
- [x] SQLite ETL pipeline
- [x] Mobile app shell (Expo)
- [x] Basic widget layout (Kotlin/Glance)
- [x] 7 Wagara UI patterns
- [x] SRS SM-2 algorithm stub
- [x] Database integration to mobile app

### ⏳ In Progress (Fase 2)
- [ ] Widget queue system (48h rolling)
- [ ] SRS review UI
- [ ] Deep linking
- [ ] Android widget receiver setup

### 📋 Planned (Fase 3-4)
- [ ] Notifications (scheduled reviews)
- [ ] iOS WidgetKit (post-MVP)
- [ ] FSRS v2 migration
- [ ] Statistics dashboard
- [ ] User sync (Firebase?)
- [ ] Play Store release

---

## 🔧 Development

### Project Setup

```bash
# Install all packages (root workspaces)
npm install

# Lint & typecheck
npm run typecheck
npm run lint

# Run tests (root)
npm test

# CI pipeline (locally)
npm run ci
```

### Key Files

| File | Purpose |
|------|---------|
| `packages/data-pipeline/src/fetch-kanji-fallback.ts` | Fetch 612 kanji from npm package |
| `packages/data-pipeline/src/build-db.ts` | Generate SQLite database |
| `apps/mobile/src/services/database.ts` | Mobile SQLite access |
| `apps/mobile/src/services/srs.ts` | SM-2 spaced repetition |
| `apps/widget-android/src/main/java/com/kanjiku/widget/KanjiWidget.kt` | Android widget UI |

### Documentation

- **Fase 0 (Riset):** `docs/phase-0/PROGRESS.md` ✅ COMPLETE
- **Fase 1 (Data & UI):** `docs/phase-1/PROGRESS.md` ✅ COMPLETE
- **Fase 2 (SRS & Queue):** `docs/phase-2/` (TBD)
- **PRD:** Local only, see `D:/coding/Kanjiku/PRD Aplikasi Belajar Kanji (Kanji Widget).md`
- **Roadmap:** Local only, see `TAHAPAN_PENGERJAAN.md`

---

## 🗓️ Roadmap

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **0** | 2 weeks | Research, validation | ✅ Done |
| **1** | 4 weeks | Data pipeline, UI assets | ✅ Done |
| **2** | 6 weeks | SRS, widget queue, perf | ⏳ Next |
| **3** | 3 weeks | Notifications, polish | 📋 Planned |
| **4** | 3 weeks | Release prep, App Store | 📋 Planned |

**MVP Target:** End of Fase 2 (week 12)

---

## 🤝 Contributing

- Feature branch: `feature/phase-X-{name}`
- Never push to `main` directly
- docs/ folder & PRD files are local-only (excluded from .gitignore)
- Code: MIT License

---

## 📄 License

**Code:** MIT (see `LICENSE`)

**Data:**
- Kanji data: CC BY-SA 2.0 (KANJIDIC)
- Stroke SVG: CC BY-SA 3.0 (KanjiVG)
- Audio: CC BY 4.0 (Kanji alive)
- Fonts: OFL 1.1 (Noto Sans CJK)

---

## 🔗 Links

- **GitHub:** https://github.com/Limitsss147a/Kanjiku
- **Kanji Data:** https://github.com/KanjiVG/kanjivg
- **References:** https://kanjiapi.dev, https://kanjialive.com

---

**Made with ❤️ for Japanese learners.**
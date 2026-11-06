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

## 📱 Supported Devices

### Android
| API Level | Version | Min Specs | Status |
|-----------|---------|-----------|--------|
| **26** | Android 8.0 (Oreo) | 2GB RAM, 1.5GHz dual-core | ✅ Tested |
| **30** | Android 11 (R) | 3GB RAM, 2GHz quad-core | ✅ Tested |
| **34** | Android 14 (U) | 4GB RAM, 2.4GHz octa-core | ✅ Tested |

**Widget Requirements:**
- Glance 1.1+ (WorkManager 15-min minimum interval)
- SQLite 3.22+ (native)
- 50MB free storage (DB + fonts)

**Testing:** CI matrix runs widget tests + app typecheck on all three API levels (`.github/workflows/test-matrix.yml`)

### iOS
- iOS 13+ (WidgetKit planned for Fase 5+)
- iPhone 6s or newer
- 2GB RAM minimum

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Android API 26+ (Android 8+) or iOS 13+
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

### ✅ Implemented (Fase 0-5)
- [x] 612 kanji database (N5-N3)
- [x] SQLite ETL pipeline (sql.js + native SQLite)
- [x] Mobile app (React Native + Expo SDK 58)
- [x] Widget queue system (48h rolling)
- [x] SRS review UI (SM-2 algorithm)
- [x] Deep linking (`kanjiku://kanji/{character}`)
- [x] Android widget (Kotlin/Glance 1.1, WorkManager 15-min)
- [x] 7 Wagara UI patterns
- [x] Design system tokens (Washi light / Sumi dark)
- [x] Hybrid DB copy strategy (mobile → shared storage)
- [x] Animations (ink spread 360ms, tap scale 120ms, sakura fall 3s)
- [x] WCAG AA contrast compliance (4.5:1 all pairs)
- [x] Accessibility props & hooks (A11yProps, useFocus, useAnnounce)
- [x] Performance utilities (bundle size checker, lazyLoad helper)
- [x] QA tests (contrast, bundle)
- [x] Widget theming (Washi/Sumi) — system dark mode + user override
- [x] Boot receiver scheduling (survives reboot)
- [x] Testing matrix (Android 8-14) — `.github/workflows/test-matrix.yml`
- [x] E2E tests (review flow + grade cycle)

### 📋 Planned (Fase 6+)
- [ ] iOS WidgetKit
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
| **2** | 6 weeks | SRS, widget queue, mobile screens | ✅ Done |
| **3** | 3 weeks | Widget production (DB access, themes) | ✅ Done |
| **4** | 3 weeks | UI polish, accessibility, testing | ✅ Done |
| **5** | 1 week | Widget hardening, E2E, CI matrix | ✅ Done |

**MVP Status:** Phase 0-5 complete (90% overall progress)

### 🚧 Build Status (2026-11-06)
- **Android (EAS)**: Config ready (`eas.json` root, `pre_install` hook builds `@kanjiku/ui`), blocked by Free plan limit (resets Dec 1). Local `expo export:embed android` ✅ passes.
- **iOS (EAS)**: Config ready (simulator profile), needs Apple Developer credentials in EAS dashboard.
- **Widget Android (EAS)**: APK builds ✅ (4.8 MB, debug keystore). Local Gradle needs Java 17 (EAS provides).

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
# Detailed Plan: Mobile i18n Infrastructure

## Phase 1: Analysis & Infrastructure Setup
- [ ] **Analyze Web Keys:** Map existing translation keys from `apps/web/messages/tr.json` to ensure consistency in the mobile app.
- [ ] **Dependency Installation:** 
  - Install `i18next`, `react-i18next`, `@react-native-async-storage/async-storage`, and `expo-localization`.
- [ ] **Filesystem Structure:**
  - Create `apps/mobile/src/locales/tr.json`
  - Create `apps/mobile/src/locales/en.json`
  - Create `apps/mobile/src/i18n/config.js` for initialization.

## Phase 2: Configuration & Integration
- [ ] **i18n Initialization:**
  - Setup `i18n/config.js` with language detection (using `expo-localization`) and persistence (using `AsyncStorage`).
- [ ] **App Entry Point:**
  - Wrap the root component in `App.js` with `I18nextProvider` (if necessary) or ensure initialization is imported.
- [ ] **Global Utilities:**
  - Update date formatting utilities in `src/utils` to respect the current locale.

## Phase 3: Component Migration (Implementation)
- [ ] **Auth Screens:** Localize `LoginScreen.js` (Labels, Placeholders, Error messages).
- [ ] **Main Navigation:** Localize Bottom Tabs and Header titles.
- [ ] **Worker Portal:**
  - Localize `JobDetailScreen.js` and `JobInfoCard.js`.
  - Localize `VoiceRecorder.js` labels.
  - Localize `Expense` related forms and modals.
- [ ] **Profile & Settings:**
  - Create a `LanguageSwitcher` component.
  - Integrate switcher into `ProfileScreen.js`.

## Phase 4: Quality Assurance & Verification
- [ ] **Manual Audit:** Verify that switching language updates all UI elements without a full app restart.
- [ ] **Persistence Test:** Ensure language choice persists after closing and reopening the app.
- [ ] **Consistency Check:** Verify that terms used in mobile match the web application.
- [ ] **Final Linting:** Run `npm run test` and check for any regressions.

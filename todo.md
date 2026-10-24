# Cadence — Phase-by-Phase Development To-Do

> **Project Reference:** [plan.md](file:///home/skylap/cybersec/buildwithai-24thOct/plan.md)  
> **Target Architecture:** React + Vite (TypeScript), Tailwind CSS, Lucide Icons, Local-First Persistence  
> **Design Standard:** Genesis Editorial Precision (Google Stitch Compliant, 4px Grid, Two-Weight Rule)  
> **Status:** Not Started ⚪

---

## Progress Overview

| Phase | Description | Status | Tasks Complete |
| :--- | :--- | :---: | :---: |
| **Phase 1** | Scaffolding, Tooling & Design Tokens | 🟢 Complete | 5 / 5 |
| **Phase 2** | Types, Seed Data & Storage Engine | 🟢 Complete | 4 / 4 |
| **Phase 3** | Core UI Shell & 28-Day Dot Matrix Cards | 🟢 Complete | 5 / 5 |
| **Phase 4** | Interactive Modals & Command Palette | 🟢 Complete | 4 / 4 |
| **Phase 5** | Design System Audit & Accessibility | 🟢 Complete | 4 / 4 |
| **Phase 6** | Verification, Build & Deployment Prep | ⚪ Pending | 0 / 3 |
| **Total** | | | **22 / 25** |

---

## Phase 1: Scaffolding, Tooling & Design Tokens

**Goal:** Establish clean React + Vite + TypeScript workspace with Tailwind CSS configured with strict Genesis tokens and web typography.

- [x] **Task 1.1: Initialize Vite + React TypeScript Project**
  - Initialize clean project in root: `npm create vite@latest . -- --template react-ts` (or standard scaffolding).
  - Clean out boilerplate files (`App.css`, sample SVGs, demo counters).
  - Verify `package.json` contains modern dependencies (`react`, `react-dom`, `typescript`, `@types/react`, `@types/react-dom`).
  - *Acceptance Criteria:* `npm run dev` serves a blank Vite canvas without console errors.

- [x] **Task 1.2: Install and Configure Tailwind CSS**
  - Install Tailwind CSS and PostCSS (`tailwindcss`, `postcss`, `autoprefixer`).
  - Configure `tailwind.config.js` or Tailwind v4 `@theme` with Genesis design tokens:
    - Canvas: `#FAFAFA`
    - Surface: `#FFFFFF`
    - Border: `#E8E8EC`
    - Text Primary: `#0A0A0A`
    - Text Secondary: `#6B6B6B`
    - Neutral/Muted: `#9C9C9C`
    - Primary Accent: `#6366F1` (Hover: `#4F46E5`)
    - Brand Green: `#20970B`
    - Semantic Success: `#10B981`
    - Semantic Warning: `#F59E0B`
    - Semantic Error: `#EF4444`
  - *Acceptance Criteria:* Tailwind utilities compile and custom color tokens are accessible via utility classes.

- [x] **Task 1.3: Configure Typography (General Sans, DM Sans, JetBrains Mono)**
  - Add web font links in `index.html`:
    - `General Sans` (Fontshare CDN, weights 400 & 700)
    - `DM Sans` (Google Fonts, weights 400 & 700)
    - `JetBrains Mono` (Google Fonts, weights 400 & 700)
  - Configure font families in `tailwind.config.js` or `src/index.css`:
    - `font-display`: `'General Sans', sans-serif`
    - `font-sans`: `'DM Sans', sans-serif`
    - `font-mono`: `'JetBrains Mono', monospace`
  - *Acceptance Criteria:* Fonts load correctly in browser inspector; headings use `-0.03em` tracking.

- [x] **Task 1.4: Install Icons & Global Styles Setup**
  - Install `lucide-react` for minimalist 1.5px stroke geometric icons.
  - Set up base styles in `src/index.css`:
    - Base canvas: `background-color: #FAFAFA; color: #0A0A0A;`
    - Reset default input/button outlines to match Genesis focus rings (`focus:ring-2 focus:ring-[#6366F1]/20`).
  - *Acceptance Criteria:* Lucide icons render crisply with custom stroke widths.

- [x] **Task 1.5: Verification of Dev Pipeline**
  - Run `npm run build` to verify initial TypeScript & Vite build output.
  - *Acceptance Criteria:* Clean build with zero warnings or type errors.

---

## Phase 2: Types, Seed Data & Storage Engine

**Goal:** Create type definitions, seed dataset, 28-day sliding window calculations, and localStorage persistence adapter.

- [x] **Task 2.1: Define Data Types in `src/types.ts`**
  - Create [src/types.ts](file:///home/skylap/cybersec/buildwithai-24thOct/src/types.ts):
    - `Category`: `'Creative' | 'Tech' | 'Physical' | 'Learning'`
    - `SessionDuration`: `15 | 30 | 45 | 60`
    - `SessionLog`: `{ id, date, durationMinutes, note, timestamp }`
    - `Hobby`: `{ id, title, category, weeklyTarget, nextStepBookmark, createdAt, logs }`
  - Add initial seed hobbies (`INITIAL_HOBBIES`, 5 hobbies totaling 14 weekly sessions target):
    - Systems Programming in Rust (Tech, 3x/week)
    - Acoustic Fingerpicking (Creative, 4x/week)
    - 5K Aerobic Base Building (Physical, 3x/week)
    - Japanese Kanji & Grammar (Learning, 2x/week)
    - Analog 35mm Photography (Creative, 2x/week)
  - *Acceptance Criteria:* Full TypeScript type safety across all properties.

- [x] **Task 2.2: Implement Local Storage & Export Engine in `src/utils.ts`**
  - Create [src/utils.ts](file:///home/skylap/cybersec/buildwithai-24thOct/src/utils.ts) with Ponytail-aligned functions:
    - `formatLocalDate(d: Date): string` (timezone-safe YYYY-MM-DD helper)
    - `loadHobbies(seed: Hobby[]): Hobby[]` (safe fallback on corrupt JSON)
    - `saveHobbies(hobbies: Hobby[]): void` (`localStorage` under `cadence_hobbies_v1`)
    - `exportBackup(hobbies: Hobby[]): void` (generates downloadable timestamped JSON)
    - `importBackup(jsonString: string): Hobby[]` (validates and parses uploaded JSON)
  - *Acceptance Criteria:* Storage survives page reloads; JSON backup triggers valid browser download; import parses JSON securely.

- [x] **Task 2.3: Implement 28-Day Window & Metric Math in `src/utils.ts`**
  - `get28DayWindow(): string[]` returns local calendar dates from `[Today - 27d]` to `[Today]`.
  - `getWeeklyLogCount(logs: SessionLog[]): number` calculates sessions completed in current ISO week (Mon–Sun) using local dates.
  - `getStatus(logs: SessionLog[]): { label: string; isGreen: boolean }`:
    - "On Track — Active Today" (if session logged today)
    - "On Track — Active Yesterday" / "On Track — Xd ago" (< 7 days)
    - "Needs Attention — Xd inactive" (≥ 7 days or no logs)
  - *Acceptance Criteria:* Correct calculation confirmed across timezones and boundary conditions.

- [x] **Task 2.4: Unit / Smoke Testing of Utilities**
  - Verify calculations with synthetic dates (leap days, week transitions, missing logs).
  - *Acceptance Criteria:* 100% calculation reliability with zero runtime errors.

---

## Phase 3: Core UI Shell & 28-Day Dot Matrix Cards

**Goal:** Build the main editorial gallery dashboard with sticky top navigation, category filter chips, and interactive 28-day dot matrix hobby cards.

- [x] **Task 3.1: Build Sticky Top Navigation Bar**
  - In [src/App.tsx](file:///home/skylap/cybersec/buildwithai-24thOct/src/App.tsx):
    - 56px height, `backdrop-blur-md bg-white/90 border-b border-[#E8E8EC] sticky top-0 z-40`.
    - Left: "Cadence" wordmark in `General Sans` Bold (`#0A0A0A`) with `#20970B` brand accent dot.
    - Center: ⌘K Search trigger bar (`bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl px-4 py-1.5 text-sm text-[#6B6B6B] hover:border-[#6366F1]/50 cursor-pointer`).
    - Right: "Export JSON" secondary action button + rounded-full avatar placeholder.
  - *Acceptance Criteria:* Nav sticks smoothly on scroll; ⌘K click triggers palette; export button invokes backup download.

- [x] **Task 3.2: Build Header Summary & Category Filters**
  - In [src/App.tsx](file:///home/skylap/cybersec/buildwithai-24thOct/src/App.tsx):
    - Section title: "Active Pursuits" (`32px` Bold `-0.03em`).
    - Dynamic subtitle: `"X of Y weekly sessions completed across Z hobbies"` in `DM Sans` Regular.
    - Category filter pills: `All Hobbies`, `Creative`, `Tech`, `Physical`, `Learning` (`rounded-full py-1.5 px-4 text-sm font-normal`).
      - Active: `#6366F1` text-white font-bold.
      - Inactive: `#F3F4F6` text-[#6B6B6B] hover:bg-[#E5E7EB] font-normal.
    - Right: **Single Primary CTA** `+ New Hobby` (`bg-[#6366F1] text-white rounded-md py-2 px-4 shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:bg-[#4F46E5] font-bold`).
  - *Acceptance Criteria:* Category filtering updates card grid immediately; single primary CTA rule strictly respected.

- [x] **Task 3.3: Implement 28-Day Dot Matrix Subcomponent**
  - In [src/components/HobbyCard.tsx](file:///home/skylap/cybersec/buildwithai-24thOct/src/components/HobbyCard.tsx):
    - 200px preview container with subtle `#FAFAFA` background.
    - 4 rows × 7 columns grid (28 days).
    - Dot states:
      - Active (has log): `bg-[#6366F1] w-2.5 h-2.5 rounded-full scale-100 transition-transform hover:scale-125`.
      - Inactive: `bg-[#E8E8EC] w-2.5 h-2.5 rounded-full`.
      - Today indicator: subtle ring or pulse styling.
    - Tooltips on hover: Native HTML `title` showing `"YYYY-MM-DD: X min (Note)"` or `"No session"`.
    - Bottom metric badge: `X / Y sessions this week` in `12px JetBrains Mono font-normal`.
  - *Acceptance Criteria:* Matrix maps 28 days accurately; hover highlights dot; week count matches logs.

- [x] **Task 3.4: Complete `HobbyCard.tsx` Layout & Bookmark Frame**
  - Surface: `#FFFFFF border border-[#E8E8EC] rounded-xl overflow-hidden`.
  - Top preview overlays:
    - Top-left: Category pill (`rounded-full bg-white/90 backdrop-blur border border-[#E8E8EC] px-2.5 py-0.5 text-xs font-normal`).
    - Top-right: Status chip (`#10B981` On Track or `#F59E0B` Needs Attention, `rounded-full px-2.5 py-0.5 text-xs font-normal`).
  - Content Body (`p-6`):
    - Title (`22px` Bold) + Weekly target subtitle (`13px #6B6B6B font-normal`).
    - Recessed Bookmark Box: `bg-[#FAFAFA] border border-[#E8E8EC] rounded-lg p-3`.
      - Overline: `NEXT STEP BOOKMARK` (`10px JetBrains Mono text-[#9C9C9C] tracking-wider uppercase font-normal`).
      - Bookmark text: Current next step note (`13px text-[#0A0A0A] line-clamp-2 font-normal`).
    - Card Footer: Full-width secondary button `+ Log Session` (`border border-[#E8E8EC] bg-transparent text-[#0A0A0A] hover:bg-[#FAFAFA] rounded-md py-2 text-sm font-normal`).
  - *Acceptance Criteria:* Elevation rule satisfied (flat at rest, -2px hover lift with shadow `0 8px 30px rgba(0,0,0,0.08)`); strictly respects Two-Weight Rule.

- [x] **Task 3.5: Dashboard Grid Integration in `App.tsx`**
  - Integrate responsive grid: 1 column on mobile, 2 columns on tablet, 3 columns on desktop (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - Add empty state when category filter has no results.
  - *Acceptance Criteria:* Cards resize cleanly; grid maintains 4px spacing alignment.

---

## Phase 4: Interactive Modals & Command Palette

**Goal:** Implement native, zero-bloat modal dialogs for quick session logging, pursuit creation, and ⌘K search palette.

- [x] **Task 4.1: Build Quick-Log Modal in `src/components/LogModal.tsx`**
  - Native accessible dialog / backdrop (`fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4`).
  - Container: `max-w-[480px] w-full bg-white rounded-xl border border-[#E8E8EC] p-6 shadow-2xl`.
  - Header: `"Log Session: {hobby.title}"` (`20px` Bold) + Close button.
  - Duration chip selector: `15m`, `30m`, `45m`, `60m` (`rounded-full px-3 py-1 text-sm border border-[#E8E8EC]`, active `#6366F1` text-white).
  - Session note input: `textarea` with `rounded-md border-[#E8E8EC] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20`.
  - Bookmark update section:
    - Checkbox: "Update Next Step Bookmark".
    - Input pre-filled with current bookmark, editable on check.
  - Recent logs preview: Mini-list of last 2 sessions (date + duration in `JetBrains Mono`).
  - Footer: Ghost `Cancel` button + Primary Indigo `Save Session` button.
  - Keyboard handlers: `Esc` closes modal, `Enter` (or `Ctrl+Enter`) submits.
  - *Acceptance Criteria:* Logging a session immediately updates 28-day dot matrix, weekly session count, and card bookmark.

- [x] **Task 4.2: Build New Pursuit Modal in `src/components/NewHobbyModal.tsx`**
  - Modal container with 12px radius and clear field hierarchy.
  - Form fields:
    - Pursuit Title (`input text`, required).
    - Category selection chips (`Creative`, `Tech`, `Physical`, `Learning`).
    - Weekly Target selector (`1` to `7` sessions / week).
    - Initial Next Step Bookmark (`input text`, e.g. "Read Chapter 1...").
  - Validation: Ensure title is non-empty; focus first input on open.
  - Submission handler: Generates UUID/timestamp id, prepends new hobby to state, saves to `localStorage`.
  - *Acceptance Criteria:* New hobby appears immediately on the dashboard and is persisted.

- [x] **Task 4.3: Build Command Palette in `src/components/CommandPalette.tsx`**
  - Triggered via `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) or top nav click.
  - Centered floating search modal (`max-w-[540px] w-full bg-white rounded-xl border border-[#E8E8EC] shadow-2xl overflow-hidden`).
  - Search input: autofocus, icon prefix, `Esc` dismiss badge.
  - Instant live filtering across:
    - Hobby title
    - Category name
    - Next step bookmark text
  - Result row layout:
    - Title, category pill, weekly progress metric.
    - Quick action badge: `Press Enter to Log` or direct click to open `LogModal`.
  - Keyboard navigation: `ArrowDown`, `ArrowUp`, `Enter` to select, `Esc` to dismiss.
  - *Acceptance Criteria:* ⌘K opens palette instantly; typing filters smoothly; selecting opens Quick-Log modal.

- [x] **Task 4.4: Add JSON Import / Data Sovereignty Support**
  - Add hidden file input in `App.tsx` or settings dropdown for importing backup `.json` file.
  - Parse, validate structure against `Hobby[]` type, and merge or restore data with user confirmation.
  - *Acceptance Criteria:* Export produces valid JSON; importing restores all hobbies and logs without data loss.

---

## Phase 5: Design System Audit & Accessibility

**Goal:** Rigorous enforcement of Genesis Editorial Precision design rules and smooth user interactions.

- [x] **Task 5.1: Two-Weight Rule Verification**
  - Inspect DOM and Tailwind classes across all screens.
  - Ensure only `font-normal` (400) and `font-bold` (700) are used anywhere in the codebase.
  - Remove any intermediate weights (`font-medium`, `font-semibold`) in favor of 400 or 700.
  - *Acceptance Criteria:* Zero 500/600 font-weight classes rendered in production build.

- [x] **Task 5.2: Radius Hierarchy Audit**
  - Verify strict adherence to radius hierarchy:
    - `12px` (`rounded-xl`): Hobby cards, Command Palette, Modals.
    - `8px` (`rounded-lg`): Recessed Bookmark Box ("Where I Left Off").
    - `6px` (`rounded-md`): Buttons, form inputs, textareas.
    - `4px` (`rounded`): Monospace keyboard badges (`⌘K`, `Esc`).
    - `9999px` (`rounded-full`): Category pills, status chips, matrix dots, user avatar.
  - *Acceptance Criteria:* 100% compliance with radius hierarchy tokens.

- [x] **Task 5.3: Single Primary CTA Rule Audit**
  - Verify that the main dashboard contains strictly **one** filled `#6366F1` button (`+ New Hobby`).
  - Ensure card actions are bordered secondary buttons (`border-[#E8E8EC] bg-transparent text-[#0A0A0A]`).
  - *Acceptance Criteria:* Primary indigo background is reserved exclusively for the top CTA and active status indicators.

- [x] **Task 5.4: Keyboard Accessibility & Focus Trapping**
  - Ensure `Esc` key properly closes active modals.
  - Ensure focus rings are clean and consistent (`ring-2 ring-[#6366F1]/20`).
  - Prevent body scrolling when a modal or command palette is open.
  - *Acceptance Criteria:* Full dashboard and modals operable via keyboard alone.

---

## Phase 6: Verification, Build & Deployment Prep

**Goal:** Ensure complete build integrity, zero console warnings, offline capabilities, and deployment readiness.

- [ ] **Task 6.1: Production TypeScript & Bundle Audit**
  - Run `npm run build` with strict TypeScript checks.
  - Check production bundle size (should be < 150KB gzip due to Ponytail zero-bloat architecture).
  - Verify zero runtime console errors or React key warnings.
  - *Acceptance Criteria:* Build completes in under 3 seconds with minimal bundle size.

- [ ] **Task 6.2: End-to-End Workflow & Persistence Test**
  - Test workflow:
    1. Load app with default initial hobbies.
    2. Add new hobby ("Analog Photography", Creative, 2x/week, bookmark: "Develop Kodak Tri-X 400 roll").
    3. Log session for Rust (45m, "Async streams").
    4. Check that today's dot in Rust matrix turns `#6366F1`.
    5. Press `⌘K`, search "Tri-X", hit Enter to open log modal.
    6. Export backup JSON.
    7. Hard refresh browser (F5) and verify all state is intact.
  - *Acceptance Criteria:* All actions persist and render accurately without latency.

- [ ] **Task 6.3: Deployment Configuration**
  - Configure static hosting (`firebase.json` for Firebase Hosting or static build output `dist/`).
  - Document deployment command (`npm run build && firebase deploy` or Cloudflare Pages static deploy).
  - *Acceptance Criteria:* Static directory `dist/` is deployable directly to any edge CDN.

---

## Verification & Quality Sign-Off Checklist

- [x] Single Primary CTA Rule: Only 1 filled indigo button on the main dashboard (`+ New Hobby`).
- [x] Strict Two-Weight Rule: Only 400 and 700 weights rendered across typography.
- [x] Radius Hierarchy: 12px (cards/modals), 8px (bookmark), 6px (inputs/buttons), 4px (badges), 9999px (pills/dots).
- [x] Interactive 28-Day Matrix: 4 rows × 7 columns, hover tooltips, immediate color update upon logging.
- [x] Bookmark Synchronization: Updating bookmark in Quick-Log reflects immediately on card frame.
- [x] Data Sovereignty: LocalStorage persistence + JSON export/import fully operational.

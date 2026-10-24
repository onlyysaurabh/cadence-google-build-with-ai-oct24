# Cadence — Multi-Hobby & Practice Tracker

Cadence is an editorial-grade, multi-hobby progress tracker engineered to translate deliberate practice into visual momentum. Built strictly to the **Genesis design system** (Google Stitch compliant), Cadence couples a light gallery-frame aesthetic with a zero-bloat, local-first architecture.

---

## Key Features

### 1. Editorial Genesis Landing Page (`/#landing`)
- **Deliberate Practice Narrative**: Articulates Anders Ericsson's deliberate practice framework versus shallow, guilt-driven streak counters.
- **Interactive Live Showcase**: Live 28-day habit matrix with hover inspector tooltips, interactive micro-logger, and dynamic target indicators.
- **Interactive Practice Sandbox ("Test Drive")**: In-browser simulator to test duration chips (`15m`, `30m`, `45m`, `60m`), custom session notes, next step bookmarks, and 1-click handoff into the active dashboard.
- **Four Genesis Pillars**: Deep-dives into the 28-day momentum matrix, context-preserving bookmarks, practice timeline, and local-first data sovereignty.
- **Polymath Case Studies**: Real-world schedules for Systems Architects (Rust), Multi-Instrumentalists (Guitar/Jazz), Hybrid Athletes (5K Aerobic), and Polyglots (Kanji).
- **Subtle Editorial Footer**: Direct hash navigation across `#landing`, `#dashboard`, `#timeline`, `#account`, plus global `⌘K` palette discovery.

### 2. Active Pursuits Dashboard (`/#dashboard`)
- **Interactive 28-Day Matrix**: Visualizes a 4-week practice habit grid directly within the 200px preview header of each hobby card.
- **Weekly Target Tracking**: Real-time ISO week completion progress indicators.
- **Recessed Next Step Bookmark**: "Where I Left Off" context bookmark so you can resume deliberate practice instantly.
- **Category Filter Chips**: Filter pursuits seamlessly across `Creative`, `Tech`, `Physical`, and `Learning`.

### 2. Practice Activity Timeline (`/#timeline`)
- **Chronological Feed**: Reverse-chronological activity stream grouping deliberate practice sessions by date.
- **Date Clustering**: Intelligent relative day headers ("Today", "Yesterday", and formatted calendar dates) with daily session and duration totals.
- **Timeline Geometry**: Clean 2px vertical spine with circular timeline markers and hover-elevated 12px cards.
- **Practice Notes & Bookmarks**: Full review of deliberate session notes and updated "Next Step" bookmarks.
- **Inline Session Logging**: Secondary `+ Log Again` action on every timeline entry to record follow-up sessions immediately.
- **Hash-Based Routing**: Zero-dependency URL hash navigation (`#dashboard` ↔ `#timeline`) with full browser history support.

### 3. Deliberate Session Quick-Log Modal
- Accessible modal dialog with duration selector chips (`15m`, `30m`, `45m`, `60m`).
- Notes input and synchronized Next Step Bookmark update checkbox.
- Keyboard accessible (`Esc` dismiss, `Tab` focus trap, `Ctrl+Enter` save).

### 4. Zero-Bloat Command Palette (`⌘K` / `Ctrl+K`)
- Native modal search palette filtering across hobby titles, categories, and bookmarks.
- Full keyboard traversal (`ArrowUp`, `ArrowDown`, `Enter`).

### 5. Local-First Sovereignty & Persistence
- 100% offline persistence via browser `localStorage`.
- One-click JSON backup export and validated JSON file restore.

---

## Genesis Design System Guidelines

- **Strict Two-Weight Rule**: Only two font weights are permitted across the application — **Regular (400)** and **Bold (700)**. Intermediate weights (500, 600) are forbidden and verified by automated unit tests.
- **Typography Scale**:
  - Headings: `General Sans` (Fontshare CDN, bold 700 with `-0.035em` tracking).
  - Body & UI: `DM Sans` (Google Fonts, regular 400).
  - Metrics & Badges: `JetBrains Mono` (Google Fonts, regular 400).
- **Single Primary CTA Rule**: The dashboard and main view maintain strictly **one** filled indigo button (`+ New Hobby`). All card actions use secondary bordered styling.
- **Radius Token Hierarchy**:
  - `12px` (`rounded-xl`): Hobby cards, Command Palette, Modals, Timeline cards.
  - `8px` (`rounded-lg`): Recessed bookmark and notes containers.
  - `6px` (`rounded-md`): Buttons, form inputs, dropdown selectors.
  - `4px` (`rounded-[4px]`): Monospace keyboard shortcut badges (`⌘K`, `Esc`).
  - `9999px` (`rounded-full`): Category pills, status chips, matrix dots, timeline nodes.

---

## Development & Testing

```bash
# Start local development server (Vite on http://localhost:5173)
npm run dev

# Run automated smoke and Genesis design token tests
npm test

# Lint with Oxlint
npm run lint

# Compile TypeScript and build production bundle
npm run build
```

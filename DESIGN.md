# Genesis — Cadence Design System

## Overview
An editorial precision interface for Cadence, a multi-hobby and deliberate practice tracker. The aesthetic is quietly confident — bold display typography, generous spacing, and gallery-frame card surfaces. The mood is professional and modern without being sterile. High information density balanced by breathing room. 

## Colors
- **Primary** (#6366F1): CTAs, active states, links, focus rings, interactive highlights — indigo
- **Primary Hover** (#4F46E5): Darker indigo for hover states on primary elements
- **Brand Highlight** (#20970B): Reserved exclusively for the Cadence brand highlight dot/badge in the navigation — green
- **Neutral** (#9C9C9C): Muted text, placeholders, timestamps, disabled states
- **Background** (#FAFAFA): Page background, light warm gray
- **Surface** (#FFFFFF): Cards, panels, modals, nav backdrop
- **Text Primary** (#0A0A0A): Headings, body text, primary labels — near-black
- **Text Secondary** (#6B6B6B): Descriptions, metadata, secondary labels
- **Border** (#E8E8EC): Card borders, dividers, input borders — subtle and recessive
- **Success** (#10B981): On track status, confirmations, positive indicators
- **Warning** (#F59E0B): Needs attention states, caution banners
- **Error** (#EF4444): Destructive actions, validation errors, rejected status

## Typography
- **Display Font**: General Sans — loaded from Fontshare
- **Body Font**: DM Sans — loaded from Google Fonts
- **Code Font**: JetBrains Mono — loaded from Google Fonts

Display and heading text uses General Sans at bold weight (700) with tight letter spacing (-0.03em to -0.04em). Body and UI text uses DM Sans at regular weight (400). Code blocks, metrics, and keyboard badges use JetBrains Mono at regular weight (400).

Strict Two-Weight Rule: Only two font weights are permitted across the entire application — Regular (400) and Bold (700).

Type scale: Display 72px, Headline 60px, Section heading 32px, Subhead 24px, Body 15px, Small 13px, Caption 12px, Overline 11px uppercase.

## Elevation
This design uses minimal shadows. Cards rest flat with a 1px border and gain a subtle shadow on hover (0 8px 30px rgba(0,0,0,0.08)) combined with a -2px vertical lift. Primary buttons gain a tinted glow shadow on hover (0 4px 12px rgba(99,102,241,0.35)). The nav uses backdrop-blur rather than a shadow to convey elevation. Dropdowns and popovers use shadow-lg. Focus states use a 3px indigo ring (0 0 0 3px rgba(99,102,241,0.12)) rather than a shadow.

## Components
- **Buttons**: Primary uses indigo fill with white text, 6px radius, bold weight. Secondary uses transparent bg with 1px border, same radius, normal weight. Ghost has no border or bg, just text color change on hover. Destructive uses red text with red border. All buttons shift up 1px on hover. Sizes: small (32px), medium (38px), large (44px).
- **Cards**: White surface, 1px subtle border, 12px radius, overflow hidden. Hobby cards have a 200px preview area on top featuring an interactive 28-day cadence dot-grid matrix, category pill, and semantic status chip, with content below containing title, weekly target, recessed next step bookmark frame, and a secondary action button. Hover lifts the card 2px and increases shadow. Transition duration 200ms.
- **Inputs**: 1px subtle border, surface background, 6px radius, 10px vertical and 14px horizontal padding, 14px font size. Focus: border turns indigo with a 3px rgba ring. Error: border turns red. Placeholder text uses muted color.
- **Chips**: Category filter chips use rounded-full (pill shape, 9999px), gray-100 background, gray-600 text, 4px vertical and 12px horizontal padding, 12px font size. Active state: indigo background with white text. Status chips follow the same pill shape but use semantic colors (green for On Track, amber for Needs Attention).
- **Lists**: Stacked rows with 1px dividers between items. Each row is flex with space-between, 12px vertical and 16px horizontal padding. Hover: subtle background change.
- **Checkboxes**: 20px size, rounded-full, gray-200 unchecked, indigo checked with white checkmark. Used as toggle switches for bookmark updates.
- **Tooltips**: Native browser tooltips via title attributes.
- **Navigation**: Sticky top nav with backdrop-blur, 56px height, 1px bottom border. Brand left, ⌘K search center, JSON export & user avatar right.
- **Search**: Global search triggered by ⌘K. Rendered as a rounded-xl bar with magnifying glass icon and keyboard shortcut badge.

## Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- Component padding: small 8×12, medium 10×16, large 12×24
- Section spacing: 32px mobile, 48px tablet, 64px desktop
- Container max width: 1280px with 24px horizontal padding
- Card grid gap: 24px

## Border Radius
- 4px: Monospace keyboard badges (⌘K, Esc), inline code
- 6px: Buttons, inputs, selects, textareas
- 8px: Recessed metadata bookmark cards, dropdowns, panels
- 12px: Hobby cards, search bar, modals
- 9999px: Avatars, category pills, status chips, matrix dots, toggle checkboxes

## Do's and Don'ts
- Do use indigo (#6366F1) only for interactive elements — never for decoration or static text
- Do maintain the 4px spacing grid for all padding, margins, and gaps
- Do use General Sans for headings and DM Sans for body — never swap them
- Do keep hobby cards at 12px radius, bookmark frames at 8px, and buttons/inputs at 6px
- Do maintain the editorial light gallery-frame mood on canvas (#FAFAFA) with high contrast (#0A0A0A text)
- Don't use pure black (#000000) or pure white (#FFFFFF) for text — use the defined palette values
- Don't add decorative gradients or illustrations — the interactive dot grid is the only visual momentum element
- Don't use shadows on static elements — reserve shadow elevation for hover and focus states
- Don't use more than two font weights (400 Regular and 700 Bold) anywhere in the application
- Don't place more than one primary (filled indigo) button in the same view section

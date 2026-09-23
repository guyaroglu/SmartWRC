# SEO Customer Finder — Design System

A warm, friendly product design system for **SEO Customer Finder**, a workspace where marketing teams track the search terms they rank for and turn that traffic into named customers.

## Sources

| Source | Notes |
| --- | --- |
| `uploads/original-1ca571d72aed46b341defcb0bf9a18e1.webp` | The only material supplied: a single dashboard UI shot (a "Donezo" task-dashboard concept). Structure, layout, density, radii, card anatomy and component inventory were read from it. |
| Brief (chat) | Name the system "SEO Customer Finder"; extract colour, typography and spacing tokens; make it warm and friendly in tone. |

**No codebase, Figma file, font binaries or logo were provided.** Everything below was derived from the screenshot plus the brief. Two deliberate departures from the source image:

1. **Palette.** The source is emerald green. The brief asks for warm, friendly tones, so the brand ramp is a terracotta **Clay** with a **Honey** accent and warm **Sand** neutrals. Structure is copied; hue is not.
2. **Product content.** The source screenshot is a generic task manager. Copy and data were rewritten for the SEO/customer-finding domain; the layouts are the same.

## Content fundamentals

The voice is a calm colleague who already knows your pipeline. Warm, plain, never chirpy.

- **Second person, active voice.** "Track keywords, win customers, and keep every campaign moving." Never "Users can track…".
- **Sentence case everywhere** except button labels and card titles, which are Title Case: "Add Campaign", "Import Data", "Team Collaboration", "Search Visibility".
- **Page subtitles are one sentence, no period-stacking.** Pattern: verb, verb, and verb. "Plan, prioritise and grow your pipeline with ease."
- **Metrics speak in fragments.** "Increased from last month", "On discuss", "Due date: Nov 26, 2024". No full sentences under a number.
- **Status vocabulary is closed**: Completed · In Progress · Pending · Blocked. Don't invent synonyms ("Done", "WIP").
- **Numbers are plain**: 24, 3.2k, $12,400, 41%, #7. Percentages have no space; currency uses commas.
- **No emoji.** Not in UI, not in empty states. Icons carry that job.
- **No exclamation marks, no hype words** ("supercharge", "effortless", "AI-powered"). Warmth comes from short, human phrasing: "Get easy in another way", "Customers that found you through search".
- **Empty states name the thing that's missing**, quietly: "No keywords match “local seo”." Blank surfaces that have no design say so: "This surface was not part of the provided design."

## Visual foundations

**Colour.** One warm family does everything. Clay (terracotta, `--clay-500 #C95F36`) is the only action colour; Honey (`--honey-400`) is the secondary accent and warning hue; Sand supplies every neutral — there are no cool greys anywhere, all neutrals carry a brown bias. Semantics are hue-shifted to stay in the family: olive for success, honey for warning, rust for danger. Exactly two backgrounds per screen: `--bg-app` (sand-100, behind the shell) and `--bg-canvas` (sand-50, inside it). One card per view may be filled clay; at most two cards may be near-black (`--surface-inverse`).

**Type.** Plus Jakarta Sans throughout (see the substitution note below). Weights are polarised: 400 body, 600 labels, 700 titles, 800 metrics — nothing in between. Tracking tightens as size grows (`-0.02em` on display and metrics, 0 on body). Eyebrows are the one exception: 11px, 700, uppercase, `+0.06em`. JetBrains Mono appears in exactly one place in product UI — the elapsed timer.

**Spacing.** 4px base. Real layouts live on 16 / 20 / 24: `--gap-grid: 16px` between cards, `--pad-card: 20px` inside them, `--gap-section: 24px` around page regions. The sidebar is a fixed 184px; the top bar is 64px; the content column caps at 1180px.

**Backgrounds.** Flat colour only — no photography, no illustration, no repeating pattern. Two texture devices exist and are used sparingly: a **45° sand hatch** that stands in for inactive or empty data (unfilled chart bars, the unfilled part of a gauge), and a single **radial clay glow** in the top-right of dark cards. Gradients are never used as decoration on light surfaces.

**Corner radii.** 6px status chips · 8px icon tiles and nav rows · 12px small panels · 16px cards · 28px the app shell itself · fully round for every button, field and avatar. A control is never a rounded rectangle; a card is never a pill.

**Cards.** White, 16px radius, 1px `--border-subtle` hairline, and a shadow so soft it reads as a lift rather than a drop (`0 2px 8px rgba(58,26,15,.05)`). All shadows are brown-tinted, never neutral black. No nested cards; no coloured left borders. Rows inside a card are separated by hover tint, not dividers.

**Elevation ladder.** xs (chips, small controls) → card (default panels) → raised (dark cards, the app shell) → overlay (modals, menus) → brand (clay buttons only, `0 6px 16px rgba(201,95,54,.24)`).

**Animation.** Short and soft. 120ms for hover tints, 180ms for panel swaps, 280ms for bars and gauge sweeps, 500ms for page entry. Easing is `cubic-bezier(.16,1,.3,1)` — a quick start that settles. No bounce, no spring, no parallax, no looping motion except the ticking timer.

**States.** Hover darkens by exactly one ramp step (or applies a sand-50 tint on white); it never changes opacity. Press scales to 0.97 — the only transform in the system. Focus is a 3px `--clay-300` ring plus a clay border; it is never blue. Disabled is 45% opacity with `not-allowed`.

**Transparency & blur.** Blur is not used. Transparency appears in exactly two places: white at 14–34% for controls sitting on a filled clay or dark card, and the radial glow on dark cards. Text is never set in a transparent colour.

**Imagery.** None supplied and none invented. Where a photo would sit (avatars), initials on a clay-100 tint stand in. If real imagery is added later, keep it warm-cast and low-contrast; no cool or desaturated treatments.

**Layout rules.** The whole app is one rounded 28px shell floating on the sand background, with the sidebar and header fixed inside it and only the main column scrolling. Dashboards are 4-up KPI rows over 3-column content grids (1.5fr / 1fr / 1fr). Page title, one-line subtitle, and a two-button action group (one primary, one secondary) sit at the top of every screen.

## Iconography

**Lucide** (`https://unpkg.com/lucide@0.454.0`), loaded from CDN and wrapped by the `Icon` component. **This is a substitution, flagged:** the source is a flat PNG with no icon assets, so no original icon set could be copied. Lucide's rounded-cap, 2px-ish outline style is the closest available match to the glyphs in the screenshot.

- Stroke width **1.9** by default; 2.2 for active nav items and icons at 24px+ on filled surfaces.
- Outline only — no filled or duotone glyphs, no icon backgrounds except the 8px rounded tile in list rows and the round bubble on dark cards.
- Sizes: 14 (caption rows), 16–18 (nav, buttons, tiles), 24+ (transport controls).
- Icons inherit `currentColor`; they are never multi-coloured.
- **No emoji, ever.** No unicode symbols as icons — the two exceptions are the ⌘ in the keyboard-shortcut chip and the arrow in `arrow-up-right` card affordances, which is a real Lucide glyph.
- Never hand-roll an SVG glyph; add the Lucide name to `Icon` instead.

## Fonts — substitution flagged

No font files were supplied. **Plus Jakarta Sans** (Google Fonts) stands in as the nearest geometric-humanist match to the screenshot's UI face, and **JetBrains Mono** covers the timer. Both load from the Google Fonts CDN in `tokens/fonts.css`. **If you have the real brand fonts, send the files and I'll swap them in and re-cut the type tokens.**

## Logo

No logo or brand mark was provided, and none was drawn. The wordmark is set in type: "SEO Customer Finder" in Plus Jakarta Sans ExtraBold at `-0.03em`, optionally preceded by a clay disc bearing the letter S as a placeholder mark. See `guidelines/wordmark.card.html`. **Send a logo file and I'll replace the placeholder everywhere.**

## Intentional additions

The source defines no formal component library, so the inventory was enumerated from what is visible in the screenshot. Two items beyond it:

- **`Icon`** — a wrapper over the CDN icon set, needed because no icon assets exist to copy.
- **`AvatarGroup`** — the screenshot shows stacked avatars only implicitly; included because lead and team surfaces need it.

## Index

```
styles.css              entry point — @import list only
tokens/                 fonts · colors · typography · spacing · radius · elevation · motion
guidelines/             15 specimen cards (Colors, Type, Spacing, Brand)
components/core/        Icon · Button · IconButton · Badge · Card · Avatar (+AvatarGroup) · SearchField
components/navigation/  NavItem · Sidebar · TopBar
components/dashboard/   StatCard · WeeklyBarChart · ProgressGauge · ProjectListItem · TeamMemberRow · ReminderCard · TimeTracker · PromoCard
ui_kits/app/            Interactive recreation: Dashboard, Keywords, Leads (see its README)
thumbnail.html          Homepage tile
SKILL.md                Agent-skill entry point
```

Every component ships `<Name>.jsx`, `<Name>.d.ts` (props contract) and `<Name>.prompt.md` (when to use it). Each component directory has one `@dsCard` HTML showing its states.

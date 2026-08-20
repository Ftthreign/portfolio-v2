---
name: Artisanal Logic
colors:
  surface: "#fbfaee"
  surface-dim: "#dbdbcf"
  surface-bright: "#fbfaee"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f5f4e8"
  surface-container: "#efeee3"
  surface-container-high: "#e9e9dd"
  surface-container-highest: "#e4e3d7"
  on-surface: "#1b1c15"
  on-surface-variant: "#444748"
  inverse-surface: "#303129"
  inverse-on-surface: "#f2f1e5"
  outline: "#747878"
  outline-variant: "#c4c7c7"
  surface-tint: "#5f5e5e"
  primary: "#181919"
  on-primary: "#ffffff"
  primary-container: "#2d2d2d"
  on-primary-container: "#959494"
  inverse-primary: "#c8c6c6"
  secondary: "#9f402d"
  on-secondary: "#ffffff"
  secondary-container: "#fd876f"
  on-secondary-container: "#732010"
  tertiary: "#131b00"
  on-tertiary: "#ffffff"
  tertiary-container: "#253100"
  on-tertiary-container: "#8b9b5c"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#e4e2e1"
  primary-fixed-dim: "#c8c6c6"
  on-primary-fixed: "#1b1c1c"
  on-primary-fixed-variant: "#474747"
  secondary-fixed: "#ffdad3"
  secondary-fixed-dim: "#ffb4a5"
  on-secondary-fixed: "#3e0500"
  on-secondary-fixed-variant: "#802918"
  tertiary-fixed: "#d9eaa3"
  tertiary-fixed-dim: "#bdce89"
  on-tertiary-fixed: "#161f00"
  on-tertiary-fixed-variant: "#3e4c16"
  background: "#fbfaee"
  on-background: "#1b1c15"
  surface-variant: "#e4e3d7"
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: "700"
    lineHeight: "1.2"
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.3"
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1120px
  gutter: 24px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The design system is built for a fullstack developer who prioritizes craft, clarity, and intentionality over generic tech trends. The personality is "warm-minimalist"—it strips away unnecessary noise to focus on the content, while using a soft, organic palette to avoid the cold sterility often found in developer portfolios.

The target audience includes hiring managers and technical founders who value attention to detail. The aesthetic avoids "AI-generated" gloss, heavy glassmorphism, and neon gradients in favor of a stable, editorial feel. It balances the precision of code with the warmth of a physical notebook, evoking trust and professional maturity through high-quality whitespace and restrained ornamentation.

## Colors

The palette is grounded in a high-contrast but "soft" relationship between charcoal and cream.

- **Background (Neutral):** `#FDFCF0` (Cream) provides a warm, paper-like surface that reduces eye strain compared to pure white.
- **Text (Primary):** `#2D2D2D` (Charcoal) ensures high legibility while maintaining a softer edge than pure black.
- **Accents:**
  - `#E2725B` (Terracotta) is used for primary calls to action and active states.
  - `#8A9A5B` (Sage) is used for secondary indicators, such as "Success" states, tags, or subtle decorative elements.
- **Borders:** Use a low-opacity version of the Charcoal color (`rgba(45, 45, 45, 0.1)`) to maintain structure without creating visual clutter.

## Typography

This design system employs a sophisticated pairing of an editorial serif and a technical sans-serif.

- **Headings:** **Playfair Display** provides a literary, high-end feel for project titles and section headers. Use tight letter-spacing for larger display sizes to maintain a cohesive visual block.
- **Interface & Body:** **Geist** is used for its monolinear clarity and "developer-first" DNA. It handles technical data, labels, and long-form descriptions with ease.
- **Labels:** Use uppercase and tracking (letter-spacing) for small labels to differentiate them from body text.
- **Consistency:** Maintain a strict vertical rhythm by sticking to the defined line-heights. Code snippets should use the same font as the body to maintain the "Geist" identity, relying on weights and color for syntax highlighting.

## Layout & Spacing

The layout philosophy is based on a **fixed-width container** for desktop to ensure line lengths remain readable (approx. 70-80 characters).

- **Grid:** Use a 12-column grid for desktop with 24px gutters. Elements should generally align to the grid, but whitespace is encouraged between major sections to emphasize the "minimalist" aesthetic.
- **Sectioning:** Large vertical gaps (120px+) should be used between major narrative blocks (e.g., between "Work" and "About").
- **Mobile:** On mobile, transition to a single-column layout with 20px side margins. Horizontal scrolling "carousels" are permitted for tech stacks or image galleries to save vertical space.

## Elevation & Depth

In keeping with the minimalist/editorial style, depth is created through **tonal layers** and **low-contrast outlines** rather than heavy shadows.

- **Surfaces:** Use slightly different shades of the background color (e.g., a "Paper" color at `#F9F8E8`) for card backgrounds to sit on top of the main `#FDFCF0` surface.
- **Borders:** Use thin, 1px solid borders for interactive elements. The border color should be only slightly darker than the surface it sits on.
- **Shadows:** If a shadow is necessary for a floating element (like a dropdown), use a single, very diffuse "Ambient" shadow: `0 10px 30px rgba(45, 45, 45, 0.05)`. Avoid multi-layered or colored shadows.

## Shapes

The shape language is "Soft" (0.25rem), reflecting a precise but approachable personality.

- **Standard Elements:** Buttons, input fields, and tags use the base `rounded` (4px) setting.
- **Large Elements:** Project cards or featured sections use `rounded-lg` (8px).
- **Avoidance:** Do not use "Pill" shapes or fully circular buttons, as they conflict with the structured, editorial grid of the serif typography.

## Components

- **Buttons:** Primary buttons use a solid Charcoal background with Cream text. Secondary buttons use a 1px Charcoal border with no fill. Transitions should be a fast, linear opacity fade (150ms).
- **Project Cards:** Large, minimal containers with a 1px border. The title uses the Serif font, while metadata (year, stack) uses the Sans-serif Label style. Images should have a subtle greyscale filter that reveals color on hover.
- **Chips/Tags:** Use the Sage background at 10% opacity with solid Sage text. No borders.
- **Input Fields:** Minimalist design with only a bottom border that thickens from 1px to 2px on focus using the Terracotta accent.
- **Navigation:** A simple top bar with a "Blur" background effect (backdrop-filter: blur(10px)) to maintain legibility as the user scrolls, keeping the background color at 80% opacity.
- **Code Blocks:** Use a slightly darker neutral background (`#F5F4E0`) to distinguish from the main surface. Use a theme-consistent syntax highlighting (Terracotta for keywords, Sage for strings).

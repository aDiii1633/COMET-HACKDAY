# SafeSphere AI — Design System & UI/UX Specification

> **Document Version:** 1.0.0  
> **Design Language:** Tactile Glassmorphism & Predictive OLED Dark  
> **Inspiration:** Apple iOS + Google Maps + Uber + Nothing OS  
> **Target Audience:** UX/UI Designers, Frontend Engineers, Design System Authors

---

## 1. Brand Personality & Design Ethos

SafeSphere AI’s design language is built on **Tactile Safety Intelligence**. The interface should evoke immediate feelings of calm control, high-tech vigilance, and unobtrusive protection.

- **Calm, Not Alarmist:** Emergency apps often panic users with stark red screaming interfaces. SafeSphere uses deep OLED dark space, smooth neon illumination, and subtle ambient glows.
- **Predictive & Contextual:** The UI adapts to time of day and proximity to danger, surfacing data only when actionable.
- **Tactile & Fluid:** Every button press, sheet drag, and map gesture provides physical micro-feedback.

---

## 2. Color Palette & Token System

### 2.1 Base Theme Colors (OLED Pure Dark)
```css
:root {
  /* Surface & Backgrounds */
  --color-bg-base: #050507;        /* Deep OLED Black */
  --color-bg-surface: #0D0E15;     /* Dark Glass Layer Base */
  --color-bg-card: rgba(18, 20, 31, 0.65); /* Translucent Glass */
  --color-border-glass: rgba(255, 255, 255, 0.08);

  /* Brand Accents */
  --color-brand-primary: #6366F1;   /* Indigo Pulse */
  --color-brand-glow: rgba(99, 102, 241, 0.25);
  
  /* Text & Content */
  --color-text-primary: #F9FAFB;   /* Pure High-Contrast White */
  --color-text-secondary: #9CA3AF; /* Cool Muted Grey */
  --color-text-tertiary: #6B7280;  /* Subtle Subtext */
}
```

### 2.2 Dynamic Risk Palette
```css
:root {
  /* Risk Level 0-25: Safe / Highly Illuminated */
  --color-risk-safe: #10B981;
  --color-risk-safe-glow: rgba(16, 185, 129, 0.3);

  /* Risk Level 26-60: Moderate Caution / Dim Lighting */
  --color-risk-warning: #F59E0B;
  --color-risk-warning-glow: rgba(245, 158, 11, 0.3);

  /* Risk Level 61-100: Critical Danger / High Incident Density */
  --color-risk-danger: #EF4444;
  --color-risk-danger-glow: rgba(239, 68, 68, 0.4);
}
```

---

## 3. Typography Scale

SafeSphere AI utilizes **Outfit** for bold, modern headings and **Inter** for ultra-legible body text, with **JetBrains Mono** reserved for data values and risk scores.

| Role | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title** | Outfit | 32px | 700 | 1.15 | -0.02em |
| **Heading 1** | Outfit | 24px | 600 | 1.25 | -0.01em |
| **Heading 2** | Outfit | 18px | 600 | 1.30 | 0.00em |
| **Body Primary** | Inter | 15px | 400 | 1.50 | 0.00em |
| **Body Medium** | Inter | 14px | 500 | 1.40 | 0.01em |
| **Caption / Subtext**| Inter | 12px | 400 | 1.40 | 0.02em |
| **Data Metric / XAI** | JetBrains Mono | 13px | 600 | 1.20 | 0.05em |

---

## 4. Components & Micro-Interactions

### 4.1 Glassmorphic Container Cards
All UI panels float over the Mapbox canvas using glassmorphism styling.
```css
.glass-card {
  background: var(--color-bg-card);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--color-border-glass);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}
```

### 4.2 Buttons & Action Triggers
- **Primary CTA ("Start SafeRoute"):** Full-width Indigo gradient button (`#6366F1` to `#4F46E5`) with rounded pill geometry (`rounded-full`), smooth hover elevation, and physical click response (`scale: 0.96`).
- **Emergency Action ("Hold to Alert"):** Crimson glow ring (`#EF4444`) requiring a 2-second continuous hold with circular progress ring fill.

### 4.3 Future Risk Timeline Slider
- Horizontal timeline slider styled after video editing interfaces.
- Dragging the thumb scrubs through `NOW`, `+15 min`, `+30 min`, `+45 min`, `+60 min`.
- As the thumb moves, map hexagons transition color smoothly, demonstrating dynamic spatial threat forecasting.

---

## 5. Mapbox Custom Dark Map Style

- **Base Map Surface:** Custom monochrome dark theme (`#08090E`).
- **Road Network:** Soft charcoal paths (`#1A1C29`) with well-lit primary arteries highlighted in subtle blue-grey (`#2D3248`).
- **Building Footprints:** 3D extruded dark grey polygons (`#0F111A`) with dynamic opacity.
- **Risk Overlays:** Semi-transparent H3 hexagon fills (`fill-opacity: 0.45`, `stroke-width: 1px`).

---

## 6. Alert Modal & Guardian UI Specifications

### 6.1 Level 2 Escalation Warning Sheet
- **Background:** High-contrast translucent dark crimson tint (`rgba(30, 10, 15, 0.92)`).
- **Header:** Flashing Amber/Red Shield Badge with countdown timer (`15... 14... 13...`).
- **Primary Text:** "High Risk Zone Ahead — 120 meters."
- **XAI Explanation:** "Area has 12 verified night incidents and 0 streetlights."
- **Actions:**
  - `[ Reroute Now ]` (Primary Green Button)
  - `[ I am Safe - Cancel ]` (Secondary Subtle Glass Button)

### 6.2 Guardian Live Tracking Dashboard
- **Header Badge:** Live Status Indicator ("Ananya is on SafeRoute Alpha — Battery 84%").
- **Live Vector Trajectory:** Dashed glowing line showing user path history and remaining path.
- **Context Card:** "AI Risk Index: 14/100 (Safe). Estimated Arrival: 11:42 PM."

---

## 7. Motion Guidelines & Framer Motion Specs

```javascript
// Standard Tactile Spring Configuration
export const springTransition = {
  type: "spring",
  stiffness: 350,
  damping: 28
};

// Sheet Drag Variant
export const bottomSheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: springTransition },
  exit: { y: "100%", opacity: 0 }
};
```

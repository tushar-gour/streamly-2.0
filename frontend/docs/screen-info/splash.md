# Streamly — Splash Screen

## 1. Screen Overview

**Screen name:** Splash Screen
**Screen type:** Passive brand loading screen
**Aspect ratio:** 16:9
**Recommended resolution:** 1920 × 1080
**Theme:** Dark cinematic Streamly theme
**Primary mood:** Premium, calm, cinematic, minimal, trustworthy

The splash screen is the first emotional entry point of Streamly. It introduces the Streamly brand, creates a calm cinematic mood, and gives the app a polished moment to initialize before routing the user to the correct next screen.

This screen should not feel like a generic loading screen. It should feel like a premium video world opening.

---

## 2. Purpose

The splash screen exists to:

- Establish Streamly’s brand identity instantly.
- Create a premium first impression.
- Hide startup tasks gracefully.
- Reduce user uncertainty during loading.
- Prepare the user emotionally before entering the product.
- Reinforce the brand promise: **“Your world, in motion.”**

The screen should make Streamly feel polished, trustworthy, and memorable before the user reaches any functional interface.

---

## 3. User Intent

The user has opened Streamly and expects the app to load smoothly.

The user subconsciously wants to know:

- Is the app opening correctly?
- Does this product feel premium?
- Is this app trustworthy?
- Will the next screen appear smoothly?
- Does this feel like a quality video platform?

The splash screen answers these through visual polish, calm motion, and clear brand presence.

---

## 4. Screen Flow

```txt
App opens
↓
Splash screen appears
↓
App checks network status
↓
App checks stored session / refresh token
↓
App fetches current user if authenticated
↓
App checks onboarding / auth completion state
↓
App routes user to correct screen
```

---

## 5. Route Decisions After Splash

| Condition                                | Next Screen          |
| ---------------------------------------- | -------------------- |
| Authenticated user with complete account | Home Feed            |
| Unauthenticated user                     | Landing / Login      |
| Signup incomplete                        | Continue Signup Flow |
| MFA required                             | MFA Verification     |
| Captcha required                         | Captcha Challenge    |
| Maintenance mode active                  | Maintenance Screen   |
| Fatal startup issue                      | Startup Error State  |

---

## 6. Layout

### Canvas

```txt
Resolution: 1920 × 1080
Ratio: 16:9
Layout: Full viewport
Theme: Dark cinematic
```

### Main Composition

The screen uses a centered brand composition:

```txt
┌──────────────────────────────────────────────┐
│                                              │
│        Atmospheric dark cinematic sky         │
│                                              │
│                                              │
│              Streamly logo mark              │
│              Streamly wordmark               │
│           YOUR WORLD, IN MOTION.             │
│                                              │
│                                              │
│           subtle 3-dot loading state          │
│                                              │
│        layered mountain silhouettes           │
└──────────────────────────────────────────────┘
```

### Placement

- Logo group is centered horizontally.
- Logo and wordmark sit slightly above the exact vertical center.
- Tagline sits directly below the wordmark.
- Loading indicator sits near the bottom center.
- Cinematic mountain silhouettes occupy the bottom third.
- Background atmosphere fills the whole screen.

---

## 7. Visual Content

### Visible Elements

1. Streamly logo mark
2. Streamly wordmark
3. Tagline
4. Loading indicator
5. Cinematic mountain background
6. Soft atmospheric glow

### Primary Text

```txt
Streamly
```

### Tagline

```txt
YOUR WORLD, IN MOTION.
```

### Optional Slow-Load Text

Show only if loading takes longer than 2.5 seconds:

```txt
Preparing your Streamly experience...
```

### Error Copy

If startup fails:

```txt
We hit a pause while starting Streamly.
Try again.
```

---

## 8. Visual Style

The screen should feel:

- Premium
- Calm
- Cinematic
- Minimal
- Elegant
- Soothing
- Smooth
- High-trust
- Emotionally polished

Avoid:

- Loud neon
- Heavy glassmorphism
- Childish gradients
- Visual clutter
- Random decorative particles
- Generic spinner loaders
- Aggressive glowing effects
- Overly complex animation

---

## 9. Color System

### Background Colors

```txt
Cinematic Black: #080B13
Night Graphite:  #0D111B
Deep Indigo Fog: #151A2D
Mountain Shadow: #070A12
```

### Logo Accent Colors

```txt
Muted Indigo:    #6C5CE7
Soft Periwinkle: #8D84FF
Cool Lavender:   #A79CFF
Soft Blue Glow:  #4D8DFF
```

### Text Colors

```txt
Primary Text: #F5F7FA
Muted Text:   #9AA2B3
Tagline:      #8D84FF
```

### Loading Dots

```txt
Active Dot:   #8D84FF
Inactive Dot: rgba(154, 162, 179, 0.35)
```

### 60 / 30 / 10 Rule

```txt
60%: Cinematic black / dark graphite background
30%: Indigo haze / layered dark surfaces
10%: Muted indigo-violet accent
```

---

## 10. Component Breakdown

## 10.1 Logo Mark

### Purpose

The logo mark is the primary brand recognition element.

### Design

The mark should include:

- Flowing S-shaped motion form
- Integrated play triangle
- Soft blue-violet gradient
- Subtle glow
- Strong silhouette
- Premium finish
- Clean shape readability

### Meaning

```txt
S identity + stream flow + play + motion + cinematic portal
```

### Behavior

- Appears first.
- Reveals softly through fade/draw motion.
- Should not bounce or pop aggressively.
- Should remain readable at small sizes.

---

## 10.2 Wordmark

### Purpose

The wordmark confirms the brand name clearly.

### Design

- Text: `Streamly`
- Rounded premium sans-serif style
- Soft white / silver finish
- Clean spacing
- High contrast
- No excessive glow
- Should feel smooth and cinematic

### Behavior

- Appears after logo mark.
- Fades in with slight upward movement.
- No typewriter effect.
- No bounce.

---

## 10.3 Tagline

### Purpose

The tagline communicates the emotional promise of the product.

### Text

```txt
YOUR WORLD, IN MOTION.
```

### Design

- Uppercase
- Wide letter spacing
- Muted violet color
- Smaller than wordmark
- Calm premium tone
- Center aligned

### Behavior

- Appears after wordmark.
- Soft opacity fade.
- No aggressive motion.

---

## 10.4 Loading Indicator

### Purpose

The loading indicator reassures the user that the app is working.

### Design

- Three small circular dots
- Bottom center
- One active glowing dot
- Two inactive muted dots
- Compact and subtle

### Behavior

```txt
Dot 1 active → Dot 2 active → Dot 3 active → Repeat
```

Animation should be slow and smooth.

---

## 10.5 Background

### Purpose

The background creates cinematic depth and emotional calm.

### Design

- Dark mountain silhouettes
- Deep navy / graphite sky
- Soft atmospheric haze
- Subtle light rays
- No distracting bright particles
- No heavy texture
- No busy scenic details

### Behavior

- Soft fade-in on launch.
- Optional very subtle parallax on desktop.
- No movement in reduced-motion mode.

---

## 11. Animation Details

## 11.1 Animation Goal

The animation should feel:

- Smooth
- Premium
- Calm
- Cinematic
- Intentional
- Low-friction

It should not feel flashy, bouncy, or game-like.

---

## 11.2 Animation Timeline

### 0ms–250ms: Background Fade In

- Screen begins near-black.
- Cinematic background fades in.
- Mountain silhouettes become visible.
- Soft atmosphere appears.

### 150ms–650ms: Logo Mark Reveal

- Streamly ribbon softly reveals along its shape.
- Integrated play triangle appears from negative space.
- Subtle glow blooms once.
- No bounce.

### 450ms–800ms: Wordmark Reveal

- Wordmark fades in.
- Moves upward by 4–6px.
- Opacity transitions from 0 to 1.

### 650ms–900ms: Tagline Reveal

- Tagline fades in softly.
- Letter spacing remains stable.
- No typewriter animation.

### 800ms onward: Loading Dots

- Loading dots begin pulsing.
- Active dot glow moves across the three dots.
- Loop repeats until app route decision is ready.

---

## 12. Motion Specifications

```txt
Intro duration:       800ms–1000ms
Logo reveal:          500ms
Wordmark fade:        350ms
Tagline fade:         300ms
Dot pulse loop:       1200ms–1600ms
Route transition:     420ms
```

### Recommended Easing

```txt
cubic-bezier(0.16, 1, 0.3, 1)
```

### Avoid

- Bounce
- Spin
- Shake
- Flash
- Hard zoom
- Fast flicker
- Harsh glow pulse

---

## 13. Loading Behavior

### Minimum Display Time

To avoid ugly flicker, keep splash visible for at least:

```txt
700ms–900ms
```

### Slow Load Behavior

If startup takes longer than:

```txt
2500ms
```

Show optional helper text:

```txt
Preparing your Streamly experience...
```

### Error Timeout

If app initialization fails after:

```txt
8s–12s
```

Transition to a branded startup error state.

---

## 14. Screen States

## 14.1 Default State

Shows:

- Logo mark
- Wordmark
- Tagline
- Animated loading dots
- Cinematic background

---

## 14.2 Fast Load State

If app loads quickly:

- Do not instantly skip splash.
- Complete minimum animation time.
- Then smoothly transition to next route.

---

## 14.3 Slow Load State

If startup is delayed:

- Keep loading dots active.
- Show helper copy below loading dots:

```txt
Preparing your Streamly experience...
```

---

## 14.4 Offline State

Suggested copy:

```txt
You’re offline. We’ll reconnect when the signal returns.
```

Possible actions:

- Retry
- Continue with cached content if supported

---

## 14.5 Fatal Error State

Suggested copy:

```txt
We hit a pause while starting Streamly.
```

Primary action:

```txt
Try again
```

---

## 15. UX Psychology

## 15.1 Brand Anchoring

The logo appears before any functional UI, helping the user remember Streamly visually.

## 15.2 Calm Anticipation

The dark cinematic atmosphere makes waiting feel intentional rather than frustrating.

## 15.3 Trust Building

Polished visuals and smooth animation make the product feel reliable.

## 15.4 Emotional Framing

The tagline sets the product mood before the user enters content-heavy screens.

## 15.5 Reduced Cognitive Load

There is no decision-making on this screen. The user simply waits while the product prepares.

---

## 16. Accessibility

### Required Accessibility Behavior

- High contrast text and logo.
- Reduced-motion support.
- No flashing effects.
- No rapid pulsing.
- Screen reader loading announcement.
- Loading state should not depend only on color.
- Text must remain readable across devices.

### Screen Reader Text

```txt
Streamly is loading.
```

### Reduced Motion Version

- No logo draw animation.
- No background parallax.
- No glow bloom.
- Simple fade-in only.
- Loading dots use opacity changes only.

---

## 17. Responsive Behavior

## 17.1 Desktop / Web

- Full 16:9 cinematic layout.
- Logo composition centered.
- Background fills entire screen.
- Loading dots bottom center.
- Mountain silhouettes span full width.

## 17.2 Tablet

- Same hierarchy as desktop.
- Slightly reduced logo size.
- Maintain comfortable spacing.

## 17.3 Mobile

- Logo mark appears above wordmark.
- Wordmark size reduces.
- Tagline remains visible.
- Loading dots stay above safe area.
- Background crops from center.

---

## 18. Backend / App Data Needed During Splash

The splash screen can stay visible while the app checks:

- Network reachability
- Session validity
- Refresh token status
- Current user
- Auth completion state
- MFA requirement
- Captcha requirement
- Theme preference
- Maintenance flag
- Feature/config bootstrap

No user input is required on this screen.

---

## 19. Developer Implementation Notes

### Asset Strategy

Use:

- SVG logo mark for sharp rendering.
- SVG or text-rendered wordmark.
- Optimized WebP/AVIF background.
- CSS animation for loading dots.
- Lightweight motion library only if already used globally.

### Performance Rules

- Splash should render quickly.
- Preload logo asset.
- Avoid huge background files.
- Avoid video backgrounds.
- Avoid WebGL for this screen.
- Do not block initial paint on non-critical requests.
- Do not keep splash artificially long.

### Suggested Implementation Logic

```txt
Render splash immediately
↓
Start minimum splash timer
↓
Start auth/session bootstrap
↓
Wait for both:
  - minimum splash time complete
  - app route decision ready
↓
Animate transition to next route
```

---

## 20. Transition to Next Screen

### Transition Style

The splash should transition with:

- Soft fade-out
- Slight scale-down of logo group
- Background crossfade
- No hard cut

### Duration

```txt
320ms–420ms
```

### Recommended Behavior

- If going to Landing/Login, preserve cinematic dark mood.
- If going to Home Feed, fade into app shell smoothly.
- If going to MFA/Captcha, use secure calm transition.

---

## 21. QA Checklist

Before approving this screen:

- Logo is sharp at 1920 × 1080.
- Tagline is readable.
- Loading dots are visible but subtle.
- Background does not overpower logo.
- No text is misspelled.
- Animation does not feel flashy.
- Reduced motion mode works.
- Screen looks good on dark displays.
- Mobile crop keeps logo visible.
- Splash does not flicker on fast load.
- Startup error state exists.

---

## 22. Handoff Summary

The Streamly splash screen should feel like a quiet cinematic opening scene.

It should communicate:

```txt
A premium video world is opening.
```

Core brand message:

```txt
Your world, in motion.
```

This screen should make Streamly feel polished, trustworthy, memorable, and emotionally calm before the user reaches the actual product.

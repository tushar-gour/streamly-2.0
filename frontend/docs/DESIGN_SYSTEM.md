# Streamly Design System

## Visual Direction

Streamly uses a calm cinematic interface. The UI should frame content and avoid
visual noise.

## Color Tokens

| Role           | Token        | Value     |
| -------------- | ------------ | --------- |
| Base           | `cinematic`  | `#080B13` |
| Secondary base | `night`      | `#0D111B` |
| Surface        | `graphite`   | `#111521` |
| Elevated       | `elevated`   | `#181D2B` |
| Accent         | `indigo`     | `#6C5CE7` |
| Soft accent    | `periwinkle` | `#8D84FF` |
| Highlight      | `lavender`   | `#A79CFF` |
| Text           | `cloud`      | `#F5F7FA` |
| Muted text     | `muted`      | `#9AA2B3` |

## Usage Ratio

```txt
60% cinematic black and graphite
30% elevated dark surfaces
10% muted indigo-violet accent
```

## Component Density

- Inputs: 48px minimum height.
- Buttons: 44px minimum touch target.
- Cards: 14px radius.
- Modals: 18px radius.
- Hero panels: 24px radius.

## Motion

| Token  | Duration |
| ------ | -------- |
| fast   | 120ms    |
| base   | 180ms    |
| smooth | 260ms    |
| page   | 420ms    |

Easing:

```txt
cubic-bezier(0.16, 1, 0.3, 1)
```

## Accessibility Baseline

- Visible focus states.
- AA contrast target.
- 44px touch targets.
- Reduced motion support.
- Color-independent errors.
- Labels for icon-only controls.

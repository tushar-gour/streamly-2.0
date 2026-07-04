# Streamly — Login Screen

## 1. Screen Overview

**Screen name:** Login Screen
**Screen type:** Authentication screen
**Default method:** Email + Password
**Aspect ratio:** 16:9
**Recommended resolution:** 1920 × 1080
**Theme:** Dark cinematic Streamly theme
**Mood:** Premium, calm, secure, minimal, cinematic

The Streamly login screen is the first active interaction screen after the splash screen. It should feel secure, smooth, and emotionally calm. The default login method is **email + password**, while other login methods are hidden behind a clean secondary option to reduce visual clutter.

The screen should not overload the user with every auth option at once. It should guide them through the most familiar flow first, then offer alternate methods only when needed.

---

## 2. Purpose

The login screen exists to:

- allow returning users to sign in quickly
- keep the first auth experience compact and familiar
- reduce cognitive load by showing email/password first
- provide alternate login methods through a secondary flow
- support password recovery
- allow account creation for new users
- maintain Streamly’s calm, premium brand identity

---

## 3. User Intent

The user wants to:

- sign in to their Streamly account
- continue watching or creating content
- recover access if they forgot their password
- use another login method if password login is not preferred
- create an account if they are new

The screen should answer:

```txt
How do I get back into Streamly quickly and safely?
```

---

## 4. Screen Flow

```txt
Splash Screen
↓
Login Screen
↓
User enters email and password
↓
User taps Sign in
↓
Backend validates credentials
↓
If captcha required → Captcha Challenge
↓
If MFA required → MFA Verification
↓
If trusted session exists → Home Feed
↓
If login fails → Inline error state
```

---

## 5. Layout

## 5.1 Desktop / 16:9 Layout

The screen uses a split cinematic layout.

```txt
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Left Brand / Visual Panel       Right Login Form Panel       │
│                                                              │
│  Streamly logo                    Welcome back                │
│  Cinematic scene                  Email field                 │
│  Brand tagline                    Password field              │
│  Feature highlights               Forgot password             │
│                                   Sign in button              │
│                                   - or -                      │
│                                   Use other method            │
│                                   - or -                      │
│                                   New to Streamly? Create     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Left Panel

Purpose:

- emotional brand reinforcement
- cinematic identity
- trust-building
- visual balance

Contains:

- Streamly logo
- tagline
- cinematic mountain/planet background
- 3 small benefit points

### Right Panel

Purpose:

- focused login action
- secure form entry
- clear next step

Contains:

- heading
- subheading
- email field
- password field
- forgot password link
- sign in CTA
- divider
- use other method button
- divider
- create account prompt

---

## 6. Exact Screen Content

## 6.1 Left Panel Content

### Logo

```txt
Streamly
```

### Tagline

```txt
YOUR WORLD, IN MOTION.
```

### Feature Highlights

```txt
Cinematic Streaming
Immersive videos in stunning quality.
```

```txt
For Everyone
Creators, viewers, and communities together.
```

```txt
Secure & Private
Your data, your content, always protected.
```

---

## 6.2 Right Panel Content

### Heading

```txt
Welcome back
```

### Subheading

```txt
Sign in to continue to Streamly
```

### Email Label

```txt
Email
```

### Email Placeholder

```txt
Enter your email
```

### Password Label

```txt
Password
```

### Password Placeholder

```txt
Enter your password
```

### Forgot Password Link

```txt
Forgot password?
```

### Primary Button

```txt
Sign in
```

### Divider 1

```txt
or
```

### Secondary Button

```txt
Use other method
```

### Divider 2

```txt
or
```

### Signup Prompt

```txt
New to Streamly? Create an account
```

### Footer Trust Copy

```txt
Secure sign-in. Your data is protected.
```

---

## 7. Component Breakdown

## 7.1 Page Shell

### Purpose

Provides the full-screen dark cinematic login environment.

### Design

- full viewport
- dark graphite background
- subtle border around main container
- soft radial glow around brand area
- no heavy glassmorphism

### Style

```txt
Background: #080B13
Surface: #0D111B
Border: rgba(255,255,255,0.08)
Accent: #6C5CE7
```

---

## 7.2 Left Brand Panel

### Purpose

Creates emotional connection and brand recall.

### Visual Design

- large cinematic background scene
- Streamly logo centered-left
- subtle planet or mountain horizon
- feature highlights at bottom
- background slightly darker near center split for readability

### Components

- logo mark
- wordmark
- tagline
- feature highlight cards
- subtle atmospheric glow

### Psychology

The left panel reassures the user that Streamly is premium and trustworthy before they interact with the form.

---

## 7.3 Login Card

### Purpose

Keeps the auth action focused and compact.

### Design

```txt
Width: 560px–640px
Padding: 48px–56px
Radius: 24px
Background: rgba(17, 21, 33, 0.92)
Border: 1px solid rgba(255,255,255,0.08)
Shadow: soft dark elevation
```

### Visual Rules

- Do not overcrowd.
- Keep hierarchy clear.
- CTA must be visually dominant.
- Secondary actions should remain calm.

---

## 7.4 Email Input

### Purpose

Collects user email.

### Structure

```txt
Label
Input container
Email icon
Placeholder
```

### States

| State    | Behavior                             |
| -------- | ------------------------------------ |
| Default  | muted border                         |
| Focus    | indigo border glow                   |
| Filled   | text becomes primary white           |
| Error    | soft coral border and inline message |
| Disabled | opacity reduced                      |

### Error Copy

```txt
Enter a valid email address.
```

---

## 7.5 Password Input

### Purpose

Collects user password securely.

### Structure

```txt
Label
Input container
Lock icon
Placeholder
Eye icon
```

### Interactions

- eye icon toggles password visibility
- password field supports Enter key submission
- Caps Lock warning can appear subtly

### Error Copy

```txt
Password is required.
```

---

## 7.6 Forgot Password Link

### Purpose

Helps users recover access.

### Placement

- right aligned under password field
- before primary CTA

### Text

```txt
Forgot password?
```

### Behavior

Routes to:

```txt
/forgot-password
```

---

## 7.7 Sign In Button

### Purpose

Primary action.

### Text

```txt
Sign in
```

### Design

```txt
Height: 56px
Radius: 12px
Background: #6C5CE7
Hover: #7C70F2
Pressed: #5A4BD5
Text: #FFFFFF
```

### Loading State

```txt
Signing in...
```

Button shows a subtle inline loading indicator.

### Disabled State

Disabled until:

- email is not empty
- password is not empty
- no request is already running

---

## 7.8 Divider

### Purpose

Separates login actions clearly.

### Design

```txt
line left + "or" + line right
```

### Style

- thin line
- muted border color
- small muted text

---

## 7.9 Use Other Method Button

### Purpose

Allows alternate login methods without cluttering the default screen.

### Text

```txt
Use other method
```

### Behavior

Opens method selection screen, modal, or bottom sheet with:

```txt
Email OTP
SMS OTP
WhatsApp OTP
Authenticator app
```

### Design

- secondary outlined button
- small grid/method icon on left
- arrow icon on right
- same height as input field

---

## 7.10 Create Account Prompt

### Purpose

Guides new users to signup.

### Text

```txt
New to Streamly? Create an account
```

### Behavior

Routes to:

```txt
/signup
```

### Design

- muted base text
- accent-colored link
- no button box unless mobile accessibility needs it

---

## 7.11 Theme Toggle

### Purpose

Allows switching between dark and light theme.

### Placement

Top-right corner.

### Design

- compact pill toggle
- moon icon active in dark mode
- sun icon visible as alternative
- soft accent thumb

---

## 8. Visual Direction

## 8.1 Overall Mood

The screen should feel like:

```txt
a secure cinematic gateway back into Streamly
```

## 8.2 Dark Theme

Use:

```txt
60% deep cinematic black / graphite
30% elevated dark surfaces
10% muted indigo-violet accent
```

## 8.3 Visual Hierarchy

Priority order:

1. Welcome back heading
2. Email/password form
3. Sign in button
4. Use other method
5. Create account
6. Brand features

## 8.4 What To Avoid

- Showing all login methods as equal primary cards
- Too many purple glows
- Heavy glass effect
- Neon green WhatsApp as dominant branding
- Overlarge form fields
- Distracting animated background
- Generic SaaS login look

---

## 9. Color System

### Background

```txt
Cinematic Black: #080B13
Night Graphite:  #0D111B
Deep Surface:    #111521
Elevated Card:   #181D2B
```

### Accent

```txt
Muted Indigo:    #6C5CE7
Soft Periwinkle: #8D84FF
Cool Lavender:   #A79CFF
```

### Text

```txt
Primary Text:   #F5F7FA
Secondary Text: #B5BBC8
Muted Text:     #858C9D
```

### Borders

```txt
Default Border: rgba(255,255,255,0.08)
Focus Border:   #8D84FF
Error Border:   #FF6B6B
```

### States

```txt
Success: #22C55E
Warning: #F59E0B
Error:   #FF6B6B
Info:    #60A5FA
```

---

## 10. Animation Details

## 10.1 Page Entry Animation

### Timeline

```txt
0ms–250ms: background fades in
100ms–450ms: left logo group fades up
200ms–600ms: login card fades and rises slightly
350ms–750ms: form fields stagger in
500ms–850ms: CTA and secondary actions appear
```

### Motion Style

- smooth
- subtle
- premium
- no bounce
- no aggressive movement

### Recommended Easing

```txt
cubic-bezier(0.16, 1, 0.3, 1)
```

---

## 10.2 Login Card Animation

### Entry

```txt
opacity: 0 → 1
translateY: 12px → 0
duration: 420ms
```

### Hover

```txt
border brightens slightly
shadow increases subtly
no scaling
```

---

## 10.3 Input Animation

### Focus

```txt
border color transitions to #8D84FF
soft outer glow appears
icon color changes to accent
```

### Error

```txt
border becomes soft coral
error message fades in
input does not aggressively shake
```

Use a very small horizontal nudge only if needed:

```txt
translateX: 0 → -2px → 2px → 0
duration: 140ms
```

---

## 10.4 Button Animation

### Hover

```txt
background brightens
arrow/icon moves 2px right if present
```

### Press

```txt
scale: 1 → 0.985 → 1
duration: 100ms
```

### Loading

```txt
text changes to “Signing in...”
small spinner/dot animation appears
button disabled
```

---

## 10.5 Divider Animation

The divider should not animate heavily.

Optional:

```txt
fade in after primary CTA
duration: 220ms
```

---

## 10.6 Use Other Method Animation

On click:

- button softly highlights
- method selection opens as modal or sheet
- transition duration: 260ms

Desktop modal:

```txt
opacity: 0 → 1
scale: 0.98 → 1
```

Mobile bottom sheet:

```txt
translateY: 100% → 0
```

---

## 10.7 Route Transition

After successful login:

```txt
Login card fades out
background crossfades
app shell fades in
duration: 420ms
```

If MFA is required:

```txt
Login card morphs into MFA card
same panel position
no hard screen jump
```

---

## 11. Form Behavior

## 11.1 Default Form

Fields shown by default:

```txt
Email
Password
```

Actions shown by default:

```txt
Forgot password?
Sign in
Use other method
Create an account
```

## 11.2 Validation Rules

### Email

- Required
- Must be valid email format

### Password

- Required
- Minimum length validation can be shown after submit or blur

## 11.3 Submit Behavior

When user taps **Sign in**:

```txt
Disable form
Show loading state
Send login request
Handle response
```

## 11.4 Success Behavior

If login succeeds and no MFA is needed:

```txt
Store auth state
Fetch current user
Route to Home Feed
```

## 11.5 MFA Required Behavior

If MFA is required:

```txt
Route to MFA Verification
```

or

```txt
Replace login card content with MFA card
```

## 11.6 Captcha Required Behavior

If smart captcha is required:

```txt
Show captcha challenge before continuing
```

---

## 12. Other Method Flow

When the user clicks:

```txt
Use other method
```

Show alternate login options:

```txt
Email OTP
SMS OTP
WhatsApp OTP
Authenticator app
```

### Recommended Presentation

Desktop:

```txt
Centered modal inside same dark visual environment
```

Mobile:

```txt
Bottom sheet
```

### Method Selection Copy

```txt
Choose another way to sign in
```

### Options

```txt
Email OTP
We’ll send a one-time code to your email.
```

```txt
SMS OTP
Receive a secure code on your phone.
```

```txt
WhatsApp OTP
Receive a secure code on WhatsApp.
```

```txt
Authenticator app
Use your authenticator code.
```

---

## 13. Error States

## 13.1 Invalid Credentials

```txt
Email or password is incorrect.
```

Behavior:

- show inline error near form
- keep entered email
- clear password field optionally
- do not use alarming full-screen error

## 13.2 Account Not Verified

```txt
Please verify your email before continuing.
```

Action:

```txt
Resend verification code
```

## 13.3 Rate Limited

```txt
Too many attempts. Please wait a moment before trying again.
```

## 13.4 Captcha Required

```txt
Quick verification needed to keep Streamly secure.
```

## 13.5 Network Error

```txt
Couldn’t reach Streamly. Check your connection and try again.
```

## 13.6 Server Error

```txt
Something paused unexpectedly. Please try again.
```

---

## 14. Loading States

### Form Submit Loading

Button text:

```txt
Signing in...
```

### Auth Bootstrap Loading

Small message under CTA:

```txt
Checking your session...
```

### Method Switch Loading

```txt
Preparing sign-in options...
```

---

## 15. Empty / Disabled States

### Disabled Sign In Button

Disabled when:

- email is empty
- password is empty
- request is loading

### Disabled Other Method

Only disabled if auth methods are unavailable.

Copy:

```txt
Other methods are temporarily unavailable.
```

---

## 16. UX Psychology

## 16.1 Reduced Cognitive Load

The screen shows email/password by default instead of listing every method upfront.

## 16.2 Familiarity First

Most users understand email/password immediately, so it becomes the default path.

## 16.3 Safe Exploration

“Use other method” gives flexibility without overwhelming the first view.

## 16.4 Trust Through Calmness

The dark cinematic layout, secure copy, and soft visuals make authentication feel safe.

## 16.5 Completion Motivation

The primary button is clear and visually satisfying, making sign-in feel easy.

---

## 17. Accessibility

### Required

- all inputs must have labels
- visible focus state
- keyboard navigation support
- Enter key submits form
- password reveal button has accessible label
- errors announced to screen readers
- color is not the only error indicator
- contrast must meet AA standards
- touch targets minimum 44px on mobile

### Screen Reader Labels

```txt
Email input
Password input
Show password
Forgot password
Sign in
Use other method
Create an account
```

---

## 18. Responsive Behavior

## 18.1 Desktop

- split-screen layout
- left visual panel visible
- right login card centered
- full cinematic background

## 18.2 Tablet

- left visual panel reduced
- login card remains prominent
- feature highlights may compress into two columns

## 18.3 Mobile

- single-column layout
- brand logo at top
- login card centered
- left cinematic visual becomes background
- feature highlights hidden or moved below form
- “Use other method” opens bottom sheet

Mobile order:

```txt
Logo
Welcome back
Email
Password
Forgot password
Sign in
or
Use other method
or
Create account
Security note
```

---

## 19. Backend / API Needs

This screen conceptually needs:

```txt
POST /api/v1/users/login
GET /api/v1/users/current-user
POST /api/v1/users/refresh-token
```

Possible later auth method endpoints:

```txt
POST /api/v1/users/auth/login/start
POST /api/v1/users/auth/login/verify-otp
POST /api/v1/users/auth/login/verify-mfa
```

The frontend should be prepared for responses such as:

```txt
login success
invalid credentials
captcha required
mfa required
email verification required
rate limited
session created
```

---

## 20. Security Notes

- Never show whether an email exists.
- Use generic invalid login error.
- Do not log passwords.
- Do not store password in frontend state longer than needed.
- Use secure cookies or token handling according to platform decision.
- Respect MFA trust token rules.
- Trigger captcha only when backend says it is required.

---

## 21. Microcopy Summary

### Heading

```txt
Welcome back
```

### Subheading

```txt
Sign in to continue to Streamly
```

### Email Placeholder

```txt
Enter your email
```

### Password Placeholder

```txt
Enter your password
```

### Primary CTA

```txt
Sign in
```

### Secondary CTA

```txt
Use other method
```

### Signup Prompt

```txt
New to Streamly? Create an account
```

### Security Note

```txt
Secure sign-in. Your data is protected.
```

---

## 22. QA Checklist

Before approving this screen:

- Default view shows email/password fields.
- Other login methods are hidden under “Use other method.”
- Sign in button is visually dominant.
- Forgot password is easy to find.
- Create account is visible but not competing with sign in.
- Form states are designed.
- Error states are calm and clear.
- Mobile layout is not cramped.
- Theme toggle does not distract.
- Animation feels smooth and premium.
- No funky colors or heavy glassmorphism.
- Screen matches Streamly splash and logo identity.

---

## 23. Design Summary

The Streamly login screen should feel like a calm secure gateway back into the platform.

The default experience is:

```txt
Email + Password
-or-
Use other method
-or-
New to Streamly? Create an account
```

This keeps the screen compact, minimal, psychologically clear, and premium while still supporting Streamly’s advanced authentication system.

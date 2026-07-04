# Streamly Frontend UX/UI Blueprint

## 1. Product Vision

Streamly should feel like a calm cinematic space where users enter, discover, watch, create, and return because the experience feels emotionally smooth. The interface should not compete with the content. It should frame videos beautifully, reduce decision fatigue, and make every interaction feel intentional.

The product experience should be compact and premium: dense enough to feel useful, but spacious enough to breathe. Users should feel guided, secure, and in control from auth to playback to creator workflows.

The “woah” effect should come from polish, rhythm, visual harmony, and motion design, not loud colors. Streamly should feel like opening a quiet, high-end video world.

---

## 2. Design Principles

1. **Content is the hero** — UI supports video, never fights it.
2. **Calm first impression** — no noisy colors, no clutter.
3. **Compact but breathable** — high information value with disciplined spacing.
4. **One clear next action** — every screen has one dominant CTA.
5. **Security feels reassuring** — auth/MFA/captcha should feel calm, not scary.
6. **Motion creates confidence** — animations confirm progress and direction.
7. **Personal relevance over endless scrolling** — recommendations should feel meaningful.
8. **Premium restraint** — subtle gradients, soft borders, no heavy glassmorphism.
9. **Creator workflows feel empowering** — uploading and analytics should feel rewarding.
10. **Accessibility is visual quality** — readable contrast, focus states, reduced motion.

---

## 3. Visual Identity Direction

**Brand feel:** cinematic, intelligent, soft, premium, trustworthy.
**Typography:** rounded modern sans-serif, similar vibe to the selected Streamly wordmark. Use generous line-height and compact UI labels.
**Icons:** thin rounded line icons, 1.75px stroke, calm indigo active states.
**Spacing:** 4px base grid. Main sections use 24/32/40px spacing.
**Radii:** 10px inputs, 14px cards, 18px modals, 24px hero panels.
**Elevation:** dark theme uses borders and soft inner glow more than shadows.
**Borders:** 1px cool graphite border, brighter on focus.
**Thumbnails:** rounded 14px, subtle gradient overlay, title anchored bottom-left.
**Avatars:** circular, 40px default, 32px compact, 72px profile.
**Cards:** dark elevated surfaces, thin border, soft hover lift, no heavy glass.

---

## 4. Color System

### Dark Theme

| Role                 | Color                      |
| -------------------- | -------------------------- |
| 60% Base             | `#080B13` Cinematic Black  |
| 60% Secondary Base   | `#0D111B` Night Graphite   |
| 30% Surface          | `#111521` Deep Graphite    |
| 30% Elevated Surface | `#181D2B` Elevated Surface |
| 10% Accent           | `#6C5CE7` Muted Indigo     |
| Accent Hover         | `#7C70F2`                  |
| Accent Pressed       | `#5A4BD5`                  |
| Soft Accent          | `#8D84FF`                  |
| Text Primary         | `#F5F7FA`                  |
| Text Secondary       | `#B5BBC8`                  |
| Text Muted           | `#858C9D`                  |
| Border               | `#252B3A`                  |
| Focus Ring           | `rgba(141,132,255,.45)`    |
| Success              | `#22C55E`                  |
| Warning              | `#F59E0B`                  |
| Error                | `#FF6B6B`                  |
| Info                 | `#60A5FA`                  |
| Skeleton Base        | `#151A26`                  |
| Skeleton Shine       | `#232A3B`                  |

### Light Theme

| Role                 | Color                  |
| -------------------- | ---------------------- |
| 60% Base             | `#F7F8FB` Soft Cloud   |
| 60% Secondary Base   | `#FFFFFF` Pure Surface |
| 30% Surface          | `#EEF1F7` Cool Surface |
| 30% Elevated Surface | `#FFFFFF`              |
| 10% Accent           | `#6C5CE7` Muted Indigo |
| Accent Hover         | `#5F50DA`              |
| Accent Pressed       | `#4E42BF`              |
| Text Primary         | `#111521`              |
| Text Secondary       | `#4B5565`              |
| Text Muted           | `#7B8495`              |
| Border               | `#DDE2EC`              |
| Focus Ring           | `rgba(108,92,231,.28)` |
| Success              | `#16A34A`              |
| Warning              | `#D97706`              |
| Error                | `#DC2626`              |
| Info                 | `#2563EB`              |
| Skeleton Base        | `#E9EDF5`              |
| Skeleton Shine       | `#F6F8FC`              |

---

## 5. Design Tokens

```txt
font.display: rounded premium sans, 700
font.heading: rounded premium sans, 600
font.body: rounded premium sans, 400
font.label: rounded premium sans, 500

space.1: 4px
space.2: 8px
space.3: 12px
space.4: 16px
space.5: 20px
space.6: 24px
space.8: 32px
space.10: 40px

radius.input: 10px
radius.card: 14px
radius.modal: 18px
radius.hero: 24px
radius.full: 999px

motion.fast: 120ms
motion.base: 180ms
motion.smooth: 260ms
motion.page: 420ms
ease.standard: cubic-bezier(.2,.8,.2,1)
ease.softOut: cubic-bezier(.16,1,.3,1)

breakpoint.mobile: 0–639px
breakpoint.tablet: 640–1023px
breakpoint.desktop: 1024–1439px
breakpoint.ultrawide: 1440px+
```

---

## 6. Navigation Architecture

### Unauthenticated

Top nav:

```txt
Logo | Explore | Features | Pricing | Help | Theme Toggle | Sign In / Create Account
```

Mobile:

```txt
Logo left, menu icon right, full-screen soft drawer.
```

### Authenticated User

Desktop:

```txt
Left sidebar: Home, Explore, Subscriptions, Playlists, History, Liked, Watch Later
Topbar: Search, Upload, Notifications, Profile
```

Mobile bottom nav:

```txt
Home | Explore | Upload | Subscriptions | Profile
```

### Creator

Creator Studio side nav:

```txt
Overview | Uploads | Analytics | Comments | Playlists | Settings
```

### Admin/Moderator

Admin nav:

```txt
Overview | Users | Videos | Reports | Moderation | Roles | Audit
```

### Search / Command

Search bar supports:

```txt
/ search videos
@ search channels
# search playlists
Ctrl/⌘ + K opens command palette
```

---

## 7. Complete Screen Inventory

| Screen                     |                         Route |     Auth | User      | Purpose              |
| -------------------------- | ----------------------------: | -------: | --------- | -------------------- |
| Splash/loading             |                    `/loading` |       No | All       | Brand loading        |
| Landing                    |                           `/` |       No | Visitor   | Introduce Streamly   |
| Login method selection     |                      `/login` |       No | Visitor   | Choose login type    |
| Email/password login       |             `/login/password` |       No | Visitor   | Password login       |
| Email OTP login            |            `/login/email-otp` |       No | Visitor   | OTP login            |
| Phone SMS OTP login        |                  `/login/sms` |       No | Visitor   | SMS login            |
| Phone WhatsApp OTP login   |             `/login/whatsapp` |       No | Visitor   | WhatsApp login       |
| MFA verification           |                  `/login/mfa` |  Partial | User      | Verify authenticator |
| Captcha challenge          |               `/auth/captcha` |  Partial | User      | Smart verification   |
| Signup start               |                     `/signup` |       No | Visitor   | Create account       |
| Email OTP verification     |        `/signup/verify-email` |  Partial | New user  | Verify email         |
| Optional phone setup       |               `/signup/phone` |  Partial | New user  | Add phone            |
| Phone verification         |        `/signup/verify-phone` |  Partial | New user  | Verify phone         |
| Authenticator setup        |           `/signup/mfa/setup` |  Partial | New user  | Setup MFA            |
| Authenticator verification |          `/signup/mfa/verify` |  Partial | New user  | Confirm MFA          |
| Auth success               |               `/auth/success` |  Partial | User      | Smooth transition    |
| Forgot password            |            `/forgot-password` |       No | Visitor   | Request reset        |
| Reset password             |             `/reset-password` |       No | Visitor   | Set new password     |
| Home feed                  |                       `/home` |      Yes | User      | Personalized videos  |
| Explore/trending           |                    `/explore` | Optional | All       | Discover content     |
| Subscriptions              |              `/subscriptions` |      Yes | User      | Followed creators    |
| Search results             |                     `/search` | Optional | All       | Find videos          |
| Video watch                |                  `/watch/:id` | Optional | All       | Watch video          |
| Comments panel             |         `/watch/:id/comments` | Optional | All       | Discuss video        |
| Shorts/discovery           |                   `/discover` |      Yes | User      | Fast discovery       |
| Channel profile            |                `/channel/:id` | Optional | All       | Creator page         |
| Edit profile               |           `/settings/profile` |      Yes | User      | Profile editing      |
| Upload video               |              `/studio/upload` |      Yes | Creator   | Upload video         |
| Upload progress            |     `/studio/upload/progress` |      Yes | Creator   | Track upload         |
| Edit video metadata        |     `/studio/videos/:id/edit` |      Yes | Creator   | Manage video         |
| Creator dashboard          |                     `/studio` |      Yes | Creator   | Overview             |
| Creator analytics          |           `/studio/analytics` |      Yes | Creator   | Performance          |
| My videos                  |              `/studio/videos` |      Yes | Creator   | Manage library       |
| Playlists                  |                  `/playlists` |      Yes | User      | User playlists       |
| Playlist details           |              `/playlists/:id` | Optional | All       | Playlist view        |
| Create/edit playlist       |           `/playlists/editor` |      Yes | User      | Manage playlist      |
| Watch history              |                    `/history` |      Yes | User      | Continue watching    |
| Liked videos               |                      `/liked` |      Yes | User      | Liked content        |
| Watch later                |                `/watch-later` |      Yes | User      | Saved content        |
| Notifications              |              `/notifications` |      Yes | User      | Updates              |
| Account settings           |           `/settings/account` |      Yes | User      | Account basics       |
| Security settings          |          `/settings/security` |      Yes | User      | Security overview    |
| MFA settings               |      `/settings/security/mfa` |      Yes | User      | Manage MFA           |
| Sessions/devices           | `/settings/security/sessions` |      Yes | User      | Active sessions      |
| Privacy settings           |           `/settings/privacy` |      Yes | User      | Privacy controls     |
| Theme settings             |             `/settings/theme` |      Yes | User      | Appearance           |
| Admin dashboard            |                      `/admin` |      Yes | Admin     | Platform overview    |
| User management            |                `/admin/users` |      Yes | Admin     | Manage users         |
| Moderation queue           |           `/admin/moderation` |      Yes | Mod/Admin | Review content       |
| Reports/flags              |              `/admin/reports` |      Yes | Mod/Admin | Handle reports       |
| 404                        |                           `*` |       No | All       | Missing page         |
| 500/error                  |                      `/error` |       No | All       | System error         |
| Maintenance                |                `/maintenance` |       No | All       | Planned downtime     |
| No internet                |                   local state |       No | All       | Offline recovery     |
| Global loading             |                     app state |       No | All       | Loading shell        |
| Global empty               |                     app state |       No | All       | Empty reusable       |

---

# 8. Detailed Screen-by-Screen Plan

## Auth Screens

### Screen: Splash / Loading

**Route:** `/loading`
**Purpose:** Brand entry and app initialization.
**Primary action:** None.
**Layout:** Center Streamly motion mark, small tagline below, quiet progress line.
**Content:** Logo, “Your world, in motion.”
**Components:** Logo mark, progress bar, skeleton background.
**Motion:** Stream line draws in, play triangle fades, 700ms settle.
**States:** loading, network slow, retry.
**Psychology:** Sets calm anticipation.
**Accessibility:** Reduced motion uses fade only.
**API:** Session refresh, config bootstrap.

---

### Screen: Landing Page

**Route:** `/`
**Purpose:** Convert visitor into viewer or creator.
**Primary action:** Create account.
**Secondary:** Sign in, Explore.
**Layout:** Hero left, cinematic video card carousel right, compact top nav.
**Content:** “Your world, in motion.”, feature preview, trust/security notes.
**Components:** Hero headline, CTA buttons, video preview cards, nav, theme toggle.
**Motion:** Hero text stagger, carousel slow parallax, CTA hover glow.
**States:** unauthenticated, authenticated redirect.
**Psychology:** Curiosity through cinematic previews.
**Accessibility:** Hero contrast, keyboard nav.
**API:** Public videos, trending previews.

---

### Screen: Login Method Selection

**Route:** `/login`
**Purpose:** Let user choose preferred login.
**Primary action:** Continue with selected method.
**Layout:** Split cinematic left panel, auth card right.
**Content:** Email/password, Email OTP, SMS OTP, WhatsApp OTP.
**Components:** Auth tabs, method cards, smart verification note.
**Motion:** Tab underline slide, card fade.
**States:** captcha required, disabled method, loading.
**Psychology:** Choice without overwhelm.
**API:** Auth login start, captcha risk status.

---

### Screen: Email / Password Login

**Route:** `/login/password`
**Purpose:** Standard login.
**Primary action:** Continue.
**Content:** Email, password, forgot password, remember device 30 min.
**Components:** Input fields, password reveal, checkbox, CTA.
**Motion:** Input focus border glow, error shake 120ms.
**States:** invalid credentials, MFA required, captcha required.
**Microcopy:** “Welcome back. Continue where you left off.”
**API:** Login start, MFA challenge, captcha.

---

### Screen: Email OTP Login

**Route:** `/login/email-otp`
**Purpose:** Passwordless email login.
**Primary action:** Send code / Verify code.
**Content:** Email input, OTP field, resend timer.
**Components:** OTP six-box input, resend cooldown, method switch.
**Motion:** OTP boxes fill with soft pop.
**States:** sent, expired, too many attempts.
**Microcopy:** “We’ll send a short code to your email.”
**API:** Email OTP challenge, verify OTP.

---

### Screen: Phone SMS OTP Login

**Route:** `/login/sms`
**Purpose:** Phone login with SMS.
**Primary action:** Send SMS code.
**Content:** Phone input, OTP verify, country selector.
**Components:** Phone input, OTP field, resend timer.
**Motion:** Smooth field transition from phone to OTP.
**API:** SMS OTP challenge, verify OTP.

---

### Screen: Phone WhatsApp OTP Login

**Route:** `/login/whatsapp`
**Purpose:** Login using WhatsApp OTP.
**Primary action:** Send WhatsApp code.
**Visual:** Green WhatsApp icon only as functional state, not brand color.
**Microcopy:** “Code arrives on WhatsApp. Standard network availability applies.”
**API:** WhatsApp OTP challenge, verify OTP.

---

### Screen: MFA Verification

**Route:** `/login/mfa`
**Purpose:** Verify authenticator code.
**Primary action:** Verify.
**Secondary:** Use recovery/help, trust this device.
**Content:** Six-digit code input, device trust explanation.
**Motion:** Success ring around shield icon.
**Psychology:** Security reassurance, not fear.
**Microcopy:** “One quick check to keep your account protected.”
**API:** MFA verify, MFA trust token.

---

### Screen: Captcha Challenge

**Route:** `/auth/captcha`
**Purpose:** Risk-based bot check.
**Primary action:** Verify and continue.
**Content:** Turnstile block, explanation.
**Visual:** Minimal security panel, no alarming red.
**Microcopy:** “A quick verification keeps Streamly smooth for everyone.”
**API:** Captcha verify, risk trust TTL.

---

### Screen: Signup Start

**Route:** `/signup`
**Purpose:** Begin account creation.
**Primary action:** Create account.
**Content:** Name, email, password, terms.
**Components:** Password strength, inline validation.
**Motion:** Password rules check off smoothly.
**Psychology:** Progress clarity.
**API:** Signup start.

---

### Screen: Email OTP Verification

**Route:** `/signup/verify-email`
**Purpose:** Verify ownership.
**Primary action:** Verify email.
**Content:** OTP input, resend timer.
**Microcopy:** “Enter the code sent to your email.”
**API:** Signup email verify.

---

### Screen: Optional Phone Setup

**Route:** `/signup/phone`
**Purpose:** Add optional phone.
**Primary action:** Add phone.
**Secondary:** Skip for now.
**Microcopy:** “Add a phone for easier recovery. You can skip this.”
**Psychology:** User control reduces friction.
**API:** Phone start.

---

### Screen: Phone Verification

**Route:** `/signup/verify-phone`
**Purpose:** Verify phone by SMS or WhatsApp.
**Primary action:** Verify code.
**Components:** Channel switch, OTP input.
**API:** Phone verify.

---

### Screen: Authenticator Setup

**Route:** `/signup/mfa/setup`
**Purpose:** Setup required authenticator MFA.
**Primary action:** Scan QR and continue.
**Content:** QR card, manual key, steps.
**Visual:** Secure premium setup card.
**Microcopy:** “Add Streamly to your authenticator app.”
**API:** MFA setup secret.

---

### Screen: Authenticator Verification

**Route:** `/signup/mfa/verify`
**Purpose:** Confirm authenticator works.
**Primary action:** Verify code.
**Motion:** Shield completes with subtle pulse.
**API:** MFA enable.

---

### Screen: Auth Success

**Route:** `/auth/success`
**Purpose:** Smooth transition into app.
**Content:** “You’re in. Let’s continue.”
**Motion:** Logo mark draws, route crossfade to home.
**API:** Current user bootstrap.

---

### Screen: Forgot Password

**Route:** `/forgot-password`
**Purpose:** Request reset.
**Primary action:** Send reset instructions.
**Content:** Email input.
**Microcopy:** “We’ll help you get back in securely.”
**API:** Password reset request.

---

### Screen: Reset Password

**Route:** `/reset-password`
**Purpose:** Set new password.
**Content:** New password, confirm password, strength.
**API:** Password reset confirm.

---

## Core Viewer Screens

### Screen: Home Feed

**Route:** `/home`
**Purpose:** Personalized watch entry.
**Primary action:** Play video.
**Layout:** Desktop sidebar + top search + responsive video grid. Mobile bottom nav.
**Content:** Continue watching, recommended, creators you follow, fresh picks.
**Components:** Video cards, channel chips, skeleton grid.
**Motion:** Cards fade-up in rows, hover preview after 450ms.
**Psychology:** Personal relevance and calm discovery.
**States:** empty feed suggests Explore and subscriptions.
**API:** Videos list, watch history, subscriptions.

---

### Screen: Explore / Trending

**Route:** `/explore`
**Purpose:** Discover content outside bubble.
**Content:** Trending, categories, creator spotlights.
**Motion:** Category chips slide horizontally.
**API:** Public videos, trending.

---

### Screen: Subscriptions Feed

**Route:** `/subscriptions`
**Purpose:** Followed creators’ latest content.
**Content:** Latest uploads, creator filter row.
**Empty:** “Follow creators to build your Streamly flow.”
**API:** Subscriptions, videos by subscribed channels.

---

### Screen: Search Results

**Route:** `/search?q=`
**Purpose:** Find videos/channels/playlists.
**Layout:** Search header, filters, results list/grid.
**Components:** Filter chips, result cards, channel cards.
**Motion:** Results crossfade when filters change.
**API:** Search videos/users/playlists.

---

### Screen: Video Watch Page

**Route:** `/watch/:id`
**Purpose:** Immersive playback.
**Layout:** Large video left, recommendations right. Mobile stacks video, actions, comments.
**Content:** Player, title, creator row, like/save/share, description, comments.
**Components:** Video player, action buttons, subscribe button.
**Motion:** Player fades from thumbnail to video, controls auto-hide.
**States:** buffering, private, deleted, unavailable.
**Psychology:** Calm focus, low distraction.
**API:** Video detail, stream endpoint, comments, likes, subscriptions.

---

### Screen: Comments Panel

**Route:** `/watch/:id/comments`
**Purpose:** Discussion.
**Content:** Comment input, top comments, replies.
**Motion:** Bottom sheet on mobile, side panel on desktop.
**States:** comments disabled, empty, loading.
**API:** Comments CRUD.

---

### Screen: Shorts / Discovery

**Route:** `/discover`
**Purpose:** Lightweight discovery.
**Important:** Avoid addictive trap. Use session quality.
**Layout:** One vertical video/card at a time, clear exit, progress.
**Content:** Short previews, creator, save, open full video.
**Psychology:** Curiosity with control.
**API:** Recommended short videos.

---

### Screen: Channel Profile

**Route:** `/channel/:id`
**Purpose:** Creator identity and library.
**Content:** Cover, avatar, subscribe, stats, tabs: Videos, Playlists, About.
**Motion:** Cover parallax subtle.
**API:** User/channel profile, videos, playlists.

---

### Screen: Edit Profile

**Route:** `/settings/profile`
**Purpose:** Manage public identity.
**Content:** Avatar, cover, name, handle, bio.
**Components:** Image uploader, preview.
**API:** Profile update, avatar/cover upload.

---

## Creator Screens

### Screen: Upload Video

**Route:** `/studio/upload`
**Purpose:** Upload content.
**Layout:** Dropzone left, requirements/help right.
**Content:** Drag video, file rules, privacy note.
**Motion:** Dropzone border brightens, upload begins with progress.
**API:** Video upload, S3 media.

---

### Screen: Upload Progress

**Route:** `/studio/upload/progress`
**Purpose:** Track processing.
**Content:** Upload %, thumbnail generation, metadata next.
**Motion:** Smooth progress, not jumpy.
**API:** Upload status, thumbnail job.

---

### Screen: Edit Video Metadata

**Route:** `/studio/videos/:id/edit`
**Purpose:** Publish-ready details.
**Content:** Title, description, thumbnail, visibility, playlist.
**Components:** Preview card, form sections.
**API:** Video update, publish/unpublish.

---

### Screen: Creator Studio Dashboard

**Route:** `/studio`
**Purpose:** Creator overview.
**Content:** Views, watch time, likes, subscribers, recent videos.
**Motion:** Count-up numbers, chart reveal.
**API:** Dashboard stats.

---

### Screen: Creator Analytics

**Route:** `/studio/analytics`
**Purpose:** Understand performance.
**Content:** Views graph, top videos, audience retention-ready block.
**Psychology:** Encouragement not pressure.
**API:** Analytics/dashboard.

---

### Screen: My Videos

**Route:** `/studio/videos`
**Purpose:** Manage uploads.
**Content:** Table/list of videos, status, visibility, actions.
**Components:** Compact table, bulk actions.
**API:** Owner videos CRUD.

---

## Library Screens

### Screen: Playlists

**Route:** `/playlists`
**Purpose:** Organize videos.
**Content:** User playlists, create button.
**Empty:** “Start a collection for stories you want to revisit.”
**API:** Playlists list.

---

### Screen: Playlist Details

**Route:** `/playlists/:id`
**Purpose:** Watch a curated collection.
**Content:** Playlist hero, video list, play all.
**API:** Playlist videos.

---

### Screen: Create / Edit Playlist

**Route:** `/playlists/editor`
**Purpose:** Manage playlist metadata.
**Content:** Name, description, privacy, reorder videos.
**API:** Playlist CRUD.

---

### Screen: Watch History

**Route:** `/history`
**Purpose:** Resume content.
**Content:** Timeline grouped by date.
**API:** Watch history.

---

### Screen: Liked Videos

**Route:** `/liked`
**Purpose:** Return to liked content.
**API:** Likes.

---

### Screen: Watch Later

**Route:** `/watch-later`
**Purpose:** Saved videos.
**Content:** Saved list, remove action.
**API:** Playlists/saved videos.

---

### Screen: Notifications

**Route:** `/notifications`
**Purpose:** Updates without noise.
**Content:** Uploads, comments, security notices.
**Psychology:** Meaningful notifications only.
**API:** Notifications if available, fallback events.

---

## Settings Screens

### Screen: Account Settings

**Route:** `/settings/account`
**Purpose:** Basic account data.
**Content:** Email, phone, username, delete account entry.
**API:** Current user, update account.

---

### Screen: Security Settings

**Route:** `/settings/security`
**Purpose:** Security overview.
**Content:** MFA status, sessions, password, trusted device.
**API:** Security/MFA/session endpoints.

---

### Screen: MFA Settings

**Route:** `/settings/security/mfa`
**Purpose:** Manage authenticator.
**Content:** Enabled state, regenerate flow, recovery guidance.
**API:** MFA setup/disable/verify.

---

### Screen: Sessions / Devices

**Route:** `/settings/security/sessions`
**Purpose:** See active sessions.
**Content:** Device, browser, IP region approximation, last used, revoke.
**API:** Sessions, logout all.

---

### Screen: Privacy Settings

**Route:** `/settings/privacy`
**Purpose:** Control visibility.
**Content:** Profile visibility, history settings, comments preferences.
**API:** User preferences.

---

### Screen: Theme Settings

**Route:** `/settings/theme`
**Purpose:** Light/dark/system theme.
**Content:** Theme cards with previews.
**Motion:** Theme transition crossfade.
**API:** Local/user preference.

---

## Admin / Moderation Screens

### Screen: Admin Dashboard

**Route:** `/admin`
**Purpose:** Platform overview.
**Content:** Users, uploads, reports, moderation queue.
**Visual:** Dense but calm cards.
**API:** Admin stats.

---

### Screen: User Management

**Route:** `/admin/users`
**Purpose:** Manage users safely.
**Content:** Search, role, status, actions.
**Components:** Data table, role badges.
**API:** RBAC/user admin.

---

### Screen: Moderation Queue

**Route:** `/admin/moderation`
**Purpose:** Review flagged content.
**Content:** Video/comment cards, reasons, actions.
**Psychology:** Reduce moderator fatigue.
**API:** Reports/moderation.

---

### Screen: Reports / Flags

**Route:** `/admin/reports`
**Purpose:** Resolve user reports.
**Content:** Report details, evidence, decision history.
**API:** Reports.

---

## System Screens

### Screen: 404

**Purpose:** Missing route.
**Microcopy:** “This path drifted out of frame.”
**CTA:** Go home, Explore.
**Visual:** Minimal Streamly mark.

### Screen: 500

**Purpose:** Server failure.
**Microcopy:** “Something paused unexpectedly.”
**CTA:** Retry.

### Screen: Maintenance

**Purpose:** Planned downtime.
**Microcopy:** “Streamly is tuning the experience.”
**Visual:** Calm progress line.

### Screen: No Internet

**Purpose:** Offline state.
**Microcopy:** “You’re offline. We’ll reconnect when the signal returns.”
**Components:** Retry, cached pages if available.

### Global Loading

**Use:** Skeletons, not spinners where possible.

### Global Empty

**Use:** Friendly, action-oriented, never blame user.

---

# 9. Auth Flow UX

The signup flow should be staged with a visible progress rail:

```txt
Account → Email → Phone optional → Authenticator → Ready
```

Login should feel flexible:

```txt
Choose method → verify first factor → smart captcha if needed → MFA if trust missing → enter app
```

**MFA trust token UX:**
Show this as “Remember this device for 30 minutes” with an info tooltip:

```txt
We’ll skip the authenticator step briefly on this trusted device. You can revoke sessions anytime.
```

**Captcha UX:**
Only appears when risk is detected. It should be framed as protection, not punishment.

**Resend cooldown:**
Use calm timer:

```txt
Send again in 42s
```

**Suspicious login:**
Use neutral language:

```txt
We noticed a new sign-in context. Please verify once more.
```

---

# 10. Video Experience UX

Video cards should include:

```txt
Thumbnail
Duration
Title
Creator avatar/name
Views
Age
Progress bar if watched
Hover preview on desktop
Save menu
```

Watch page priority:

```txt
1. Player
2. Title and creator
3. Primary actions
4. Description
5. Comments
6. Recommendations
```

Buffering should use a thin progress shimmer, not a giant spinner.

Private/unavailable state:

```txt
This video is not available to watch right now.
```

---

# 11. Creator Experience UX

Upload should feel like publishing a story, not filling a form.

Upload sequence:

```txt
Select file → Uploading → Processing → Details → Visibility → Publish
```

Creator dashboard should celebrate progress subtly:

```txt
“Your videos reached 2.4k views this week.”
```

Avoid guilt metrics like “You are losing viewers.” Use constructive guidance:

```txt
“Your shorter titles performed better this week.”
```

---

# 12. Admin / Moderation UX

Admin UI should be functional, dense, and safe.

Use:

```txt
confirm dialogs
reason fields
undo where safe
audit notes
role badges
permission explanations
```

Destructive actions require typed confirmation only for major actions.

---

# 13. Component Library

| Component       | Variants                                | Motion               |
| --------------- | --------------------------------------- | -------------------- |
| Button          | primary, secondary, ghost, danger, icon | press scale 0.98     |
| Input           | text, password, email, phone            | focus glow           |
| OTP Input       | 4/6 digit                               | digit pop            |
| Tabs            | underline, pill                         | sliding indicator    |
| Modal           | center, side sheet                      | fade + scale         |
| Video Card      | compact, large, history                 | hover lift           |
| Channel Card    | horizontal, grid                        | avatar glow          |
| Comment Card    | root, reply                             | expand replies       |
| Toast           | success, error, info                    | slide from bottom    |
| Skeleton        | card, line, avatar                      | soft shimmer         |
| Progress        | upload, processing                      | smooth interpolation |
| Badge           | role, status, visibility                | no motion            |
| Tooltip         | info, warning                           | fade                 |
| Search Bar      | compact, command                        | expand on focus      |
| Nav Item        | sidebar, bottom                         | active glow          |
| MFA QR Card     | setup, verified                         | shield pulse         |
| Captcha Block   | Turnstile                               | calm bordered panel  |
| Upload Dropzone | idle, hover, uploading                  | border pulse         |
| Video Controls  | desktop/mobile                          | auto-hide            |

---

# 14. Motion Design System

```txt
Page transition: 320–420ms fade + 8px rise
Modal: 220ms scale 0.98 → 1
Sheet: 260ms slide
Card hover: 160ms lift 2px
Button press: 90ms scale
Skeleton: 1400ms shimmer
OTP success: 260ms border sweep
MFA success: 420ms shield pulse
Video hover preview: starts after 450ms
Comments panel: 260ms slide/fade
Reduced motion: opacity-only transitions
```

---

# 15. Ethical Engagement Strategy

Streamly should increase love for the product through quality:

```txt
Personalized sections
Continue watching clarity
Creator encouragement
Meaningful recommendations
Soft completion feedback
Watch history memory
Clear save/playlist flows
No deceptive notifications
No guilt loops
No aggressive infinite-scroll traps
```

Use session quality prompts:

```txt
“You’ve built a good queue for later.”
```

Not:

```txt
“Don’t leave now.”
```

---

# 16. Content and Microcopy

**Login:**
“Welcome back. Continue where you left off.”

**Signup:**
“Create your space for stories in motion.”

**OTP:**
“Enter the code we sent. It expires soon.”

**MFA:**
“One quick check to keep your account protected.”

**Captcha:**
“Quick verification. Smooth streaming for real people.”

**Upload:**
“Drop your video here. We’ll keep the flow moving.”

**Empty home:**
“Your feed is ready to learn what moves you.”

**Empty subscriptions:**
“Follow creators to build your personal stream.”

**Empty comments:**
“Start the conversation with something thoughtful.”

**No search results:**
“No matches yet. Try a simpler phrase.”

**Upload success:**
“Your video is ready to move.”

**Delete confirmation:**
“This action can’t be undone. Delete this video?”

**Trusted device:**
“We’ll remember this device for 30 minutes.”

---

# 17. Responsive Design Rules

**Mobile:** bottom nav, full-width cards, sheets instead of modals.
**Tablet:** two-column grids, collapsible sidebar.
**Desktop:** fixed sidebar + topbar, 3–5 column video grid.
**Ultrawide:** max content width, avoid stretched cards.
**Touch:** minimum 44px tap targets.
**Keyboard:** visible focus ring, logical tab order.

---

# 18. Accessibility Checklist

```txt
AA contrast minimum
Visible focus states
Keyboard navigable player controls
ARIA labels for icon buttons
Reduced motion support
Captions/subtitles-ready player area
Error text near fields
Color-independent states
Readable 14px+ UI text
Touch targets 44px+
```

---

# 19. Frontend Implementation Notes

Recommended route grouping:

```txt
app/
  auth/
  home/
  watch/
  channel/
  studio/
  settings/
  admin/
  components/
  design-system/
  lib/api/
  lib/auth/
  lib/theme/
```

Use:

```txt
theme provider
API client with refresh handling
protected route guards
role-based route gates
query caching for feeds
optimistic likes/comments
upload progress state machine
video Range streaming support
S3 media URL handling through backend responses
```

Keep UI state separate from auth/security state.

---

# 20. Final Deliverables

## MVP Must-Have Screens

1. Landing
2. Login
3. Signup
4. MFA verification
5. Home feed
6. Video watch
7. Search
8. Channel profile
9. Upload video
10. Creator dashboard

## Top 10 “Woah” Polish Details

1. Streamly logo motion on load
2. Cinematic login split layout
3. Smooth tab underline
4. Video card hover preview
5. Soft thumbnail overlays
6. Premium skeleton loaders
7. Player controls fade beautifully
8. Upload progress feels alive
9. Theme transition crossfade
10. MFA success shield animation

## Top 10 Things to Avoid

1. Pure black backgrounds everywhere
2. Neon rainbow gradients
3. Heavy glassmorphism
4. Cluttered sidebars
5. Generic YouTube clone layouts
6. Aggressive notification prompts
7. Infinite scroll addiction patterns
8. Oversized empty states
9. Too many accent colors
10. Modal spam

## Suggested Build Order

```txt
1. Design tokens and theme system
2. App shell navigation
3. Auth flow
4. Home feed
5. Video watch page
6. Search and explore
7. Profile/channel
8. Upload flow
9. Creator studio
10. Settings/security
11. Admin/moderation
12. Motion polish and accessibility pass
```

This gives Streamly a premium frontend direction that matches the backend strength and the current logo/UI identity.

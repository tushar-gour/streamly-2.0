# Streamly Frontend Implementation Plan

## Completed Foundation

- Next.js App Router scaffold.
- Streamly design tokens.
- Dark/light token support.
- Central API client.
- Auth state store.
- Route guard helper.
- Real email/password login.
- Current-user bootstrap.
- Session refresh through backend cookies.
- Logout and logout-all API actions.
- Protected route guards.
- Guest route guards.
- Frontend unit tests.
- Real public feed binding.
- Real watch page detail binding.
- Real channel/profile binding where backend routes exist.
- Real history, liked videos, playlists, and subscriptions binding.
- App navigation.
- Auth layout.
- Reusable UI primitives.
- Screen pages for core flows.

## Build Order

1. Connect upload flow with progress state machine.
2. Connect advanced auth platform routes.
3. Build settings and security screens.
4. Build admin moderation views.
5. Add visual QA pass against screen images.
6. Add accessibility audit.

## Current Shell Routes

- `/`
- `/loading`
- `/login`
- `/login/methods`
- `/login/email-otp`
- `/login/sms`
- `/login/whatsapp`
- `/login/mfa`
- `/auth/captcha`
- `/signup`
- `/home`
- `/explore`
- `/search`
- `/subscriptions`
- `/playlists`
- `/history`
- `/liked`
- `/watch-later`
- `/notifications`
- `/channel/[username]`
- `/channel/me`
- `/watch/[videoId]`
- `/playlists/[playlistId]`
- `/studio`
- `/studio/upload`
- `/settings`
- `/admin`
- `/offline`
- `/empty`
- `not-found`

## Known Gaps

- Upload flow awaits final API wiring.
- Advanced auth screens are prepared, but only email/password login is wired.
- Watch later remains a real empty state because no matching backend endpoint is available.
- Notifications remain a real empty state because no matching backend endpoint is available.
- Channel pages are authenticated because the current backend channel profile route is protected.

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
- App navigation.
- Auth layout.
- Reusable UI primitives.
- Screen pages for core flows.

## Build Order

1. Wire real feed and profile data with TanStack Query.
2. Connect advanced auth platform routes.
3. Build upload flow with progress state machine.
4. Build settings and security screens.
5. Build admin moderation views.
6. Add visual QA pass against screen images.
7. Add accessibility audit.

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
- `/studio`
- `/studio/upload`
- `/settings`
- `/admin`
- `/offline`
- `/empty`
- `not-found`

## Known Gaps

- Upload flow awaits final API wiring.
- Video feed intentionally shows empty state until real API data is connected.
- Advanced auth screens are prepared, but only email/password login is wired.
- Search, feed, playlist, subscription, notification, and channel routes await real API data binding.

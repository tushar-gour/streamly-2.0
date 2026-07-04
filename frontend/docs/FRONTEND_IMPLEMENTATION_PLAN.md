# Streamly Frontend Implementation Plan

## Completed Foundation

- Next.js App Router scaffold.
- Streamly design tokens.
- Dark/light token support.
- Central API client.
- Auth state store.
- Route guard helper.
- App navigation.
- Auth layout.
- Reusable UI primitives.
- Screen pages for core flows.

## Build Order

1. Wire real auth login and session refresh.
2. Add protected route redirects.
3. Replace sample video data with TanStack Query calls.
4. Implement home feed and video watch data states.
5. Build upload flow with progress state machine.
6. Build settings and security screens.
7. Build admin moderation views.
8. Add visual QA pass against screen images.
9. Add frontend tests.
10. Add accessibility audit.

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
- `/watch/[videoId]`
- `/studio`
- `/studio/upload`
- `/settings`
- `/admin`
- `/offline`
- `/empty`
- `not-found`

## Known Gaps

- Real form submission is not wired.
- Real protected route redirects are not active.
- Upload flow awaits final API wiring.
- Video feed intentionally shows empty state until real API data is connected.
- Frontend test suite is not added yet.

# Frontend implementation progress

## Iteration 1 — Creator foundation (PARTIAL, not release-ready)

Base: main at a2596168633ba94d7252564847aff8c63e1e8db4.
Branch: frontend/production-completion.

### Implemented, awaiting runtime verification

- [ ] Creator overview: fetch actual channel totals and paginated owner uploads.
- [ ] Publish: required title, description, videoFile and thumbnail multipart
  fields; upload-byte progress; separate server-confirmation state; no automatic
  retries of a potentially successful mutation.
- [ ] Validate media MIME and per-file 50 MiB limit; unit tests added.
- [ ] Gate upload route on video:create; backend remains authoritative.

### Acceptance checks

- Verify success, empty, offline, authorization failure, retry and pagination
  against an isolated backend test environment.
- Run lint, typecheck, test and build; inspect desktop/tablet/mobile, both themes,
  keyboard and screen reader behavior; measure Web Vitals.
- Verify actual media upload and playback with configured storage.
- No acceptance item is considered passed yet.

### Pending, in priority order

1. Audit advanced auth controller/service and legacy login, then implement
   challenge-driven password/OTP/MFA/captcha/signup with server-issued state.
2. Audit session refresh, account-scoped cache cleanup and authorization;
   verify no stale private data across accounts.
3. Finish studio video edit, visibility toggle and deletion; check ownership.
4. Implement supported account/profile/security actions.
5. Complete supported viewer/library mutations and pagination.
6. Make unsupported admin, watch-later, notifications and other features
   explicitly unavailable unless supported by real backend routes.
7. Global error/offline/loading handling, visual and accessibility QA.
8. Full fresh audit, CI, integration/browser and performance checks.

### Architectural decisions and constraints

- Retain Next.js App Router, existing API client, Zustand and TanStack Query;
  isolate upload transport because fetch does not expose upload-byte progress.
- Backend video publish immediately makes video public; no draft/status endpoint
  was found in inspected video routes. Never represent byte upload completion as
  successful publication or thumbnail processing completion.
- Backend app does not mount admin, notifications or dedicated watch-later
  routers. Existing admin API module references nonexistent routes; do not call
  them or invent responses.
- Existing source documentation is not always current; implementation wins.
- GitHub connector provides source and write access. Local git clone failed
  because github.com DNS could not resolve. Binary visual references have not
  been inspected; browser verification and Web Vitals are unmeasured.
- No backend modifications, merge or deployment.

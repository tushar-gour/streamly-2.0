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

## Iteration 2 — Smart login and security audit (implementation unverified)

- [ ] Replace four login entry screens with one challenge-driven form and typed
  API module. OTP and MFA use backend challenge identifiers. Captcha uses the
  backend-provided Turnstile site key. No standalone MFA login, no simulated
  verification, no client-persisted passwords or refresh/trust tokens.
- [ ] Clear query cache on identity changes to reduce cross-account data leakage.
- [ ] Correct iteration 1 route gate: current-user does not return roles or
  permissions in the inspected backend. Upload requires authentication locally;
  actual video:create permission is enforced by the API. No client-side role
  inference or backend authorization bypass.

### Release-blocking backend findings

- Legacy POST /users/login issues a session without MFA or captcha checks.
  New UI uses /users/auth/login/start, but the old backend route remains usable.
- Signup verification returns a user without issuing an onboarding credential;
  later MFA setup and phone start require verifyJWT. Advanced login does not
  enforce onboardingStatus, so a full secure onboarding flow cannot be guaranteed.
- MFA verification issues device trust automatically; no explicit opt-out
  supported. MFA challenge verification does not compare its stored device
  fingerprint with the current device before accepting the code.
- Access token validation does not check session revocation; logout-all does
  not immediately invalidate already-issued access tokens.
- current-user returns no role/permission list; admin route discovery and
  capability UI cannot be authoritative. Admin APIs are absent.
- Password recovery and session enumeration/revoke-specific endpoints absent.
- Backend OTP and MFA consume challenges without an atomic conditional update;
  concurrency and replay protection need integration/security testing.
- No backend changes authorized. These issues must not be represented as fixed.

### Verification

Source inspection only; no integration/browser tests or performance measurements.
The new login form retains the password in component memory only while a
server-requested captcha is pending; it is cleared on challenge progression or
failure. Direct captcha/MFA URLs restart sign-in rather than accepting an
unbound code. The legacy store method remains for compatibility and needs
migration/testing. Signup UI remains incomplete.

## Iteration 3 — Studio management, settings and unsupported states

Implemented, awaiting verification:

- [ ] Edit title, description and optional thumbnail; publish/unpublish and
  delete own uploads with explicit confirmation. Invalidate relevant queries
  after mutations; never automatically retry toggle/delete.
- [ ] Account settings: full name, password change, logout-all and dark/light
  preference. No email change because backend does not reset email verification.
- [ ] Replace misleading empty states for unsupported notifications, watch later,
  and admin screens with explicit capability limitations.

Remaining: avatar/cover changes, system theme, playlist/comment/subscription
mutation audit, secure signup, safe refresh/revocation, all visual/runtime QA.
Existing backend ownership checks still limit elevated moderation. No admin
endpoint fabricated. The existing admin API module is unused and must be removed
or replaced after a full import audit.

Verification pending. No production deployment or merge.

## Verification checkpoint

- Draft pull request: https://github.com/tushar-gour/streamly-2.0/pull/1
- CI workflow: https://github.com/tushar-gour/streamly-2.0/actions/runs/45861346663
- CI source commit: eaec58ef91f6ab8a5467912227b5e51d1e9c997a.
- Added npm run test to the existing frontend CI job without suppressing failures.

Observed frontend CI state at this checkpoint:

- Install dependencies: success.
- Format check: failure.
- Lint: skipped.
- Typecheck: skipped.
- Test: skipped.
- Build: skipped.

The CI run above pertains to the source changes before this documentation-only
checkpoint. Local clone failed due to DNS; browser and Web Vitals measurements
remain unavailable. The connector returned no image bytes for the attempted
Creator Studio reference fetch. No visual comparison is claimed.

Further audit confirmed playlist create/update/delete/membership and comment
create/update/delete routes are present; current UI mostly reads these resources.
These are independent remaining implementation tasks, not completed work.
The next iteration should complete and test these workflows after resolving
the development runtime and CI access constraints.

Final checkpoint status: PARTIAL. Do not merge or deploy.

## Iteration 4 — Watch and discussion

- [ ] Comment creation, ownership-gated editing/deletion, comment likes and
  backend pagination.
- [ ] Playback error recovery, poster, share action, accessible comment anchor.
- [ ] Update video like count from the mutation response rather than refetching
  video detail (which increments views). Invalidate liked-video cache.
- [ ] Scope detail/comment query keys to account identity.

Verification pending; initial frontend CI installed dependencies but failed
formatting on eight changed files. Follow-up CI now emits formatting diffs and
runs lint, typecheck, test and build independently without hiding failures.

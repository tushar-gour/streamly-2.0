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

## CI verification and formatting repair

- Source checkpoint `6f3f5a1d52d3271167b3e3d22ce9c5c0792115a1`: lint, typecheck, test and build passed in [CI](https://github.com/tushar-gour/streamly-2.0/actions/runs/45861555254).
- Vitest: 7 test files, 19 tests passed. Next.js reported 102 kB shared first-load JS (build metric, not a Web Vital).
- Formatting failed; applied the actual Prettier diagnostic diff to the relevant files, preserving the later discussion implementation. Latest branch verification remains pending.
- No browser interaction, visual comparison or LCP/INP/CLS measurements are available.

## Iteration 5 — CI diagnostics

- CI for discussion implementation (`57b5669`): lint, typecheck, 19 tests
  (7 files), and production build passed. Formatting failed.
- Applied actual Prettier diff for the two discussion components; subsequent
  branch CI must verify the repair. No live browser or backend integration
  verification has been performed.
- Shared first-load JavaScript: 102 kB (Next.js build output, not a Web Vital).
- Status: PARTIAL; do not merge or deploy before remaining gates pass.

## Iteration 6 — Server security foundation

Recovered branch `9471753`: all six [CI jobs passed](https://github.com/tushar-gour/streamly-2.0/actions/runs/45862292294). Backend authorization is now explicit. No merge or deployment.

Implemented, verification pending: access tokens require a live session and an active account; refresh uses a conditional atomic rotation with fail-closed conflict handling; legacy login cannot bypass configured captcha or enabled MFA; OTP/MFA challenge consumption is conditional and atomic; MFA binds to device and user agent (IP changes alone do not invalidate the challenge); phone login requires verified ownership and OTP verification checks the current identifier. Added session security regression tests.

Pending: database-backed concurrency tests, OTP/MFA regression tests, onboarding credential flow, secure email change, MFA management, permission metadata, client refresh coordination, session APIs, remaining product APIs and frontend flows. Existing pending accounts cannot sign in until secure onboarding is completed. Concurrent duplicate refresh can revoke the affected session by design; client coordination is still required. Browser and visual verification remain unperformed.

## Iteration 7 — Scoped onboarding backend

Implemented pending verification: signup may resume only with the original credentials; new users receive their default role atomically with creation. Verified email yields a 10-minute onboarding-only JWT accepted only by MFA setup/verification, not normal access endpoints. MFA setup cannot overwrite an enabled factor; verification atomically enables the factor and activates the account. Phone verification requires the authenticated owner and the current number. Registration requires enabled OTP and MFA providers. Frontend enrollment and API documentation are next; no deployment.

## Iteration 8 — Signup UI and contract alignment

Signup is connected to the scoped onboarding backend: form, email OTP, manual authenticator key, TOTP verification, and sign-in after activation. Credentials and setup keys are held only in component memory. Restart resumes pending registration with the original credentials. OpenAPI source updated; backend CI now reports independent checks and formatter diffs without suppressing failures. QR rendering, phone enrollment UI, full integration verification and visual QA remain pending.

## Iteration 9 — Real database verification

Added isolated PostgreSQL 16 CI service; applies existing migrations only to the disposable CI database. Integration tests cover immediate access revocation, simultaneous refresh, concurrent OTP consumption, MFA device binding and onboarding/access token separation. Previous suite explicitly skipped database tests; do not count skipped cases as passed. Current results pending.

## Iteration 10 — Playlist workflows

Implemented playlist creation, metadata editing, deletion, adding from the watch page and removing existing items. List thumbnails now use the actual summary field. Backend membership writes operate on the unique playlist/video row instead of rewriting the entire collection; add/remove are idempotent. Input bounds match the database. Pending verification: ownership, simultaneous membership mutations, playlist privacy audit, keyboard/browser testing and formatter checks.

### Database CI repair

The first PostgreSQL job successfully applied migrations but exposed the existing fixture's over-length username (P2000) and two test call signatures missing optional-valued parameters. Corrected fixture and calls; no schema constraint or assertion was weakened. Re-run pending.

## Iteration 11 — Session management and RBAC metadata

Database job at `b3a52a6` passed after fixture repair; migration, integration and database-backed API contracts succeeded. Added owner-scoped session listing and revocation, current-session detection, and revocation of MFA trust records with all sessions. Login and current-user responses include authoritative role and permission names; upload guard restored. Legacy registration refuses to bypass configured advanced signup. Account settings exposes session management. New endpoints and integration behavior await verification.

## Iteration 12 — Browser verification infrastructure

Added a dedicated Chromium CI job using a disposable PostgreSQL database, seeded RBAC and test account, real API, production frontend build, screenshot artifacts and compact reference/browser contact sheets. Tests exercise login, playlist CRUD, session listing, theme selection, responsive overflow and studio/upload navigation. No backend responses are mocked. Browser tests do not yet include real video media or live OTP providers. Lab LCP/CLS are captured as diagnostic values only; INP and production performance remain unmeasured. Results pending.

## Iteration 13 — Watch Later and feed pagination

Added an additive Watch Later database model, owner-scoped idempotent save/remove API and status/list reads. Frontend watch page and Watch Later library now use these endpoints. Feed pagination uses server metadata and retains its title through loading/empty/error states. Video card thumbnails use lazy image loading; the inert video menu is removed. Migration, new API integration and browser checks pending. No production database was touched.

## Iteration 14 — CI repairs and reproducible formatting

At `3d3bc66`, the PostgreSQL integration, migration, backend tests, OpenAPI and Prisma jobs passed. Frontend lint, typecheck, tests and build passed independently of formatting. Backend typecheck and build failed on a Watch Later error constructor argument; corrected without changing the error status. Applied the formatter's reported changes. Browser startup failed on the inherited backend port; set an explicit frontend port and pin the Python interpreter used for contact-sheet generation. The browser journey has not yet run successfully. Reverification pending; no deployment.

## Iteration 15 — Shared visual and accessibility primitives

Corrected light-mode background, skeleton, surface and error colors; shared form fields, buttons, cards, theme control and mobile navigation now follow theme tokens. Theme persistence no longer overwrites stored light mode during initialization and tolerates storage restrictions. Offline retry is functional. These are source-level improvements; screenshot and interaction verification still required.

## Iteration 16 — Navigation and route accessibility

Desktop navigation no longer overlaps its footer at short viewport heights. Added creator studio and profile navigation, permission-aware administration and upload visibility, working keyboard search shortcut, mobile search/settings links, active route semantics and a skip link. This does not implement the missing notifications or moderation backend. Browser verification remains pending.

## Iteration 17 — Reference inspection and browser runner compatibility

CI run 45867408921 for `61d5430` passed all seven non-browser jobs, including complete frontend lint/typecheck/test/build, database migrations and integration, backend quality, Docker, OpenAPI and Prisma. Both applications started in the browser job; Chromium installation failed because the default runner selected Ubuntu 26.04, unsupported by the pinned Playwright version. Pinned Ubuntu 24.04 for the browser job. Successfully inspected contact sheets containing all 24 reference images; they use compact spacing, cinematic navy, subdued indigo, clear content hierarchy and restrained panels. No rendered application screenshots were available in that run. Applied reported formatting corrections to shared UI. Reverification pending.

## Iteration 18 — Profile media workflows

Connected profile photo and cover-image updates to the existing multipart user endpoints. Added local previews with object-URL cleanup, image type/size validation, cancel/retry, and account-scoped state updates. Server profile endpoints now use the existing image-specific upload middleware. Live media-provider upload and visual testing remain pending.

## Iteration 19 — Browser evidence and populated integration fixture

Run 45867991108 at `6953d05` passed all eight jobs. Real Chromium against the isolated API verified sign-in, playlist CRUD, session listing, theme switching and studio/upload routes. Settings passed horizontal-overflow checks at desktop, tablet and mobile sizes in the exercised themes. Inspected 11 captured screenshots and all 24 reference contact-sheet entries; populated feed, actual watch content, authentication artwork and visual density still require refinement. Studio-page lab metrics were LCP 96 ms and CLS 0.0458168724; no INP or production performance assertion. Extended the CI-only fixture with generated local WebM and thumbnail and browser tests for media metadata, video like, comment, playlist membership and Watch Later. These extended tests have not yet passed. No production data or media were modified.

## Remaining release gates

The implementation branch is not production-ready. Priority 0: complete independent authorization and unpublished-media privacy audit, safe concurrent client session refresh, verified email-change/recovery, and moderation capabilities. Priority 1: notifications, authenticator management and phone enrollment, remaining creator/profile/library workflows, verified media uploads and processing, realistic populated-content browser tests. Priority 2: every-route reference comparison at desktop/tablet/mobile in both themes, keyboard/focus and accessibility testing, production-like performance measurement including INP, and complete regression verification. The current passing smoke run covers only the stated journeys. Do not merge or deploy before closing these gates. Continue from the latest branch commit, preserving the earlier green checkpoint.

## Iteration 20 — Release reconciliation and privacy regression tests

Recovered exact head `f353b1a345edc6c3f695f1b21eba51b6b2df25eb`. [CI run 45868677875](https://github.com/tushar-gour/streamly-2.0/actions/runs/45868677875): six jobs passed; frontend format failed (lint/typecheck/test/build still executed), browser failed selecting the playlist after video metadata, save and like actions. Added explicit accessible select name and failure screenshot; corrected actual formatting diff. Reproduction tests added for unpublished detail/comment access, private playlist reads, history leakage and channel email disclosure. These tests are expected to fail against the recovered implementation; fixes and observed results must be recorded separately.

Fixed priority order: (P0) object authorization and media origin policy; session coordination and credential changes; admin permissions. (P1) outstanding product flows and isolated media processing. (P2) strict-type audit, every-screen visual and accessibility acceptance, representative performance, final exact-commit CI and rollback review. Preserve the prior verified checkpoint; no merge/deploy.

## Iteration 21 — Object visibility and staging isolation

IMPLEMENTED (verification pending): video detail and stream share a visibility check before side effects; all streamed responses are private/no-store so cached public responses cannot survive a visibility change at the API layer. Private comments are readable only by the video owner; unrelated likes are restricted to published content. Private playlists are owner-scoped and unpublished membership is excluded from read projections; watch history and liked-video queries filter unpublished videos at the database. Removed channel email disclosure. Upload staging moved outside the public static directory; legacy /temp paths blocked. Existing private Cloudinary origin URLs and publicly accessible S3/CDN configurations are NOT resolved by these API checks. Origin access policy, thumbnail routing, provider-level verification and legacy asset migration remain release blockers. Decisions: unpublished items are hidden from viewer libraries, existing memberships are retained; owners manage publication in Studio. No production storage or data touched.

### Verification — object visibility

VERIFIED: [reproduction run 45877123888](https://github.com/tushar-gour/streamly-2.0/actions/runs/45877123888) failed all five new privacy assertions (unpublished detail/comments returned 200, private playlist returned 200, history included hidden video, channel response exposed email). [Correction run 45877204399](https://github.com/tushar-gour/streamly-2.0/actions/runs/45877204399) passed all three PostgreSQL integration test files and the API contract suite, including owner/other-account assertions. Backend formatting failed; applied the exact Prettier diff without changing behavior. Stream cache policy and staging isolation require dedicated regression assertions. Origin security remains unverified.

## Iteration 22 — Single-flight session recovery

IMPLEMENTED, verification pending: one in-flight refresh per tab; browser Web Locks serialize across tabs, and a cookie current-user probe within the lock avoids rotating an already renewed session. API replay occurs at most once, only on an explicit pre-handler session-expired marker and replayable request body; no replay after identity change. Expected account header is checked server-side before executing protected actions, preventing a stale tab from silently acting under a replacement cookie identity. Storage events contain a random change marker only; other tabs clear identity/cache and re-bootstrap. Generation guard prevents stale bootstrap results replacing a newer sign-in. Logout failure no longer pretends local clearance confirms server revocation. Browsers without Web Locks or storage access have degraded multi-tab coordination; server rotation remains fail-closed. XHR uploads carry the identity guard but are not auto-retried. Integration and browser coverage pending.

### Session repair

CI run 45877522141 exposed syntax defects in the first session integration commit: a source replacement targeted the AuthStore declaration rather than its implementation, and a middleware catch brace was omitted. Corrected both, retained regression assertions. No verification claim for this commit until rerun.

### Verified checkpoint and session regression expansion

[Run 45877424668](https://github.com/tushar-gour/streamly-2.0/actions/runs/45877424668), exact source `ea674a0cc85b62d90ee59112cbd7430bab3dfe29`, passed all eight jobs. Extended real-API browser smoke passed: login, playlist CRUD/membership, video metadata, likes, comments, Watch Later, sessions, themes and creator routes. Studio lab LCP 96 ms, CLS 0.0741275849 (not production or INP evidence). Added session regression tests for expected-account mismatch (no mutation), expired marker, at-most-once replay and refusal to replay across identities. Exact latest verification pending.

### Session type repair

Run 45877863564 identified Web Locks' nested-promise TypeScript overload. The lock adapter now awaits the browser lock promise, preserving runtime flattening and the generic return contract without a cast. Applied the actual formatter diff for that run. Latest verification pending.

### Iteration 23 — session regression formatting reconciliation

- VERIFIED: PostgreSQL integration and API contracts passed on `5b662cd` ([run 45877952441](https://github.com/tushar-gour/streamly-2.0/actions/runs/45877952441)), including stale-account logout-all denial and invalid-session marker.
- IMPLEMENTED: applied CI-emitted Prettier diffs to both newly added regression suites; exact final commit CI remains required. The Web Locks generic return typing was corrected in `411c53d` without an assertion or suppression.

### Iteration 24 — credential mutation regression cases

- Added database regression cases for direct unverified email replacement and password change leaving existing sessions valid. Both are pending reproduction on the existing implementation. Email replacement must fail closed until a verified email-change workflow exists.

### Iteration 25 — credential mutation containment

- IMPLEMENTED: direct email replacement rejected server-side; full-name updates remain supported. This is containment, not completion of verified email change or password recovery.
- IMPLEMENTED: password replacement atomically checks the old credential hash and revokes existing sessions, trusted devices and outstanding OTP/MFA challenges; added password length/type validation, rate limiting and sign-out handling. Existing login issuance races still require a dedicated audit.
- IMPLEMENTED: delayed account-change responses no longer clear a newer frontend account. Regression CI pending.

### Iteration 26 — credential regression verified; format reconciliation

- VERIFIED: both credential vulnerabilities reproduced on `5dc5289` ([run 45878435583](https://github.com/tushar-gour/streamly-2.0/actions/runs/45878435583)); both expected denials resolved instead of rejecting.
- VERIFIED: database integration and security passed after correction on `9543a6c` ([run 45878517489](https://github.com/tushar-gour/streamly-2.0/actions/runs/45878517489)). Tests include unchanged verified email, revoked old access/refresh token, and successful new password comparison.
- IMPLEMENTED: reconcile CI formatter output. Exact commit full CI pending.
- Visual smoke artifacts on `ea674a0` inspected: desktop dark login, home, playlist and watch; settings at desktop/tablet/mobile in both themes; desktop light studio and upload. Contact sheets are not pixel-level acceptance, and the watch capture shows a loading spinner. Playback, seeking, every-screen responsive and WCAG acceptance remain open.

### Iteration 27 — S3 range regression reproduction

- VERIFIED: all eight CI jobs passed on `398d112` ([run 45878307513](https://github.com/tushar-gour/streamly-2.0/actions/runs/45878307513)), including single-flight unit regressions, backend identity mismatch and browser smoke. True concurrent multi-tab browser coverage remains open.
- Added four provider regressions for suffix/open-ended/oversized byte ranges. Existing parser uses the suffix length as the end offset and rejects otherwise valid ranges extending past the object size. Pending reproduction. Mocked S3 command tests are not real object-storage verification.

### Iteration 28 — S3 byte-range correction

- IMPLEMENTED: suffix ranges now end at the object boundary; explicit ends beyond object size clamp to the last byte; invalid zero-length suffixes and unsafe integer offsets are rejected. Regression CI pending. No live S3 object was accessed or changed.

### Iteration 29 — range regression reconciliation and release handoff

- VERIFIED: three of the four new S3 range regressions failed on the original parser ([run 45878794400](https://github.com/tushar-gour/streamly-2.0/actions/runs/45878794400)); the open-ended case already passed.
- IMPLEMENTED: applied the emitted formatter layout and explicitly reject unsafe raw end offsets before treating them as bounded ranges. Final exact-commit CI must pass.
- Next executable P0 task: implement authorized thumbnail delivery and private object-origin policy, then isolated real storage upload/stream/delete tests. Existing provider URLs may bypass application authorization. Do not mark release ready.
- Remaining release gates: verified email change and password recovery (direct replacement is blocked, not implemented), MFA/phone management, admin moderation, notifications, remaining creator/library flows, strict-type debt audit, complete responsive visual/WCAG testing, production-like performance, final PR/rollback review. No production changes.

## Iteration 30 — Private origin and mediated delivery

Recovered `704a56b`: [all 8 jobs passed](https://github.com/tushar-gour/streamly-2.0/actions/runs/45878976755). Implementation batch requires production AWS S3 with no custom/public endpoint, all four public access blocks, ACLs disabled and no bucket policy (dedicated bucket using identity IAM). S3 stores keys, not origin URLs. API presentation replaces media references with resource-scoped delivery endpoints; video/thumbnail visibility is checked per request; active profiles intentionally public. API responses no-store. Existing public Cloudinary and S3 URL records must be migrated before enabling this production policy; no live data altered. Verification pending.

| ID      | Priority/dependencies       | Status      | Acceptance / evidence                                                            |
| ------- | --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| SEC-01  | P0 dedicated private bucket | IMPLEMENTED | startup rejects public/legacy config, private storage test and migration pending |
| SEC-02  | P0 SEC-01                   | IMPLEMENTED | scoped thumbnail/video/profile routes, visibility and origin regression pending  |
| SEC-03  | P0                          | PENDING     | verified new email, reauth, replay and revocation                                |
| SEC-04  | P0                          | PENDING     | recovery with enumeration resistance, expiry, single use, revocation             |
| SEC-05  | P0                          | PENDING     | permission-scoped admin moderation/audit and denial tests                        |
| SEC-06  | P0                          | PENDING     | real simultaneous browser refresh, one rotation                                  |
| PROD-01 | P1 SEC-01/02                | PENDING     | isolated upload, processing, seek, replacement and cleanup                       |
| PROD-02 | P1                          | PENDING     | persistent notifications                                                         |
| PROD-03 | P1 SEC-03/04                | PENDING     | QR, recovery codes, secure phone enrollment                                      |
| PROD-04 | P1                          | PENDING     | creator, playlist privacy, subscription and library completion                   |
| QUAL-01 | P2                          | PENDING     | strict type audit and root-cause fixes                                           |
| QUAL-02 | P2                          | PENDING     | every screen in both themes at 3 widths, reference acceptance                    |
| QUAL-03 | P2                          | PENDING     | WCAG and realistic web vitals                                                    |
| REL-01  | all above                   | PENDING     | exact-head CI, independent diff review, deployment/rollback                      |

## Iteration 31 — Actual storage integration gate

SEC-01/02 and PROD-01 remain IMPLEMENTED, not verified. Added isolated MinIO object server and DB-backed multipart upload/range/image/visibility/owner-denial/replacement/deletion tests to CI. Added media signature and per-field validation, bounded FFmpeg duration probing, staging cleanup and partial upload rollback. Profile and thumbnail image reads use resource-scoped routes in S3 mode. Production example removes public base URL. No production access. Next: observe CI, repair failures, document AWS IAM and migration preflight, and run concurrent browser refresh.

## Iteration 32 — Storage runner repair and browser concurrency gate

Run [45882968546](https://github.com/tushar-gour/streamly-2.0/actions/runs/45882968546): existing unit/API suites and OpenAPI passed; storage infrastructure failed before tests (Docker Hub MinIO pull denied). Switched to pinned Quay image; no fallback to mocks. Applied actual CI formatter hunks. SEC-06 IMPLEMENTED: browser test removes only access cookie and reloads two actual documents sharing the same session, asserts exactly one refresh and both authenticated. Added play/seek assertions to existing generated WebM browser test. Documented AWS IAM, origin configuration, legacy migration, CDN restrictions and rollback gates. Verification pending.

## Iteration 33 — Storage infrastructure alternative and legacy gate

Quay MinIO pull also denied (401) in [run 45883311955](https://github.com/tushar-gour/streamly-2.0/actions/runs/45883311955). Changed diagnostic approach: pinned official SeaweedFS 4.55 Linux release, SHA-256 verified against GitHub release metadata, authenticating S3 server on loopback. No mock substitution. Added production read-only legacy reference gate, removed generated public avatar URLs from signup, disabled stale published-list caching, prevented FFmpeg signed URL logs, and ensured actual MIME drives avatar storage. Exact final CI pending. AWS public block/ownership/access-point policy and legacy copies must still be verified against deployment infrastructure.

## Iteration 34 — Credential challenge backend

SEC-03/04 IN_PROGRESS: added new email change and password recovery API with expiring high-entropy codes, queue job carrying ID only, hashed codes in DB, bounded attempts, same recovery shape for existing and missing accounts, password/MFA proof for email replacement, session-bound completion, atomic single-use transaction and revocation of sessions, trust and outstanding challenges. Recovery preserves MFA enrollment. No database migration required. Frontend, API contracts and integration tests still pending; live SendGrid and Redis verification are deployment gates.

### Iteration 35 — recovery UI and integration coverage

- SEC-02 and SEC-06 VERIFIED at 264f117: [CI #57](https://github.com/tushar-gour/streamly-2.0/actions/runs/45883623017), real storage and browser jobs passed; both tabs authenticated with one refresh, native video played and sought.
- SEC-01 IMPLEMENTED with verified isolated origin rejection; real AWS policy, legacy migration and CDN remain deployment-stage gates.
- PROD-01 partial: actual upload, range delivery, seeking, replacement, deletion and avatar/cover passed; durable processing state/failure handling remains.
- SEC-03/04 IMPLEMENTED: backend and frontend connected; tests for unknown account response, wrong/expired code, concurrent redemption, email session binding and revocation added. External email delivery and final CI pending.

### Iteration 36 — moderation hold

SEC-05 IMPLEMENTED (video scope): moderator permission video:publish:any guards all new admin routes, publication hold is transactional with durable reason/action record, DB CHECK plus conditional owner publication prevents races and republishing. Release leaves video unpublished. Admin UI calls actual endpoints. Broader comment moderation and reporting pending. CI and integration tests pending.

### Iteration 37 — notification persistence

PROD-02 IMPLEMENTED: migration-backed inbox, owner-scoped listing/read/read-all, transactionally persisted credential, moderation and subscription events. No provider dependency or mock data. UI uses authenticated query scope, real mutation controls and retry states. Integration and browser verification pending.

### Iteration 38 — notification regressions and local QR

- SEC-03/04: all 10 auth-security database tests passed in [run #63](https://github.com/tushar-gour/streamly-2.0/actions/runs/45884760370), including new recovery/email change cases. External delivery, credential-race and browser coverage remain open.
- SEC-05: integration job passed on [79db628 / #65](https://github.com/tushar-gour/streamly-2.0/actions/runs/45885170269), including hold/release, forbidden accounts, owner republish denial and durable audit. Comment moderation pending.
- PROD-02: added subscription-event and cross-account notification read regression, OpenAPI routes and formatting. Verification pending.
- PROD-03: QR rendered locally with pinned qrcode.react 4.2.0, integrity agreed by two independent public lockfiles and npm ci must verify. No authenticator secret transmitted to a QR service. Recovery codes and secure phone changes remain.

### Iteration 39 — MFA management and single-use recovery codes

PROD-03 IN_PROGRESS: generated high-entropy hashed recovery codes at enrollment, one-time display, atomic redemption after primary authentication, no trusted device from recovery, authenticated password/TOTP-protected regeneration and legacy active account enrollment. Login accepts either authenticator or recovery code. External provider and browser verification pending; remaining phone enrollment and credential issuance races.

### Iteration 40 — Secure phone enrollment backend

PROD-03 phone enrollment IMPLEMENTED (backend): existing phone routes now require password and current TOTP when configured. Proposed number remains in a session-bound, expiring challenge; per-account locking serializes starts and completion, one-minute resend limit, HMAC-protected six-digit code, five attempts, single-use transaction, existing unique phone constraint, all credential sessions/trust revoked on success while MFA remains enrolled. No schema change. Existing insecure service methods removed. Real Twilio delivery remains deployment-stage; integration tests and settings UI next. Baseline e194c5f all eight jobs passed in run 45886206678.

### Iteration 41 — Phone enrollment settings and regression suite

PROD-03 phone enrollment IMPLEMENTED: settings now exposes verified phone state, international number, SMS/WhatsApp choice, password and conditional TOTP proof, one-time code confirmation, cancel/retry and session invalidation feedback. Backend tests use actual PostgreSQL and a test-only injected delivery adapter to observe codes. Assertions cover preserved verified number, wrong password, MFA requirement, wrong channel/account/session, attempts, expiry, replay, concurrent start/verify and database uniqueness. CI pending; Twilio production delivery not tested. Next: CI repairs and credential issuance races.

### Iteration 42 — Phone enrollment database evidence

PROD-03 phone security regressions VERIFIED on `48124b8`: [run 46042750890](https://github.com/tushar-gour/streamly-2.0/actions/runs/46042750890), PostgreSQL integration and security job passed. Frontend lint/typecheck/tests/build passed separately from formatting. Applied exact CI formatter diffs for seven files. New npm audit advisories appeared in the backend quality log; assess dependency remediation separately without weakening the audit gate. UI integration and real Twilio delivery still require verification. Next: bind login issuance to credential state under lock.

### Iteration 43 — Credential issuance generation

SEC-03/04/PROD-03 race containment IMPLEMENTED: additive credentialVersion on users, nullable version on MFA challenges (old in-flight challenges fail closed). Credential mutation/recovery/MFA enrollment and recovery-code regeneration advance the version. Session issuance checks the proven version under a user row lock; login OTP and MFA challenges retain the originating version; trust-token creation occurs in the MFA verification transaction. Regression tests cover stale password proof and MFA issuance after credential change. Existing sessions are preserved for MFA enrollment/regeneration; password/email/phone changes revoke all. Integration and exact-head CI pending; review migration and browser compatibility. Next: CI repair, durable processing.

### Iteration 44 — Credential generation evidence

VERIFIED: database integration/security, migration, backend tests and frontend quality passed on `ab620d0`, [run 46043137247](https://github.com/tushar-gour/streamly-2.0/actions/runs/46043137247). Stale credential session and MFA issuance regressions passed. Applied actual CI formatter changes; full exact-head CI and additional OTP/MFA interleaving coverage remain pending. Next: durable upload status, cleanup and idempotency.

### Iteration 45 — Durable video upload processing backend

PROD-01 IN_PROGRESS: added owner-scoped upload attempt ledger (validating/storing/ready/failed; expired attempts reported interrupted), optional client request UUID, atomic video creation and ready transition, idempotent completed requests, private preallocated object keys and periodic cleanup of failed/expired S3 attempts. Existing synchronous upload contract preserved; no invented transcoding status. The user-selected thumbnail is no longer overwritten by an unnecessary background generation job. New storage and API tests, OpenAPI and frontend recovery UI pending. Legacy Cloudinary crash cleanup remains limited; production is private S3 only. No production migrations or objects touched.

### Iteration 46 — Upload status UI and real storage assertions

PROD-01 IMPLEMENTED: multipart request IDs reconcile lost responses without duplicates; settings-independent owner status/list APIs and Creator Studio recent attempts display real stages and failure feedback. Failed or expired attempts use new identifiers; unknown responses retain the same identifier. API docs and isolated storage tests added for replay, owner scope, failure and expired-object cleanup. CI pending; no deployment. Next: repair checks, broaden moderation.

### Iteration 47 — Upload verification

PROD-01 storage regressions VERIFIED at `d540036`: database integration, including actual S3-compatible storage, passed in [run 46043687314](https://github.com/tushar-gour/streamly-2.0/actions/runs/46043687314). Applied backend and frontend formatter output; exact-head CI pending. Credential checkpoint `5514b40` passed all eight jobs ([46043384721](https://github.com/tushar-gour/streamly-2.0/actions/runs/46043384721)). Next: audited comment moderation.

### Iteration 48 — Comment moderation (implemented, unverified)

Added durable reversible comment holds with permission-scoped moderator endpoints, atomic audit and notification, no cached held content, filtered counts and rejection of author edits while held. Database regression added; CI and frontend panel pending.

### Iteration 49 — Moderator interface (implemented, unverified)

Added account-scoped comment moderation query and action panel, accessible reason form, pagination, permission-aware navigation and OpenAPI documentation. CI pending. No deployment or merge.

### Iteration 50 — Playlist visibility (implemented, unverified)

Playlist create/update accepts validated boolean visibility; new playlists default private through API, existing records unchanged. Added visibility selector and labels and account-scoped detail caching. Browser and database privacy transition tests pending. Next: reconcile CI, then remaining creator/subscription/library workflows and quality gates.

### Iteration 51 — Subscription idempotency and library privacy regressions

Comment moderation database regression VERIFIED in [46044233950](https://github.com/tushar-gour/streamly-2.0/actions/runs/46044233950), 27 database tests passed, 8 API tests, 2 actual storage tests. Added atomic subscriber-scoped state transitions and idempotent PUT; existing POST toggle retained. Frontend uses explicit desired state and hides self-subscribe. Added concurrent subscribe/unsubscribe and playlist visibility transition regressions. Worker repeat scheduling reformatted to stable local variable. CI pending; OpenAPI PUT contract and formatter reconciliation next.

### Iteration 52 — Library integration evidence and dependency release blocker

Playlist privacy and concurrent desired-subscription regressions passed database CI in [46044630070](https://github.com/tushar-gour/streamly-2.0/actions/runs/46044630070). Applied backend/frontend formatter diagnostics; exact-head CI pending. Backend npm audit report flags 40 vulnerabilities including 2 critical, 24 high (pre-existing report-only step; not a security pass). Dependency remediation must precede production review; local GitHub and npm network unavailable. Next: candidate lockfile refresh in isolated CI, review upgrades and rerun all gates.

### Iteration 53 — Dependency candidate and API contract

Added OpenAPI idempotent subscription PUT. Temporary read-only CI candidate resolves compatible package updates and bcrypt 6 without install scripts, emits reviewable lockfile diffs; does not change branch or use npm audit --force. Actual upgrade requires review and full install/build/test verification. Prisma major migration intentionally not automated. Database evidence: 29 integration tests passed, 8 API tests and 2 separate real storage tests in run 46044630070.

### Iteration 54 — Strict subscription boundary and bounded queries

Removed `@ts-nocheck` from subscription domain port, repository, service, controller and routes. Added typed pagination and request checks, replaced full subscriber relationship materialization with count and at-most-one viewer relation, projected latest video fields. Typecheck and integration verification pending. Dependency candidate CI running independently.

### Iteration 55 — Strict subscription diagnostic repair

CI caught legacy helper signatures (NotFoundError identifier inferred null and PaginationBuilder requiring constructor arguments). Fixed signatures/call sites without suppressing checking and applied formatter output. Dependency candidate npm audit fix hit an npm resolver error; no forced major upgrades applied. Candidate contains bcrypt 6; review actual diff and remaining advisories.

### Iteration 56 — Dependency remediation candidate applied

Applied reviewed CI-generated lockfile diff from run 46045094417: bcrypt 5.1.1 to 6.0.0 (removes obsolete node-pre-gyp/tar chain), frontend compatible-range audit refresh (Next 15.5.20 to 15.5.29 and related packages). No forced Prisma or Next major upgrade. Candidate audit still reports high/critical issues, including proxy-addr; npm audit fix backend resolver crashed. Switched read-only diagnostic to npm update within declared ranges. Full install/test gates and final production audit pending.

### Iteration 57 — Browser coverage for new product workflows

Extended existing Playwright smoke using isolated moderator fixture, actual playlist visibility selector, desired subscription operations, phone credential-rejection feedback, multipart upload form and persistent processing history, moderator hold/release with a separate browser context. Upload browser uses existing test Cloudinary adapter; real storage covered separately. Browser result pending; no claim of end-to-end phone delivery. Updated upload wording to describe completion rather than current publication state.

### Iteration 58 — Strict shared API primitives

Removed type suppressions from API error/response, pagination, identifier validation and async request handling. Request IDs now require strings instead of invoking arbitrary object coercion. Subscription row locking uses FOR NO KEY UPDATE to avoid cross-channel foreign-key lock conflicts. CI pending; if any caller depends on legacy helper behavior, correct the caller rather than reinstate suppressions.

### Iteration 59 — Compatible security refresh

Applied CI-generated compatible-range dependency candidate from 46045680724. Candidate production audit dropped to 4 high backend (Prisma CLI dependency chain) and 1 high frontend (Next major required); no critical reported. Retained existing independent Prettier lock entries to avoid a repository-wide style-only change. Full npm ci/build/runtime tests required. Next candidate: Multer 2 and Next 16.4.6; do not force Prisma major migration or claim advisories resolved without actual audit and tests.

### Iteration 60 — Async type repair

Typecheck exposed generic Result versus Awaited<Result> return typing in shared async helper. Explicitly await the service function, retaining rejection propagation. Applied CI formatter diagnostics from 46045822745. Database tests passed on that commit, but build/browser/Docker were blocked by the type error. Exact-head CI pending.

### Iteration 61 — Subscription listing regression repair

Browser smoke exposed a subscription listing error (actual failure screenshot and API source review). Fixed escaped pagination regex rejecting all valid numeric values. Added database-backed GET list regression including default, explicit and invalid pagination. Applied formatter output; corrected Next candidate ESLint peer resolution without forcing dependencies. Run 46046088357 passed backend quality, database, tests, Docker, OpenAPI and Prisma, frontend format still failed and browser pending at inspection. Next: verify corrected browser journey, inspect Multer candidate and audit.

### Iteration 62 — Multer dependency upgrade

Applied exact CI-generated Multer 2.5.0 lockfile candidate, removing ten obsolete transitive packages. Candidate production audit still reports four high Prisma-chain advisories. Actual upload, malformed multipart, build and storage tests must pass before VERIFIED. Next: inspect browser and candidate CI.

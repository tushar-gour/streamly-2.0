# Streamly API Integration

## Base URL

```env
NEXT_PUBLIC_API_BASE_URL=https://streamly-api.zytheran.me
```

The frontend reads the backend URL from `lib/config/env.ts`. Components must not
hardcode production URLs.

## Client Strategy

`lib/api/client.ts` owns:

- JSON headers.
- Credential inclusion.
- Bearer token attachment.
- Backend error normalization.
- Network failure mapping.
- Streamly response parsing.

Endpoint modules own route paths:

- `auth.ts`
- `videos.api.ts`
- `comments.api.ts`
- `likes.api.ts`
- `playlists.api.ts`
- `subscriptions.api.ts`
- `dashboard.api.ts`
- `media.api.ts`

Compatibility re-export files remain in place for older imports:

- `api-client.ts`
- `api.types.ts`
- `auth.api.ts`

## Auth Routes Used

Actual backend routes are mounted under `/api/v1/users`.

```txt
POST /api/v1/users/login
POST /api/v1/users/refresh-token
POST /api/v1/users/logout
POST /api/v1/users/logout-all
GET  /api/v1/users/current-user
```

The backend supports access and refresh cookies. The frontend also stores the
short-lived access token in memory when returned by login or refresh. Refresh
tokens are not stored in frontend state.

Advanced auth platform routes exist at `/api/v1/users/auth/*`, but only
email/password login is wired in this phase.

## Video Streaming

The watch shell uses:

```txt
/api/v1/videos/:videoId/stream
```

The backend owns HTTP Range support. The frontend should use native video
playback first and only customize controls after data integration is stable.

## Error Strategy

User-facing errors should use calm copy:

```txt
Something paused unexpectedly. Please try again.
Invalid email or password.
Couldn’t reach Streamly. Check your connection and try again.
Too many attempts. Please wait before trying again.
```

Do not expose backend stack traces or raw internal errors.

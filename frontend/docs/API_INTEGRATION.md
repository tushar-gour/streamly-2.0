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
- `users.ts`
- `watch-history.api.ts`
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

## Feed And Profile Routes Used

Actual backend routes used by the real data panels:

```txt
GET  /api/v1/videos
GET  /api/v1/videos/:videoId
GET  /api/v1/videos/:videoId/stream
GET  /api/v1/comments/:videoId
POST /api/v1/likes/toggle/v/:videoId
GET  /api/v1/likes/videos
GET  /api/v1/users/watch-history
GET  /api/v1/users/c/:username
GET  /api/v1/playlists/:playlistId
GET  /api/v1/playlists/user/:userId
GET  /api/v1/subscriptions/u/:subscriberId
POST /api/v1/subscriptions/c/:channelId
```

`GET /api/v1/users/c/:username` is protected in the current backend route file.
Frontend channel pages therefore use an authenticated guard even though some
planning docs describe public channel viewing.

## Video Streaming

The watch shell uses:

```txt
/api/v1/videos/:videoId/stream
```

The backend owns HTTP Range support. The frontend should use native video
playback first and only customize controls after data integration is stable.

## Data Binding Status

- Home uses the public video list.
- Explore uses the public video list sorted by views.
- Search uses the public video list with the backend `query` parameter.
- Watch uses video detail, comments, and stream URL.
- Channel uses the backend channel profile route and channel videos.
- History uses authenticated watch history.
- Liked videos uses authenticated liked video data.
- Playlists use authenticated user playlist data.
- Subscriptions use authenticated subscribed channel data.
- Watch later and notifications remain real empty states because matching
  backend routes are not available.

## Error Strategy

User-facing errors should use calm copy:

```txt
Something paused unexpectedly. Please try again.
Invalid email or password.
Couldn’t reach Streamly. Check your connection and try again.
Too many attempts. Please wait before trying again.
```

Do not expose backend stack traces or raw internal errors.

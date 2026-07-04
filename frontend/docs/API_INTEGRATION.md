# Streamly API Integration

## Base URL

```env
NEXT_PUBLIC_API_BASE_URL=https://streamly-api.zytheran.me
```

The frontend reads the backend URL from `lib/config/env.ts`. Components must not
hardcode production URLs.

## Client Strategy

`lib/api/api-client.ts` owns:

- JSON headers.
- Credential inclusion.
- Bearer token attachment.
- Backend error normalization.

Endpoint modules own route paths:

- `auth.api.ts`
- `videos.api.ts`
- `comments.api.ts`
- `likes.api.ts`
- `playlists.api.ts`
- `subscriptions.api.ts`
- `dashboard.api.ts`
- `media.api.ts`

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
```

Do not expose backend stack traces or raw internal errors.

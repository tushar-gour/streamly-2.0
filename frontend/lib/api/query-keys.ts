export const queryKeys = {
  comments: {
    list: (videoId: string) => ["comments", "list", videoId] as const,
  },
  history: {
    list: () => ["history", "list"] as const,
  },
  likes: {
    videos: () => ["likes", "videos"] as const,
  },
  playlists: {
    detail: (playlistId: string) =>
      ["playlists", "detail", playlistId] as const,
    list: (userId: string) => ["playlists", "list", userId] as const,
  },
  subscriptions: {
    list: (subscriberId: string) =>
      ["subscriptions", "list", subscriberId] as const,
  },
  users: {
    channel: (username: string) => ["users", "channel", username] as const,
    current: () => ["users", "current"] as const,
  },
  videos: {
    detail: (videoId: string) => ["videos", "detail", videoId] as const,
    list: (filters: Readonly<Record<string, unknown>> = {}) =>
      ["videos", "list", filters] as const,
  },
} as const;

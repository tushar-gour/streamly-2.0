# Streamly Component Library

## Component Groups

### UI

- Button
- Input
- PasswordInput
- OTPInput
- Tabs
- Modal
- Sheet
- Card
- IconButton
- Divider
- Badge
- Tooltip
- Toast
- Skeleton
- Progress

### Brand

- Logo
- LogoMark
- ThemeToggle

### Layout

- AppShell
- Sidebar
- Topbar
- MobileBottomNav

### Auth

- AuthShell
- AuthCard
- AuthBootstrap
- AuthRouteGuard

### Video

- VideoCard
- VideoFeed
- VideoWatchPanel

### Library

- VideoCollectionPanel
- HistoryPanel
- LikedVideosPanel
- PlaylistsPanel
- SubscriptionsPanel

### Channel And Profile

- ChannelProfilePanel
- CurrentProfilePanel
- PlaylistDetailPanel

### Feedback

- EmptyState
- ErrorState
- LoadingState
- SplashScreen

## Component Rules

- Components are single-purpose.
- Components expose variants where useful.
- Components keep backend logic out.
- Auth components delegate state changes to the auth store.
- Components meet focus and tap target requirements.
- Motion stays subtle and token-driven.

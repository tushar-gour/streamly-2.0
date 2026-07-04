import {
  Bell,
  Compass,
  Heart,
  History,
  Home,
  ListVideo,
  Settings,
  Shield,
  Upload,
  User,
} from "lucide-react";

export const viewerRoutes = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Subscriptions", href: "/subscriptions", icon: Bell },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Playlists", href: "/playlists", icon: ListVideo },
  { label: "History", href: "/history", icon: History },
  { label: "Watch Later", href: "/watch-later", icon: ListVideo },
  { label: "Liked Videos", href: "/liked", icon: Heart },
] as const;

export const utilityRoutes = [
  { label: "Upload", href: "/studio/upload", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin", href: "/admin", icon: Shield },
  { label: "Profile", href: "/channel/me", icon: User },
] as const;

export const mobileRoutes = [
  viewerRoutes[0],
  viewerRoutes[1],
  utilityRoutes[0],
  viewerRoutes[2],
  utilityRoutes[3],
] as const;

export type VideoSummary = Readonly<{
  id: string;
  title: string;
  creator: string;
  views: string;
  age: string;
  duration: string;
  accent: string;
  progress?: number;
}>;

export const featuredVideos: VideoSummary[] = [
  {
    id: "beyond-horizon",
    title: "Beyond Horizons",
    creator: "PixelPioneer",
    views: "245K views",
    age: "2 days ago",
    duration: "12:45",
    accent: "from-[#34268E] via-[#172242] to-[#101522]",
    progress: 18,
  },
  {
    id: "universe-hdr",
    title: "The Universe in 8K HDR Dolby Vision",
    creator: "AstroVisuals",
    views: "1.2M views",
    age: "1 week ago",
    duration: "8:32",
    accent: "from-[#1D3566] via-[#0C162A] to-[#141720]",
  },
  {
    id: "lofi-focus",
    title: "Deep Focus: Lofi Beats for Concentration",
    creator: "Lofi Lab",
    views: "3.4M views",
    age: "3 weeks ago",
    duration: "1:02:15",
    accent: "from-[#1E263F] via-[#31204E] to-[#101522]",
  },
  {
    id: "norway-climb",
    title: "Climbing Norway's Most Dangerous Cliff",
    creator: "Adventure Mindset",
    views: "562K views",
    age: "5 days ago",
    duration: "9:18",
    accent: "from-[#543B2B] via-[#29364F] to-[#101522]",
  },
] as const;

export const methodOptions = [
  {
    title: "Email OTP",
    description: "We will send a one-time code to your email.",
    href: "/login/email-otp",
  },
  {
    title: "SMS OTP",
    description: "Receive a secure code on your phone.",
    href: "/login/sms",
  },
  {
    title: "WhatsApp OTP",
    description: "Receive a secure code on WhatsApp.",
    href: "/login/whatsapp",
  },
  {
    title: "Authenticator app",
    description: "Use your authenticator code.",
    href: "/login/mfa",
  },
] as const;

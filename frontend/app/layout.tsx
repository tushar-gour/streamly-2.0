import type { Metadata, Viewport } from "next";

import "./globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Streamly",
    template: "%s | Streamly",
  },
  description: "A premium video streaming platform frontend for Streamly.",
};

export const viewport: Viewport = {
  themeColor: "#080B13",
  colorScheme: "dark light",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

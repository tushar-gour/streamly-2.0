export const authMethodOptions = [
  {
    title: "Email OTP",
    description: "Continue with a one-time email code.",
    href: "/login/email-otp",
  },
  {
    title: "SMS OTP",
    description: "Continue with a one-time SMS code.",
    href: "/login/sms",
  },
  {
    title: "WhatsApp OTP",
    description: "Continue with a WhatsApp code.",
    href: "/login/whatsapp",
  },
] as const;

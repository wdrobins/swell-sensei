export const SITE_CONFIG = {
  appName: "Swell Sensei",
  appUrl: import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin,
  marketingSiteUrl: import.meta.env.VITE_MARKETING_SITE_URL || window.location.origin,
} as const;

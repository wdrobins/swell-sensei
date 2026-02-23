export const SITE_CONFIG = {
  appName: "Afterglow",
  appUrl: import.meta.env.VITE_PUBLIC_APP_URL || "https://app.afterglowsurfboards.com.au",
  marketingSiteUrl: import.meta.env.VITE_MARKETING_SITE_URL || "https://afterglowsurfboards.com.au",
} as const;

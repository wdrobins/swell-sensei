export function getAuthRedirectUrl(origin: string, basePath: string, path = ''): string {
  const appBaseUrl = new URL(basePath, origin);
  return path ? new URL(path, appBaseUrl).toString().replace(/\/$/, '') : appBaseUrl.toString();
}

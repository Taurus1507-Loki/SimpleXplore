import { isSafeExternalUrl } from '@/lib/utils/ssrf';

/**
 * Resolves shortened URLs safely while preserving affiliate tracking parameters.
 * Validates every intermediate redirect URL against SSRF rules.
 */
export async function resolveSafeUrl(initialUrl: string, maxRedirects = 5): Promise<string> {
  let currentUrl = initialUrl;
  let redirectsCount = 0;

  while (redirectsCount < maxRedirects) {
    const safetyCheck = isSafeExternalUrl(currentUrl);
    if (!safetyCheck.isSafe) {
      throw new Error(`SSRF Security Violation: ${safetyCheck.reason}`);
    }

    try {
      // Use HEAD request first or GET with manual redirect handling to inspect Location header safely
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          break;
        }

        // Resolve relative redirects against current URL
        const nextUrl = new URL(location, currentUrl).toString();
        const nextCheck = isSafeExternalUrl(nextUrl);
        if (!nextCheck.isSafe) {
          throw new Error(`Redirect target rejected: ${nextCheck.reason}`);
        }

        currentUrl = nextUrl;
        redirectsCount++;
      } else {
        // Final destination reached
        break;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('SSRF')) throw err;
      // If HEAD fails (some servers reject HEAD), break and return last valid currentUrl
      break;
    }
  }

  return currentUrl;
}


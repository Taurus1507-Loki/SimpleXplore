import { URL } from 'url';

/**
 * Validates external URLs to prevent Server-Side Request Forgery (SSRF).
 * Blocks internal hostnames, loopback addresses, RFC1918 private subnets,
 * cloud metadata endpoints, and non-HTTP(S) protocols.
 */
export function isSafeExternalUrl(inputUrl: string): { isSafe: boolean; reason?: string; parsedUrl?: URL } {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { isSafe: false, reason: 'Empty or invalid URL input' };
  }

  let parsed: URL;
  try {
    parsed = new URL(inputUrl.trim());
  } catch {
    return { isSafe: false, reason: 'Malformed URL format' };
  }

  // Only allow HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isSafe: false, reason: `Forbidden protocol: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard loopbacks
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]'
  ) {
    return { isSafe: false, reason: 'Loopback address access forbidden' };
  }

  // Block internal domain patterns
  if (
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.lan')
  ) {
    return { isSafe: false, reason: 'Internal network domain access forbidden' };
  }

  // IPv4 Private & Reserved Ranges Check:
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (Link-local/AWS metadata)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);

    if (
      octet1 === 10 || // 10.0.0.0/8
      octet1 === 127 || // 127.0.0.0/8
      octet1 === 0 || // 0.0.0.0/8
      (octet1 === 172 && octet2 >= 16 && octet2 <= 31) || // 172.16.0.0/12
      (octet1 === 192 && octet2 === 168) || // 192.168.0.0/16
      (octet1 === 169 && octet2 === 254) // 169.254.0.0/16 (Cloud Metadata)
    ) {
      return { isSafe: false, reason: 'Private or link-local IP address access forbidden' };
    }
  }

  return { isSafe: true, parsedUrl: parsed };
}


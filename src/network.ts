// Accept literal private addresses and local names; never resolve arbitrary DNS
// names as part of an Origin check.
export function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '[::1]', '::1'].includes(host)) return true;
  if (/^[a-z0-9-]+\.local$/.test(host)) return true;
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || !/^\d+\.\d+\.\d+\.\d+$/.test(host) || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  return a === 10 || (a === 192 && b === 168) || (a === 172 && b! >= 16 && b! <= 31) || (a === 100 && b! >= 64 && b! <= 127);
}

export function isLocalOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === origin && isLocalHost(url.hostname);
  } catch { return false; }
}

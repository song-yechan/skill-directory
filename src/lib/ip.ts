/**
 * Extract client IP from request headers.
 * Priority: x-real-ip (Vercel sets this, cannot be spoofed) > x-forwarded-for (last entry) > 'unknown'
 */
export function getClientIp(hdrs: Headers): string {
  // Vercel sets x-real-ip to the actual client IP (not spoofable)
  const realIp = hdrs.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback: last entry in x-forwarded-for (added by the trusted proxy)
  const forwarded = hdrs.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((s) => s.trim());
    return ips[ips.length - 1] ?? 'unknown';
  }

  return 'unknown';
}

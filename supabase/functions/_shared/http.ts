const STATIC_ALLOWED_ORIGINS = new Set([
  "https://meemon.net",
  "https://www.meemon.net",
  // Fixed local-network preview used while developing on the owner's Mac.
  // Keep this exact (including the port) rather than allowing an entire subnet.
  "http://192.168.68.60:4175",
  "http://macbook-khxng-taithai.local:4175",
]);

export function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return STATIC_ALLOWED_ORIGINS.has(origin) || local ? origin : null;
}

export function corsHeaders(request: Request) {
  const origin = allowedOrigin(request);
  return {
    ...(origin ? { "access-control-allow-origin": origin } : {}),
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info, x-maintenance-secret",
    "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

export function json(request: Request, value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders(request), "content-type": "application/json; charset=utf-8" },
  });
}

export function publicError(request: Request, message: string, status = 400, code = "REQUEST_FAILED") {
  return json(request, { error: message, code }, status);
}

export function requireAllowedOrigin(request: Request) {
  if (request.method === "OPTIONS") return true;
  return allowedOrigin(request) !== null;
}

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function requestIp(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

import { env } from "./server.ts";

export async function verifyTurnstile(token: string, remoteIp?: string) {
  if (!token) return false;
  const body = new FormData();
  body.set("secret", env("TURNSTILE_SECRET_KEY"));
  body.set("response", token);
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}


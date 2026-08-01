"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render(element: HTMLElement, options: { sitekey: string; theme: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }): string;
      remove(widgetId: string): void;
    };
  }
}

export function TurnstileWidget({ siteKey, resetKey, onToken }: { siteKey: string; resetKey: number; onToken: (token: string) => void }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const reactId = useId();

  useEffect(() => {
    if (!siteKey || !elementRef.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.turnstile || !elementRef.current || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(elementRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-meemon-turnstile="true"]');
    if (existing) {
      if (window.turnstile) render(); else existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.meemonTurnstile = "true";
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
      onToken("");
    };
  }, [onToken, reactId, resetKey, siteKey]);

  if (!siteKey) return null;
  return <div className="turnstile-shell" ref={elementRef} aria-label="ยืนยันว่าไม่ใช่ระบบอัตโนมัติ" />;
}


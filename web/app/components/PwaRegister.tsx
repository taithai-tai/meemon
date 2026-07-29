"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PwaRegister() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/v2") || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/v2/sw.js", { scope: "/v2/" }).catch(() => {
      // The app remains fully usable when service workers are unavailable.
    });
  }, [pathname]);

  return null;
}

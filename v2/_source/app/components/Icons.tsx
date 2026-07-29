import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home"
  | "shop"
  | "fortune"
  | "ritual"
  | "cart"
  | "wallpaper"
  | "contact"
  | "arrow-up-right"
  | "arrow-left"
  | "arrow-right"
  | "sparkle"
  | "oracle"
  | "tarot"
  | "seimsee"
  | "jiaobei"
  | "lucky-number"
  | "daily"
  | "colors"
  | "incense"
  | "wallet-opening"
  | "wallet-guide"
  | "horse"
  | "money"
  | "download"
  | "search"
  | "check"
  | "trash"
  | "plus"
  | "minus"
  | "line"
  | "store"
  | "moon"
  | "sun"
  | "shield"
  | "briefcase"
  | "heart"
  | "leaf"
  | "bolt"
  | "book"
  | "hands"
  | "clover"
  | "trophy"
  | "crown"
  | "flower"
  | "sunrise"
  | "info"
  | "audio"
  | "calendar"
  | "empty";

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3.5 10.8 8.5-7 8.5 7" />
      <path d="M5.7 9.2v10.3h12.6V9.2M9.4 19.5v-6h5.2v6" />
    </>
  ),
  shop: (
    <>
      <path d="M4 9.2v10.3h16V9.2" />
      <path d="M3 9.2 5 4.5h14l2 4.7c-.2 1.8-1.4 2.7-3 2.7-1.4 0-2.4-.7-3-2-.6 1.3-1.6 2-3 2s-2.4-.7-3-2c-.6 1.3-1.6 2-3 2-1.6 0-2.8-.9-3-2.7Z" />
      <path d="M9.2 19.5v-4.7h5.6v4.7" />
    </>
  ),
  fortune: (
    <>
      <path d="M18.7 13.5A7.8 7.8 0 1 1 10.5 5a6.2 6.2 0 0 0 8.2 8.5Z" />
      <path d="m17.5 4 .45 1.25L19.2 5.7l-1.25.45-.45 1.25-.45-1.25-1.25-.45 1.25-.45L17.5 4ZM20 9.2l.25.7.7.25-.7.25-.25.7-.25-.7-.7-.25.7-.25.25-.7Z" />
    </>
  ),
  ritual: (
    <>
      <path d="M8 19.5h8M9.2 19.5v-7.8h5.6v7.8" />
      <path d="M10.2 11.7V6.3M13.8 11.7V4.8" />
      <path d="M10.2 3.1c1.2 1 .8 2 .1 2.8M13.8 2c1.4 1.2.9 2.4.1 3.2" />
      <path d="M6.2 19.5h11.6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4.5h2.2l1.7 9.1h10.7l2-6.4H6" />
      <path d="M8.4 18.3h.1M16.3 18.3h.1" />
    </>
  ),
  wallpaper: (
    <>
      <rect x="5" y="2.8" width="14" height="18.4" rx="2.5" />
      <path d="m7.8 17 3.2-3.4 2.4 2.2 2.8-3.4 2.8 3.2M15.3 7.7h.1" />
    </>
  ),
  contact: (
    <>
      <path d="M4 5.5h16v11H9l-5 4v-15Z" />
      <path d="M8 9.2h8M8 12.7h5" />
    </>
  ),
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
  "arrow-left": <path d="m14.5 5-7 7 7 7M8 12h11" />,
  "arrow-right": <path d="m9.5 5 7 7-7 7M5 12h11" />,
  sparkle: (
    <>
      <path d="M12 2.8c.6 5.3 3.2 8 8.2 9.2-5 1.2-7.6 3.9-8.2 9.2-.6-5.3-3.2-8-8.2-9.2 5-1.2 7.6-3.9 8.2-9.2Z" />
      <path d="M19 2.8c.15 1.5.85 2.2 2.2 2.5-1.35.3-2.05 1-2.2 2.5-.15-1.5-.85-2.2-2.2-2.5 1.35-.3 2.05-1 2.2-2.5Z" />
    </>
  ),
  oracle: (
    <>
      <path d="M12 3.3c4.9 0 8 3.8 8 8.7s-3.1 8.7-8 8.7S4 16.9 4 12s3.1-8.7 8-8.7Z" />
      <path d="M7.5 12s1.7-3 4.5-3 4.5 3 4.5 3-1.7 3-4.5 3-4.5-3-4.5-3Z" />
      <circle cx="12" cy="12" r="1.3" />
    </>
  ),
  tarot: (
    <>
      <rect x="5.4" y="3" width="11.8" height="17.8" rx="2" transform="rotate(-5 11.3 11.9)" />
      <rect x="7.1" y="3.1" width="11.8" height="17.8" rx="2" transform="rotate(5 13 12)" />
      <path d="m12 8 .65 1.65L14.3 10.3l-1.65.65L12 12.6l-.65-1.65-1.65-.65 1.65-.65L12 8Z" />
    </>
  ),
  seimsee: (
    <>
      <path d="M7 8h10l-1 12H8L7 8Z" />
      <path d="M9 8 8 3M12 8V2M15 8l1-5" />
      <path d="M8.4 13h7.2" />
    </>
  ),
  jiaobei: (
    <>
      <path d="M10.2 4.2c-5 .7-7.4 5.2-5.7 9.4 1 2.5 3.2 4.4 5.7 5.1V4.2Z" />
      <path d="M13.8 4.2c5 .7 7.4 5.2 5.7 9.4-1 2.5-3.2 4.4-5.7 5.1V4.2Z" />
    </>
  ),
  "lucky-number": (
    <>
      <rect x="3" y="5" width="4.2" height="14" rx="1.4" />
      <rect x="8.6" y="5" width="4.2" height="14" rx="1.4" />
      <rect x="14.2" y="5" width="4.2" height="14" rx="1.4" />
      <path d="M20.6 8.2v7.6M19.2 12h2.8" />
    </>
  ),
  daily: (
    <>
      <circle cx="12" cy="12" r="8.7" />
      <path d="M12 7v5l3.2 2M12 1.7v2M12 20.3v2M1.7 12h2M20.3 12h2" />
    </>
  ),
  colors: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.1-.8 2.1-1.7 0-.6-.3-1-.6-1.5-.4-.5-.2-1.3.7-1.3H16a5 5 0 0 0 5-5C21 6.8 17 3 12 3Z" />
      <circle cx="7.5" cy="10" r=".8" />
      <circle cx="10.2" cy="6.9" r=".8" />
      <circle cx="14.3" cy="6.9" r=".8" />
      <circle cx="17.1" cy="10" r=".8" />
    </>
  ),
  incense: (
    <>
      <path d="M8.8 20.5v-8.8M12 20.5V9.8M15.2 20.5v-8.8" />
      <path d="M6.2 20.5h11.6l-1.2 2H7.4l-1.2-2ZM8.8 8.8c1.4-1 .6-2.3-.1-3.2M12 6.8c1.8-1.4.9-3.1 0-4.3M15.2 8.8c1.4-1 .6-2.3-.1-3.2" />
    </>
  ),
  "wallet-opening": (
    <>
      <path d="M4 7.5h14.5a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
      <path d="M15 11h5.5v4H15a2 2 0 0 1 0-4Z" />
      <path d="M9 8.6a3.8 3.8 0 0 0 5.2-4.8A4.6 4.6 0 0 1 9 8.6Z" />
    </>
  ),
  "wallet-guide": (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M3.5 9h17M8 13h4M8 16h7" />
    </>
  ),
  horse: (
    <>
      <path d="M7 20c-.2-4.4.7-7.3 3.7-9.1L9.4 7.2l3.4 1.1L16 5.7l-.2 4.2c2.1 1.8 3 5 2.7 10.1" />
      <path d="M6 20h13M12 12.5c1.1.8 2.2.9 3.5.3M11.4 16h.1" />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8.2h4.1a2.2 2.2 0 0 1 0 4.4H9.8M9 15.8h4.6a2.2 2.2 0 0 0 0-4.4M11 5.8v12.4" />
    </>
  ),
  download: <path d="M12 3v12M7.5 10.8 12 15.3l4.5-4.5M4 20h16" />,
  search: (
    <>
      <circle cx="10.7" cy="10.7" r="6.7" />
      <path d="m15.8 15.8 4.2 4.2" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19.5 6.5" />,
  trash: (
    <>
      <path d="M5 7h14M9 7V4h6v3M7 7l.8 13h8.4L17 7M10 10.5v6M14 10.5v6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  line: (
    <>
      <path d="M20.5 11.2c0 4.2-3.8 7.6-8.5 7.6-.8 0-1.7-.1-2.4-.3L5 21l1-3.5c-1.6-1.4-2.5-3.7-2.5-6.3 0-4.2 3.8-7.6 8.5-7.6s8.5 3.4 8.5 7.6Z" />
      <path d="M7 9.3v3.8h2M10.2 9.3v3.8M12 13.1V9.3l2.5 3.8V9.3M17.8 9.3h-2v3.8h2" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v10h16V10M3 10l2-5h14l2 5M8 20v-5h8v5" />
      <path d="M3 10c0 1.4 1 2.4 2.5 2.4S8 11.4 8 10c0 1.4 1 2.4 2.5 2.4S13 11.4 13 10c0 1.4 1 2.4 2.5 2.4S18 11.4 18 10c0 1.4 1 2.4 2.5 2.4" />
    </>
  ),
  moon: <path d="M19.3 14.2A8.2 8.2 0 0 1 9.8 3.6 8.8 8.8 0 1 0 19.3 14.2Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="3.7" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  shield: <path d="M12 2.8 19 6v5.1c0 4.6-2.6 8.3-7 10.1-4.4-1.8-7-5.5-7-10.1V6l7-3.2ZM8.5 12l2.2 2.2 4.8-5" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" />
    </>
  ),
  heart: <path d="M20.5 8.8c0 5-8.5 10.3-8.5 10.3S3.5 13.8 3.5 8.8A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 8.5 1.1Z" />,
  leaf: <path d="M19.8 3.8C12 4 6.2 7.3 5 13.2c-.7 3.5 1.5 6.8 1.5 6.8s3.2-8 9.3-11.4C10.2 13 8.2 18 8.2 18c6.5.1 11-4.9 11.6-14.2Z" />,
  bolt: <path d="m13.8 2.8-8 11h6l-1.6 7.4 8-11h-6l1.6-7.4Z" />,
  book: (
    <>
      <path d="M4 4.5h5.5A2.5 2.5 0 0 1 12 7v13a3.2 3.2 0 0 0-3.2-3.2H4V4.5ZM20 4.5h-5.5A2.5 2.5 0 0 0 12 7v13a3.2 3.2 0 0 1 3.2-3.2H20V4.5Z" />
    </>
  ),
  hands: <path d="M4.5 19v-7.5c0-1.5 2-1.5 2 0v3-6c0-1.5 2-1.5 2 0v5-7c0-1.5 2-1.5 2 0v6-5c0-1.5 2-1.5 2 0V12l2.2-2c1.3-1.1 2.8.5 1.8 1.8l-3.2 4.6A5.8 5.8 0 0 1 8.5 19h-4Z" />,
  clover: <path d="M12 11c-3-5-8-3.7-7.5-.5.3 2.1 2.4 2.8 4.3 2.5-3.4 1-3.1 5.8.3 5.7 2.2 0 3-2.2 2.9-4.2-.1 2 1 4.2 3.2 4 3.4-.2 3.4-5-.1-5.7 2 .2 4-1 4.1-3.1.2-3.2-4.8-4.1-7.2 1.3ZM12 14v7" />,
  trophy: (
    <>
      <path d="M8 4h8v4.5c0 3-1.6 5.5-4 5.5s-4-2.5-4-5.5V4ZM9.5 20h5M12 14v6" />
      <path d="M8 6H4.5v1.5c0 2.4 1.5 4 4 4M16 6h3.5v1.5c0 2.4-1.5 4-4 4" />
    </>
  ),
  crown: <path d="m3.5 7 4.3 3.3L12 4l4.2 6.3L20.5 7l-1.7 11H5.2L3.5 7ZM5.2 15h13.6" />,
  flower: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8C8.2 7.8 9 3.5 12 3.5s3.8 4.3 0 6.3ZM14.2 12c2-3.8 6.3-3 6.3 0s-4.3 3.8-6.3 0ZM12 14.2c3.8 2 3 6.3 0 6.3s-3.8-4.3 0-6.3ZM9.8 12c-2 3.8-6.3 3-6.3 0s4.3-3.8 6.3 0Z" />
    </>
  ),
  sunrise: (
    <>
      <path d="M4 18h16M6.5 15a5.5 5.5 0 0 1 11 0M12 3v3M4.5 7.5l2.1 2.1M19.5 7.5l-2.1 2.1M2 13h3M19 13h3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5v6M12 7.2h.1" />
    </>
  ),
  audio: (
    <>
      <path d="M5 10v4h3l4 3.5v-11L8 10H5Z" />
      <path d="M15 9a4.3 4.3 0 0 1 0 6M17.5 6.5a7.7 7.7 0 0 1 0 11" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M7.5 2.8v4.4M16.5 2.8v4.4M3.5 9h17M8 13h.1M12 13h.1M16 13h.1M8 17h.1M12 17h.1" />
    </>
  ),
  empty: (
    <>
      <path d="M4.5 8h15l-1.2 12h-12L4.5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M9.5 13.5c1.5 1.2 3.5 1.2 5 0" />
    </>
  ),
};

export function Icon({
  name,
  title,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id="meemon-gold" x1="12" y1="7" x2="52" y2="58">
          <stop stopColor="#FFF1B8" />
          <stop offset=".5" stopColor="#E4B65C" />
          <stop offset="1" stopColor="#A96A26" />
        </linearGradient>
      </defs>
      <path
        d="M32 5.5 57 51H7L32 5.5Z"
        stroke="url(#meemon-gold)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M32 13 50.5 47h-37L32 13Z"
        stroke="url(#meemon-gold)"
        strokeWidth="1"
        opacity=".55"
      />
      <path
        d="M16.5 34s5.8-8 15.5-8 15.5 8 15.5 8-5.8 8-15.5 8-15.5-8-15.5-8Z"
        stroke="url(#meemon-gold)"
        strokeWidth="2"
      />
      <circle cx="32" cy="34" r="6.2" stroke="url(#meemon-gold)" strokeWidth="2" />
      <circle cx="32" cy="34" r="2.2" fill="#F6D98C" />
      <path d="M32 17v5M22 20.5l3.5 4M42 20.5l-3.5 4" stroke="#E8C270" strokeLinecap="round" />
      <path d="m32 45.5 1.2 2.7 2.8 1.2-2.8 1.2-1.2 2.7-1.2-2.7-2.8-1.2 2.8-1.2 1.2-2.7Z" fill="#E8C270" />
    </svg>
  );
}

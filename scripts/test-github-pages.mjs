import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, "legacy-routes.json"), "utf8"),
);

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

const mismatchedLegacyFiles = [];
for (const route of manifest.routes) {
  const path =
    route.path === "index.html" ? route.archivedPath : route.path;
  const absolutePath = resolve(repositoryRoot, path);
  if (
    !existsSync(absolutePath) ||
    sha256(readFileSync(absolutePath)) !== route.sha256
  ) {
    mismatchedLegacyFiles.push(path);
  }
}

if (mismatchedLegacyFiles.length > 0) {
  throw new Error(
    `Legacy contract mismatch:\n${mismatchedLegacyFiles.join("\n")}`,
  );
}

const requiredPages = [
  "v2/index.html",
  "v2/shop/index.html",
  "v2/cart/index.html",
  "v2/checkout/index.html",
  "v2/order/index.html",
  "v2/orders/index.html",
  "v2/product/index.html",
  "v2/admin/index.html",
  "v2/fortune/oracle/index.html",
  "v2/fortune/tarot/index.html",
  "v2/fortune/seimsee/index.html",
  "v2/fortune/jiaobei/index.html",
  "v2/fortune/lucky-number/index.html",
  "v2/fortune/daily/index.html",
  "v2/fortune/colors-2026/index.html",
  "v2/rituals/incense/index.html",
  "v2/rituals/wallet-opening/index.html",
  "v2/rituals/wallet-guide/index.html",
  "v2/rituals/horse-chant/index.html",
  "v2/rituals/money-chant/index.html",
  "v2/wallpapers/index.html",
  "v2/contact/index.html",
  "v2/apps/home/index.html",
  "v2/apps/NFCV.2/home/token.html",
  "v2/apps/NFCV.2/home/index.html",
  "v2/apps/NFCV.2/taro/1/index.html",
  "v2/apps/NFCV.2/taro/3/index.html",
  "v2/apps/NFCV.2/taro/10/index.html",
  "v2/apps/NFCV.2/Seimsee/index.html",
  "v2/apps/NFCV.2/Wood/index.html",
  "v2/apps/NFCV.2/number/index.html",
  "v2/apps/NFCV.2/Lucky day/index.html",
  "v2/apps/app/test1.html",
  "v2/apps/openday/index.html",
  "v2/apps/How to/index.html",
  "v2/apps/pony/index.html",
  "v2/apps/card/Wallpaper/index.html",
  "v2/apps/Color2026/Index.html",
  "v2/apps/Contact/index.html",
  "legacy/index.html",
];

for (const page of requiredPages) {
  if (!existsSync(resolve(repositoryRoot, page))) {
    throw new Error(`Required GitHub Pages route is missing: ${page}`);
  }
}

const rootIndex = readFileSync(resolve(repositoryRoot, "index.html"), "utf8");
if (!rootIndex.includes('window.location.replace("/v2/"')) {
  throw new Error("The root index does not redirect to /v2/.");
}

const homeIndex = readFileSync(resolve(repositoryRoot, "v2/index.html"), "utf8");
const requiredHomeLinks = [
  "/v2/shop",
  "/v2/apps/NFCV.2/home/token.html",
  "/v2/apps/NFCV.2/taro/1/token.html",
  "/v2/apps/NFCV.2/taro/3/token.html",
  "/v2/apps/NFCV.2/taro/10/token.html",
  "/v2/apps/NFCV.2/Seimsee/token.html",
  "/v2/apps/NFCV.2/Wood/token.html",
  "/v2/apps/NFCV.2/number/token.html",
  "/v2/apps/NFCV.2/Lucky%20day/",
  "/v2/apps/app/test1.html",
  "/v2/apps/openday/",
  "/v2/apps/How%20to/",
  "/v2/apps/pony/",
  "/v2/apps/card/Wallpaper/",
  "/v2/apps/Color2026/Index.html",
  "/v2/apps/Contact/",
  "/legacy",
];

for (const href of requiredHomeLinks) {
  if (!homeIndex.includes(`href="${href}"`)) {
    throw new Error(`V2 Home is missing copied app link: ${href}`);
  }
}

const requiredLauncherIcons = [
  "shop",
  "fortune",
  "wallpaper",
  "rituals",
  "seimsee",
  "more",
];

if (!homeIndex.includes("เลือกประตูที่อยากเปิด")) {
  throw new Error("V2 Home is missing the app launcher.");
}

for (const icon of requiredLauncherIcons) {
  const assetPath = `/v2/assets/app-icons/${icon}.png`;
  if (
    !homeIndex.includes(`src="${assetPath}"`) ||
    !existsSync(resolve(repositoryRoot, assetPath.slice(1)))
  ) {
    throw new Error(`V2 Home is missing launcher icon: ${assetPath}`);
  }
}

const copiedAppForwardContracts = [
  ["v2/fortune/index.html", "/v2/apps/NFCV.2/home/token.html"],
  ["v2/fortune/oracle/index.html", "/v2/apps/NFCV.2/home/token.html"],
  ["v2/fortune/tarot/index.html", "/v2/apps/NFCV.2/home/token.html"],
  ["v2/fortune/seimsee/index.html", "/v2/apps/NFCV.2/Seimsee/token.html"],
  ["v2/fortune/jiaobei/index.html", "/v2/apps/NFCV.2/Wood/token.html"],
  ["v2/fortune/lucky-number/index.html", "/v2/apps/NFCV.2/number/token.html"],
  ["v2/fortune/daily/index.html", "/v2/apps/NFCV.2/Lucky%20day/"],
  ["v2/fortune/colors-2026/index.html", "/v2/apps/Color2026/Index.html"],
  ["v2/rituals/index.html", "/v2/apps/How%20to/"],
  ["v2/rituals/incense/index.html", "/v2/apps/app/test1.html"],
  ["v2/rituals/wallet-opening/index.html", "/v2/apps/openday/"],
  ["v2/rituals/wallet-guide/index.html", "/v2/apps/How%20to/"],
  ["v2/rituals/horse-chant/index.html", "/v2/apps/pony/"],
  ["v2/rituals/money-chant/index.html", "/v2/apps/How%20to/"],
  ["v2/wallpapers/index.html", "/v2/apps/card/Wallpaper/"],
  ["v2/contact/index.html", "/v2/apps/Contact/"],
];

for (const [page, href] of copiedAppForwardContracts) {
  const html = readFileSync(resolve(repositoryRoot, page), "utf8");
  if (
    !html.includes(`href="${href}"`) ||
    !html.includes("สำเนาแอปเดิมที่เก็บอยู่ภายในโฟลเดอร์ V2")
  ) {
    throw new Error(`V2 route does not forward to its copied app: ${page}`);
  }
}

const nativeCommerceContracts = [
  ["v2/shop/index.html", "คอลเลกชันที่คัดสรรจากความเชื่อ"],
  ["v2/shop/77-50712224947/index.html", "ซื้อเลย"],
  ["v2/cart/index.html", "ตะกร้าของคุณ"],
  ["v2/checkout/index.html", "จัดส่งฟรีเฉพาะในประเทศไทย"],
  ["v2/order/index.html", "ติดตามคำสั่งซื้อ"],
  ["v2/orders/index.html", "ออเดอร์ของฉัน"],
  // This marker exists both before configuration and in the production login
  // page. The production build must not be rejected merely because Supabase is
  // correctly configured and the login form replaces the setup placeholder.
  ["v2/admin/index.html", "admin-page"],
];

for (const [page, expectedText] of nativeCommerceContracts) {
  const html = readFileSync(resolve(repositoryRoot, page), "utf8");
  if (
    !html.includes(expectedText) ||
    html.includes("สำเนาแอปเดิมที่เก็บอยู่ภายในโฟลเดอร์ V2")
  ) {
    throw new Error(`V2 commerce route is not native: ${page}`);
  }
}

const copiedAppsManifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, "v2/apps/copied-apps.json"), "utf8"),
);
if (
  copiedAppsManifest.copiedFolders.length !== 10 ||
  copiedAppsManifest.copiedFiles.length !== 1 ||
  copiedAppsManifest.copiedDependencies.length !== 1 ||
  copiedAppsManifest.routeMap.fortune !==
    "/v2/apps/NFCV.2/home/token.html"
) {
  throw new Error("The copied app manifest is incomplete.");
}

const copiedFortuneHome = readFileSync(
  resolve(repositoryRoot, "v2/apps/NFCV.2/home/index.html"),
  "utf8",
);
if (
  !copiedFortuneHome.includes("/v2/apps/NFCV.2/Seimsee/token.html") ||
  !copiedFortuneHome.includes("/v2/apps/shared/token.js") ||
  copiedFortuneHome.includes("taithai-tai.github.io/meemon/NFCV.2/") ||
  copiedFortuneHome.includes("taithai-tai.github.io/app/token.js")
) {
  throw new Error("The copied fortune hub still points to the original app URL.");
}

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const v2SourceRoot = `${resolve(repositoryRoot, "v2/_source")}/`;
const v2HtmlFiles = listHtmlFiles(resolve(repositoryRoot, "v2"))
  .filter((htmlFile) => !htmlFile.startsWith(v2SourceRoot));
const assetPaths = v2HtmlFiles.flatMap((htmlFile) => {
  const html = readFileSync(htmlFile, "utf8");
  return [...html.matchAll(/(?:src|href)="(\/v2\/[^"]+)"/g)].map(
    (match) => match[1],
  );
});

for (const assetPath of assetPaths) {
  const cleanPath = assetPath.split(/[?#]/, 1)[0];
  const candidate = resolve(
    repositoryRoot,
    decodeURIComponent(cleanPath.slice(1)),
  );
  const routeIndex = resolve(candidate, "index.html");
  if (!existsSync(candidate) && !existsSync(routeIndex)) {
    throw new Error(`V2 reference is missing: ${assetPath}`);
  }
}

const serviceWorker = readFileSync(
  resolve(repositoryRoot, "v2/sw.js"),
  "utf8",
);
if (
  !serviceWorker.includes('url.pathname.startsWith("/v2/_next/")') ||
  !serviceWorker.includes('url.pathname.startsWith("/v2/assets/")') ||
  serviceWorker.includes('url.pathname.startsWith("/v2/apps/")') ||
  serviceWorker.includes("localStorage")
) {
  throw new Error("The V2 service worker contract is invalid.");
}

const cartSource = readFileSync(
  resolve(repositoryRoot, "v2/_source/app/components/CartProvider.tsx"),
  "utf8",
);
if (!cartSource.includes('"meemon:v2:cart"')) {
  throw new Error("The V2 cart does not use its isolated storage namespace.");
}

const checkoutSource = readFileSync(
  resolve(repositoryRoot, "v2/_source/app/components/CheckoutClient.tsx"),
  "utf8",
);
const paymentPanelSource = readFileSync(
  resolve(repositoryRoot, "v2/_source/app/components/OrderPaymentPanel.tsx"),
  "utf8",
);
const pendingOrdersSource = readFileSync(
  resolve(repositoryRoot, "v2/_source/lib/pending-orders.ts"),
  "utf8",
);
if (
  !checkoutSource.includes('createOrder') ||
  !checkoutSource.includes('จัดส่งเฉพาะในประเทศไทยเท่านั้น') ||
  !paymentPanelSource.includes('uploadSlip') ||
  !paymentPanelSource.includes('โอนเงินและอัปโหลดสลิป') ||
  !pendingOrdersSource.includes('"meemon:v2:orders"') ||
  checkoutSource.includes('mockQrCells') ||
  checkoutSource.includes('QR Code (จำลอง)') ||
  checkoutSource.includes('0793953402')
) {
  throw new Error("The V2 checkout is not using the protected bank-transfer flow.");
}

const checkoutFunction = readFileSync(
  resolve(repositoryRoot, "supabase/functions/checkout/index.ts"),
  "utf8",
);
const adminFunction = readFileSync(
  resolve(repositoryRoot, "supabase/functions/admin/index.ts"),
  "utf8",
);
const easySlipFunction = readFileSync(
  resolve(repositoryRoot, "supabase/functions/_shared/easyslip.ts"),
  "utf8",
);
const easySlipParser = readFileSync(
  resolve(repositoryRoot, "supabase/functions/_shared/easyslip-parser.ts"),
  "utf8",
);
const sharedHttpFunction = readFileSync(
  resolve(repositoryRoot, "supabase/functions/_shared/http.ts"),
  "utf8",
);
if (
  !checkoutFunction.includes('4 * 1024 * 1024') ||
  !checkoutFunction.includes('attemptNumber > 5') ||
  !checkoutFunction.includes('consume_rate_limit_v1') ||
  !checkoutFunction.includes('recover_order_access_v1') ||
  !checkoutFunction.includes('lookup_orders_by_phone_v1') ||
  !checkoutFunction.includes('action === "orders-by-phone"') ||
  !checkoutFunction.includes('receiver.bank_code ?? receiver.bankCode') ||
  !checkoutFunction.includes('receiver.account_number ?? receiver.accountNumber') ||
  !easySlipFunction.includes('form.set("image"') ||
  !easySlipFunction.includes('form.set("matchAccount", "true")') ||
  !easySlipFunction.includes('form.set("matchAmount"') ||
  !easySlipFunction.includes('form.set("checkDuplicate", "true")') ||
  !easySlipFunction.includes('env("EASYSLIP_API_KEY")') ||
  !easySlipFunction.includes("applyExpectedReceiver") ||
  !easySlipParser.includes("maskedAccountMatches") ||
  !easySlipParser.includes("canPromoteUnregisteredReceiver") ||
  !easySlipParser.includes("pattern.length === expected.length") ||
  !easySlipParser.includes("visibleDigits.length >= 4")
) {
  throw new Error("The protected EasySlip upload contract is incomplete.");
}
if (
  !adminFunction.includes('request.method === "DELETE" && action === "order"') ||
  !adminFunction.includes('action === "order-slip"') ||
  !adminFunction.includes('action === "slip-url"') ||
  !adminFunction.includes('action === "admin-account"') ||
  !adminFunction.includes('.createSignedUrl(') ||
  !adminFunction.includes('auth.admin.createUser') ||
  !adminFunction.includes('order.slip.upload') ||
  !adminFunction.includes('order.slip.view') ||
  !adminFunction.includes('order.fulfillment_status') ||
  !adminFunction.includes('.is("deleted_at", null)') ||
  !sharedHttpFunction.includes('GET, POST, PATCH, DELETE, OPTIONS')
) {
  throw new Error("The administrator order workflow contract is incomplete.");
}

const supabaseConfig = readFileSync(
  resolve(repositoryRoot, "supabase/config.toml"),
  "utf8",
);
if (
  !/\[functions\.checkout\]\s+verify_jwt = false/.test(supabaseConfig) ||
  !/\[functions\.admin\]\s+verify_jwt = true/.test(supabaseConfig) ||
  !/\[functions\.maintenance\]\s+verify_jwt = true/.test(supabaseConfig)
) {
  throw new Error("Supabase Edge Function authentication scopes are unsafe.");
}

const migrationFiles = readdirSync(resolve(repositoryRoot, "supabase/migrations"))
  .filter((file) => file.endsWith(".sql"));
const migrations = migrationFiles.map((file) => readFileSync(resolve(repositoryRoot, "supabase/migrations", file), "utf8")).join("\n");
const protectedTables = ["products", "product_skus", "payment_accounts", "orders", "order_items", "order_access_tokens", "slip_attempts", "payments", "admin_profiles", "audit_logs", "api_rate_limits"];
for (const table of protectedTables) {
  if (!migrations.includes(`alter table public.${table} enable row level security;`)) {
    throw new Error(`RLS is missing for Supabase table: ${table}`);
  }
}
if (
  !migrations.includes("unique (provider, trans_ref)") ||
  !migrations.includes("recover_order_access_v1") ||
  !migrations.includes("lookup_orders_by_phone_v1") ||
  !migrations.includes("deleted_at is null") ||
  !migrations.includes("country_code = 'TH'") ||
  !migrations.includes("shipping_satang integer not null default 0 check (shipping_satang = 0)")
) {
  throw new Error("The database order/payment contract is incomplete.");
}
const unlimitedPaymentMigration = readFileSync(
  resolve(repositoryRoot, "supabase/migrations/20260801000700_unlimited_payment_and_phone_lookup.sql"),
  "utf8",
);
if (
  !unlimitedPaymentMigration.includes("interval '100 years'") ||
  !unlimitedPaymentMigration.includes("select 0;") ||
  unlimitedPaymentMigration.includes("p_transaction_at > v_order.expires_at") ||
  unlimitedPaymentMigration.includes("now() > v_order.expires_at")
) {
  throw new Error("Orders must remain payable without an automatic transfer deadline.");
}

const nextFiles = listFiles(resolve(repositoryRoot, "v2/_next/static/chunks"))
  .filter((file) => file.endsWith(".js"))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
for (const forbidden of ["SUPABASE_SERVICE_ROLE_KEY", "EASYSLIP_API_KEY", "TURNSTILE_SECRET_KEY", "ADMIN_BOOTSTRAP_PASSWORD", "0793953402"]) {
  if (nextFiles.includes(forbidden)) throw new Error(`A private commerce value leaked into the static build: ${forbidden}`);
}

process.stdout.write(
  `GitHub Pages contract passed: ${manifest.totals.preservedHtmlPaths} legacy pages and ${v2HtmlFiles.length} generated V2 pages.\n`,
);

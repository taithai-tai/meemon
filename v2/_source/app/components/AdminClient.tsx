"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminLogin, adminRequest, commerceConfigured } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { Icon } from "./Icons";

const SESSION_KEY = "meemon:v2:admin-access-token";
const ORDER_SENDER = "นาคีมีมนตรมีมนตร์ 92 ม7  บ้านบังบาตร ตำบลชัยพร อำเภอเมือเมือง จังหวจังหวัดบึงกาฬ บึงกาฬ 38000";
const ORDER_COMPANY = "MEEMON · นาคีมีมนตร์";
type Tab = "dashboard" | "orders" | "products" | "accounts" | "admins" | "audit";
type Row = Record<string, unknown>;

const adminStatusLabel: Record<string, string> = {
  pending_payment: "ยังไม่ชำระเงิน", verifying: "กำลังตรวจสลิป", verification_failed: "ตรวจสลิปไม่ผ่าน",
  needs_review: "รอร้านตรวจสอบ", paid: "จ่ายเงินแล้ว", packing: "กำลังแพ็ค", shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ", expired: "หมดเวลา", cancelled: "ยกเลิก", refunded: "คืนเงินแล้ว",
};

const slipStatusLabel: Record<string, string> = {
  verifying: "กำลังตรวจสอบ", verified: "ยืนยันแล้ว", rejected: "ไม่ผ่าน",
  delayed: "ธนาคารกำลังประมวลผล", needs_review: "รอตรวจด้วยตา", provider_error: "ระบบตรวจขัดข้อง",
};

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "dashboard", label: "ภาพรวม" }, { id: "orders", label: "ออเดอร์" },
  { id: "products", label: "สินค้า" }, { id: "accounts", label: "บัญชีรับเงิน" },
  { id: "admins", label: "ผู้ดูแล" }, { id: "audit", label: "ประวัติ" },
];

function ProductEditor({ token, product, reload }: { token: string; product: Row; reload: () => void }) {
  const [draft, setDraft] = useState(product);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const skus = (draft.product_skus ?? []) as Row[];
  async function save() {
    setBusy(true); setMessage("");
    try {
      await adminRequest(token, "product", { method: "PATCH", body: JSON.stringify({
        id: draft.id,
        product: { name: draft.name, description: draft.description, category: draft.category, status: draft.status, track_inventory: draft.track_inventory },
        skus: skus.map((sku) => ({ id: sku.id, price_satang: sku.price_satang, active: sku.active, stock_quantity: draft.track_inventory ? sku.stock_quantity : null })),
      }) });
      setMessage("บันทึกแล้ว"); reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  function updateSku(index: number, patch: Row) {
    setDraft((current) => ({ ...current, product_skus: skus.map((sku, skuIndex) => skuIndex === index ? { ...sku, ...patch } : sku) }));
  }
  async function uploadImage(file: File) {
    const body = new FormData(); body.set("productId", String(draft.id)); body.set("file", file);
    setBusy(true);
    try { await adminRequest(token, "product-image", { method: "POST", body }); setMessage("เพิ่มรูปแล้ว"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "เพิ่มรูปไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <details className="admin-product"><summary><span><strong>{String(draft.name)}</strong><small>{String(draft.slug)} · {skus.length} ตัวเลือก</small></span><em className={`status-pill ${draft.status}`}>{draft.status === "needs_pricing" ? "รอกำหนดราคา" : draft.status === "active" ? "เปิดขาย" : "ปิดขาย"}</em></summary><div className="admin-editor-grid">
    <label>ชื่อสินค้า<input value={String(draft.name ?? "")} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
    <label>หมวดหมู่<select value={String(draft.category)} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option value="wallets">กระเป๋า</option><option value="charms">เครื่องราง</option><option value="sacred">ของมงคล</option><option value="lifestyle">ไลฟ์สไตล์</option><option value="other">อื่น ๆ</option></select></label>
    <label>สถานะ<select value={String(draft.status)} onChange={(event) => setDraft({ ...draft, status: event.target.value })}><option value="active">เปิดขาย</option><option value="needs_pricing">แสดงแต่ยังไม่ขาย</option><option value="inactive">ปิดขาย</option></select></label>
    <label className="check-field"><input type="checkbox" checked={Boolean(draft.track_inventory)} onChange={(event) => setDraft({ ...draft, track_inventory: event.target.checked })} /> ติดตามสต็อกแยกตัวเลือก</label>
    <label className="full-field">รายละเอียด<textarea value={String(draft.description ?? "")} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
    <div className="full-field sku-table"><strong>ราคาและสต็อกตัวเลือก</strong>{skus.map((sku, index) => <div className="sku-row" key={String(sku.id)}><span>{String(sku.label)}</span><label>ราคา (บาท)<input type="number" min="0" step="0.01" value={sku.price_satang === null ? "" : Number(sku.price_satang) / 100} onChange={(event) => updateSku(index, { price_satang: event.target.value === "" ? null : Math.round(Number(event.target.value) * 100) })} /></label>{Boolean(draft.track_inventory) ? <label>คงเหลือ<input type="number" min="0" value={sku.stock_quantity === null ? "" : String(sku.stock_quantity)} onChange={(event) => updateSku(index, { stock_quantity: event.target.value === "" ? null : Number(event.target.value) })} /></label> : <span className="unlimited-stock">ไม่จำกัดสต็อก</span>}<label className="check-field"><input type="checkbox" checked={Boolean(sku.active)} onChange={(event) => updateSku(index, { active: event.target.checked })} /> เปิด</label></div>)}</div>
    <label className="image-upload full-field">เพิ่มรูปสินค้า<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadImage(file); }} /></label>
    <div className="admin-actions full-field"><span>{message}</span><button className="button button-gold" type="button" disabled={busy} onClick={save}>{busy ? "กำลังบันทึก…" : "บันทึกสินค้า"}</button></div>
  </div></details>;
}

export function AdminClient() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<Row>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setToken(window.sessionStorage.getItem(SESSION_KEY) ?? ""), []);
  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true); setError("");
    try { setData(await adminRequest<Row>(token, tab)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ"); }
    finally { setBusy(false); }
  }, [tab, token]);
  useEffect(() => { load(); }, [load]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { const session = await adminLogin(String(form.get("username")), String(form.get("password"))); window.sessionStorage.setItem(SESSION_KEY, session.access_token); setToken(session.access_token); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "เข้าสู่ระบบไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  function logout() { window.sessionStorage.removeItem(SESSION_KEY); setToken(""); setData({}); }

  if (!commerceConfigured) return <div className="admin-login"><span className="empty-icon"><Icon name="shield" /></span><h2>หลังบ้านยังไม่เชื่อมต่อ</h2><p>ใส่ Public Supabase URL, anon key และ Turnstile site key ตอน build ก่อนเปิดใช้งาน โดย secret ทั้งหมดต้องอยู่ใน Supabase เท่านั้น</p></div>;
  if (!token) return <form className="admin-login" onSubmit={login}><span className="empty-icon"><Icon name="shield" /></span><small>MEEMON SECURE ADMIN</small><h2>เข้าสู่ระบบผู้ดูแล</h2><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error ? <div className="form-error">{error}</div> : null}<button className="button button-gold" disabled={busy}>{busy ? "กำลังตรวจสอบ…" : "เข้าสู่หลังบ้าน"}</button></form>;

  return <div className="admin-shell"><aside className="admin-nav"><div><small>MEEMON ADMIN</small><strong>ศูนย์จัดการร้าน</strong></div>{tabs.map((item) => <button className={tab === item.id ? "active" : ""} onClick={() => { setData({}); setTab(item.id); }} key={item.id}>{item.label}</button>)}<button onClick={logout}>ออกจากระบบ</button></aside><main className="admin-main"><header><div><small>LIVE COMMERCE</small><h2>{tabs.find((item) => item.id === tab)?.label}</h2></div><button className="button button-ghost" onClick={load} disabled={busy}>รีเฟรช</button></header>{error ? <div className="form-error">{error}</div> : null}{busy && !Object.keys(data).length ? <div className="empty-state">กำลังโหลด…</div> : <AdminPanel tab={tab} data={data} token={token} reload={load} />}</main></div>;
}

function AdminPanel({ tab, data, token, reload }: { tab: Tab; data: Row; token: string; reload: () => void }) {
  if (tab === "dashboard") {
    const counts = (data.counts ?? {}) as Row;
    return <><div className="admin-metrics"><article><span>ออเดอร์ทั้งหมด</span><strong>{String(counts.orders ?? 0)}</strong></article><article><span>สินค้า</span><strong>{String(counts.products ?? 0)}</strong></article><article><span>รอตรวจสอบ</span><strong>{String(counts.needsReview ?? 0)}</strong></article></div><div className="notice"><Icon name="shield" />ข้อมูลสลิปเป็นไฟล์ส่วนตัว เปิดดูได้เฉพาะผู้ดูแลที่เข้าสู่ระบบ</div></>;
  }
  if (tab === "products") return <div className="admin-stack"><CreateProduct token={token} reload={reload} />{((data.products ?? []) as Row[]).map((product) => <ProductEditor key={String(product.id)} token={token} product={product} reload={reload} />)}</div>;
  if (tab === "orders") return <OrdersAdmin orders={(data.orders ?? []) as Row[]} token={token} reload={reload} />;
  if (tab === "accounts") return <AccountsAdmin accounts={(data.accounts ?? []) as Row[]} token={token} reload={reload} />;
  if (tab === "admins") return <AdminUsers admins={(data.admins ?? []) as Row[]} profile={(data.profile ?? {}) as Row} token={token} reload={reload} />;
  return <div className="audit-list">{((data.logs ?? []) as Row[]).map((log) => <article key={String(log.id)}><strong>{String(log.action)}</strong><span>{String(log.entity_type)} · {String(log.entity_id ?? "-")}</span><time>{new Date(String(log.created_at)).toLocaleString("th-TH")}</time></article>)}</div>;
}

function OrdersAdmin({ orders, token, reload }: { orders: Row[]; token: string; reload: () => void }) {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH");
  const visibleOrders = normalizedQuery ? orders.filter((order) => {
    const items = (order.order_items ?? []) as Row[];
    const payments = (order.payments ?? []) as Row[];
    const haystack = [
      order.order_number, order.full_name, order.phone, order.address, order.province,
      order.postal_code, order.status, adminStatusLabel[String(order.status)], order.note,
      ...items.flatMap((item) => [item.product_name, item.sku_label]),
      ...payments.flatMap((payment) => [payment.trans_ref, payment.receiver_name, payment.receiving_bank]),
    ].map((value) => String(value ?? "").toLocaleLowerCase("th-TH")).join(" ");
    return haystack.includes(normalizedQuery);
  }) : orders;
  return <div className="admin-stack">
    <form className="admin-order-search" onSubmit={(event) => { event.preventDefault(); setQuery(draftQuery); }}>
      <span><Icon name="search" /></span>
      <label><strong>ค้นหาออเดอร์</strong><input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="ชื่อ เบอร์โทร เลขออเดอร์ สินค้า หรือเลขอ้างอิงสลิป" /></label>
      <button className="button button-gold">ค้นหา</button>
      {query ? <button className="button button-ghost" type="button" onClick={() => { setDraftQuery(""); setQuery(""); }}>ล้าง</button> : null}
      <small>พบ {visibleOrders.length} จาก {orders.length} ออเดอร์</small>
    </form>
    {visibleOrders.length ? visibleOrders.map((order) => <OrderAdmin key={String(order.id)} order={order} token={token} reload={reload} />) : <div className="empty-state compact-empty"><Icon name="search" /><h2>ไม่พบออเดอร์</h2><p>ลองค้นด้วยชื่อ เบอร์โทร หรือเลขออเดอร์อีกครั้ง</p></div>}
  </div>;
}

function AdminUsers({ admins, profile, token, reload }: { admins: Row[]; profile: Row; token: string; reload: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true); setMessage("");
    try {
      await adminRequest(token, "admin-account", { method: "POST", body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) });
      formElement.reset(); setMessage("เพิ่มบัญชีผู้ดูแลแล้ว"); reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "เพิ่มผู้ดูแลไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <div className="admin-stack">
    <form className="admin-credentials-card" onSubmit={create}>
      <div><small>ADMIN ACCESS</small><h3>เพิ่ม Username และ Password</h3><p>บัญชีใหม่จะเข้าสู่หน้าแอดมินและจัดการร้านได้ทันที</p></div>
      <label>Username<input name="username" required minLength={3} maxLength={40} pattern="[a-zA-Z0-9._-]{3,40}" autoComplete="off" placeholder="เช่น manager" /></label>
      <label>Password<input name="password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" placeholder="อย่างน้อย 6 ตัวอักษร" /></label>
      <button className="button button-gold" disabled={busy}>{busy ? "กำลังเพิ่ม…" : "เพิ่มผู้ดูแล"}</button>
      {message ? <span className="admin-form-message">{message}</span> : null}
    </form>
    <section className="admin-user-list"><header><div><small>AUTHORIZED USERS</small><h3>บัญชีผู้ดูแลทั้งหมด</h3></div><span>คุณเข้าสู่ระบบในชื่อ {String(profile.username ?? "-")}</span></header>{admins.map((admin) => <article key={String(admin.user_id)}><span className="admin-avatar"><Icon name="shield" /></span><div><strong>{String(admin.username)}</strong><small>สร้างเมื่อ {new Date(String(admin.created_at)).toLocaleString("th-TH")}</small></div><em className={`status-pill ${admin.active ? "active" : "inactive"}`}>{admin.active ? "ใช้งานได้" : "ปิดใช้งาน"}</em></article>)}</section>
  </div>;
}

function CreateProduct({ token, reload }: { token: string; reload: () => void }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await adminRequest(token, "product", { method: "POST", body: JSON.stringify({ slug: form.get("slug"), name: form.get("name"), category: form.get("category"), priceSatang: Math.round(Number(form.get("price")) * 100) }) }); setMessage("เพิ่มสินค้าแล้ว"); setOpen(false); reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "เพิ่มไม่สำเร็จ"); } }
  return <div className="admin-create"><button className="button button-gold" onClick={() => setOpen(!open)}>{open ? "ปิดแบบฟอร์ม" : "+ เพิ่มสินค้า"}</button>{open ? <form className="admin-inline-form" onSubmit={submit}><input name="name" required placeholder="ชื่อสินค้า" /><input name="slug" required pattern="[a-z0-9][a-z0-9-]{2,100}" placeholder="url-slug" /><select name="category"><option value="other">อื่น ๆ</option><option value="wallets">กระเป๋า</option><option value="charms">เครื่องราง</option><option value="sacred">ของมงคล</option><option value="lifestyle">ไลฟ์สไตล์</option></select><input name="price" type="number" min="0" step="0.01" required placeholder="ราคา" /><button className="button button-ghost">สร้างสินค้า</button></form> : null}<span>{message}</span></div>;
}

function OrderAdmin({ order, token, reload }: { order: Row; token: string; reload: () => void }) {
  const [status, setStatus] = useState("");
  const items = (order.order_items ?? []) as Row[];
  const attempts = [...((order.slip_attempts ?? []) as Row[])].sort((a, b) => Number(b.attempt_number) - Number(a.attempt_number));
  const payments = (order.payments ?? []) as Row[];
  const [actionBusy, setActionBusy] = useState(false);
  const [slipMessage, setSlipMessage] = useState("");
  const [viewer, setViewer] = useState<{ url: string; attempt: number } | null>(null);
  const printSheet = useRef<HTMLElement>(null);
  const canUploadSlip = ["pending_payment", "verification_failed", "needs_review", "expired"].includes(String(order.status)) && attempts.length < 5;
  async function save() {
    if (!status) return;
    setActionBusy(true);
    try { await adminRequest(token, "order", { method: "PATCH", body: JSON.stringify({ id: order.id, status }) }); setStatus(""); reload(); }
    catch (error) { window.alert(error instanceof Error ? error.message : "เปลี่ยนสถานะไม่สำเร็จ"); }
    finally { setActionBusy(false); }
  }
  async function removeOrder() {
    if (!window.confirm(`ลบออเดอร์ ${String(order.order_number)} ออกจากรายการใช่หรือไม่?`)) return;
    setActionBusy(true);
    try { await adminRequest(token, "order", { method: "DELETE", body: JSON.stringify({ id: order.id }) }); reload(); }
    catch (error) { window.alert(error instanceof Error ? error.message : "ลบออเดอร์ไม่สำเร็จ"); }
    finally { setActionBusy(false); }
  }
  async function uploadOrderSlip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const body = new FormData(formElement);
    body.set("orderId", String(order.id));
    setActionBusy(true); setSlipMessage(""); setViewer(null);
    try {
      const result = await adminRequest<{ message: string }>(token, "order-slip", { method: "POST", body });
      formElement.reset(); setSlipMessage(result.message); await reload();
    } catch (error) { setSlipMessage(error instanceof Error ? error.message : "อัปโหลดสลิปไม่สำเร็จ"); }
    finally { setActionBusy(false); }
  }
  async function viewSlip(attempt: Row) {
    setActionBusy(true); setSlipMessage("");
    try {
      const result = await adminRequest<{ url: string }>(token, "slip-url", { method: "POST", body: JSON.stringify({ attemptId: attempt.id }) });
      setViewer({ url: result.url, attempt: Number(attempt.attempt_number) });
    } catch (error) { setSlipMessage(error instanceof Error ? error.message : "เปิดสลิปไม่สำเร็จ"); }
    finally { setActionBusy(false); }
  }
  async function printOrder() {
    const sheet = printSheet.current;
    if (!sheet) return;
    if (!["paid", "packing", "shipped"].includes(String(order.status))) {
      window.alert("ออเดอร์นี้ยังไม่ยืนยันการชำระเงิน จึงยังเปลี่ยนเป็นกำลังแพ็คไม่ได้");
      return;
    }
    setActionBusy(true);
    try {
      if (order.status === "paid") {
        await adminRequest(token, "order", { method: "PATCH", body: JSON.stringify({ id: order.id, status: "packing" }) });
        reload();
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "เปลี่ยนสถานะเป็นกำลังแพ็คไม่สำเร็จ");
      setActionBusy(false);
      return;
    }
    const printable = sheet.cloneNode(true) as HTMLElement;
    printable.removeAttribute("aria-hidden");
    printable.classList.add("is-printing", "active-order-print");
    document.body.appendChild(printable);
    const cleanup = () => {
      printable.remove();
      document.body.classList.remove("printing-order");
      setActionBusy(false);
    };
    document.body.classList.add("printing-order");
    window.addEventListener("afterprint", cleanup, { once: true });
    const logo = printable.querySelector("img");
    if (logo) await logo.decode().catch(() => undefined);
    window.print();
  }
  return <article className="admin-order">
    <header><div><small>{new Date(String(order.created_at)).toLocaleString("th-TH")}</small><h3>{String(order.order_number)}</h3></div><em className={`status-pill ${String(order.status)}`}>{adminStatusLabel[String(order.status)] ?? String(order.status)}</em></header>
    <p>{String(order.full_name)} · {String(order.phone)}<br />{String(order.address)} {String(order.province)} {String(order.postal_code)}</p>
    <div className="order-item-mini">{items.map((item) => <span key={String(item.id)}>{String(item.product_name)} × {String(item.quantity)}</span>)}</div>
    <strong>{formatPrice(Number(order.total_satang) / 100)}</strong>
    <section className="admin-slip-panel">
      <header><div><small>PAYMENT EVIDENCE</small><h4>สลิปและผลตรวจสอบ</h4></div><span>{attempts.length ? `${attempts.length} สลิป` : "ยังไม่มีสลิป"}</span></header>
      {attempts.length ? <div className="admin-slip-list">{attempts.map((attempt) => {
        const payment = payments.find((item) => String(item.slip_attempt_id) === String(attempt.id));
        return <article key={String(attempt.id)}>
          <div><strong>สลิปครั้งที่ {String(attempt.attempt_number)}</strong><small>{new Date(String(attempt.created_at)).toLocaleString("th-TH")}</small></div>
          <em className={`status-pill ${String(attempt.status)}`}>{slipStatusLabel[String(attempt.status)] ?? String(attempt.status)}</em>
          <dl>
            <div><dt>ผลระบบ</dt><dd>{attempt.provider_code ? `รหัส ${String(attempt.provider_code)}` : "ยังไม่มีผล"}</dd></div>
            <div><dt>เลขอ้างอิง</dt><dd>{String(attempt.trans_ref ?? payment?.trans_ref ?? "-")}</dd></div>
            {payment ? <><div><dt>ยอดที่ยืนยัน</dt><dd>{formatPrice(Number(payment.amount_satang) / 100)}</dd></div><div><dt>ผู้รับ / ธนาคาร</dt><dd>{String(payment.receiver_name ?? "-")} · {String(payment.receiving_bank ?? "-")}</dd></div></> : null}
          </dl>
          {attempt.provider_message ? <p>{String(attempt.provider_message)}</p> : null}
          <button className="button button-ghost" type="button" disabled={actionBusy || !attempt.object_path} onClick={() => viewSlip(attempt)}>{attempt.object_path ? "ดูภาพสลิป" : "ไฟล์หมดอายุ"}</button>
        </article>;
      })}</div> : <p className="admin-slip-empty">ลูกค้ายังไม่ได้ส่งสลิป แอดมินสามารถอัปโหลดแทนได้ด้านล่าง</p>}
      {viewer ? <div className="admin-slip-viewer"><header><strong>ภาพสลิปครั้งที่ {viewer.attempt}</strong><div><a href={viewer.url} target="_blank" rel="noreferrer">เปิดภาพเต็ม</a><button type="button" onClick={() => setViewer(null)}>ปิด</button></div></header><img src={viewer.url} alt={`สลิปออเดอร์ ${String(order.order_number)} ครั้งที่ ${viewer.attempt}`} /></div> : null}
      <form className="admin-slip-upload" onSubmit={uploadOrderSlip}>
        <label>อัปโหลดสลิปแทนลูกค้า<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required disabled={!canUploadSlip || actionBusy} /></label>
        <button className="button button-gold" disabled={!canUploadSlip || actionBusy}>{actionBusy ? "กำลังตรวจสอบ…" : "อัปโหลดและตรวจสลิป"}</button>
        {!canUploadSlip ? <small>{attempts.length >= 5 ? "อัปโหลดครบ 5 ครั้งแล้ว" : "ออเดอร์นี้ยืนยันการชำระแล้ว"}</small> : <small>รองรับ JPG, PNG, WebP ไม่เกิน 4 MB · ตรวจยอดและผู้รับด้วย EasySlip</small>}
      </form>
      {slipMessage ? <div className="admin-slip-message">{slipMessage}</div> : null}
    </section>
    <div className="admin-actions admin-order-actions">
      <button className="button button-gold" type="button" disabled={actionBusy} onClick={printOrder}>พิมพ์ออเดอร์</button>
      <select aria-label="เลือกสถานะถัดไป" value={status} disabled={actionBusy} onChange={(event) => setStatus(event.target.value)}><option value="">เลือกสถานะถัดไป</option><option value="packing">กำลังแพ็ค</option><option value="shipped">จัดส่งแล้ว</option></select>
      <button className="button button-ghost" type="button" disabled={actionBusy || !status} onClick={save}>เปลี่ยนสถานะ</button>
      <button className="button button-danger" type="button" disabled={actionBusy} onClick={removeOrder}>ลบออเดอร์</button>
    </div>
    <section className="order-print-sheet" ref={printSheet} aria-hidden="true">
      <header className="order-print-header">
        <div className="order-print-brand"><img src="/v2/assets/brand/logo.png" alt="Meemon" /><div><small>{ORDER_COMPANY}</small><h1>ใบจัดเตรียมและจัดส่งสินค้า</h1></div></div>
        <dl><div><dt>เลขออเดอร์</dt><dd>{String(order.order_number)}</dd></div><div><dt>วันที่สั่งซื้อ</dt><dd>{new Date(String(order.created_at)).toLocaleString("th-TH")}</dd></div></dl>
      </header>
      <section className="order-print-block">
        <span className="order-print-step">01</span><div><small>ผู้ส่ง</small><h2>ชื่อและที่อยู่ผู้ส่ง</h2><p>{ORDER_SENDER}</p></div>
      </section>
      <section className="order-print-block">
        <span className="order-print-step">02</span><div><small>ผู้รับ</small><h2>{String(order.full_name)}</h2><p className="order-print-phone">โทร. {String(order.phone)}</p><address>{String(order.address)} {String(order.province)} {String(order.postal_code)}<br />ประเทศไทย</address></div>
      </section>
      <section className="order-print-items">
        <div className="order-print-section-title"><span className="order-print-step">03</span><div><small>รายการสินค้า</small><h2>สินค้าที่สั่งซื้อ</h2></div></div>
        <table><thead><tr><th>ลำดับ</th><th>สินค้า / ตัวเลือก</th><th>จำนวน</th><th>รวม</th></tr></thead><tbody>{items.map((item, index) => <tr key={String(item.id)}><td>{index + 1}</td><td><strong>{String(item.product_name)}</strong><small>{String(item.sku_label ?? "แบบมาตรฐาน")}</small></td><td>{String(item.quantity)}</td><td>{formatPrice(Number(item.line_total_satang ?? 0) / 100)}</td></tr>)}</tbody><tfoot><tr><td colSpan={3}>ยอดรวมทั้งสิ้น</td><td>{formatPrice(Number(order.total_satang) / 100)}</td></tr></tfoot></table>
        {String(order.note ?? "").trim() ? <p className="order-print-note"><strong>หมายเหตุ:</strong> {String(order.note)}</p> : null}
      </section>
      <footer><span>จัดส่งในประเทศไทยเท่านั้น</span><span>พิมพ์จาก Meemon Admin</span></footer>
    </section>
  </article>;
}

function AccountsAdmin({ accounts, token, reload }: { accounts: Row[]; token: string; reload: () => void }) {
  const [message, setMessage] = useState("");
  async function create(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await adminRequest(token, "account", { method: "POST", body: JSON.stringify({ bankCode: form.get("bankCode"), bankName: form.get("bankName"), accountHolder: form.get("accountHolder"), accountNumber: form.get("accountNumber") }) }); setMessage("เพิ่มบัญชีรอยืนยันแล้ว"); reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "เพิ่มไม่สำเร็จ"); } }
  async function validate(event: React.FormEvent<HTMLFormElement>, id: string) { event.preventDefault(); const body = new FormData(event.currentTarget); body.set("accountId", id); try { await adminRequest(token, "validate-account", { method: "POST", body }); setMessage("ยืนยันและเปิดใช้บัญชีใหม่แล้ว"); reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "ยืนยันไม่สำเร็จ"); } }
  return <div className="admin-stack"><form className="admin-inline-form" onSubmit={create}><strong>เพิ่มบัญชีรับเงิน</strong><input name="bankCode" defaultValue="004" required placeholder="รหัสธนาคาร" /><input name="bankName" defaultValue="ธนาคารกสิกรไทย" required placeholder="ธนาคาร" /><input name="accountHolder" required placeholder="ชื่อบัญชี" /><input name="accountNumber" required inputMode="numeric" pattern="[0-9]{9,15}" placeholder="เลขบัญชี" /><button className="button button-gold">บันทึกเป็นรอยืนยัน</button></form><span>{message}</span>{accounts.map((account) => <article className="admin-account" key={String(account.id)}><header><div><h3>{String(account.bank_name)}</h3><span>{String(account.account_holder)} · {String(account.account_number)}</span></div><em className={`status-pill ${String(account.status)}`}>{String(account.status)}</em></header>{account.status === "pending_validation" ? <form className="admin-inline-form" onSubmit={(event) => validate(event, String(account.id))}><span>ลงทะเบียนบัญชีนี้ใน EasySlip แล้วอัปโหลดสลิปทดสอบจริง</span><input name="amountSatang" type="number" min="1" required placeholder="ยอดทดสอบ (สตางค์)" /><input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /><button className="button button-ghost">ยืนยันและเปิดใช้</button></form> : null}</article>)}</div>;
}

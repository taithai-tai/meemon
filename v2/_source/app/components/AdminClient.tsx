"use client";

import { useCallback, useEffect, useState } from "react";
import { adminLogin, adminRequest, commerceConfigured } from "@/lib/commerce";
import { formatPrice } from "@/lib/data";
import { Icon } from "./Icons";

const SESSION_KEY = "meemon:v2:admin-access-token";
type Tab = "dashboard" | "orders" | "products" | "accounts" | "audit";
type Row = Record<string, unknown>;

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "dashboard", label: "ภาพรวม" }, { id: "orders", label: "ออเดอร์" },
  { id: "products", label: "สินค้า" }, { id: "accounts", label: "บัญชีรับเงิน" },
  { id: "audit", label: "ประวัติ" },
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

  return <div className="admin-shell"><aside className="admin-nav"><div><small>MEEMON ADMIN</small><strong>ศูนย์จัดการร้าน</strong></div>{tabs.map((item) => <button className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)} key={item.id}>{item.label}</button>)}<button onClick={logout}>ออกจากระบบ</button></aside><main className="admin-main"><header><div><small>LIVE COMMERCE</small><h2>{tabs.find((item) => item.id === tab)?.label}</h2></div><button className="button button-ghost" onClick={load} disabled={busy}>รีเฟรช</button></header>{error ? <div className="form-error">{error}</div> : null}{busy && !Object.keys(data).length ? <div className="empty-state">กำลังโหลด…</div> : <AdminPanel tab={tab} data={data} token={token} reload={load} />}</main></div>;
}

function AdminPanel({ tab, data, token, reload }: { tab: Tab; data: Row; token: string; reload: () => void }) {
  if (tab === "dashboard") {
    const counts = (data.counts ?? {}) as Row;
    return <><div className="admin-metrics"><article><span>ออเดอร์ทั้งหมด</span><strong>{String(counts.orders ?? 0)}</strong></article><article><span>สินค้า</span><strong>{String(counts.products ?? 0)}</strong></article><article><span>รอตรวจสอบ</span><strong>{String(counts.needsReview ?? 0)}</strong></article></div><div className="notice"><Icon name="shield" />หลังบ้านนี้ใช้บัญชีผู้ดูแลหลักเพียงบัญชีเดียว</div></>;
  }
  if (tab === "products") return <div className="admin-stack"><CreateProduct token={token} reload={reload} />{((data.products ?? []) as Row[]).map((product) => <ProductEditor key={String(product.id)} token={token} product={product} reload={reload} />)}</div>;
  if (tab === "orders") return <div className="admin-stack">{((data.orders ?? []) as Row[]).map((order) => <OrderAdmin key={String(order.id)} order={order} token={token} reload={reload} />)}</div>;
  if (tab === "accounts") return <AccountsAdmin accounts={(data.accounts ?? []) as Row[]} token={token} reload={reload} />;
  return <div className="audit-list">{((data.logs ?? []) as Row[]).map((log) => <article key={String(log.id)}><strong>{String(log.action)}</strong><span>{String(log.entity_type)} · {String(log.entity_id ?? "-")}</span><time>{new Date(String(log.created_at)).toLocaleString("th-TH")}</time></article>)}</div>;
}

function CreateProduct({ token, reload }: { token: string; reload: () => void }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await adminRequest(token, "product", { method: "POST", body: JSON.stringify({ slug: form.get("slug"), name: form.get("name"), category: form.get("category"), priceSatang: Math.round(Number(form.get("price")) * 100) }) }); setMessage("เพิ่มสินค้าแล้ว"); setOpen(false); reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "เพิ่มไม่สำเร็จ"); } }
  return <div className="admin-create"><button className="button button-gold" onClick={() => setOpen(!open)}>{open ? "ปิดแบบฟอร์ม" : "+ เพิ่มสินค้า"}</button>{open ? <form className="admin-inline-form" onSubmit={submit}><input name="name" required placeholder="ชื่อสินค้า" /><input name="slug" required pattern="[a-z0-9][a-z0-9-]{2,100}" placeholder="url-slug" /><select name="category"><option value="other">อื่น ๆ</option><option value="wallets">กระเป๋า</option><option value="charms">เครื่องราง</option><option value="sacred">ของมงคล</option><option value="lifestyle">ไลฟ์สไตล์</option></select><input name="price" type="number" min="0" step="0.01" required placeholder="ราคา" /><button className="button button-ghost">สร้างสินค้า</button></form> : null}<span>{message}</span></div>;
}

const nextStatuses: Record<string, string[]> = { pending_payment: ["cancelled"], verification_failed: ["cancelled"], needs_review: ["paid", "cancelled", "refunded"], paid: ["packing", "refunded"], packing: ["shipped", "refunded"], shipped: ["completed", "refunded"], completed: ["refunded"] };
function OrderAdmin({ order, token, reload }: { order: Row; token: string; reload: () => void }) {
  const [status, setStatus] = useState(""); const items = (order.order_items ?? []) as Row[];
  async function save() { if (!status) return; try { await adminRequest(token, "order", { method: "PATCH", body: JSON.stringify({ id: order.id, status }) }); reload(); } catch (error) { window.alert(error instanceof Error ? error.message : "เปลี่ยนสถานะไม่สำเร็จ"); } }
  return <article className="admin-order"><header><div><small>{new Date(String(order.created_at)).toLocaleString("th-TH")}</small><h3>{String(order.order_number)}</h3></div><em className={`status-pill ${String(order.status)}`}>{String(order.status)}</em></header><p>{String(order.full_name)} · {String(order.phone)}<br />{String(order.address)} {String(order.province)} {String(order.postal_code)}</p><div className="order-item-mini">{items.map((item) => <span key={String(item.id)}>{String(item.product_name)} × {String(item.quantity)}</span>)}</div><strong>{formatPrice(Number(order.total_satang) / 100)}</strong>{nextStatuses[String(order.status)]?.length ? <div className="admin-actions"><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">เลือกสถานะถัดไป</option>{nextStatuses[String(order.status)].map((next) => <option key={next}>{next}</option>)}</select><button className="button button-ghost" onClick={save}>อัปเดต</button></div> : null}</article>;
}

function AccountsAdmin({ accounts, token, reload }: { accounts: Row[]; token: string; reload: () => void }) {
  const [message, setMessage] = useState("");
  async function create(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await adminRequest(token, "account", { method: "POST", body: JSON.stringify({ bankCode: form.get("bankCode"), bankName: form.get("bankName"), accountHolder: form.get("accountHolder"), accountNumber: form.get("accountNumber") }) }); setMessage("เพิ่มบัญชีรอยืนยันแล้ว"); reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "เพิ่มไม่สำเร็จ"); } }
  async function validate(event: React.FormEvent<HTMLFormElement>, id: string) { event.preventDefault(); const body = new FormData(event.currentTarget); body.set("accountId", id); try { await adminRequest(token, "validate-account", { method: "POST", body }); setMessage("ยืนยันและเปิดใช้บัญชีใหม่แล้ว"); reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "ยืนยันไม่สำเร็จ"); } }
  return <div className="admin-stack"><form className="admin-inline-form" onSubmit={create}><strong>เพิ่มบัญชีรับเงิน</strong><input name="bankCode" defaultValue="004" required placeholder="รหัสธนาคาร" /><input name="bankName" defaultValue="ธนาคารกสิกรไทย" required placeholder="ธนาคาร" /><input name="accountHolder" required placeholder="ชื่อบัญชี" /><input name="accountNumber" required inputMode="numeric" pattern="[0-9]{9,15}" placeholder="เลขบัญชี" /><button className="button button-gold">บันทึกเป็นรอยืนยัน</button></form><span>{message}</span>{accounts.map((account) => <article className="admin-account" key={String(account.id)}><header><div><h3>{String(account.bank_name)}</h3><span>{String(account.account_holder)} · {String(account.account_number)}</span></div><em className={`status-pill ${String(account.status)}`}>{String(account.status)}</em></header>{account.status === "pending_validation" ? <form className="admin-inline-form" onSubmit={(event) => validate(event, String(account.id))}><span>ลงทะเบียนบัญชีนี้ใน EasySlip แล้วอัปโหลดสลิปทดสอบจริง</span><input name="amountSatang" type="number" min="1" required placeholder="ยอดทดสอบ (สตางค์)" /><input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /><button className="button button-ghost">ยืนยันและเปิดใช้</button></form> : null}</article>)}</div>;
}

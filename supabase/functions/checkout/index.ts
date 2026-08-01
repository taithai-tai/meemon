import { corsHeaders, json, publicError, requestIp, requireAllowedOrigin, sha256 } from "../_shared/http.ts";
import { env, serviceClient } from "../_shared/server.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";
import { checkSlip } from "../_shared/easyslip.ts";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function route(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("action") ?? "catalog";
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function normalizeThaiPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return /^0[689]\d{8}$/.test(digits) ? digits : "";
}

async function rateLimit(request: Request, bucket: string, limit: number, seconds: number) {
  const subject = await sha256(`${env("RATE_LIMIT_SALT")}:${requestIp(request)}`);
  const { data, error } = await serviceClient().rpc("consume_rate_limit_v1", {
    p_bucket: bucket,
    p_subject_hash: subject,
    p_limit: limit,
    p_window_seconds: seconds,
  });
  if (error) throw error;
  return data === true;
}

async function catalog(request: Request) {
  const client = serviceClient();
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  let query = client.from("products").select(`
    id, slug, name, description, category, status, base_price_satang,
    price_min_satang, price_max_satang, track_inventory, sold_count,
    product_images(image_url, position),
    product_option_groups(id, name, position, product_options(id, name, disabled, position)),
    product_skus(id, selection_key, option_ids, label, price_satang, active, stock_quantity, reserved_quantity)
  `).neq("status", "inactive").order("name");
  if (productId) query = query.eq("id", productId);
  const { data, error } = await query;
  if (error) throw error;
  return json(request, { products: data ?? [] });
}

async function createOrder(request: Request) {
  if (!await rateLimit(request, "create-order", 10, 900)) {
    return publicError(request, "ลองใหม่อีกครั้งในภายหลัง", 429, "RATE_LIMITED");
  }
  const body = await request.json() as {
    customer?: Record<string, string>;
    items?: Array<{ productId: string; quantity: number; selectionKey: string; selections?: Record<string, string> }>;
    turnstileToken?: string;
  };
  if (!await verifyTurnstile(body.turnstileToken ?? "", requestIp(request))) {
    return publicError(request, "กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ", 403, "TURNSTILE_FAILED");
  }
  const phone = normalizeThaiPhone(body.customer?.phone ?? "");
  if (!phone) return publicError(request, "กรุณากรอกเบอร์โทรศัพท์มือถือไทยให้ถูกต้อง", 400, "INVALID_PHONE");
  const customer = { ...(body.customer ?? {}), phone, countryCode: "TH" };
  const token = randomToken();
  const tokenHash = await sha256(token);
  const { data, error } = await serviceClient().rpc("create_order_v1", {
    p_public_token_hash: tokenHash,
    p_customer: customer,
    p_items: body.items ?? [],
  });
  if (error) {
    const code = error.message.match(/(PAYMENT_ACCOUNT_NOT_READY|INVALID_CART|INVALID_CUSTOMER|INVALID_QUANTITY|PRODUCT_UNAVAILABLE|SKU_UNAVAILABLE|OUT_OF_STOCK)/)?.[1] ?? "ORDER_FAILED";
    const messages: Record<string, string> = {
      PAYMENT_ACCOUNT_NOT_READY: "ระบบรับชำระเงินยังไม่พร้อมใช้งาน",
      INVALID_CART: "ตะกร้าไม่ถูกต้อง",
      INVALID_CUSTOMER: "กรุณาตรวจสอบข้อมูลจัดส่ง",
      INVALID_QUANTITY: "จำนวนสินค้าไม่ถูกต้อง",
      PRODUCT_UNAVAILABLE: "มีสินค้าที่ปิดขายแล้ว กรุณาตรวจสอบตะกร้า",
      SKU_UNAVAILABLE: "ตัวเลือกสินค้านี้ยังไม่มีราคาหรือปิดขายแล้ว",
      OUT_OF_STOCK: "สินค้าไม่เพียงพอ",
    };
    return publicError(request, messages[code] ?? "สร้างคำสั่งซื้อไม่สำเร็จ", 400, code);
  }
  return json(request, { ...data, token }, 201);
}

async function recoverOrder(request: Request) {
  if (!await rateLimit(request, "recover-order", 5, 900)) {
    return publicError(request, "ค้นหาออเดอร์บ่อยเกินไป กรุณารอ 15 นาที", 429, "RATE_LIMITED");
  }
  const body = await request.json() as { orderNumber?: string; phone?: string; turnstileToken?: string };
  if (!await verifyTurnstile(body.turnstileToken ?? "", requestIp(request))) {
    return publicError(request, "กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ", 403, "TURNSTILE_FAILED");
  }
  const phone = normalizeThaiPhone(body.phone ?? "");
  const orderNumber = (body.orderNumber ?? "").trim().toUpperCase();
  if (!phone || !/^MM\d{8}-\d{6}$/.test(orderNumber)) {
    return publicError(request, "ไม่พบออเดอร์จากข้อมูลที่ระบุ", 404, "ORDER_NOT_FOUND");
  }

  const token = randomToken();
  const tokenHash = await sha256(token);
  const client = serviceClient();
  const { error: recoveryError } = await client.rpc("recover_order_access_v1", {
    p_order_number: orderNumber,
    p_phone: phone,
    p_new_token_hash: tokenHash,
  });
  if (recoveryError) {
    return publicError(request, "ไม่พบออเดอร์จากข้อมูลที่ระบุ", 404, "ORDER_NOT_FOUND");
  }
  const { data: order, error } = await client.rpc("get_public_order_v1", { p_public_token_hash: tokenHash });
  if (error || !order) return publicError(request, "ไม่พบออเดอร์จากข้อมูลที่ระบุ", 404, "ORDER_NOT_FOUND");
  return json(request, { order, token });
}

async function lookupOrdersByPhone(request: Request) {
  if (!await rateLimit(request, "orders-by-phone", 10, 900)) {
    return publicError(request, "ค้นหาออเดอร์บ่อยเกินไป กรุณารอ 15 นาที", 429, "RATE_LIMITED");
  }
  const body = await request.json() as { phone?: string; turnstileToken?: string };
  if (!await verifyTurnstile(body.turnstileToken ?? "", requestIp(request))) {
    return publicError(request, "กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ", 403, "TURNSTILE_FAILED");
  }
  const phone = normalizeThaiPhone(body.phone ?? "");
  if (!phone) return publicError(request, "กรุณากรอกเบอร์โทรศัพท์มือถือไทยให้ถูกต้อง", 400, "INVALID_PHONE");
  const { data, error } = await serviceClient().rpc("lookup_orders_by_phone_v1", { p_phone: phone });
  if (error) throw error;
  return json(request, { orders: Array.isArray(data) ? data : [] });
}

async function getOrder(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (token.length < 32) return publicError(request, "ไม่พบคำสั่งซื้อ", 404, "ORDER_NOT_FOUND");
  const { data, error } = await serviceClient().rpc("get_public_order_v1", {
    p_public_token_hash: await sha256(token),
  });
  if (error || !data) return publicError(request, "ไม่พบคำสั่งซื้อ", 404, "ORDER_NOT_FOUND");
  return json(request, { order: data });
}

async function uploadSlip(request: Request) {
  if (!await rateLimit(request, "upload-slip", 20, 900)) {
    return publicError(request, "อัปโหลดบ่อยเกินไป กรุณารอสักครู่", 429, "RATE_LIMITED");
  }
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const turnstileToken = String(form.get("turnstileToken") ?? "");
  const file = form.get("file");
  if (!await verifyTurnstile(turnstileToken, requestIp(request))) {
    return publicError(request, "กรุณายืนยันว่าคุณไม่ใช่ระบบอัตโนมัติ", 403, "TURNSTILE_FAILED");
  }
  if (!(file instanceof File) || !IMAGE_TYPES.has(file.type) || file.size > 4 * 1024 * 1024) {
    return publicError(request, "รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 4 MB", 400, "INVALID_FILE");
  }

  const client = serviceClient();
  const tokenHash = await sha256(token);
  const { data: publicOrder } = await client.rpc("get_public_order_v1", { p_public_token_hash: tokenHash });
  const { data: order } = publicOrder?.orderId
    ? await client.from("orders").select("id,status,total_satang,expires_at,payment_account_snapshot").eq("id", publicOrder.orderId).maybeSingle()
    : { data: null };
  if (!order) return publicError(request, "ไม่พบคำสั่งซื้อ", 404, "ORDER_NOT_FOUND");
  if (!["pending_payment", "verification_failed", "needs_review", "expired"].includes(order.status)) {
    return publicError(request, "คำสั่งซื้อนี้ไม่สามารถส่งสลิปเพิ่มได้", 409, "ORDER_NOT_PAYABLE");
  }
  const { count } = await client.from("slip_attempts").select("id", { count: "exact", head: true }).eq("order_id", order.id);
  if (order.status === "needs_review") {
    const { count: paymentCount } = await client.from("payments").select("id", { count: "exact", head: true }).eq("order_id", order.id);
    if ((paymentCount ?? 0) > 0) return publicError(request, "สลิปได้รับการยืนยันแล้วและกำลังรอร้านค้าตรวจสอบ", 409, "NEEDS_REVIEW");
  }
  const attemptNumber = (count ?? 0) + 1;
  if (attemptNumber > 5) return publicError(request, "อัปโหลดสลิปครบ 5 ครั้งแล้ว กรุณาติดต่อร้านค้า", 409, "ATTEMPT_LIMIT");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const objectPath = `${order.id}/${crypto.randomUUID()}.${extension}`;
  const { data: attempt, error: attemptError } = await client.from("slip_attempts").insert({
    order_id: order.id,
    attempt_number: attemptNumber,
    object_path: objectPath,
    status: "verifying",
  }).select("id").single();
  if (attemptError) throw attemptError;
  await client.from("orders").update({ status: "verifying" }).eq("id", order.id);
  const { error: uploadError } = await client.storage.from("slips").upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    await client.from("slip_attempts").update({ status: "provider_error", provider_message: "storage upload failed" }).eq("id", attempt.id);
    await client.from("orders").update({ status: "verification_failed" }).eq("id", order.id);
    throw uploadError;
  }

  let result;
  try {
    const receiver = order.payment_account_snapshot as {
      bank_code?: string;
      account_number?: string;
      bankCode?: string;
      accountNumber?: string;
    };
    result = await checkSlip(file, order.total_satang, {
      bankCode: String(receiver.bank_code ?? receiver.bankCode ?? ""),
      accountNumber: String(receiver.account_number ?? receiver.accountNumber ?? ""),
    });
  } catch {
    await client.from("slip_attempts").update({ status: "provider_error", provider_message: "EasySlip unavailable" }).eq("id", attempt.id);
    await client.from("orders").update({ status: "verification_failed" }).eq("id", order.id);
    return publicError(request, "ระบบตรวจสลิปขัดข้อง กรุณาลองใหม่ภายหลัง", 503, "PROVIDER_UNAVAILABLE");
  }

  if (result.ok && result.transRef) {
    const transactionAt = result.transactionAt && !Number.isNaN(Date.parse(result.transactionAt))
      ? result.transactionAt : new Date().toISOString();
    const { data: status, error } = await client.rpc("finalize_payment_v1", {
      p_order_id: order.id,
      p_slip_attempt_id: attempt.id,
      p_trans_ref: result.transRef,
      p_amount_satang: result.amountSatang ?? order.total_satang,
      p_receiver_name: result.receiverName ?? null,
      p_receiving_bank: result.receivingBank ?? null,
      p_transaction_at: transactionAt,
    });
    if (error) {
      const duplicate = error.message.includes("duplicate key") || error.message.includes("payments_provider_trans_ref_key");
      await client.from("slip_attempts").update({
        status: duplicate ? "rejected" : "needs_review",
        provider_code: result.code,
        provider_message: duplicate ? "duplicate slip" : "verification requires review",
        provider_response: result.sanitized,
        trans_ref: result.transRef,
      }).eq("id", attempt.id);
      await client.from("orders").update({ status: duplicate ? "verification_failed" : "needs_review" }).eq("id", order.id);
      return publicError(request, duplicate ? "สลิปนี้ถูกใช้กับคำสั่งซื้ออื่นแล้ว" : "ร้านค้าต้องตรวจสอบสลิปนี้เพิ่มเติม", 409, duplicate ? "DUPLICATE_SLIP" : "NEEDS_REVIEW");
    }
    await client.from("slip_attempts").update({ status: status === "paid" ? "verified" : "needs_review", provider_code: result.code, provider_message: result.message, provider_response: result.sanitized, trans_ref: result.transRef }).eq("id", attempt.id);
    return json(request, { status, orderNumber: null });
  }

  const delayed = result.code === 1010;
  const review = result.code === 1013 || result.code === 1014;
  const providerUnavailable = result.code === 1503;
  const attemptStatus = delayed ? "delayed" : review ? "needs_review" : providerUnavailable ? "provider_error" : "rejected";
  const orderStatus = review ? "needs_review" : delayed ? "verifying" : "verification_failed";
  await client.from("slip_attempts").update({
    status: attemptStatus,
    provider_code: result.code,
    provider_message: result.message,
    provider_response: result.sanitized,
    trans_ref: result.transRef ?? null,
    next_retry_at: delayed ? new Date(Date.now() + (result.retryAfterSeconds ?? 60) * 1000).toISOString() : null,
  }).eq("id", attempt.id);
  await client.from("orders").update({ status: orderStatus }).eq("id", order.id);
  const code = result.code === 1012 ? "DUPLICATE_SLIP" : review ? "NEEDS_REVIEW" : delayed ? "VERIFYING_DELAYED" : providerUnavailable ? "PROVIDER_UNAVAILABLE" : "SLIP_REJECTED";
  const message = result.code === 1012 ? "สลิปนี้เคยถูกใช้แล้ว" : review ? "ยอดหรือผู้รับต้องให้ร้านค้าตรวจสอบเพิ่มเติม" : delayed ? "ธนาคารกำลังประมวลผล ระบบจะตรวจสอบอีกครั้ง" : providerUnavailable ? "ระบบตรวจสลิปยังไม่พร้อม กรุณาลองใหม่ภายหลัง" : "ตรวจสลิปไม่ผ่าน กรุณาตรวจสอบภาพและลองใหม่";
  return publicError(request, message, delayed ? 202 : providerUnavailable ? 503 : 409, code);
}

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (!requireAllowedOrigin(request)) return publicError(request, "ต้นทางไม่ได้รับอนุญาต", 403, "ORIGIN_DENIED");
    try {
      const action = route(request);
      if (request.method === "GET" && action === "catalog") return await catalog(request);
      if (request.method === "GET" && action === "order") return await getOrder(request);
      if (request.method === "POST" && action === "order") return await createOrder(request);
      if (request.method === "POST" && action === "orders-by-phone") return await lookupOrdersByPhone(request);
      if (request.method === "POST" && action === "recover-order") return await recoverOrder(request);
      if (request.method === "POST" && action === "slip") return await uploadSlip(request);
      return publicError(request, "ไม่พบ API", 404, "NOT_FOUND");
    } catch (error) {
      console.error("checkout function failed", error instanceof Error ? error.message : "unknown");
      return publicError(request, "ระบบขัดข้องชั่วคราว", 500, "INTERNAL_ERROR");
    }
  },
};

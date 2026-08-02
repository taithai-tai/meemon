import { corsHeaders, json, publicError, requireAllowedOrigin } from "../_shared/http.ts";
import { serviceClient } from "../_shared/server.ts";
import { checkSlip } from "../_shared/easyslip.ts";

const SLIP_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function authenticate(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const jwt = authorization.replace(/^Bearer\s+/i, "");
  if (!jwt) return null;
  const client = serviceClient();
  const { data: { user }, error } = await client.auth.getUser(jwt);
  if (error || !user) return null;
  const { data: profile } = await client.from("admin_profiles")
    .select("user_id,username,active")
    .eq("user_id", user.id).eq("active", true).maybeSingle();
  return profile ? { user, profile, client } : null;
}

async function audit(client: ReturnType<typeof serviceClient>, actorId: string, action: string, entityType: string, entityId: string | null, beforeData?: unknown, afterData?: unknown) {
  const { error } = await client.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before_data: beforeData ?? null,
    after_data: afterData ?? null,
  });
  if (error) throw error;
}

async function list(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const action = new URL(request.url).searchParams.get("action") ?? "dashboard";
  const client = auth.client;
  if (action === "dashboard") {
    const [orders, products, review] = await Promise.all([
      client.from("orders").select("id", { count: "exact", head: true }).is("deleted_at", null),
      client.from("products").select("id", { count: "exact", head: true }),
      client.from("orders").select("id", { count: "exact", head: true }).eq("status", "needs_review").is("deleted_at", null),
    ]);
    return json(request, { profile: auth.profile, counts: { orders: orders.count ?? 0, products: products.count ?? 0, needsReview: review.count ?? 0 } });
  }
  if (action === "products") {
    const { data, error } = await client.from("products").select("*, product_skus(*)").order("name");
    if (error) throw error;
    return json(request, { products: data ?? [] });
  }
  if (action === "orders") {
    const { data, error } = await client.from("orders")
      .select("*, order_items(*), payments(*), slip_attempts(id,attempt_number,object_path,status,provider_code,provider_message,trans_ref,created_at)")
      .is("deleted_at", null).order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return json(request, { orders: data ?? [] });
  }
  if (action === "admins") {
    const { data, error } = await client.from("admin_profiles")
      .select("user_id,username,active,created_at,updated_at").order("created_at");
    if (error) throw error;
    return json(request, { profile: auth.profile, admins: data ?? [] });
  }
  if (action === "accounts") {
    const { data, error } = await client.from("payment_accounts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return json(request, { accounts: data ?? [] });
  }
  if (action === "audit") {
    const { data, error } = await client.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) throw error;
    return json(request, { logs: data ?? [] });
  }
  return publicError(request, "ไม่พบข้อมูล", 404, "NOT_FOUND");
}

async function updateProduct(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json() as {
    id?: string;
    product?: Record<string, unknown>;
    skus?: Array<{ id: string; price_satang?: number | null; active?: boolean; stock_quantity?: number | null }>;
  };
  if (!body.id) return publicError(request, "ไม่พบสินค้า", 400);
  const client = auth.client;
  const { data: before } = await client.from("products").select("*, product_skus(*)").eq("id", body.id).single();
  if (!before) return publicError(request, "ไม่พบสินค้า", 404);
  const permitted = ["name", "description", "category", "status", "base_price_satang", "price_min_satang", "price_max_satang", "track_inventory"];
  const updates = Object.fromEntries(Object.entries(body.product ?? {}).filter(([key]) => permitted.includes(key)));
  if (Object.keys(updates).length) {
    const { error } = await client.from("products").update(updates).eq("id", body.id);
    if (error) throw error;
  }
  for (const sku of body.skus ?? []) {
    const patch: Record<string, unknown> = {};
    if ("price_satang" in sku) patch.price_satang = sku.price_satang;
    if ("active" in sku) patch.active = sku.active;
    if ("stock_quantity" in sku) patch.stock_quantity = sku.stock_quantity;
    const { error } = await client.from("product_skus").update(patch).eq("id", sku.id).eq("product_id", body.id);
    if (error) throw error;
  }
  const { data: after, error } = await client.from("products").select("*, product_skus(*)").eq("id", body.id).single();
  if (error) throw error;
  const allPriced = (after.product_skus as Array<{ active: boolean; price_satang: number | null }>).filter((sku) => sku.active).every((sku) => sku.price_satang !== null);
  if (after.status === "needs_pricing" && allPriced) await client.from("products").update({ status: "active" }).eq("id", body.id);
  if (after.status === "active" && !allPriced) await client.from("products").update({ status: "needs_pricing" }).eq("id", body.id);
  const { data: finalProduct } = await client.from("products").select("*, product_skus(*)").eq("id", body.id).single();
  await audit(client, auth.user.id, "product.update", "product", body.id, before, finalProduct);
  return json(request, { product: finalProduct });
}

async function createProduct(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json() as { id?: string; slug?: string; name?: string; description?: string; category?: string; priceSatang?: number };
  const id = (body.id ?? crypto.randomUUID()).trim();
  const slug = (body.slug ?? "").trim().toLowerCase();
  const price = Number(body.priceSatang ?? 0);
  if (!id || !/^[a-z0-9][a-z0-9-]{2,100}$/.test(slug) || !(body.name ?? "").trim() || !Number.isInteger(price) || price < 0) {
    return publicError(request, "กรุณาตรวจสอบรหัส URL ชื่อ และราคา", 400);
  }
  const product = {
    id, slug, name: body.name!.trim(), description: body.description ?? "", category: body.category ?? "other",
    status: "active", base_price_satang: price, price_min_satang: price, price_max_satang: price,
    track_inventory: false, sold_count: 0, source_url: null,
  };
  const { data, error } = await auth.client.from("products").insert(product).select("*").single();
  if (error) return publicError(request, "รหัสสินค้าหรือ URL นี้มีอยู่แล้ว", 409);
  const { error: skuError } = await auth.client.from("product_skus").insert({
    product_id: id, selection_key: "", option_ids: [], label: "แบบมาตรฐาน", price_satang: price, active: true,
  });
  if (skuError) throw skuError;
  await audit(auth.client, auth.user.id, "product.create", "product", id, null, data);
  return json(request, { product: data }, 201);
}

async function uploadProductImage(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const form = await request.formData();
  const productId = String(form.get("productId") ?? "");
  const file = form.get("file");
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
    return publicError(request, "รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB", 400);
  }
  const { data: product } = await auth.client.from("products").select("id").eq("id", productId).maybeSingle();
  if (!product) return publicError(request, "ไม่พบสินค้า", 404);
  const { data: last } = await auth.client.from("product_images").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1).maybeSingle();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await auth.client.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;
  const { data: publicUrl } = auth.client.storage.from("product-images").getPublicUrl(path);
  const image = { product_id: productId, image_url: publicUrl.publicUrl, position: (last?.position ?? -1) + 1 };
  const { data, error } = await auth.client.from("product_images").insert(image).select("*").single();
  if (error) throw error;
  await audit(auth.client, auth.user.id, "product.image.add", "product", productId, null, data);
  return json(request, { image: data }, 201);
}

async function updateOrder(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !body.status) return publicError(request, "ข้อมูลไม่ครบ", 400);
  const client = auth.client;
  const { data: before } = await client.from("orders").select("*").eq("id", body.id).is("deleted_at", null).single();
  if (!before) return publicError(request, "ไม่พบออเดอร์", 404);
  if (["packing", "shipped"].includes(body.status)) {
    if (!["paid", "packing", "shipped"].includes(before.status)) {
      return publicError(request, "ต้องยืนยันการชำระเงินก่อนเปลี่ยนเป็นสถานะจัดเตรียมสินค้า", 409, "PAYMENT_REQUIRED");
    }
    const { data: after, error } = await client.from("orders").update({ status: body.status }).eq("id", body.id).is("deleted_at", null).select("*").single();
    if (error) throw error;
    await audit(client, auth.user.id, "order.fulfillment_status", "order", body.id, before, after);
    return json(request, { order: after });
  }
  const transitions: Record<string, string[]> = {
    pending_payment: ["cancelled"],
    verification_failed: ["cancelled"],
    needs_review: ["paid", "cancelled", "refunded"],
    paid: ["packing", "refunded"],
    packing: ["shipped", "refunded"],
    shipped: ["completed", "refunded"],
    completed: ["refunded"],
  };
  if (!transitions[before.status]?.includes(body.status)) return publicError(request, "ไม่อนุญาตให้เปลี่ยนสถานะตามลำดับนี้", 409, "INVALID_TRANSITION");
  if (before.status === "needs_review" && body.status === "paid") {
    const { error } = await client.rpc("approve_review_payment_v1", { p_order_id: body.id });
    if (error) return publicError(request, "ต้องมีผลตรวจชำระเงินที่ยืนยันแล้วก่อนอนุมัติ", 409, "PAYMENT_REQUIRED");
  } else {
    if (["pending_payment", "verification_failed"].includes(before.status) && body.status === "cancelled") {
      await client.rpc("release_order_stock_v1", { p_order_id: body.id });
    }
    const { error } = await client.from("orders").update({ status: body.status }).eq("id", body.id);
    if (error) throw error;
  }
  const { data: after } = await client.from("orders").select("*").eq("id", body.id).single();
  await audit(client, auth.user.id, "order.status", "order", body.id, before, after);
  return json(request, { order: after });
}

async function deleteOrder(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json().catch(() => ({})) as { id?: string };
  if (!body.id) return publicError(request, "ไม่พบออเดอร์", 400);
  const client = auth.client;
  const { data: before } = await client.from("orders").select("*").eq("id", body.id).is("deleted_at", null).maybeSingle();
  if (!before) return publicError(request, "ไม่พบออเดอร์", 404);
  if (["pending_payment", "verification_failed", "expired", "cancelled"].includes(before.status)) {
    await client.rpc("release_order_stock_v1", { p_order_id: body.id });
  }
  const { data: after, error } = await client.from("orders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", body.id).is("deleted_at", null).select("*").single();
  if (error) throw error;
  await audit(client, auth.user.id, "order.delete", "order", body.id, before, after);
  return json(request, { deleted: true, orderId: body.id });
}

async function createSlipUrl(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json().catch(() => ({})) as { attemptId?: string };
  if (!body.attemptId) return publicError(request, "ไม่พบสลิป", 400);
  const client = auth.client;
  const { data: attempt } = await client.from("slip_attempts")
    .select("id,order_id,object_path").eq("id", body.attemptId).maybeSingle();
  if (!attempt) return publicError(request, "ไม่พบสลิป", 404, "SLIP_NOT_FOUND");
  const { data: order } = await client.from("orders")
    .select("id").eq("id", attempt.order_id).is("deleted_at", null).maybeSingle();
  if (!order) return publicError(request, "ไม่พบออเดอร์", 404, "ORDER_NOT_FOUND");
  if (!attempt.object_path) return publicError(request, "ไฟล์สลิปหมดระยะเวลาจัดเก็บแล้ว", 410, "SLIP_FILE_EXPIRED");
  const { data, error } = await client.storage.from("slips").createSignedUrl(attempt.object_path, 5 * 60);
  if (error || !data?.signedUrl) return publicError(request, "เปิดไฟล์สลิปไม่สำเร็จ", 404, "SLIP_FILE_NOT_FOUND");
  await audit(client, auth.user.id, "order.slip.view", "order", attempt.order_id, null, { attemptId: attempt.id });
  return json(request, { url: data.signedUrl, expiresIn: 300 });
}

async function uploadOrderSlip(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const form = await request.formData();
  const orderId = String(form.get("orderId") ?? "");
  const file = form.get("file");
  if (!(file instanceof File) || !SLIP_IMAGE_TYPES.has(file.type) || file.size > 4 * 1024 * 1024) {
    return publicError(request, "รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 4 MB", 400, "INVALID_FILE");
  }
  const client = auth.client;
  const { data: order } = await client.from("orders")
    .select("id,order_number,status,total_satang,payment_account_snapshot")
    .eq("id", orderId).is("deleted_at", null).maybeSingle();
  if (!order) return publicError(request, "ไม่พบออเดอร์", 404, "ORDER_NOT_FOUND");
  if (!["pending_payment", "verification_failed", "needs_review", "expired"].includes(order.status)) {
    return publicError(request, "ออเดอร์นี้ยืนยันการชำระเงินแล้ว จึงไม่ต้องอัปโหลดสลิปเพิ่ม", 409, "ORDER_NOT_PAYABLE");
  }
  const { count } = await client.from("slip_attempts").select("id", { count: "exact", head: true }).eq("order_id", order.id);
  const attemptNumber = (count ?? 0) + 1;
  if (attemptNumber > 5) return publicError(request, "ออเดอร์นี้อัปโหลดสลิปครบ 5 ครั้งแล้ว", 409, "ATTEMPT_LIMIT");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const objectPath = `${order.id}/${crypto.randomUUID()}.${extension}`;
  const { data: attempt, error: attemptError } = await client.from("slip_attempts").insert({
    order_id: order.id, attempt_number: attemptNumber, object_path: objectPath, status: "verifying",
  }).select("id").single();
  if (attemptError) throw attemptError;
  const { error: uploadError } = await client.storage.from("slips").upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    await client.from("slip_attempts").update({ status: "provider_error", provider_message: "storage upload failed" }).eq("id", attempt.id);
    throw uploadError;
  }
  await client.from("orders").update({ status: "verifying" }).eq("id", order.id);

  let result;
  try {
    const receiver = order.payment_account_snapshot as {
      bank_code?: string; account_number?: string; bankCode?: string; accountNumber?: string;
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

  let orderStatus = "verification_failed";
  let attemptStatus = "rejected";
  let message = "ตรวจสลิปไม่ผ่าน กรุณาตรวจสอบภาพและข้อมูลการโอน";
  if (result.ok && result.transRef) {
    const transactionAt = result.transactionAt && !Number.isNaN(Date.parse(result.transactionAt))
      ? result.transactionAt : new Date().toISOString();
    const { data: finalizedStatus, error } = await client.rpc("finalize_payment_v1", {
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
      orderStatus = duplicate ? "verification_failed" : "needs_review";
      attemptStatus = duplicate ? "rejected" : "needs_review";
      message = duplicate ? "สลิปนี้ถูกใช้กับออเดอร์อื่นแล้ว" : "พบสลิป แต่ต้องตรวจสอบเพิ่มเติม";
    } else {
      orderStatus = String(finalizedStatus ?? "paid");
      attemptStatus = orderStatus === "paid" ? "verified" : "needs_review";
      message = orderStatus === "paid" ? "ตรวจสอบสลิปสำเร็จและยืนยันยอดเงินแล้ว" : "ตรวจพบรายการโอนจริงและรอร้านตรวจสอบ";
    }
  } else if (result.code === 1010) {
    orderStatus = "verifying";
    attemptStatus = "delayed";
    message = "ธนาคารกำลังประมวลผลสลิป ระบบจะตรวจซ้ำภายหลัง";
  } else if (result.code === 1013 || result.code === 1014) {
    orderStatus = "needs_review";
    attemptStatus = "needs_review";
    message = "ยอดหรือผู้รับต้องให้ร้านค้าตรวจสอบเพิ่มเติม";
  } else if (result.code === 1503) {
    orderStatus = "verification_failed";
    attemptStatus = "provider_error";
    message = "ผู้ให้บริการตรวจสลิปยังไม่พร้อม";
  }

  await client.from("slip_attempts").update({
    status: attemptStatus,
    provider_code: result.code,
    provider_message: result.message,
    provider_response: result.sanitized,
    trans_ref: result.transRef ?? null,
    next_retry_at: attemptStatus === "delayed" ? new Date(Date.now() + (result.retryAfterSeconds ?? 60) * 1000).toISOString() : null,
  }).eq("id", attempt.id);
  await client.from("orders").update({ status: orderStatus }).eq("id", order.id);
  await audit(client, auth.user.id, "order.slip.upload", "order", order.id, null, {
    attemptId: attempt.id, status: attemptStatus, providerCode: result.code, transRef: result.transRef ?? null,
  });
  return json(request, { status: orderStatus, verified: attemptStatus === "verified", message });
}

async function createAdminAccount(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json().catch(() => ({})) as { username?: string; password?: string };
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return publicError(request, "Username ต้องยาว 3–40 ตัว และใช้ได้เฉพาะ a-z, 0-9, จุด ขีดกลาง หรือขีดล่าง", 400);
  }
  if (password.length < 6 || password.length > 72) {
    return publicError(request, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", 400);
  }
  const client = auth.client;
  const { data: existing } = await client.from("admin_profiles").select("user_id").eq("username", username).maybeSingle();
  if (existing) return publicError(request, "Username นี้มีอยู่แล้ว", 409, "USERNAME_EXISTS");
  const { data: created, error: createError } = await client.auth.admin.createUser({
    email: `${username}@admin.meemon.net`, password, email_confirm: true, user_metadata: { username },
  });
  if (createError || !created.user) return publicError(request, "สร้างบัญชีไม่สำเร็จ Username นี้อาจมีอยู่แล้ว", 409, "CREATE_ADMIN_FAILED");
  const profile = { user_id: created.user.id, username, active: true, must_rotate_password: false, created_by: auth.user.id };
  const { data, error } = await client.from("admin_profiles").insert(profile)
    .select("user_id,username,active,created_at").single();
  if (error) {
    await client.auth.admin.deleteUser(created.user.id);
    throw error;
  }
  await audit(client, auth.user.id, "admin.create", "admin_profile", created.user.id, null, data);
  return json(request, { admin: data }, 201);
}

async function createAccount(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const body = await request.json() as { bankCode?: string; bankName?: string; accountHolder?: string; accountNumber?: string };
  if (!body.bankCode || !body.bankName || !body.accountHolder || !/^\d{9,15}$/.test(body.accountNumber ?? "")) {
    return publicError(request, "กรุณาตรวจสอบข้อมูลบัญชี", 400);
  }
  const { data, error } = await auth.client.from("payment_accounts").insert({
    bank_code: body.bankCode,
    bank_name: body.bankName,
    account_holder: body.accountHolder,
    account_number: body.accountNumber,
    status: "pending_validation",
    created_by: auth.user.id,
  }).select("*").single();
  if (error) throw error;
  await audit(auth.client, auth.user.id, "payment_account.create", "payment_account", data.id, null, data);
  return json(request, { account: data }, 201);
}

async function validateAccount(request: Request, auth: NonNullable<Awaited<ReturnType<typeof authenticate>>>) {
  const form = await request.formData();
  const accountId = String(form.get("accountId") ?? "");
  const expectedAmountSatang = Number(form.get("amountSatang") ?? 0);
  const file = form.get("file");
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024 || expectedAmountSatang < 1) {
    return publicError(request, "สลิปทดสอบไม่ถูกต้อง", 400);
  }
  const client = auth.client;
  const { data: account } = await client.from("payment_accounts").select("*").eq("id", accountId).eq("status", "pending_validation").single();
  if (!account) return publicError(request, "ไม่พบบัญชีที่รอยืนยัน", 404);
  const result = await checkSlip(file, expectedAmountSatang, {
    bankCode: account.bank_code,
    accountNumber: account.account_number,
  });
  if (!result.ok || !result.transRef) return publicError(request, "EasySlip ยังยืนยันยอดและผู้รับของบัญชีใหม่นี้ไม่สำเร็จ", 409, "VALIDATION_FAILED");
  const { data: before } = await client.from("payment_accounts").select("*").eq("status", "active").maybeSingle();
  const { data: after, error } = await client.rpc("activate_payment_account_v1", { p_account_id: accountId, p_validation_trans_ref: result.transRef });
  if (error?.message.includes("OPEN_ORDERS")) return publicError(request, "ยังมีออเดอร์รอชำระหรือตรวจสอบอยู่ จึงยังสลับบัญชีไม่ได้", 409, "OPEN_ORDERS");
  if (error) throw error;
  await audit(client, auth.user.id, "payment_account.activate", "payment_account", accountId, before, after);
  return json(request, { account: after });
}

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (!requireAllowedOrigin(request)) return publicError(request, "ต้นทางไม่ได้รับอนุญาต", 403, "ORIGIN_DENIED");
    try {
      const auth = await authenticate(request);
      if (!auth) return publicError(request, "กรุณาเข้าสู่ระบบผู้ดูแล", 401, "UNAUTHORIZED");
      const action = new URL(request.url).searchParams.get("action") ?? "dashboard";
      if (request.method === "GET") return await list(request, auth);
      if (request.method === "POST" && action === "product") return await createProduct(request, auth);
      if (request.method === "PATCH" && action === "product") return await updateProduct(request, auth);
      if (request.method === "POST" && action === "product-image") return await uploadProductImage(request, auth);
      if (request.method === "PATCH" && action === "order") return await updateOrder(request, auth);
      if (request.method === "DELETE" && action === "order") return await deleteOrder(request, auth);
      if (request.method === "POST" && action === "order-slip") return await uploadOrderSlip(request, auth);
      if (request.method === "POST" && action === "slip-url") return await createSlipUrl(request, auth);
      if (request.method === "POST" && action === "admin-account") return await createAdminAccount(request, auth);
      if (request.method === "POST" && action === "account") return await createAccount(request, auth);
      if (request.method === "POST" && action === "validate-account") return await validateAccount(request, auth);
      return publicError(request, "ไม่พบ API", 404, "NOT_FOUND");
    } catch (error) {
      console.error("admin function failed", error instanceof Error ? error.message : "unknown");
      return publicError(request, "ระบบหลังบ้านขัดข้อง", 500, "INTERNAL_ERROR");
    }
  },
};

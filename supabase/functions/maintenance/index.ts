import { corsHeaders, json, publicError } from "../_shared/http.ts";
import { env, serviceClient } from "../_shared/server.ts";
import { checkSlip } from "../_shared/easyslip.ts";

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (request.method !== "POST" || request.headers.get("x-maintenance-secret") !== env("MAINTENANCE_SECRET")) {
      return publicError(request, "ไม่ได้รับอนุญาต", 401, "UNAUTHORIZED");
    }
    const client = serviceClient();
    const { data: expired, error: expireError } = await client.rpc("expire_unpaid_orders_v1");
    if (expireError) throw expireError;

    const { data: delayed } = await client.from("slip_attempts")
      .select("id,order_id,object_path,orders(total_satang,payment_account_snapshot)")
      .eq("status", "delayed").lte("next_retry_at", new Date().toISOString()).limit(20);
    let retried = 0;
    for (const attempt of delayed ?? []) {
      if (!attempt.object_path) continue;
      const { data: blob } = await client.storage.from("slips").download(attempt.object_path);
      if (!blob) continue;
      const orderRelation = attempt.orders as unknown as {
        total_satang: number;
        payment_account_snapshot: {
          bank_code?: string;
          account_number?: string;
          bankCode?: string;
          accountNumber?: string;
        };
      } | null;
      if (!orderRelation) continue;
      const file = new File([blob], "slip", { type: blob.type || "image/jpeg" });
      const result = await checkSlip(file, orderRelation.total_satang, {
        bankCode: String(orderRelation.payment_account_snapshot.bank_code ?? orderRelation.payment_account_snapshot.bankCode ?? ""),
        accountNumber: String(orderRelation.payment_account_snapshot.account_number ?? orderRelation.payment_account_snapshot.accountNumber ?? ""),
      });
      retried += 1;
      if (result.ok && result.transRef) {
        const { data: status, error } = await client.rpc("finalize_payment_v1", {
          p_order_id: attempt.order_id,
          p_slip_attempt_id: attempt.id,
          p_trans_ref: result.transRef,
          p_amount_satang: result.amountSatang ?? orderRelation.total_satang,
          p_receiver_name: result.receiverName ?? null,
          p_receiving_bank: result.receivingBank ?? null,
          p_transaction_at: result.transactionAt && !Number.isNaN(Date.parse(result.transactionAt)) ? result.transactionAt : new Date().toISOString(),
        });
        await client.from("slip_attempts").update({ status: error ? "needs_review" : status === "paid" ? "verified" : "needs_review", provider_code: result.code, provider_message: result.message, provider_response: result.sanitized, trans_ref: result.transRef }).eq("id", attempt.id);
      } else if (result.code === 1010) {
        await client.from("slip_attempts").update({
          next_retry_at: new Date(Date.now() + (result.retryAfterSeconds ?? 60) * 1000).toISOString(),
          provider_code: result.code,
          provider_message: result.message,
        }).eq("id", attempt.id);
      } else {
        await client.from("slip_attempts").update({ status: "needs_review", provider_code: result.code, provider_message: result.message, provider_response: result.sanitized }).eq("id", attempt.id);
        await client.from("orders").update({ status: "needs_review" }).eq("id", attempt.order_id);
      }
    }

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldFiles } = await client.from("slip_attempts").select("id,object_path").lt("created_at", cutoff).not("object_path", "is", null).limit(1000);
    const paths = (oldFiles ?? []).flatMap((row) => row.object_path ? [row.object_path] : []);
    if (paths.length) {
      await client.storage.from("slips").remove(paths);
      await client.from("slip_attempts").update({ object_path: null }).in("id", (oldFiles ?? []).map((row) => row.id));
    }
    await client.from("api_rate_limits").delete().lt("window_started_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());
    return json(request, { expiredOrders: expired ?? 0, delayedRetries: retried, deletedSlipFiles: paths.length });
  },
};

import assert from "node:assert/strict";
import test from "node:test";
import { applyExpectedReceiver, maskedAccountMatches, parseEasySlipResponse } from "../../../supabase/functions/_shared/easyslip-parser.ts";

const verifiedSlip = {
  success: true,
  data: {
    isDuplicate: false,
    matchedAccount: {
      bank: { code: "004", shortCode: "KBANK" },
      nameTh: "นาย ดนุพล แสงนคร",
      bankNumber: "079-3-95340-2",
    },
    amountInOrder: 199.5,
    amountInSlip: 199.5,
    isAmountMatched: true,
    rawSlip: {
      transRef: "010092101507665143",
      date: "2026-08-01T10:15:07+07:00",
      amount: { amount: 199.5 },
      receiver: {
        bank: { id: "004", name: "กสิกรไทย", short: "KBANK" },
        account: { name: { th: "นาย ดนุพล แสงนคร" } },
      },
    },
  },
  message: "Bank slip verified successfully",
};

test("parses a verified EasySlip response without losing satang or transaction identity", () => {
  const result = parseEasySlipResponse(verifiedSlip, true, 200, 19950);
  assert.equal(result.ok, true);
  assert.equal(result.code, 200);
  assert.equal(result.transRef, "010092101507665143");
  assert.equal(result.amountSatang, 19950);
  assert.equal(result.receiverAccount, "079-3-95340-2");
  assert.equal(result.receivingBank, "004");
  assert.equal(result.transactionAt, "2026-08-01T10:15:07+07:00");
});

test("rejects a duplicate even when EasySlip decoded the image", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.isDuplicate = true;
  const result = parseEasySlipResponse(raw, true, 200, 19950);
  assert.equal(result.ok, false);
  assert.equal(result.code, 1012);
  assert.equal(result.transRef, "010092101507665143");
});

test("keeps amount and receiver evidence when the amount is wrong", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.amountInSlip = 100;
  raw.data.rawSlip.amount.amount = 100;
  raw.data.isAmountMatched = false;
  const result = parseEasySlipResponse(raw, true, 200, 19950);
  assert.equal(result.ok, false);
  assert.equal(result.code, 1013);
  assert.equal(result.amountSatang, 10000);
  assert.equal(result.receiverName, "นาย ดนุพล แสงนคร");
});

test("marks an unregistered receiver for review", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.matchedAccount = null;
  const result = parseEasySlipResponse(raw, true, 200, 19950);
  assert.equal(result.ok, false);
  assert.equal(result.code, 1014);
});

test("accepts a provider-verified slip when the raw masked receiver matches exactly", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.matchedAccount = null;
  raw.data.rawSlip.receiver.account.bank = { account: "xxx-x-x5340-x" };
  const parsed = parseEasySlipResponse(raw, true, 200, 19950);
  const result = applyExpectedReceiver(parsed, 19950, "004", "0793953402");
  assert.equal(parsed.code, 1014);
  assert.equal(result.ok, true);
  assert.equal(result.code, 200);
  assert.equal(result.sanitized.exactReceiver, true);
});

test("does not accept a masked receiver with a wrong visible digit", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.matchedAccount = null;
  raw.data.rawSlip.receiver.account.bank = { account: "xxx-x-x9340-x" };
  const result = applyExpectedReceiver(parseEasySlipResponse(raw, true, 200, 19950), 19950, "004", "0793953402");
  assert.equal(result.ok, false);
  assert.equal(result.code, 1014);
});

test("does not accept a masked receiver from a different bank", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.matchedAccount = null;
  raw.data.rawSlip.receiver.account.bank = { account: "xxx-x-x5340-x" };
  raw.data.rawSlip.receiver.bank.id = "014";
  const result = applyExpectedReceiver(parseEasySlipResponse(raw, true, 200, 19950), 19950, "004", "0793953402");
  assert.equal(result.ok, false);
  assert.equal(result.code, 1014);
});

test("never promotes a duplicate slip", () => {
  const raw = structuredClone(verifiedSlip);
  raw.data.isDuplicate = true;
  const result = applyExpectedReceiver(parseEasySlipResponse(raw, true, 200, 19950), 19950, "004", "0793953402");
  assert.equal(result.ok, false);
  assert.equal(result.code, 1012);
});

test("retries a provider-reported pending slip after five minutes", () => {
  const result = parseEasySlipResponse({
    success: false,
    error: { code: "SLIP_PENDING", message: "Please retry" },
  }, false, 404, 19950);
  assert.equal(result.ok, false);
  assert.equal(result.code, 1010);
  assert.equal(result.retryAfterSeconds, 300);
});

test("distinguishes a provider configuration failure from an invalid slip", () => {
  const result = parseEasySlipResponse({
    success: false,
    error: { code: "QUOTA_EXCEEDED", message: "Quota exhausted" },
  }, false, 403, 19950);
  assert.equal(result.ok, false);
  assert.equal(result.code, 1503);
  assert.equal(result.retryAfterSeconds, undefined);
});

test("matches EasySlip masked account digits only at their original positions", () => {
  assert.equal(maskedAccountMatches("0793953402", "xxxxxx3402"), true);
  assert.equal(maskedAccountMatches("0793953402", "xxx-x-x5340-x"), true);
  assert.equal(maskedAccountMatches("0793953402", "xxxxxx9999"), false);
  assert.equal(maskedAccountMatches("0793953402", "3402"), false);
});

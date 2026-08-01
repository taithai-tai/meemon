export interface EasySlipResult {
  ok: boolean;
  code: number;
  providerCode: string;
  message: string;
  transRef?: string;
  amountSatang?: number;
  receiverName?: string;
  receiverAccount?: string;
  receivingBank?: string;
  transactionAt?: string;
  retryAfterSeconds?: number;
  sanitized: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function optionalString(value: unknown) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function digits(value: string | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function maskedAccountMatches(expectedValue: string, actualValue: string | undefined) {
  const expected = digits(expectedValue);
  const rawActual = actualValue ?? "";
  const actual = digits(rawActual);
  if (!expected || !actual) return false;
  if (expected === actual) return true;

  // EasySlip intentionally masks digits but keeps their positions. Accept a
  // masked value only when it has the exact same length, shows at least four
  // digits, and every visible digit matches the configured account at the
  // same position.
  const pattern = rawActual.replace(/[^0-9xX*]/g, "").toLowerCase();
  const visibleDigits = pattern.replace(/[^0-9]/g, "");
  return pattern.length === expected.length
    && visibleDigits.length >= 4
    && [...pattern].every((character, index) => character === "x" || character === "*" || character === expected[index]);
}

export function applyExpectedReceiver(
  result: EasySlipResult,
  expectedAmountSatang: number,
  expectedBankCode: string,
  expectedAccountNumber: string,
): EasySlipResult {
  const expectedBank = digits(expectedBankCode);
  const actualBank = digits(result.receivingBank);
  const exactReceiver = maskedAccountMatches(expectedAccountNumber, result.receiverAccount)
    && Boolean(expectedBank && actualBank && expectedBank === actualBank);

  // EasySlip may verify a genuine slip without returning `matchedAccount`.
  // In that case the raw slip still contains the receiving bank and a masked
  // account number. Promote only a provider-confirmed result whose amount,
  // transaction reference, bank, and every visible account digit all match.
  const canPromoteUnregisteredReceiver = result.code === 1014
    && result.providerCode === "OK"
    && Boolean(result.transRef)
    && result.amountSatang === expectedAmountSatang
    && exactReceiver;

  if (canPromoteUnregisteredReceiver) {
    return {
      ...result,
      ok: true,
      code: 200,
      sanitized: { ...result.sanitized, code: 200, success: true, exactReceiver: true },
    };
  }

  if (!result.ok || exactReceiver) {
    return {
      ...result,
      sanitized: { ...result.sanitized, exactReceiver },
    };
  }

  return {
    ...result,
    ok: false,
    code: 1014,
    message: "receiver mismatch",
    sanitized: { ...result.sanitized, code: 1014, success: false, exactReceiver: false },
  };
}

export function parseEasySlipResponse(
  rawValue: unknown,
  responseOk: boolean,
  responseStatus: number,
  expectedAmountSatang: number,
): EasySlipResult {
  const raw = asRecord(rawValue);
  const data = asRecord(raw.data);
  const error = asRecord(raw.error);
  const rawSlip = asRecord(data.rawSlip);
  const amount = asRecord(rawSlip.amount);
  const matchedAccount = asRecord(data.matchedAccount);
  const matchedBank = asRecord(matchedAccount.bank);
  const receiver = asRecord(rawSlip.receiver);
  const receiverBank = asRecord(receiver.bank);
  const receiverAccountData = asRecord(receiver.account);
  const receiverAccountName = asRecord(receiverAccountData.name);
  const receiverBankAccount = asRecord(receiverAccountData.bank);
  const receiverProxyAccount = asRecord(receiverAccountData.proxy);
  const providerCode = String(error.code ?? (raw.success === true ? "OK" : `HTTP_${responseStatus}`));
  const message = String(error.message ?? raw.message ?? (responseOk ? "verified" : "provider error"));
  const transRef = optionalString(rawSlip.transRef);
  const amountInSlip = Number(data.amountInSlip ?? amount.amount);
  const amountSatang = Number.isFinite(amountInSlip) ? Math.round(amountInSlip * 100) : undefined;
  const amountMatched = typeof data.isAmountMatched === "boolean"
    ? data.isAmountMatched
    : amountSatang === expectedAmountSatang;
  const duplicate = data.isDuplicate === true;
  const accountMatched = Boolean(matchedAccount.bankNumber);
  const receiverName = optionalString(matchedAccount.nameTh ?? receiverAccountName.th ?? receiverAccountName.en);
  const receiverAccount = optionalString(
    matchedAccount.bankNumber ?? receiverBankAccount.account ?? receiverProxyAccount.account,
  );
  const receivingBank = optionalString(matchedBank.code ?? receiverBank.id ?? receiverBank.short);
  const transactionAt = optionalString(rawSlip.date);
  const pending = providerCode === "SLIP_PENDING";
  const transientProviderError = pending || ["API_SERVER_ERROR", "INTERNAL_SERVER_ERROR"].includes(providerCode)
    || responseStatus >= 500;
  const unavailableProvider = [
    "MISSING_API_KEY", "INVALID_API_KEY", "BRANCH_INACTIVE", "SERVICE_BANNED",
    "SERVICE_DELETED", "IP_NOT_ALLOWED", "QUOTA_EXCEEDED", "USER_BANNED",
  ].includes(providerCode);
  const verified = responseOk && raw.success === true && Boolean(transRef);
  const code = transientProviderError
    ? 1010
    : duplicate
    ? 1012
    : verified && !amountMatched
    ? 1013
    : verified && !accountMatched
    ? 1014
    : verified
    ? 200
    : unavailableProvider
    ? 1503
    : responseOk
    ? 400
    : responseStatus;
  const ok = verified && !duplicate && amountMatched && accountMatched;

  return {
    ok,
    code,
    providerCode,
    message,
    transRef,
    amountSatang,
    receiverName,
    receiverAccount,
    receivingBank,
    transactionAt,
    retryAfterSeconds: transientProviderError ? (pending ? 5 * 60 : 60) : undefined,
    sanitized: {
      code,
      providerCode,
      message,
      success: ok,
      transRef,
      amount: Number.isFinite(amountInSlip) ? amountInSlip : undefined,
      isAmountMatched: amountMatched,
      isDuplicate: duplicate,
      receiverName,
      receiverAccount,
      receivingBank,
      transactionAt,
    },
  };
}

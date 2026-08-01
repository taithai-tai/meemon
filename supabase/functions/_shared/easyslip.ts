import { env } from "./server.ts";
import { applyExpectedReceiver, parseEasySlipResponse, type EasySlipResult } from "./easyslip-parser.ts";

interface ExpectedReceiver {
  bankCode: string;
  accountNumber: string;
}

export async function checkSlip(
  file: File,
  expectedAmountSatang: number,
  expectedReceiver: ExpectedReceiver,
): Promise<EasySlipResult> {
  const form = new FormData();
  form.set("image", file, file.name);
  form.set("matchAccount", "true");
  form.set("matchAmount", (expectedAmountSatang / 100).toFixed(2));
  form.set("checkDuplicate", "true");

  const response = await fetch("https://api.easyslip.com/v2/verify/bank", {
    method: "POST",
    headers: { authorization: `Bearer ${env("EASYSLIP_API_KEY")}` },
    body: form,
  });
  const raw = await response.json().catch(() => ({}));
  const result = parseEasySlipResponse(raw, response.ok, response.status, expectedAmountSatang);
  return applyExpectedReceiver(
    result,
    expectedAmountSatang,
    expectedReceiver.bankCode,
    expectedReceiver.accountNumber,
  );
}

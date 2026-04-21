import { NextRequest, NextResponse } from "next/server";
import type {
  GenerateVietQrRequestV1,
  GenerateVietQrResponseV1,
  ApiSuccessV1,
  ApiErrorV1,
} from "@/features/finance/type";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateVietQrRequestV1 = await req.json();

    // Try real VietQR API
    const vietQrUrl = `https://img.vietqr.io/image/${body.bankBin}-${body.accountNumber}-compact2.png?amount=${body.amount}&addInfo=${encodeURIComponent(body.transferNote)}${body.accountName ? `&accountName=${encodeURIComponent(body.accountName)}` : ""}`;

    const payload = [
      body.bankBin,
      body.accountNumber,
      body.amount,
      body.transferNote,
    ].join("|");

    const data: GenerateVietQrResponseV1 = {
      payload,
      qrImageUrl: vietQrUrl,
      amount: body.amount,
      transferNote: body.transferNote,
      bankBin: body.bankBin,
      accountNumber: body.accountNumber,
    };

    const res: ApiSuccessV1<GenerateVietQrResponseV1> = { version: "v1", data };
    return NextResponse.json(res);
  } catch (err) {
    const res: ApiErrorV1 = {
      version: "v1",
      error: {
        code: "VIETQR_ERROR",
        message: err instanceof Error ? err.message : "KhÃ´ng thá»ƒ táº¡o QR",
      },
    };
    return NextResponse.json(res, { status: 500 });
  }
}

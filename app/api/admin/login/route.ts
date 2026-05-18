import { NextResponse } from "next/server";
import { checkPassword, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !checkPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Şifre hatalı" },
      { status: 401 },
    );
  }
  setSessionCookie();
  return NextResponse.json({ ok: true });
}

// app/api/register/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // contoh validasi
  if (!body.email || !body.password) {
    return NextResponse.json(
      { success: false, message: "Email & password wajib diisi" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "Register berhasil" });
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import pool from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if ((rows as any).length === 0) {
      return NextResponse.json({ success: false, message: "Email tidak ditemukan" });
    }

    // Generate token reset
    const token = crypto.randomBytes(20).toString("hex");
    const expire = new Date(Date.now() + 3600000); // 1 jam

    await pool.query("UPDATE users SET reset_token = ?, token_expire = ? WHERE email = ?", [token, expire, email]);

    // Di sini nanti bisa kirim email berisi link reset password
    console.log(`Link reset password: http://localhost:3000/reset-password?token=${token}`);

    return NextResponse.json({ success: true, message: "Link reset password dikirim (cek console saat ini)" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
 
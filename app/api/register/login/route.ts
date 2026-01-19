import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if ((rows as any).length === 0) {
      return NextResponse.json({ success: false, message: "Email tidak ditemukan" });
    }

    const user = (rows as any)[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ success: false, message: "Password salah" });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error login API:", err);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" });
  }
}

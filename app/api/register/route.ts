import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // cek apakah email sudah terdaftar
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if ((existing as any).length > 0) {
      return NextResponse.json({ success: false, message: "Email sudah terdaftar" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan ke database
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return NextResponse.json({ success: true, message: "Register berhasil" });
  } catch (err: any) {
    console.error("Error register API:", err);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" });
  }
}

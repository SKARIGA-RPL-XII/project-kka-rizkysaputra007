export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// koneksi database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "kesehatan_ai",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // validasi
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    // cek email sudah ada
    const [check]: any = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (check.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // INSERT ke database
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"]
    );

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Gagal menyimpan data ke database",
    });
  }
}

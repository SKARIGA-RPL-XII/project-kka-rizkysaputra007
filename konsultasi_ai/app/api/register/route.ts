import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // cek user sudah ada
    const [rows]: any = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    // ⬇️ INI PENTING (biar tidak kirim HTML)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

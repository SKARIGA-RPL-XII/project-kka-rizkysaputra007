import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  // VALIDASI
  if (!email) {
    return NextResponse.json({ success: false, message: "Email wajib diisi" });
  }

  // === Simulasi DB ===
  // nanti diganti pakai DB kamu
  const users = [
    { email: "user@example.com", name: "User" },
  ];

  const user = users.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json({ success: false, message: "Email tidak terdaftar" });
  }

  // buat token reset (untuk demo)
  const token = Math.random().toString(36).substring(2, 12);

  // Simpan token ke DB (dummy)
  // user.resetToken = token;

  // Kirim email (opsional)
  // di demo, kita tidak kirim email, tapi bisa kamu tambahkan

  return NextResponse.json({
    success: true,
    message: "Link reset password sudah dikirim",
    token,
  });
}

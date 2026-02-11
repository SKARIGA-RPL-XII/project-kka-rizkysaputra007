import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'kesehatan_ai'
};

// --- 1. FUNGSI GET (Mengambil Data) ---
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const query = `
      SELECT * FROM consultations 
      ORDER BY created_at DESC
    `;

    const [rows] = await connection.execute(query);
    // console.log("📤 Data yang dikirim ke Dokter:", rows); 
    
    await connection.end();

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("Gagal fetch data doctor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 2. FUNGSI PUT (Menyimpan Balasan Dokter) ---
export async function PUT(req: Request) {
  try {
    // Ambil data dari body request (ID konsultasi dan isi balasan)
    const body = await req.json();
    const { id, doctor_reply } = body;

    // Validasi sederhana
    if (!id || !doctor_reply) {
      return NextResponse.json({ error: 'ID dan Balasan Dokter wajib diisi' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Query Update:
    // 1. Mengisi kolom 'doctor_reply'
    // 2. Mengubah status menjadi 'replied'
    const query = `
      UPDATE consultations 
      SET doctor_reply = ?, status = 'replied' 
      WHERE id = ?
    `;

    await connection.execute(query, [doctor_reply, id]);
    await connection.end();

    return NextResponse.json({ success: true, message: "Balasan dokter berhasil disimpan" });

  } catch (error: any) {
    console.error("Gagal simpan balasan dokter:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
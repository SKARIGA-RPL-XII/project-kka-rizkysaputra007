import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Koneksi Database (Sama seperti sebelumnya)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'kesehatan_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function query(sql: string, params?: any[]) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

// GET: Ambil semua konsultasi
export async function GET(req: Request) {
  try {
    // Urutkan dari yang terbaru, pending di atas
    const consultations = await query(`
      SELECT * FROM consultations 
      ORDER BY 
        CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
        created_at DESC
    `) as any[];

    return NextResponse.json(consultations);
  } catch (error: any) {
    console.error("Error fetching consultations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Balas Konsultasi
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, reply } = body;

    if (!id || !reply) {
      return NextResponse.json({ error: 'ID dan Balasan wajib diisi' }, { status: 400 });
    }

    await query(
      'UPDATE consultations SET doctor_reply = ?, status = ? WHERE id = ?',
      [reply, 'replied', id]
    );

    return NextResponse.json({ success: true, message: 'Balasan terkirim' });
  } catch (error: any) {
    console.error("Error replying consultation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
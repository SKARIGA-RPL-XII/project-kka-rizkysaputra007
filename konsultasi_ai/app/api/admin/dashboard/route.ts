import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// --- KONFIGURASI KONEKSI DATABASE ---
// Pastikan data ini sesuai dengan file .env atau konfigurasi XAMPP Anda
const dbConfig = {
  host: 'localhost',
  user: 'root',      // User default XAMPP
  password: '',      // Password default XAMPP (kosong)
  database: 'kesehatan_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Fungsi helper untuk menjalankan query
async function query(sql: string, params?: any[]) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

export async function GET(req: Request) {
  try {
    console.log("API Dashboard (Raw SQL) dipanggil...");

    // 1. Cek Token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Token missing' }, { status: 401 });
    }

    // 2. Mengambil Data dengan Query SQL Manual

    // A. Hitung Total User
    const usersCountResult = await query('SELECT COUNT(*) as count FROM users') as any[];
    const totalUsers = usersCountResult[0].count;

    // B. Ambil Data User
    // Sesuaikan nama tabel dan kolom dengan database Anda
    const users = await query('SELECT id, name, email, role, created_at as createdAt FROM users ORDER BY created_at DESC') as any[];

    // C. Hitung Total Dokter
    const doctorsCountResult = await query('SELECT COUNT(*) as count FROM doctors') as any[];
    const totalDoctors = doctorsCountResult[0].count;

    // D. Ambil Data Dokter
    const doctors = await query('SELECT id, name, specialist, patients FROM doctors') as any[];

    return NextResponse.json({
      stats: {
        users: totalUsers,
        doctors: totalDoctors,
        consultations: 348 
      },
      users,
      doctors
    });

  } catch (error: any) {
    console.error("Database SQL Error:", error);
    
    // Pesan error lebih spesifik untuk SQL
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ error: 'Database XAMPP mati. Nyalakan MySQL di XAMPP.' }, { status: 500 });
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json({ error: 'Database "kesehatan_ai" tidak ditemukan.' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
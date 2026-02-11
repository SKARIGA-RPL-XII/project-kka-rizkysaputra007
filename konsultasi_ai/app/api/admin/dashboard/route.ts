// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Menggunakan path yang Anda minta

export async function GET(req: Request) {
  try {
    // Query untuk Statistik Total User
    const [usersStats] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Query untuk Statistik Total Dokter (Asumsi role = 'dokter' atau 'doctor')
    const [doctorsStats] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'dokter'");
    
    // Query untuk Statistik Konsultasi
    // (Sesuaikan query ini jika Anda sudah memiliki tabel konsultasi)
    const consultationsCount = 0; 

    // Query untuk Mengambil Data User
    // Mengubah created_at menjadi createdAt agar sesuai dengan interface Frontend
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        created_at as createdAt
      FROM users 
      ORDER BY id DESC
    `);

    return NextResponse.json({
      stats: {
        users: (usersStats as any)[0].count,
        doctors: (doctorsStats as any)[0].count,
        consultations: consultationsCount
      },
      users: rows
    });

  } catch (error: any) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari database' }, { status: 500 });
  }
}
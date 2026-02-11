import { NextResponse } from 'next/server';
import pool from '../../../lib/db'; 

// ... fungsi GET tetap sama ...

// --- FUNGSI PUT (SIMPAN BALASAN) ---
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, doctor_reply } = body;

    if (!id || !doctor_reply) {
      return NextResponse.json({ error: 'ID dan Balasan wajib diisi' }, { status: 400 });
    }

    // Query Update Database
    const query = `
      UPDATE consultations 
      SET doctor_reply = ?, status = 'replied' 
      WHERE id = ?
    `;

    await pool.query(query, [doctor_reply, id]);

    return NextResponse.json({ success: true, message: "Balasan disimpan" });

  } catch (error: any) {
    console.error("Gagal simpan reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
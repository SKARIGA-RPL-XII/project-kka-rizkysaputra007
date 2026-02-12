import { NextResponse } from 'next/server'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, replyText } = body;

    if (!id || !replyText) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // --- LOGIKA UPDATE DATABASE (GANTI SESUAI DB ANDA) ---
    
    // CONTOH JIKA MENGGUNAKAN PRISMA:
    /*
    await prisma.consultation.update({
      where: { id: Number(id) },
      data: {
        doctor_reply: replyText,
        status: 'replied',
        // Opsional: update replied_at jika ada field tersebut
      }
    });
    */

    // CONTOH JIKA MENGGUNAKAN SQL LANGSUNG (Misal pg):
    /*
    await sql`
      UPDATE consultations 
      SET doctor_reply = ${replyText}, status = 'replied' 
      WHERE id = ${id}
    `;
    */

    // --- END LOGIKA DATABASE ---

    // Hapus baris komentar di atas dan sesuaikan dengan koneksi DB Anda
    
    return NextResponse.json({ success: true, message: "Balasan terkirim" });

  } catch (error) {
    console.error("Gagal mengirim balasan dokter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
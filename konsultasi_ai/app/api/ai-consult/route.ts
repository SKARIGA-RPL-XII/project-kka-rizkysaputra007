import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah asisten kesehatan. Jawaban harus singkat, jelas, dan sesuai keluhan. " +
              "Jangan memberi saran yang berbahaya. Jika gejala serius, sarankan ke dokter. " +
              "Output harus dalam format JSON seperti:\n" +
              "{\n" +
              ' "analisis": "...",\n' +
              ' "saran": ["...", "..."],\n' +
              ' "kapan_ke_dokter": "..."\n' +
              "}",
          },
          { role: "user", content: message },
        ],
        temperature: 0.2,
        max_tokens: 450,
      }),
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content ?? "Tidak ada jawaban";

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY?.slice(0, 5));

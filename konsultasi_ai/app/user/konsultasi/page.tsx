"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Send, Mic, BrainCircuit, User, Bot, 
  CheckCircle, Stethoscope, Loader2, AlertCircle, 
  Activity
} from "lucide-react";

// --- TYPING & INTERFACES ---
type MessageSender = "user" | "ai";

type Message = {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  type?: "text" | "diagnosis" | "error";
  diagnosisData?: DiagnosisResult;
  symptoms?: string; // TAMBAHAN: Simpan gejala asli disini
};

interface DiagnosisResult {
  condition: string;
  severity: "Rendah" | "Sedang" | "Tinggi";
  description: string;
  advice: string[];
  recommendation: string;
}

export default function KonsultasiAIPage() {
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Halo! Saya asisten diagnosa AI berbasis GPT-4. Silakan ceritakan keluhan kesehatan Anda, dan saya akan menganalisanya.",
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  // --- FUNGSI KIRIM PESAN & ANALISA ---
  const handleSend = async () => {
    if (!input.trim() || isAnalyzing) return;

    const userSymptoms = input; // Simpan gejala user
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userSymptoms,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: userSymptoms }),
      });

      if (!response.ok) throw new Error("Gagal menghubungi server diagnosis.");

      const data: DiagnosisResult = await response.json();

      // PERUBAHAN: Simpan gejala asli (userSymptoms) ke dalam pesan AI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Berdasarkan analisa gejala Anda:",
        sender: "ai",
        timestamp: new Date(),
        type: "diagnosis",
        diagnosisData: data,
        symptoms: userSymptoms // <--- INI PENTING
      };
      
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Maaf, terjadi kesalahan: ${error.message}`,
        sender: "ai",
        timestamp: new Date(),
        type: "error"
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- FUNGSI KONSULTASI DOKTER (TERHUBUNG DATABASE) ---
  const handleConsultDoctor = async (diagnosisData: DiagnosisResult, originalSymptoms: string) => {
    // 1. Ambil Data User dari LocalStorage
    const userStr = localStorage.getItem("user");
    let userId = 0;
    let userName = "Guest";

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || 0;
        userName = user.name || "User";
      } catch (e) {
        console.error("Gagal parsing user", e);
      }
    }

    // 2. Kirim Data ke API Create
    try {
      const res = await fetch('/api/consultation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          symptoms: originalSymptoms,
          diagnosisData
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        // 3. Jika sukses, redirect ke halaman chat dokter (atau beri notifikasi)
        alert("Konsultasi berhasil dikirim ke antrian dokter!");
        // Opsional: Redirect ke halaman chat dokter jika Anda memilikinya
        // router.push("/chat-dokter"); 
      } else {
        alert("Gagal mengirim konsultasi: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-slate-900/90 backdrop-blur-xl p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">AI Diagnosa Medis</h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-emerald-400 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">GPT-4 Active</span>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-6 bg-slate-950">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              
              {/* AVATAR */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-white/10 ${
                msg.sender === "user" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-slate-800"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4 text-white" /> : <BrainCircuit className="w-4 h-4 text-cyan-400" />}
              </div>

              {/* TEXT BUBBLE */}
              {msg.type === "text" && (
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                  msg.sender === "user" ? "bg-cyan-600 text-white rounded-tr-none" : "bg-slate-800/80 backdrop-blur text-slate-200 rounded-tl-none border border-white/5"
                }`}>
                  {msg.text}
                </div>
              )}

              {/* ERROR BUBBLE */}
              {msg.type === "error" && (
                <div className="p-4 rounded-2xl bg-rose-900/30 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              )}

              {/* DIAGNOSIS CARD */}
              {msg.type === "diagnosis" && msg.diagnosisData && (
                <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/20 backdrop-blur-md animate-fade-in">
                  
                  {/* HEADER */}
                  <div className="bg-gradient-to-r from-cyan-900/50 to-slate-900 p-4 border-b border-white/5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Hasil Analisa AI</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{msg.diagnosisData.condition}</h3>
                    </div>
                    {/* BADGE */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      msg.diagnosisData.severity === "Tinggi" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                      msg.diagnosisData.severity === "Sedang" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        msg.diagnosisData.severity === "Tinggi" ? "bg-rose-400" :
                        msg.diagnosisData.severity === "Sedang" ? "bg-amber-400" :
                        "bg-emerald-400"
                      }`} />
                      {msg.diagnosisData.severity}
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed">{msg.diagnosisData.description}</p>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                        <Stethoscope className="w-3 h-3" /> Saran Tindakan:
                      </h4>
                      <ul className="space-y-2">
                        {msg.diagnosisData.advice.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-cyan-500 mt-1.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-500/10">
                      <p className="text-xs text-cyan-200/80 italic flex gap-2">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        {msg.diagnosisData.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* FOOTER ACTION */}
                  <div className="p-4 bg-slate-800/50 border-t border-white/10">
                    {/* PERUBAHAN: Memanggil fungsi handleConsultDoctor dengan data */}
                    <button 
                      onClick={() => handleConsultDoctor(msg.diagnosisData!, msg.symptoms!)}
                      className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group active:scale-95"
                    >
                      <Stethoscope className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Konsultasi Lanjut ke Dokter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* LOADING */}
        {isAnalyzing && (
          <div className="flex justify-center my-4">
            <div className="bg-slate-900/90 border border-cyan-500/20 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-md">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <span className="text-sm text-cyan-400 font-medium">Menganalisis gejala dengan AI...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT AREA */}
      <footer className="p-4 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 sticky bottom-0 z-50">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-end gap-2 bg-slate-950 border border-white/10 rounded-2xl p-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all shadow-2xl">
            <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-xl hover:bg-white/5">
              <Mic className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Contoh: Saya pusing kepala bagian belakang disertai mual..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 resize-none py-2 max-h-32 text-sm"
              rows={1}
              disabled={isAnalyzing}
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAnalyzing}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2 flex justify-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-400">OpenAI GPT-4o Mini</span>
            <span>•</span>
            <span>Hasil analisa bersifat informatif, bukan diagnosa medis resmi.</span>
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
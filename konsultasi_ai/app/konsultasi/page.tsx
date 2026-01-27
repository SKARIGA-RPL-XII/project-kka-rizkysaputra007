"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Stethoscope, MessageCircle, User, ArrowLeft, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function KonsultasiAIPage() {
  const router = useRouter();
  const chatRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const [chat, setChat] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: "Halo! Saya AI HealthCare. Silakan ceritakan keluhan Anda 😊",
    },
  ]);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert("Server error: " + text);
        return;
      }

      const data = await res.json();

      setTyping(true);
      await new Promise((r) => setTimeout(r, 900));

      setChat((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          text: data.reply,
        },
      ]);
      setTyping(false);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          role: "assistant",
          text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultDoctor = () => {
    alert("Fitur konsultasi ke dokter akan segera tersedia!");
  };

  const bgSvg =
    "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: `url('${bgSvg}')` }}
      ></div>

      {/* Ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow-delay"></div>

      <div className="relative max-w-5xl mx-auto w-full p-6 flex flex-col h-screen">
        {/* Simple icon back button */}
        <button
          onClick={() => router.push("/dashboard-logged")}
          className="group relative w-12 h-12 mb-6 rounded-xl bg-slate-800/60 backdrop-blur-md border border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center overflow-hidden hover:scale-105"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Icon */}
          <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 group-hover:-translate-x-0.5 transition-all duration-300 relative z-10" strokeWidth={2.5} />
        </button>

        {/* Enhanced header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50 animate-pulse-slow"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Stethoscope className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
              Konsultasi Kesehatan AI
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Jelaskan keluhan Anda. AI akan memberikan saran awal, lalu lanjutkan ke dokter jika diperlukan.
            </p>
          </div>
        </div>

        {/* Enhanced chat area */}
        <div
          ref={chatRef}
          className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 overflow-y-auto shadow-2xl mb-4 relative"
          style={{ height: "70vh" }}
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
          
          {chat.map((m, idx) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 mb-4 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{
                animation: `messageSlide 0.4s ease-out ${idx * 0.05}s both`,
              }}
            >
              {m.role === "assistant" && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-40"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[75%] px-5 py-3.5 rounded-2xl shadow-lg transition-all duration-300 ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white shadow-cyan-500/25"
                    : "bg-slate-800/60 backdrop-blur-sm border border-white/10 text-slate-100 shadow-black/20"
                }`}
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
              {m.role === "user" && (
                <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-40"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-white/10 px-5 py-3.5 rounded-2xl shadow-lg">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern doctor consultation card */}
        {chat.length > 1 && (
          <div className="relative group mb-4 animate-slideUp">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-emerald-950/40 to-green-950/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
                  <Stethoscope className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                
                <p className="text-slate-200 mb-5 text-sm font-medium leading-relaxed max-w-md mx-auto">
                  Apakah Anda ingin melanjutkan konsultasi dengan dokter untuk diagnosis lebih lanjut?
                </p>
                
                <button
                  onClick={handleConsultDoctor}
                  className="group/btn relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 transition-all duration-300 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  <Sparkles className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Konsul ke Dokter</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern input area */}
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="relative w-full rounded-2xl bg-slate-800/60 backdrop-blur-md border border-white/10 px-5 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-all duration-300 shadow-lg"
              placeholder="Tuliskan keluhan Anda..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={loading}
            className="group/send relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 flex items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/send:translate-x-[100%] transition-transform duration-700"></div>
            <Send className="w-4 h-4 relative z-10 group-hover/send:rotate-12 transition-transform" />
            <span className="relative z-10 font-semibold">
              {loading ? "Mengirim..." : "Kirim"}
            </span>
          </button>
        </div>

        <style jsx>{`
          .typing-dots {
            display: flex;
            gap: 6px;
          }
          .typing-dots span {
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #22d3ee, #3b82f6);
            border-radius: 999px;
            animation: typing 1.2s infinite ease-in-out;
          }
          .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes typing {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-8px) scale(1.1);
              opacity: 1;
            }
          }

          @keyframes messageSlide {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slideUp {
            animation: slideUp 0.5s ease-out;
          }

          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.6;
            }
          }

          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }

          .animate-pulse-slow-delay {
            animation: pulse-slow 4s ease-in-out infinite 2s;
          }

          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.3);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #06b6d4, #3b82f6);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #22d3ee, #60a5fa);
          }
        `}</style>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      showToast("Mohon lengkapi email dan kata sandi.", "error");
      setLoading(false);
      return;
    }

    try {
      // Simulasi API Call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // --- LOGIKA PENENTUAN ROLE ---
      let role = "user";
      if (email.includes("admin")) role = "admin";
      else if (email.includes("dokter")) role = "dokter";

      // 1. SET COOKIE (Agar Middleware membaca jika ada)
      document.cookie = "auth=true; path=/; SameSite=Lax; Max-Age=86400";
      document.cookie = `role=${role}; path=/; SameSite=Lax; Max-Age=86400`;

      // 2. SET LOCALSTORAGE (AGAR DASHBOARD MEMBACA INI)
      // Ini penting agar Dashboard tidak menendang Anda kembali ke login
      localStorage.setItem("token", "secure-token-123");
      localStorage.setItem("user", JSON.stringify({
        name: email.split("@")[0], // Ambil nama dari email (contoh: admin@gmail.com -> "admin")
        email: email,
        role: role
      }));
      
      showToast("Login Berhasil! Mengalihkan...", "success");

      setTimeout(() => {
        let redirectUrl = "/user/dashboard-logged";
        if (role === "admin") redirectUrl = "/admin";
        else if (role === "dokter") redirectUrl = "/doctor";
        
        router.push(redirectUrl);
      }, 1000);

    } catch (err: any) {
      showToast(err.message || "Terjadi kesalahan saat login.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* --- CSS ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          100% { left: 200%; }
        }
        .animate-float { animation: float 10s infinite ease-in-out; }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .logo-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-25deg);
          animation: shine 3s infinite;
        }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white selection:bg-cyan-500/30">
        
        {/* --- BACKGROUND ELEMENTS --- */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-cyan-500 rounded-full blur-[80px] opacity-40 animate-float z-0" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-600 rounded-full blur-[80px] opacity-40 animate-float z-0" style={{ animationDelay: '-5s' }} />

        {/* --- MAIN CARD --- */}
        <main className="relative z-10 w-full max-w-[360px] p-8 m-4 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-2xl animate-slide-up">
          
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20 logo-shine overflow-hidden">
              <span className="text-2xl font-extrabold text-white tracking-tighter">AI</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Health<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Care</span><span className="text-white">AI</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">Solusi kesehatan cerdas masa depan</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Email Anda"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Kata Sandi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 border-2 border-slate-600 rounded bg-transparent peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all"></div>
                  <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Ingat saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link 
              href="/register" 
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Daftar sekarang
            </Link>
          </div>
        </main>

        {/* --- TOAST --- */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 animate-slide-up ${toast.type === 'error' ? 'bg-red-500/10 border-l-4 border-l-red-500 text-red-100' : 'bg-green-500/10 border-l-4 border-l-green-500 text-green-100'}`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}
      </div>
    </>
  );
}
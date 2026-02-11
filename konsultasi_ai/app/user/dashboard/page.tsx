"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Placeholder Images (Unsplash)
  const BG_HERO = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2072&auto=format&fit=crop";
  const DOCTOR_IMAGE = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop";

  const [toast, setToast] = useState<{ show: boolean; message: string; type?: "success" | "error" }>({
    show: false,
    message: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<"konsultasi" | "riwayat" | null>(null);

  // Cek login
  const isLoggedIn = () => !!localStorage.getItem("token");

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 4000);
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      // Optional: Auto toast when page loads if not logged in? 
      // Better UX: Let user explore first, only toast when clicking restricted action.
    }
  }, []);

  const handleButtonClick = (target: "konsultasi" | "riwayat") => {
    if (isLoggedIn()) {
      router.push(target === "konsultasi" ? "/konsultasi" : "/riwayat");
    } else {
      setModalTarget(target);
      setModalOpen(true);
      showToast("Anda harus login untuk akses fitur ini.", "error");
    }
  };

  const handleModalOk = () => {
    setModalOpen(false);
    router.push("/login");
  };

  return (
    <>
      {/* --- GLOBAL ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(6,182,212,0.15); }
          50% { box-shadow: 0 0 40px rgba(6,182,212,0.4); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans">
        
        {/* --- BACKGROUND DECORATION --- */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        {/* --- TOAST NOTIFICATION --- */}
        {toast.show && (
          <div className="fixed top-6 right-6 z-[60] animate-bounce-in">
            <div className={`px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-3 min-w-[300px] ${toast.type === 'error' ? 'bg-red-900/80' : 'bg-green-900/80'}`}>
              <div className={`p-2 rounded-full ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {toast.type === 'error' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.message}</p>
              </div>
              <button onClick={() => setToast({ show: false, message: "" })} className="text-white/50 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
        )}

        {/* --- MODAL LOGIN --- */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity opacity-100">
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-transform">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mb-4 border border-white/10 animate-glow-pulse">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Akses Terbatas</h3>
                <p className="text-slate-400 text-sm">
                  Fitur <span className="text-cyan-400 font-semibold">{modalTarget}</span> memerlukan autentikasi pengguna.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors border border-white/5"
                >
                  Batal
                </button>
                <button
                  onClick={handleModalOk}
                  className="py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- HEADER --- */}
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-500/20">AI</div>
              <span className="font-bold text-lg tracking-tight">Health<span className="text-cyan-400">CareAI</span></span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Beranda</a>
              <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
              <a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a>
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/login")} className="text-sm font-medium hover:text-cyan-400 transition-colors">
                Masuk
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 text-sm font-bold hover:bg-cyan-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Daftar
              </button>
            </div>
          </div>
        </header>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Teknologi Kesehatan Masa Depan
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                Solusi Kesehatan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Berbasis AI Cerdas
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                Dapatkan diagnosa awal yang akurat dan konsultasi dengan dokter profesional dalam satu platform terintegrasi yang aman dan privasi terjaga.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => handleButtonClick("konsultasi")}
                  className="group relative px-8 py-4 bg-cyan-500 rounded-2xl text-white font-bold text-lg overflow-hidden shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] hover:-translate-y-1 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  Mulai Konsultasi
                </button>
                
                <button
                  onClick={() => handleButtonClick("riwayat")}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                >
                  Lihat Riwayat
                </button>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold text-white">10k+</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Pengguna Aktif</p>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div>
                  <p className="text-3xl font-bold text-white">4.9</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Rating Aplikasi</p>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div>
                  <p className="text-3xl font-bold text-white">24/7</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Layanan AI</p>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 blur-[100px] rounded-full opacity-50"></div>
              
              {/* Main Card */}
              <div className="relative w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl animate-float-slow">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] group">
                  <img 
                    src={DOCTOR_IMAGE} 
                    alt="Healthcare AI" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Dokter Online</span>
                    </div>
                    <h3 className="text-xl font-bold">dr. Sarah Wijaya</h3>
                    <p className="text-sm text-slate-300">Spesialis Penyakit Dalam</p>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-6 -right-6 bg-white text-slate-950 p-4 rounded-2xl shadow-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold">Verifikasi</p>
                      <p className="text-sm font-bold">Terlisensi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="fitur" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Unggulan</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Kami menggabungkan kecerdasan buatan dengan sentuhan manusia untuk memberikan perawatan kesehatan terbaik.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🤖", title: "Analisa AI Cepat", desc: "Dapatkan ringkasan gejala dan kemungkinan diagnosa dalam hitungan detik." },
                { icon: "👨‍⚕️", title: "Dokter Profesional", desc: "Konsultasi langsung dengan dokter spesialis yang tersertifikasi." },
                { icon: "🔒", title: "Data Privat & Aman", desc: "Data kesehatan Anda dienkripsi dan tidak dibagikan kepada pihak ketiga." },
              ].map((item, idx) => (
                <div key={idx} className="group p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-2">
                  <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="cara-kerja" className="py-24 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Cara Kerja Sistem Kami</h2>
                <div className="space-y-8">
                  {[
                    { step: "01", title: "Input Keluhan", text: "Tuliskan gejala yang Anda rasakan melalui kolom chat cerdas." },
                    { step: "02", title: "Proses AI", text: "Sistem AI kami menganalisis data kesehatan Anda dan memberikan pre-diagnosa." },
                    { step: "03", title: "Konsultasi Dokter", text: "Terhubung dengan dokter untuk verifikasi dan resep obat (jika diperlukan)." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-slate-400">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-[80px]"></div>
                 <div className="relative bg-slate-800/50 rounded-3xl border border-white/10 p-8 backdrop-blur-sm">
                   {/* Mock UI of Chat */}
                   <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                        <div className="bg-slate-700/50 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                          <p className="text-sm text-slate-200">Halo, saya merasa pusing dan mual sejak pagi ini.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center font-bold text-xs">AI</div>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                          <p className="text-sm text-cyan-100">Berdasarkan gejala, kemungkinan adalah <span className="font-bold text-white">Migrain</span> atau <span className="font-bold text-white">Vertigo</span>. Saran saya, istirahat sejenak.</p>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-sm">AI</div>
                   <span className="font-bold text-xl tracking-tight">HealthCareAI</span>
                </div>
                <p className="text-slate-400 max-w-sm mb-6">
                  Mewujudkan layanan kesehatan yang dapat diakses oleh siapa saja, kapan saja, dan di mana saja dengan bantuan teknologi kecerdasan buatan.
                </p>
                <div className="flex gap-4">
                   {[1,2,3].map((i) => (
                     <div key={i} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-cyan-500 hover:text-white transition-colors flex items-center justify-center text-slate-400">
                       {i === 1 ? "IG" : i === 2 ? "TW" : "FB"}
                     </div>
                   ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 text-white">Platform</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Tentang Kami</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Karir</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog Kesehatan</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-white">Kontak</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>help@healthcareai.com</li>
                  <li>+62 812 3456 7890</li>
                  <li>Jl. Teknologi No. 10, Jakarta</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
              <p>© 2026 HealthCareAI. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
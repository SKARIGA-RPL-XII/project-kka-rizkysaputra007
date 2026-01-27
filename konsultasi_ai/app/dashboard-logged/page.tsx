"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const BG_IMAGE = "/images/bg-dashboard.jpg";
  const DOCTOR_IMAGE = "/images/doctor.jpg";

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  const [open, setOpen] = useState(false);

  const [userName, setUserName] = useState<string>("User");

  // Cek login
  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  // Toast function
  const showToast = (message: string) => {
    setToast({ show: true, message });

    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  // Redirect jika belum login & ambil nama
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    } else {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || "User");
      }
    }
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-toast-in">
          <div className="max-w-sm w-full bg-slate-900/80 border border-white/20 rounded-xl shadow-2xl backdrop-blur-md p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Perhatian</p>
              <p className="text-sm text-white/70">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <span className="text-cyan-400 font-bold">AI</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide">
                Health<span className="text-cyan-400">CareAI</span>
              </h1>
              <p className="text-xs text-white/60">
                Dashboard
              </p>
            </div>
          </div>

          {/* Profil */}
          <div className="relative">
            <button
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-4 py-2 transition"
              onClick={() => setOpen(!open)}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-white/60">Akun</p>
              </div>
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900/70 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition"
                >
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-500/20 transition text-red-400"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center pt-24 animate-page-in"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.85), rgba(2,132,199,.35)), url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6 opacity-0 animate-slide-up">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Selamat datang, <br />
              <span className="text-cyan-400">{userName}</span>
            </h1>

            <p className="text-white/80 max-w-xl text-lg">
              Platform konsultasi kesehatan dengan
              <b> AI cerdas </b> dan <b>dokter profesional</b>.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  router.push("/konsultasi");
                }}
                className="relative px-6 py-3 bg-cyan-500 rounded-full 
                hover:bg-cyan-400 transition shadow-xl 
                before:absolute before:inset-0 before:rounded-full 
                before:bg-cyan-400/40 before:blur before:opacity-0 
                hover:before:opacity-100"
              >
                Mulai Konsultasi
              </button>

              <button
                onClick={() => router.push("/history")}
                className="px-6 py-3 bg-white/10 rounded-full 
                hover:bg-white/20 border border-white/20 transition"
              >
                Riwayat
              </button>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-5 max-w-xl">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Analisa gejala awal</li>
                <li>Ringkasan kondisi</li>
                <li>Rekomendasi tindakan</li>
                <li>Bahasa medis mudah dipahami</li>
              </ul>
            </div>
          </div>

          <div className="hidden lg:flex justify-center opacity-0 animate-slide-up">
            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl">
              <img
                src={DOCTOR_IMAGE}
                alt="Doctor"
                className="w-80 rounded-3xl shadow-xl animate-float animate-soft-pulse"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InfoBox
              title="Tentang Platform"
              text="Konsultasi kesehatan modern berbasis AI dan verifikasi dokter profesional."
            />
            <InfoBox
              title="Fitur Utama"
              list={[
                "Chat dokter",
                "Ringkasan AI",
                "Riwayat konsultasi",
                "Notifikasi kesehatan",
              ]}
            />
          </div>

          <div className="bg-slate-900/60 p-10 rounded-2xl border border-white/10 opacity-0 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6">Cara Kerja AI</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Step title="Input Gejala" desc="Masukkan keluhan kesehatan." />
              <Step title="Analisa AI" desc="AI memberi ringkasan awal." />
              <Step title="Dokter" desc="Dokter verifikasi & solusi." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Chat Dokter" desc="Konsultasi langsung" icon={IconChat} />
            <Card title="Pesan" desc="Notifikasi" icon={IconBell} />
            <Card title="Berita" desc="Info kesehatan" icon={IconNews} />
            <Card title="Dokter" desc="Daftar dokter" icon={IconDoctor} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-white/80">
          <div>
            <h3 className="font-bold text-lg mb-2">
              Health<span className="text-cyan-400">CareAI</span>
            </h3>
            <p className="text-sm">
              Konsultasi kesehatan berbasis AI dan dokter profesional.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Alamat</h4>
            <p className="text-sm">
              Jl. Kesehatan Digital No.21<br />
              Kota Malang, Indonesia
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Media Sosial</h4>
            <div className="flex gap-4">
              <SocialIcon icon={IconInstagram} />
              <SocialIcon icon={IconTwitter} />
              <SocialIcon icon={IconFacebook} />
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-white/50 py-4 border-t border-white/10">
          © 2026 HealthCareAI
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Card({ title, desc, icon }: any) {
  return (
    <div className="group bg-slate-900/60 p-6 rounded-2xl border border-white/10 
    opacity-0 animate-slide-up hover:-translate-y-2 
    hover:shadow-cyan-500/10 transition-all duration-300">
      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg 
      flex items-center justify-center mb-4 
      group-hover:rotate-6 group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-white/70">{desc}</p>
    </div>
  );
}

function InfoBox({ title, text, list }: any) {
  return (
    <div className="bg-slate-900/60 p-10 rounded-2xl border border-white/10 opacity-0 animate-slide-up">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {text && <p className="text-white/80">{text}</p>}
      {list && (
        <ul className="list-disc pl-5 space-y-2 text-white/80">
          {list.map((i: string) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Step({ title, desc }: any) {
  return (
    <div className="p-6 bg-slate-900/40 rounded-xl border border-white/10 opacity-0 animate-slide-up">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-white/70">{desc}</p>
    </div>
  );
}

function SocialIcon({ icon }: any) {
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full 
    bg-white/10 hover:bg-cyan-500/20 
    hover:-translate-y-1 hover:scale-110 
    transition-all duration-300 cursor-pointer">
      {icon}
    </div>
  );
}

/* ================= ICON ================= */

const IconChat = (
  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" d="M21 12c0 3.8-3.6 7-8 7a9.4 9.4 0 01-4-.9L3 20l1.9-5.1A7.9 7.9 0 013 12c0-3.8 3.6-7 8-7s8 3.2 8 7z" />
  </svg>
);

const IconBell = (
  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 00-12 0v3a2 2 0 01-.6 1.4L4 17h5m4 0a3 3 0 006 0" />
  </svg>
);

const IconNews = (
  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
  </svg>
);

const IconDoctor = (
  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" d="M12 11c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z" />
  </svg>
);

const IconInstagram = (
  <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" />
  </svg>
);

const IconTwitter = (
  <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 6c-.8.4-1.6.6-2.5.7a4.3 4.3 0 001.9-2.4 8.6 8.6 0 01-2.7 1A4.3 4.3 0 0016 4a4.3 4.3 0 00-4.3 4.3c0 .3 0 .6.1.9A12 12 0 013 5.1a4.3 4.3 0 001.3 5.7 4.2 4.2 0 01-2-.5 4.3 4.3 0 003.4 4.2 4.3 4.3 0 01-1.9.1 4.3 4.3 0 004 3 8.6 8.6 0 01-5.3 1.8A12.1 12.1 0 008.6 21c7.9 0 12.2-6.5 12.2-12.2v-.6A8.7 8.7 0 0022 6z" />
  </svg>
);

const IconFacebook = (
  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0114 6h3v3h-3a1 1 0 00-1 1V12h4l-.5 3h-3.5v7A10 10 0 0022 12z" />
  </svg>
);

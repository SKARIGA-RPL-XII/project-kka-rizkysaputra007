"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const BG_IMAGE = "/images/bg-dashboard.jpg";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Password dan Konfirmasi harus sama!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registrasi berhasil!");
        router.push("/login");
      } else {
        alert("Gagal: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative text-white px-4"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(2,6,23,.85), rgba(2,132,199,.35)), url(${BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* CARD (compact) */}
      <div className="relative z-10 w-full max-w-sm bg-slate-900/70 backdrop-blur-xl 
                      border border-white/10 rounded-3xl shadow-2xl p-6
                      animate-slide-up">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full 
                          bg-cyan-500/20 border border-cyan-400/30
                          flex items-center justify-center
                          animate-soft-pulse">
            <span className="text-cyan-400 text-lg font-bold">AI</span>
          </div>

          <h1 className="text-xl font-bold">
            Health<span className="text-cyan-400">CareAI</span>
          </h1>
          <p className="text-white/70 text-xs mt-1">
            Buat akun untuk mulai konsultasi kesehatan
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-white/70 mb-1">Nama</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition text-sm"
              placeholder="Nama"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition text-sm"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-white/70 mb-1">
              Konfirmasi Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-between text-xs text-white/70">
            <Link href="/login" className="hover:text-cyan-400 transition">
              Sudah punya akun? Login
            </Link>
            <Link href="/forgot-password" className="hover:text-cyan-400 transition">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-3 py-2.5 rounded-full font-medium
                        bg-cyan-500 hover:bg-cyan-400
                        shadow-lg shadow-cyan-500/30
                        transition-all duration-300
                        ${loading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
          >
            {loading ? "Mendaftarkan..." : "Register"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-xs text-white/50 mt-6">
          © 2026 HealthCareAI
        </p>
      </div>
    </div>
  );
}

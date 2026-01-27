"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const BG_IMAGE = "/images/bg-dashboard.jpg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Simpan token ke localStorage
        localStorage.setItem("token", data.token);

        // Redirect ke halaman dashboard
        router.push("/dashboard-logged");
      } else {
        alert("Login gagal: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative text-white"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(2,6,23,.85), rgba(2,132,199,.35)), url(${BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/70 backdrop-blur-xl 
                      border border-white/10 rounded-3xl shadow-2xl p-8 
                      animate-slide-up">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full 
                          bg-cyan-500/20 border border-cyan-400/30
                          flex items-center justify-center
                          animate-soft-pulse">
            <span className="text-cyan-400 text-xl font-bold">AI</span>
          </div>

          <h1 className="text-2xl font-bold">
            Health<span className="text-cyan-400">CareAI</span>
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Masuk untuk mulai konsultasi kesehatan
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition"
            />
          </div>

          <div className="flex justify-between text-sm text-white/70">
            <Link
              href="/register"
              className="hover:text-cyan-400 transition"
            >
              Daftar
            </Link>
            <Link
              href="/forgot-password"
              className="hover:text-cyan-400 transition"
            >
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3 rounded-full font-medium
                        bg-cyan-500 hover:bg-cyan-400
                        shadow-lg shadow-cyan-500/30
                        transition-all duration-300
                        ${loading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-xs text-white/50 mt-8">
          © 2026 HealthCareAI
        </p>
      </div>
    </div>
  );
}

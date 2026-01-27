"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const BG_IMAGE = "/images/bg-dashboard.jpg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Link reset password telah dikirim ke email Anda.");
      } else {
        setMessage(data.message || "Email tidak ditemukan.");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
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

      {/* CARD */}
      <div className="relative z-10 w-full max-w-sm bg-slate-900/70 backdrop-blur-xl 
                      border border-white/10 rounded-3xl shadow-2xl p-6">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full 
                          bg-cyan-500/20 border border-cyan-400/30
                          flex items-center justify-center">
            <span className="text-cyan-400 text-lg font-bold">AI</span>
          </div>

          <h1 className="text-xl font-bold">
            Health<span className="text-cyan-400">CareAI</span>
          </h1>
          <p className="text-white/70 text-xs mt-1">
            Reset password melalui email
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 
                         border border-white/20 text-white
                         placeholder:text-white/40
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                         transition text-sm"
              placeholder="email@example.com"
            />
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
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-white/60">
            {message}
          </p>
        )}

        <p className="text-center text-xs text-white/50 mt-6">
          Kembali ke{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

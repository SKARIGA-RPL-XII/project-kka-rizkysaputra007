"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Panggil API login
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Ambil data response
      const data = await res.json();

      if (data.success) {
        // Login berhasil → redirect ke dashboard
        router.push("/dashboard");
      } else {
        // Login gagal → tampilkan alert
        alert("Login gagal: " + data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 animate-fadeIn">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-500 text-xl font-bold">AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Konsultasi Kesehatan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk untuk mulai konsultasi
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-300
                         transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-300
                         transition"
              required
            />
          </div>

          <div className="flex justify-between text-sm">
            <Link href="/register" className="text-blue-500 hover:text-blue-600 hover:underline transition">
              Daftar
            </Link>
            <Link href="/forgot-password" className="text-gray-500 hover:text-gray-700 hover:underline transition">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-gradient-to-r from-blue-500 to-green-400 text-white py-2 rounded-lg font-medium
                        hover:opacity-90 active:scale-[0.98] transition-transform duration-150
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

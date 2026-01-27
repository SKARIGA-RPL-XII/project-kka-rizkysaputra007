"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: number;
  keluhan: string;
  hasil: string;
  tanggal: string;
  status: "Selesai" | "Diproses";
}

export default function HistoryPage() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Selesai" | "Diproses">("Semua");

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter + Search
  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        if (filterStatus === "Semua") return true;
        return item.status === filterStatus;
      })
      .filter((item) => {
        if (!search) return true;
        return item.keluhan.toLowerCase().includes(search.toLowerCase());
      });
  }, [history, filterStatus, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard-logged")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition"
            >
              ← Kembali ke Dashboard
            </button>

            <div>
              <h1 className="font-bold text-lg tracking-wide">
                Riwayat <span className="text-cyan-400">Konsultasi</span>
              </h1>
              <p className="text-xs text-white/60">Semua hasil konsultasi Anda tersimpan rapi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari keluhan..."
              className="bg-slate-900/40 border border-white/10 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-900/40 border border-white/10 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-cyan-400 transition"
            >
              <option value="Semua">Semua</option>
              <option value="Selesai">Selesai</option>
              <option value="Diproses">Diproses</option>
            </select>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="pt-28">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Banner */}
          <div className="mb-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold mb-2">Riwayat Konsultasi 🩺</h1>
            <p className="text-blue-100">Semua hasil konsultasi Anda tersimpan rapi dan aman.</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-32 mb-4" />
                  <div className="h-3 bg-white/10 rounded w-20 mb-6" />
                  <div className="h-3 bg-white/10 rounded w-full mb-3" />
                  <div className="h-3 bg-white/10 rounded w-5/6 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-slate-900/40 rounded-3xl p-10 text-center shadow-xl border border-white/10">
              <p className="text-white/60 text-lg">Belum ada riwayat konsultasi </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/40 rounded-3xl p-6 shadow-xl border border-white/10 
                  hover:-translate-y-1 hover:shadow-cyan-500/20 transition transform"
                >
                  <div className="flex justify-between mb-4">
                    <p className="text-sm text-white/60">{item.tanggal}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Selesai"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-semibold mb-1 text-white">Keluhan</h3>
                  <p className="text-white/70 mb-4">{item.keluhan}</p>

                  <h3 className="font-semibold mb-1 text-white">Hasil AI</h3>
                  <p className="text-white/70 line-clamp-4">{item.hasil}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

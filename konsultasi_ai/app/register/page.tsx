"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Password dan Konfirmasi harus sama!");
      return;
    }

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Nama</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-400"/>
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-400"/>
          </div>
          <div>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-400"/>
          </div>
          <div>
            <label>Konfirmasi Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-400"/>
          </div>
          <button type="submit" className="w-full py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Register</button>
        </form>
        <p className="mt-4 text-center text-gray-600">Sudah punya akun? <a href="/login" className="text-purple-500">Login</a></p>
      </div>
    </div>
  );
}

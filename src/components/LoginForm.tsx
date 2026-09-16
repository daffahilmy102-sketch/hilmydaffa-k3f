import React, { useState } from 'react';
import { Anchor, ShieldCheck, Lock, User as UserIcon, ArrowRight, Database, Ship, Waves } from 'lucide-react';
import { User } from '../types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(usernameOrEmail, password);
  };

  const performLogin = async (identifier: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: identifier, password: pass }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login gagal. Periksa username dan password.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (email: string, pass: string) => {
    setUsernameOrEmail(email);
    setPassword(pass);
    performLogin(email, pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative ocean waves background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sky-200 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-200 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
          {/* Header Brand Section */}
          <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-blue-800 p-6 sm:p-8 text-white relative">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-sky-200 shadow-inner">
                  <Anchor className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    MINA LESTARI
                  </h1>
                  <p className="text-xs sm:text-sm text-sky-100 font-medium">
                    Sistem Manajemen & Bisnis Angkutan Laut
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] uppercase tracking-wider text-sky-200 font-bold">Lisensi & Hak Milik</span>
                <span className="text-xs font-bold text-white bg-white/20 px-2.5 py-1 rounded-md border border-white/30">
                  HILMY DAPVFOA
                </span>
              </div>
            </div>

            {/* Mobile ownership badge */}
            <div className="sm:hidden mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-sky-200">Hak Milik Aplikasi:</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">HILMY DAPVFOA</span>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-300/30 text-emerald-100 text-xs px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>Terhubung ke Real Database SQLite Server (No LocalStorage)</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Masuk ke Portal Admin & Operasional</h2>
              <p className="text-sm text-slate-500 mt-1">
                Silakan autentikasi untuk mengakses Master Data Kapal, Transaksi SPAL, dan Laporan Angkutan Laut.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">!</div>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username atau Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin@minalestari.com atau admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memverifikasi Real Database...
                  </span>
                ) : (
                  <>
                    <span>Masuk ke Sistem MINA LESTARI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Section */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ⚡ Quick Demo Login (Sekali Klik)
                </span>
                <span className="text-[11px] text-sky-600 font-medium">Database Siap Produksi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@minalestari.com', 'admin123')}
                  className="p-3 bg-sky-50/70 hover:bg-sky-100/90 border border-sky-200/80 rounded-xl text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">Admin Utama</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">admin123</div>
                  <div className="text-[10px] text-sky-700 font-semibold mt-1">Hilmy (Admin)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('ops@minalestari.com', 'ops123')}
                  className="p-3 bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-xl text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">Operasional</span>
                    <Ship className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">ops123</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">Budi Santoso</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('finance@minalestari.com', 'finance123')}
                  className="p-3 bg-amber-50/70 hover:bg-amber-100/90 border border-amber-200/80 rounded-xl text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">Keuangan</span>
                    <Waves className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">finance123</div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-1">Siti Rahmawati</div>
                </button>
              </div>
            </div>

            {/* Security and Ownership Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Data persisten tersimpan di Server SQLite Database
              </span>
              <span className="font-semibold text-slate-700">
                Hak Milik: HILMY DAPVFOA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

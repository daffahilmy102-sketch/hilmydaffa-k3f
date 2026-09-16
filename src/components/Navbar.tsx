import React from 'react';
import {
  Anchor,
  Database,
  LogOut,
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  BarChart3,
  Shield,
  Ship,
  MapPin,
  Users,
  Tag,
} from 'lucide-react';
import { User, MainView, MasterSubView } from '../types';

interface NavbarProps {
  user?: User | null;
  currentUser?: User | null;
  currentView: MainView;
  masterSubView?: MasterSubView;
  onNavigate?: (view: MainView) => void;
  onSelectView?: (view: MainView) => void;
  onSelectMasterSubView?: (sub: MasterSubView) => void;
  onLogout: () => void;
  dbRecordsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentUser,
  currentView,
  masterSubView = 'ships',
  onNavigate,
  onSelectView,
  onSelectMasterSubView,
  onLogout,
  dbRecordsCount = 20,
}) => {
  const activeUser = user || currentUser;
  const handleNav = (v: MainView) => {
    if (onNavigate) onNavigate(v);
    if (onSelectView) onSelectView(v);
  };

  return (
    <header className="bg-white border-b border-sky-100 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Brand, Ownership & System Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Logo & Application Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  MINA LESTARI
                </span>
                <span className="hidden md:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Angkutan Laut
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistem Manajemen Kapal, Muatan, dan Transaksi Maritim
              </p>
            </div>
          </div>

          {/* Right Side: Ownership Badge & User Account */}
          <div className="flex items-center gap-3">
            {/* Real DB Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real SQLite Database ({dbRecordsCount} records)</span>
            </div>

            {/* Application Ownership Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-900 text-xs font-bold shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="hidden sm:inline text-sky-700 font-medium">Hak Milik:</span>
              <span className="text-blue-900 font-bold tracking-wide">HILMY DAPVFOA</span>
            </div>

            {/* User Pill */}
            {activeUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800">{activeUser.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {activeUser.role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Keluar dari Aplikasi"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
            <nav className="flex space-x-1 sm:space-x-2">
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('master')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'master'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Master Data</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('transaksi')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'transaksi'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Transaksi SPAL</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('laporan')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                  currentView === 'laporan'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Laporan & Analitik</span>
              </button>
            </nav>

            {/* Master Data Sub-selector pill when on Master view */}
            {currentView === 'master' && onSelectMasterSubView && (
              <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => onSelectMasterSubView('ships')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    masterSubView === 'ships'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Kapal</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMasterSubView('ports')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    masterSubView === 'ports'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pelabuhan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMasterSubView('customers')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    masterSubView === 'customers'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Pelanggan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMasterSubView('tariffs')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    masterSubView === 'tariffs'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tarif Komoditas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

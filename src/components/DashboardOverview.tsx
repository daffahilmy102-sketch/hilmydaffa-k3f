import React from 'react';
import {
  Ship,
  Navigation,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Database,
  ShieldCheck,
  Printer,
  Plus,
} from 'lucide-react';
import { Ship as ShipType, Shipment, Port, Customer, MainView } from '../types';

interface DashboardOverviewProps {
  ships: ShipType[];
  shipments: Shipment[];
  ports: Port[];
  customers: Customer[];
  onNavigate: (view: MainView) => void;
  onAddShipment: () => void;
  onAddShip: () => void;
  onPrintSpal: (s: Shipment) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  ships,
  shipments,
  ports,
  customers,
  onNavigate,
  onAddShipment,
  onAddShip,
  onPrintSpal,
}) => {
  const activeVoyages = shipments.filter((s) => s.status === 'Dalam Pelayaran');
  const pendingLoading = shipments.filter((s) => s.status === 'Menunggu Muat');
  const completedShipments = shipments.filter((s) => s.status === 'Selesai Bongkar Muat');
  const totalRevenue = shipments.reduce((acc, curr) => acc + curr.grand_total, 0);

  const activeShipsCount = ships.filter((s) => s.status === 'Aktif Berlayar').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-sky-900/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Ship className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-sky-100 mb-3">
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>Real Persistent Database (Single Source of Truth)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pusat Komando Maritim MINA LESTARI
          </h1>
          <p className="text-sm text-sky-100 mt-2 leading-relaxed">
            Sistem informasi terpadu operasional angkutan laut nusantara, pelayaran kargo peti kemas, curah, dan tanker.
            Tersimpan secara persisten pada basis data server untuk kesiapan produksi penuh.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAddShipment}
              className="px-4 py-2.5 bg-white hover:bg-sky-50 text-blue-900 font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Terbitkan SPAL Baru</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('transaksi')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <span>Lihat Semua Muatan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Realtime KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Armada Kapal</div>
            <div className="text-2xl font-black text-slate-900">{ships.length} Unit</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5">{activeShipsCount} Aktif Berlayar</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Muatan On Voyage</div>
            <div className="text-2xl font-black text-slate-900">{activeVoyages.length} SPAL</div>
            <div className="text-[11px] text-blue-700 font-semibold mt-0.5">{pendingLoading.length} Menunggu Muat</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Nilai Kontrak</div>
            <div className="text-2xl font-black text-slate-900">
              Rp {(totalRevenue / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} Jt
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{completedShipments.length} SPAL Selesai</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jaringan Pelabuhan</div>
            <div className="text-2xl font-black text-slate-900">{ports.length} Pelabuhan</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{customers.length} Mitra Shipper</div>
          </div>
        </div>
      </div>

      {/* Grid: Live Fleet Status & Recent Transaksi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Armada Kapal Laut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Ship className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Status Armada Kapal MINA LESTARI</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('master')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 transition cursor-pointer"
              >
                Kelola Kapal →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {ships.slice(0, 5).map((ship) => (
                <div key={ship.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{ship.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {ship.ship_type} • DWT {ship.dwt.toLocaleString('id-ID')} Ton • {ship.captain_name}
                    </div>
                    <div className="text-[11px] text-sky-700 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3" />
                      <span>{ship.location}</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        ship.status === 'Aktif Berlayar'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ship.status === 'Sandar Bongkar Muat'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ship.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onAddShip}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftarkan Armada Kapal Baru</span>
            </button>
          </div>
        </div>

        {/* Card 2: Transaksi Pelayaran Terkini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Transaksi SPAL / Muatan Terbaru</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('transaksi')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 transition cursor-pointer"
              >
                Semua SPAL →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {shipments.slice(0, 4).map((s) => (
                <div key={s.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-bold text-blue-900">{s.spal_number}</div>
                    <div className="font-bold text-slate-800 text-xs">{s.customer_name}</div>
                    <div className="text-[11px] text-slate-500">
                      {s.commodity_name} ({s.quantity} {s.unit}) • {s.ship_name}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {s.origin_port_name} ➔ {s.dest_port_name}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-extrabold text-slate-900 text-xs">
                      Rp {s.grand_total.toLocaleString('id-ID')}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Dalam Pelayaran'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : s.status === 'Selesai Bongkar Muat'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {s.status}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => onPrintSpal(s)}
                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 justify-end font-semibold cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak SPAL</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onAddShipment}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Surat Perjanjian Angkutan Laut (SPAL)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance & Ownership Footer Notice */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
          <span>
            Aplikasi Maritim <strong>MINA LESTARI</strong> dirancang tanpa ketergantungan LocalStorage.
            Seluruh data tersinkronisasi langsung ke Real Database SQLite Server secara persisten.
          </span>
        </div>
        <div className="font-bold text-blue-900 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 shrink-0">
          Hak Milik Aplikasi: HILMY DAPVFOA
        </div>
      </div>
    </div>
  );
};

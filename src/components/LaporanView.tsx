import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Ship,
  MapPin,
  Users,
  ShieldCheck,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { ReportOverview, Shipment, Ship as ShipType } from '../types';

interface LaporanViewProps {
  report: ReportOverview | null;
  shipments: Shipment[];
  ships: ShipType[];
  onRefresh: () => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  report,
  shipments,
  ships,
  onRefresh,
}) => {
  const [selectedShipId, setSelectedShipId] = useState('ALL');
  const [period, setPeriod] = useState('ALL');

  // Export all shipments data to CSV file
  const handleExportCSV = () => {
    if (shipments.length === 0) return;

    const headers = [
      'No SPAL',
      'Tanggal',
      'Pelanggan',
      'Kapal',
      'Pelabuhan Asal',
      'Pelabuhan Tujuan',
      'Komoditas',
      'Kuantitas',
      'Satuan',
      'Tarif Dasar',
      'Total Freight',
      'Biaya Asuransi',
      'Grand Total',
      'Status Muatan',
      'Status Pembayaran',
      'ETD',
      'ETA',
    ];

    const rows = shipments.map((s) => [
      `"${s.spal_number}"`,
      `"${s.date}"`,
      `"${s.customer_name}"`,
      `"${s.ship_name}"`,
      `"${s.origin_port_name}"`,
      `"${s.dest_port_name}"`,
      `"${s.commodity_name}"`,
      s.quantity,
      `"${s.unit}"`,
      s.freight_rate,
      s.total_freight,
      s.insurance_fee,
      s.grand_total,
      `"${s.status}"`,
      `"${s.payment_status}"`,
      `"${s.etd}"`,
      `"${s.eta}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Angkutan_Laut_Mina_Lestari_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRevenue = report?.summary?.total_revenue || shipments.reduce((a, b) => a + b.grand_total, 0);
  const totalVolume = report?.summary?.total_volume_shipped || shipments.reduce((a, b) => a + b.quantity, 0);
  const totalShipments = report?.summary?.total_shipments || shipments.length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Laporan Bisnis & Analitik Angkutan Laut</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Laporan Kinerja Keuangan & Volume Muatan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi resmi transaksi SPAL, utilitas armada kapal, dan pendapatan rute maritim MINA LESTARI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Data Laporan"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900">PT. MINA LESTARI - LAPORAN OPERASIONAL & KEUANGAN</h1>
        <p className="text-xs text-slate-600">Dicetak pada: {new Date().toLocaleString('id-ID')} | Hak Milik Aplikasi: HILMY DAPVFOA</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            Rp {(totalRevenue / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Milyar
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Akumulasi Real Database</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Muatan Laut</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalVolume.toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500">Ton / Box</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Dari seluruh armada aktif
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pelayaran (SPAL)</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalShipments} Dokumen
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            Kontrak sah antar-pelabuhan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Armada Kapal Siap</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {ships.filter((s) => s.status !== 'Docking / Perawatan').length} / {ships.length} Kapal
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Tingkat kesiapan operasional laut
          </p>
        </div>
      </div>

      {/* Grid: Revenue per Ship & Active Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Vessel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Ship className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Kontribusi Pendapatan per Armada Kapal</h3>
            </div>
          </div>

          <div className="space-y-3">
            {report?.shipBreakdown && report.shipBreakdown.length > 0 ? (
              report.shipBreakdown.map((item, idx) => {
                const percent = totalRevenue > 0 ? Math.round((item.ship_revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.ship_name}</span>
                      <span className="font-extrabold text-blue-900">
                        Rp {item.ship_revenue.toLocaleString('id-ID')} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{item.total_trips} Kali Pelayaran</span>
                      <span>Volume: {item.ship_volume.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">Belum ada riwayat pelayaran kapal.</div>
            )}
          </div>
        </div>

        {/* Top Active Port Routes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Rute Pelayaran Paling Aktif (Trayek)</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {report?.routeBreakdown && report.routeBreakdown.length > 0 ? (
              report.routeBreakdown.map((route, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{route.origin_port_name}</span>
                      <span className="text-sky-600">➔</span>
                      <span>{route.dest_port_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{route.trips} Pengiriman Berlayar</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-blue-900">
                      Rp {route.route_revenue.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">Rute Reguler</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">Belum ada data rute tercatat.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customer / Shippers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Mitra Pelanggan Utama (Top Shippers)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Nama Mitra Pelanggan</th>
                <th className="py-2.5 px-3">Frekuensi Pesanan SPAL</th>
                <th className="py-2.5 px-3">Total Belanja Freight</th>
                <th className="py-2.5 px-3">Status Hubungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.customerBreakdown && report.customerBreakdown.length > 0 ? (
                report.customerBreakdown.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{cust.customer_name}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{cust.orders} Kontrak</td>
                    <td className="py-3 px-3 font-black text-blue-950">
                      Rp {cust.total_spent.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Mitra Prioritas
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">
                    Belum ada riwayat pelanggan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Footer Notice */}
      <div className="p-4 bg-sky-50 border border-sky-200/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sky-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Laporan ini dihasilkan langsung dari Server Real Database SQLite MINA LESTARI tanpa perantara localStorage.</span>
        </div>
        <div className="font-bold text-blue-950">
          Hak Milik: HILMY DAPVFOA
        </div>
      </div>
    </div>
  );
};

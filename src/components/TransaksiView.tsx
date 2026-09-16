import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  Ship,
  Navigation,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Shipment, Ship as ShipType } from '../types';

interface TransaksiViewProps {
  shipments: Shipment[];
  ships: ShipType[];
  onAddShipment: () => void;
  onEditShipment: (shipment: Shipment) => void;
  onDeleteShipment: (id: number) => Promise<void>;
  onUpdateStatus: (id: number, status: Shipment['status'], paymentStatus?: Shipment['payment_status']) => Promise<void>;
  onPrintSpal: (shipment: Shipment) => void;
  onRefresh: () => void;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  shipments,
  ships,
  onAddShipment,
  onEditShipment,
  onDeleteShipment,
  onUpdateStatus,
  onPrintSpal,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [shipFilter, setShipFilter] = useState('ALL');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; spal: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.spal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ship_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin_port_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dest_port_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesShip = shipFilter === 'ALL' || String(s.ship_id) === shipFilter;

    return matchesSearch && matchesStatus && matchesShip;
  });

  const totalValue = filteredShipments.reduce((acc, curr) => acc + curr.grand_total, 0);
  const totalQty = filteredShipments.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await onDeleteShipment(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatus = async (id: number, newStatus: Shipment['status']) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickPayment = async (id: number, currentPayment: Shipment['payment_status']) => {
    const nextPayment: Shipment['payment_status'] =
      currentPayment === 'Belum Lunas'
        ? 'Uang Muka 50%'
        : currentPayment === 'Uang Muka 50%'
        ? 'Lunas'
        : 'Belum Lunas';

    setUpdatingId(id);
    try {
      const target = shipments.find((s) => s.id === id);
      if (target) {
        await onUpdateStatus(id, target.status, nextPayment);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Transaksi & Surat Perjanjian Angkutan Laut (SPAL)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Manajemen Transaksi Muatan & Pelayaran
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Menerbitkan manifest, kalkulasi freight kapal laut, tracking status, dan cetak dokumen resmi SPAL.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddShipment}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan SPAL Baru</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi SPAL</div>
            <div className="text-2xl font-black text-slate-900">{filteredShipments.length} SPAL</div>
            <div className="text-[11px] text-slate-500 font-medium">Vol: {totalQty.toLocaleString('id-ID')} unit/ton</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Omzet Kontrak SPAL</div>
            <div className="text-2xl font-black text-emerald-800">
              Rp {(totalValue / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Freight & Asuransi Maritim</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Berlayar (Voyage)</div>
            <div className="text-2xl font-black text-blue-900">
              {filteredShipments.filter((s) => s.status === 'Dalam Pelayaran').length} Muatan
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Monitoring posisi langsung</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no. SPAL, nama pelanggan, kapal, rute atau komoditas..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none"
          >
            <option value="ALL">Semua Status Muatan</option>
            <option value="Menunggu Muat">Menunggu Muat</option>
            <option value="Dalam Pelayaran">Dalam Pelayaran</option>
            <option value="Tiba di Pelabuhan Tujuan">Tiba di Pelabuhan Tujuan</option>
            <option value="Selesai Bongkar Muat">Selesai Bongkar Muat</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>

          {/* Ship Filter */}
          <select
            value={shipFilter}
            onChange={(e) => setShipFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold outline-none"
          >
            <option value="ALL">Semua Armada Kapal</option>
            {ships.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh dari Real Database"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hapus Transaksi SPAL</h3>
            <p className="text-sm text-slate-600 mt-2">
              Hapus transaksi <span className="font-bold text-slate-900">{deleteConfirm.spal}</span> secara permanen dari server database?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Menghapus...' : 'Hapus Transaksi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">No. SPAL & Tanggal</th>
                <th className="py-3.5 px-4">Pelanggan & Kapal</th>
                <th className="py-3.5 px-4">Rute Pelayaran</th>
                <th className="py-3.5 px-4">Komoditas & Muatan</th>
                <th className="py-3.5 px-4">Total Biaya (Freight)</th>
                <th className="py-3.5 px-4">Status & Jadwal</th>
                <th className="py-3.5 px-4">Pembayaran</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data transaksi SPAL yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-sky-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-900">{s.spal_number}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{s.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.customer_name}</div>
                      <div className="text-[11px] text-sky-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Ship className="w-3 h-3 shrink-0" />
                        <span>{s.ship_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-xs">
                        {s.origin_port_name}
                      </div>
                      <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                        <span>➔</span>
                        <span>{s.dest_port_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{s.commodity_name}</div>
                      <div className="text-[11px] font-bold text-slate-600">
                        {s.quantity.toLocaleString('id-ID')} {s.unit}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-blue-950 text-sm">
                        Rp {s.grand_total.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Freight: Rp {s.total_freight.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Fast status updater dropdown */}
                      <select
                        disabled={updatingId === s.id}
                        value={s.status}
                        onChange={(e) => handleQuickStatus(s.id, e.target.value as any)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer transition ${
                          s.status === 'Dalam Pelayaran'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : s.status === 'Selesai Bongkar Muat'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : s.status === 'Menunggu Muat'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : s.status === 'Tiba di Pelabuhan Tujuan'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="Menunggu Muat">Menunggu Muat</option>
                        <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                        <option value="Tiba di Pelabuhan Tujuan">Tiba di Tujuan</option>
                        <option value="Selesai Bongkar Muat">Selesai Bongkar</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                      <div className="text-[10px] text-slate-500 mt-1">
                        ETD: {s.etd} | ETA: {s.eta}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleQuickPayment(s.id, s.payment_status)}
                        title="Klik untuk ubah status pembayaran"
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer transition ${
                          s.payment_status === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : s.payment_status === 'Uang Muka 50%'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {s.payment_status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPrintSpal(s)}
                          title="Cetak Dokumen SPAL"
                          className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditShipment(s)}
                          title="Edit Transaksi"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ id: s.id, spal: s.spal_number })}
                          title="Hapus Transaksi"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

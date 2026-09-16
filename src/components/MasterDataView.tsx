import React, { useState } from 'react';
import {
  Ship,
  MapPin,
  Users,
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  Anchor,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { MasterSubView, Ship as ShipType, Port, Customer, Tariff } from '../types';

interface MasterDataViewProps {
  subView: MasterSubView;
  onSelectSubView: (sub: MasterSubView) => void;
  ships: ShipType[];
  ports: Port[];
  customers: Customer[];
  tariffs: Tariff[];
  onAddShip: () => void;
  onEditShip: (ship: ShipType) => void;
  onDeleteShip: (id: number) => Promise<void>;
  onAddPort: () => void;
  onEditPort: (port: Port) => void;
  onDeletePort: (id: number) => Promise<void>;
  onAddCustomer: () => void;
  onEditCustomer: (cust: Customer) => void;
  onDeleteCustomer: (id: number) => Promise<void>;
  onAddTariff: () => void;
  onEditTariff: (tariff: Tariff) => void;
  onDeleteTariff: (id: number) => Promise<void>;
  onRefresh: () => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  subView,
  onSelectSubView,
  ships,
  ports,
  customers,
  tariffs,
  onAddShip,
  onEditShip,
  onDeleteShip,
  onAddPort,
  onEditPort,
  onDeletePort,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddTariff,
  onEditTariff,
  onDeleteTariff,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'ship' | 'port' | 'customer' | 'tariff';
    id: number;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      if (deleteConfirm.type === 'ship') await onDeleteShip(deleteConfirm.id);
      if (deleteConfirm.type === 'port') await onDeletePort(deleteConfirm.id);
      if (deleteConfirm.type === 'customer') await onDeleteCustomer(deleteConfirm.id);
      if (deleteConfirm.type === 'tariff') await onDeleteTariff(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  // Filter lists based on search
  const filteredShips = ships.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.captain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ship_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPorts = ports.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTariffs = tariffs.filter(
    (t) =>
      t.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Title & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Anchor className="w-4 h-4" />
            <span>Master Data Operasional Angkutan Laut</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Manajemen Entitas Master (Real DB)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data tersimpan langsung dan terpusat pada server database SQLite MINA LESTARI.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onSelectSubView('ships')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subView === 'ships'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ship className="w-3.5 h-3.5 text-blue-600" />
            <span>Kapal ({ships.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSubView('ports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subView === 'ports'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Pelabuhan ({ports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSubView('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subView === 'customers'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Pelanggan ({customers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSubView('tariffs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subView === 'tariffs'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Tarif ({tariffs.length})</span>
          </button>
        </div>
      </div>

      {/* Control bar: Search and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari dalam Master ${subView}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            title="Muat Ulang dari Database"
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {subView === 'ships' && (
            <button
              type="button"
              onClick={onAddShip}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kapal Baru</span>
            </button>
          )}

          {subView === 'ports' && (
            <button
              type="button"
              onClick={onAddPort}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pelabuhan</span>
            </button>
          )}

          {subView === 'customers' && (
            <button
              type="button"
              onClick={onAddCustomer}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pelanggan</span>
            </button>
          )}

          {subView === 'tariffs' && (
            <button
              type="button"
              onClick={onAddTariff}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tarif Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Data</h3>
            <p className="text-sm text-slate-600 mt-2">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-900">{deleteConfirm.title}</span> secara permanen dari database?
            </p>
            {deleteError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {deleteError}
              </div>
            )}
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
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Menghapus...' : 'Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SHIPS (KAPAL) TABLE */}
      {subView === 'ships' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode & Kapal</th>
                  <th className="py-3 px-4">Jenis Kapal</th>
                  <th className="py-3 px-4">Kapasitas (DWT / TEUs)</th>
                  <th className="py-3 px-4">Nahkoda & Bendera</th>
                  <th className="py-3 px-4">Status & Posisi</th>
                  <th className="py-3 px-4 text-right">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data kapal yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredShips.map((ship) => (
                    <tr key={ship.id} className="hover:bg-sky-50/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ship.name}</div>
                        <div className="text-[11px] font-mono text-sky-700 font-semibold">{ship.code} • Thn {ship.year_built}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
                          {ship.ship_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{ship.dwt.toLocaleString('id-ID')} Ton DWT</div>
                        {ship.capacity_teus > 0 && (
                          <div className="text-[11px] text-slate-500">{ship.capacity_teus} TEUs Peti Kemas</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{ship.captain_name}</div>
                        <div className="text-[11px] text-slate-500">{ship.flag}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            ship.status === 'Aktif Berlayar'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ship.status === 'Sandar Bongkar Muat'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : ship.status === 'Standby di Pelabuhan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {ship.status}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{ship.location}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditShip(ship)}
                            title="Edit Data Kapal"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'ship',
                                id: ship.id,
                                title: ship.name,
                              })
                            }
                            title="Hapus Kapal"
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
      )}

      {/* TAB 2: PORTS (PELABUHAN) TABLE */}
      {subView === 'ports' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode & Pelabuhan</th>
                  <th className="py-3 px-4">Wilayah (Kota & Provinsi)</th>
                  <th className="py-3 px-4">Kedalaman Draft</th>
                  <th className="py-3 px-4">Fasilitas Dermaga</th>
                  <th className="py-3 px-4">Kontak Otoritas</th>
                  <th className="py-3 px-4 text-right">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPorts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data pelabuhan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredPorts.map((port) => (
                    <tr key={port.id} className="hover:bg-sky-50/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{port.name}</div>
                        <div className="text-[11px] font-mono text-sky-700 font-semibold">{port.code}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{port.city}</div>
                        <div className="text-[11px] text-slate-500">{port.province}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{port.draft_depth} Meter</span>
                        <div className="text-[11px] text-slate-500">Kedalaman alur</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                          {port.dock_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {port.contact_person || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditPort(port)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'port',
                                id: port.id,
                                title: port.name,
                              })
                            }
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
      )}

      {/* TAB 3: CUSTOMERS (PELANGGAN) TABLE */}
      {subView === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode & Mitra Pelanggan</th>
                  <th className="py-3 px-4">Kategori Industri</th>
                  <th className="py-3 px-4">Kontak Telepon</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Alamat Pergudangan</th>
                  <th className="py-3 px-4 text-right">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data mitra pelanggan.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-sky-50/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cust.name}</div>
                        <div className="text-[11px] font-mono text-sky-700 font-semibold">{cust.code}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                          {cust.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {cust.email}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate">
                        {cust.address}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditCustomer(cust)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'customer',
                                id: cust.id,
                                title: cust.name,
                              })
                            }
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
      )}

      {/* TAB 4: TARIFFS (TARIF KOMODITAS) TABLE */}
      {subView === 'tariffs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode Tarif</th>
                  <th className="py-3 px-4">Nama Komoditas Muatan</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4">Tarif Dasar Freight</th>
                  <th className="py-3 px-4">Catatan Ketentuan</th>
                  <th className="py-3 px-4 text-right">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTariffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data tarif komoditas.
                    </td>
                  </tr>
                ) : (
                  filteredTariffs.map((tariff) => (
                    <tr key={tariff.id} className="hover:bg-sky-50/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-800">
                        {tariff.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tariff.commodity_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {tariff.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-blue-900 text-sm">
                          Rp {tariff.base_rate.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-500"> / {tariff.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-sm truncate">
                        {tariff.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditTariff(tariff)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'tariff',
                                id: tariff.id,
                                title: tariff.commodity_name,
                              })
                            }
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
      )}
    </div>
  );
};

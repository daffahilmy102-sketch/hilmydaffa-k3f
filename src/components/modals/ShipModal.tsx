import React, { useState, useEffect } from 'react';
import { X, Ship, Save } from 'lucide-react';
import { Ship as ShipType } from '../../types';

interface ShipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shipData: Partial<ShipType>) => Promise<void>;
  editingShip?: ShipType | null;
}

export const ShipModal: React.FC<ShipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingShip,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [shipType, setShipType] = useState('Kontainer');
  const [dwt, setDwt] = useState<number | ''>('');
  const [capacityTeus, setCapacityTeus] = useState<number | ''>(0);
  const [yearBuilt, setYearBuilt] = useState<number | ''>(new Date().getFullYear());
  const [flag, setFlag] = useState('Indonesia');
  const [captainName, setCaptainName] = useState('');
  const [status, setStatus] = useState<ShipType['status']>('Aktif Berlayar');
  const [location, setLocation] = useState('Tanjung Priok, Jakarta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingShip) {
      setCode(editingShip.code);
      setName(editingShip.name);
      setShipType(editingShip.ship_type);
      setDwt(editingShip.dwt);
      setCapacityTeus(editingShip.capacity_teus || 0);
      setYearBuilt(editingShip.year_built);
      setFlag(editingShip.flag);
      setCaptainName(editingShip.captain_name);
      setStatus(editingShip.status);
      setLocation(editingShip.location);
    } else {
      setCode(`ML-K${Math.floor(10 + Math.random() * 90)}`);
      setName('');
      setShipType('Kontainer');
      setDwt(10000);
      setCapacityTeus(500);
      setYearBuilt(2020);
      setFlag('Indonesia');
      setCaptainName('');
      setStatus('Aktif Berlayar');
      setLocation('Pelabuhan Tanjung Priok');
    }
    setError(null);
  }, [editingShip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !captainName.trim() || !dwt) {
      setError('Harap isi semua kolom wajib (Kode, Nama Kapal, DWT, Nahkoda).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        code: code.trim(),
        name: name.trim(),
        ship_type: shipType,
        dwt: Number(dwt),
        capacity_teus: Number(capacityTeus || 0),
        year_built: Number(yearBuilt || 2020),
        flag,
        captain_name: captainName.trim(),
        status,
        location: location.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data kapal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sky-100">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingShip ? 'Edit Data Kapal Armada' : 'Tambah Kapal Baru (Armada MINA LESTARI)'}
              </h3>
              <p className="text-xs text-slate-500">Master Data Kapal Angkutan Laut Persisten di Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Kapal *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: ML-K05"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kapal *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: KM MINA LESTARI 05"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kapal *</label>
              <select
                value={shipType}
                onChange={(e) => setShipType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              >
                <option value="Kontainer">Kapal Peti Kemas (Kontainer)</option>
                <option value="Curah Kering">Kapal Kargo Curah Kering (Bulk Carrier)</option>
                <option value="Tanker CPO">Kapal Tanker (CPO / BBM)</option>
                <option value="Tongkang & Tugboat">Tongkang (Barge) & Tugboat</option>
                <option value="Kargo Perintis">Kapal Kargo Perintis / Ro-Ro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas Bobot Mati (DWT) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={dwt}
                  onChange={(e) => setDwt(Number(e.target.value))}
                  placeholder="12500"
                  className="w-full px-3.5 py-2 pr-12 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">Ton</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapasitas TEUs (Peti Kemas)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={capacityTeus}
                  onChange={(e) => setCapacityTeus(Number(e.target.value))}
                  placeholder="Contoh: 600"
                  className="w-full px-3.5 py-2 pr-14 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">TEUs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Pembuatan & Bendera</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Nahkoda (Captain) *</label>
              <input
                type="text"
                required
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Capt. Nama Nahkoda"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Operasional *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              >
                <option value="Aktif Berlayar">Aktif Berlayar (On Voyage)</option>
                <option value="Sandar Bongkar Muat">Sandar Bongkar Muat</option>
                <option value="Standby di Pelabuhan">Standby di Pelabuhan</option>
                <option value="Docking / Perawatan">Docking / Perawatan Berkala</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi / Posisi Saat Ini</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Laut Jawa Menuju Pelabuhan Tanjung Perak"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan ke DB...' : 'Simpan Kapal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

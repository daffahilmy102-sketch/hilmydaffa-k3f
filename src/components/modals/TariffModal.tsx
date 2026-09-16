import React, { useState, useEffect } from 'react';
import { X, Tag, Save } from 'lucide-react';
import { Tariff as TariffType } from '../../types';

interface TariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tariffData: Partial<TariffType>) => Promise<void>;
  editingTariff?: TariffType | null;
}

export const TariffModal: React.FC<TariffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTariff,
}) => {
  const [code, setCode] = useState('');
  const [commodityName, setCommodityName] = useState('');
  const [unit, setUnit] = useState('Kontainer');
  const [baseRate, setBaseRate] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTariff) {
      setCode(editingTariff.code);
      setCommodityName(editingTariff.commodity_name);
      setUnit(editingTariff.unit);
      setBaseRate(editingTariff.base_rate);
      setNotes(editingTariff.notes || '');
    } else {
      setCode(`TRF-${Math.floor(100 + Math.random() * 900)}`);
      setCommodityName('');
      setUnit('Kontainer');
      setBaseRate('');
      setNotes('');
    }
    setError(null);
  }, [editingTariff, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !commodityName.trim() || !baseRate) {
      setError('Kode, nama komoditas, dan tarif dasar wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        code: code.trim(),
        commodity_name: commodityName.trim(),
        unit,
        base_rate: Number(baseRate),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tarif');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-sky-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingTariff ? 'Edit Tarif Komoditas' : 'Tambah Komoditas & Tarif'}
              </h3>
              <p className="text-xs text-slate-500">Standar Biaya Angkutan Laut (Freight Rate)</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Tarif *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TRF-001"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Hitung *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="Kontainer">Per Kontainer (Box)</option>
                <option value="Ton">Per Ton Metrik</option>
                <option value="M3">Per M3 (CBM Kubikasi)</option>
                <option value="Kilogram">Per Kilogram (Kg)</option>
                <option value="Unit">Per Unit Kendaraan/Alat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Komoditas / Jenis Muatan *</label>
            <input
              type="text"
              required
              value={commodityName}
              onChange={(e) => setCommodityName(e.target.value)}
              placeholder="Contoh: Peti Kemas 20ft / Pasir Silika Curah"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tarif Dasar Freight (IDR) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-500">Rp</span>
              <input
                type="number"
                required
                min="1000"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value))}
                placeholder="6500000"
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Ketentuan Muatan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ketentuan demurrage, handling khusus pelabuhan..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
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
              <span>{loading ? 'Menyimpan...' : 'Simpan Tarif'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

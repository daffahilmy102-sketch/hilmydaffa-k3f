import React, { useState, useEffect } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import { Port as PortType } from '../../types';

interface PortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (portData: Partial<PortType>) => Promise<void>;
  editingPort?: PortType | null;
}

export const PortModal: React.FC<PortModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPort,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [draftDepth, setDraftDepth] = useState<number | ''>(12.0);
  const [dockType, setDockType] = useState('Terminal Peti Kemas & Kargo');
  const [contactPerson, setContactPerson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPort) {
      setCode(editingPort.code);
      setName(editingPort.name);
      setCity(editingPort.city);
      setProvince(editingPort.province);
      setDraftDepth(editingPort.draft_depth);
      setDockType(editingPort.dock_type);
      setContactPerson(editingPort.contact_person || '');
    } else {
      setCode('ID');
      setName('');
      setCity('');
      setProvince('');
      setDraftDepth(12.0);
      setDockType('Terminal Peti Kemas & Kargo');
      setContactPerson('');
    }
    setError(null);
  }, [editingPort, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !city.trim() || !province.trim()) {
      setError('Harap isi kode pelabuhan, nama, kota, dan provinsi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        city: city.trim(),
        province: province.trim(),
        draft_depth: Number(draftDepth || 10),
        dock_type: dockType,
        contact_person: contactPerson.trim() || '-',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pelabuhan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-sky-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingPort ? 'Edit Pelabuhan Singgah' : 'Tambah Pelabuhan Baru'}
              </h3>
              <p className="text-xs text-slate-500">Master Data Pelabuhan & Terminal Maritim</p>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode UN/LOCODE *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="IDTPP"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kedalaman Draft (Meter)</label>
              <input
                type="number"
                step="0.5"
                value={draftDepth}
                onChange={(e) => setDraftDepth(Number(e.target.value))}
                placeholder="14.5"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelabuhan / Terminal *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pelabuhan Tanjung Priok"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Daerah *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta Utara"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi *</label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="DKI Jakarta"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Dermaga / Fasilitas</label>
            <input
              type="text"
              value={dockType}
              onChange={(e) => setDockType(e.target.value)}
              placeholder="Terminal Peti Kemas & Kargo Umum"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kontak Otoritas / Pandu Pelabuhan</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Nama Petugas (No. HP / VHF Channel)"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
              <span>{loading ? 'Menyimpan...' : 'Simpan Pelabuhan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

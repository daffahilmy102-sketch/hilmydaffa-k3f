import React, { useState, useEffect } from 'react';
import { X, Users, Save } from 'lucide-react';
import { Customer as CustomerType } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (custData: Partial<CustomerType>) => Promise<void>;
  editingCustomer?: CustomerType | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCustomer,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Distributor Ekspedisi');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCustomer) {
      setCode(editingCustomer.code);
      setName(editingCustomer.name);
      setCategory(editingCustomer.category);
      setPhone(editingCustomer.phone);
      setEmail(editingCustomer.email);
      setAddress(editingCustomer.address);
    } else {
      setCode(`CUST-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setCategory('Distributor Ekspedisi');
      setPhone('');
      setEmail('');
      setAddress('');
    }
    setError(null);
  }, [editingCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !phone.trim()) {
      setError('Kode, nama mitra pelanggan, dan nomor telepon wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        code: code.trim(),
        name: name.trim(),
        category,
        phone: phone.trim(),
        email: email.trim() || '-',
        address: address.trim() || '-',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data pelanggan');
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingCustomer ? 'Edit Data Mitra Pelanggan' : 'Tambah Mitra / Shipper Baru'}
              </h3>
              <p className="text-xs text-slate-500">Master Data Pengirim & Penerima Muatan Kapal</p>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pelanggan *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CUST-005"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Usaha *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="Distributor Ekspedisi">Distributor Ekspedisi / Freight Forwarder</option>
                <option value="Hasil Bumi & Pertanian">Hasil Bumi, Perikanan & Pertanian</option>
                <option value="Agroindustri & CPO">Agroindustri & Kelapa Sawit (CPO)</option>
                <option value="Bahan Bangunan & Industri">Bahan Bangunan & Manufaktur Industri</option>
                <option value="BUMN & Proyek Nasional">BUMN & Kontraktor Logistik Nasional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Perusahaan / Shipper *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="PT Contoh Bahari Nusantara"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Telepon / WhatsApp *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="021-xxxxxx atau 0812xxxx"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Korespondensi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="logistik@perusahaan.co.id"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kantor / Pergudangan</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Pelabuhan Raya No. xx, Kota..."
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
              <span>{loading ? 'Menyimpan...' : 'Simpan Pelanggan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

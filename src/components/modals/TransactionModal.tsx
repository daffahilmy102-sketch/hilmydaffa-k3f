import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Save, Calculator } from 'lucide-react';
import { Shipment, Ship, Port, Customer, Tariff } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shipmentData: Partial<Shipment>) => Promise<void>;
  editingShipment?: Shipment | null;
  ships: Ship[];
  ports: Port[];
  customers: Customer[];
  tariffs: Tariff[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingShipment,
  ships,
  ports,
  customers,
  tariffs,
}) => {
  const [spalNumber, setSpalNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [shipId, setShipId] = useState<number | ''>('');
  const [originPortId, setOriginPortId] = useState<number | ''>('');
  const [destPortId, setDestPortId] = useState<number | ''>('');
  const [tariffId, setTariffId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [unit, setUnit] = useState('Kontainer');
  const [freightRate, setFreightRate] = useState<number | ''>(6500000);
  const [insuranceFee, setInsuranceFee] = useState<number | ''>(10000000);
  const [status, setStatus] = useState<Shipment['status']>('Menunggu Muat');
  const [paymentStatus, setPaymentStatus] = useState<Shipment['payment_status']>('Uang Muka 50%');
  const [etd, setEtd] = useState(new Date().toISOString().slice(0, 10));
  const [eta, setEta] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingShipment) {
      setSpalNumber(editingShipment.spal_number);
      setDate(editingShipment.date);
      setCustomerId(editingShipment.customer_id);
      setShipId(editingShipment.ship_id);
      setOriginPortId(editingShipment.origin_port_id);
      setDestPortId(editingShipment.dest_port_id);
      setTariffId(editingShipment.tariff_id);
      setQuantity(editingShipment.quantity);
      setUnit(editingShipment.unit);
      setFreightRate(editingShipment.freight_rate);
      setInsuranceFee(editingShipment.insurance_fee);
      setStatus(editingShipment.status);
      setPaymentStatus(editingShipment.payment_status);
      setEtd(editingShipment.etd);
      setEta(editingShipment.eta);
      setNotes(editingShipment.notes || '');
    } else {
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const currYear = new Date().getFullYear();
      const currMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      setSpalNumber(`SPAL/ML/${currYear}/${currMonth}/${randomSeq}`);
      setDate(new Date().toISOString().slice(0, 10));

      if (customers.length > 0) setCustomerId(customers[0].id);
      if (ships.length > 0) setShipId(ships[0].id);
      if (ports.length > 0) {
        setOriginPortId(ports[0].id);
        setDestPortId(ports.length > 1 ? ports[1].id : ports[0].id);
      }
      if (tariffs.length > 0) {
        setTariffId(tariffs[0].id);
        setUnit(tariffs[0].unit);
        setFreightRate(tariffs[0].base_rate);
      }
      setQuantity(50);
      setInsuranceFee(15000000);
      setStatus('Menunggu Muat');
      setPaymentStatus('Uang Muka 50%');
      setNotes('Muatan standar kargo laut antarpulau.');
    }
    setError(null);
  }, [editingShipment, isOpen, customers, ships, ports, tariffs]);

  // When tariff selection changes, update unit & base freight rate
  const handleTariffChange = (selectedTariffId: number) => {
    setTariffId(selectedTariffId);
    const selected = tariffs.find((t) => t.id === selectedTariffId);
    if (selected) {
      setUnit(selected.unit);
      setFreightRate(selected.base_rate);
    }
  };

  const calculatedFreight = Number(quantity || 0) * Number(freightRate || 0);
  const calculatedGrandTotal = calculatedFreight + Number(insuranceFee || 0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spalNumber.trim() || !customerId || !shipId || !originPortId || !destPortId || !tariffId || !quantity) {
      setError('Lengkapi semua data transaksi SPAL, kapal, rute pelabuhan, dan kuantitas.');
      return;
    }

    if (originPortId === destPortId) {
      setError('Pelabuhan asal dan pelabuhan tujuan tidak boleh sama.');
      return;
    }

    const selectedCust = customers.find((c) => c.id === Number(customerId));
    const selectedShip = ships.find((s) => s.id === Number(shipId));
    const selectedOrigin = ports.find((p) => p.id === Number(originPortId));
    const selectedDest = ports.find((p) => p.id === Number(destPortId));
    const selectedTariff = tariffs.find((t) => t.id === Number(tariffId));

    setLoading(true);
    setError(null);
    try {
      await onSave({
        spal_number: spalNumber.trim(),
        date,
        customer_id: Number(customerId),
        customer_name: selectedCust?.name || 'Mitra',
        ship_id: Number(shipId),
        ship_name: selectedShip?.name || 'KM MINA LESTARI',
        origin_port_id: Number(originPortId),
        origin_port_name: selectedOrigin?.name || 'Pelabuhan Asal',
        dest_port_id: Number(destPortId),
        dest_port_name: selectedDest?.name || 'Pelabuhan Tujuan',
        tariff_id: Number(tariffId),
        commodity_name: selectedTariff?.commodity_name || 'Muatan Umum',
        quantity: Number(quantity),
        unit,
        freight_rate: Number(freightRate),
        total_freight: calculatedFreight,
        insurance_fee: Number(insuranceFee || 0),
        grand_total: calculatedGrandTotal,
        status,
        payment_status: paymentStatus,
        etd,
        eta,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi SPAL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-sky-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingShipment ? 'Edit Transaksi Muatan Laut' : 'Terbitkan SPAL / Manifest Muatan Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Surat Perjanjian Angkutan Laut (SPAL) - MINA LESTARI
              </p>
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

          {/* SPAL Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor SPAL / Kontrak *</label>
              <input
                type="text"
                required
                value={spalNumber}
                onChange={(e) => setSpalNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-900 font-bold focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Terbit Transaksi *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Customer & Vessel assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shipper / Mitra Pelanggan *</label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">-- Pilih Pelanggan --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kapal Armada Ditugaskan *</label>
              <select
                required
                value={shipId}
                onChange={(e) => setShipId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">-- Pilih Kapal Armada --</option>
                {ships.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.ship_type} - {s.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Origin & Destination Ports */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pelabuhan Muat (Asal) *</label>
              <select
                required
                value={originPortId}
                onChange={(e) => setOriginPortId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">-- Pilih Pelabuhan Asal --</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pelabuhan Bongkar (Tujuan) *</label>
              <select
                required
                value={destPortId}
                onChange={(e) => setDestPortId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">-- Pilih Pelabuhan Tujuan --</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commodity & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Komoditas & Tarif *</label>
              <select
                required
                value={tariffId}
                onChange={(e) => handleTariffChange(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="">-- Pilih Komoditas & Tarif Dasar --</option>
                {tariffs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.commodity_name} - Rp {t.base_rate.toLocaleString('id-ID')} / {t.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Muatan ({unit}) *</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Freight Rate and Calculations */}
          <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Kalkulasi Biaya Angkutan Laut (Freight & Grand Total)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tarif Freight per {unit} (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={freightRate}
                  onChange={(e) => setFreightRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Biaya Asuransi & Dermaga (Rp)
                </label>
                <input
                  type="number"
                  value={insuranceFee}
                  onChange={(e) => setInsuranceFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-sky-200/60 text-xs">
              <div className="text-slate-600">
                Total Freight Muatan: <span className="font-bold text-slate-900">Rp {calculatedFreight.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-base font-extrabold text-blue-900">
                Grand Total: <span className="text-sky-700">Rp {calculatedGrandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* ETD, ETA, Status, Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Berangkat (ETD)</label>
              <input
                type="date"
                required
                value={etd}
                onChange={(e) => setEtd(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Tiba (ETA)</label>
              <input
                type="date"
                required
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Muatan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Menunggu Muat">Menunggu Muat</option>
                <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                <option value="Tiba di Pelabuhan Tujuan">Tiba di Tujuan</option>
                <option value="Selesai Bongkar Muat">Selesai Bongkar Muat</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Pembayaran</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Uang Muka 50%">Uang Muka 50%</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Khusus Muatan & Instruksi Nahkoda</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruksi penanganan kargo, surveyor tangki, asuransi tambahan..."
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
              <span>{loading ? 'Menyimpan SPAL...' : 'Terbitkan SPAL'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

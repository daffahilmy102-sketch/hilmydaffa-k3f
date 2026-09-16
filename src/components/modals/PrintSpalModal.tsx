import React from 'react';
import { X, Printer, Anchor, ShieldCheck } from 'lucide-react';
import { Shipment } from '../../types';

interface PrintSpalModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

export const PrintSpalModal: React.FC<PrintSpalModalProps> = ({
  isOpen,
  onClose,
  shipment,
}) => {
  if (!isOpen || !shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Modal Actions Bar (hidden when printing) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Printer className="w-4 h-4 text-sky-600" />
            <span>Pratinjau Cetak Surat Perjanjian Angkutan Laut (SPAL)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content (Printable area) */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white font-serif relative" id="printable-spal">
          {/* Subtle watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none rotate-[-30deg]">
            <span className="text-7xl font-extrabold uppercase tracking-widest text-slate-900">
              MINA LESTARI - HILMY DAPVFOA
            </span>
          </div>

          {/* Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-blue-800 text-white flex items-center justify-center font-sans">
                  <Anchor className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight font-sans">
                    PT. MINA LESTARI ANGKUTAN LAUT
                  </h1>
                  <p className="text-xs text-slate-600 font-sans font-medium">
                    Jasa Angkutan Laut Antar Pulau, Pelayaran Nusantara & Manajemen Muatan Kapal
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Terminal Maritim Nusantara, Dermaga Samudera Raya | Telp: (021) 558-7722 | Email: info@minalestari.com
                  </p>
                </div>
              </div>
              <div className="text-right font-sans">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Tanda Hak Milik Aplikasi</div>
                <div className="text-xs font-bold text-blue-900 px-2.5 py-1 bg-sky-50 border border-sky-200 rounded">
                  HILMY DAPVFOA
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold uppercase underline tracking-wider">
              SURAT PERJANJIAN ANGKUTAN LAUT (SPAL)
            </h2>
            <div className="text-xs text-slate-700 font-mono mt-1">
              Nomor: {shipment.spal_number}
            </div>
            <div className="text-xs text-slate-500 font-sans mt-0.5">
              Tanggal Diterbitkan: {shipment.date}
            </div>
          </div>

          {/* Parties involved */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs font-sans">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                PIHAK PERTAMA (PENGANGKUT / CARRIER):
              </div>
              <div className="font-semibold text-slate-900">PT. MINA LESTARI</div>
              <div className="text-slate-600 mt-0.5">Armada Kapal: <span className="font-bold text-slate-900">{shipment.ship_name}</span></div>
              <div className="text-slate-600">Sistem Database: SQLite Persisten (Real Database)</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                PIHAK KEDUA (PEMILIK MUATAN / SHIPPER):
              </div>
              <div className="font-semibold text-slate-900">{shipment.customer_name}</div>
              <div className="text-slate-600 mt-0.5">Status Pembayaran: <span className="font-bold text-emerald-700">{shipment.payment_status}</span></div>
              <div className="text-slate-600">Status SPAL: <span className="font-bold text-blue-800">{shipment.status}</span></div>
            </div>
          </div>

          {/* Voyage & Cargo Specifications Table */}
          <div className="mb-6 font-sans">
            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="p-2.5 font-bold w-1/3">Pelabuhan Muat (Origin Port)</td>
                  <td className="p-2.5 font-semibold text-slate-900">{shipment.origin_port_name}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold">Pelabuhan Bongkar (Destination Port)</td>
                  <td className="p-2.5 font-semibold text-slate-900">{shipment.dest_port_name}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="p-2.5 font-bold">Jenis Komoditas Muatan</td>
                  <td className="p-2.5 font-semibold text-slate-900">{shipment.commodity_name}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold">Volume / Jumlah Muatan</td>
                  <td className="p-2.5 font-semibold text-slate-900">{shipment.quantity.toLocaleString('id-ID')} {shipment.unit}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="p-2.5 font-bold">Tarif Freight Dasar</td>
                  <td className="p-2.5 font-semibold text-slate-900">Rp {shipment.freight_rate.toLocaleString('id-ID')} / {shipment.unit}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold">Subtotal Biaya Freight</td>
                  <td className="p-2.5 font-semibold text-slate-900">Rp {shipment.total_freight.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="p-2.5 font-bold">Biaya Asuransi Maritim & Dok</td>
                  <td className="p-2.5 font-semibold text-slate-900">Rp {shipment.insurance_fee.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="border-b-2 border-slate-400 bg-sky-50">
                  <td className="p-2.5 font-extrabold text-blue-900 text-sm">TOTAL BIAYA ANGKUTAN (GRAND TOTAL)</td>
                  <td className="p-2.5 font-extrabold text-blue-900 text-sm">Rp {shipment.grand_total.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold">Estimasi Keberangkatan (ETD)</td>
                  <td className="p-2.5 text-slate-800">{shipment.etd}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold">Estimasi Kedatangan (ETA)</td>
                  <td className="p-2.5 text-slate-800">{shipment.eta}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold align-top">Catatan Khusus Pengiriman</td>
                  <td className="p-2.5 text-slate-700 italic">{shipment.notes || 'Tidak ada catatan khusus.'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms summary */}
          <div className="text-[11px] font-sans text-slate-600 mb-8 space-y-1">
            <p>1. Perjanjian ini tunduk pada Kitab Undang-Undang Hukum Dagang (KUHD) dan Peraturan Pelayaran Niaga Indonesia.</p>
            <p>2. Pengangkut berhak menolak muatan berbahaya (dangerous goods) yang tidak disertai lembar MSDS resmi.</p>
            <p>3. Demurrage dan detention berlaku sesuai klausul batas waktu bongkar muat di pelabuhan tujuan.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center font-sans text-xs pt-4 border-t border-slate-200">
            <div>
              <div className="text-slate-600 mb-14">Pihak Pertama (Pengangkut)<br /><strong>PT. MINA LESTARI</strong></div>
              <div className="font-bold underline text-slate-900">HILMY DAPVFOA</div>
              <div className="text-[10px] text-slate-500">Direktur Utama / Hak Milik</div>
            </div>

            <div>
              <div className="text-slate-600 mb-14">Nahkoda Armada Kapal<br /><strong>{shipment.ship_name}</strong></div>
              <div className="font-bold underline text-slate-900">Capt. Nahkoda Bertugas</div>
              <div className="text-[10px] text-slate-500">Master of Vessel</div>
            </div>

            <div>
              <div className="text-slate-600 mb-14">Pihak Kedua (Pemilik Barang)<br /><strong>{shipment.customer_name}</strong></div>
              <div className="font-bold underline text-slate-900">( Kuasa Shipper / Consignee )</div>
              <div className="text-[10px] text-slate-500">Tanda Tangan & Cap Perusahaan</div>
            </div>
          </div>

          {/* Ownership footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-center font-sans text-[10px] text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Dokumen Resmi Diterbitkan oleh Aplikasi Bisnis Angkutan Laut MINA LESTARI - Hak Milik: HILMY DAPVFOA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

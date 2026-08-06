"use client";

import React, { useState, useEffect } from "react";
import { Receipt, RefreshCcw, X, Save, Truck, Boxes, FileText, Printer, Eye, Plus } from "lucide-react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function headers() {
  const h: any = { "Accept": "application/json" };
  const token = Cookies.get("auth_token");
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

const fmt = (n: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n || 0));

export default function TruckingInvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [asns, setAsns] = useState<any[]>([]);
  const [truckings, setTruckings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState<"asn" | "standalone">("asn");
  const [selectedAsn, setSelectedAsn] = useState<any>(null);
  const [invoiceType, setInvoiceType] = useState("trucking");
  const [calc, setCalc] = useState<any>(null);
  const [isCalcLoading, setIsCalcLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Standalone form (tanpa ASN)
  const [standForm, setStandForm] = useState({ trucking_company_id: "", trucking_fee: "", description: "" });

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [inv, asnRes, trRes] = await Promise.all([
        fetch(`${apiUrl}/trucking-invoices`, { headers: headers() }),
        fetch(`${apiUrl}/asns`, { headers: headers() }),
        fetch(`${apiUrl}/truckings`, { headers: headers() }),
      ]);
      const invData = await inv.json();
      const asnData = await asnRes.json();
      const trData = await trRes.json();
      setInvoices(invData.data || invData);
      setAsns(asnData.data || asnData);
      setTruckings(trData.data || trData);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = () => {
    setIsModalOpen(true);
    setInvoiceMode("asn");
    setSelectedAsn(null);
    setCalc(null);
    setInvoiceType("trucking");
    setStandForm({ trucking_company_id: truckings[0]?.id || "", trucking_fee: "", description: "" });
  };

  const generateStandalone = async () => {
    if (!standForm.trucking_company_id || !standForm.trucking_fee) {
      Swal.fire("Lengkapi", "Pilih trucking dan isi fee jasa trucking.", "warning");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/trucking-invoices/standalone`, {
        method: "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({
          trucking_company_id: standForm.trucking_company_id,
          trucking_fee: Number(standForm.trucking_fee),
          description: standForm.description,
          status: "UNPAID",
        }),
      });
      if (res.ok) {
        await res.json();
        Swal.fire("Berhasil", "Invoice trucking (tanpa ASN) dibuat.", "success");
        setIsModalOpen(false);
        fetchAll();
      } else { const el = await res.json(); Swal.fire("Gagal", el.message || "Gagal.", "error"); }
    } catch { Swal.fire("Error", "Gagal membuat invoice.", "error"); } finally { setIsSaving(false); }
  };

  const onAsnChange = async (asnId: any) => {
    const asn = asns.find(a => a.id === asnId);
    setSelectedAsn(asn);
    setCalc(null);
    if (!asn) return;
    setIsCalcLoading(true);
    try {
      const res = await fetch(`${apiUrl}/trucking-invoices/calculate/${asn.id}?type=trucking`, { headers: headers() });
      const data = await res.json();
      if (res.ok) setCalc(data);
      else { Swal.fire("Info", data.message || "ASN tidak memakai trucking milik kita.", "warning"); setCalc(null); }
    } catch { Swal.fire("Error", "Gagal menghitung.", "error"); } finally { setIsCalcLoading(false); }
  };

  const recalc = async () => {
    if (!selectedAsn) return;
    setIsCalcLoading(true);
    try {
      const res = await fetch(`${apiUrl}/trucking-invoices/calculate/${selectedAsn.id}?type=${invoiceType}`, { headers: headers() });
      const data = await res.json();
      if (res.ok) setCalc(data);
      else { setCalc(null); Swal.fire("Info", data.message || "Gagal.", "warning"); }
    } catch { Swal.fire("Error", "Gagal.", "error"); } finally { setIsCalcLoading(false); }
  };

  useEffect(() => { if (selectedAsn) recalc(); }, [invoiceType]);

  const generate = async () => {
    if (!selectedAsn) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/trucking-invoices/generate/${selectedAsn.id}`, {
        method: "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ type: invoiceType, status: "UNPAID" }),
      });
      if (res.ok) {
        await res.json();
        Swal.fire("Berhasil", "Invoice trucking dibuat.", "success");
        setIsModalOpen(false);
        fetchAll();
      } else { const el = await res.json(); Swal.fire("Gagal", el.message || "Gagal.", "error"); }
    } catch { Swal.fire("Error", "Gagal membuat invoice.", "error"); } finally { setIsSaving(false); }
  };

  const markPaid = async (inv: any) => {
    const res = await fetch(`${apiUrl}/trucking-invoices/${inv.id}`, {
      method: "PUT", headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    if (res.ok) { Swal.fire("Berhasil", "Invoice ditandai LUNAS.", "success"); fetchAll(); }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Receipt className="w-6 h-6 text-brand-500" /> Invoice Trucking
        </h1>
        <button onClick={openModal} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Buat Invoice
        </button>
      </div>
      <p className="text-sm text-gray-500 -mt-3">Invoice jasa trucking (trucking-saja) atau gabungan gudang + trucking. Hanya untuk ASN yang memakai trucking milik kita.</p>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500"><Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Belum ada invoice trucking.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="py-3 pr-4">No. Invoice</th>
                  <th className="py-3 pr-4">Tipe</th>
                  <th className="py-3 pr-4">ASN</th>
                  <th className="py-3 pr-4">Trucking</th>
                  <th className="py-3 pr-4">Jasa Trucking</th>
                  <th className="py-3 pr-4">Jasa Gudang</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4 font-semibold text-sm text-gray-800 dark:text-gray-100">{inv.invoice_number}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.invoice_type === 'combined' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}>
                        {inv.invoice_type === 'combined' ? 'GUDANG + TRUCKING' : 'TRUCKING'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300">{inv.asn?.asn_number || "-"}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300">{inv.company?.name || "-"}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-200">{fmt(inv.trucking_fee)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-200">{inv.invoice_type === 'combined' ? fmt(inv.warehouse_fee) : "-"}</td>
                    <td className="py-3 pr-4 text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(inv.total_amount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'}`}>{inv.status}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <a href={`/trucking/invoice/${inv.id}/print`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold mr-2"><Printer className="w-3.5 h-3.5" /> Cetak</a>
                      {inv.status !== 'PAID' && (
                        <button onClick={() => markPaid(inv)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold">Tandai Lunas</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="bg-brand-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Receipt className="w-5 h-5" /> Buat Invoice Trucking</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-brand-700 hover:bg-brand-800 p-1 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Mode: dengan ASN atau tanpa ASN */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Sumber Invoice</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setInvoiceMode("asn")}
                    className={`p-3 rounded-xl border text-left text-sm font-semibold transition-colors ${invoiceMode === 'asn' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                    📦 Dengan ASN
                    <span className="block text-[10px] font-normal text-gray-500">Terhubung ke manifest</span>
                  </button>
                  <button type="button" onClick={() => setInvoiceMode("standalone")}
                    className={`p-3 rounded-xl border text-left text-sm font-semibold transition-colors ${invoiceMode === 'standalone' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                    🚚 Tanpa ASN
                    <span className="block text-[10px] font-normal text-gray-500">Jasa trucking terpisah</span>
                  </button>
                </div>
              </div>

              {invoiceMode === "asn" ? (<>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pilih ASN (memakai trucking milik kita)</label>
                <select value={selectedAsn?.id || ""} onChange={(e) => onAsnChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white">
                  <option value="">-- Pilih ASN --</option>
                  {asns.map(a => <option key={a.id} value={a.id}>{a.asn_number} · {a.trucking_company?.name || a.trucking_company || "Tanpa trucking"}</option>)}
                </select>
              </div>

              {selectedAsn && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tipe Invoice</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setInvoiceType("trucking")}
                        className={`p-3 rounded-xl border text-left text-sm font-semibold transition-colors ${invoiceType === 'trucking' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        🚚 Jasa Trucking Saja
                        <span className="block text-[10px] font-normal text-gray-500">Hanya biaya trucking</span>
                      </button>
                      <button type="button" onClick={() => setInvoiceType("combined")}
                        className={`p-3 rounded-xl border text-left text-sm font-semibold transition-colors ${invoiceType === 'combined' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        🏭 + 🚛 Gudang & Trucking
                        <span className="block text-[10px] font-normal text-gray-500">Jasa gudang + trucking</span>
                      </button>
                    </div>
                  </div>

                  {isCalcLoading ? (
                    <div className="py-6 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div></div>
                  ) : calc ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/40 space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-gray-500 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Jasa Trucking</span><b>{fmt(calc.trucking_fee)}</b></div>
                      {invoiceType === 'combined' && (
                        <div className="flex items-center justify-between"><span className="text-gray-500 flex items-center gap-1"><Boxes className="w-3.5 h-3.5" /> Jasa Gudang</span><b>{fmt(calc.warehouse_fee)}</b></div>
                      )}
                      <div className="flex items-center justify-between text-gray-500"><span>Subtotal</span><span>{fmt(calc.subtotal)}</span></div>
                      <div className="flex items-center justify-between text-gray-500"><span>PPN 11%</span><span>{fmt(calc.ppn)}</span></div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-base font-bold text-gray-800 dark:text-gray-100"><span>Total</span><span className="text-brand-600 dark:text-brand-400">{fmt(calc.total_amount)}</span></div>
                      {calc.tarif && <p className="text-xs text-gray-500">Tarif: {calc.tarif.nama_tarif} ({fmt(calc.rate)}/{calc.tarif.rate_unit?.replace('_',' ')})</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400">ASN ini tidak memakai trucking milik kita. Pilih ASN lain.</p>
                  )}
                </>
              )}
              </>) : (
              /* Standalone form — tanpa ASN */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Trucking Company *</label>
                  <select value={standForm.trucking_company_id} onChange={(e) => setStandForm({ ...standForm, trucking_company_id: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white">
                    <option value="">-- Pilih Trucking --</option>
                    {truckings.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_ours ? " (Milik Kita)" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Fee Jasa Trucking (Rp) *</label>
                  <input type="number" min="0" value={standForm.trucking_fee} onChange={(e) => setStandForm({ ...standForm, trucking_fee: e.target.value })} placeholder="cth. 1500000" className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                  <textarea value={standForm.description} onChange={(e) => setStandForm({ ...standForm, description: e.target.value })} rows={2} placeholder="cth. Pengiriman LCL Jakarta - Cikarang" className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                {standForm.trucking_fee && Number(standForm.trucking_fee) > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/40 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-gray-500"><span>Subtotal</span><span>{fmt(standForm.trucking_fee)}</span></div>
                    <div className="flex items-center justify-between text-gray-500"><span>PPN 11%</span><span>{fmt(Number(standForm.trucking_fee) * 0.11)}</span></div>
                    <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-base font-bold text-gray-800 dark:text-gray-100"><span>Total</span><span className="text-brand-600 dark:text-brand-400">{fmt(Number(standForm.trucking_fee) * 1.11)}</span></div>
                  </div>
                )}
              </div>
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">Batal</button>
                {invoiceMode === "asn" ? (
                  <button onClick={generate} disabled={!calc || isSaving} className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Generate Invoice
                  </button>
                ) : (
                  <button onClick={generateStandalone} disabled={isSaving} className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Generate Invoice
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
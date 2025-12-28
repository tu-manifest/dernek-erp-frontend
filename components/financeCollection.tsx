"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Calendar, CreditCard, CheckCircle, UploadCloud, FileText, Layers, Wallet } from "lucide-react";
import { MaskedCurrencyInput } from "@/components/ui";
import useGetAllMembers from "../hooks/getAllMembers";
import useGetAllDonors from "../hooks/useGetAllDonors";
import useGetDebtorSummary from "../hooks/useGetDebtorSummary";
import { useSearchParams } from "next/navigation";

// --- Arayüz Tanımları ---
interface Borclu {
  id: number;
  ad: string;
  tur: "MEMBER" | "EXTERNAL";
}

export interface TahsilatFormData {
  borcluId: number;
  borcluTur: "MEMBER" | "EXTERNAL";
  borcluAd: string;
  tahsilatTarihi: string;
  tahsilatMiktari: string;
  paraCinsi: string;
  tahsilatSekli: "Kasa" | "Banka" | "Kredi Kartı" | "Diğer";
  dekontoNo: string;
  borcId?: number; // Tekil ödeme için
  aciklama: string;
  dekontDosyasiAdi?: string;
  isBulk?: boolean; // Toplu ödeme mi?
}

interface TahsilatKaydiFormProps {
  onSubmit: (data: TahsilatFormData) => void;
  isLoading?: boolean;
}

const currencySymbol = (c: string) =>
  ({ TL: "₺", TRY: "₺", USD: "$", EUR: "€", GBP: "£" }[c] ?? "₺");

export default function TahsilatKaydiForm({ onSubmit, isLoading = false }: TahsilatKaydiFormProps) {
  const searchParams = useSearchParams();
  const initialDebtId = searchParams.get('debtId');

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [formData, setFormData] = useState<TahsilatFormData>({
    borcluId: 0,
    borcluTur: "MEMBER",
    borcluAd: "",
    tahsilatTarihi: new Date().toISOString().split("T")[0],
    tahsilatMiktari: "",
    paraCinsi: "TL",
    tahsilatSekli: "Kasa",
    dekontoNo: "",
    borcId: initialDebtId ? Number(initialDebtId) : undefined,
    aciklama: "",
    dekontDosyasiAdi: "",
    isBulk: false
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showBorcluDropdown, setShowBorcluDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // API'den verileri çek
  const { members, isLoading: membersLoading } = useGetAllMembers();
  const { donors, isLoading: donorsLoading } = useGetAllDonors();

  // Seçili borçlunun borçlarını çek
  // Seçili borçlunun borçlarını çek
  const { summary, isLoading: summaryLoading } = useGetDebtorSummary(
    formData.borcluId ? formData.borcluTur : "MEMBER", // Prevent null type error if needed, or handle effectively. Hook handles null.
    formData.borcluId ? formData.borcluId : null
  );

  const debts = summary?.debts || [];

  // Borçluları birleştir
  const borcluListesi: Borclu[] = [
    ...members.map((m: any) => ({
      id: m.id,
      ad: m.fullName || `${m.firstName} ${m.lastName}`,
      tur: "MEMBER" as const
    })),
    ...donors.map((d: any) => ({
      id: d.id,
      ad: d.name,
      tur: "EXTERNAL" as const
    }))
  ];

  // Dışarı tıklandığında dropdown kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBorcluDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // URL'den gelen debtId varsa ve borçlu seçilmediyse... 
  // (Not: Gerçek senaryoda debtId'den borçluyu bulmak için API çağrısı gerekebilir, 
  // şimdilik basitleştirilmiş akış)

  const filteredBorcluler = borcluListesi.filter(b =>
    b.ad.toLowerCase().includes((searchTerm || formData.borcluAd).toLowerCase())
  );

  const selectedBorc = debts.find(b => b.id === Number(formData.borcId));

  // Borçlu seçimi
  const handleBorcluSecimi = (borclu: Borclu) => {
    setFormData(prev => ({
      ...prev,
      borcluId: borclu.id,
      borcluTur: borclu.tur,
      borcluAd: borclu.ad,
      borcId: undefined // Borçlu değişince seçili borcu sıfırla
    }));
    setSearchTerm("");
    setShowBorcluDropdown(false);
    clearError("borcluAd");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) clearError(name);
  };

  const handleTahsilatSekliChange = (sekil: TahsilatFormData["tahsilatSekli"]) => {
    setFormData(prev => ({
      ...prev,
      tahsilatSekli: sekil,
      dekontoNo: sekil !== "Banka" ? "" : prev.dekontoNo,
      dekontDosyasiAdi: sekil !== "Banka" ? "" : prev.dekontDosyasiAdi,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, dekontDosyasiAdi: file.name }));
    } else {
      setFormData(prev => ({ ...prev, dekontDosyasiAdi: "" }));
    }
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.borcluId) newErrors.borcluAd = "Borçlu seçimi gereklidir";
    if (!formData.tahsilatTarihi) newErrors.tahsilatTarihi = "Tahsilat tarihi gereklidir";
    if (!formData.tahsilatMiktari) newErrors.tahsilatMiktari = "Tahsilat miktarı gereklidir";
    if (formData.tahsilatMiktari && parseFloat(formData.tahsilatMiktari) <= 0)
      newErrors.tahsilatMiktari = "Tahsilat miktarı 0'dan büyük olmalıdır";

    if (formData.tahsilatSekli === "Banka" && !formData.dekontoNo && !formData.dekontDosyasiAdi)
      newErrors.dekontoNo = "Banka seçildiğinde dekont no veya dekont dosyası gereklidir";

    if (activeTab === 'single' && !formData.borcId)
      newErrors.borcId = "Ödeme yapılacak borç seçimi gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        isBulk: activeTab === 'bulk'
      });
    }
  };

  const apiLoading = membersLoading || donorsLoading;

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100">

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'single'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <CreditCard size={18} />
          Tekil Ödeme
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'bulk'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Layers size={18} />
          Toplu Ödeme
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${activeTab === 'single' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
          {activeTab === 'single' ? <CreditCard size={24} /> : <Wallet size={24} />}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">
            {activeTab === 'single' ? 'Borç Tahsilatı' : 'Toplu Tahsilat Dağıtımı'}
          </h3>
          <p className="text-sm text-slate-500">
            {activeTab === 'single'
              ? 'Belirli bir borca mahsuben ödeme alın.'
              : 'Toplam tutarı en eski borçtan başlayarak dağıtın.'}
          </p>
        </div>
      </div>

      {/* Borçlu Seçimi */}
      <div ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Borçlu <span className="text-red-500">*</span></label>

        <div className="relative">
          <div className={`flex items-center border rounded-md overflow-hidden ${errors.borcluAd ? "border-red-400" : "border-gray-200"} bg-white`}>
            <div className="px-3 text-gray-400"><User size={16} /></div>

            <input
              type="text"
              value={formData.borcluAd ? formData.borcluAd : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length >= 1) setShowBorcluDropdown(true);
                else setShowBorcluDropdown(false);

                if (formData.borcluAd) {
                  setFormData(prev => ({
                    ...prev,
                    borcluId: 0,
                    borcluAd: "",
                    borcluTur: "MEMBER",
                    borcId: undefined
                  }));
                }
              }}
              onFocus={() => { if (!formData.borcluAd) setShowBorcluDropdown(true); }}
              placeholder={apiLoading ? "Yükleniyor..." : "Borçlu adıyla arayın..."}
              disabled={apiLoading}
              className="flex-1 px-3 py-2 text-sm outline-none disabled:bg-gray-50"
            />

            <div className="flex items-center gap-2 px-2">
              {(formData.borcluAd || searchTerm) && (
                <button type="button" onClick={() => { setSearchTerm(""); setFormData(prev => ({ ...prev, borcluId: 0, borcluAd: "", borcluTur: "MEMBER", borcId: undefined })); setShowBorcluDropdown(false); }} className="p-1 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Temizle"><X size={16} /></button>
              )}
              <button type="button" onClick={() => setShowBorcluDropdown(s => !s)} className="px-3 py-2 bg-slate-50 border-l border-gray-100 text-sm text-slate-600 hover:bg-slate-100">Ara</button>
            </div>
          </div>

          {showBorcluDropdown && (
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredBorcluler.length > 0 ? (
                filteredBorcluler.map(borclu => (
                  <button key={`${borclu.tur}-${borclu.id}`} type="button" onClick={() => handleBorcluSecimi(borclu)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{borclu.ad}</p>
                      <p className="text-xs text-gray-500">{borclu.tur === "MEMBER" ? "Üye" : "Dış Bağışçı"}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">Borçlu bulunamadı</div>
              )}
            </div>
          )}
        </div>

        {errors.borcluAd && <p className="text-red-500 text-sm mt-2">{errors.borcluAd}</p>}

        {formData.borcluAd && (
          <div className="mt-3 flex items-center gap-3 bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="text-sm text-blue-900 font-medium">{formData.borcluAd}</div>
            <div className="ml-auto text-xs text-slate-500">Seçildi</div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  borcluId: 0,
                  borcluAd: "",
                  borcluTur: "MEMBER",
                  borcId: undefined
                }));
                setSearchTerm("");
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Grid: Tarih + Miktar + Para Cinsi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahsilat Tarihi <span className="text-red-500">*</span></label>
          <div className={`relative border rounded-md bg-white ${errors.tahsilatTarihi ? "border-red-400" : "border-gray-200"}`}>
            <input type="date" name="tahsilatTarihi" max={new Date().toISOString().split("T")[0]} value={formData.tahsilatTarihi} onChange={handleInputChange} className="w-full px-3 py-2 text-sm outline-none bg-transparent" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Calendar size={16} /></div>
          </div>
          {errors.tahsilatTarihi && <p className="text-red-500 text-sm mt-1">{errors.tahsilatTarihi}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahsilat Miktarı <span className="text-red-500">*</span></label>
          <MaskedCurrencyInput
            value={formData.tahsilatMiktari}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, tahsilatMiktari: value }));
              if (errors.tahsilatMiktari) clearError("tahsilatMiktari");
            }}
            currency={currencySymbol(formData.paraCinsi)}
            hasError={!!errors.tahsilatMiktari}
            placeholder="0,00"
          />
          {errors.tahsilatMiktari && <p className="text-red-500 text-sm mt-1">{errors.tahsilatMiktari}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Para Cinsi</label>
          <div className="relative border rounded-md bg-white border-gray-200">
            <select name="paraCinsi" value={formData.paraCinsi} onChange={handleInputChange} className="w-full px-3 py-2 text-sm outline-none bg-transparent">
              <option value="TL">TL (₺)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toplu Ödeme Uyarısı */}
      {activeTab === 'bulk' && summary && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-900">Toplam Açık Borç</span>
            <span className="text-lg font-bold text-purple-700">
              {(summary.remainingDebt ?? 0).toLocaleString('tr-TR')} {selectedBorc?.currency || 'TL'}
            </span>
          </div>
          <p className="text-xs text-purple-600">
            Yapacağınız ödeme eski borçlardan başlanarak otomatik olarak dağıtılacaktır. Borç toplamından fazla yatırılan tutar bağış olarak kaydedilecektir.
          </p>
        </div>
      )}

      {/* Tahsilat Şekli */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tahsilat Şekli <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["Kasa", "Banka", "Kredi Kartı", "Diğer"] as const).map(sekil => (
            <button
              key={sekil}
              type="button"
              onClick={() => handleTahsilatSekliChange(sekil)}
              className={`flex items-center gap-3 p-3 border rounded-lg text-sm text-left transition-all ${formData.tahsilatSekli === sekil
                ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-[1.02]"
                : "bg-white hover:bg-slate-50 border-gray-200 text-slate-700"
                }`}
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${formData.tahsilatSekli === sekil ? 'bg-white/20' : 'bg-slate-100'}`}>
                <CheckCircle size={14} />
              </span>
              <span className="font-medium">{sekil}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dekont No ve Dosya Yükleme */}
      {formData.tahsilatSekli === "Banka" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dekont No</label>
            <input
              type="text"
              name="dekontoNo"
              value={formData.dekontoNo}
              onChange={handleInputChange}
              placeholder="TR12 3456..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none ${errors.dekontoNo ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.dekontoNo && <p className="text-red-500 text-sm mt-1">{errors.dekontoNo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dekont Dosyası</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full px-4 py-2 flex items-center justify-center gap-2 border rounded-lg text-sm transition-colors ${formData.dekontDosyasiAdi ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                {formData.dekontDosyasiAdi ? <FileText size={16} /> : <UploadCloud size={16} />}
                {formData.dekontDosyasiAdi ? 'Dosya Seçildi' : 'Dosya Yükle'}
              </button>
              {formData.dekontDosyasiAdi && (
                <button
                  type="button"
                  onClick={() => { if (fileInputRef.current) fileInputRef.current.value = ''; setFormData(prev => ({ ...prev, dekontDosyasiAdi: '' })); }}
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 border border-red-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SADECE TEKİL ÖDEME: Hangi Borca Ödeme */}
      {activeTab === 'single' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ödenecek Borç Seçimi <span className="text-red-500">*</span></label>

          {formData.borcluId ? (
            debts.length > 0 ? (
              <>
                <div className={`relative border rounded-md bg-white ${errors.borcId ? "border-red-400" : "border-gray-200"}`}>
                  <select name="borcId" value={formData.borcId || ""} onChange={(e) => setFormData(prev => ({ ...prev, borcId: Number(e.target.value) }))} className="w-full px-3 py-2 text-sm outline-none bg-transparent">
                    <option value="">Borç Seçiniz</option>
                    {debts
                      .filter(d => d.status !== 'Paid') // Sadece ödenmemişleri göster
                      .map(borc => (
                        <option key={borc.id} value={borc.id}>
                          {borc.debtType} - Kalan: {(borc.remainingAmount ?? 0).toLocaleString()} {borc.currency} (Vade: {new Date(borc.dueDate).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </div>
                {errors.borcId && <p className="text-red-500 text-sm mt-1">{errors.borcId}</p>}

                {selectedBorc && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h4 className="font-semibold text-slate-800">Seçili Borç Detayı</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${selectedBorc.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {selectedBorc.status === 'Partial' ? 'Kısmi Ödenmiş' : 'Bekliyor'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Borç Türü</p>
                        <p className="font-medium text-gray-900">{selectedBorc.debtType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Toplam Tutar</p>
                        <p className="font-medium text-gray-900">{(selectedBorc.amount ?? 0).toLocaleString()} {selectedBorc.currency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Şimdiye Kadar Ödenen</p>
                        <p className="font-medium text-green-600">{(selectedBorc.collectedAmount ?? 0).toLocaleString()} {selectedBorc.currency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kalan Bakiye</p>
                        <p className="font-medium text-red-600 text-lg">
                          {(selectedBorc.remainingAmount ?? 0).toLocaleString()} {selectedBorc.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              summaryLoading ? <div className="p-4 bg-gray-50 text-gray-500 text-sm">Borçlar yükleniyor...</div> :
                <div className="p-4 bg-green-50 rounded-lg text-green-800 text-sm border border-green-100">Seçili borçlunun açık borcu bulunmamaktadır.</div>
            )
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm border border-yellow-100">Lütfen önce yukarıdan bir borçlu seçiniz.</div>
          )}
        </div>
      )}

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
        <textarea name="aciklama" value={formData.aciklama} onChange={handleInputChange} rows={3} placeholder="Tahsilat hakkında notlar..." className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white" />
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-2">
        <button type="submit" disabled={isLoading} className={`w-full md:w-auto px-8 py-3 rounded-lg text-white font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${activeTab === 'single'
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
          }`}>
          {isLoading ? "İşleniyor..." : activeTab === 'single' ? "Tahsilatı Kaydet" : "Toplu Tahsilatı Dağıt"}
        </button>
      </div>
    </form>
  );
}
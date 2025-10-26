"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Calendar, CreditCard, CheckCircle, UploadCloud, FileText } from "lucide-react";

// --- Arayüz Tanımları ---
interface Borclu {
  id: string;
  ad: string;
  tur: "uye" | "dis_kurum";
}

interface Borc {
  id: string;
  borcluId: string;
  borcTuru: string;
  borcBedeli: number;
  paraCinsi: string;
  odenmisMiktar: number;
  kalanMiktar: number;
}

export interface TahsilatFormData {
  borcluId: string;
  borcluAd: string;
  tahsilatTarihi: string;
  tahsilatMiktari: string;
  paraCinsi: string;
  tahsilatSekli: "Kasa" | "Banka" | "Kredi Kartı" | "Diğer";
  dekontoNo: string;
  borcId: string;
  aciklama: string;
  // Yeni: Dosya yüklemesi için gerçek dosyayı değil, adını tutacağız.
  dekontDosyasiAdi?: string;
}

interface TahsilatKaydiFormProps {
  onSubmit: (data: TahsilatFormData) => void;
  isLoading?: boolean;
}

const currencySymbol = (c: string) =>
  ({ TL: "₺", TRY: "₺", USD: "$", EUR: "€", GBP: "£" }[c] ?? "₺");

export default function TahsilatKaydiForm({ onSubmit, isLoading = false }: TahsilatKaydiFormProps) {
  const [formData, setFormData] = useState<TahsilatFormData>({
    borcluId: "",
    borcluAd: "",
    tahsilatTarihi: new Date().toISOString().split("T")[0],
    tahsilatMiktari: "",
    paraCinsi: "TL",
    tahsilatSekli: "Kasa",
    dekontoNo: "",
    borcId: "",
    aciklama: "",
    dekontDosyasiAdi: "", // Yeni state
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showBorcluDropdown, setShowBorcluDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [borcListesi, setBorcListesi] = useState<Borc[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Dosya yükleme referansı

  // Örnek borçlu listesi - API'den çekilecek
  const borcluListesi: Borclu[] = [
    { id: "1", ad: "Ahmet Yılmaz", tur: "uye" },
    { id: "2", ad: "Fatma Demir", tur: "uye" },
    { id: "3", ad: "Mehmet Kaya", tur: "uye" },
    { id: "4", ad: "ABC Ltd. Şti.", tur: "dis_kurum" },
    { id: "5", ad: "XYZ İnşaat A.Ş.", tur: "dis_kurum" }
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

  // Borçlu seçildiğinde borçları getir (örnek)
  useEffect(() => {
    if (formData.borcluId) {
      const ornekBorclar: Borc[] = [
        {
          id: "b1",
          borcluId: formData.borcluId,
          borcTuru: "Etkinlik katılım ücreti",
          borcBedeli: 5000,
          paraCinsi: "TL",
          odenmisMiktar: 2000,
          kalanMiktar: 3000
        },
        {
          id: "b2",
          borcluId: formData.borcluId,
          borcTuru: "Materyal alım ücreti",
          borcBedeli: 2500,
          paraCinsi: "TL",
          odenmisMiktar: 0,
          kalanMiktar: 2500
        }
      ];
      setBorcListesi(ornekBorclar);
      setFormData(prev => ({ ...prev, borcId: "" }));
    } else {
      setBorcListesi([]);
    }
  }, [formData.borcluId]);

  const filteredBorcluler = borcluListesi.filter(b =>
    b.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBorc = borcListesi.find(b => b.id === formData.borcId);

  const handleBorcluSecimi = (borclu: Borclu) => {
    setFormData({
      ...formData,
      borcluId: borclu.id,
      borcluAd: borclu.ad
    });
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length >= 1) setShowBorcluDropdown(true);
  };

  const handleTahsilatSekliChange = (sekil: TahsilatFormData["tahsilatSekli"]) => {
    setFormData(prev => ({
      ...prev,
      tahsilatSekli: sekil,
      dekontoNo: sekil !== "Banka" ? "" : prev.dekontoNo,
      // Banka dışı seçildiğinde dosya bilgisini de temizle
      dekontDosyasiAdi: sekil !== "Banka" ? "" : prev.dekontDosyasiAdi,
    }));
  };

  // Yeni: Dosya yükleme işlemi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Normalde bu aşamada dosyayı bir API'ye yüklerdiniz.
      // Şimdilik sadece dosya adını state'te tutuyoruz.
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
    
    // Banka seçildiğinde, ya dekont no ya da dosya eklenmiş olmalıdır.
    if (formData.tahsilatSekli === "Banka" && !formData.dekontoNo && !formData.dekontDosyasiAdi)
      newErrors.dekontoNo = "Banka seçildiğinde dekont no veya dekont dosyası gereklidir";
      
    if (!formData.borcId) newErrors.borcId = "Ödeme yapılacak borç seçimi gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-50 text-green-600">
          <CreditCard size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">Tahsilat Kaydı Oluştur</h3>
          <p className="text-sm text-slate-500">Borçlu seçin, tutarı girin ve tahsilat bilgilerini kaydedin.</p>
        </div>
      </div>

      {/* Borçlu Seçimi */}
      <div ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Borçlu Adı <span className="text-red-500">*</span></label>

        <div className={`flex items-center border rounded-md overflow-hidden ${errors.borcluAd ? "border-red-400" : "border-gray-200"} bg-white`}>
          <div className="px-3 text-gray-400"><User size={16} /></div>

          <input
            type="text"
            value={formData.borcluAd ? formData.borcluAd : searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.length >= 1) setShowBorcluDropdown(true);
              if (formData.borcluAd) setFormData(prev => ({ ...prev, borcluAd: "", borcluId: "", borcId: "" }));
            }}
            onFocus={() => { if (!formData.borcluAd) setShowBorcluDropdown(true); }}
            placeholder="Borçlu adıyla arayın..."
            className="flex-1 px-3 py-2 text-sm outline-none"
          />

          <div className="flex items-center gap-2 px-2">
            { (formData.borcluAd || searchTerm) && (
              <button type="button" onClick={() => { setSearchTerm(""); setFormData(prev => ({ ...prev, borcluAd: "", borcluId: "", borcId: "" })); setBorcListesi([]); }} className="p-1 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Temizle"><X size={16} /></button>
            )}
            <button type="button" onClick={() => setShowBorcluDropdown(s => !s)} className="px-3 py-2 bg-slate-50 border-l border-gray-100 text-sm text-slate-600 hover:bg-slate-100">Ara</button>
          </div>
        </div>

        {showBorcluDropdown && (
          <div className="absolute z-20 mt-2 w-[calc(100%-3rem)] md:w-[calc(33.333333%-1.5rem)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchTerm.length > 0 ? (
              filteredBorcluler.length ? (
                filteredBorcluler.map(borclu => (
                  <button key={borclu.id} type="button" onClick={() => handleBorcluSecimi(borclu)} className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b last:border-b-0 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{borclu.ad}</p>
                      <p className="text-xs text-gray-500">{borclu.tur === "uye" ? "Üye" : "Dış Kurum"}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${borclu.tur === "uye" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{borclu.tur === "uye" ? "Üye" : "Dış Kurum"}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">Borçlu bulunamadı</div>
              )
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500 text-center">Aramak için yazın...</div>
            )}
          </div>
        )}

        {errors.borcluAd && <p className="text-red-500 text-sm mt-2">{errors.borcluAd}</p>}

        {formData.borcluAd && (
          <div className="mt-3 flex items-center gap-3 bg-green-50 p-3 rounded-md border border-green-100">
            <div className="text-sm text-green-900 font-medium">{formData.borcluAd}</div>
            <div className="ml-auto text-xs text-slate-500">Seçildi</div>
            <button type="button" onClick={() => { setFormData(prev => ({ ...prev, borcluId: "", borcluAd: "", borcId: "" })); setSearchTerm(""); setBorcListesi([]); }} className="text-green-600 hover:text-green-800" aria-label="Seçimi kaldır"><X size={16} /></button>
          </div>
        )}
      </div>

      {/* Grid: Tarih + Miktar + Para Cinsi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahsilat Tarihi <span className="text-red-500">*</span></label>
          <div className={`relative border rounded-md bg-white ${errors.tahsilatTarihi ? "border-red-400" : "border-gray-200"}`}>
            <input type="date" name="tahsilatTarihi" max={new Date().toISOString().split("T")[0]} value={formData.tahsilatTarihi} onChange={handleInputChange} className="w-full px-3 py-2 text-sm outline-none bg-transparent" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={16} /></div>
          </div>
          {errors.tahsilatTarihi && <p className="text-red-500 text-sm mt-1">{errors.tahsilatTarihi}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahsilat Miktarı <span className="text-red-500">*</span></label>
          <div className={`flex items-center border rounded-md overflow-hidden bg-white ${errors.tahsilatMiktari ? "border-red-400" : "border-gray-200"}`}>
            <div className="px-3 text-gray-600 text-sm">{currencySymbol(formData.paraCinsi)}</div>
            <input type="number" name="tahsilatMiktari" value={formData.tahsilatMiktari} onChange={handleInputChange} step="0.01" min="0" placeholder="0.00" className="flex-1 px-3 py-2 text-sm outline-none" />
          </div>
          {errors.tahsilatMiktari && <p className="text-red-500 text-sm mt-1">{errors.tahsilatMiktari}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Para Cinsi</label>
          <div className={`relative border rounded-md bg-white ${errors.tahsilatMiktari ? "border-red-400" : "border-gray-200"}`}>
            <select name="paraCinsi" value={formData.paraCinsi} onChange={handleInputChange} className="w-full px-3 py-2 text-sm outline-none bg-transparent">
              <option value="TL">TL (₺)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tahsilat Şekli */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Tahsilat Şekli <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["Kasa", "Banka", "Kredi Kartı", "Diğer"] as const).map(sekil => (
            <button
              key={sekil}
              type="button"
              onClick={() => handleTahsilatSekliChange(sekil)}
              className={`flex items-center gap-3 p-3 border rounded-lg text-sm text-left transition-colors ${formData.tahsilatSekli === sekil ? "bg-green-600 text-white border-green-600 shadow" : "bg-white hover:bg-green-50 border-gray-200"}`}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-white/30">
                <CheckCircle size={16} />
              </span>
              <div>
                <div className="font-medium">{sekil}</div>
                {sekil === "Banka" && <div className="text-xs text-white/80">Dekont gerekli</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dekont No ve Dosya Yükleme (Banka seçildiğinde) */}
      {formData.tahsilatSekli === "Banka" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dekont No Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dekont No (Opsiyonel)</label>
              <input 
                type="text" 
                name="dekontoNo" 
                value={formData.dekontoNo} 
                onChange={handleInputChange} 
                placeholder="Dekont numarasını girin..." 
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 outline-none ${errors.dekontoNo ? "border-red-400" : "border-gray-200"}`} 
              />
              {errors.dekontoNo && <p className="text-red-500 text-sm mt-1">{errors.dekontoNo}</p>}
            </div>

            {/* Dosya Yükleme */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dekont Dosyası (PDF/Resim)</label>
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
                        {formData.dekontDosyasiAdi ? 'Dosya Seçildi' : 'Dosya Seç'}
                    </button>
                    {formData.dekontDosyasiAdi && (
                        <button 
                            type="button" 
                            onClick={() => { fileInputRef.current!.value = ''; setFormData(prev => ({...prev, dekontDosyasiAdi: ''})); }} 
                            className="p-2 rounded-full text-red-500 hover:bg-red-50"
                            aria-label="Dosyayı kaldır"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                {formData.dekontDosyasiAdi && <p className="text-xs text-gray-500 mt-1 truncate">{formData.dekontDosyasiAdi}</p>}
            </div>
        </div>
      )}

      {/* Hangi Borca Ödeme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hangi Borca Ödeme Yapılacak <span className="text-red-500">*</span></label>

        {formData.borcluId ? ( // Borçlu seçiliyse borç listesini göster
          borcListesi.length > 0 ? (
            <>
              <div className={`relative border rounded-md bg-white ${errors.borcId ? "border-red-400" : "border-gray-200"}`}>
                <select name="borcId" value={formData.borcId} onChange={handleInputChange} className="w-full px-3 py-2 text-sm outline-none bg-transparent">
                  <option value="">Borç Seçiniz</option>
                  {borcListesi.map(borc => (
                    <option key={borc.id} value={borc.id}>
                      {borc.borcTuru} - Kalan: {borc.kalanMiktar} {borc.paraCinsi}
                    </option>
                  ))}
                </select>
              </div>
              {errors.borcId && <p className="text-red-500 text-sm mt-1">{errors.borcId}</p>}

              {selectedBorc && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-3 border border-green-100">
                  <h4 className="font-semibold text-slate-900">Borç Detayları</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Borç Türü</p>
                      <p className="font-medium text-gray-900">{selectedBorc.borcTuru}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Toplam Borç</p>
                      <p className="font-medium text-gray-900">{selectedBorc.borcBedeli} {selectedBorc.paraCinsi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ödenen Miktar</p>
                      <p className="font-medium text-green-700">{selectedBorc.odenmisMiktar} {selectedBorc.paraCinsi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kalan Miktar</p>
                      <p className="font-medium text-orange-700">{selectedBorc.kalanMiktar} {selectedBorc.paraCinsi}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
             <div className="p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">Seçili borçlunun ödenmemiş borcu bulunmamaktadır.</div>
          )
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm">Borçlu seçiniz, borç listesi yüklenecektir.</div>
        )}
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
        <textarea name="aciklama" value={formData.aciklama} onChange={handleInputChange} rows={3} placeholder="Tahsilat hakkında ek bilgi..." className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-green-200 outline-none bg-white" />
      </div>

      {/* Actions - ortaya hizalı */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
        <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-md transition-shadow shadow-sm disabled:opacity-60">
          {isLoading ? "Kaydediliyor..." : "Tahsilat Kaydını Oluştur"}
        </button>

        <button type="button" onClick={() => { setFormData({ borcluId: "", borcluAd: "", tahsilatTarihi: new Date().toISOString().split("T")[0], tahsilatMiktari: "", paraCinsi: "TL", tahsilatSekli: "Kasa", dekontoNo: "", borcId: "", aciklama: "" }); setSearchTerm(""); setErrors({}); setBorcListesi([]); }} className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50">
          Temizle
        </button>
      </div>
    </form>
  );
}
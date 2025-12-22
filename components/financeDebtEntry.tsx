"use client";

import { useState, useEffect, useRef } from "react";
import { X, User } from "lucide-react";
import useGetAllMembers from "../hooks/getAllMembers";
import useGetAllDonors from "../hooks/useGetAllDonors";

interface Borclu {
  id: number;
  ad: string;
  tur: "uye" | "dis_kurum";
}

interface BorcFormData {
  borcluId: number;
  borcluTur: "uye" | "dis_kurum";
  borcluAd: string;
  borcTuru: string;
  borcBedeli: string;
  paraCinsi: string;
  vadeTarihi: string;
  aciklama: string;
}

interface BorcGirisiFormProps {
  onSubmit: (data: BorcFormData) => void;
  isLoading?: boolean;
}

const borcTurleri = [
  "Etkinlik Katılım Ücreti",
  "Materyal Alım Ücreti",
  "Kiralama/Tesis Kullanım Ücreti",
  "Bağış Sözü",
  "Kampanya Taahüdü",
  "Vakıf/Hibe Sözü",
  "Tazminat Hasar Bedeli",
  "Sözleşme İhlali Bedeli",
  "Devlet İadesi",
  "Sigorta Hasar Bedeli",
  "Fon Toplama Etkinliği Geliri",
  "Ayni Bağış Değeri"
];

const currencySymbol = (c: string) =>
  ({ TL: "₺", TRY: "₺", USD: "$", EUR: "€", GBP: "£" }[c] ?? "₺");

export default function BorcGirisiForm({ onSubmit, isLoading = false }: BorcGirisiFormProps) {
  const [formData, setFormData] = useState<BorcFormData>({
    borcluId: 0,
    borcluTur: "uye",
    borcluAd: "",
    borcTuru: "",
    borcBedeli: "",
    paraCinsi: "TL",
    vadeTarihi: "",
    aciklama: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showBorcluDropdown, setShowBorcluDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // API'den üyeleri ve dış bağışçıları çek
  const { members, isLoading: membersLoading } = useGetAllMembers();
  const { donors, isLoading: donorsLoading } = useGetAllDonors();

  // Üyeler ve dış bağışçıları birleştir
  const borcluListesi: Borclu[] = [
    ...members.map((m: any) => ({
      id: m.id,
      ad: m.fullName || `${m.firstName} ${m.lastName}`,
      tur: "uye" as const
    })),
    ...donors.map((d: any) => ({
      id: d.id,
      ad: d.name,
      tur: "dis_kurum" as const
    }))
  ];

  // Dışarı tıklamada dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBorcluDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBorcluler = borcluListesi.filter(b =>
    b.ad.toLowerCase().includes((searchTerm || formData.borcluAd).toLowerCase())
  );

  const handleBorcluSecimi = (borclu: Borclu) => {
    setFormData({
      ...formData,
      borcluId: borclu.id,
      borcluTur: borclu.tur,
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      clearError(name);
    }
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.borcluId) newErrors.borcluAd = "Borçlu seçimi gereklidir";
    if (!formData.borcTuru) newErrors.borcTuru = "Borç türü seçimi gereklidir";
    if (!formData.borcBedeli) newErrors.borcBedeli = "Borç bedeli gereklidir";
    if (formData.borcBedeli && parseFloat(formData.borcBedeli) <= 0)
      newErrors.borcBedeli = "Borç bedeli 0'dan büyük olmalıdır";
    if (!formData.vadeTarihi) newErrors.vadeTarihi = "Vade tarihi gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const apiLoading = membersLoading || donorsLoading;

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100">
      {/* Borçlu Seçimi */}
      <div ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Borçlu <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className={`flex items-center border rounded-md overflow-hidden ${errors.borcluAd ? "border-red-400" : "border-gray-200"} bg-white`}>
            <div className="px-3 text-gray-400">
              <User size={16} />
            </div>

            <input
              type="text"
              value={formData.borcluAd ? formData.borcluAd : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length >= 1) {
                  setShowBorcluDropdown(true);
                } else {
                  setShowBorcluDropdown(false);
                }
                if (formData.borcluAd) {
                  setFormData(prev => ({ ...prev, borcluId: 0, borcluAd: "", borcluTur: "uye" }));
                }
              }}
              onFocus={() => {
                if (!formData.borcluAd) setShowBorcluDropdown(true);
              }}
              placeholder={apiLoading ? "Yükleniyor..." : "Borçlu adı yazarak arayın..."}
              disabled={apiLoading}
              className="flex-1 px-3 py-2 outline-none text-sm disabled:bg-gray-50"
            />

            <div className="flex items-center gap-2 px-2">
              {(formData.borcluAd || searchTerm) && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(""); setFormData(prev => ({ ...prev, borcluId: 0, borcluAd: "", borcluTur: "uye" })); setShowBorcluDropdown(false); }}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                  aria-label="Temizle"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowBorcluDropdown(s => !s)}
                className="px-3 py-2 bg-slate-50 border-l border-gray-100 text-sm text-slate-600 hover:bg-slate-100"
              >
                Ara
              </button>
            </div>
          </div>

          {showBorcluDropdown && (
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {apiLoading ? (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  Yükleniyor...
                </div>
              ) : filteredBorcluler.length > 0 ? (
                filteredBorcluler.map(borclu => (
                  <button
                    key={`${borclu.tur}-${borclu.id}`}
                    type="button"
                    onClick={() => handleBorcluSecimi(borclu)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{borclu.ad}</p>
                      <p className="text-xs text-gray-500">
                        {borclu.tur === "uye" ? "Üye" : "Dış Bağışçı"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${borclu.tur === "uye" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {borclu.tur === "uye" ? "Üye" : "Dış Bağışçı"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  Borçlu bulunamadı
                </div>
              )}
            </div>
          )}
        </div>

        {errors.borcluAd && (
          <p className="text-red-500 text-sm mt-2">{errors.borcluAd}</p>
        )}

        {formData.borcluAd && (
          <div className="mt-3 flex items-center gap-3 bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="text-sm text-blue-900 font-medium">{formData.borcluAd}</div>
            <span className={`text-xs px-2 py-1 rounded ${formData.borcluTur === "uye" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
              {formData.borcluTur === "uye" ? "Üye" : "Dış Bağışçı"}
            </span>
            <div className="ml-auto text-xs text-slate-500">Seçildi</div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  borcluId: 0,
                  borcluAd: "",
                  borcluTur: "uye"
                }));
                setSearchTerm("");
              }}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Seçimi kaldır"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Borç Türü <span className="text-red-500">*</span>
          </label>
          <div className={`relative border rounded-md bg-white ${errors.borcTuru ? "border-red-400" : "border-gray-200"}`}>
            <select
              name="borcTuru"
              value={formData.borcTuru}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm outline-none appearance-none bg-transparent"
            >
              <option value="">Borç Türü Seçiniz</option>
              {borcTurleri.map(tur => (
                <option key={tur} value={tur}>
                  {tur}
                </option>
              ))}
            </select>
          </div>
          {errors.borcTuru && <p className="text-red-500 text-sm mt-1">{errors.borcTuru}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vade Tarihi <span className="text-red-500">*</span>
          </label>
          <div className={`relative border rounded-md bg-white ${errors.vadeTarihi ? "border-red-400" : "border-gray-200"}`}>
            <input
              type="date"
              name="vadeTarihi"
              value={formData.vadeTarihi}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm outline-none bg-transparent"
            />
          </div>
          {errors.vadeTarihi && <p className="text-red-500 text-sm mt-1">{errors.vadeTarihi}</p>}
        </div>
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Borç Bedeli <span className="text-red-500">*</span>
          </label>

          <div className={`flex items-center border rounded-md overflow-hidden bg-white ${errors.borcBedeli ? "border-red-400" : "border-gray-200"}`}>
            <div className="px-3 text-gray-600 text-sm">{currencySymbol(formData.paraCinsi)}</div>
            <input
              type="number"
              name="borcBedeli"
              value={formData.borcBedeli}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
          </div>

          {errors.borcBedeli && <p className="text-red-500 text-sm mt-1">{errors.borcBedeli}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para Cinsi
          </label>
          <div className="relative border rounded-md bg-white border-gray-200">
            <select
              name="paraCinsi"
              value={formData.paraCinsi}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm outline-none bg-transparent"
            >
              <option value="TL">TL (₺)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
        <textarea
          name="aciklama"
          value={formData.aciklama}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
          placeholder="Borç hakkında ek bilgi yazın..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Kaydediliyor..." : "Borcu Kaydet"}
        </button>
      </div>
    </form>
  );
}
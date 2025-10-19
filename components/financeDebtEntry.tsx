"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import Link from "next/link";

interface Borclu {
  id: string;
  ad: string;
  tur: "uye" | "dis_kurum";
}

export default function BorcGirisiForm() {
  const [formData, setFormData] = useState({
    borcluId: "",
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

  // Örnek borçlu listesi
  const [borcluListesi] = useState<Borclu[]>([
    { id: "1", ad: "Ahmet Yılmaz", tur: "uye" },
    { id: "2", ad: "Fatma Demir", tur: "uye" },
    { id: "3", ad: "Mehmet Kaya", tur: "uye" },
    { id: "4", ad: "ABC Ltd. Şti.", tur: "dis_kurum" },
    { id: "5", ad: "XYZ İnşaat A.Ş.", tur: "dis_kurum" }
  ]);

  const borcTurleri = [
    "Etkinlik katılım ücreti",
    "Materyal alım ücreti",
    "Kiralama/tesis kullanım ücreti",
    "Bağış Sözü",
    "Kampanya Taahüdü",
    "Vakıf/Hibe sözü",
    "Tazminat Hasar bedeli",
    "Sözleşme ihlali Bedeli",
    "Devlet iadesi",
    "Sigorta Hasar Bedeli",
    "Fon Toplama etkinliği geliri",
    "Ayni Bağış Değeri"
  ];

  // Borçlu arama
  const filteredBorcluler = borcluListesi.filter(b =>
    b.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBorcluSecimi = (borclu: Borclu) => {
    setFormData({
      ...formData,
      borcluId: borclu.id,
      borcluAd: borclu.ad
    });
    setSearchTerm("");
    setShowBorcluDropdown(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.borcluId) newErrors.borcluAd = "Borçlu seçimi gereklidir";
    if (!formData.borcTuru) newErrors.borcTuru = "Borç türü seçimi gereklidir";
    if (!formData.borcBedeli) newErrors.borcBedeli = "Borç bedeli gereklidir";
    if (parseFloat(formData.borcBedeli) <= 0)
      newErrors.borcBedeli = "Borç bedeli 0'dan büyük olmalıdır";
    if (!formData.vadeTarihi) newErrors.vadeTarihi = "Vade tarihi gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Borç Kaydı:", formData);
      alert("Borç başarıyla kaydedildi!");
      // 🔹 Buraya API çağrısı eklenecek
      setFormData({
        borcluId: "",
        borcluAd: "",
        borcTuru: "",
        borcBedeli: "",
        paraCinsi: "TL",
        vadeTarihi: "",
        aciklama: ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Borçlu Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Borçlu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.borcluAd || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.length >= 1) {
                setShowBorcluDropdown(true);
              }
            }}
            onFocus={() => setShowBorcluDropdown(true)}
            placeholder="Borçlu adı yazarak arayın..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.borcluAd ? "border-red-500" : "border-gray-300"
            }`}
          />

          {/* Dropdown */}
          {showBorcluDropdown && (filteredBorcluler.length > 0 || searchTerm) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredBorcluler.length > 0 ? (
                filteredBorcluler.map(borclu => (
                  <button
                    key={borclu.id}
                    type="button"
                    onClick={() => handleBorcluSecimi(borclu)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{borclu.ad}</p>
                      <p className="text-xs text-gray-500">
                        {borclu.tur === "uye" ? "Üye" : "Dış Kurum"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      borclu.tur === "uye"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {borclu.tur === "uye" ? "Üye" : "Dış Kurum"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Borçlu bulunamadı
                </div>
              )}
            </div>
          )}
        </div>
        {errors.borcluAd && (
          <p className="text-red-500 text-sm mt-1">{errors.borcluAd}</p>
        )}
        {formData.borcluAd && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <p className="text-sm text-blue-900 font-medium">{formData.borcluAd}</p>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  borcluId: "",
                  borcluAd: ""
                }));
                setSearchTerm("");
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Borç Türü */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Borç Türü <span className="text-red-500">*</span>
        </label>
        <select
          name="borcTuru"
          value={formData.borcTuru}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.borcTuru ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Borç Türü Seçiniz</option>
          {borcTurleri.map(tur => (
            <option key={tur} value={tur}>
              {tur}
            </option>
          ))}
        </select>
        {errors.borcTuru && (
          <p className="text-red-500 text-sm mt-1">{errors.borcTuru}</p>
        )}
      </div>

      {/* Borç Bedeli ve Para Cinsi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Borç Bedeli <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="borcBedeli"
            value={formData.borcBedeli}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.borcBedeli ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
          />
          {errors.borcBedeli && (
            <p className="text-red-500 text-sm mt-1">{errors.borcBedeli}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para Cinsi
          </label>
          <select
            name="paraCinsi"
            value={formData.paraCinsi}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="TL">TL (₺)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Vade Tarihi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vade Tarihi <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="vadeTarihi"
          value={formData.vadeTarihi}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.vadeTarihi ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.vadeTarihi && (
          <p className="text-red-500 text-sm mt-1">{errors.vadeTarihi}</p>
        )}
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Açıklama (Opsiyonel)
        </label>
        <textarea
          name="aciklama"
          value={formData.aciklama}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Borç hakkında ek bilgi yazın..."
        />
      </div>

      {/* Kaydet Butonu */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          <Save size={20} />
          Borcu Kaydet
        </button>
        <Link
          href="/finance"
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}

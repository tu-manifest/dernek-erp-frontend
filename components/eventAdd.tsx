"use client";

import { useState } from "react";
import { Save, Calendar, Clock, MapPin, Globe, Info, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function YeniEtkinlikForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    isim: "",
    tarih: "", // YYYY-MM-DD formatında kalmalı (input'tan geldiği gibi)
    saat: "",
    tur: "Offline",
    yer: "",
    platform: "",
    link: "",
    aciklama: "",
    kontenjan: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔹 Girdi değişiklikleri
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // hata varsa temizle
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Form doğrulama fonksiyonu
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.isim.trim()) newErrors.isim = "Etkinlik ismi gereklidir";
    if (!formData.tarih) newErrors.tarih = "Tarih gereklidir";
    if (!formData.saat) newErrors.saat = "Saat gereklidir";

    if (formData.tur === "Offline" && !formData.yer.trim()) {
      newErrors.yer = "Offline etkinlikler için yer bilgisi gereklidir";
    }

    if (formData.tur === "Online") {
      if (!formData.platform) newErrors.platform = "Platform seçimi gereklidir";
      if (!formData.link.trim()) newErrors.link = "Link gereklidir";
    }

    if (!formData.aciklama.trim()) newErrors.aciklama = "Açıklama gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // 🔹 Gönderim işlemi
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
        const dateObject = new Date(formData.tarih);

        // Tarih bileşenlerini al
        const day = dateObject.getDate().toString().padStart(2, '0');
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Ay 0'dan başladığı için +1 eklenir
        const year = dateObject.getFullYear();

        // GG.AA.YYYY formatını manuel olarak oluştur
        const formattedDate = `${day}.${month}.${year}`;

        console.log("Form Data:", {
            ...formData,
            tarih: formattedDate // Artık kesin GG.AA.YYYY formatında
        });

        alert("Etkinlik başarıyla oluşturuldu!");
        router.push("/events");
    }
};

  // ... (Form UI kısmı aynı kalır)

  // 🔹 Form UI
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Info size={20} />
          Temel Bilgiler
        </h2>

        {/* Etkinlik İsmi */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik İsmi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="isim"
              value={formData.isim}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.isim ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Örn: Yazılım Geliştirme Semineri"
            />
            {errors.isim && <p className="text-red-500 text-sm mt-1">{errors.isim}</p>}
          </div>

          {/* Tarih ve Saat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Tarih <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tarih"
                value={formData.tarih}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.tarih ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.tarih && <p className="text-red-500 text-sm mt-1">{errors.tarih}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Saat <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="saat"
                value={formData.saat}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.saat ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.saat && <p className="text-red-500 text-sm mt-1">{errors.saat}</p>}
            </div>
          </div>

          {/* Kontenjan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontenjan (İsteğe Bağlı)
            </label>
            <input
              type="number"
              name="kontenjan"
              value={formData.kontenjan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Maksimum katılımcı sayısı"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Etkinlik Türü */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Etkinlik Türü ve Konum
        </h2>

        {/* Tür Seçimi */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik Türü <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tur"
                  value="Offline"
                  checked={formData.tur === "Offline"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Offline</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tur"
                  value="Online"
                  checked={formData.tur === "Online"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Online</span>
              </label>
            </div>
          </div>

          {/* Offline */}
          {formData.tur === "Offline" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Yeri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="yer"
                value={formData.yer}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.yer ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Örn: Merkez Ofis, İstanbul"
              />
              {errors.yer && <p className="text-red-500 text-sm mt-1">{errors.yer}</p>}
            </div>
          )}

          {/* Online */}
          {formData.tur === "Online" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe size={16} className="inline mr-1" />
                  Platform <span className="text-red-500">*</span>
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.platform ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Platform Seçiniz</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="YouTube Live">YouTube Live</option>
                  <option value="Twitch">Twitch</option>
                </select>
                {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Linki <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.link ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
                {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etkinlik Açıklaması <span className="text-red-500">*</span>
        </label>
        <textarea
          name="aciklama"
          value={formData.aciklama}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg ${
            errors.aciklama ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="Etkinlik hakkında detaylı bilgi verin..."
        />
        {errors.aciklama && <p className="text-red-500 text-sm mt-1">{errors.aciklama}</p>}
      </div>

      {/* Butonlar */}
      <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <Check size={24} />
                <span>Oluştur</span>
              </button>
            </div>
    </form>
  );
}
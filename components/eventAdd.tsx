"use client";

import { useState } from "react";
import { ArrowLeft, Save, Calendar, Clock, MapPin, Globe, Info, Loader2, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent, CreateEventPayload } from "../lib/api/eventService";
import { toast } from "sonner";

export default function YeniEtkinlik() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    isim: "",
    tarih: "",
    saat: "",
    tur: "Fiziksel" as "Fiziksel" | "Çevrimiçi",
    yer: "",
    platform: "",
    link: "",
    aciklama: "",
    kontenjan: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.isim.trim()) newErrors.isim = "Etkinlik ismi gereklidir";
    if (!formData.tarih) newErrors.tarih = "Tarih gereklidir";
    if (!formData.saat) newErrors.saat = "Saat gereklidir";

    if (formData.tur === "Fiziksel" && !formData.yer.trim()) {
      newErrors.yer = "Fiziksel etkinlikler için yer bilgisi gereklidir";
    }

    if (formData.tur === "Çevrimiçi") {
      if (!formData.platform) newErrors.platform = "Platform seçimi gereklidir";
      if (!formData.link.trim()) newErrors.link = "Link gereklidir";
    }

    if (!formData.aciklama.trim()) newErrors.aciklama = "Açıklama gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Form verilerini API formatına dönüştür
      const payload: CreateEventPayload = {
        eventName: formData.isim,
        date: formData.tarih,
        time: formData.saat,
        eventType: formData.tur,
        description: formData.aciklama,
        quota: formData.kontenjan ? parseInt(formData.kontenjan) : undefined,
      };

      // Tür'e göre konum bilgilerini ekle
      if (formData.tur === "Fiziksel") {
        payload.location = formData.yer;
      } else {
        payload.platform = formData.platform;
        payload.eventLink = formData.link;
      }

      await createEvent(payload);

      // Başarılı mesajı göster ve listeye yönlendir
      toast.success("Etkinlik başarıyla oluşturuldu!");
      router.push("/events/list");
    } catch (error: any) {
      console.error("Etkinlik oluşturulurken hata:", error);
      // Backend'den gelen hata mesajını toast ile göster
      toast.error(error.message || "Etkinlik oluşturulurken bir hata oluştu.");
      setApiError(error.message || "Etkinlik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* API Error Alert */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-red-800 font-medium">Hata</h4>
              <p className="text-red-600 text-sm mt-1">{apiError}</p>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Temel Bilgiler */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info size={20} />
            Temel Bilgiler
          </h2>

          <div className="space-y-4">
            {/* Etkinlik İsmi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik İsmi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="isim"
                value={formData.isim}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.isim ? "border-red-500" : "border-gray-300"
                  } ${isSubmitting ? "bg-gray-100" : ""}`}
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
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.tarih ? "border-red-500" : "border-gray-300"
                    } ${isSubmitting ? "bg-gray-100" : ""}`}
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
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.saat ? "border-red-500" : "border-gray-300"
                    } ${isSubmitting ? "bg-gray-100" : ""}`}
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
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isSubmitting ? "bg-gray-100" : ""}`}
                placeholder="Maksimum katılımcı sayısı"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Etkinlik Türü ve Yer */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Etkinlik Türü ve Konum
          </h2>

          <div className="space-y-4">
            {/* Etkinlik Türü */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Türü <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tur"
                    value="Fiziksel"
                    checked={formData.tur === "Fiziksel"}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Fiziksel (Offline)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tur"
                    value="Çevrimiçi"
                    checked={formData.tur === "Çevrimiçi"}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Çevrimiçi (Online)</span>
                </label>
              </div>
            </div>

            {/* Fiziksel - Yer Bilgisi */}
            {formData.tur === "Fiziksel" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etkinlik Yeri <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="yer"
                  value={formData.yer}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.yer ? "border-red-500" : "border-gray-300"
                    } ${isSubmitting ? "bg-gray-100" : ""}`}
                  placeholder="Örn: Merkez Ofis, İstanbul"
                />
                {errors.yer && <p className="text-red-500 text-sm mt-1">{errors.yer}</p>}
              </div>
            )}

            {/* Online - Platform ve Link */}
            {formData.tur === "Çevrimiçi" && (
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.platform ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-100" : ""}`}
                  >
                    <option value="">Platform Seçiniz</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="YouTube Live">YouTube Canlı Yayın</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Diğer">Diğer</option>
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.link ? "border-red-500" : "border-gray-300"
                      } ${isSubmitting ? "bg-gray-100" : ""}`}
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
            disabled={isSubmitting}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.aciklama ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            placeholder="Etkinlik hakkında detaylı bilgi verin..."
          />
          {errors.aciklama && <p className="text-red-500 text-sm mt-1">{errors.aciklama}</p>}
        </div>

        {/* Butonlar */}
        <div className="flex justify-center gap-4 pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={20} />
                Etkinliği Kaydet
              </>
            )}
          </button>
          <Link
            href="/events/list"
            className={`flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
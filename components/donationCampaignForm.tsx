"use client";

import { useState } from "react";
import { Info, Calendar, Banknote, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// Hook ile kampanya oluşturma
import useCreateCampaign from "@/hooks/useCreateCampaign";

export default function DonationCampaignForm() {
  const router = useRouter();

  // Hook kullanımı
  const { createCampaign, isLoading: loading, error: apiError } = useCreateCampaign();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    targetAmount: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0], // Bugünün tarihi varsayılan
    endDate: "",
    iban: ""
  });

  // Hata state'i
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Kampanya türleri
  const campaignTypes = [
    "Genel Bağış",
    "Sosyal Destek",
    "Kurban",
    "Eğitim",
    "Su",
    "Sağlık",
    "Afet Yardım",
    "Zekat"
  ];

  // Input değişikliklerini handle et
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Kullanıcı yazmaya başladığında ilgili hatayı temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // IBAN validasyonu (Basit TR kontrolü)
  const validateIBAN = (iban: string): boolean => {
    // Boşlukları temizle ve kontrol et
    const cleanIban = iban.replace(/\s/g, "");
    const ibanRegex = /^TR[0-9]{24}$/;
    return ibanRegex.test(cleanIban);
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Kampanya adı zorunludur";
    }

    if (!formData.type) {
      newErrors.type = "Kampanya türü seçilmelidir";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Bitiş tarihi zorunludur";
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
    }

    if (!formData.iban) {
      newErrors.iban = "IBAN zorunludur";
    } else if (!validateIBAN(formData.iban)) {
      newErrors.iban = "Geçersiz IBAN formatı (TR ile başlamalı ve 26 karakter olmalı)";
    }

    if (formData.targetAmount && parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Hedef miktar 0'dan büyük olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi (Hook ile API Entegrasyonu)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasyon kontrolü
    if (!validateForm()) {
      return;
    }

    // 2. Backend'in beklediği formata dönüştürme
    const payload = {
      name: formData.name,
      type: formData.type,
      // String gelen tutarı sayıya çevir
      targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : 0,
      description: formData.description,
      // Backend modelindeki 'duration' alanı için tarihleri birleştiriyoruz
      duration: `${formData.startDate} - ${formData.endDate}`,
      iban: formData.iban,
    };

    // 3. Hook üzerinden API çağrısı yap
    const success = await createCampaign(payload);

    if (success) {
      // 4. Başarılı işlem sonrası
      toast.success("Kampanya başarıyla oluşturuldu!");
      router.push("/donations/list");
      router.refresh();
    } else {
      // 5. Hata durumu
      toast.error(`Kampanya oluşturulamadı: ${apiError || "Sunucu hatası oluştu."}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* --- BÖLÜM 1: Temel Bilgiler --- */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Info size={20} />
          Kampanya Bilgileri
        </h2>

        <div className="space-y-4">
          {/* Kampanya Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kampanya Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg ${errors.name ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="Örn: Eğitim Destek Kampanyası"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Kampanya Türü */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kampanya Türü <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg ${errors.type ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100`}
            >
              <option value="">Kampanya Türü Seçin</option>
              {campaignTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Hedef Miktar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hedeflenen Bağış Miktarı (TL)
            </label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              disabled={loading}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg ${errors.targetAmount ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100`}
              placeholder="0.00"
            />
            {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>}
          </div>
        </div>
      </div>

      {/* --- BÖLÜM 2: Tarih Bilgileri --- */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Kampanya Süresi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Başlangıç Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500"
            />
          </div>

          {/* Bitiş Tarihi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitiş Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              disabled={loading}
              min={formData.startDate}
              className={`w-full px-4 py-2 border rounded-lg ${errors.endDate ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* --- BÖLÜM 3: IBAN ve Açıklama --- */}
      <div>
        {/* IBAN */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Banknote size={20} />
            Banka Bilgileri
          </h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IBAN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="iban"
            value={formData.iban}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-lg ${errors.iban ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100`}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            maxLength={32}
          />
          {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kampanya Açıklaması
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Kampanya hakkında detaylı bilgi verin..."
          />
        </div>
      </div>

      {/* --- BÖLÜM 4: Butonlar --- */}
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          disabled={loading}
          className={`
            bg-gradient-to-r text-white px-12 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center space-x-2 transition-all duration-200
            ${loading
              ? 'from-gray-400 to-gray-500 cursor-not-allowed transform-none'
              : 'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-105'
            }
          `}
        >
          {loading ? (
            // Basit bir loading spinner simülasyonu veya metni
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Oluşturuluyor...
            </span>
          ) : (
            <>
              <Check size={24} />
              <span>Oluştur</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
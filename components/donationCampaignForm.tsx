"use client";

import { useState } from "react";
import { Info, Calendar, Banknote, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DonationCampaignForm() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    targetAmount: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    iban: ""
  });

  // Error state
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

    // Varsa hatayı temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // IBAN validasyonu
  const validateIBAN = (iban: string): boolean => {
    const ibanRegex = /^TR[0-9]{24}$/;
    return ibanRegex.test(iban.replace(/\s/g, ""));
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
    }

    if (!formData.iban) {
      newErrors.iban = "IBAN zorunludur";
    } else if (!validateIBAN(formData.iban)) {
      newErrors.iban = "Geçersiz IBAN formatı";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form Data:", formData);
      alert("Kampanya başarıyla oluşturuldu!");
      router.push("/donations/list");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Temel Bilgiler */}
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
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.name ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.type ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Tarih Bilgileri */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
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
              min={formData.startDate}
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* IBAN ve Açıklama */}
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
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.iban ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Kampanya hakkında detaylı bilgi verin..."
          />
        </div>
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
"use client";

import React, { useState } from "react";
import {
  Save,
  X,
  Calendar,
  DollarSign,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Users,
  Building2,
  Target,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Gider kategorileri ve alt kategorileri
const EXPENSE_CATEGORIES = {
  "Personel Giderleri": {
    icon: Users,
    color: "blue",
    subcategories: [
      "Maaş ve Ücretler",
      "Sosyal Güvenlik İşveren Payı",
      "Kıdem ve İhbar Tazminatı Karşılığı",
      "Yolluk, Harcırah ve Gündelikler",
    ],
  },
  "İdari ve Genel Giderler": {
    icon: Building2,
    color: "purple",
    subcategories: [
      "Kira Gideri (Merkez/Şube)",
      "Büro Malzemeleri ve Kırtasiye",
      "Isıtma, Aydınlatma, Su Giderleri",
      "Haberleşme Giderleri",
      "Bakım ve Onarım Giderleri",
      "Temizlik ve Güvenlik Hizmeti",
      "Hukuk ve Mali Müşavirlik Ücretleri",
      "Vergi, Resim ve Harçlar",
      "Sigorta Giderleri",
    ],
  },
  "Esas Amaç Giderleri": {
    icon: Target,
    color: "green",
    subcategories: [
      "Proje A - Faaliyet Maliyetleri",
      "Ayni Yardım Giderleri",
      "Araştırma ve Geliştirme Giderleri",
      "Burs ve Sosyal Yardım Ödemeleri",
      "Yayın, Tanıtım ve Temsil Giderleri",
    ],
  },
  "Fon Toplama Giderleri": {
    icon: TrendingUp,
    color: "orange",
    subcategories: [
      "Etkinlik Organizasyon Giderleri",
      "Pazarlama ve Tanıtım Giderleri",
      "Fon Toplama Personel Gideri",
    ],
  },
  "Mali ve Duran Varlık Giderleri": {
    icon: Wallet,
    color: "red",
    subcategories: [
      "Banka Komisyon Giderleri",
      "Finansman Giderleri (Borç Faizleri)",
      "Amortisman Giderleri",
      "Demirbaş Alımları (Gider Yazılan)",
    ],
  },
  "Diğer ve Olağanüstü Giderler": {
    icon: AlertTriangle,
    color: "gray",
    subcategories: [
      "Kanunen Kabul Edilmeyen Giderler (KKEG)",
      "Diğer Çeşitli Giderler",
      "Geçmiş Yıl Zararları",
    ],
  },
};

// Para birimleri
const CURRENCIES = [
  { code: "TRY", symbol: "₺", name: "Türk Lirası" },
  { code: "USD", symbol: "$", name: "Amerikan Doları" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "İngiliz Sterlini" },
];

// Ödeme yöntemleri
const PAYMENT_METHODS = [
  "Nakit",
  "Banka Transferi",
  "Kredi Kartı",
  "Çek",
  "Senet",
  "Havale/EFT",
];

interface ExpenseFormData {
  category: string;
  subcategory: string;
  amount: string;
  currency: string;
  date: string;
  paymentMethod: string;
  description: string;
  invoiceNumber: string;
  vendor: string;
  department: string;
  projectCode: string;
  isRecurring: boolean;
  attachments: File[];
}

export default function ExpenseEntryPage() {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: "",
    subcategory: "",
    amount: "",
    currency: "TRY",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    description: "",
    invoiceNumber: "",
    vendor: "",
    department: "",
    projectCode: "",
    isRecurring: false,
    attachments: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form değişikliklerini yönet
  const handleInputChange = (
    field: keyof ExpenseFormData,
    value: string | boolean | File[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Kategori değiştiğinde alt kategoriyi sıfırla
    if (field === "category") {
      setFormData((prev) => ({ ...prev, subcategory: "" }));
    }
  };

  // Dosya yükleme
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      handleInputChange("attachments", [...formData.attachments, ...filesArray]);
    }
  };

  // Dosya kaldırma
  const removeFile = (index: number) => {
    const newFiles = formData.attachments.filter((_, i) => i !== index);
    handleInputChange("attachments", newFiles);
  };

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (!formData.category) {
      newErrors.category = "Ana kategori seçilmelidir";
    }
    if (!formData.subcategory) {
      newErrors.subcategory = "Alt kategori seçilmelidir";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Geçerli bir tutar giriniz";
    }
    if (!formData.date) {
      newErrors.date = "Gider tarihi seçilmelidir";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Ödeme yöntemi seçilmelidir";
    }
    if (!formData.vendor.trim()) {
      newErrors.vendor = "Tedarikçi/Alıcı adı girilmelidir";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Gider açıklaması girilmelidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setIsSubmitting(true);

    try {
      // API çağrısı simülasyonu
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Başarılı
      setShowSuccess(true);
      toast.success("Gider kaydı başarıyla oluşturuldu!");

      // Formu temizle
      setTimeout(() => {
        resetForm();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error("Gider kaydedilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      category: "",
      subcategory: "",
      amount: "",
      currency: "TRY",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      description: "",
      invoiceNumber: "",
      vendor: "",
      department: "",
      projectCode: "",
      isRecurring: false,
      attachments: [],
    });
    setErrors({});
  };

  // Para birimi sembolünü al
  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || "";
  };

  // Kategori ikonunu al
  const CategoryIcon = formData.category
    ? EXPENSE_CATEGORIES[formData.category as keyof typeof EXPENSE_CATEGORIES]?.icon || FileText
    : FileText;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gider Girişi</h1>
        <p className="text-gray-600">
          Dernek giderlerini kategorize ederek kayıt altına alın
        </p>
      </div>

      {/* Başarı Mesajı */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <p className="text-green-900 font-semibold">Başarılı!</p>
            <p className="text-green-700 text-sm">
              Gider kaydı başarıyla oluşturuldu.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Gider Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kategori Seçimi */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <CategoryIcon className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Gider Kategorisi
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ana Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Kategori Seçin</option>
                    {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Alt Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange("subcategory", e.target.value)}
                    disabled={!formData.category}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.subcategory ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Alt Kategori Seçin</option>
                    {formData.category &&
                      EXPENSE_CATEGORIES[
                        formData.category as keyof typeof EXPENSE_CATEGORIES
                      ]?.subcategories.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                  </select>
                  {errors.subcategory && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.subcategory}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tutar ve Tarih */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Tutar ve Tarih
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tutar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gider Tutarı <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${
                        errors.amount ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Para Birimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Para Birimi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tarih */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gider Tarihi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ödeme Detayları */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="text-purple-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Ödeme Detayları
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ödeme Yöntemi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ödeme Yöntemi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.paymentMethod ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Ödeme Yöntemi Seçin</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* Fatura/Fiş No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fatura/Fiş Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Örn: FT-2025-001"
                  />
                </div>

                {/* Tedarikçi/Alıcı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tedarikçi/Alıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => handleInputChange("vendor", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.vendor ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tedarikçi veya alıcı adı"
                  />
                  {errors.vendor && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.vendor}
                    </p>
                  )}
                </div>

                {/* Departman */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman/Birim
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Örn: İdari İşler"
                  />
                </div>
              </div>
            </div>

            {/* Açıklama ve Notlar */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Açıklama ve Notlar
                </h2>
              </div>

              <div className="space-y-4">
                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gider Açıklaması <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Gider hakkında detaylı açıklama yazın..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  )}
                </div>

          
                {/* Tekrarlayan Gider */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Bu gider düzenli olarak tekrarlanmaktadır (Aylık)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Dosya Yükleme ve Özet */}
          <div className="space-y-6">
            {/* Dosya Yükleme */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="text-indigo-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Belgeler
                </h2>
              </div>

              <div className="space-y-4">
                {/* Upload Area */}
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600 mb-1">
                      Fatura, fiş veya belge yükleyin
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Yüklenen Dosyalar */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Yüklenen Dosyalar ({formData.attachments.length})
                    </p>
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="text-gray-500 flex-shrink-0" size={20} />
                          <span className="text-sm text-gray-700 truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Özet Bilgiler */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gider Özeti
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-sm text-gray-600">Kategori:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.category || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-sm text-gray-600">Alt Kategori:</span>
                  <span className="text-sm font-medium text-gray-900 text-right">
                    {formData.subcategory || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-sm text-gray-600">Tutar:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formData.amount
                      ? `${getCurrencySymbol(formData.currency)}${parseFloat(
                          formData.amount
                        ).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-sm text-gray-600">Tarih:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.date
                      ? new Date(formData.date).toLocaleDateString("tr-TR")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Ödeme:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.paymentMethod || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Gideri Kaydet
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <X size={20} />
                Formu Temizle
              </button>
            </div>

            {/* Bilgi Notu */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Önemli Bilgi
                  </p>
                  <p className="text-xs text-yellow-800">
                    Tüm gider kayıtları muhasebe standartlarına uygun olarak
                    belgelendirilmelidir. Fatura veya geçerli belge yüklemesi
                    zorunludur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

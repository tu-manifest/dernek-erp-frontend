"use client";

import React, { useState } from 'react';
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
  Loader2,
  File,
  FolderOpen,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import useCreateExpense from '@/hooks/useCreateExpense';
import { MaskedCurrencyInput } from '@/components/ui';

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
  "Genel Giderler": {
    icon: Receipt,
    color: "indigo",
    subcategories: [
      "Kira",
      "Faturalar",
      "Diğer",
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
  "Banka transferi",
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
  isRecurring: boolean;
}

export default function ExpenseEntryPage() {
  const { createExpense, isLoading } = useCreateExpense();

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
    isRecurring: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form değişikliklerini yönet
  const handleInputChange = (field: keyof ExpenseFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Hata mesajını temizle
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Kategori değiştiğinde alt kategoriyi sıfırla
    if (field === "category") {
      setFormData((prev) => ({ ...prev, subcategory: "" }));
    }
  };

  // Dosya seçimi
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const newErrors: { [key: string]: string } = { ...errors };

    // Dosya türü kontrolü
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      newErrors.file = 'Sadece PDF, JPEG ve PNG dosyaları kabul edilir';
      setErrors(newErrors);
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      newErrors.file = 'Dosya boyutu 10MB\'dan küçük olmalıdır';
      setErrors(newErrors);
      return;
    }

    delete newErrors.file;
    setErrors(newErrors);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="text-red-500" size={24} />;
    }
    return <File className="text-blue-500" size={24} />;
  };

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

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

    const result = await createExpense({
      mainCategory: formData.category,
      subCategory: formData.subcategory,
      amount: formData.amount,
      currency: formData.currency,
      expenseDate: formData.date,
      paymentMethod: formData.paymentMethod,
      invoiceNumber: formData.invoiceNumber || undefined,
      supplierName: formData.vendor,
      department: formData.department || undefined,
      description: formData.description,
      isRecurring: formData.isRecurring,
      file: selectedFile || undefined,
    });

    if (result.success) {
      toast.success("Gider kaydı başarıyla oluşturuldu!");
      resetForm();
    } else {
      toast.error(result.error || "Gider kaydedilirken bir hata oluştu");
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
      isRecurring: false,
    });
    setSelectedFile(null);
    setErrors({});
  };

  // Para birimi sembolünü al
  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || "";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Receipt size={28} className="text-red-600" />
          Gider Girişi
        </h1>
        <p className="text-gray-600 mt-1">Dernek giderlerini kategorize ederek kayıt altına alın</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kategori Seçimi */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen size={20} />
            Gider Kategorisi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ana Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.category ? "border-red-500" : "border-gray-300"
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.subcategory ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <option value="">Alt Kategori Seçin</option>
                {formData.category &&
                  EXPENSE_CATEGORIES[formData.category as keyof typeof EXPENSE_CATEGORIES]?.subcategories.map((subcat) => (
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Tutar ve Tarih
          </h2>

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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${errors.amount ? "border-red-500" : "border-gray-300"
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
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.date ? "border-red-500" : "border-gray-300"
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet size={20} className="text-purple-600" />
            Ödeme Detayları
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ödeme Yöntemi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Yöntemi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.paymentMethod ? "border-red-500" : "border-gray-300"
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.vendor ? "border-red-500" : "border-gray-300"
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

        {/* Açıklama */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-orange-600" />
            Açıklama ve Notlar
          </h2>

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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Gider hakkında detaylı açıklama yazın..."
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-500">{formData.description.length}/500</p>
              </div>
            </div>

            {/* Tekrarlayan Gider */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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

        {/* Dosya Yükleme */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload size={20} className="text-indigo-600" />
            Belge Yükleme (Opsiyonel)
          </h2>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <Upload className={`mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} size={40} />
            <p className="text-gray-700 font-medium mb-1">
              Fatura veya belgeyi buraya sürükleyin
            </p>
            <p className="text-sm text-gray-500 mb-3">
              PDF, JPEG, PNG formatlarında, maksimum 10MB
            </p>
            <input
              type="file"
              accept=".pdf,.jpeg,.jpg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
            >
              Dosya Seç
            </label>
          </div>

          {errors.file && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={18} />
              <p className="text-red-600 text-sm">{errors.file}</p>
            </div>
          )}

          {/* Seçili Dosya */}
          {selectedFile && (
            <div className="mt-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Kaldır"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition-all ${isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transform hover:scale-[1.02] shadow-lg'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={22} />
                Gideri Kaydet
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={isLoading}
            className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X size={22} />
            Temizle
          </button>
        </div>
      </form>
    </div>
  );
}

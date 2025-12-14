"use client";

import React, { useState } from "react";
import {
  Shield,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Save,
  Users,
  DollarSign,
  Calendar,
  Share2,
  FileText,
  Building2,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { RegisterPayload, RegisterResponse } from "@/lib/types/auth.types";

// Modül tanımlamaları
interface Module {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  permissions?: string[];
}

const SYSTEM_MODULES: Module[] = [
  {
    id: "members",
    name: "Üye Yönetimi",
    icon: Users,
    color: "blue",
    description: "Üye ekleme, düzenleme, listeleme ve grup yönetimi",
    permissions: ["Görüntüleme", "Ekleme", "Düzenleme", "Silme"],
  },
  {
    id: "donations",
    name: "Bağış Yönetimi",
    icon: DollarSign,
    color: "green",
    description: "Bağış kampanyaları, dış bağışçı yönetimi",
    permissions: ["Görüntüleme", "Kampanya Oluşturma", "Bağışçı Ekleme"],
  },
  {
    id: "managers",
    name: "Yönetici Yönetimi",
    icon: Shield,
    color: "red",
    description: "Sistem yöneticileri ve yetkilendirme yönetimi",
    permissions: ["Görüntüleme", "Ekleme", "Düzenleme", "Silme"],
  },
  {
    id: "events",
    name: "Etkinlik Yönetimi",
    icon: Calendar,
    color: "purple",
    description: "Etkinlik planlama, katılım takibi, duyurular",
    permissions: ["Görüntüleme", "Ekleme", "Düzenleme", "Katılım Takibi"],
  },
  {
    id: "meetings",
    name: "Toplantı Yönetimi",
    icon: Briefcase,
    color: "indigo",
    description: "Toplantı planlama, karar defteri, tutanak yönetimi",
    permissions: ["Görüntüleme", "Planlama", "Karar Girişi"],
  },
  {
    id: "social",
    name: "Sosyal Medya Yönetimi",
    icon: Share2,
    color: "pink",
    description: "Sosyal medya paylaşımları ve analiz raporları",
    permissions: ["Görüntüleme", "Paylaşım Oluşturma", "Analiz"],
  },
  {
    id: "finance",
    name: "Finansal İşlemler Yönetimi",
    icon: Building2,
    color: "orange",
    description: "Gelir/gider yönetimi, raporlama, bütçe planlaması",
    permissions: ["Görüntüleme", "Gider Girişi", "Tahsilat", "Raporlama"],
  },
  {
    id: "documents",
    name: "Döküman Yönetimi",
    icon: FileText,
    color: "yellow",
    description: "Döküman yükleme, arşivleme ve erişim yönetimi",
    permissions: ["Görüntüleme", "Yükleme", "Düzenleme", "Silme"],
  },
];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  modules: string[];
  isActive: boolean;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateManagerPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    modules: [],
    isActive: true,
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form değişiklik yönetimi
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Hata mesajını temizle
    if (errors[field]) {
      const { [field]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  // Modül seçimi toggle
  const toggleModule = (moduleId: string) => {
    const currentModules = formData.modules;
    const newModules = currentModules.includes(moduleId)
      ? currentModules.filter((m) => m !== moduleId)
      : [...currentModules, moduleId];

    handleInputChange("modules", newModules);
  };

  // Tüm modülleri seç/kaldır
  const toggleAllModules = () => {
    if (formData.modules.length === SYSTEM_MODULES.length) {
      handleInputChange("modules", []);
    } else {
      handleInputChange(
        "modules",
        SYSTEM_MODULES.map((m) => m.id)
      );
    }
  };

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // E-posta
    if (!formData.email.trim()) {
      newErrors.email = "E-posta adresi gereklidir";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    // Ad Soyad
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Ad ve soyad gereklidir";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Ad ve soyad en az 3 karakter olmalıdır";
    }

    // Şifre
    if (!formData.password) {
      newErrors.password = "Şifre gereklidir";
    } else if (formData.password.length < 8) {
      newErrors.password = "Şifre en az 8 karakter olmalıdır";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir";
    }

    // Şifre tekrar
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Şifre tekrarı gereklidir";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
    }

    // Telefon (opsiyonel ama varsa format kontrolü)
    if (formData.phone && !/^\+90\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(formData.phone)) {
      newErrors.phone = "Geçerli bir telefon numarası giriniz (+90 formatında)";
    }

    // Modül seçimi
    if (formData.modules.length === 0) {
      newErrors.modules = "En az bir modül seçilmelidir";
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
      // Map module selections to permission flags
      const payload: RegisterPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        notes: formData.notes,
        canManageMembers: formData.modules.includes("members"),
        canManageDonations: formData.modules.includes("donations"),
        canManageAdmins: formData.modules.includes("managers"),
        canManageEvents: formData.modules.includes("events"),
        canManageMeetings: formData.modules.includes("meetings"),
        canManageSocialMedia: formData.modules.includes("social"),
        canManageFinance: formData.modules.includes("finance"),
        canManageDocuments: formData.modules.includes("documents"),
      };

      // Get auth token
      const token = localStorage.getItem("authToken");

      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Yönetici oluşturulurken bir hata oluştu");
        return;
      }

      // Başarılı
      setShowSuccess(true);
      toast.success("Yönetici başarıyla oluşturuldu!");

      // Formu temizle
      setTimeout(() => {
        resetForm();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Yönetici oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      modules: [],
      isActive: true,
      notes: "",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Şifre gücü kontrolü
  const getPasswordStrength = (password: string): string => {
    if (password.length === 0) return "";
    if (password.length < 8) return "Zayıf";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return "Orta";
    if (!/(?=.*[@$!%*?&])/.test(password)) return "İyi";
    return "Güçlü";
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">

          Yeni Yönetici Ekle
        </h1>
        <p className="text-gray-600">
          Sistem yöneticisi oluşturun ve modül yetkilerini belirleyin
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {/* Kimlik Bilgileri */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">

                <h2 className="text-xl font-semibold text-gray-900">
                  Kimlik Bilgileri
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ad Soyad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad ve Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Ahmet Yılmaz"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* E-posta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="ahmet@dernek.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="+90 555 123 45 67"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Giriş Bilgileri */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Giriş Bilgileri
                </h2>
              </div>

              <div className="space-y-4">
                {/* Şifre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.password}
                    </p>
                  )}
                  {/* Şifre Gücü Göstergesi */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength === "Zayıf"
                              ? "w-1/4 bg-red-500"
                              : passwordStrength === "Orta"
                                ? "w-1/2 bg-yellow-500"
                                : passwordStrength === "İyi"
                                  ? "w-3/4 bg-blue-500"
                                  : "w-full bg-green-500"
                              }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${passwordStrength === "Zayıf"
                            ? "text-red-600"
                            : passwordStrength === "Orta"
                              ? "text-yellow-600"
                              : passwordStrength === "İyi"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                        >
                          {passwordStrength}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Şifre Tekrar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre Tekrar <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Şifreler eşleşiyor
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Modül Yetkileri */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Modül Yetkileri
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={toggleAllModules}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {formData.modules.length === SYSTEM_MODULES.length
                    ? "Tümünü Kaldır"
                    : "Tümünü Seç"}
                </button>
              </div>

              {errors.modules && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.modules}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYSTEM_MODULES.map((module) => {
                  const IconComponent = module.icon;
                  const isSelected = formData.modules.includes(module.id);

                  return (
                    <div
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleModule(module.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent
                              className="text-gray-600"
                              size={18}
                            />
                            <h3 className="font-medium text-gray-900 text-sm">
                              {module.name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Notlar</h2>
              </div>

              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Yönetici hakkında ek bilgiler veya notlar..."
              />
            </div>

            {/* Yönetici Ekle Butonu */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-4 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Yönetici Ekle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

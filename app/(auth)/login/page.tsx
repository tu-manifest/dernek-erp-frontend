"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import Image from "next/image";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validasyonu
    if (!formData.email.trim()) {
      newErrors.email = "E-posta adresi gereklidir";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    // Şifre validasyonu
    if (!formData.password) {
      newErrors.password = "Şifre gereklidir";
    } else if (formData.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // API çağrısı simülasyonu
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Geçici: Demo giriş kontrolü
      if (formData.email === "admin@derp.com" && formData.password === "123456") {
        // Token'ı localStorage'a kaydet
        localStorage.setItem("authToken", "demo-token-12345");
        localStorage.setItem("userEmail", formData.email);
        
        // Dashboard'a yönlendir
        router.push("/dashboard");
      } else {
        setErrors({
          general: "E-posta veya şifre hatalı. Lütfen tekrar deneyiniz.",
        });
      }
    } catch (error) {
      setErrors({
        general: "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative  bg-white rounded-3xl shadow-2xl p-4 border-4 border-blue-100">
              <Image
                src="/logo.png"
                alt="Dernek Logo"
                width={240}
                height={240}
                className="rounded-xl object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Derp Dernek Yönetim Sistemi
          </h1>
          <p className="text-gray-600 text-lg">
            Hesabınıza giriş yaparak devam edin
          </p>
        </div>

        {/* Login Formu */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Genel Hata Mesajı */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* E-posta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="ornek@derp.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50 ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Giriş Yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          {/* Demo Bilgileri */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Demo Hesap Bilgileri:
            </p>
            <div className="text-sm text-blue-800 space-y-1 pl-6">
              <p>📧 E-posta: <span className="font-mono font-semibold">admin@derp.com</span></p>
              <p>🔒 Şifre: <span className="font-mono font-semibold">123456</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            © 2025 Derp Dernek Yönetim Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}

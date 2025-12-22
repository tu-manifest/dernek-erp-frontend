"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Send, Play } from "lucide-react";
import Image from "next/image";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { AuthResponse, Admin } from "@/lib/types/auth.types";

// Demo admin with all permissions
const DEMO_ADMIN: Admin = {
  id: -1,
  fullName: "Demo Kullanıcı",
  email: "admin@derp.com",
  phone: "0000000000",
  notes: "Bu bir demo hesabıdır.",
  permissions: {
    canManageMembers: true,
    canManageDonations: true,
    canManageAdmins: true,
    canManageEvents: true,
    canManageMeetings: true,
    canManageSocialMedia: true,
    canManageFinance: true,
    canManageDocuments: true,
  },
  isActive: true,
};

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
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

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

  const handleDemoLogin = () => {
    setIsDemoLoading(true);
    try {
      // Demo login directly to localStorage (no AuthProvider needed)
      const demoToken = "demo-token-" + Date.now();
      localStorage.setItem("authToken", demoToken);
      localStorage.setItem("admin", JSON.stringify(DEMO_ADMIN));
      localStorage.setItem("userEmail", DEMO_ADMIN.email);
      localStorage.setItem("isDemo", "true");

      toast.success("Demo hesabıyla giriş yapıldı!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Demo login error:", error);
      toast.error("Demo girişi sırasında bir hata oluştu.");
      setIsDemoLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // Hata kontrolleri
    if (!resetEmail.trim()) {
      setResetEmailError("E-posta adresi gereklidir");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetEmailError("Geçerli bir e-posta adresi giriniz");
      return;
    }

    setResetEmailError("");
    setIsResetLoading(true);

    try {
      // Simüle edilmiş API çağrısı
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Şifre sıfırlama bağlantısı ${resetEmail} adresine gönderildi!`);
      setIsForgotPasswordModalOpen(false);
      setResetEmail("");
      setResetEmailError("");
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Real API call
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        setErrors({
          general: data.message || "E-posta veya şifre hatalı. Lütfen tekrar deneyiniz.",
        });
        return;
      }

      // Save token and admin info to localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      localStorage.setItem("userEmail", data.admin.email);
      // Gerçek login olduğunda demo flag'ini temizle
      localStorage.removeItem("isDemo");

      toast.success("Giriş başarılı!");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
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
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50 ${errors.email ? "border-red-500" : "border-gray-200"
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
                  className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-gray-50 ${errors.password ? "border-red-500" : "border-gray-200"
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

            {/* Şifremi Unuttum */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                disabled={isLoading}
              >
                Şifremi Unuttum?
              </button>
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

          {/* Demo Giriş Butonu */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">veya</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoLoading}
              className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-semibold text-base hover:from-amber-600 hover:to-orange-700 focus:ring-4 focus:ring-amber-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {isDemoLoading ? (
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
                  Demo Girişi Yapılıyor...
                </span>
              ) : (
                <>
                  <Play size={20} />
                  Demo Hesap ile Giriş Yap
                </>
              )}
            </button>
          </div>

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

      {/* Şifre Sıfırlama Modalı */}
      <Modal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => {
          setIsForgotPasswordModalOpen(false);
          setResetEmail("");
          setResetEmailError("");
        }}
        title="Şifremi Unuttum"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">

            <p className="text-lg text-gray-600 mb-4">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  if (resetEmailError) setResetEmailError("");
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${resetEmailError ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="ornek@derp.com"
                disabled={isResetLoading}
              />
            </div>
            {resetEmailError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {resetEmailError}
              </p>
            )}
          </div>

          <div>
            <button
              onClick={handleForgotPassword}
              disabled={isResetLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isResetLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Gönderiliyor...
                </>
              ) : (
                <>
                  Gönder
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

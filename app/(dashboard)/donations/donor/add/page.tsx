"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Check,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import useCreateDonor from "@/hooks/useCreateDonor";
import { MaskedPhoneInput } from "@/components/ui";

interface DonorFormData {
  name: string;
  type: "Kişi" | "Kurum";
  email: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddDonorPage: React.FC = () => {
  const router = useRouter();
  const { createDonor, isLoading } = useCreateDonor();

  const [formData, setFormData] = useState<DonorFormData>({
    name: "",
    type: "Kişi",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^(\+90|0)?[0-9\s-]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleInputChange = (
    field: keyof DonorFormData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Bağışçı/Kurum adı gereklidir";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Bağışçı/Kurum adı en az 2 karakter olmalıdır";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Geçerli bir telefon numarası giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setSubmitError(null);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
    };

    const result = await createDonor(payload);

    if (result.success) {
      router.push("/donations/donors");
    } else {
      setSubmitError(result.error || "Bağışçı eklenirken bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen py-8 px-6 lg:px-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Dış Bağışçı Ekle
          </h1>
          <p className="text-gray-600">
            Derneğe bağış yapan kişi veya kurumları sisteme kaydedin
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Bağışçı Tipi Seçimi */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Bağışçı Tipi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("type", "Kişi")}
                  className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${formData.type === "Kişi"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                >
                  <User
                    className={
                      formData.type === "Kişi"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                    size={24}
                  />
                  <div className="text-left flex-1">
                    <div
                      className={`font-semibold text-sm ${formData.type === "Kişi"
                        ? "text-blue-600"
                        : "text-gray-700"
                        }`}
                    >
                      Kişi
                    </div>
                    <div className="text-xs text-gray-500">Bireysel bağışçı</div>
                  </div>
                  {formData.type === "Kişi" && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <Check size={14} />
                      </div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange("type", "Kurum")}
                  className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${formData.type === "Kurum"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                >
                  <Building2
                    className={
                      formData.type === "Kurum"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                    size={24}
                  />
                  <div className="text-left flex-1">
                    <div
                      className={`font-semibold text-sm ${formData.type === "Kurum"
                        ? "text-blue-600"
                        : "text-gray-700"
                        }`}
                    >
                      Kurum
                    </div>
                    <div className="text-xs text-gray-500">
                      Kurumsal bağışçı
                    </div>
                  </div>
                  {formData.type === "Kurum" && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <Check size={14} />
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Bağışçı/Kurum Adı */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                {formData.type === "Kişi" ? "Bağışçı Adı" : "Kurum Adı"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {formData.type === "Kişi" ? (
                  <User
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={20}
                  />
                ) : (
                  <Building2
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={20}
                  />
                )}
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("name", e.target.value)
                  }
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder={
                    formData.type === "Kişi"
                      ? "Örn: Ahmet Yılmaz"
                      : "Örn: ABC Holding A.Ş."
                  }
                />
              </div>
              {errors.name && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* İletişim Bilgileri */}
            <div className=" rounded-lg  ">
              <div className="space-y-4">
                {/* E-posta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-white ${errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-4 text-gray-400"
                      size={24}
                    />
                    <MaskedPhoneInput
                      value={formData.phone}
                      onChange={(value) => handleInputChange("phone", value)}
                      hasError={!!errors.phone}
                      className="pl-14 pr-5 py-4 text-base"
                    />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-3.5 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>Bağışçıyı Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDonorPage;
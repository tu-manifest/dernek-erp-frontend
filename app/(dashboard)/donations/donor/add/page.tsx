"use client";
import React, { useState } from "react";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Check,
  Info,
  User,
  AlertCircle,
} from "lucide-react";

interface DonorFormData {
  donorName: string;
  donorType: "kisi" | "kurum";
  email: string;
  phoneNumber: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddDonorPage: React.FC = () => {
  const [formData, setFormData] = useState<DonorFormData>({
    donorName: "",
    donorType: "kisi",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleInputChange = (
    field: keyof DonorFormData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

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

    if (!formData.donorName.trim()) {
      newErrors.donorName = "Bağışçı/Kurum adı gereklidir";
    } else if (formData.donorName.trim().length < 2) {
      newErrors.donorName = "Bağışçı/Kurum adı en az 2 karakter olmalıdır";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Geçerli bir telefon numarası giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      console.log("Bağışçı Kaydediliyor:", formData);
      alert("Bağışçı başarıyla kaydedildi!");

      setFormData({
        donorName: "",
        donorType: "kisi",
        email: "",
        phoneNumber: "",
      });
      setErrors({});
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
          <div className="space-y-6">
            {/* Bağışçı Tipi Seçimi */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Bağışçı Tipi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("donorType", "kisi")}
                  className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.donorType === "kisi"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <User
                    className={
                      formData.donorType === "kisi"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                    size={24}
                  />
                  <div className="text-left flex-1">
                    <div
                      className={`font-semibold text-sm ${
                        formData.donorType === "kisi"
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      Kişi
                    </div>
                    <div className="text-xs text-gray-500">Bireysel bağışçı</div>
                  </div>
                  {formData.donorType === "kisi" && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <Check size={14} />
                      </div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange("donorType", "kurum")}
                  className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.donorType === "kurum"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <Building2
                    className={
                      formData.donorType === "kurum"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                    size={24}
                  />
                  <div className="text-left flex-1">
                    <div
                      className={`font-semibold text-sm ${
                        formData.donorType === "kurum"
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
                  {formData.donorType === "kurum" && (
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
                {formData.donorType === "kisi" ? "Bağışçı Adı" : "Kurum Adı"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {formData.donorType === "kisi" ? (
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
                  value={formData.donorName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("donorName", e.target.value)
                  }
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                    errors.donorName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={
                    formData.donorType === "kisi"
                      ? "Örn: Ahmet Yılmaz"
                      : "Örn: ABC Holding A.Ş."
                  }
                />
              </div>
              {errors.donorName && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.donorName}</span>
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
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-white ${
                        errors.email ? "border-red-500" : "border-gray-300"
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
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base bg-white ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-3.5 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Check size={20} />
                <span>Bağışçıyı Kaydet</span>
              </button>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default AddDonorPage;
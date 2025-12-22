"use client";

import React, { useState, useEffect } from "react";
import {
    Building2,
    Save,
    Phone,
    Mail,
    MapPin,
    Globe,
    Calendar,
    User,
    Hash,
    Settings,
    Loader2,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import fetcher from "@/lib/api/fetcher";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

// Interface artık tamamen Backend modelindeki isimlerle aynı
interface AssociationSettings {
    associationName: string;
    presidentName: string;
    phoneNumber: string;
    email: string;
    address: string;
    taxNumber: string;
    foundationYear: string;
    website: string;
}

const DEFAULT_SETTINGS: AssociationSettings = {
    associationName: "",
    presidentName: "",
    phoneNumber: "",
    email: "",
    address: "",
    taxNumber: "",
    foundationYear: "",
    website: "",
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<AssociationSettings>(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Backend'den Ayarları Çekme (GET)
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setError(null);
                const response = await fetcher(API_ENDPOINTS.settings.get);

                // Response'dan ayarları al
                if (response) {
                    // Backend'den gelen veriyi kontrol et
                    const data = response.data || response;
                    setSettings({
                        associationName: data.associationName || "",
                        presidentName: data.presidentName || "",
                        phoneNumber: data.phoneNumber || "",
                        email: data.email || "",
                        address: data.address || "",
                        taxNumber: data.taxNumber || "",
                        foundationYear: data.foundationYear || "",
                        website: data.website || "",
                    });
                }
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message || "Ayarlar sunucudan yüklenemedi.");
                toast.error("Ayarlar sunucudan yüklenemedi.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (field: keyof AssociationSettings, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
        setHasChanges(true);
    };

    // Ayarları Güncelleme (PUT)
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetcher(API_ENDPOINTS.settings.update, {
                method: "PUT",
                payload: settings,
            });

            toast.success("Ayarlar başarıyla güncellendi!");
            setHasChanges(false);
        } catch (err: any) {
            console.error("Update error:", err);
            toast.error(err.message || "Ayarlar kaydedilirken bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-gray-500 font-medium">Ayarlar yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Bağlantı Hatası</h3>
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Yeniden Dene
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Settings className="text-blue-600" />
                    Dernek Ayarları
                </h1>
                <p className="text-gray-600">
                    Dernek bilgilerini merkezi sistemden yönetin
                </p>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    {/* Kart Başlığı */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Kurumsal Bilgiler</h2>
                            <p className="text-sm text-gray-500">Resmi kayıt ve iletişim bilgileri</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dernek Adı */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Building2 size={16} className="text-gray-400" />
                                Dernek Adı
                            </label>
                            <input
                                type="text"
                                value={settings.associationName}
                                onChange={(e) => handleChange("associationName", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Dernek tam adı"
                            />
                        </div>

                        {/* Başkan Adı */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="text-gray-400" />
                                Dernek Başkanı
                            </label>
                            <input
                                type="text"
                                value={settings.presidentName}
                                onChange={(e) => handleChange("presidentName", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Başkan Ad Soyad"
                            />
                        </div>

                        {/* Telefon */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Phone size={16} className="text-gray-400" />
                                Telefon Numarası
                            </label>
                            <input
                                type="tel"
                                value={settings.phoneNumber}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="+90 ..."
                            />
                        </div>

                        {/* E-posta */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Mail size={16} className="text-gray-400" />
                                E-posta Adresi
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="info@dernek.org"
                            />
                        </div>

                        {/* Vergi No */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Hash size={16} className="text-gray-400" />
                                Vergi Numarası
                            </label>
                            <input
                                type="text"
                                value={settings.taxNumber}
                                onChange={(e) => handleChange("taxNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Kuruluş Yılı */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} className="text-gray-400" />
                                Kuruluş Yılı
                            </label>
                            <input
                                type="text"
                                value={settings.foundationYear}
                                onChange={(e) => handleChange("foundationYear", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="2024"
                                maxLength={4}
                            />
                        </div>

                        {/* Adres */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="text-gray-400" />
                                Adres
                            </label>
                            <textarea
                                value={settings.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Web Sitesi */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Globe size={16} className="text-gray-400" />
                                Web Sitesi
                            </label>
                            <input
                                type="url"
                                value={settings.website}
                                onChange={(e) => handleChange("website", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                        {hasChanges && (
                            <p className="text-sm text-orange-600 flex items-center gap-2 font-medium">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                Kaydedilmemiş değişiklikler var
                            </p>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-3 rounded-lg font-semibold hover:shadow-xl focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Değişiklikleri Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
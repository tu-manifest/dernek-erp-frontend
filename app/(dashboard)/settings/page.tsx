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
} from "lucide-react";
import { toast } from "sonner";

interface AssociationSettings {
    name: string;
    owner: string;
    phone: string;
    email: string;
    address: string;
    taxNumber: string;
    foundedYear: string;
    website: string;
}

const DEFAULT_SETTINGS: AssociationSettings = {
    name: "",
    owner: "",
    phone: "",
    email: "",
    address: "",
    taxNumber: "",
    foundedYear: "",
    website: "",
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<AssociationSettings>(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem("appSettings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.association) {
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed.association });
                } else {
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed });
                }
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        }
    }, []);

    const handleChange = (field: keyof AssociationSettings, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem("appSettings", JSON.stringify({ association: settings }));
            await new Promise((resolve) => setTimeout(resolve, 500));
            toast.success("Ayarlar başarıyla kaydedildi!");
            setHasChanges(false);
        } catch (error) {
            console.error("Save settings error:", error);
            toast.error("Ayarlar kaydedilirken bir hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Settings className="text-blue-600" />
                    Dernek Ayarları
                </h1>
                <p className="text-gray-600">
                    Dernek bilgilerini görüntüleyin ve düzenleyin
                </p>
            </div>

            <div className="max-w-5xl">
                {/* Dernek Bilgileri Kartı */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    {/* Kart Başlığı */}
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Dernek Bilgileri
                            </h2>
                            <p className="text-sm text-gray-500">Derneğinizin temel bilgilerini buradan yönetebilirsiniz</p>
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
                                value={settings.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Örn: Yardımseverler Derneği"
                            />
                        </div>

                        {/* Dernek Başkanı */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="text-gray-400" />
                                Dernek Başkanı
                            </label>
                            <input
                                type="text"
                                value={settings.owner}
                                onChange={(e) => handleChange("owner", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Başkanın adı soyadı"
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
                                value={settings.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="+90 555 123 45 67"
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

                        {/* Vergi Numarası */}
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
                                placeholder="1234567890"
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
                                value={settings.foundedYear}
                                onChange={(e) => handleChange("foundedYear", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="2020"
                                maxLength={4}
                            />
                        </div>

                        {/* Adres - Tam Genişlik */}
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
                                placeholder="Derneğin tam adresi"
                            />
                        </div>

                        {/* Web Sitesi - Tam Genişlik */}
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
                                placeholder="https://www.dernek.org"
                            />
                        </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                        {hasChanges && (
                            <p className="text-sm text-orange-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                Kaydedilmemiş değişiklikleriniz var
                            </p>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
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

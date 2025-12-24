"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Upload,
    X,
    Info,
    Building2,
    DollarSign,
    TrendingDown,
    MapPin,
    FileText,
    Loader2,
    Camera,
    ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
    VUK_ASSET_CLASSES,
    MAIN_CLASS_NAMES,
    CURRENCIES,
    AssetMainClass,
    CreateAssetPayload,
} from "@/lib/types/asset.types";
import useCreateFixedAsset from "@/hooks/useCreateFixedAsset";
import useUploadFixedAssetImage from "@/hooks/useUploadFixedAssetImage";

interface FormData {
    // Tanımlayıcı Bilgiler
    code: string;
    name: string;
    mainClass: AssetMainClass | "";
    subClassId: string;
    serialOrPlate: string;
    brandModel: string;

    // Finansal Bilgiler
    costValue: string;
    currency: string;
    acquisitionDate: string;
    invoiceNo: string;
    supplier: string;

    // Amortisman Bilgileri (Auto-assigned)
    usefulLife: number;
    depreciationRate: number;
    depreciationMethod: string;
    salvageValue: string;
    depreciationStartDate: string;

    // Operasyonel Bilgiler
    responsiblePerson: string;
    warrantyEndDate: string;

    // Ek Bilgiler
    revaluationApplied: boolean;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function AddAssetPage() {
    const router = useRouter();
    const { createFixedAsset, isLoading: isSubmitting } = useCreateFixedAsset();

    const [formData, setFormData] = useState<FormData>({
        code: "",
        name: "",
        mainClass: "",
        subClassId: "",
        serialOrPlate: "",
        brandModel: "",
        costValue: "",
        currency: "TRY",
        acquisitionDate: "",
        invoiceNo: "",
        supplier: "",
        usefulLife: 0,
        depreciationRate: 0,
        depreciationMethod: "Normal Amortisman",
        salvageValue: "",
        depreciationStartDate: "",
        responsiblePerson: "",
        warrantyEndDate: "",
        revaluationApplied: false,
        notes: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [productImage, setProductImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { uploadImage, isLoading: isUploadingImage } = useUploadFixedAssetImage();

    // Get unique main classes
    const mainClasses = useMemo(() => {
        const classes = new Set(VUK_ASSET_CLASSES.map((c) => c.mainClass));
        return Array.from(classes);
    }, []);

    // Get sub classes based on main class selection
    const availableSubClasses = useMemo(() => {
        if (!formData.mainClass) return [];
        return VUK_ASSET_CLASSES.filter((c) => c.mainClass === formData.mainClass);
    }, [formData.mainClass]);

    // Get selected sub class
    const selectedSubClass = useMemo(() => {
        return VUK_ASSET_CLASSES.find((c) => c.id === formData.subClassId);
    }, [formData.subClassId]);

    // Auto-assign depreciation values when sub class changes
    useEffect(() => {
        if (selectedSubClass) {
            setFormData((prev) => ({
                ...prev,
                usefulLife: selectedSubClass.usefulLife,
                depreciationRate: selectedSubClass.depreciationRate,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                usefulLife: 0,
                depreciationRate: 0,
            }));
        }
    }, [selectedSubClass]);

    // Auto-set depreciation start date same as acquisition date
    useEffect(() => {
        if (formData.acquisitionDate && !formData.depreciationStartDate) {
            setFormData((prev) => ({
                ...prev,
                depreciationStartDate: prev.acquisitionDate,
            }));
        }
    }, [formData.acquisitionDate]);

    // Check if serial/plate field should be visible
    const showSerialOrPlate = useMemo(() => {
        return selectedSubClass?.hasSerialNo || selectedSubClass?.hasPlate;
    }, [selectedSubClass]);

    const serialOrPlateLabel = useMemo(() => {
        if (selectedSubClass?.hasPlate) return "Plaka";
        if (selectedSubClass?.hasSerialNo) return "Seri Numarası";
        return "Seri No / Plaka";
    }, [selectedSubClass]);

    // Handle input change
    const handleInputChange = (
        field: keyof FormData,
        value: string | boolean | number
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error if exists
        if (errors[field]) {
            const { [field]: _, ...rest } = errors;
            setErrors(rest);
        }

        // Reset sub class if main class changes
        if (field === "mainClass") {
            setFormData((prev) => ({ ...prev, subClassId: "" }));
        }
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Lütfen yalnızca resim dosyası seçin');
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Resim boyutu 10MB\'dan küçük olmalıdır');
                return;
            }
            setProductImage(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const removeImage = () => {
        setProductImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    // Validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = "Varlık Kodu zorunludur";
        }
        if (!formData.name.trim()) {
            newErrors.name = "Varlık Adı zorunludur";
        }
        if (!formData.mainClass) {
            newErrors.mainClass = "Varlık Sınıfı seçilmelidir";
        }
        if (!formData.subClassId) {
            newErrors.subClassId = "Alt Sınıf seçilmelidir";
        }
        if (!formData.costValue || parseFloat(formData.costValue) <= 0) {
            newErrors.costValue = "Geçerli bir maliyet bedeli giriniz";
        }
        if (!formData.acquisitionDate) {
            newErrors.acquisitionDate = "Edinme tarihi zorunludur";
        }
        if (!formData.depreciationStartDate) {
            newErrors.depreciationStartDate = "Amortisman başlangıç tarihi zorunludur";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if form is valid for submit button
    const isFormValid = useMemo(() => {
        return (
            formData.code.trim() &&
            formData.name.trim() &&
            formData.mainClass &&
            formData.subClassId &&
            formData.costValue &&
            parseFloat(formData.costValue) > 0 &&
            formData.acquisitionDate &&
            formData.depreciationStartDate
        );
    }, [formData]);

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Lütfen tüm zorunlu alanları doldurun");
            return;
        }

        // Alt sınıf bilgisini bul
        const selectedSubClass = VUK_ASSET_CLASSES.find(c => c.id === formData.subClassId);
        const mainClassName = formData.mainClass ? MAIN_CLASS_NAMES[formData.mainClass] : '';

        // API için payload hazırla
        const apiPayload = {
            registrationNo: formData.code,
            name: formData.name,
            assetClass: mainClassName,
            assetSubClass: selectedSubClass?.name || '',
            brandModel: formData.brandModel || '',
            costValue: parseFloat(formData.costValue),
            acquisitionDate: formData.acquisitionDate,
            invoiceNo: formData.invoiceNo || '',
            supplierName: formData.supplier || '',
            usefulLife: formData.usefulLife,
            depreciationRate: formData.depreciationRate,
            salvageValue: formData.salvageValue ? parseFloat(formData.salvageValue) : 0,
            depreciationStartDate: formData.depreciationStartDate,
            responsiblePerson: formData.responsiblePerson || '',
            warrantyEndDate: formData.warrantyEndDate || '',
            revaluationApplied: formData.revaluationApplied,
            description: formData.notes || '',
        };

        console.log("API payload:", apiPayload);

        const result = await createFixedAsset(apiPayload);

        if (result.success) {
            const assetId = result.data?.data?.id || result.data?.id;

            // Resim varsa yükle
            if (productImage && assetId) {
                const imageResult = await uploadImage(assetId, productImage);
                if (!imageResult.success) {
                    toast.warning(`Varlık oluşturuldu ancak resim yüklenemedi: ${imageResult.error}`);
                }
            }

            toast.success("Varlık başarıyla oluşturuldu!");
            router.push("/assets/list");
        } else {
            toast.error(result.error || "Varlık oluşturulurken bir hata oluştu");
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Yeni Sabit Varlık Ekle
                </h1>

            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tanımlayıcı Bilgiler */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="text-blue-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Tanımlayıcı Bilgiler
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Varlık Kodu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Varlık Kodu / Sicil No <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => handleInputChange("code", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.code ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="SV-2024-001"
                                maxLength={50}
                            />
                            {errors.code && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        {/* Varlık Adı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Varlık Adı <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Dernek Merkezi İdari Masa"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Ana Sınıf */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Varlık Sınıfı <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.mainClass}
                                onChange={(e) =>
                                    handleInputChange("mainClass", e.target.value as AssetMainClass)
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.mainClass ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Sınıf Seçin</option>
                                {mainClasses.map((mc) => (
                                    <option key={mc} value={mc}>
                                        {MAIN_CLASS_NAMES[mc]}
                                    </option>
                                ))}
                            </select>
                            {errors.mainClass && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.mainClass}
                                </p>
                            )}
                        </div>

                        {/* Alt Sınıf */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alt Sınıf / Detay Tipi <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.subClassId}
                                onChange={(e) => handleInputChange("subClassId", e.target.value)}
                                disabled={!formData.mainClass}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.subClassId ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">
                                    {formData.mainClass ? "Alt Sınıf Seçin" : "Önce sınıf seçin"}
                                </option>
                                {availableSubClasses.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                            {selectedSubClass && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Info size={12} />
                                    {selectedSubClass.description}
                                </p>
                            )}
                            {errors.subClassId && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.subClassId}
                                </p>
                            )}
                        </div>

                        {/* Seri No / Plaka (Conditional) */}
                        {showSerialOrPlate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {serialOrPlateLabel}
                                </label>
                                <input
                                    type="text"
                                    value={formData.serialOrPlate}
                                    onChange={(e) =>
                                        handleInputChange("serialOrPlate", e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={
                                        selectedSubClass?.hasPlate ? "34 ABC 123" : "ABC123456"
                                    }
                                />
                            </div>
                        )}

                        {/* Marka / Model */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Marka / Model
                            </label>
                            <input
                                type="text"
                                value={formData.brandModel}
                                onChange={(e) => handleInputChange("brandModel", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Dell Latitude 5540"
                            />
                        </div>
                    </div>
                </div>

                {/* Finansal Bilgiler */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="text-green-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Finansal Bilgiler
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Maliyet Bedeli */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maliyet Bedeli (KDV Hariç) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.costValue}
                                    onChange={(e) => handleInputChange("costValue", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.costValue ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.costValue && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.costValue}
                                </p>
                            )}
                        </div>

                        {/* Para Birimi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Para Birimi
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => handleInputChange("currency", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {CURRENCIES.map((curr) => (
                                    <option key={curr.code} value={curr.code}>
                                        {curr.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Edinme Tarihi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Edinme Tarihi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.acquisitionDate}
                                onChange={(e) =>
                                    handleInputChange("acquisitionDate", e.target.value)
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.acquisitionDate ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            {errors.acquisitionDate && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.acquisitionDate}
                                </p>
                            )}
                        </div>

                        {/* Fatura Numarası */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fatura Numarası
                            </label>
                            <input
                                type="text"
                                value={formData.invoiceNo}
                                onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="FTR-2024-0001"
                            />
                        </div>

                        {/* Satıcı / Tedarikçi */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Satıcı / Tedarikçi
                            </label>
                            <input
                                type="text"
                                value={formData.supplier}
                                onChange={(e) => handleInputChange("supplier", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Tedarikçi firma adı"
                            />
                        </div>
                    </div>
                </div>

                {/* Amortisman Bilgileri */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingDown className="text-orange-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Amortisman Bilgileri
                        </h2>
                    </div>

                    {selectedSubClass && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-2">
                                <Info className="text-blue-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">
                                        VUK Kuralı Otomatik Uygulandı
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        "{selectedSubClass.name}" için faydalı ömür ve amortisman oranı
                                        VUK'a göre otomatik atandı.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Faydalı Ömür */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Faydalı Ömür (Yıl)
                            </label>
                            <input
                                type="number"
                                value={formData.usefulLife || ""}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                                placeholder="Otomatik atanacak"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                VUK'a göre otomatik atanır
                            </p>
                        </div>

                        {/* Amortisman Oranı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amortisman Oranı (%)
                            </label>
                            <input
                                type="text"
                                value={
                                    formData.depreciationRate
                                        ? `%${formData.depreciationRate.toFixed(2)}`
                                        : ""
                                }
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                                placeholder="Otomatik hesaplanacak"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                100 / Faydalı Ömür formülü ile hesaplanır
                            </p>
                        </div>

                        {/* Amortisman Yöntemi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amortisman Yöntemi
                            </label>
                            <input
                                type="text"
                                value={formData.depreciationMethod}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Dernekler için standart yöntem
                            </p>
                        </div>

                        {/* Hurda Değeri */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hurda Değeri / Kalıntı Değeri
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.salvageValue}
                                onChange={(e) => handleInputChange("salvageValue", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Faydalı ömür sonundaki tahmini değer
                            </p>
                        </div>

                        {/* Amortisman Başlangıç Tarihi */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amortisman Başlangıç Tarihi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.depreciationStartDate}
                                onChange={(e) =>
                                    handleInputChange("depreciationStartDate", e.target.value)
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.depreciationStartDate
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            />
                            {errors.depreciationStartDate && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.depreciationStartDate}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Operasyonel Bilgiler */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="text-purple-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Operasyonel Bilgiler
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sorumlu Kişi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sorumlu Kişi / Departman
                            </label>
                            <input
                                type="text"
                                value={formData.responsiblePerson}
                                onChange={(e) =>
                                    handleInputChange("responsiblePerson", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Zimmetli kişi veya departman"
                            />
                        </div>

                        {/* Garanti Bitiş Tarihi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Garanti Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                value={formData.warrantyEndDate}
                                onChange={(e) =>
                                    handleInputChange("warrantyEndDate", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Yeniden Değerleme */}
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="revaluation"
                                checked={formData.revaluationApplied}
                                onChange={(e) =>
                                    handleInputChange("revaluationApplied", e.target.checked)
                                }
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label
                                htmlFor="revaluation"
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                Yeniden Değerleme / Enflasyon Düzeltmesi Uygulandı
                            </label>
                        </div>
                    </div>
                </div>

                {/* Ek Bilgiler */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="text-gray-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">Ek Bilgiler</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Notlar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Açıklama / Notlar
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Varlıkla ilgili özel notlar veya kullanım amacı detayı..."
                            />
                        </div>

                        {/* Ürün Fotoğrafı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün Fotoğrafı
                            </label>

                            {!imagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Camera className="text-gray-400 mb-2" size={32} />
                                        <span className="text-sm text-gray-600">
                                            Ürün fotoğrafı yüklemek için tıklayın
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">
                                            JPG, PNG, WEBP (Max 10MB)
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Ürün önizleme"
                                            className="w-full h-48 object-contain bg-gray-50"
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon size={16} className="text-green-600" />
                                            <span className="text-sm text-gray-700">{productImage?.name}</span>
                                            <span className="text-xs text-gray-400">
                                                ({productImage && (productImage.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting || isUploadingImage}
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
                                Varlık Kaydet
                            </>
                        )}
                    </button>
                </div>

                {/* Form Validation Status */}
                {!isFormValid && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                            <AlertCircle size={14} />
                            Tüm zorunlu alanları doldurun
                        </p>
                    </div>
                )}

                {isFormValid && (
                    <div className="text-center">
                        <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle size={14} />
                            Form kaydetmeye hazır
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Building2,
    Car,
    Monitor,
    Wrench,
    FileText,
    Globe,
    Filter,
    Calendar,
    TrendingDown,
} from "lucide-react";
import {
    Asset,
    AssetStatus,
    VUK_ASSET_CLASSES,
    MAIN_CLASS_NAMES,
    LOCATIONS,
    STATUS_LABELS,
    AssetMainClass
} from "@/lib/types/asset.types";
import Modal from "@/components/Modal";
import { toast } from "sonner";

// Mock data for demonstration
const MOCK_ASSETS: Asset[] = [
    {
        id: "1",
        code: "SV-2024-001",
        name: "Dell Latitude 5540 Laptop",
        subClassId: "demirbas_bilgisayar",
        serialOrPlate: "ABC123456",
        brandModel: "Dell Latitude 5540",
        costValue: 45000,
        currency: "TRY",
        acquisitionDate: "2024-01-15",
        invoiceNo: "FTR-2024-0001",
        supplier: "Teknoloji A.Ş.",
        usefulLife: 4,
        depreciationRate: 25,
        depreciationMethod: "Normal Amortisman",
        depreciationStartDate: "2024-01-15",
        location: "Muhasebe Ofisi",
        responsiblePerson: "Ahmet Yılmaz",
        status: "active",
        warrantyEndDate: "2026-01-15",
        accumulatedDepreciation: 11250,
        netBookValue: 33750,
    },
    {
        id: "2",
        code: "SV-2024-002",
        name: "Ford Transit Minibüs",
        subClassId: "tasit_minibus",
        serialOrPlate: "34 ABC 123",
        brandModel: "Ford Transit",
        costValue: 1250000,
        currency: "TRY",
        acquisitionDate: "2024-03-01",
        invoiceNo: "FTR-2024-0045",
        supplier: "Ford Yetkili Bayi",
        usefulLife: 7,
        depreciationRate: 14.28,
        depreciationMethod: "Normal Amortisman",
        depreciationStartDate: "2024-03-01",
        location: "Genel Merkez",
        responsiblePerson: "Mehmet Kaya",
        status: "active",
        accumulatedDepreciation: 148500,
        netBookValue: 1101500,
    },
    {
        id: "3",
        code: "SV-2023-015",
        name: "Dernek Merkezi İdari Masa Seti",
        subClassId: "demirbas_mobilya",
        brandModel: "Ofis Mobilya",
        costValue: 25000,
        currency: "TRY",
        acquisitionDate: "2023-06-01",
        invoiceNo: "FTR-2023-0089",
        usefulLife: 5,
        depreciationRate: 20,
        depreciationMethod: "Normal Amortisman",
        depreciationStartDate: "2023-06-01",
        location: "Genel Merkez",
        status: "active",
        accumulatedDepreciation: 7500,
        netBookValue: 17500,
    },
    {
        id: "4",
        code: "SV-2022-008",
        name: "Güvenlik Kamera Sistemi",
        subClassId: "tesis_guvenlik",
        serialOrPlate: "CAM-2022-001",
        brandModel: "Hikvision Pro",
        costValue: 35000,
        currency: "TRY",
        acquisitionDate: "2022-01-01",
        usefulLife: 5,
        depreciationRate: 20,
        depreciationMethod: "Normal Amortisman",
        depreciationStartDate: "2022-01-01",
        location: "Genel Merkez",
        status: "broken",
        accumulatedDepreciation: 21000,
        netBookValue: 14000,
    },
    {
        id: "5",
        code: "SV-2020-003",
        name: "Eski Yazıcı - Canon",
        subClassId: "demirbas_bilgisayar",
        serialOrPlate: "CNX123",
        brandModel: "Canon ImageClass",
        costValue: 8000,
        currency: "TRY",
        acquisitionDate: "2020-01-01",
        usefulLife: 4,
        depreciationRate: 25,
        depreciationMethod: "Normal Amortisman",
        depreciationStartDate: "2020-01-01",
        location: "Depo",
        status: "scrapped",
        accumulatedDepreciation: 8000,
        netBookValue: 0,
    },
];

const getMainClassIcon = (mainClass: AssetMainClass) => {
    switch (mainClass) {
        case "binalar": return Building2;
        case "tesis": return Wrench;
        case "tasitlar": return Car;
        case "demirbaslar": return Monitor;
        case "ozel": return FileText;
        case "maddi_olmayan": return Globe;
        default: return FileText;
    }
};

export default function AssetListPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterClass, setFilterClass] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterLocation, setFilterLocation] = useState<string>("");
    const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
    const [assetToScrap, setAssetToScrap] = useState<Asset | null>(null);

    // Get unique main classes from VUK data
    const mainClasses = useMemo(() => {
        const classes = new Set(VUK_ASSET_CLASSES.map(c => c.mainClass));
        return Array.from(classes);
    }, []);

    // Filter assets
    const filteredAssets = useMemo(() => {
        return MOCK_ASSETS.filter(asset => {
            const subClass = VUK_ASSET_CLASSES.find(c => c.id === asset.subClassId);

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    asset.code.toLowerCase().includes(query) ||
                    asset.name.toLowerCase().includes(query) ||
                    asset.serialOrPlate?.toLowerCase().includes(query) ||
                    asset.brandModel?.toLowerCase().includes(query) ||
                    subClass?.name.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Class filter
            if (filterClass && subClass?.mainClass !== filterClass) return false;

            // Status filter
            if (filterStatus && asset.status !== filterStatus) return false;

            // Location filter
            if (filterLocation && asset.location !== filterLocation) return false;

            return true;
        });
    }, [searchQuery, filterClass, filterStatus, filterLocation]);

    const handleScrap = (asset: Asset) => {
        setAssetToScrap(asset);
        setIsScrapModalOpen(true);
    };

    const confirmScrap = () => {
        if (assetToScrap) {
            toast.success(`${assetToScrap.name} hurdaya ayrıldı!`);
            setIsScrapModalOpen(false);
            setAssetToScrap(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const getStatusBadge = (status: AssetStatus) => {
        const config = STATUS_LABELS[status];
        const colorClasses = {
            green: "bg-green-100 text-green-800",
            yellow: "bg-yellow-100 text-yellow-800",
            red: "bg-red-100 text-red-800",
            gray: "bg-gray-100 text-gray-800",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <TrendingDown className="text-blue-600" />
                        Sabit Varlık Listesi
                    </h1>
                    <p className="text-gray-600">
                        Sistemdeki tüm sabit varlıkları görüntüleyin ve yönetin
                    </p>
                </div>
                <button
                    onClick={() => router.push("/assets/add")}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg"
                >
                    <Plus size={20} />
                    Yeni Varlık Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Filtreler</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Ara... (Sicil No, Ad, Seri No)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Class Filter */}
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tüm Sınıflar</option>
                        {mainClasses.map(mc => (
                            <option key={mc} value={mc}>{MAIN_CLASS_NAMES[mc]}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tüm Durumlar</option>
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>


                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Toplam Varlık</p>
                    <p className="text-2xl font-bold text-gray-900">{MOCK_ASSETS.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Toplam Maliyet</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(MOCK_ASSETS.reduce((sum, a) => sum + a.costValue, 0))}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Birikmiş Amortisman</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(MOCK_ASSETS.reduce((sum, a) => sum + a.accumulatedDepreciation, 0))}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Net Defter Değeri</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(MOCK_ASSETS.reduce((sum, a) => sum + a.netBookValue, 0))}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                            <tr>
                                <th className="px-4 py-4 text-left text-sm font-semibold">Sicil No</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold">Varlık Adı</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold">Sınıf</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold">Edinme Tarihi</th>
                                <th className="px-4 py-4 text-right text-sm font-semibold">Maliyet</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold">Oran %</th>
                                <th className="px-4 py-4 text-right text-sm font-semibold">Birikmiş Amor.</th>
                                <th className="px-4 py-4 text-right text-sm font-semibold">Net Değer</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold">Durum</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                        Varlık bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset, index) => {
                                    const subClass = VUK_ASSET_CLASSES.find(c => c.id === asset.subClassId);
                                    const IconComponent = subClass ? getMainClassIcon(subClass.mainClass) : FileText;

                                    return (
                                        <tr
                                            key={asset.id}
                                            className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                } hover:bg-blue-50`}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm font-medium text-gray-900">
                                                    {asset.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent size={18} className="text-gray-500" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{asset.name}</p>
                                                        {asset.serialOrPlate && (
                                                            <p className="text-xs text-gray-500">{asset.serialOrPlate}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-700">{subClass?.name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {new Date(asset.acquisitionDate).toLocaleDateString('tr-TR')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(asset.costValue)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    %{asset.depreciationRate.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-medium text-orange-600">
                                                    {formatCurrency(asset.accumulatedDepreciation)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-medium text-green-600">
                                                    {formatCurrency(asset.netBookValue)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(asset.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Detay Gör"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    {asset.status !== "scrapped" && asset.status !== "sold" && (
                                                        <button
                                                            onClick={() => handleScrap(asset)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hurdaya Ayır"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scrap Confirmation Modal */}
            <Modal
                isOpen={isScrapModalOpen}
                onClose={() => setIsScrapModalOpen(false)}
                title="Hurdaya Ayırma Onayı"
                size="sm"
            >
                {assetToScrap && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-lg text-gray-900 mb-2">
                                Bu varlığı hurdaya ayırmak istediğinize emin misiniz?
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">{assetToScrap.name}</span> ({assetToScrap.code}) hurdaya ayrılacaktır.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsScrapModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmScrap}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                Hurdaya Ayır
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

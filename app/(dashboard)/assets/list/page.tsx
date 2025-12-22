"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
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
    Loader2,
    AlertCircle,
    ImageIcon,
    DollarSign,
    User,
    Tag,
} from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import useGetAllFixedAssets, { FixedAsset } from "@/hooks/useGetAllFixedAssets";
import useUpdateFixedAssetStatus, { FIXED_ASSET_STATUS_OPTIONS, FixedAssetStatus } from "@/hooks/useUpdateFixedAssetStatus";
import useUpdateFixedAsset, { UpdateFixedAssetPayload } from "@/hooks/useUpdateFixedAsset";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { MAIN_CLASS_NAMES } from "@/lib/types/asset.types";

// Status için renk belirleme
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Kullanımda': return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'Arızalı': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case 'Hurdaya Çekilmiş': return { bg: 'bg-red-100', text: 'text-red-800' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

// Asset sınıfına göre ikon belirleme
const getAssetClassIcon = (assetClass: string) => {
    const lowerClass = assetClass?.toLowerCase() || '';
    if (lowerClass.includes('bina')) return Building2;
    if (lowerClass.includes('taşıt') || lowerClass.includes('araç')) return Car;
    if (lowerClass.includes('bilgisayar') || lowerClass.includes('demirbaş')) return Monitor;
    if (lowerClass.includes('tesis') || lowerClass.includes('makine')) return Wrench;
    if (lowerClass.includes('maddi olmayan')) return Globe;
    return FileText;
};

export default function AssetListPage() {
    const { assets, summary, isLoading, isError, refetch } = useGetAllFixedAssets();
    const { updateStatus, isLoading: isUpdatingStatus } = useUpdateFixedAssetStatus();
    const { updateAsset, isLoading: isUpdatingAsset } = useUpdateFixedAsset();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterClass, setFilterClass] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    // Modal states
    const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
    const [assetToScrap, setAssetToScrap] = useState<FixedAsset | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<FixedAsset | null>(null);
    const [editFormData, setEditFormData] = useState<UpdateFixedAssetPayload>({});

    // Detail modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [assetToView, setAssetToView] = useState<FixedAsset | null>(null);

    // Unique asset classes for filter dropdown
    const assetClasses = useMemo(() => {
        const classes = new Set(assets.map(a => a.assetClass));
        return Array.from(classes).filter(Boolean);
    }, [assets]);

    // Filter assets
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    asset.registrationNo?.toLowerCase().includes(query) ||
                    asset.name?.toLowerCase().includes(query) ||
                    asset.brandModel?.toLowerCase().includes(query) ||
                    asset.assetClass?.toLowerCase().includes(query) ||
                    asset.assetSubClass?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Class filter
            if (filterClass && asset.assetClass !== filterClass) return false;

            // Status filter
            if (filterStatus && asset.status !== filterStatus) return false;

            return true;
        });
    }, [assets, searchQuery, filterClass, filterStatus]);

    const handleScrap = (asset: FixedAsset) => {
        setAssetToScrap(asset);
        setIsScrapModalOpen(true);
    };

    const handleViewDetail = (asset: FixedAsset) => {
        setAssetToView(asset);
        setIsDetailModalOpen(true);
    };

    const confirmScrap = async () => {
        if (assetToScrap) {
            const result = await updateStatus(assetToScrap.id, 'Hurdaya Çekilmiş');
            if (result.success) {
                toast.success(`${assetToScrap.name} hurdaya ayrıldı!`);
                refetch();
            } else {
                toast.error(result.error || 'Bir hata oluştu');
            }
            setIsScrapModalOpen(false);
            setAssetToScrap(null);
        }
    };

    const handleEdit = (asset: FixedAsset) => {
        setAssetToEdit(asset);
        setEditFormData({
            registrationNo: asset.registrationNo,
            name: asset.name,
            assetClass: asset.assetClass,
            assetSubClass: asset.assetSubClass,
            brandModel: asset.brandModel,
            costValue: asset.costValue,
            acquisitionDate: asset.acquisitionDate?.split('T')[0] || '',
            invoiceNo: asset.invoiceNo,
            supplierName: asset.supplierName,
            usefulLife: asset.usefulLife,
            depreciationRate: asset.depreciationRate,
            salvageValue: asset.salvageValue,
            depreciationStartDate: asset.depreciationStartDate?.split('T')[0] || '',
            responsiblePerson: asset.responsiblePerson,
            warrantyEndDate: asset.warrantyEndDate?.split('T')[0] || '',
            revaluationApplied: asset.revaluationApplied,
            description: asset.description,
            status: asset.status,
        });
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? (value ? parseFloat(value) : undefined) : value
        }));
    };

    const saveEdit = async () => {
        if (assetToEdit) {
            const result = await updateAsset(assetToEdit.id, editFormData);
            if (result.success) {
                toast.success('Varlık başarıyla güncellendi!');
                refetch();
            } else {
                toast.error(result.error || 'Bir hata oluştu');
            }
            setIsEditModalOpen(false);
            setAssetToEdit(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
        }).format(value || 0);
    };

    const getStatusBadge = (status: string) => {
        const colors = getStatusColor(status);
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {status}
            </span>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Sabit varlıklar yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-lg font-medium text-gray-900">Veri yüklenirken hata oluştu</p>
                    <p className="text-gray-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Sabit Varlık Listesi
                </h1>
                <p className="text-gray-600">
                    Sistemdeki tüm sabit varlıkları görüntüleyin ve yönetin
                </p>
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
                            placeholder="Ara... (Sicil No, Ad, Marka)"
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
                        {Object.values(MAIN_CLASS_NAMES).map(className => (
                            <option key={className} value={className}>{className}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tüm Durumlar</option>
                        {FIXED_ASSET_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Toplam Varlık</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalAssets}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Toplam Maliyet</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(summary.totalCost)}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Birikmiş Amortisman</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(summary.totalAccumulatedDepreciation)}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Net Defter Değeri</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(summary.totalNetBookValue)}
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
                                    const IconComponent = getAssetClassIcon(asset.assetClass);

                                    return (
                                        <tr
                                            key={asset.id}
                                            className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                } hover:bg-blue-50`}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-sm font-medium text-gray-900">
                                                    {asset.registrationNo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent size={18} className="text-gray-500" />
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{asset.name}</p>
                                                        {asset.brandModel && (
                                                            <p className="text-xs text-gray-500">{asset.brandModel}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-700">{asset.assetSubClass}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString('tr-TR') : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(asset.costValue)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm font-medium text-gray-900">
                                                    %{(asset.depreciationRate || 0).toFixed(2)}
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
                                                        onClick={() => handleViewDetail(asset)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Detay Gör"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(asset)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    {asset.status !== "Hurdaya Çekilmiş" && (
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
                                <span className="font-semibold">{assetToScrap.name}</span> ({assetToScrap.registrationNo}) hurdaya ayrılacaktır.
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
                                disabled={isUpdatingStatus}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                                Hurdaya Ayır
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Varlık Düzenle"
                size="lg"
            >
                {assetToEdit && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sicil No</label>
                                <input type="text" name="registrationNo" value={editFormData.registrationNo || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Adı</label>
                                <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Sınıfı</label>
                                <input type="text" name="assetClass" value={editFormData.assetClass || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Sınıf</label>
                                <input type="text" name="assetSubClass" value={editFormData.assetSubClass || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marka/Model</label>
                                <input type="text" name="brandModel" value={editFormData.brandModel || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maliyet Değeri</label>
                                <input type="number" name="costValue" value={editFormData.costValue || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edinme Tarihi</label>
                                <input type="date" name="acquisitionDate" value={editFormData.acquisitionDate || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fatura No</label>
                                <input type="text" name="invoiceNo" value={editFormData.invoiceNo || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tedarikçi Adı</label>
                                <input type="text" name="supplierName" value={editFormData.supplierName || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Faydalı Ömür (Yıl)</label>
                                <input type="number" name="usefulLife" value={editFormData.usefulLife || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amortisman Oranı (%)</label>
                                <input type="number" step="0.01" name="depreciationRate" value={editFormData.depreciationRate || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hurda Değeri</label>
                                <input type="number" name="salvageValue" value={editFormData.salvageValue || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amortisman Başlangıç</label>
                                <input type="date" name="depreciationStartDate" value={editFormData.depreciationStartDate || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sorumlu Kişi</label>
                                <input type="text" name="responsiblePerson" value={editFormData.responsiblePerson || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Garanti Bitiş</label>
                                <input type="date" name="warrantyEndDate" value={editFormData.warrantyEndDate || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                <select name="status" value={editFormData.status || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    {FIXED_ASSET_STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea name="description" value={editFormData.description || ''} onChange={handleEditFormChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="revaluationApplied" checked={editFormData.revaluationApplied || false} onChange={handleEditFormChange} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                            <label className="text-sm font-medium text-gray-700">Yeniden Değerleme Uygulandı</label>
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold">İptal</button>
                            <button onClick={saveEdit} disabled={isUpdatingAsset} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                                {isUpdatingAsset && <Loader2 className="w-4 h-4 animate-spin" />}
                                Kaydet
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Detail View Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Varlık Detayları"
                size="lg"
            >
                {assetToView && (
                    <div className="space-y-6">
                        {/* Asset Image */}
                        <div className="flex justify-center">
                            <div className="w-full max-w-md">
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                    <img
                                        src={API_ENDPOINTS.fixedAssets.getImage(assetToView.id)}
                                        alt={assetToView.name}
                                        className="w-full h-64 object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent && !parent.querySelector('.no-image-placeholder')) {
                                                const placeholder = document.createElement('div');
                                                placeholder.className = 'no-image-placeholder flex flex-col items-center justify-center h-64 text-gray-400';
                                                placeholder.innerHTML = `
                                                    <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                    <span class="text-sm">Resim bulunamadı</span>
                                                `;
                                                parent.appendChild(placeholder);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Asset Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag size={16} className="text-blue-600" />
                                    <span className="text-sm font-medium text-gray-500">Sicil No</span>
                                </div>
                                <p className="text-gray-900 font-semibold">{assetToView.registrationNo}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={16} className="text-purple-600" />
                                    <span className="text-sm font-medium text-gray-500">Varlık Adı</span>
                                </div>
                                <p className="text-gray-900 font-semibold">{assetToView.name}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-gray-500">Sınıf / Alt Sınıf</span>
                                </div>
                                <p className="text-gray-900 font-semibold">{assetToView.assetClass}</p>
                                <p className="text-sm text-gray-600">{assetToView.assetSubClass}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={16} className="text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-500">Maliyet / Net Değer</span>
                                </div>
                                <p className="text-gray-900 font-semibold">{formatCurrency(assetToView.costValue)}</p>
                                <p className="text-sm text-green-600">{formatCurrency(assetToView.netBookValue)} (Net)</p>
                            </div>

                            {assetToView.brandModel && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Monitor size={16} className="text-indigo-600" />
                                        <span className="text-sm font-medium text-gray-500">Marka / Model</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{assetToView.brandModel}</p>
                                </div>
                            )}

                            {assetToView.responsiblePerson && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={16} className="text-pink-600" />
                                        <span className="text-sm font-medium text-gray-500">Sorumlu Kişi</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{assetToView.responsiblePerson}</p>
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-orange-600" />
                                    <span className="text-sm font-medium text-gray-500">Edinme Tarihi</span>
                                </div>
                                <p className="text-gray-900 font-semibold">
                                    {assetToView.acquisitionDate ? new Date(assetToView.acquisitionDate).toLocaleDateString('tr-TR') : '-'}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={16} className="text-gray-600" />
                                    <span className="text-sm font-medium text-gray-500">Durum</span>
                                </div>
                                {getStatusBadge(assetToView.status)}
                            </div>

                            {assetToView.description && (
                                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText size={16} className="text-gray-600" />
                                        <span className="text-sm font-medium text-gray-500">Açıklama</span>
                                    </div>
                                    <p className="text-gray-900">{assetToView.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
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
    Loader2,
    AlertCircle,
    Download,
    ImageIcon,
} from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import useGetAllFixedAssets, { FixedAsset } from "@/hooks/useGetAllFixedAssets";
import useUpdateFixedAssetStatus, { FIXED_ASSET_STATUS_OPTIONS } from "@/hooks/useUpdateFixedAssetStatus";
import useUpdateFixedAsset, { UpdateFixedAssetPayload } from "@/hooks/useUpdateFixedAsset";
import useDeleteFixedAsset from "@/hooks/useDeleteFixedAsset";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { MAIN_CLASS_NAMES } from "@/lib/types/asset.types";

// Durum Renkleri
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Kullanımda': return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'Arızalı': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case 'Hurdaya Çekilmiş': return { bg: 'bg-red-100', text: 'text-red-800' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

// Sınıf İkonları
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
    // Backend Hooks
    const { assets, summary, isLoading, isError, refetch } = useGetAllFixedAssets();
    const { updateStatus, isLoading: isUpdatingStatus } = useUpdateFixedAssetStatus();
    const { updateAsset, isLoading: isUpdatingAsset } = useUpdateFixedAsset();
    const { deleteFixedAsset, isLoading: isDeleting } = useDeleteFixedAsset();

    // Local States
    const [searchQuery, setSearchQuery] = useState("");
    const [filterClass, setFilterClass] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    // Modal States
    const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
    const [assetToScrap, setAssetToScrap] = useState<FixedAsset | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<FixedAsset | null>(null);
    const [editFormData, setEditFormData] = useState<UpdateFixedAssetPayload>({});
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [assetToView, setAssetToView] = useState<FixedAsset | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<FixedAsset | null>(null);

    // Image state for detail modal
    const [assetImageUrl, setAssetImageUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load image when detail modal opens
    useEffect(() => {
        if (assetToView && isDetailModalOpen) {
            setIsLoadingImage(true);
            setImageError(false);
            setAssetImageUrl(null);

            const token = localStorage.getItem('token');

            fetch(API_ENDPOINTS.fixedAssets.getImage(assetToView.id), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Image not found');
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setAssetImageUrl(url);
                    setIsLoadingImage(false);
                })
                .catch(() => {
                    setImageError(true);
                    setIsLoadingImage(false);
                });
        }

        return () => {
            if (assetImageUrl) {
                URL.revokeObjectURL(assetImageUrl);
            }
        };
    }, [assetToView, isDetailModalOpen]);

    // Filtreleme Mantığı
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            if (debouncedSearch && debouncedSearch.trim() !== "") {
                const query = debouncedSearch.toLowerCase().trim();
                const matchesSearch =
                    (asset.registrationNo && asset.registrationNo.toLowerCase().includes(query)) ||
                    (asset.name && asset.name.toLowerCase().includes(query)) ||
                    (asset.brandModel && asset.brandModel.toLowerCase().includes(query)) ||
                    (asset.assetClass && asset.assetClass.toLowerCase().includes(query)) ||
                    (asset.assetSubClass && asset.assetSubClass.toLowerCase().includes(query)) ||
                    (asset.responsiblePerson && asset.responsiblePerson.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }
            if (filterClass && asset.assetClass !== filterClass) return false;
            if (filterStatus && asset.status !== filterStatus) return false;
            return true;
        });
    }, [assets, debouncedSearch, filterClass, filterStatus]);

    const handleScrap = (asset: FixedAsset) => {
        setAssetToScrap(asset);
        setIsScrapModalOpen(true);
    };

    const handleDelete = (asset: FixedAsset) => {
        setAssetToDelete(asset);
        setIsDeleteModalOpen(true);
    };

    const handleViewDetail = (asset: FixedAsset) => {
        setAssetToView(asset);
        setAssetImageUrl(null);
        setImageError(false);
        setIsDetailModalOpen(true);
    };

    const handleExportExcel = () => {
        try {
            if (filteredAssets.length === 0) {
                toast.error("Dışa aktarılacak veri bulunamadı.");
                return;
            }

            const exportData = filteredAssets.map((asset) => ({
                "Sicil No": asset.registrationNo,
                "Varlık Adı": asset.name,
                "Varlık Sınıfı": asset.assetClass,
                "Alt Sınıf": asset.assetSubClass,
                "Marka/Model": asset.brandModel || "-",
                "Edinme Tarihi": asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString('tr-TR') : "-",
                "Maliyet Değeri": asset.costValue,
                "Amortisman Oranı (%)": asset.depreciationRate,
                "Birikmiş Amortisman": asset.accumulatedDepreciation,
                "Net Defter Değeri": asset.netBookValue,
                "Sorumlu Kişi": asset.responsiblePerson || "-",
                "Tedarikçi": asset.supplierName || "-",
                "Durum": asset.status
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Varlıklar");

            const date = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `sabit-varlik-listesi-${date}.xlsx`);

            toast.success("Excel dosyası başarıyla indirildi.");
        } catch (error) {
            console.error("Excel Error:", error);
            toast.error("Dosya oluşturulurken bir hata oluştu.");
        }
    };

    const confirmScrap = async () => {
        if (assetToScrap) {
            const result = await updateStatus(assetToScrap.id, 'Hurdaya Çekilmiş');
            if (result.success) {
                toast.success(`${assetToScrap.name} hurdaya ayrıldı!`);
                refetch();
            } else {
                toast.error(result.error || 'İşlem başarısız oldu');
            }
            setIsScrapModalOpen(false);
            setAssetToScrap(null);
        }
    };

    const confirmDelete = async () => {
        if (assetToDelete) {
            const result = await deleteFixedAsset(assetToDelete.id);
            if (result.success) {
                toast.success(`${assetToDelete.name} başarıyla silindi!`);
                refetch();
            } else {
                toast.error(result.error || 'Silme işlemi başarısız oldu');
            }
            setIsDeleteModalOpen(false);
            setAssetToDelete(null);
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
                toast.error(result.error || 'Güncelleme hatası');
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

    if (isLoading) return (
        <div className="p-6 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    if (isError) return (
        <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="font-semibold">Veri yüklenemedi.</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Tekrar Dene</button>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Sabit Varlık Listesi</h1>
                    <p className="text-gray-600">Toplam {summary.totalAssets} varlık yönetiliyor</p>
                </div>

                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md"
                >
                    <Download size={20} />
                    Dışa Aktar
                </button>
            </div>

            {/* Filtreler */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Arama ve Filtreleme</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Sicil No, Ad, Marka veya Sorumlu Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tüm Sınıflar</option>
                        {Object.values(MAIN_CLASS_NAMES).map(className => (
                            <option key={className} value={className}>{className}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tüm Durumlar</option>
                        {FIXED_ASSET_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {(debouncedSearch || filterClass || filterStatus) && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap text-sm text-gray-600">
                        <span>Filtreler:</span>
                        {debouncedSearch && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Arama: "{debouncedSearch}"
                            </span>
                        )}
                        {filterClass && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {filterClass}
                            </span>
                        )}
                        {filterStatus && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                {filterStatus}
                            </span>
                        )}
                        <button
                            onClick={() => { setSearchQuery(""); setFilterClass(""); setFilterStatus(""); }}
                            className="text-red-500 hover:text-red-700 ml-2"
                        >
                            Temizle
                        </button>
                    </div>
                )}
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Toplam Kayıt</p>
                    <p className="text-xl font-bold text-gray-900">{summary.totalAssets}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Toplam Maliyet</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalCost)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Birikmiş Amortisman</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.totalAccumulatedDepreciation)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">Net Defter Değeri</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalNetBookValue)}</p>
                </div>
            </div>

            {/* Ana Tablo */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                            <tr className="text-sm">
                                <th className="px-4 py-4 text-left font-semibold">Sicil No</th>
                                <th className="px-4 py-4 text-left font-semibold">Varlık Adı</th>
                                <th className="px-4 py-4 text-left font-semibold">Alt Sınıf</th>
                                <th className="px-4 py-4 text-left font-semibold">Edinme Tarihi</th>
                                <th className="px-4 py-4 text-right font-semibold">Maliyet</th>
                                <th className="px-4 py-4 text-center font-semibold">Oran %</th>
                                <th className="px-4 py-4 text-right font-semibold">Net Değer</th>
                                <th className="px-4 py-4 text-center font-semibold">Durum</th>
                                <th className="px-4 py-4 text-center font-semibold">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500 italic">
                                        {debouncedSearch || filterClass || filterStatus
                                            ? "Arama kriterlerine uygun varlık bulunamadı."
                                            : "Henüz varlık eklenmemiş."}
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset, index) => {
                                    const IconComponent = getAssetClassIcon(asset.assetClass);
                                    return (
                                        <tr key={asset.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/50 transition-colors`}>
                                            <td className="px-4 py-3 font-mono text-xs font-semibold">{asset.registrationNo}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent size={16} className="text-gray-400" />
                                                    <span className="font-medium text-sm text-gray-800">{asset.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">{asset.assetSubClass}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString('tr-TR') : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(asset.costValue)}</td>
                                            <td className="px-4 py-3 text-center text-xs">%{(asset.depreciationRate || 0).toFixed(1)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-green-700">{formatCurrency(asset.netBookValue)}</td>
                                            <td className="px-4 py-3 text-center">{getStatusBadge(asset.status)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => handleViewDetail(asset)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md" title="Detay ve Resim"><Eye size={16} /></button>
                                                    <button onClick={() => handleEdit(asset)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md" title="Düzenle"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(asset)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md" title="Sil"><Trash2 size={16} /></button>
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

            {/* Scrap Modal */}
            <Modal isOpen={isScrapModalOpen} onClose={() => setIsScrapModalOpen(false)} title="Hurdaya Ayırma Onayı" size="sm">
                {assetToScrap && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-700 mb-2">Bu varlığı hurdaya ayırmak istediğinize emin misiniz?</p>
                            <p className="font-bold text-gray-900">{assetToScrap.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsScrapModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">İptal</button>
                            <button onClick={confirmScrap} disabled={isUpdatingStatus} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center">
                                {isUpdatingStatus ? <Loader2 className="animate-spin" size={18} /> : "Hurdaya Ayır"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Silme Onayı" size="sm">
                {assetToDelete && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-gray-700 mb-2">Bu varlığı kalıcı olarak silmek istediğinize emin misiniz?</p>
                            <p className="font-bold text-gray-900">{assetToDelete.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Sicil No: {assetToDelete.registrationNo}</p>
                            <p className="text-xs text-red-500 mt-3">Bu işlem geri alınamaz!</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">İptal</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center">
                                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : "Kalıcı Olarak Sil"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal - Full Version */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Varlık Düzenle" size="xl">
                {assetToEdit && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
                        {/* Temel Bilgiler */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">📋 Temel Bilgiler</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Adı *</label>
                                    <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sicil No</label>
                                    <input type="text" name="registrationNo" value={editFormData.registrationNo || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marka / Model</label>
                                    <input type="text" name="brandModel" value={editFormData.brandModel || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                    <select name="status" value={editFormData.status || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                        {FIXED_ASSET_STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sorumlu Kişi</label>
                                    <input type="text" name="responsiblePerson" value={editFormData.responsiblePerson || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Finansal Bilgiler */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">💰 Finansal Bilgiler</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Maliyet Bedeli (KDV Hariç) *</label>
                                    <input type="number" step="0.01" name="costValue" value={editFormData.costValue || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hurda Değeri</label>
                                    <input type="number" step="0.01" name="salvageValue" value={editFormData.salvageValue || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fatura No</label>
                                    <input type="text" name="invoiceNo" value={editFormData.invoiceNo || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tedarikçi</label>
                                    <input type="text" name="supplierName" value={editFormData.supplierName || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Tarihler */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">📅 Tarihler</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Edinme Tarihi *</label>
                                    <input type="date" name="acquisitionDate" value={editFormData.acquisitionDate || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amortisman Başlangıç</label>
                                    <input type="date" name="depreciationStartDate" value={editFormData.depreciationStartDate || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Garanti Bitiş</label>
                                    <input type="date" name="warrantyEndDate" value={editFormData.warrantyEndDate || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Amortisman Bilgileri */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">📊 Amortisman Bilgileri</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Faydalı Ömür (Yıl)</label>
                                    <input type="number" name="usefulLife" value={editFormData.usefulLife || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amortisman Oranı (%)</label>
                                    <input type="number" step="0.01" name="depreciationRate" value={editFormData.depreciationRate || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer mt-6">
                                        <input type="checkbox" name="revaluationApplied" checked={editFormData.revaluationApplied || false} onChange={handleEditFormChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">Yeniden Değerleme Uygulandı</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama / Notlar</label>
                            <textarea name="description" value={editFormData.description || ''} onChange={handleEditFormChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Varlık ile ilgili ek notlar..." />
                        </div>

                        {/* Kaydet Butonu */}
                        <button onClick={saveEdit} disabled={isUpdatingAsset} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 font-semibold text-lg shadow-md">
                            {isUpdatingAsset ? <Loader2 className="animate-spin" size={20} /> : "Değişiklikleri Kaydet"}
                        </button>
                    </div>
                )}
            </Modal>

            {/* Detail Modal with Image - Full Version */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Varlık Detayları" size="xl">
                {assetToView && (
                    <div className="space-y-5 max-h-[75vh] overflow-y-auto">
                        {/* Resim Bölümü */}
                        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[180px]">
                            {isLoadingImage ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <p className="text-sm text-gray-500">Resim yükleniyor...</p>
                                </div>
                            ) : imageError ? (
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <ImageIcon size={48} />
                                    <p className="text-sm">Bu varlık için resim eklenmemiş</p>
                                </div>
                            ) : assetImageUrl ? (
                                <img src={assetImageUrl} alt={assetToView.name} className="max-h-[250px] max-w-full object-contain rounded-lg shadow-md" />
                            ) : null}
                        </div>

                        {/* Temel Bilgiler */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">📋 Temel Bilgiler</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Varlık Adı</p><p className="font-bold text-gray-900">{assetToView.name}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Sicil No</p><p className="font-bold font-mono">{assetToView.registrationNo}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Durum</p><div className="mt-1">{getStatusBadge(assetToView.status)}</div></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Varlık Sınıfı</p><p className="font-semibold text-sm">{assetToView.assetClass}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Alt Sınıf</p><p className="font-semibold text-sm">{assetToView.assetSubClass}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Marka / Model</p><p className="font-semibold">{assetToView.brandModel || "-"}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Sorumlu Kişi</p><p className="font-semibold">{assetToView.responsiblePerson || "-"}</p></div>
                            </div>
                        </div>

                        {/* Finansal Bilgiler */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">💰 Finansal Bilgiler</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-600">Maliyet Bedeli</p>
                                    <p className="font-bold text-blue-700 text-lg">{formatCurrency(assetToView.costValue)}</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-xs text-orange-600">Birikmiş Amortisman</p>
                                    <p className="font-bold text-orange-700 text-lg">{formatCurrency(assetToView.accumulatedDepreciation)}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-600">Net Defter Değeri</p>
                                    <p className="font-bold text-green-700 text-lg">{formatCurrency(assetToView.netBookValue)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Hurda Değeri</p>
                                    <p className="font-bold">{formatCurrency(assetToView.salvageValue || 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tedarikçi & Fatura */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">🏢 Tedarikçi & Fatura</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Tedarikçi</p><p className="font-semibold">{assetToView.supplierName || "-"}</p></div>
                                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Fatura No</p><p className="font-semibold">{assetToView.invoiceNo || "-"}</p></div>
                            </div>
                        </div>

                        {/* Tarihler */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">📅 Tarihler</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Edinme Tarihi</p>
                                    <p className="font-semibold">{assetToView.acquisitionDate ? new Date(assetToView.acquisitionDate).toLocaleDateString('tr-TR') : "-"}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Amortisman Başlangıç</p>
                                    <p className="font-semibold">{assetToView.depreciationStartDate ? new Date(assetToView.depreciationStartDate).toLocaleDateString('tr-TR') : "-"}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Garanti Bitiş</p>
                                    <p className="font-semibold">{assetToView.warrantyEndDate ? new Date(assetToView.warrantyEndDate).toLocaleDateString('tr-TR') : "-"}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Geçen Yıl</p>
                                    <p className="font-semibold">{assetToView.yearsElapsed || 0} yıl</p>
                                </div>
                            </div>
                        </div>

                        {/* Amortisman Bilgileri */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b flex items-center gap-2">📊 Amortisman Bilgileri</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Faydalı Ömür</p>
                                    <p className="font-semibold">{assetToView.usefulLife || 0} yıl</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Amortisman Oranı</p>
                                    <p className="font-semibold">%{(assetToView.depreciationRate || 0).toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Yeniden Değerleme</p>
                                    <p className="font-semibold">{assetToView.revaluationApplied ? "✅ Uygulandı" : "❌ Uygulanmadı"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Açıklama */}
                        {assetToView.description && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-xs text-yellow-700 font-medium mb-1">📝 Açıklama</p>
                                <p className="text-sm text-gray-700">{assetToView.description}</p>
                            </div>
                        )}

                        {/* Sistem Bilgileri */}
                        <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-500 flex justify-between">
                            <span>Oluşturulma: {assetToView.createdAt ? new Date(assetToView.createdAt).toLocaleString('tr-TR') : "-"}</span>
                            <span>Son Güncelleme: {assetToView.updatedAt ? new Date(assetToView.updatedAt).toLocaleString('tr-TR') : "-"}</span>
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-3">
                            <button onClick={() => { setIsDetailModalOpen(false); handleEdit(assetToView); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
                                <Edit size={18} /> Düzenle
                            </button>
                            <button onClick={() => setIsDetailModalOpen(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">Kapat</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

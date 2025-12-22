"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx"; // Excel dışa aktarım kütüphanesi
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
    DollarSign,
    User,
    Tag,
    Download, // İndirme ikonu
} from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import useGetAllFixedAssets, { FixedAsset } from "@/hooks/useGetAllFixedAssets";
import useUpdateFixedAssetStatus, { FIXED_ASSET_STATUS_OPTIONS } from "@/hooks/useUpdateFixedAssetStatus";
import useUpdateFixedAsset, { UpdateFixedAssetPayload } from "@/hooks/useUpdateFixedAsset";
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

    // Filtreleme Mantığı
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
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
            if (filterClass && asset.assetClass !== filterClass) return false;
            if (filterStatus && asset.status !== filterStatus) return false;
            return true;
        });
    }, [assets, searchQuery, filterClass, filterStatus]);

    const handleScrap = (asset: FixedAsset) => {
    setAssetToScrap(asset);
    setIsScrapModalOpen(true);
};

    // Excel Dışa Aktarma Fonksiyonu
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

    // Hurdaya Ayırma
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

    // Düzenleme Başlatma
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
            {/* Header Bölümü */}
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
                            placeholder="Sicil No veya Ad ile Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
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
                                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500 italic">Varlık bulunamadı.</td>
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
                                                    <button onClick={() => { setAssetToView(asset); setIsDetailModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md" title="Detay"><Eye size={16} /></button>
                                                    <button onClick={() => handleEdit(asset)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-md" title="Düzenle"><Edit size={16} /></button>
                                                    {asset.status !== "Hurdaya Çekilmiş" && (
                                                        <button onClick={() => handleScrap(asset)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md" title="Hurda"><Trash2 size={16} /></button>
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

            {/* MODALLAR */}
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
                            <button onClick={confirmScrap} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Hurdaya Ayır</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal (Özetlenmiş) */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Varlık Düzenle" size="lg">
                {assetToEdit && (
                    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                        <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} placeholder="Varlık Adı" className="col-span-2 p-2 border rounded-lg" />
                        <input type="number" name="costValue" value={editFormData.costValue} onChange={handleEditFormChange} placeholder="Maliyet" className="p-2 border rounded-lg" />
                        <input type="date" name="acquisitionDate" value={editFormData.acquisitionDate} onChange={handleEditFormChange} className="p-2 border rounded-lg" />
                        <textarea name="description" value={editFormData.description} onChange={handleEditFormChange} placeholder="Açıklama" className="col-span-2 p-2 border rounded-lg" rows={3} />
                        <button onClick={saveEdit} disabled={isUpdatingAsset} className="col-span-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center">
                            {isUpdatingAsset ? <Loader2 className="animate-spin" /> : "Değişiklikleri Kaydet"}
                        </button>
                    </div>
                )}
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Varlık Detayları" size="lg">
                {assetToView && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Adı</p><p className="font-bold">{assetToView.name}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Sicil No</p><p className="font-bold">{assetToView.registrationNo}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Net Değer</p><p className="font-bold text-green-600">{formatCurrency(assetToView.netBookValue)}</p></div>
                            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Sorumlu</p><p className="font-bold">{assetToView.responsiblePerson || "-"}</p></div>
                        </div>
                        <button onClick={() => setIsDetailModalOpen(false)} className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg">Kapat</button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
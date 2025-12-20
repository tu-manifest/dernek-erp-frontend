"use client";

import React, { useState, useEffect } from "react";
import {
    Edit,
    Trash2,
    Search,
    Download,
    Eye,
    Calendar,
    Banknote,
    Target,
    Tags,
    CreditCard,
    Plus,
    Loader2,
    AlertCircle,
    X,
    User,
    Clock,
    Receipt
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Modal from "./Modal";
import { toast } from "sonner";
import useGetAllCampaigns, { Campaign } from "../hooks/useGetAllCampaigns";
import useGetCampaignDonations, { CampaignDonation } from "../hooks/useGetCampaignDonations";
import useUpdateCampaign, { UpdateCampaignPayload } from "../hooks/useUpdateCampaign";
import useDeleteCampaign from "../hooks/useDeleteCampaign";

interface CampaignTableProps {
    onRefresh?: () => void;
}

const CampaignTable: React.FC<CampaignTableProps> = ({ onRefresh }) => {
    const { campaigns, isLoading: isCampaignsLoading, isError: isCampaignsError, refetch } = useGetAllCampaigns();
    const { donations, isLoading: isDonationsLoading, isError: isDonationsError, error: donationsError, fetchDonations, reset: resetDonations } = useGetCampaignDonations();
    const { updateCampaign, isLoading: isUpdating, error: updateError, reset: resetUpdate } = useUpdateCampaign();
    const { deleteCampaign, isLoading: isDeleting, error: deleteError, reset: resetDelete } = useDeleteCampaign();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortField, setSortField] = useState<keyof Campaign>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);

    // Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        name: "",
        type: "",
        targetAmount: "",
        description: "",
        duration: "",
        iban: ""
    });

    // Kampanya türleri
    const campaignTypes = [
        "Genel Bağış",
        "Sosyal Destek",
        "Kurban",
        "Eğitim",
        "Su",
        "Sağlık",
        "Afet Yardım",
        "Zekat"
    ];

    // Durum etiketleri ve renkleri
    const statusLabels: Record<string, string> = {
        active: "Aktif",
        completed: "Tamamlandı",
        paused: "Duraklatıldı"
    };

    // Filtreleme ve arama
    const filteredCampaigns = campaigns
        .filter((campaign) => {
            const matchesSearch =
                campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filterType === "all" ||
                campaign.type === filterType ||
                campaign.status === filterType;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (sortDirection === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    const handleSort = (field: keyof Campaign) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleSelectCampaign = (campaignId: number) => {
        setSelectedCampaigns((prev) =>
            prev.includes(campaignId)
                ? prev.filter((id) => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    const handleSelectAll = () => {
        if (selectedCampaigns.length === filteredCampaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(filteredCampaigns.map((campaign) => campaign.id));
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return "₺0";
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY"
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const calculateProgress = (collected: number = 0, target: number = 0) => {
        if (target === 0) return 0;
        return Math.min(100, Math.round((collected / target) * 100));
    };

    // View Donations Modal Handlers
    const handleViewClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        resetDonations();
        fetchDonations(campaign.id);
        setIsViewModalOpen(true);
    };

    // Edit Modal Handlers
    const handleEditClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setEditFormData({
            name: campaign.name,
            type: campaign.type,
            targetAmount: campaign.targetAmount?.toString() || "",
            description: campaign.description || "",
            duration: campaign.duration || "",
            iban: campaign.iban || ""
        });
        resetUpdate();
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaign) return;

        const payload: UpdateCampaignPayload = {
            name: editFormData.name,
            type: editFormData.type,
            targetAmount: editFormData.targetAmount ? parseFloat(editFormData.targetAmount) : undefined,
            description: editFormData.description,
            duration: editFormData.duration,
            iban: editFormData.iban
        };

        const success = await updateCampaign(selectedCampaign.id, payload);

        if (success) {
            setIsEditModalOpen(false);
            setSelectedCampaign(null);
            toast.success("Kampanya başarıyla güncellendi!");
            refetch();
            onRefresh?.();
        } else {
            toast.error(updateError || "Kampanya güncellenirken bir hata oluştu!");
        }
    };

    // Delete Modal Handlers
    const handleDeleteClick = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        resetDelete();
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCampaign) return;

        const success = await deleteCampaign(selectedCampaign.id);

        if (success) {
            setIsDeleteModalOpen(false);
            setSelectedCampaign(null);
            toast.success("Kampanya başarıyla silindi!");
            refetch();
            onRefresh?.();
        } else {
            toast.error(deleteError || "Kampanya silinirken bir hata oluştu!");
        }
    };

    // Excel Export
    const handleExportExcel = () => {
        if (!filteredCampaigns.length) {
            toast.error("Listelenecek kampanya bulunamadı!");
            return;
        }

        const exportData = filteredCampaigns.map((campaign) => ({
            "Kampanya Adı": campaign.name,
            "Kampanya Türü": campaign.type,
            "Hedef Tutar": campaign.targetAmount,
            "Toplanan Tutar": campaign.collectedAmount || 0,
            "Süre": campaign.duration,
            "IBAN": campaign.iban,
            "Açıklama": campaign.description || "",
            "Durum": statusLabels[campaign.status || "active"] || "Aktif"
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kampanyalar");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `KampanyaListesi_${new Date().toLocaleDateString("tr-TR")}.xlsx`);
    };

    // Status badge component with enhanced styling
    const StatusBadge = ({ status }: { status: string }) => {
        const getStatusStyles = () => {
            switch (status) {
                case 'active':
                    return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 animate-pulse';
                case 'completed':
                    return 'bg-blue-500 text-white shadow-md shadow-blue-500/30';
                case 'paused':
                    return 'bg-amber-500 text-white shadow-md shadow-amber-500/30';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles()}`}>
                {status === 'active' && <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />}
                {statusLabels[status] || "Aktif"}
            </span>
        );
    };

    // Loading state
    if (isCampaignsLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Kampanyalar yükleniyor...</h3>
            </div>
        );
    }

    // Error state
    if (isCampaignsError) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bir hata oluştu</h3>
                <p className="text-gray-500 mb-4">Kampanyalar yüklenirken bir sorun oluştu.</p>
                <button
                    onClick={refetch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Kampanya Listesi</h2>
                            <p className="text-blue-100">Toplam {filteredCampaigns.length} kampanya</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Kampanya ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                />
                            </div>

                            {/* Filter */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tüm Kampanyalar</option>
                                <optgroup label="Duruma Göre">
                                    <option value="active">Aktif Kampanyalar</option>
                                    <option value="completed">Tamamlanan</option>
                                    <option value="paused">Duraklatılmış</option>
                                </optgroup>
                                <optgroup label="Türe Göre">
                                    {campaignTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>

                            {/* Export Button */}
                            <button
                                onClick={handleExportExcel}
                                className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
                            >
                                <Download size={18} />
                                <span>Dışa Aktar</span>
                            </button>

                            {/* New Campaign Button */}
                            <Link
                                href="/donations/create"
                                className="bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-medium"
                            >
                                <Plus size={18} />
                                <span>Yeni Kampanya</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="w-12 px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedCampaigns.length === filteredCampaigns.length &&
                                            filteredCampaigns.length > 0
                                        }
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </th>

                                {/* Kampanya Adı */}
                                <th
                                    className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Tags size={16} />
                                        <span>Kampanya Adı</span>
                                        {sortField === "name" && (
                                            <span className="text-blue-600">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </th>

                                {/* Tür */}
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    Tür
                                </th>

                                {/* Hedef & İlerleme */}
                                <th
                                    className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort("targetAmount")}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Target size={16} />
                                        <span>Hedef & İlerleme</span>
                                    </div>
                                </th>

                                {/* Süre */}
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={16} />
                                        <span>Süre</span>
                                    </div>
                                </th>

                                {/* IBAN */}
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <CreditCard size={16} />
                                        <span>IBAN</span>
                                    </div>
                                </th>

                                {/* Durum */}
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    Durum
                                </th>

                                {/* İşlemler */}
                                <th className="w-32 px-4 py-4 text-center text-sm font-semibold text-gray-700">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCampaigns.map((campaign) => {
                                const progress = calculateProgress(
                                    campaign.collectedAmount,
                                    campaign.targetAmount
                                );
                                const status = campaign.status || "active";

                                return (
                                    <tr
                                        key={campaign.id}
                                        className={`hover:bg-gray-50 transition-colors ${selectedCampaigns.includes(campaign.id) ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCampaigns.includes(campaign.id)}
                                                onChange={() => handleSelectCampaign(campaign.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </td>

                                        {/* Kampanya Adı */}
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{campaign.name}</div>
                                                {campaign.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs" title={campaign.description}>
                                                        {campaign.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tür */}
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {campaign.type}
                                            </span>
                                        </td>

                                        {/* Hedef & İlerleme */}
                                        <td className="px-4 py-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">
                                                        {formatCurrency(campaign.collectedAmount || 0)}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {formatCurrency(campaign.targetAmount)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${progress >= 100
                                                            ? "bg-green-500"
                                                            : progress >= 50
                                                                ? "bg-blue-500"
                                                                : "bg-yellow-500"
                                                            }`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 text-right">{progress}%</div>
                                            </div>
                                        </td>

                                        {/* Süre */}
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {campaign.duration}
                                        </td>

                                        {/* IBAN */}
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            <span className="font-mono" title={campaign.iban}>
                                                {campaign.iban ? `...${campaign.iban.slice(-8)}` : "-"}
                                            </span>
                                        </td>

                                        {/* Durum */}
                                        <td className="px-4 py-4">
                                            <StatusBadge status={status} />
                                        </td>

                                        {/* İşlemler */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleViewClick(campaign)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Bağışları Görüntüle"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(campaign)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(campaign)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredCampaigns.length === 0 && (
                    <div className="text-center py-12">
                        <Banknote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Kampanya bulunamadı
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Arama kriterlerinize uygun kampanya bulunmamaktadır.
                        </p>
                        <Link
                            href="/donations/create"
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            <span>Yeni Kampanya Oluştur</span>
                        </Link>
                    </div>
                )}

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            {selectedCampaigns.length > 0 && (
                                <span className="font-medium">
                                    {selectedCampaigns.length} kampanya seçildi
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Sayfa başına:</span>
                            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                                <option>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Donations Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Bağışlar - ${selectedCampaign?.name}`}
                size="lg"
            >
                <div>
                    {isDonationsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            <span className="ml-3 text-gray-600">Bağışlar yükleniyor...</span>
                        </div>
                    ) : isDonationsError ? (
                        <div className="text-center py-8">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
                            <p className="text-gray-500">{donationsError || "Bağışlar yüklenirken bir hata oluştu."}</p>
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz bağış yok</h3>
                            <p className="text-gray-500">Bu kampanyaya henüz bağış yapılmamış.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-600">
                                    Toplam <span className="font-bold text-blue-600">{donations.length}</span> bağış
                                </span>
                                <span className="text-sm text-gray-600">
                                    Toplam:{" "}
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(donations.reduce((sum, d) => sum + parseFloat(d.donationAmount), 0))}
                                    </span>
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Bağışçı</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tutar</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tarih</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Referans</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Kaynak</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {donations.map((donation) => (
                                            <tr key={donation.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                            <User size={14} className="text-blue-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{donation.senderName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-green-600">
                                                        {formatCurrency(parseFloat(donation.donationAmount))}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex items-center">
                                                        <Clock size={14} className="mr-2 text-gray-400" />
                                                        {formatDate(donation.donationDate)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                                        {donation.transactionRef}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {donation.source}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Edit Campaign Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Kampanya Düzenle"
                size="lg"
            >
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    {/* Error Alert */}
                    {updateError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <h4 className="text-red-800 font-medium">Hata</h4>
                                <p className="text-red-600 text-sm mt-1">{updateError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => resetUpdate()}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Kampanya Adı */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kampanya Adı <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Kampanya Türü */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kampanya Türü <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={editFormData.type}
                                onChange={handleEditFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Seçiniz</option>
                                {campaignTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Hedef Tutar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hedef Tutar (₺) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="targetAmount"
                                value={editFormData.targetAmount}
                                onChange={handleEditFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Süre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Süre
                            </label>
                            <input
                                type="text"
                                name="duration"
                                value={editFormData.duration}
                                onChange={handleEditFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Örn: 30 gün"
                            />
                        </div>

                        {/* IBAN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                IBAN
                            </label>
                            <input
                                type="text"
                                name="iban"
                                value={editFormData.iban}
                                onChange={handleEditFormChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                            />
                        </div>

                        {/* Açıklama */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Açıklama
                            </label>
                            <textarea
                                name="description"
                                value={editFormData.description}
                                onChange={handleEditFormChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Kampanya hakkında açıklama..."
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={isUpdating}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Edit size={16} />
                                    Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Kampanya Sil"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <Trash2 className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Kampanyayı silmek istediğinize emin misiniz?
                    </h3>
                    <p className="text-gray-500 mb-4">
                        <strong>"{selectedCampaign?.name}"</strong> kampanyası kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                    </p>

                    {/* Delete Error Alert */}
                    {deleteError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-red-600 text-sm">{deleteError}</p>
                        </div>
                    )}

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={isDeleting}
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Siliniyor...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Sil
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CampaignTable;

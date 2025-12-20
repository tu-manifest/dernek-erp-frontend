"use client";

import React, { useState } from "react";
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
    Plus
} from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Campaign {
    id: string;
    name: string;
    type: string;
    targetAmount: number;
    collectedAmount?: number;
    description: string;
    duration: string;
    iban: string;
    status?: 'active' | 'completed' | 'paused';
    createdAt?: string;
    updatedAt?: string;
}

interface CampaignTableProps {
    campaigns?: Campaign[];
    onEdit?: (campaign: Campaign) => void;
    onDelete?: (campaignId: string) => void;
    onView?: (campaign: Campaign) => void;
}

const CampaignTable: React.FC<CampaignTableProps> = ({
    campaigns = [],
    onEdit,
    onDelete,
    onView
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortField, setSortField] = useState<keyof Campaign>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

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

    const statusColors: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        completed: "bg-blue-100 text-blue-800",
        paused: "bg-yellow-100 text-yellow-800"
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

    const handleSelectCampaign = (campaignId: string) => {
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

    const calculateProgress = (collected: number = 0, target: number = 0) => {
        if (target === 0) return 0;
        return Math.min(100, Math.round((collected / target) * 100));
    };

    const handleExportExcel = () => {
        if (!filteredCampaigns.length) {
            alert("Listelenecek kampanya bulunamadı!");
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

    return (
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
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
                                        >
                                            {statusLabels[status] || "Aktif"}
                                        </span>
                                    </td>

                                    {/* İşlemler */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => onView?.(campaign)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Görüntüle"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit?.(campaign)}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(campaign.id)}
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
    );
};

export default CampaignTable;

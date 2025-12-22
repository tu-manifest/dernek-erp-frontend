"use client";

import React, { useState, useMemo } from 'react';
import {
    ClipboardList,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    Activity,
    Loader2,
    RefreshCw,
    X,
} from 'lucide-react';
import useGetActivityLogs from '@/hooks/useGetActivityLogs';
import { ActivityLogFilters } from '@/lib/api/activityLogService';

// Aktivite tipine göre renk belirleme
const getActionColor = (action: string): string => {
    switch (action) {
        case 'CREATE':
            return 'bg-green-500';
        case 'UPDATE':
            return 'bg-blue-500';
        case 'DELETE':
            return 'bg-red-500';
        case 'STATUS_CHANGE':
            return 'bg-yellow-500';
        case 'LOGIN':
            return 'bg-purple-500';
        case 'LOGOUT':
            return 'bg-gray-500';
        default:
            return 'bg-gray-400';
    }
};

// Badge rengi
const getActionBadgeStyle = (action: string): string => {
    switch (action) {
        case 'CREATE':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'UPDATE':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'DELETE':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'STATUS_CHANGE':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'LOGIN':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'LOGOUT':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// Türkçe aksiyon açıklamaları
const getActionLabel = (action: string): string => {
    switch (action) {
        case 'CREATE':
            return 'Oluşturma';
        case 'UPDATE':
            return 'Güncelleme';
        case 'DELETE':
            return 'Silme';
        case 'STATUS_CHANGE':
            return 'Durum Değişikliği';
        case 'LOGIN':
            return 'Giriş';
        case 'LOGOUT':
            return 'Çıkış';
        default:
            return action;
    }
};

// Entity tipi için Türkçe karşılık
const getEntityTypeLabel = (entityType: string): string => {
    const labels: Record<string, string> = {
        'Member': 'Üye',
        'Event': 'Etkinlik',
        'Campaign': 'Kampanya',
        'Donor': 'Bağışçı',
        'FixedAsset': 'Sabit Varlık',
        'Document': 'Döküman',
        'Debt': 'Borç',
        'Collection': 'Tahsilat',
        'Admin': 'Yönetici',
        'Group': 'Grup',
    };
    return labels[entityType] || entityType;
};

// Tarih formatı
const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Entity tipleri listesi
const ENTITY_TYPES = [
    { value: '', label: 'Tümü' },
    { value: 'Member', label: 'Üye' },
    { value: 'Event', label: 'Etkinlik' },
    { value: 'Campaign', label: 'Kampanya' },
    { value: 'Donor', label: 'Bağışçı' },
    { value: 'FixedAsset', label: 'Sabit Varlık' },
    { value: 'Document', label: 'Döküman' },
    { value: 'Debt', label: 'Borç' },
    { value: 'Collection', label: 'Tahsilat' },
    { value: 'Admin', label: 'Yönetici' },
    { value: 'Group', label: 'Grup' },
];

// Aksiyon tipleri listesi
const ACTION_TYPES = [
    { value: '', label: 'Tümü' },
    { value: 'CREATE', label: 'Oluşturma' },
    { value: 'UPDATE', label: 'Güncelleme' },
    { value: 'DELETE', label: 'Silme' },
    { value: 'STATUS_CHANGE', label: 'Durum Değişikliği' },
    { value: 'LOGIN', label: 'Giriş' },
    { value: 'LOGOUT', label: 'Çıkış' },
];

export default function ActivityLogsPage() {
    // Filter states
    const [entityType, setEntityType] = useState('');
    const [action, setAction] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Build filters object
    const filters: ActivityLogFilters = useMemo(() => ({
        page: currentPage,
        limit: 20,
        ...(entityType && { entityType }),
        ...(action && { action }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
    }), [currentPage, entityType, action, startDate, endDate]);

    const { activityLogs, totalCount, totalPages, isLoading, isError, error, refetch, setFilters } = useGetActivityLogs(filters);

    // Handle filter changes
    const handleApplyFilters = () => {
        setCurrentPage(1);
        setFilters({
            page: 1,
            limit: 20,
            ...(entityType && { entityType }),
            ...(action && { action }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
        });
    };

    // Clear all filters
    const handleClearFilters = () => {
        setEntityType('');
        setAction('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
        setFilters({ page: 1, limit: 20 });
    };

    // Pagination handlers
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            setFilters({ ...filters, page: newPage });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            setFilters({ ...filters, page: newPage });
        }
    };

    // Check if any filter is active
    const hasActiveFilters = entityType || action || startDate || endDate;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Aktivite Logları</h1>
                            <p className="text-sm text-gray-600">Sistemdeki tüm aktiviteleri görüntüleyin</p>
                        </div>
                    </div>
                    <button
                        onClick={refetch}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Yenile
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                        <Filter className="h-5 w-5" />
                        <span className="font-medium">Filtreler</span>
                        {hasActiveFilters && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                Aktif
                            </span>
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Filtreleri Temizle
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                        {/* Entity Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Varlık Tipi
                            </label>
                            <select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {ENTITY_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Aksiyon Tipi
                            </label>
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {ACTION_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Başlangıç Tarihi
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* End Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Apply Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleApplyFilters}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                Uygula
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                    Toplam <span className="font-semibold">{totalCount}</span> kayıt
                </p>
            </div>

            {/* Activity Logs Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                        <span className="ml-3 text-gray-600 text-lg">Yükleniyor...</span>
                    </div>
                ) : isError ? (
                    <div className="text-center py-16">
                        <div className="text-red-500 mb-2">Aktiviteler yüklenirken hata oluştu</div>
                        <p className="text-sm text-gray-500">{error}</p>
                        <button
                            onClick={refetch}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                ) : activityLogs.length === 0 ? (
                    <div className="text-center py-16">
                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aktivite kaydı bulunamadı</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Yönetici
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Aksiyon
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Varlık Tipi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Varlık Adı
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Açıklama
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activityLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {formatDateTime(log.createdAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {log.adminName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getActionBadgeStyle(log.action)}`}>
                                                <span className={`w-1.5 h-1.5 ${getActionColor(log.action)} rounded-full mr-1.5`}></span>
                                                {getActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">
                                                {getEntityTypeLabel(log.entityType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 font-medium">
                                                {log.entityName || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 line-clamp-2">
                                                {log.description || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && !isError && activityLogs.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Sayfa {currentPage} / {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Önceki
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                Sonraki
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

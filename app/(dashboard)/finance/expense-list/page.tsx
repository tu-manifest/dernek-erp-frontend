"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    Download,
    Calendar,
    Filter,
    Eye,
    Edit3,
    Trash2,
    TrendingDown,
    CreditCard,
    Receipt,
    Users,
    Building2,
    Target,
    TrendingUp,
    Wallet,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    Loader2,
} from "lucide-react";
import Modal from "../../../../components/Modal";
import { toast } from "sonner";
import useGetAllExpenses, { Expense } from "../../../../hooks/useGetAllExpenses";
import useDeleteExpense from "../../../../hooks/useDeleteExpense";
import { API_ENDPOINTS } from "../../../../lib/api/endpoints";

// Gider kategorileri
const EXPENSE_CATEGORIES: Record<string, { icon: React.ElementType; color: string; bgColor: string; textColor: string }> = {
    "Personel Giderleri": {
        icon: Users,
        color: "blue",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
    },
    "İdari ve Genel Giderler": {
        icon: Building2,
        color: "purple",
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
    },
    "Esas Amaç Giderleri": {
        icon: Target,
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
    },
    "Fon Toplama Giderleri": {
        icon: TrendingUp,
        color: "orange",
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
    },
    "Mali ve Duran Varlık Giderleri": {
        icon: Wallet,
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
    },
    "Diğer ve Olağanüstü Giderler": {
        icon: AlertTriangle,
        color: "gray",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
    },
    // Genel Giderler kategorisi backend'den gelen veriler için
    "Genel Giderler": {
        icon: Receipt,
        color: "indigo",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700",
    },
};

// Ödeme yöntemleri
const PAYMENT_METHODS = [
    "Tümü",
    "Nakit",
    "Banka transferi",
    "Kredi Kartı",
    "Çek",
    "Senet",
    "Havale/EFT",
];

export default function ExpenseListPage() {
    const { expenses, summary, isLoading, isError, refetch } = useGetAllExpenses();
    const { deleteExpense, isLoading: isDeleting } = useDeleteExpense();

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Tümü");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("Tümü");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    // Filtered expenses
    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const matchesSearch =
                (expense.supplierName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (expense.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (expense.invoiceNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase());

            const matchesCategory =
                categoryFilter === "Tümü" || expense.mainCategory === categoryFilter;

            const matchesPayment =
                paymentMethodFilter === "Tümü" ||
                expense.paymentMethod === paymentMethodFilter;

            const matchesDateFrom =
                !dateFrom || new Date(expense.expenseDate) >= new Date(dateFrom);
            const matchesDateTo =
                !dateTo || new Date(expense.expenseDate) <= new Date(dateTo);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPayment &&
                matchesDateFrom &&
                matchesDateTo
            );
        });
    }, [expenses, searchTerm, categoryFilter, paymentMethodFilter, dateFrom, dateTo]);

    // Summary stats
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
    const thisMonthExpense = filteredExpenses
        .filter((e) => {
            const expenseDate = new Date(e.expenseDate);
            const now = new Date();
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
    const recurringCount = filteredExpenses.filter((e) => e.isRecurring).length;
    const documentCount = filteredExpenses.filter((e) => e.hasDocument).length;

    // Pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleViewDetails = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedExpense) return;

        const result = await deleteExpense(selectedExpense.id);
        if (result.success) {
            toast.success("Gider başarıyla silindi!");
            refetch();
        } else {
            toast.error(result.error || "Gider silinirken bir hata oluştu");
        }

        setIsDeleteModalOpen(false);
        setSelectedExpense(null);
    };

    const getCategoryInfo = (category: string) => {
        return (
            EXPENSE_CATEGORIES[category] || {
                icon: Receipt,
                bgColor: "bg-gray-100",
                textColor: "text-gray-700",
            }
        );
    };

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return numAmount.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCategoryFilter("Tümü");
        setPaymentMethodFilter("Tümü");
        setDateFrom("");
        setDateTo("");
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-gray-600">Giderler yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Giderler Yüklenemedi</h3>
                    <p className="text-red-600 mb-4">Veriler alınırken bir hata oluştu.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <TrendingDown className="text-red-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
                                <p className="text-xl font-bold text-gray-900">₺{formatCurrency(totalExpense)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="text-blue-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Bu Ayki Gider</p>
                                <p className="text-xl font-bold text-gray-900">₺{formatCurrency(thisMonthExpense)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="text-green-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Belgeli</p>
                                <p className="text-xl font-bold text-gray-900">{documentCount} Adet</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Receipt className="text-yellow-600" size={20} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Tekrarlayan</p>
                                <p className="text-xl font-bold text-gray-900">{recurringCount} Adet</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Gider Listesi</h2>
                                <p className="text-blue-100">
                                    Toplam {filteredExpenses.length} gider kaydı görüntüleniyor
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 shadow-sm"
                                    />
                                </div>

                                {/* Export Button */}
                                <button className="bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center space-x-2 font-medium backdrop-blur-sm">
                                    <Download size={18} />
                                    <span>Dışa Aktar</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-600">Filtreler:</span>
                            </div>

                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Tümü">Tüm Kategoriler</option>
                                {Object.keys(EXPENSE_CATEGORIES).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>

                            {/* Payment Method Filter */}
                            <select
                                value={paymentMethodFilter}
                                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {PAYMENT_METHODS.map((method) => (
                                    <option key={method} value={method}>
                                        {method === "Tümü" ? "Tüm Ödemeler" : method}
                                    </option>
                                ))}
                            </select>

                            {/* Date Range */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Clear Filters */}
                            {(categoryFilter !== "Tümü" ||
                                paymentMethodFilter !== "Tümü" ||
                                dateFrom ||
                                dateTo) && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <X size={16} />
                                        Temizle
                                    </button>
                                )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Tedarikçi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Tutar
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Ödeme Yöntemi
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Belge
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Kayıt bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedExpenses.map((expense) => {
                                        const categoryInfo = getCategoryInfo(expense.mainCategory);
                                        const CategoryIcon = categoryInfo.icon;
                                        return (
                                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(expense.expenseDate).toLocaleDateString("tr-TR")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-md ${categoryInfo.bgColor}`}>
                                                            <CategoryIcon size={14} className={categoryInfo.textColor} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                                {expense.mainCategory}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                {expense.subCategory}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{expense.supplierName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-red-600">
                                                        ₺{formatCurrency(expense.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{expense.paymentMethod}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${expense.hasDocument
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-500"
                                                            }`}
                                                    >
                                                        {expense.hasDocument ? "Var" : "Yok"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(expense)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Detay"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Düzenle"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Sil"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {(currentPage - 1) * itemsPerPage + 1}-
                                {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} /{" "}
                                {filteredExpenses.length} kayıt
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Gider Detayı"
                size="lg"
            >
                {selectedExpense && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedExpense.supplierName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedExpense.invoiceNumber || "Fatura No Yok"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-red-600">
                                        ₺{formatCurrency(selectedExpense.amount)}
                                    </p>
                                    <span
                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full mt-2 ${selectedExpense.isRecurring
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {selectedExpense.isRecurring ? "Tekrarlayan" : "Tek Seferlik"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Ana Kategori
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.mainCategory}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Alt Kategori
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.subCategory}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Tarih
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(selectedExpense.expenseDate).toLocaleDateString("tr-TR")}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Ödeme Yöntemi
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.paymentMethod}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Departman
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.department || "-"}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Para Birimi
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.currency}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                                Açıklama
                            </p>
                            <p className="text-sm text-gray-700">{selectedExpense.description}</p>
                        </div>

                        {/* Document Info */}
                        {selectedExpense.hasDocument && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-600 uppercase font-semibold mb-3">
                                    Ekli Belge
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-blue-600" size={20} />
                                        <div>
                                            <span className="text-sm text-blue-800 font-medium">{selectedExpense.fileName}</span>
                                            <span className="text-xs text-blue-600 ml-2">
                                                ({Math.round((selectedExpense.fileSize || 0) / 1024)} KB)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(API_ENDPOINTS.expenses.documentView(selectedExpense.id), '_blank')}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <Eye size={16} />
                                            Görüntüle
                                        </button>
                                        <a
                                            href={API_ENDPOINTS.expenses.documentDownload(selectedExpense.id)}
                                            download
                                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <Download size={16} />
                                            İndir
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Gideri Sil"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Bu gider kaydını silmek istediğinizden emin misiniz?
                    </p>
                    {selectedExpense && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <p className="font-semibold text-gray-900">{selectedExpense.supplierName}</p>
                            <p className="text-red-600 font-bold">
                                ₺{formatCurrency(selectedExpense.amount)}
                            </p>
                        </div>
                    )}
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            İptal
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {isDeleting ? "Siliniyor..." : "Sil"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

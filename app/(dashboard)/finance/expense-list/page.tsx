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
    DollarSign,
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
} from "lucide-react";
import Modal from "../../../../components/Modal";

// Gider kategorileri
const EXPENSE_CATEGORIES = {
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
};

// Demo veri
const DEMO_EXPENSES = [
    {
        id: 1,
        date: "2024-12-20",
        category: "Personel Giderleri",
        subcategory: "Maaş ve Ücretler",
        vendor: "Personel Ödemeleri",
        amount: 45000.0,
        paymentMethod: "Banka Transferi",
        invoiceNumber: "FT-2024-001",
        description: "Aralık ayı maaş ödemeleri",
        status: "paid",
    },
    {
        id: 2,
        date: "2024-12-18",
        category: "İdari ve Genel Giderler",
        subcategory: "Kira Gideri (Merkez/Şube)",
        vendor: "ABC Gayrimenkul",
        amount: 12500.0,
        paymentMethod: "Havale/EFT",
        invoiceNumber: "FT-2024-002",
        description: "Aralık ayı merkez ofis kirası",
        status: "paid",
    },
    {
        id: 3,
        date: "2024-12-15",
        category: "Esas Amaç Giderleri",
        subcategory: "Burs ve Sosyal Yardım Ödemeleri",
        vendor: "Öğrenci Bursları",
        amount: 25000.0,
        paymentMethod: "Banka Transferi",
        invoiceNumber: "FT-2024-003",
        description: "15 öğrenciye burs ödemesi",
        status: "paid",
    },
    {
        id: 4,
        date: "2024-12-12",
        category: "İdari ve Genel Giderler",
        subcategory: "Haberleşme Giderleri",
        vendor: "Turkcell",
        amount: 2350.0,
        paymentMethod: "Kredi Kartı",
        invoiceNumber: "FT-2024-004",
        description: "Telefon ve internet faturaları",
        status: "paid",
    },
    {
        id: 5,
        date: "2024-12-10",
        category: "Fon Toplama Giderleri",
        subcategory: "Etkinlik Organizasyon Giderleri",
        vendor: "Etkinlik Hizmetleri A.Ş.",
        amount: 8500.0,
        paymentMethod: "Nakit",
        invoiceNumber: "FT-2024-005",
        description: "Yılbaşı etkinliği organizasyonu",
        status: "pending",
    },
    {
        id: 6,
        date: "2024-12-08",
        category: "Mali ve Duran Varlık Giderleri",
        subcategory: "Demirbaş Alımları (Gider Yazılan)",
        vendor: "Ofis Mobilya Ltd.",
        amount: 15750.0,
        paymentMethod: "Çek",
        invoiceNumber: "FT-2024-006",
        description: "Yeni ofis mobilyaları",
        status: "pending",
    },
    {
        id: 7,
        date: "2024-12-05",
        category: "Personel Giderleri",
        subcategory: "Sosyal Güvenlik İşveren Payı",
        vendor: "SGK",
        amount: 8900.0,
        paymentMethod: "Banka Transferi",
        invoiceNumber: "FT-2024-007",
        description: "Kasım ayı SGK ödemeleri",
        status: "paid",
    },
    {
        id: 8,
        date: "2024-12-01",
        category: "İdari ve Genel Giderler",
        subcategory: "Isıtma, Aydınlatma, Su Giderleri",
        vendor: "BEDAŞ",
        amount: 3200.0,
        paymentMethod: "Otomatik Ödeme",
        invoiceNumber: "FT-2024-008",
        description: "Kasım ayı elektrik faturası",
        status: "paid",
    },
];

// Ödeme yöntemleri
const PAYMENT_METHODS = [
    "Tümü",
    "Nakit",
    "Banka Transferi",
    "Kredi Kartı",
    "Çek",
    "Senet",
    "Havale/EFT",
];

export default function ExpenseListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Tümü");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("Tümü");
    const [statusFilter, setStatusFilter] = useState("Tümü");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<(typeof DEMO_EXPENSES)[0] | null>(null);

    // Filtered expenses
    const filteredExpenses = useMemo(() => {
        return DEMO_EXPENSES.filter((expense) => {
            const matchesSearch =
                expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory =
                categoryFilter === "Tümü" || expense.category === categoryFilter;

            const matchesPayment =
                paymentMethodFilter === "Tümü" ||
                expense.paymentMethod === paymentMethodFilter;

            const matchesStatus =
                statusFilter === "Tümü" || expense.status === statusFilter;

            const matchesDateFrom =
                !dateFrom || new Date(expense.date) >= new Date(dateFrom);
            const matchesDateTo =
                !dateTo || new Date(expense.date) <= new Date(dateTo);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPayment &&
                matchesStatus &&
                matchesDateFrom &&
                matchesDateTo
            );
        });
    }, [searchTerm, categoryFilter, paymentMethodFilter, statusFilter, dateFrom, dateTo]);

    // Summary stats
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonthExpense = filteredExpenses
        .filter((e) => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0);
    const pendingCount = filteredExpenses.filter((e) => e.status === "pending").length;
    const paidCount = filteredExpenses.filter((e) => e.status === "paid").length;

    // Pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const paginatedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleViewDetails = (expense: (typeof DEMO_EXPENSES)[0]) => {
        setSelectedExpense(expense);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (expense: (typeof DEMO_EXPENSES)[0]) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        // API call would go here
        setIsDeleteModalOpen(false);
        setSelectedExpense(null);
    };

    const getCategoryInfo = (category: string) => {
        return (
            EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES] || {
                icon: Receipt,
                bgColor: "bg-gray-100",
                textColor: "text-gray-700",
            }
        );
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCategoryFilter("Tümü");
        setPaymentMethodFilter("Tümü");
        setStatusFilter("Tümü");
        setDateFrom("");
        setDateTo("");
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Toplam Gider</p>
                                <p className="text-2xl font-bold mt-1">₺{formatCurrency(totalExpense)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <TrendingDown size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Bu Ay</p>
                                <p className="text-2xl font-bold mt-1">₺{formatCurrency(thisMonthExpense)}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Calendar size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Ödenen</p>
                                <p className="text-2xl font-bold mt-1">{paidCount} Adet</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Bekleyen</p>
                                <p className="text-2xl font-bold mt-1">{pendingCount} Adet</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Receipt size={24} />
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

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Tümü">Tüm Durumlar</option>
                                <option value="paid">Ödendi</option>
                                <option value="pending">Bekliyor</option>
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
                                statusFilter !== "Tümü" ||
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
                                        Durum
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
                                        const categoryInfo = getCategoryInfo(expense.category);
                                        const CategoryIcon = categoryInfo.icon;
                                        return (
                                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(expense.date).toLocaleDateString("tr-TR")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-md ${categoryInfo.bgColor}`}>
                                                            <CategoryIcon size={14} className={categoryInfo.textColor} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                                {expense.category}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                {expense.subcategory}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900">{expense.vendor}</span>
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
                                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${expense.status === "paid"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {expense.status === "paid" ? "Ödendi" : "Bekliyor"}
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
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                                        {selectedExpense.vendor}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedExpense.invoiceNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-red-600">
                                        ₺{formatCurrency(selectedExpense.amount)}
                                    </p>
                                    <span
                                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full mt-2 ${selectedExpense.status === "paid"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {selectedExpense.status === "paid" ? "Ödendi" : "Bekliyor"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Kategori
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.category}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Alt Kategori
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedExpense.subcategory}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                    Tarih
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(selectedExpense.date).toLocaleDateString("tr-TR")}
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
                        </div>

                        {/* Description */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                                Açıklama
                            </p>
                            <p className="text-sm text-gray-700">{selectedExpense.description}</p>
                        </div>
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
                            <p className="font-semibold text-gray-900">{selectedExpense.vendor}</p>
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
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Sil
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

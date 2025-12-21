"use client";
import React, { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  Users,
  Building2,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  X,
  Loader2,
  Check,
  User,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import useGetAllDonors, { Donor } from '@/hooks/useGetAllDonors';
import useGetDonorDonations from '@/hooks/useGetDonorDonations';
import useUpdateDonor from '@/hooks/useUpdateDonor';
import useDeleteDonor from '@/hooks/useDeleteDonor';

export default function ListDonorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Kişi' | 'Kurum'>('all');
  const [sortField, setSortField] = useState<keyof Donor>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDonors, setSelectedDonors] = useState<number[]>([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Modal states
  const [viewDonationsModalOpen, setViewDonationsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'Kişi' as 'Kişi' | 'Kurum',
    email: '',
    phone: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // API hooks
  const { donors, stats, isLoading, isError, refetch } = useGetAllDonors();
  const { donations, donor: donorInfo, totalAmount, donationCount, isLoading: donationsLoading } = useGetDonorDonations(selectedDonorId);
  const { updateDonor, isLoading: updateLoading } = useUpdateDonor();
  const { deleteDonor, isLoading: deleteLoading } = useDeleteDonor();

  // Filter and search logic
  const filteredDonors = donors
    .filter(donor => {
      const matchesSearch =
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone?.includes(searchTerm);

      const matchesFilter =
        filterType === 'all' ||
        donor.type === filterType;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === 'asc') {
        return aValue! < bValue! ? -1 : aValue! > bValue! ? 1 : 0;
      } else {
        return aValue! > bValue! ? -1 : aValue! < bValue! ? 1 : 0;
      }
    });

  const handleSort = (field: keyof Donor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectDonor = (donorId: number) => {
    setSelectedDonors(prev =>
      prev.includes(donorId)
        ? prev.filter(id => id !== donorId)
        : [...prev, donorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDonors.length === filteredDonors.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(filteredDonors.map(donor => donor.id));
    }
  };

  // View donations modal
  const handleViewDonations = (donor: Donor) => {
    setSelectedDonorId(donor.id);
    setSelectedDonor(donor);
    setViewDonationsModalOpen(true);
  };

  // Edit modal
  const handleEdit = (donor: Donor) => {
    setSelectedDonor(donor);
    setEditFormData({
      name: donor.name,
      type: donor.type,
      email: donor.email || '',
      phone: donor.phone || '',
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editFormData.name.trim()) {
      errors.name = 'Bağışçı adı gereklidir';
    }
    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm() || !selectedDonor) return;

    const result = await updateDonor(selectedDonor.id, editFormData);
    if (result.success) {
      setEditModalOpen(false);
      refetch();
    } else {
      setEditErrors({ general: result.error || 'Güncelleme hatası' });
    }
  };

  // Delete modal
  const handleDeleteClick = (donor: Donor) => {
    setSelectedDonor(donor);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDonor) return;

    const result = await deleteDonor(selectedDonor.id);
    if (result.success) {
      setDeleteModalOpen(false);
      setSelectedDonor(null);
      refetch();
    }
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    const selectedData = selectedDonors.length > 0
      ? donors.filter(d => selectedDonors.includes(d.id))
      : filteredDonors;

    alert(`${selectedData.length} bağışçı ${format.toUpperCase()} formatında dışa aktarılıyor...`);
    setExportMenuOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="text-gray-600 text-lg">Bağışçılar yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-500 mb-4">Bağışçılar yüklenirken bir hata oluştu.</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Dış Bağışçı Listesi</h1>
        <p className="text-gray-600">Derneğe bağış yapan kişi ve kurumları yönetin</p>
      </div>

      {/* Statistics Cards - Ortalama Bağış kaldırıldı, 4 kart oldu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Toplam Bağışçı</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDonors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Bireysel</p>
              <p className="text-xl font-bold text-gray-900">{stats.individualDonors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Kurumsal</p>
              <p className="text-xl font-bold text-gray-900">{stats.corporateDonors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="text-yellow-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Toplam Bağış</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.totalDonationAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4 text-white">
              <span>Toplam {filteredDonors.length} bağışçı</span>
              {selectedDonors.length > 0 && (
                <>
                  <span>•</span>
                  <span>{selectedDonors.length} seçili</span>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Bağışçı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'Kişi' | 'Kurum')}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Bağışçılar</option>
                <option value="Kişi">Bireysel</option>
                <option value="Kurum">Kurumsal</option>
              </select>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium w-full sm:w-auto justify-center"
                >
                  <Download size={18} />
                  <span>Dışa Aktar</span>
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('excel')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText size={16} className="text-green-600" />
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText size={16} className="text-red-600" />
                        <span>PDF (.pdf)</span>
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText size={16} className="text-blue-600" />
                        <span>CSV (.csv)</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-2">
                      <p className="text-xs text-gray-500">
                        {selectedDonors.length > 0
                          ? `${selectedDonors.length} seçili kayıt aktarılacak`
                          : `${filteredDonors.length} kayıt aktarılacak`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Button */}
              <Link
                href="/donations/donor/add"
                className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
              >
                <Plus size={18} />
                <span>Yeni Ekle</span>
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
                    checked={selectedDonors.length === filteredDonors.length && filteredDonors.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Bağışçı Adı</span>
                    {sortField === 'name' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                  Tip
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>İletişim</span>
                  </div>
                </th>
                <th
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('totalDonation')}
                >
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} />
                    <span>Toplam Bağış</span>
                    {sortField === 'totalDonation' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <span>Bağış Sayısı</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Son Bağış</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDonors.map((donor) => (
                <tr
                  key={donor.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedDonors.includes(donor.id) ? 'bg-blue-50' : ''
                    }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedDonors.includes(donor.id)}
                      onChange={() => handleSelectDonor(donor.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${donor.type === 'Kişi' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                        {donor.type === 'Kişi' ? (
                          <Users className="text-green-600" size={20} />
                        ) : (
                          <Building2 className="text-purple-600" size={20} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{donor.name}</div>
                        <div className="text-xs text-gray-500">ID: {donor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${donor.type === 'Kişi'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                      }`}>
                      {donor.type === 'Kişi' ? 'Bireysel' : 'Kurumsal'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {donor.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-1" />
                          <span className="truncate max-w-[200px]">{donor.email}</span>
                        </div>
                      )}
                      {donor.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-1" />
                          <span>{donor.phone}</span>
                        </div>
                      )}
                      {!donor.email && !donor.phone && (
                        <span className="text-sm text-gray-400">Bilgi yok</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(donor.totalDonation)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600">{donor.donationCount}</span>
                      <span className="text-sm text-gray-500 ml-1">kez</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(donor.lastDonationDate)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDonations(donor)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bağışları Görüntüle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(donor)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(donor)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredDonors.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bağışçı bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'Arama kriterlerinize uygun bağışçı bulunmamaktadır.'
                : 'Henüz hiç bağışçı eklenmemiş.'}
            </p>
            <Link
              href="/donations/donor/add"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              İlk Bağışçıyı Ekle
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              {selectedDonors.length > 0 && (
                <span className="font-medium">{selectedDonors.length} bağışçı seçildi</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Toplam: {filteredDonors.length} bağışçı</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Donations Modal */}
      <Modal
        isOpen={viewDonationsModalOpen}
        onClose={() => {
          setViewDonationsModalOpen(false);
          setSelectedDonorId(null);
        }}
        title={`${selectedDonor?.name || 'Bağışçı'} - Bağış Geçmişi`}
        size="lg"
      >
        {donationsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Bağışlar yükleniyor...</span>
          </div>
        ) : (
          <div>
            {/* Bağışçı Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Bağışçı Tipi</p>
                  <p className="font-medium">{donorInfo?.type || selectedDonor?.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">E-posta</p>
                  <p className="font-medium truncate" title={donorInfo?.email || selectedDonor?.email || '-'}>
                    {donorInfo?.email || selectedDonor?.email || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefon</p>
                  <p className="font-medium">{donorInfo?.phone || selectedDonor?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Toplam Bağış</p>
                  <p className="font-medium text-green-600">{formatCurrency(totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bağış Sayısı</p>
                  <p className="font-medium text-blue-600">{donationCount} kez</p>
                </div>
              </div>
            </div>

            {/* Bağış Listesi */}
            {donations.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Bağış Detayları</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tarih</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tutar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Kampanya</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Kaynak</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Referans</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {donations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDate(donation.date)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            {formatCurrency(donation.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {donation.campaign?.name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">{donation.source}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {donation.transactionRef || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>Henüz bağış kaydı bulunmuyor.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Bağışçı Düzenle"
        size="md"
      >
        <div className="space-y-4">
          {editErrors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{editErrors.general}</span>
            </div>
          )}

          {/* Bağışçı Tipi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bağışçı Tipi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditFormData(prev => ({ ...prev, type: 'Kişi' }))}
                className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${editFormData.type === 'Kişi'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
                  }`}
              >
                <User className={editFormData.type === 'Kişi' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                <span className={editFormData.type === 'Kişi' ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                  Kişi
                </span>
                {editFormData.type === 'Kişi' && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                    <Check size={12} />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditFormData(prev => ({ ...prev, type: 'Kurum' }))}
                className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${editFormData.type === 'Kurum'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
                  }`}
              >
                <Building2 className={editFormData.type === 'Kurum' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                <span className={editFormData.type === 'Kurum' ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                  Kurum
                </span>
                {editFormData.type === 'Kurum' && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                    <Check size={12} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* İsim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editFormData.type === 'Kişi' ? 'Bağışçı Adı' : 'Kurum Adı'} *
            </label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Bağışçı adını girin"
            />
            {editErrors.name && (
              <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
            )}
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="ornek@email.com"
              />
            </div>
            {editErrors.email && (
              <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>
            )}
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+90 555 123 45 67"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={updateLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {updateLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Bağışçıyı Sil"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="text-red-600" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Emin misiniz?
          </h3>
          <p className="text-gray-500 mb-6">
            <strong>{selectedDonor?.name}</strong> adlı bağışçıyı silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Siliniyor...</span>
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Sil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
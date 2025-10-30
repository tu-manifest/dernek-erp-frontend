"use client";
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
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
  TrendingUp,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Donor {
  id: number;
  donorName: string;
  donorType: 'kisi' | 'kurum';
  email?: string;
  phoneNumber?: string;
  totalDonations: number;
  donationCount: number;
  lastDonationDate?: string;
  createdAt: string;
}

export default function ListDonorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'kisi' | 'kurum'>('all');
  const [sortField, setSortField] = useState<keyof Donor>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDonors, setSelectedDonors] = useState<number[]>([]);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Mock data
  const [donors] = useState<Donor[]>([
    {
      id: 1,
      donorName: 'Ahmet Yılmaz',
      donorType: 'kisi',
      email: 'ahmet@example.com',
      phoneNumber: '+90 555 123 45 67',
      totalDonations: 15000,
      donationCount: 5,
      lastDonationDate: '2025-10-15',
      createdAt: '2025-01-10'
    },
    {
      id: 2,
      donorName: 'ABC Holding A.Ş.',
      donorType: 'kurum',
      email: 'info@abcholding.com',
      phoneNumber: '+90 212 555 12 34',
      totalDonations: 50000,
      donationCount: 3,
      lastDonationDate: '2025-10-20',
      createdAt: '2025-02-15'
    },
    {
      id: 3,
      donorName: 'Fatma Demir',
      donorType: 'kisi',
      email: 'fatma@example.com',
      phoneNumber: '+90 555 987 65 43',
      totalDonations: 8000,
      donationCount: 8,
      lastDonationDate: '2025-10-18',
      createdAt: '2025-03-20'
    },
    {
      id: 4,
      donorName: 'XYZ Teknoloji Ltd.',
      donorType: 'kurum',
      email: 'destek@xyztek.com',
      phoneNumber: '+90 216 444 56 78',
      totalDonations: 75000,
      donationCount: 6,
      lastDonationDate: '2025-10-22',
      createdAt: '2025-04-05'
    },
    {
      id: 5,
      donorName: 'Mehmet Kaya',
      donorType: 'kisi',
      email: 'mehmet@example.com',
      totalDonations: 12000,
      donationCount: 4,
      lastDonationDate: '2025-10-10',
      createdAt: '2025-05-12'
    }
  ]);

  // Statistics
  const stats = {
    totalDonors: donors.length,
    individualDonors: donors.filter(d => d.donorType === 'kisi').length,
    corporateDonors: donors.filter(d => d.donorType === 'kurum').length,
    totalDonations: donors.reduce((sum, d) => sum + d.totalDonations, 0),
    averageDonation: donors.length > 0 
      ? donors.reduce((sum, d) => sum + d.totalDonations, 0) / donors.length 
      : 0
  };

  // Filter and search logic
  const filteredDonors = donors
    .filter(donor => {
      const matchesSearch = 
        donor.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phoneNumber?.includes(searchTerm);
      
      const matchesFilter = 
        filterType === 'all' || 
        donor.donorType === filterType;
      
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

  const handleEdit = (donor: Donor) => {
    console.log('Düzenle:', donor);
    // Edit modal veya sayfa yönlendirmesi
  };

  const handleDelete = (donorId: number) => {
    if (confirm('Bu bağışçıyı silmek istediğinizden emin misiniz?')) {
      console.log('Sil:', donorId);
      alert('Bağışçı başarıyla silindi!');
    }
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`${format.toUpperCase()} formatında dışa aktarılıyor...`);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Dış Bağışçı Listesi</h1>
        <p className="text-gray-600">Derneğe bağış yapan kişi ve kurumları yönetin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                {formatCurrency(stats.totalDonations)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Ort. Bağış</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.averageDonation)}
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
                onChange={(e) => setFilterType(e.target.value as 'all' | 'kisi' | 'kurum')}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Bağışçılar</option>
                <option value="kisi">Bireysel</option>
                <option value="kurum">Kurumsal</option>
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
                  onClick={() => handleSort('donorName')}
                >
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>Bağışçı Adı</span>
                    {sortField === 'donorName' && (
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
                  onClick={() => handleSort('totalDonations')}
                >
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} />
                    <span>Toplam Bağış</span>
                    {sortField === 'totalDonations' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} />
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
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedDonors.includes(donor.id) ? 'bg-blue-50' : ''
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        donor.donorType === 'kisi' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {donor.donorType === 'kisi' ? (
                          <Users className="text-green-600" size={20} />
                        ) : (
                          <Building2 className="text-purple-600" size={20} />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{donor.donorName}</div>
                        <div className="text-xs text-gray-500">ID: {donor.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      donor.donorType === 'kisi' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {donor.donorType === 'kisi' ? 'Bireysel' : 'Kurumsal'}
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
                      {donor.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-1" />
                          <span>{donor.phoneNumber}</span>
                        </div>
                      )}
                      {!donor.email && !donor.phoneNumber && (
                        <span className="text-sm text-gray-400">Bilgi yok</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(donor.totalDonations)}
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
                        onClick={() => console.log('Görüntüle:', donor)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Görüntüle"
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
                        onClick={() => handleDelete(donor.id)}
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
    </div>
  );
}
"use client"
import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Users,
  Calendar,
  FileText,
  Settings,
  TrendingUp,
  Scale,
  Network
} from 'lucide-react';

// API'den gelen grup verisi için interface
interface Group {
  id: number;
  group_name: string;
  description: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GroupTableProps {
  groups?: Group[];
  statistics?: {
    totalGroups: number;
    activeGroups: number;
    inactiveGroups: number;
    totalMembers: number;
    averageMembersPerGroup: number;
    largestGroupSize: number;
    smallestGroupSize: number;
    groupsWithoutMembers: number;
  };
  onEdit?: (group: Group) => void;
  onDelete?: (groupId: number) => void;
  onAddNew?: () => void;
  isLoading?: boolean;
  isError?: boolean;
}

const GroupTable: React.FC<GroupTableProps> = ({
  groups = [],
  statistics,
  onEdit,
  onDelete,
  onAddNew,
  isLoading = false,
  isError = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Group>('group_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  const displayGroups = groups || [];

  // Filter and search logic
  const filteredGroups = displayGroups
    .filter(group => {
      const matchesSearch = 
        group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && group.isActive) ||
        (filterStatus === 'inactive' && !group.isActive);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: keyof Group) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(group => group.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading durumu
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Grup Yönetimi</h2>
          <p className="text-blue-100">Veriler yükleniyor...</p>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Gruplar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error durumu
  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Hata</h2>
          <p className="text-red-100">Gruplar yüklenirken bir hata oluştu</p>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-500 text-lg mb-4">
            Veriler yüklenirken bir hata oluştu
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Grup Yönetimi</h2>

          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Grup ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 bg-white py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Gruplar</option>
              <option value="active">Aktif Gruplar</option>
              <option value="inactive">Pasif Gruplar</option>
            </select>
            
            {/* Add New Button */}
            <button 
              onClick={onAddNew}
              className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Plus size={18} />
              <span>Yeni Grup</span>
            </button>
            
            {/* Export Button */}
            <button 
              className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Download size={18} />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>
      </div>

     {/* Statistics Cards */}
<div className="bg-gray-50 p-6 border-b">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    
    {/* 1. Aktif Gruplar */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          {/* KONU: Grupların kendisi. Users yerine daha genel bir temsil. */}
          <Network className="text-blue-600" size={20} /> 
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">Aktif Gruplar</p>
          <p className="text-xl font-bold text-gray-900">
            {statistics?.activeGroups || filteredGroups.filter(g => g.isActive).length}
          </p>
        </div>
      </div>
    </div>
    
    {/* 2. Toplam Üye */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="p-2 bg-green-100 rounded-lg">
          {/* KONU: Toplam kişi sayısı. Users en uygun ikondur. */}
          <Users className="text-green-600" size={20} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
          <p  className="text-xl font-bold text-gray-900">
            {statistics?.totalMembers || filteredGroups.reduce((total, group) => total + group.memberCount, 0)}
          </p>
        </div>
      </div>
    </div>
    
    {/* 3. Ortalama Üye */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="p-2 bg-yellow-100 rounded-lg">
          {/* KONU: Ortalama, denge veya hesaplama. Scale veya Equal en uygunudur. */}
          <Scale className="text-yellow-600" size={20} /> 
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">Ortalama Üye</p>
          <p className="text-xl font-bold text-gray-900">
            {statistics?.averageMembersPerGroup || 
              (filteredGroups.length > 0 ? Math.round(filteredGroups.reduce((total, group) => total + group.memberCount, 0) / filteredGroups.length) : 0)}
          </p>
        </div>
      </div>
    </div>
    
    {/* 4. En Kalabalık Grup */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="p-2 bg-red-100 rounded-lg"> {/* Rengi Vurgu için kırmızıya çektim */}
          {/* KONU: En yüksek değer, zirve veya kalabalık. */}
          <TrendingUp className="text-red-600" size={20} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">En Kalabalık Grup</p>
          <p className="text-xl font-bold text-gray-900">
            {statistics?.largestGroupSize || 
              (filteredGroups.length > 0 ? Math.max(...filteredGroups.map(g => g.memberCount)) : 0)}
          </p>
        </div>
      </div>
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
                  checked={selectedGroups.length === filteredGroups.length && filteredGroups.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th 
                className="w-64 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('group_name')}
              >
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Grup Adı</span>
                  {sortField === 'group_name' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('memberCount')}
              >
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Üye Sayısı</span>
                  {sortField === 'memberCount' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="w-40 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Oluşturma Tarihi</span>
                  {sortField === 'createdAt' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="w-96 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span>Açıklama</span>
                </div>
              </th>
              <th className="w-24 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Durum
              </th>
              <th className="w-32 px-4 py-4 text-center text-sm font-semibold text-gray-700">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGroups.map((group) => (
              <tr 
                key={group.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedGroups.includes(group.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleSelectGroup(group.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                   
                    <div className="font-medium text-gray-900">{group.group_name}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600">{group.memberCount}</span>
                    <span className="text-sm text-gray-500 ml-1">üye</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDate(group.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 max-w-80">
                    <p className="line-clamp-3" title={group.description}>
                      {group.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit?.(group)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete?.(group.id)}
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
      {filteredGroups.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Grup bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Arama kriterlerinize uygun grup bulunmamaktadır.' 
              : 'Henüz hiç grup oluşturulmamış.'}
          </p>
          <button 
            onClick={onAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {searchTerm || filterStatus !== 'all' ? 'Tüm Grupları Göster' : 'İlk Grubu Oluştur'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            {selectedGroups.length > 0 && (
              <span className="font-medium">{selectedGroups.length} grup seçildi</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Toplam: {filteredGroups.length} grup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupTable;
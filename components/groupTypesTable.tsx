"use client"
import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Scale,
  Network,
  Loader2
} from 'lucide-react';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useCreateGroup from '@/hooks/useCreateGroup';
import useUpdateGroup from '@/hooks/useUpdateGroup';
import useDeleteGroup from '@/hooks/useDeleteGroup';

// API'den gelen grup verisi için interface
export interface Group {
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
  refetch?: () => void;
}

const GroupTable: React.FC<GroupTableProps> = ({
  groups = [],
  statistics,
  onEdit,
  onDelete,
  onAddNew,
  isLoading = false,
  isError = false,
  refetch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Group>('group_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  // Yeni grup ekleme modal state'leri
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [formErrors, setFormErrors] = useState<{ groupName?: string; description?: string }>({});

  // Edit modal state'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editFormErrors, setEditFormErrors] = useState<{ groupName?: string; description?: string }>({});

  // Delete modal state'leri
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // Hooks
  const { createGroup, isLoading: isCreating } = useCreateGroup();
  const { updateGroup, isLoading: isUpdating } = useUpdateGroup();
  const { deleteGroup, isLoading: isDeleting } = useDeleteGroup();

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

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

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

  // Yeni grup ekleme fonksiyonu
  const handleAddNewGroup = async () => {
    const errors: { groupName?: string; description?: string } = {};

    if (!newGroupName.trim()) {
      errors.groupName = 'Grup adı gereklidir';
    } else if (newGroupName.trim().length < 3) {
      errors.groupName = 'Grup adı en az 3 karakter olmalıdır';
    }

    if (!newGroupDescription.trim()) {
      errors.description = 'Açıklama gereklidir';
    } else if (newGroupDescription.trim().length < 10) {
      errors.description = 'Açıklama en az 10 karakter olmalıdır';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await createGroup({
      group_name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      isActive: true
    });

    if (result.success) {
      toast.success('Grup başarıyla oluşturuldu!');
      setNewGroupName('');
      setNewGroupDescription('');
      setFormErrors({});
      setIsAddModalOpen(false);
      refetch?.();
    } else {
      toast.error(result.error || 'Grup oluşturulurken bir hata oluştu');
    }
  };

  // Edit modal açma
  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setEditGroupName(group.group_name);
    setEditGroupDescription(group.description);
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  // Edit kaydetme
  const handleSaveEdit = async () => {
    if (!editingGroup) return;

    const errors: { groupName?: string; description?: string } = {};

    if (!editGroupName.trim()) {
      errors.groupName = 'Grup adı gereklidir';
    } else if (editGroupName.trim().length < 3) {
      errors.groupName = 'Grup adı en az 3 karakter olmalıdır';
    }

    if (!editGroupDescription.trim()) {
      errors.description = 'Açıklama gereklidir';
    } else if (editGroupDescription.trim().length < 10) {
      errors.description = 'Açıklama en az 10 karakter olmalıdır';
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    const result = await updateGroup(editingGroup.id, {
      group_name: editGroupName.trim(),
      description: editGroupDescription.trim()
    });

    if (result.success) {
      toast.success('Grup başarıyla güncellendi!');
      setIsEditModalOpen(false);
      setEditingGroup(null);
      refetch?.();
    } else {
      toast.error(result.error || 'Grup güncellenirken bir hata oluştu');
    }
  };

  // Delete modal açma
  const openDeleteModal = (group: Group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  // Delete işlemi
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;

    const result = await deleteGroup(groupToDelete.id);

    if (result.success) {
      toast.success('Grup başarıyla silindi!');
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
      refetch?.();
    } else {
      toast.error(result.error || 'Grup silinirken bir hata oluştu');
    }
  };

  // Excel Export fonksiyonu
  const handleExportExcel = () => {
    if (!filteredGroups.length) {
      toast.error("Listelenecek grup bulunamadı!");
      return;
    }

    const exportData = filteredGroups.map((group) => ({
      "Grup Adı": group.group_name,
      "Açıklama": group.description,
      "Üye Sayısı": group.memberCount,
      "Durum": group.isActive ? "Aktif" : "Pasif",
      "Oluşturma Tarihi": formatDate(group.createdAt),
      "Güncellenme Tarihi": formatDate(group.updatedAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gruplar");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `GrupListesi_${new Date().toLocaleDateString("tr-TR")}.xlsx`);
    toast.success('Excel dosyası indirildi!');
  };

  // Modal'ı açma
  const openAddModal = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Modal'ı kapatma
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setFormErrors({});
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
            onClick={() => refetch?.()}
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
              onClick={openAddModal}
              className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <Plus size={18} />
              <span>Yeni Grup</span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportExcel}
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
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
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

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
                <p className="text-xl font-bold text-gray-900">
                  {statistics?.totalMembers || filteredGroups.reduce((total, group) => total + group.memberCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
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

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
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
                className={`hover:bg-gray-50 transition-colors ${selectedGroups.includes(group.id) ? 'bg-blue-50' : ''
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {group.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(group)}
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
            onClick={openAddModal}
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

      {/* Yeni Grup Ekleme Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Yeni Grup Ekle"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grup Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => {
                  setNewGroupName(e.target.value);
                  if (formErrors.groupName) {
                    setFormErrors(prev => ({ ...prev, groupName: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formErrors.groupName ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Örn: Yönetim Kurulu, Proje Ekibi..."
                maxLength={100}
              />
            </div>
            {formErrors.groupName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.groupName}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {newGroupName.length}/100 karakter
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
              <textarea
                value={newGroupDescription}
                onChange={(e) => {
                  setNewGroupDescription(e.target.value);
                  if (formErrors.description) {
                    setFormErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
                rows={6}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Grubun görev ve sorumluluklarını detaylı olarak açıklayınız..."
                maxLength={500}
              />
            </div>
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {newGroupDescription.length}/500 karakter
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Bilgi</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Yeni oluşturulan grup varsayılan olarak <strong>aktif</strong> durumda olacaktır.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={closeAddModal}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleAddNewGroup}
              disabled={isCreating}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span>{isCreating ? 'Ekleniyor...' : 'Grup Ekle'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Grup Düzenle"
        size="lg"
      >
        {editingGroup && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grup Adı <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => {
                    setEditGroupName(e.target.value);
                    if (editFormErrors.groupName) {
                      setEditFormErrors(prev => ({ ...prev, groupName: undefined }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${editFormErrors.groupName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Grup adı giriniz..."
                  maxLength={100}
                />
              </div>
              {editFormErrors.groupName && (
                <p className="text-red-500 text-sm mt-1">{editFormErrors.groupName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  value={editGroupDescription}
                  onChange={(e) => {
                    setEditGroupDescription(e.target.value);
                    if (editFormErrors.description) {
                      setEditFormErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  rows={6}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${editFormErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Grup açıklaması giriniz..."
                  maxLength={500}
                />
              </div>
              {editFormErrors.description && (
                <p className="text-red-500 text-sm mt-1">{editFormErrors.description}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                {isUpdating && <Loader2 size={18} className="animate-spin" />}
                <span>{isUpdating ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Grup Silme Onayı"
        size="sm"
      >
        {groupToDelete && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-lg text-gray-900 mb-2">
                Bu grubu silmek istediğinize emin misiniz?
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{groupToDelete.group_name}</span> grubu kalıcı olarak silinecektir.
              </p>
              {groupToDelete.memberCount > 0 && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Bu grupta {groupToDelete.memberCount} üye bulunmaktadır.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GroupTable;
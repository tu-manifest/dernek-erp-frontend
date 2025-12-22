"use client"
import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  Search,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Loader2,
  Users
} from 'lucide-react';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import useGetGroups from '../hooks/useGetGroups';
import useUpdateMember, { UpdateMemberPayload } from '../hooks/useUpdateMember';
import useDeleteMember from '../hooks/useDeleteMember';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Member {
  id: string;
  fullName: string;
  tcNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  duesAmount: string;
  duesFrequency: 'monthly' | 'quarterly' | 'annual';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  group?: {
    id: number;
    group_name: string;
    isActive: boolean;
  };
  group_id: number;
}

interface MemberTableProps {
  members?: Member[];
  onEdit?: (member: Member) => void;
  onDelete?: (memberId: string) => void;
  refetch?: () => void;
}

const MemberTable: React.FC<MemberTableProps> = ({
  members = [],
  refetch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState<keyof Member>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Column widths - fixed groupType to be wider
  const [columnWidths] = useState({
    fullName: 180,
    tcNumber: 130,
    birthDate: 110,
    phoneNumber: 140,
    email: 180,
    address: 160,
    groupType: 160, // Increased from 140
    duesAmount: 100,
    duesFrequency: 110,
    paymentStatus: 110
  });

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateMemberPayload>({});

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Hooks
  const { groups, isLoading: groupsLoading, isError: groupsError } = useGetGroups();
  const { updateMember, isLoading: isUpdating } = useUpdateMember();
  const { deleteMember, isLoading: isDeleting } = useDeleteMember();

  const displayMembers = members.length > 0 ? members : [];

  const paymentStatusLabels = {
    pending: 'Beklemede',
    paid: 'Ödendi',
    overdue: 'Gecikmiş'
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  };

  const duesFrequencyLabels = {
    monthly: 'Aylık',
    quarterly: 'Üç Aylık',
    annual: 'Yıllık'
  };

  // Filter and search logic
  const filteredMembers = displayMembers
    .filter(member => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phoneNumber.includes(searchTerm);

      const matchesFilter = filterType === 'all' ||
        member.group?.group_name === filterType ||
        member.paymentStatus === filterType;

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

  const handleSort = (field: keyof Member) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Edit modal handlers
  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditFormData({
      fullName: member.fullName,
      tcNumber: member.tcNumber,
      birthDate: member.birthDate?.split('T')[0] || '',
      phoneNumber: member.phoneNumber,
      email: member.email,
      address: member.address,
      duesAmount: member.duesAmount,
      duesFrequency: member.duesFrequency,
      paymentStatus: member.paymentStatus,
      group_id: member.group_id,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'group_id' ? parseInt(value) : value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;

    const result = await updateMember(editingMember.id, editFormData);

    if (result.success) {
      toast.success('Üye başarıyla güncellendi!');
      setIsEditModalOpen(false);
      setEditingMember(null);
      refetch?.();
    } else {
      toast.error(result.error || 'Üye güncellenirken bir hata oluştu');
    }
  };

  // Delete modal handlers
  const openDeleteModal = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    const result = await deleteMember(memberToDelete.id);

    if (result.success) {
      toast.success('Üye başarıyla silindi!');
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      refetch?.();
    } else {
      toast.error(result.error || 'Üye silinirken bir hata oluştu');
    }
  };

  const handleExportExcel = () => {
    if (!filteredMembers.length) {
      toast.error("Listelenecek üye bulunamadı!");
      return;
    }

    const exportData = filteredMembers.map((member) => ({
      "Ad Soyad": member.fullName,
      "T.C. No": member.tcNumber,
      "Doğum Tarihi": new Date(member.birthDate).toLocaleDateString("tr-TR"),
      "Telefon": member.phoneNumber,
      "E-posta": member.email,
      "Adres": member.address,
      "Grup": member.group?.group_name || "Grup Yok",
      "Aidat (TL)": member.duesAmount,
      "Ödeme Sıklığı": duesFrequencyLabels[member.duesFrequency],
      "Durum": paymentStatusLabels[member.paymentStatus],
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Üyeler");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `UyeListesi_${new Date().toLocaleDateString("tr-TR")}.xlsx`);
    toast.success('Excel dosyası indirildi!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Üye Listesi</h2>
            <p className="text-blue-100">Toplam {filteredMembers.length} üye</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Üye ara..."
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
              disabled={groupsLoading}
            >
              <option value="all">
                {groupsLoading ? 'Yükleniyor...' : 'Tüm Üyeler'}
              </option>

              <optgroup label="Ödeme Durumuna Göre">
                <option value="pending">Beklemede</option>
                <option value="paid">Ödendi</option>
                <option value="overdue">Gecikmiş</option>
              </optgroup>

              {!groupsLoading && !groupsError && Array.isArray(groups) && groups.length > 0 && (
                <optgroup label="Gruplara Göre">
                  {groups.map((group: any) => (
                    <option key={group.id || group._id} value={group.group_name || group.name}>
                      {group.group_name || group.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

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

        {groupsError && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">Gruplar yüklenirken hata oluştu</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>

              <th
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                style={{ width: columnWidths.fullName }}
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Ad Soyad</span>
                  {sortField === 'fullName' && (
                    <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.tcNumber }}>
                T.C. No
              </th>

              <th
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                style={{ width: columnWidths.birthDate }}
                onClick={() => handleSort('birthDate')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Doğum</span>
                </div>
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.phoneNumber }}>
                <div className="flex items-center space-x-1">
                  <Phone size={14} />
                  <span>Telefon</span>
                </div>
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.email }}>
                <div className="flex items-center space-x-1">
                  <Mail size={14} />
                  <span>E-posta</span>
                </div>
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.address }}>
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Adres</span>
                </div>
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.groupType, minWidth: columnWidths.groupType }}>
                Üyelik Türü
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.duesAmount }}>
                <div className="flex items-center space-x-1">
                  <CreditCard size={14} />
                  <span>Aidat</span>
                </div>
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.duesFrequency }}>
                Sıklık
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700" style={{ width: columnWidths.paymentStatus }}>
                Durum
              </th>

              <th className="w-24 px-4 py-4 text-center text-sm font-semibold text-gray-700">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr
                key={member.id}
                className={`hover:bg-gray-50 transition-colors ${selectedMembers.includes(member.id) ? 'bg-blue-50' : ''
                  }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>

                <td className="px-4 py-4" style={{ width: columnWidths.fullName }}>
                  <div className="font-medium text-gray-900 truncate" title={member.fullName}>
                    {member.fullName}
                  </div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.tcNumber }}>
                  <div className="truncate" title={member.tcNumber}>{member.tcNumber}</div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.birthDate }}>
                  {formatDate(member.birthDate)}
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.phoneNumber }}>
                  <div className="truncate" title={member.phoneNumber}>{member.phoneNumber}</div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.email }}>
                  <div className="truncate" title={member.email}>{member.email}</div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.address }}>
                  <div className="truncate" title={member.address}>{member.address}</div>
                </td>

                <td className="px-4 py-4" style={{ width: columnWidths.groupType, minWidth: columnWidths.groupType }}>
                  <span
                    className="inline-block max-w-full px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate"
                    title={member.group?.group_name || 'Grup Yok'}
                  >
                    {member.group?.group_name || 'Grup Yok'}
                  </span>
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.duesAmount }}>
                  <div className="font-medium">₺{member.duesAmount}</div>
                </td>

                <td className="px-4 py-4 text-sm text-gray-600" style={{ width: columnWidths.duesFrequency }}>
                  <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {duesFrequencyLabels[member.duesFrequency]}
                  </span>
                </td>

                <td className="px-4 py-4" style={{ width: columnWidths.paymentStatus }}>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[member.paymentStatus]}`}>
                    {paymentStatusLabels[member.paymentStatus]}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(member)}
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
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Üye bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinize uygun üye bulunmamaktadır.</p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            {selectedMembers.length > 0 && (
              <span className="font-medium">{selectedMembers.length} üye seçildi</span>
            )}
          </div>
          <div className="text-sm text-gray-700">
            Toplam: {filteredMembers.length} üye
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Üye Düzenle"
        size="lg"
      >
        {editingMember && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input type="text" name="fullName" value={editFormData.fullName || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">T.C. Kimlik No</label>
                <input type="text" name="tcNumber" value={editFormData.tcNumber || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                <input type="date" name="birthDate" value={editFormData.birthDate || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="text" name="phoneNumber" value={editFormData.phoneNumber || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input type="email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aidat Miktarı (TL)</label>
                <input type="text" name="duesAmount" value={editFormData.duesAmount || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Sıklığı</label>
                <select name="duesFrequency" value={editFormData.duesFrequency || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="monthly">Aylık</option>
                  <option value="quarterly">Üç Aylık</option>
                  <option value="annual">Yıllık</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
                <select name="paymentStatus" value={editFormData.paymentStatus || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Beklemede</option>
                  <option value="paid">Ödendi</option>
                  <option value="overdue">Gecikmiş</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grup</label>
                <select name="group_id" value={editFormData.group_id || ''} onChange={handleEditFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Grup Seçin</option>
                  {Array.isArray(groups) && groups.map((group: any) => (
                    <option key={group.id} value={group.id}>{group.group_name || group.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <textarea name="address" value={editFormData.address || ''} onChange={handleEditFormChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold">İptal</button>
              <button onClick={handleSaveEdit} disabled={isUpdating} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Üye Silme Onayı"
        size="sm"
      >
        {memberToDelete && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-lg text-gray-900 mb-2">
                Bu üyeyi silmek istediğinize emin misiniz?
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{memberToDelete.fullName}</span> kalıcı olarak silinecektir.
              </p>
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

export default MemberTable;
"use client"
import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard
} from 'lucide-react';
import useGetGroups from '../hooks/useGetGroups';

interface Member {
  id: string;
  fullName: string;
  tcNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  duesAmount: string; // Backend'den string olarak geliyor
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
}

const MemberTable: React.FC<MemberTableProps> = ({
  members = [],
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState<keyof Member>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Sütun genişlikleri için state
  const [columnWidths, setColumnWidths] = useState({
    fullName: 200,
    tcNumber: 130,
    birthDate: 120,
    phoneNumber: 160,
    email: 200,
    address: 180,
    groupType: 140,
    duesAmount: 100,
    duesFrequency: 120, // Yeni sütun
    paymentStatus: 120
  });
  
  const [resizing, setResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Groups hook'unu kullan
  const { groups, isLoading: groupsLoading, isError: groupsError } = useGetGroups();

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

  // Filter and search logic - grup name'e göre filtreleme
  const filteredMembers = displayMembers
    .filter(member => {
      const matchesSearch = 
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phoneNumber.includes(searchTerm);
      
      // Grup name'e göre filtreleme
      const matchesFilter = filterType === 'all' || 
        member.group?.group_name === filterType ||
        member.paymentStatus === filterType;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Undefined veya null değerleri handle et
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

  // Resize fonksiyonları
  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    setResizing(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column as keyof typeof columnWidths]);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff); // Minimum 50px
    
    setColumnWidths(prev => ({
      ...prev,
      [resizing]: newWidth
    }));
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  // Mouse events için useEffect
  React.useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, startX, startWidth]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* CSS for resizable columns */}
      <style jsx>{`
        .resizing {
          user-select: none;
        }
        
        .resize-handle:hover {
          background-color: #3b82f6;
        }
        
        .resize-handle {
          transition: background-color 0.2s;
        }
        
        table {
          table-layout: fixed;
          width: 100%;
        }
        
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
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
            
            {/* Enhanced Filter with Groups */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={groupsLoading}
            >
              <option value="all">
                {groupsLoading ? 'Yükleniyor...' : 'Tüm Üyeler'}
              </option>
              
              {/* Ödeme durumuna göre filtreleme */}
              <optgroup label="Ödeme Durumuna Göre Filtrele">
                <option value="pending">Ödemesi Beklemede Olanlar</option>
                <option value="paid">Ödemesi Tamamlanmış</option>
                <option value="overdue">Ödemesi Gecikmişler</option>
              </optgroup>
              
              {/* Grupları dinamik olarak listele */}
              {!groupsLoading && !groupsError && Array.isArray(groups) && groups.length > 0 && (
                <>
                  <optgroup label="Gruplara Göre Filtrele">
                    {groups.map((group: any) => (
                      <option key={group.id || group._id} value={group.groupName || group.group_name || group.name}>
                        {group.groupName || group.group_name || group.name}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
              
            </select>
            
            {/* Export Button */}
            <button className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium">
              <Download size={18} />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>

        {/* Groups loading/error state */}
        {groupsError && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">Gruplar yüklenirken hata oluştu</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
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
              
              {/* Ad Soyad - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors relative border-r border-gray-200"
                style={{ width: columnWidths.fullName }}
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Ad Soyad</span>
                  {sortField === 'fullName' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'fullName')}
                />
              </th>
              
              {/* T.C. No - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.tcNumber }}
              >
                T.C. No
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'tcNumber')}
                />
              </th>
              
              {/* Doğum Tarihi - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors relative border-r border-gray-200"
                style={{ width: columnWidths.birthDate }}
                onClick={() => handleSort('birthDate')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Doğum Tarihi</span>
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'birthDate')}
                />
              </th>
              
              {/* Telefon - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.phoneNumber }}
              >
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>Telefon</span>
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'phoneNumber')}
                />
              </th>
              
              {/* E-posta - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.email }}
              >
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>E-posta</span>
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'email')}
                />
              </th>
              
              {/* Adres - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.address }}
              >
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Adres</span>
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'address')}
                />
              </th>
              
              {/* Üyelik Türü - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.groupType }}
              >
                Üyelik Türü
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'groupType')}
                />
              </th>
              
              {/* Aidat - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.duesAmount }}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} />
                  <span>Aidat</span>
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'duesAmount')}
                />
              </th>
              
              {/* Ödeme Sıklığı - Yeni Sütun - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.duesFrequency }}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Ödeme Sıklığı</span>
                </div>
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'duesFrequency')}
                />
              </th>
              
              {/* Ödeme Durumu - Resizable */}
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 relative border-r border-gray-200"
                style={{ width: columnWidths.paymentStatus }}
              >
                Ödeme Durumu
                <div 
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
                  onMouseDown={(e) => handleMouseDown(e, 'paymentStatus')}
                />
              </th>
              
              <th className="w-32 px-4 py-4 text-center text-sm font-semibold text-gray-700">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr 
                key={member.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedMembers.includes(member.id) ? 'bg-blue-50' : ''
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
                
                {/* Ad Soyad */}
                <td className="px-4 py-4 border-r border-gray-200" style={{ width: columnWidths.fullName }}>
                  <div className="font-medium text-gray-900 truncate" title={member.fullName}>
                    {member.fullName}
                  </div>
                </td>
                
                {/* T.C. No */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.tcNumber }}>
                  <div className="truncate" title={member.tcNumber}>
                    {member.tcNumber}
                  </div>
                </td>
                
                {/* Doğum Tarihi */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.birthDate }}>
                  {formatDate(member.birthDate)}
                </td>
                
                {/* Telefon */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.phoneNumber }}>
                  <div className="truncate" title={member.phoneNumber}>
                    {member.phoneNumber}
                  </div>
                </td>
                
                {/* E-posta */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.email }}>
                  <div className="truncate" title={member.email}>
                    {member.email}
                  </div>
                </td>
                
                {/* Adres */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.address }}>
                  <div className="truncate" title={member.address}>
                    {member.address}
                  </div>
                </td>
                
                {/* Üyelik Türü */}
                <td className="px-4 py-4 border-r border-gray-200" style={{ width: columnWidths.groupType }}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <div className="truncate" title={member.group?.group_name || 'Grup Yok'}>
                      {member.group?.group_name || 'Grup Yok'}
                    </div>
                  </span>
                </td>
                
                {/* Aidat */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.duesAmount }}>
                  <div className="font-medium truncate" title={`${member.duesAmount} TL`}>
                    ₺{member.duesAmount}
                  </div>
                </td>
                
                {/* Ödeme Sıklığı - Yeni Sütun */}
                <td className="px-4 py-4 text-sm text-gray-600 border-r border-gray-200" style={{ width: columnWidths.duesFrequency }}>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    <div className="truncate" title={duesFrequencyLabels[member.duesFrequency]}>
                      {duesFrequencyLabels[member.duesFrequency]}
                    </div>
                  </span>
                </td>
                
                {/* Ödeme Durumu */}
                <td className="px-4 py-4 border-r border-gray-200" style={{ width: columnWidths.paymentStatus }}>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentStatusColors[member.paymentStatus]
                  }`}>
                    <div className="truncate" title={paymentStatusLabels[member.paymentStatus]}>
                      {paymentStatusLabels[member.paymentStatus]}
                    </div>
                  </span>
                </td>
                
                {/* İşlemler */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit?.(member)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete?.(member.id)}
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

export default MemberTable;
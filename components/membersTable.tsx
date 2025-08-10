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

interface Member {
  id: string;
  fullName: string;
  tcNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  membershipType: string;
  applicationDate: string;
  duesAmount: string;
  duesFrequency: string;
  paymentStatus: string;
  charterApproval: boolean;
  kvkkApproval: boolean;
}

interface MemberTableProps {
  members?: Member[];
  onEdit?: (member: Member) => void;
  onDelete?: (memberId: string) => void;
  onView?: (member: Member) => void;
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

  // Sample data for demonstration
  const defaultMembers: Member[] = [
    {
      id: '1',
      fullName: 'Ahmet Yılmaz',
      tcNumber: '12345678901',
      birthDate: '1985-06-15',
      phoneNumber: '+90 555 123 45 67',
      email: 'ahmet.yilmaz@email.com',
      address: 'Kadıköy, İstanbul',
      membershipType: 'active',
      applicationDate: '2024-01-15',
      duesAmount: '500',
      duesFrequency: 'monthly',
      paymentStatus: 'paid',
      charterApproval: true,
      kvkkApproval: true
    },
    {
      id: '2',
      fullName: 'Fatma Demir',
      tcNumber: '98765432109',
      birthDate: '1990-03-22',
      phoneNumber: '+90 533 987 65 43',
      email: 'fatma.demir@email.com',
      address: 'Çankaya, Ankara',
      membershipType: 'student',
      applicationDate: '2024-02-10',
      duesAmount: '250',
      duesFrequency: 'quarterly',
      paymentStatus: 'pending',
      charterApproval: true,
      kvkkApproval: true
    },
    {
      id: '3',
      fullName: 'Mehmet Kaya',
      tcNumber: '11223344556',
      birthDate: '1978-11-08',
      phoneNumber: '+90 505 111 22 33',
      email: 'mehmet.kaya@email.com',
      address: 'Konak, İzmir',
      membershipType: 'honorary',
      applicationDate: '2023-12-05',
      duesAmount: '1000',
      duesFrequency: 'annual',
      paymentStatus: 'overdue',
      charterApproval: true,
      kvkkApproval: true
    }
  ];

  const displayMembers = members.length > 0 ? members : defaultMembers;

  const membershipTypeLabels = {
    active: 'Aktif Üye',
    honorary: 'Onur Üyesi',
    supporting: 'Destekleyici Üye',
    student: 'Öğrenci Üyesi'
  };

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
      
      const matchesFilter = filterType === 'all' || member.membershipType === filterType;
      
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
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2  w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Üyeler</option>
              <option value="active">Aktif Üyeler</option>
              <option value="student">Öğrenci Üyeleri</option>
              <option value="honorary">Onur Üyeleri</option>
              <option value="supporting">Destekleyici Üyeler</option>
            </select>
            
            {/* Export Button */}
            <button className="bg-white text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium">
              <Download size={18} />
              <span>Dışa Aktar</span>
            </button>
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
                  checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th 
                className="w-48 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
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
              </th>
              <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                T.C. No
              </th>
              <th 
                className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('birthDate')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Doğum Tarihi</span>
                </div>
              </th>
              <th className="w-40 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>Telefon</span>
                </div>
              </th>
              <th className="w-52 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span>E-posta</span>
                </div>
              </th>
              <th className="w-48 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Adres</span>
                </div>
              </th>
              <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Üyelik Türü
              </th>
              <th className="w-28 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} />
                  <span>Aidat</span>
                </div>
              </th>
              <th className="w-32 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                Ödeme Durumu
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
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{member.fullName}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 font-mono">
                  {member.tcNumber}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDate(member.birthDate)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {member.phoneNumber}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  <div className="truncate max-w-48" title={member.email}>
                    {member.email}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  <div className="truncate max-w-44" title={member.address}>
                    {member.address}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {membershipTypeLabels[member.membershipType as keyof typeof membershipTypeLabels]}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  <div className="font-medium">₺{member.duesAmount}</div>
                  <div className="text-xs text-gray-500">
                    {duesFrequencyLabels[member.duesFrequency as keyof typeof duesFrequencyLabels]}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentStatusColors[member.paymentStatus as keyof typeof paymentStatusColors]
                  }`}>
                    {paymentStatusLabels[member.paymentStatus as keyof typeof paymentStatusLabels]}
                  </span>
                </td>
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
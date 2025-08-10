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
  Settings
} from 'lucide-react';

interface Group {
  id: string;
  groupName: string;
  memberCount: number;
  createdDate: string;
  description: string;
  isActive: boolean;
}

interface GroupTableProps {
  groups?: Group[];
  onEdit?: (group: Group) => void;
  onDelete?: (groupId: string) => void;
  onAddNew?: () => void;
}

const GroupTable: React.FC<GroupTableProps> = ({
  groups = [],
  onEdit,
  onDelete,
  onAddNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Group>('groupName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Sample data for demonstration
  const defaultGroups: Group[] = [
    {
      id: '1',
      groupName: 'Yönetim Kurulu',
      memberCount: 7,
      createdDate: '2023-01-15',
      description: 'Derneğin yönetim kurulu üyeleri. Stratejik kararlar alır ve derneği yönetir.',
      isActive: true
    },
    {
      id: '2',
      groupName: 'Denetleme Kurulu',
      memberCount: 3,
      createdDate: '2023-01-15',
      description: 'Mali denetim ve hesap kontrolü yapan kurul üyeleri.',
      isActive: true
    },
    {
      id: '3',
      groupName: 'Genç Üyeler',
      memberCount: 25,
      createdDate: '2023-03-10',
      description: '18-30 yaş arası aktif genç üyeler. Etkinlik organizasyonu yapar.',
      isActive: true
    },
    {
      id: '4',
      groupName: 'Etkinlik Komitesi',
      memberCount: 12,
      createdDate: '2023-02-20',
      description: 'Sosyal etkinlikler, seminerler ve konferansları organize eden komite.',
      isActive: true
    },
    {
      id: '5',
      groupName: 'Eski Yönetim',
      memberCount: 5,
      createdDate: '2022-01-15',
      description: 'Önceki dönem yönetim kurulu üyeleri. Danışman rolündedir.',
      isActive: false
    },
    {
      id: '6',
      groupName: 'Onur Üyeleri',
      memberCount: 8,
      createdDate: '2023-01-01',
      description: 'Derneğe özel katkıları olan ve onur üyesi unvanı verilen değerli üyeler.',
      isActive: true
    }
  ];

  const displayGroups = groups.length > 0 ? groups : defaultGroups;

  // Filter and search logic
  const filteredGroups = displayGroups
    .filter(group => {
      const matchesSearch = 
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleSelectGroup = (groupId: string) => {
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
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getTotalMembers = () => {
    return filteredGroups.reduce((total, group) => total + group.memberCount, 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700  p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Grup Yönetimi</h2>
            <div className="flex items-center space-x-4 text-purple-100">
              <span>Toplam {filteredGroups.length} grup</span>
              <span>•</span>
              <span>{getTotalMembers()} toplam üye</span>
            </div>
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
                className="pl-10 pr-4 bg-white py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Aktif Gruplar</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredGroups.filter(g => g.isActive).length}
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
                <p className="text-xl font-bold text-gray-900">{getTotalMembers()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="text-yellow-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ortalama Üye</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredGroups.length > 0 ? Math.round(getTotalMembers() / filteredGroups.length) : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">En Büyük Grup</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredGroups.length > 0 ? Math.max(...filteredGroups.map(g => g.memberCount)) : 0}
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
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </th>
              <th 
                className="w-64 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('groupName')}
              >
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Grup Adı</span>
                  {sortField === 'groupName' && (
                    <span className="text-purple-600">
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
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="w-40 px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('createdDate')}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Oluşturma Tarihi</span>
                  {sortField === 'createdDate' && (
                    <span className="text-purple-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="w-96 px-4 py-4 text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span>Açıklama/Notlar</span>
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
                  selectedGroups.includes(group.id) ? 'bg-purple-50' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleSelectGroup(group.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      group.isActive ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <div className="font-medium text-gray-900">{group.groupName}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-purple-600">{group.memberCount}</span>
                    <span className="text-sm text-gray-500 ml-1">üye</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDate(group.createdDate)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 max-w-80">
                    <p className="line-clamp-2" title={group.description}>
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
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Grup bulunamadı</h3>
          <p className="text-gray-500 mb-4">Arama kriterlerinize uygun grup bulunmamaktadır.</p>
          <button 
            onClick={onAddNew}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            İlk Grubu Oluştur
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

export default GroupTable;
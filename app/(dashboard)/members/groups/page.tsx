"use client"
import React from 'react';
import GroupTable from '../../../components/groupTypesTable';
import useGetGroups from '../../../hooks/useGetGroups';

export default function MemberGroupsPage() {
  // Hook'u kullanarak grupları çek
  const { groups, isLoading, isError } = useGetGroups();

  const handleEdit = (group: any) => {
    console.log('Grup düzenle:', group);
    // Grup düzenleme modalı veya sayfasına yönlendirme
  };

  const handleDelete = (groupId: number) => {
    console.log('Grup sil:', groupId);
    // Silme onayı ve işlemi
    if (confirm('Bu grubu silmek istediğinizden emin misiniz?')) {
      // Silme işlemi
      alert('Grup başarıyla silindi!');
    }
  };

  const handleAddNew = () => {
    console.log('Yeni grup ekle');
    // Yeni grup ekleme modalı veya sayfasına yönlendirme
  };

  // API'den gelen veriyi parse et
  let groupsData = [];
  let statistics = null;

  if (groups) {
    if (Array.isArray(groups)) {
      groupsData = groups;
    } else if (groups.groups && Array.isArray(groups.groups)) {
      groupsData = groups.groups;
      statistics = groups.statistics;
    } else if (groups.data && Array.isArray(groups.data)) {
      groupsData = groups.data;
    }
  }

  return (
    <div className="p-6">
      <GroupTable 
        groups={groupsData}
        statistics={statistics}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
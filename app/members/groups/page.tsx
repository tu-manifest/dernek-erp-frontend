"use client"
import React from 'react';
import GroupTable from '../../../components/groupTypesTable';

export default function MemberGroupsPage() {
  const handleEdit = (group: any) => {
    console.log('Grup düzenle:', group);
    // Grup düzenleme modalı veya sayfasına yönlendirme
  };

  const handleDelete = (groupId: string) => {
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

  return (
    <div className="p-6">
      <GroupTable 
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />
    </div>
  );
}
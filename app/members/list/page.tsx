"use client"
import MemberTable from '../../../components/membersTable';

export default function MemberListPage() {
  const handleEdit = (member: any) => {
    console.log('Düzenle:', member);
    // Düzenleme modalı veya sayfasına yönlendirme
  };

  const handleDelete = (memberId: string) => {
    console.log('Sil:', memberId);
    // Silme onayı ve işlemi
  };



  return (
    <div className="p-6">
      <MemberTable 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
"use client"
import MemberTable from '../../../../components/membersTable';
import useGetAllMembers from '../../../../hooks/getAllMembers';

export default function MemberListPage() {
  // Hook'u kullanarak üyeleri çek
  const { members, isLoading, isError } = useGetAllMembers();

  const handleEdit = (member: any) => {
    console.log('Düzenle:', member);
    // Düzenleme modalı veya sayfasına yönlendirme
  };

  const handleDelete = (memberId: string) => {
    console.log('Sil:', memberId);
    // Silme onayı ve işlemi
    if (confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      // Silme işlemi burada yapılacak
      console.log('Üye silindi:', memberId);
    }
  };

  // Loading durumu
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Üye Listesi</h2>
            <p className="text-blue-100">Veriler yükleniyor...</p>
          </div>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Üyeler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error durumu
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Hata</h2>
            <p className="text-red-100">Üyeler yüklenirken bir hata oluştu</p>
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
      </div>
    );
  }

  return (
    <div className="p-6">
      <MemberTable 
        members={members} // Hook'tan gelen veriyi props olarak gönder
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Download,
  Trash2,
  FileText,
  File,
  Filter,
  Calendar,
  Loader2,
  AlertCircle,
  FolderOpen,
  Image,
} from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import useGetAllDocuments, { Document } from "@/hooks/useGetAllDocuments";
import useDeleteDocument from "@/hooks/useDeleteDocument";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

// Kategori renkleri
const getCategoryColor = (category: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    'Yönetim Kurulu Kararları': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'Mali Raporlar': { bg: 'bg-green-100', text: 'text-green-800' },
    'Üyelik Belgeleri': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Etkinlik Dökümanları': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Sözleşmeler': { bg: 'bg-red-100', text: 'text-red-800' },
    'Toplantı Tutanakları': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Diğer': { bg: 'bg-gray-100', text: 'text-gray-800' },
  };
  return colors[category] || colors['Diğer'];
};

// Dosya türüne göre ikon
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return <FileText className="text-red-500" size={20} />;
  }
  if (mimeType.includes('image')) {
    return <Image className="text-blue-500" size={20} />;
  }
  return <File className="text-gray-500" size={20} />;
};

// Dosya boyutu formatlama
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Tarih formatlama
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function DocumentListPage() {
  const { documents, summary, isLoading, isError, refetch } = useGetAllDocuments();
  const { deleteDocument, isLoading: isDeleting } = useDeleteDocument();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Kategoriler
  const categories = [
    'Yönetim Kurulu Kararları',
    'Mali Raporlar',
    'Üyelik Belgeleri',
    'Etkinlik Dökümanları',
    'Sözleşmeler',
    'Toplantı Tutanakları',
    'Diğer'
  ];

  // Filtreleme
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Arama filtresi
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          doc.name?.toLowerCase().includes(query) ||
          doc.fileName?.toLowerCase().includes(query) ||
          doc.category?.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Kategori filtresi
      if (filterCategory && doc.category !== filterCategory) return false;

      return true;
    });
  }, [documents, searchQuery, filterCategory]);

  const handleView = (doc: Document) => {
    // Yeni sekmede görüntüle
    window.open(API_ENDPOINTS.documents.view(doc.id), '_blank');
  };

  const handleDownload = (doc: Document) => {
    // İndirme linki oluştur
    const link = document.createElement('a');
    link.href = API_ENDPOINTS.documents.download(doc.id);
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      const result = await deleteDocument(documentToDelete.id);
      if (result.success) {
        toast.success(`"${documentToDelete.name}" başarıyla silindi!`);
        refetch();
      } else {
        toast.error(result.error || 'Döküman silinirken bir hata oluştu');
      }
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = getCategoryColor(category);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        {category}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Dökümanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg font-medium text-gray-900">Veri yüklenirken hata oluştu</p>
          <p className="text-gray-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FolderOpen size={32} className="text-blue-600" />
          Döküman Listesi
        </h1>
        <p className="text-gray-600">
          Sistemdeki tüm dökümanları görüntüleyin ve yönetin
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700">Filtreler</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ara... (Döküman adı, dosya adı, açıklama)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold">Dosya Adı</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Döküman Adı</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Kategori</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Boyut</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Yüklenme Tarihi</th>
                <th className="px-4 py-4 text-center text-sm font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Döküman bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.fileMimeType)}
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getCategoryBadge(doc.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(doc.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleView(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="İndir"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(doc)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Döküman Silme Onayı"
        size="sm"
      >
        {documentToDelete && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <p className="text-lg text-gray-900 mb-2">
                Bu dökümanı silmek istediğinize emin misiniz?
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">"{documentToDelete.name}"</span> kalıcı olarak silinecektir.
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
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Sil
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

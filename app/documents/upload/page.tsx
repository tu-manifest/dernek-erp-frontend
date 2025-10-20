"use client";
import React, { useState } from 'react';
import { 
  Upload, 
  File, 
  X, 
  Check, 
  FileText, 
  Calendar,
  FolderOpen,
  AlertCircle,
  Download,
  Eye,
  Trash2
} from 'lucide-react';

interface UploadedDocument {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  category: string;
  description: string;
}

export default function DocumentUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = [
    'Yönetim Kurulu Kararları',
    'Mali Raporlar',
    'Üyelik Belgeleri',
    'Etkinlik Dökümanları',
    'Sözleşmeler',
    'Toplantı Tutanakları',
    'Diğer'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    const newErrors: {[key: string]: string} = {};
    
    const validFiles = files.filter(file => {
      // Dosya türü kontrolü
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        newErrors[file.name] = 'Sadece PDF, JPEG ve PNG dosyaları kabul edilir';
        return false;
      }
      
      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        newErrors[file.name] = 'Dosya boyutu 10MB\'dan küçük olmalıdır';
        return false;
      }
      
      return true;
    });

    setErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="text-red-500" size={24} />;
    }
    return <File className="text-blue-500" size={24} />;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (selectedFiles.length === 0) {
      newErrors.files = 'En az bir dosya seçmelisiniz';
    }
    
    if (!category) {
      newErrors.category = 'Kategori seçimi zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = () => {
    if (!validateForm()) return;

    const newDocuments: UploadedDocument[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      fileName: file.name,
      fileType: file.type,
      fileSize: formatFileSize(file.size),
      uploadDate: new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      category,
      description
    }));

    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    
    // Formu sıfırla
    setSelectedFiles([]);
    setCategory('');
    setDescription('');
    setErrors({});
    
    alert(`${newDocuments.length} dosya başarıyla yüklendi!`);
  };

  const deleteDocument = (id: string) => {
    if (confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) {
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
         
          Döküman Yükleme
        </h1>
        <p className="text-gray-600 mt-1">Dernek dökümanlarınızı sisteme yükleyin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Yükleme Formu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dosya Yükleme Alanı */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderOpen size={20} />
              Dosya Seçimi
            </h2>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <Upload className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} size={48} />
              <p className="text-gray-700 font-medium mb-2">
                Dosyaları buraya sürükleyin veya tıklayın
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, JPEG, PNG formatlarında, maksimum 10MB
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                Dosya Seç
              </label>
            </div>

            {errors.files && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-red-600" size={18} />
                <p className="text-red-600 text-sm">{errors.files}</p>
              </div>
            )}

            {/* Seçili Dosyalar Listesi */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Seçili Dosyalar ({selectedFiles.length})
                </h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Kaldır"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hata Mesajları */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(errors).map(([fileName, error]) => (
                  fileName !== 'files' && fileName !== 'category' && (
                    <div key={fileName} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>{fileName}:</strong> {error}
                      </p>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Döküman Bilgileri */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Döküman Bilgileri
            </h2>

            <div className="space-y-4">
              {/* Kategori Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) {
                      setErrors(prev => {
                        const newErrors = {...prev};
                        delete newErrors.category;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Kategori seçiniz</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Döküman hakkında kısa bir açıklama yazın..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500 karakter
                </p>
              </div>
            </div>

            {/* Yükle Butonu */}
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition-all ${
                selectedFiles.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 shadow-lg'
              }`}
            >
              <Upload size={24} />
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} Dosyayı Yükle` 
                : 'Dosya Seçiniz'}
            </button>
          </div>
        </div>

        {/* Sağ Kolon - Yükleme İpuçları */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Önemli Bilgiler
            </h3>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Dosya boyutu maksimum 10MB olmalıdır</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>PDF, JPEG ve PNG formatları kabul edilir</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Birden fazla dosya aynı anda yüklenebilir</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Kategori seçimi zorunludur</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <span>Dosya isimleri açıklayıcı olmalıdır</span>
              </li>
            </ul>
          </div>

         
        </div>
      </div>

      {/* Yüklenmiş Dökümanlar Tablosu */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h2 className="text-2xl font-bold text-white">Yüklenmiş Dökümanlar</h2>
            <p className="text-blue-100 mt-1">Toplam {uploadedDocuments.length} döküman</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Dosya Adı
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Boyut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Yüklenme Tarihi
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uploadedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.fileType)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {doc.fileSize}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        {doc.uploadDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="İndir"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
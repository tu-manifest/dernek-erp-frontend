"use client";
import React, { useState } from 'react';
import {
  Upload,
  File,
  X,
  FileText,
  FolderOpen,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import useUploadDocument from '@/hooks/useUploadDocument';

export default function DocumentUploadPage() {
  const { uploadDocument, isLoading } = useUploadDocument();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const newErrors: { [key: string]: string } = {};

    // Dosya türü kontrolü
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      newErrors.file = 'Sadece PDF, JPEG ve PNG dosyaları kabul edilir';
      setErrors(newErrors);
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      newErrors.file = 'Dosya boyutu 10MB\'dan küçük olmalıdır';
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSelectedFile(file);

    // Dosya adını otomatik olarak name alanına doldur (uzantısız)
    if (!name) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setName(fileName);
    }
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
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
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
    const newErrors: { [key: string]: string } = {};

    if (!selectedFile) {
      newErrors.file = 'Dosya seçmelisiniz';
    }

    if (!name.trim()) {
      newErrors.name = 'Döküman adı zorunludur';
    }

    if (!category) {
      newErrors.category = 'Kategori seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm() || !selectedFile) return;

    const result = await uploadDocument({
      file: selectedFile,
      name: name.trim(),
      category,
      description: description.trim() || undefined,
    });

    if (result.success) {
      toast.success('Döküman başarıyla yüklendi!');
      // Formu sıfırla
      setSelectedFile(null);
      setName('');
      setCategory('');
      setDescription('');
      setErrors({});
    } else {
      toast.error(result.error || 'Döküman yüklenirken bir hata oluştu');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Upload size={28} className="text-blue-600" />
          Döküman Yükleme
        </h1>
        <p className="text-gray-600 mt-1">Dernek dökümanlarınızı sisteme yükleyin</p>
      </div>

      <div className="space-y-6">
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
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <Upload className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} size={48} />
            <p className="text-gray-700 font-medium mb-2">
              Dosyayı buraya sürükleyin veya tıklayın
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDF, JPEG, PNG formatlarında, maksimum 10MB
            </p>
            <input
              type="file"
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

          {errors.file && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={18} />
              <p className="text-red-600 text-sm">{errors.file}</p>
            </div>
          )}

          {/* Seçili Dosya */}
          {selectedFile && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Seçili Dosya
              </h3>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <button
                  onClick={removeFile}
                  className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Kaldır"
                >
                  <X size={18} />
                </button>
              </div>
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
            {/* Döküman Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Döküman Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.name;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Döküman adını girin..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

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
                      const newErrors = { ...prev };
                      delete newErrors.category;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.category ? 'border-red-500' : 'border-gray-300'
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
            disabled={!selectedFile || isLoading}
            className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 shadow-lg'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload size={24} />
                {selectedFile ? 'Dökümanı Yükle' : 'Dosya Seçiniz'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
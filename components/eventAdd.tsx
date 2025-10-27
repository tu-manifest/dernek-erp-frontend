"use client";

import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, Users, Download, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelMember {
  'Ad Soyad': string;
  'T.C. No': string;
  'Doğum Tarihi': string;
  'Telefon': string;
  'E-posta': string;
  'Adres': string;
  'Grup': string;
  'Aidat (TL)': string | number;
  'Ödeme Sıklığı': string;
}

interface ProcessedMember {
  fullName: string;
  tcNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  group: string;
  duesAmount: string;
  duesFrequency: 'monthly' | 'quarterly' | 'annual';
  paymentStatus: 'pending';
}

interface BulkMemberUploadProps {
  onMembersAdded?: (members: ProcessedMember[]) => void;
  onClose?: () => void;
}

export default function BulkMemberUpload({ onMembersAdded, onClose }: BulkMemberUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [members, setMembers] = useState<ProcessedMember[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Ödeme sıklığı mapping
  const frequencyMap: Record<string, 'monthly' | 'quarterly' | 'annual'> = {
    'Aylık': 'monthly',
    'Üç Aylık': 'quarterly',
    'Yıllık': 'annual',
    'monthly': 'monthly',
    'quarterly': 'quarterly',
    'annual': 'annual'
  };

  // Örnek Excel şablonu indirme
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Ad Soyad': 'Ahmet Yılmaz',
        'T.C. No': '12345678901',
        'Doğum Tarihi': '01.01.1990',
        'Telefon': '05551234567',
        'E-posta': 'ahmet@example.com',
        'Adres': 'Merkez Mah. No:123 Ankara',
        'Grup': 'Yönetim Kurulu',
        'Aidat (TL)': '500',
        'Ödeme Sıklığı': 'Aylık'
      },
      {
        'Ad Soyad': 'Ayşe Demir',
        'T.C. No': '98765432109',
        'Doğum Tarihi': '15.05.1985',
        'Telefon': '05559876543',
        'E-posta': 'ayse@example.com',
        'Adres': 'Çankaya Mah. No:456 İstanbul',
        'Grup': 'Proje Ekibi',
        'Aidat (TL)': '300',
        'Ödeme Sıklığı': 'Üç Aylık'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Üyeler");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Uye_Sablonu.xlsx';
    link.click();
  };

  // Tarih formatını dönüştür (DD.MM.YYYY -> YYYY-MM-DD)
  const convertDate = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // Eğer zaten YYYY-MM-DD formatındaysa
    if (dateStr.includes('-')) return dateStr;
    
    // DD.MM.YYYY formatını dönüştür
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr;
  };

  // Excel dosyası yükleme
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrors([]);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelMember[] = XLSX.utils.sheet_to_json(worksheet);

        // Verileri işle
        const processedMembers: ProcessedMember[] = [];
        const validationErrors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // Excel'de başlık 1. satır, veri 2. satırdan başlar

          // Zorunlu alanları kontrol et
          if (!row['Ad Soyad']) {
            validationErrors.push(`Satır ${rowNumber}: Ad Soyad eksik`);
          }
          if (!row['T.C. No']) {
            validationErrors.push(`Satır ${rowNumber}: T.C. No eksik`);
          }
          if (!row['Doğum Tarihi']) {
            validationErrors.push(`Satır ${rowNumber}: Doğum Tarihi eksik`);
          }
          if (!row['E-posta']) {
            validationErrors.push(`Satır ${rowNumber}: E-posta eksik`);
          }

          // Eğer zorunlu alanlar varsa ekle
          if (row['Ad Soyad'] && row['T.C. No'] && row['Doğum Tarihi'] && row['E-posta']) {
            const frequency = frequencyMap[row['Ödeme Sıklığı']] || 'monthly';
            
            processedMembers.push({
              fullName: row['Ad Soyad'],
              tcNumber: String(row['T.C. No']),
              birthDate: convertDate(String(row['Doğum Tarihi'])),
              phoneNumber: String(row['Telefon'] || ''),
              email: row['E-posta'],
              address: row['Adres'] || '',
              group: row['Grup'] || '',
              duesAmount: String(row['Aidat (TL)'] || '0'),
              duesFrequency: frequency,
              paymentStatus: 'pending'
            });
          }
        });

        setMembers(processedMembers);
        setErrors(validationErrors);
        setShowPreview(true);
      } catch (error) {
        setErrors(['Excel dosyası okunamadı. Lütfen dosya formatını kontrol edin.']);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  // Dosya kaldırma
  const handleRemoveFile = () => {
    setFile(null);
    setMembers([]);
    setErrors([]);
    setShowPreview(false);
  };

  // Üyeleri kaydet
  const handleSaveMembers = () => {
    if (members.length === 0) {
      alert('Eklenecek üye bulunamadı!');
      return;
    }

    // Frontend'de geçici olarak kaydet
    console.log('Kaydedilecek üyeler:', members);
    
    // Parent component'e bildir
    if (onMembersAdded) {
      onMembersAdded(members);
    }

    alert(`${members.length} üye başarıyla eklendi!`);
    
    // Formu temizle
    handleRemoveFile();
    
    // Modal'ı kapat
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Users className="mr-2" size={28} />
          Toplu Üye Ekleme
        </h2>
        <p className="text-gray-600">Excel dosyası yükleyerek birden fazla üyeyi aynı anda ekleyebilirsiniz.</p>
      </div>

      {/* Bilgilendirme Kutusu */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Excel Dosyası Hazırlama:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Önce örnek şablonu indirin</li>
              <li>Şablondaki sütun isimlerini değiştirmeyin</li>
              <li>Tarih formatı: GG.AA.YYYY (Örn: 01.01.1990)</li>
              <li>Ödeme Sıklığı: Aylık, Üç Aylık veya Yıllık</li>
              <li>T.C. No 11 haneli olmalıdır</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Şablon İndirme Butonu */}
      <div className="mb-6">
        <button
          onClick={handleDownloadTemplate}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center space-x-2 font-medium shadow-md"
        >
          <Download size={20} />
          <span>Örnek Şablon İndir</span>
        </button>
      </div>

      {/* Dosya Yükleme Alanı */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 hover:border-blue-500 transition-colors">
        {!file ? (
          <label className="cursor-pointer flex flex-col items-center">
            <Upload className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2 font-medium">Excel dosyası yüklemek için tıklayın</p>
            <p className="text-gray-400 text-sm">veya dosyayı sürükleyin</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="text-green-600" size={32} />
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* İşleniyor Durumu */}
      {isProcessing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Excel dosyası işleniyor...</p>
        </div>
      )}

      {/* Hatalar */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-2">Aşağıdaki hatalar bulundu:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Önizleme */}
      {showPreview && members.length > 0 && (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle2 className="text-green-600 mr-3" size={24} />
              <div>
                <h3 className="font-semibold text-green-800">
                  {members.length} üye başarıyla yüklendi
                </h3>
                <p className="text-sm text-green-700">
                  Aşağıdaki üyeleri inceleyip kaydedebilirsiniz
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Ad Soyad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">T.C. No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">E-posta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Grup</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Aidat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.tcNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.group || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₺{member.duesAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kaydet Butonu */}
      {showPreview && members.length > 0 && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleRemoveFile}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            onClick={handleSaveMembers}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center space-x-2 font-medium shadow-md"
          >
            <CheckCircle2 size={20} />
            <span>{members.length} Üyeyi Kaydet</span>
          </button>
        </div>
      )}
    </div>
  );
}
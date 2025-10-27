// utils/excelUtils.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Üye verilerini Excel'e aktarma
export const exportMembersToExcel = (members: any[], filename: string = 'uyeler') => {
  // Verileri Excel formatına dönüştür
  const excelData = members.map(member => ({
    'Ad Soyad': member.fullName,
    'T.C. Kimlik No': member.tcNumber,
    'Doğum Tarihi': new Date(member.birthDate).toLocaleDateString('tr-TR'),
    'Telefon': member.phoneNumber,
    'E-posta': member.email,
    'Adres': member.address,
    'Üyelik Türü': member.group?.group_name || 'Grup Yok',
    'Aidat (TL)': member.duesAmount,
    'Ödeme Sıklığı': member.duesFrequency === 'monthly' ? 'Aylık' : 
                      member.duesFrequency === 'quarterly' ? 'Üç Aylık' : 'Yıllık',
    'Ödeme Durumu': member.paymentStatus === 'pending' ? 'Beklemede' : 
                     member.paymentStatus === 'paid' ? 'Ödendi' : 'Gecikmiş'
  }));

  // Worksheet oluştur
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Sütun genişliklerini ayarla
  const colWidths = [
    { wch: 25 }, // Ad Soyad
    { wch: 15 }, // T.C. No
    { wch: 15 }, // Doğum Tarihi
    { wch: 15 }, // Telefon
    { wch: 30 }, // E-posta
    { wch: 40 }, // Adres
    { wch: 15 }, // Üyelik Türü
    { wch: 12 }, // Aidat
    { wch: 15 }, // Ödeme Sıklığı
    { wch: 15 }  // Ödeme Durumu
  ];
  ws['!cols'] = colWidths;

  // Workbook oluştur
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Üyeler');

  // Excel dosyası oluştur ve indir
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Grup verilerini Excel'e aktarma
export const exportGroupsToExcel = (groups: any[], filename: string = 'gruplar') => {
  const excelData = groups.map(group => ({
    'Grup Adı': group.groupName || group.group_name || group.name,
    'Açıklama': group.description || '',
    'Aktif/Pasif': group.isActive ? 'Aktif' : 'Pasif',
    'Oluşturulma Tarihi': group.createdAt ? new Date(group.createdAt).toLocaleDateString('tr-TR') : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 50 },
    { wch: 12 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gruplar');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Etkinlik verilerini Excel'e aktarma
export const exportEventsToExcel = (events: any[], filename: string = 'etkinlikler') => {
  const excelData = events.map(event => ({
    'Etkinlik Adı': event.name || event.title,
    'Başlangıç Tarihi': new Date(event.startDate).toLocaleDateString('tr-TR'),
    'Bitiş Tarihi': new Date(event.endDate).toLocaleDateString('tr-TR'),
    'Konum': event.location || '-',
    'Açıklama': event.description || '-',
    'Katılımcı Sayısı': event.participantCount || 0,
    'Durum': event.status || 'Planlandı'
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 },
    { wch: 50 },
    { wch: 15 },
    { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Etkinlikler');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Excel'den üye verilerini okuma (Toplu Üye Ekleme)
export const importMembersFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Excel verilerini sisteme uygun formata dönüştür
        const members = jsonData.map((row: any) => ({
          fullName: row['Ad Soyad'] || row['fullName'] || '',
          tcNumber: String(row['T.C. Kimlik No'] || row['tcNumber'] || ''),
          birthDate: parseExcelDate(row['Doğum Tarihi'] || row['birthDate']),
          phoneNumber: String(row['Telefon'] || row['phoneNumber'] || ''),
          email: row['E-posta'] || row['email'] || '',
          address: row['Adres'] || row['address'] || '',
          groupName: row['Üyelik Türü'] || row['groupName'] || '',
          duesAmount: String(row['Aidat (TL)'] || row['duesAmount'] || '0'),
          duesFrequency: parseDuesFrequency(row['Ödeme Sıklığı'] || row['duesFrequency']),
          paymentStatus: parsePaymentStatus(row['Ödeme Durumu'] || row['paymentStatus'])
        }));

        resolve(members);
      } catch (error) {
        reject(new Error('Excel dosyası okunamadı: ' + error));
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };

    reader.readAsBinaryString(file);
  });
};

// Yardımcı fonksiyonlar
const parseExcelDate = (dateValue: any): string => {
  if (!dateValue) return new Date().toISOString();
  
  // Eğer Excel seri numarası ise
  if (typeof dateValue === 'number') {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return new Date(date.y, date.m - 1, date.d).toISOString();
  }
  
  // Eğer string ise
  if (typeof dateValue === 'string') {
    // Türkçe tarih formatı: 25.10.2023
    const parts = dateValue.split(/[.\-\/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day).toISOString();
    }
  }
  
  return new Date(dateValue).toISOString();
};

const parseDuesFrequency = (value: string): 'monthly' | 'quarterly' | 'annual' => {
  if (!value) return 'monthly';
  
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes('aylık') || lowerValue === 'monthly') return 'monthly';
  if (lowerValue.includes('üç') || lowerValue === 'quarterly') return 'quarterly';
  if (lowerValue.includes('yıl') || lowerValue === 'annual') return 'annual';
  
  return 'monthly';
};

const parsePaymentStatus = (value: string): 'pending' | 'paid' | 'overdue' => {
  if (!value) return 'pending';
  
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes('bekle') || lowerValue === 'pending') return 'pending';
  if (lowerValue.includes('öden') || lowerValue === 'paid') return 'paid';
  if (lowerValue.includes('gecik') || lowerValue === 'overdue') return 'overdue';
  
  return 'pending';
};

// Şablon Excel dosyası oluşturma
export const downloadMemberTemplate = () => {
  const templateData = [
    {
      'Ad Soyad': 'Ahmet Yılmaz',
      'T.C. Kimlik No': '12345678901',
      'Doğum Tarihi': '01.01.1990',
      'Telefon': '05551234567',
      'E-posta': 'ahmet@example.com',
      'Adres': 'İstanbul, Türkiye',
      'Üyelik Türü': 'Normal Üye',
      'Aidat (TL)': '100',
      'Ödeme Sıklığı': 'Aylık',
      'Ödeme Durumu': 'Beklemede'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
    { wch: 30 }, { wch: 40 }, { wch: 15 }, { wch: 12 }, 
    { wch: 15 }, { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Şablon');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, 'uye_sablonu.xlsx');
};
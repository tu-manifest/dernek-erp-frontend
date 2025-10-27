import React from 'react';

// 1. Veri Tipi Tanımlaması (TypeScript Interface)
interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expenses: number;
}

// 2. Bileşen Props Tipi Tanımlaması
interface MonthlyTrendTableProps {
  data: MonthlyFinancialData[];
}

/**
 * Son 12 Aylık Finansal Trend Tablosu (Sadece Açık Tema Optimizasyonu)
 * @param {MonthlyTrendTableProps} props - Aylık finansal verileri içerir.
 */
const MonthlyTrendTable: React.FC<MonthlyTrendTableProps> = ({ data }) => {
  // Para birimi formatlayıcı (örneğin: 1234.56 -> 1.234,56 TL)
  const formatCurrency = (amount: number): string => {
    // Negatif/pozitif ayrımı için Math.abs kullanıldı
    const absoluteAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absoluteAmount);
    
    // Negatif ise başına eksi işareti ekle
    return amount < 0 ? `- ${formatted}` : formatted;
  };

  // Toplam ortalama bakiyeyi hesaplama
  const totalNetBalance = data.reduce((acc, item) => acc + (item.revenue - item.expenses), 0);
  const averageNetBalance = data.length > 0 ? totalNetBalance / data.length : 0;


  return (
    <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-xl border border-gray-200 transition duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3 border-gray-100">
        Son 12 Aylık Finansal Trend
      </h2>
      
      {/* Tablo Konteyneri: Belirtilen yükseklik ve dikey kaydırma */}
      <div className=" shadow-inner rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          
          {/* Tablo Başlığı: Yapışkan başlık */}
          <thead className="bg-gray-100  top-0 z-10 shadow-md">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ay</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">Gelir (TL)</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-red-700 uppercase tracking-wider">Gider (TL)</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">Net Bakiye</th>
            </tr>
          </thead>
          
          {/* Tablo İçeriği */}
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => {
              const netBalance = item.revenue - item.expenses;
              // Koşullu Stil: Kırmızı (negatif) veya Yeşil (pozitif/sıfır)
              const netColor = netBalance < 0 
                ? 'text-red-600' 
                : 'text-green-600';
              
              // Satır rengi: Son ay (veya ilk satır) için hafif vurgu
              const rowClass = index === data.length - 1 
                ? 'bg-blue-50/50 font-medium' 
                : 'hover:bg-gray-50';

              return (
                <tr key={item.month} className={`${rowClass} transition duration-150 ease-in-out`}>
                  {/* Ay */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.month}
                  </td>
                  {/* Gelir */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                    {formatCurrency(item.revenue)}
                  </td>
                  {/* Gider */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                    {formatCurrency(item.expenses)}
                  </td>
                  {/* Net Bakiye */}
                  <td className={`px-6 py-3 whitespace-nowrap text-sm font-bold text-right ${netColor}`}>
                    {formatCurrency(netBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
    
    </div>
  );
};

export default MonthlyTrendTable;
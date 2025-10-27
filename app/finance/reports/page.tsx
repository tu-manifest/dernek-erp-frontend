import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart, HardHat } from 'lucide-react';
import MetricCard from '@/components/metricCard';
import MonthlyTrendTable from '@/components/monthlyTable';
// Temsili Veriler
const financialData = {
  currentMonthNetBalance: 28500,
  netWorkingCapital: 145000,
  currentAssets: 200000,
  currentLiabilities: 55000,
  totalExpenses: 71500,
  totalBookValue: 550000,
  currentYearDepreciation: 85000,
  expenseDistribution: [
    { name: 'Proje Giderleri',  amount: 100000 },
    { name: 'Yönetim Giderleri',  amount: 21450 },
    { name: 'Fon Toplama Giderleri',  amount: 10725 },
  ],
  budgetTable: [
    { item: 'Üyelik Aidatları', planned: 120000, actual: 110000 },
    { item: 'Genel Bağışlar', planned: 80000, actual: 75000 },
    { item: 'Proje X Fonu', planned: 50000, actual: 55000 },
  ],
  currentAccounts: [
    { name: 'ABC Proje Ortaklığı', type: 'Alacak', amount: 15000, status: 'positive' },
    { name: 'XYZ Tedarikçi', type: 'Borç', amount: 8200, status: 'negative' },
    { name: 'Üye 456', type: 'Alacak', amount: 3500, status: 'positive' },
  ],
  // YENİ EK: Aylık Gelir ve Gider Trend Verileri
  monthlyTrendData: [
    { month: 'Ocak', revenue: 50000, expenses: 30000 },
    { month: 'Şubat', revenue: 60000, expenses: 35000 },
    { month: 'Mart', revenue: 55000, expenses: 40000 },
  ].reverse(), // Son ayı en alta almak için ters çevrilir
};

// Yardımcı Fonksiyon: Para Formatı
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
};


// Ana Rapor Bileşeni
const FinancialReportDashboard = () => {
  const isPositive = financialData.currentMonthNetBalance >= 0;
  const netWorkingCapitalStatus = financialData.netWorkingCapital >= 0 ? 'text-blue-600' : 'text-red-500';

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Finansal Rapor Paneli</h1>
        <div className="flex space-x-4">
          <select className="p-2 border border-gray-300 rounded-lg text-sm shadow-sm">
            <option>Bu Yıl (2025)</option>
            <option>Geçen Yıl (2024)</option>
            <option>Son 6 Ay</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md transition duration-150">
            Dışa Aktar (PDF)
          </button>
        </div>
      </div>

      {/* 1. Kilit Performans Göstergeleri (KPI) */}
      <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Aylık Net Bakiye (Güncel Ay)"
          value={formatCurrency(financialData.currentMonthNetBalance)}
          detail={isPositive ? 'Önceki Aya Göre: +2500' : 'Önceki Aya Göre: -2500'}
          icon={isPositive ? TrendingUp : TrendingDown}
          colorClass={isPositive ? 'text-green-600' : 'text-red-600'}
        />

        <MetricCard
          title="Net Çalışma Sermayesi"
          value={formatCurrency(financialData.netWorkingCapital)}
          detail={`Dönen Varlıklar ${formatCurrency(financialData.currentAssets)} / Yükümlülükler ${formatCurrency(financialData.currentLiabilities)}`}
          icon={DollarSign}
          colorClass={netWorkingCapitalStatus}
        />

    
        <MetricCard
          title="Toplam Giderler (Aylık)"
          value={formatCurrency(financialData.totalExpenses)}
          detail="En Yüksek Kalem: Proje Giderleri"
          icon={BarChart}
          colorClass="text-red-600"
        />
      </div>

      {/* 2. Temel Finansal Analiz (Aylık Trend Tablosu ve Dağılım) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <MonthlyTrendTable data={financialData.monthlyTrendData} />
        
        {/* Sağ Sütun: Gider Dağılımı ve Sabit Varlıklar */}
        <div className="space-y-6">
            {/* Gider Dağılımı */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Giderlerin Fonksiyonel Dağılımı</h3>
              {/* Pasta Grafik Yer Tutucusu */}
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mb-4">
                [Pasta Grafik/Halka Grafik]
              </div>
              <ul className="text-sm space-y-1">
                {financialData.expenseDistribution.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-medium text-gray-700">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Sabit Varlık Özeti */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sabit Varlık Özeti</h3>
                <div className="flex justify-between space-x-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">Toplam Defter Değeri</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(financialData.totalBookValue)}</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">Bu Yılki Amortisman</p>
                        <p className="text-xl font-bold text-orange-500">{formatCurrency(financialData.currentYearDepreciation)}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* 3. Bütçe ve Alacak/Borç Detayları */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Bütçe Uyum Tablosu (Geniş Alan) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Yıllık Bütçe Kalemleri Uyum Tablosu</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalem</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Planlanan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gerçekleşen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financialData.budgetTable.map((item, index) => {
                  const compliance = (item.actual / item.planned) * 100;
                  const diff = item.actual - item.planned;
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition duration-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.planned)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.actual)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          
                         
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
    
        
      </div>
    </div>
  );
};

export default FinancialReportDashboard;
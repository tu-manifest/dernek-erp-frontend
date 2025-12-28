'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart, Loader2, AlertCircle, Package } from 'lucide-react';
import MetricCard from '@/components/metricCard';
import MonthlyTrendTable from '@/components/monthlyTable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import useGetFinancialReport from '@/hooks/useGetFinancialReport';

ChartJS.register(ArcElement, Tooltip, Legend);

// Yardımcı Fonksiyon: Para Formatı
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6 sm:p-10 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 bg-gray-300 rounded w-64"></div>
      <div className="flex space-x-4">
        <div className="h-10 bg-gray-300 rounded w-32"></div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
    <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-lg h-96"></div>
      <div className="p-6 bg-white rounded-xl shadow-lg h-96"></div>
    </div>
  </div>
);

// Error Component
const ErrorState = ({ message, onRetry }: { message?: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gray-50 p-6 sm:p-10 flex items-center justify-center">
    <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Veri Yüklenirken Hata Oluştu</h2>
      <p className="text-gray-600 mb-4">{message || 'Finansal rapor verileri alınamadı.'}</p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition duration-150"
      >
        Tekrar Dene
      </button>
    </div>
  </div>
);

// Ana Rapor Bileşeni
const FinancialReportDashboard = () => {
  const { report, isLoading, isError, error, refetch } = useGetFinancialReport();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !report) {
    return <ErrorState message={error} onRetry={() => refetch()} />;
  }

  const isPositive = report.monthlyBalance.current >= 0;
  const netWorkingCapitalStatus = report.netWorkingCapital.netWorkingCapital >= 0 ? 'text-blue-600' : 'text-red-500';

  // Aylık değişim metni
  const changeText = report.monthlyBalance.changeAmount >= 0
    ? `Önceki Aya Göre: +${formatCurrency(report.monthlyBalance.changeAmount)}`
    : `Önceki Aya Göre: ${formatCurrency(report.monthlyBalance.changeAmount)}`;

  // Gider dağılımı verisini hazırla
  const expenseDistribution = report.currentMonthBreakdown.expense.length > 0
    ? report.currentMonthBreakdown.expense.map((item) => ({
      name: item.subCategory || item.category,
      amount: item.amount,
    }))
    : [{ name: 'Gider Yok', amount: 0 }];

  // Mevcut ay anahtarını belirle (örn: "2025-12")
  const currentMonth = new Date();
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  // Aylık trend verisi için dönüşüm (MonthlyTrendTable bileşenine uygun format)
  const monthlyTrendData = report.monthlyTrend.map((item) => ({
    month: item.monthName,
    monthKey: item.month, // "2025-12" formatında
    revenue: item.income,
    expenses: item.expense,
  }));

  // Chart renkleri
  const chartColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(20, 184, 166, 0.8)',
  ];

  const chartBorderColors = [
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(249, 115, 22, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(20, 184, 166, 1)',
  ];

  const bgColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Finansal Rapor Paneli</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
            {report.period.currentMonth} {report.period.year}
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md transition duration-150">
            Dışa Aktar (PDF)
          </button>
        </div>
      </div>

      {/* 1. Kilit Performans Göstergeleri (KPI) */}
      <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Aylık Net Bakiye (Güncel Ay)"
          value={formatCurrency(report.monthlyBalance.current)}
          detail={changeText}
          icon={isPositive ? TrendingUp : TrendingDown}
          colorClass={isPositive ? 'text-green-600' : 'text-red-600'}
        />

        <MetricCard
          title="Net Çalışma Sermayesi"
          value={formatCurrency(report.netWorkingCapital.netWorkingCapital)}
          detail={`Dönen Varlıklar: ${formatCurrency(report.netWorkingCapital.currentAssets)} / Yükümlülükler: ${formatCurrency(report.netWorkingCapital.currentLiabilities)}`}
          icon={DollarSign}
          colorClass={netWorkingCapitalStatus}
        />

        <MetricCard
          title="Toplam Giderler (Aylık)"
          value={formatCurrency(report.summary.totalExpense)}
          detail={`En Yüksek Kalem: ${report.summary.topExpenseCategory.name}`}
          icon={BarChart}
          colorClass="text-red-600"
        />
      </div>

      {/* 2. Temel Finansal Analiz (Aylık Trend Tablosu ve Dağılım) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <MonthlyTrendTable
          data={monthlyTrendData}
          currentMonthBreakdown={report.currentMonthBreakdown}
          currentMonthKey={currentMonthKey}
        />

        {/* Sağ Sütun: Gider Dağılımı ve Sabit Varlıklar */}
        <div className="space-y-6">
          {/* Gider Dağılımı */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Giderlerin Fonksiyonel Dağılımı</h3>
            {expenseDistribution[0].amount > 0 ? (
              <>
                {/* Doughnut Chart */}
                <div className="h-48 mb-4 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: expenseDistribution.map(item => item.name),
                      datasets: [{
                        data: expenseDistribution.map(item => item.amount),
                        backgroundColor: chartColors.slice(0, expenseDistribution.length),
                        borderColor: chartBorderColors.slice(0, expenseDistribution.length),
                        borderWidth: 2,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              return label + ': ' + formatCurrency(value);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <ul className="text-sm space-y-1">
                  {expenseDistribution.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${bgColors[index % bgColors.length]}`}></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-700">{formatCurrency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <p>Bu ay için gider kaydı bulunmamaktadır.</p>
              </div>
            )}
          </div>

          {/* Sabit Varlık Özeti */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Sabit Varlık Özeti</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Toplam Varlık Sayısı</p>
                <p className="text-xl font-bold text-gray-800">{report.fixedAssetSummary.totalAssets}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Toplam Defter Değeri</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(report.fixedAssetSummary.totalBookValue)}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-500">Bu Yılki Amortisman</p>
                <p className="text-xl font-bold text-orange-500">{formatCurrency(report.fixedAssetSummary.currentYearDepreciation)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bütçe Uyum Tablosu */}
      {report.budgetCompliance && report.budgetCompliance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yıllık Bütçe Kalemleri Uyum Tablosu</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalem</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Planlanan</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gerçekleşen</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Uyum %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.budgetCompliance.map((item, index) => {
                    const compliance = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                    return (
                      <tr key={item.id || index} className="hover:bg-gray-50 transition duration-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.planned)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.actual)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`font-semibold ${compliance >= 100 ? 'text-green-600' :
                            compliance >= 80 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                            {compliance.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bütçe Uyumu Yoksa Bilgi Mesajı */}
      {(!report.budgetCompliance || report.budgetCompliance.length === 0) && (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Yıllık Bütçe Kalemleri Uyum Tablosu</h2>
          <div className="text-center py-8 text-gray-400">
            <p>Henüz bütçe planı oluşturulmamış veya karşılaştırılacak veri bulunmuyor.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReportDashboard;
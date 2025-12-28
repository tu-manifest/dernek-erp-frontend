'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Breakdown Item Interface
interface BreakdownItem {
  category: string;
  subCategory?: string;
  amount: number;
}

// Monthly Breakdown Interface
interface MonthlyBreakdownData {
  income: BreakdownItem[];
  expense: BreakdownItem[];
}

// 1. Veri Tipi Tanımlaması (TypeScript Interface)
interface MonthlyFinancialData {
  month: string;
  monthKey?: string; // "2025-12" formatında ay anahtarı
  revenue: number;
  expenses: number;
  breakdown?: MonthlyBreakdownData;
}

// 2. Bileşen Props Tipi Tanımlaması
interface MonthlyTrendTableProps {
  data: MonthlyFinancialData[];
  currentMonthBreakdown?: MonthlyBreakdownData;
  currentMonthKey?: string; // Mevcut ayın anahtarı (ör: "2025-12")
}

/**
 * Son 12 Aylık Finansal Trend Tablosu - Genişleyebilir Satırlarla
 * @param {MonthlyTrendTableProps} props - Aylık finansal verileri içerir.
 */
const MonthlyTrendTable: React.FC<MonthlyTrendTableProps> = ({
  data,
  currentMonthBreakdown,
  currentMonthKey
}) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Para birimi formatlayıcı (örneğin: 1234.56 -> 1.234,56 TL)
  const formatCurrency = (amount: number): string => {
    const absoluteAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absoluteAmount);

    return amount < 0 ? `- ${formatted}` : formatted;
  };

  // Satıra tıklama handler
  const handleRowClick = (month: string) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  // Breakdown verisi var mı kontrol et
  const getBreakdownForMonth = (monthKey?: string): MonthlyBreakdownData | null => {
    // Mevcut ay için breakdown varsa döndür
    if (currentMonthKey && monthKey === currentMonthKey && currentMonthBreakdown) {
      return currentMonthBreakdown;
    }
    return null;
  };

  return (
    <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-xl border border-gray-200 transition duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3 border-gray-100">
        Son 12 Aylık Finansal Trend
      </h2>

      {/* Tablo Konteyneri */}
      <div className="shadow-inner rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">

          {/* Tablo Başlığı */}
          <thead className="bg-gray-100 top-0 z-10 shadow-md">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ay</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">Gelir (TL)</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-red-700 uppercase tracking-wider">Gider (TL)</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">Net Bakiye</th>
              <th className="px-4 py-4 w-10"></th>
            </tr>
          </thead>

          {/* Tablo İçeriği */}
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => {
              const netBalance = item.revenue - item.expenses;
              const netColor = netBalance < 0 ? 'text-red-600' : 'text-green-600';
              const isExpanded = expandedMonth === item.month;
              const breakdown = getBreakdownForMonth(item.monthKey);
              const hasData = item.revenue > 0 || item.expenses > 0;
              const isCurrentMonth = item.monthKey === currentMonthKey;

              // Satır rengi
              const rowClass = index === data.length - 1
                ? 'bg-blue-50/50 font-medium'
                : 'hover:bg-gray-50';

              return (
                <React.Fragment key={item.month}>
                  {/* Ana Satır */}
                  <tr
                    className={`${rowClass} transition duration-150 ease-in-out ${hasData ? 'cursor-pointer' : ''}`}
                    onClick={() => hasData && handleRowClick(item.month)}
                  >
                    {/* Ay */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {item.month}
                        {isCurrentMonth && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Güncel
                          </span>
                        )}
                      </div>
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
                    {/* Genişletme İkonu */}
                    <td className="px-4 py-3 text-center">
                      {hasData && (
                        isExpanded
                          ? <ChevronUp className="h-4 w-4 text-gray-500" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </td>
                  </tr>

                  {/* Genişletilmiş Detay Satırı */}
                  {isExpanded && hasData && (
                    <tr className="bg-gray-50/80">
                      <td colSpan={5} className="px-6 py-4">
                        {breakdown ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Gelir Detayları */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Gelir Kalemleri
                              </h4>
                              {breakdown.income.length > 0 ? (
                                <ul className="space-y-2">
                                  {breakdown.income.map((incomeItem, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">
                                        {incomeItem.subCategory || incomeItem.category}
                                      </span>
                                      <span className="font-medium text-green-700">
                                        {formatCurrency(incomeItem.amount)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-400 italic">Bu ay için gelir kaydı yok</p>
                              )}
                            </div>

                            {/* Gider Detayları */}
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Gider Kalemleri
                              </h4>
                              {breakdown.expense.length > 0 ? (
                                <ul className="space-y-2">
                                  {breakdown.expense.map((expenseItem, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">
                                        {expenseItem.subCategory || expenseItem.category}
                                      </span>
                                      <span className="font-medium text-red-700">
                                        {formatCurrency(expenseItem.amount)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-400 italic">Bu ay için gider kaydı yok</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400">
                            <p className="text-sm">Bu ay için detaylı kırılım bilgisi mevcut değil.</p>
                            <p className="text-xs mt-1">Sadece güncel ay için detaylı görünüm sunulmaktadır.</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyTrendTable;
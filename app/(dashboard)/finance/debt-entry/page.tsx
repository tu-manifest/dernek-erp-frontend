// borç giriş ekranı
"use client"

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BorcGirisiForm from "../../../../components/financeDebtEntry";
import React, { useState } from "react";

export default function BorcGirisiPage() {
  const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Borç kaydı gönderiliyor:", data);
      // 🔹 Burada API isteğini yapabilirsin, örnek:
      // await fetch("/api/borclar", { method: "POST", body: JSON.stringify(data) });

      alert(" Borç kaydı başarıyla gönderildi!");
    } catch (error) {
      console.error(error);
      alert(" Borç kaydı sırasında hata oluştu!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {/* <Link
          href="/finance"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        {/*</Link> */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alacak Girişi</h1>
          <p className="text-gray-600 mt-1">Yeni alacak kaydı oluşturun</p>
        </div>
      </div>

      <BorcGirisiForm onSubmit={handleFormSubmit} isLoading={isLoading}/>
    </div>
  );
}

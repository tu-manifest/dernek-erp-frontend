// borç giriş ekranı
"use client"

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BorcGirisiForm from "../../../../components/financeDebtEntry";
import React, { useState } from "react";
import useCreateDebt, { CreateDebtPayload } from "../../../../hooks/useCreateDebt";

export default function BorcGirisiPage() {
  const { createDebt, isLoading } = useCreateDebt();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = async (data: any) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    // API'ye gönderilecek payload'ı oluştur
    let payload: CreateDebtPayload;

    if (data.borcluTur === "uye") {
      // Üye için payload
      payload = {
        memberId: data.borcluId,
        debtType: data.borcTuru,
        amount: parseFloat(data.borcBedeli),
        currency: data.paraCinsi,
        dueDate: data.vadeTarihi,
        description: data.aciklama || undefined,
      };
    } else {
      // Dış bağışçı için payload
      payload = {
        externalDebtorId: String(data.borcluId),
        debtType: data.borcTuru,
        amount: parseFloat(data.borcBedeli),
        currency: data.paraCinsi,
        dueDate: data.vadeTarihi,
        description: data.aciklama || undefined,
      };
    }

    const result = await createDebt(payload);

    if (result.success) {
      setSuccessMessage("Borç kaydı başarıyla oluşturuldu!");
    } else {
      setErrorMessage(result.error || "Borç kaydı oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alacak Girişi</h1>
          <p className="text-gray-600 mt-1">Yeni alacak kaydı oluşturun</p>
        </div>
      </div>

      {/* Başarı Mesajı */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      {/* Hata Mesajı */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {errorMessage}
        </div>
      )}

      <BorcGirisiForm onSubmit={handleFormSubmit} isLoading={isLoading} />
    </div>
  );
}

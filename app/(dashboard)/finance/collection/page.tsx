"use client"
import React, { useState } from 'react';
import TahsilatKaydiForm, { TahsilatFormData } from '../../../../components/financeCollection';
import useCreateCollection, { CreateCollectionPayload } from '../../../../hooks/useCreateCollection';
import useCreateBulkCollection, { CreateBulkCollectionPayload } from '../../../../hooks/useCreateBulkCollection';

export default function TahsilatKaydiPage() {
  const { createCollection, isLoading: isSingleLoading } = useCreateCollection();
  const { createBulkCollection, isLoading: isBulkLoading } = useCreateBulkCollection();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: TahsilatFormData) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (formData.isBulk) {
        // Toplu Tahsilat
        const payload: CreateBulkCollectionPayload = {
          debtorType: formData.borcluTur,
          debtorId: formData.borcluId,
          totalAmount: parseFloat(formData.tahsilatMiktari),
          currency: formData.paraCinsi,
          collectionDate: formData.tahsilatTarihi,
          paymentMethod: formData.tahsilatSekli,
          receiptNumber: formData.dekontoNo || undefined,
          notes: formData.aciklama || undefined,
          convertToDonation: true, // Varsayılan olarak fazlalığı bağışa çevir
        };

        const result = await createBulkCollection(payload);
        if (result.success) {
          let msg = `Toplu tahsilat başarıyla oluşturuldu.`;
          if (result.data?.donation?.id) {
            msg += ` Kalan tutar bağış olarak kaydedildi.`;
          }
          setSuccessMessage(msg);
        } else {
          setErrorMessage(result.error || "Toplu tahsilat oluşturulurken bir hata oluştu.");
        }

      } else {
        // Tekil Tahsilat
        if (!formData.borcId) {
          setErrorMessage("Tekil ödeme için borç seçimi zorunludur.");
          return;
        }

        const payload: CreateCollectionPayload = {
          debtId: formData.borcId,
          amountPaid: parseFloat(formData.tahsilatMiktari),
          collectionDate: formData.tahsilatTarihi,
          paymentMethod: formData.tahsilatSekli,
          receiptNumber: formData.dekontoNo || undefined,
          notes: formData.aciklama || undefined,
        };

        const result = await createCollection(payload);
        if (result.success) {
          setSuccessMessage("Tahsilat kaydı başarıyla oluşturuldu!");
        } else {
          setErrorMessage(result.error || "Tahsilat kaydı oluşturulurken bir hata oluştu.");
        }
      }
    } catch (error: any) {
      setErrorMessage("Beklenmedik bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tahsilat İşlemleri</h1>
        <p className="text-gray-600">Tekil veya toplu tahsilat işlemlerini buradan gerçekleştirebilirsiniz.</p>
      </div>

      {/* Başarı Mesajı */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Hata Mesajı */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}

      <TahsilatKaydiForm onSubmit={handleSubmit} isLoading={isSingleLoading || isBulkLoading} />
    </div>
  );
}

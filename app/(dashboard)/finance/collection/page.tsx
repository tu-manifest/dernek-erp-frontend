"use client"
import React, { useState } from 'react';
import TahsilatKaydiForm, { TahsilatFormData } from '../../../../components/financeCollection';
import useCreateCollection, { CreateCollectionPayload } from '../../../../hooks/useCreateCollection';
import useCreateBulkCollection, { CreateBulkCollectionPayload } from '../../../../hooks/useCreateBulkCollection';
import { toast } from 'sonner';

export default function TahsilatKaydiPage() {
  const { createCollection, isLoading: isSingleLoading } = useCreateCollection();
  const { createBulkCollection, isLoading: isBulkLoading } = useCreateBulkCollection();

  // Form'u sıfırlamak için key kullanıyoruz
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (formData: TahsilatFormData) => {
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
          toast.success(msg);
          // Formu sıfırla
          setFormKey(prev => prev + 1);
        } else {
          toast.error(result.error || "Toplu tahsilat oluşturulurken bir hata oluştu.");
        }

      } else {
        // Tekil Tahsilat
        if (!formData.borcId) {
          toast.error("Tekil ödeme için borç seçimi zorunludur.");
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
          toast.success("Tahsilat kaydı başarıyla oluşturuldu!");
          // Formu sıfırla
          setFormKey(prev => prev + 1);
        } else {
          toast.error(result.error || "Tahsilat kaydı oluşturulurken bir hata oluştu.");
        }
      }
    } catch (error: any) {
      toast.error("Beklenmedik bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tahsilat İşlemleri</h1>
        <p className="text-gray-600">Tekil veya toplu tahsilat işlemlerini buradan gerçekleştirebilirsiniz.</p>
      </div>

      <TahsilatKaydiForm key={formKey} onSubmit={handleSubmit} isLoading={isSingleLoading || isBulkLoading} />
    </div>
  );
}

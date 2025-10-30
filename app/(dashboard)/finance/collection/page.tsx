"use client";

import TahsilatKaydiForm, { TahsilatFormData } from "../../../components/financeCollection";
import { useState } from "react";

export default function TahsilatKaydiPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: TahsilatFormData) => {
    try {
      setLoading(true);
      console.log(" Tahsilat Formu Gönderiliyor:", data);

      // 🔹 Burada API’ye gönderme örneği
      // const res = await fetch("/api/tahsilat", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });
      // if (!res.ok) throw new Error("Tahsilat kaydı oluşturulamadı.");

      alert(" Tahsilat kaydı başarıyla oluşturuldu!");
    } catch (error) {
      console.error(error);
      alert("Tahsilat kaydı oluşturulamadı!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <TahsilatKaydiForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}

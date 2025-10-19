// borç giriş ekranı

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BorcGirisiForm from "../../../components/financeDebtEntry";

export default function BorcGirisiPage() {
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
          <h1 className="text-2xl font-bold text-gray-800">Borç Girişi</h1>
          <p className="text-gray-600 mt-1">Yeni borç kaydı oluşturun</p>
        </div>
      </div>

      <BorcGirisiForm />
    </div>
  );
}

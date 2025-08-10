import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Upload, FileText, Shield, Check } from 'lucide-react';

interface FormData {
  fullName: string;
  tcNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  address: string;
  membershipType: string;
  applicationDate: string;
  duesAmount: string;
  duesFrequency: string;
  paymentStatus: string;
  idCopyFile: File | null;
  photoFile: File | null;
  charterApproval: boolean;
  kvkkApproval: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const MembershipForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    tcNumber: '',
    birthDate: '',
    phoneNumber: '',
    email: '',
    address: '',
    membershipType: '',
    applicationDate: new Date().toISOString().split('T')[0],
    duesAmount: '',
    duesFrequency: '',
    paymentStatus: 'pending',
    idCopyFile: null,
    photoFile: null,
    charterApproval: false,
    kvkkApproval: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const membershipTypes: SelectOption[] = [
    { value: 'active', label: 'Aktif Üye' },
    { value: 'honorary', label: 'Onur Üyesi' },
    { value: 'supporting', label: 'Destekleyici Üye' },
    { value: 'student', label: 'Öğrenci Üyesi' }
  ];

  const duesFrequencies: SelectOption[] = [
    { value: 'monthly', label: 'Aylık' },
    { value: 'quarterly', label: 'Üç Aylık' },
    { value: 'annual', label: 'Yıllık' }
  ];

  const paymentStatuses: SelectOption[] = [
    { value: 'pending', label: 'Beklemede' },
    { value: 'paid', label: 'Ödendi' },
    { value: 'overdue', label: 'Gecikmiş' }
  ];

  const validateTCNumber = (tc: string): boolean => {
    if (!tc || tc.length !== 11) return false;
    if (!/^\d+$/.test(tc)) return false;
    if (tc[0] === '0') return false;
    
    const digits = tc.split('').map(Number);
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
    const check1 = (sum1 * 7 - sum2) % 10;
    const check2 = (sum1 + sum2 + digits[9]) % 10;
    
    return check1 === digits[9] && check2 === digits[10];
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+90\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (field: 'idCopyFile' | 'photoFile', file: File | null): void => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Ad ve soyad gereklidir';
    if (!validateTCNumber(formData.tcNumber)) newErrors.tcNumber = 'Geçerli bir T.C. kimlik numarası giriniz';
    if (!formData.birthDate) newErrors.birthDate = 'Doğum tarihi gereklidir';
    if (!validatePhone(formData.phoneNumber)) newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz (+90 formatında)';
    if (!validateEmail(formData.email)) newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    if (!formData.address.trim()) newErrors.address = 'Adres bilgisi gereklidir';
    if (!formData.membershipType) newErrors.membershipType = 'Üyelik türü seçiniz';
    if (!formData.charterApproval) newErrors.charterApproval = 'Dernek tüzüğünü kabul etmelisiniz';
    if (!formData.kvkkApproval) newErrors.kvkkApproval = 'KVKK onayı gereklidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form başarıyla gönderildi:', formData);
      alert('Üyelik başvurunuz başarıyla alındı!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-bold text-center mb-2">Dernek Üyelik Başvuru Formu</h1>
            <p className="text-blue-100 text-center">Lütfen tüm bilgileri eksiksiz doldurunuz</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="mr-2 text-blue-600" size={24} />
                Kişisel Bilgiler
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad ve Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Adınız ve soyadınız"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    T.C. Kimlik Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tcNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tcNumber', e.target.value)}
                    maxLength={11}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.tcNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345678901"
                  />
                  {errors.tcNumber && <p className="text-red-500 text-sm mt-1">{errors.tcNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('birthDate', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.birthDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Üyelik Türü <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.membershipType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('membershipType', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.membershipType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Üyelik türü seçiniz</option>
                    {membershipTypes.map((type: SelectOption) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.membershipType && <p className="text-red-500 text-sm mt-1">{errors.membershipType}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Phone className="mr-2 text-blue-600" size={24} />
                İletişim Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phoneNumber', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tam adresinizi yazınız (en azından şehir/ilçe bilgisi)"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Membership Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <CreditCard className="mr-2 text-blue-600" size={24} />
                Üyelik Detayları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başvuru Tarihi</label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aidat Miktarı (TL)</label>
                  <input
                    type="number"
                    value={formData.duesAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('duesAmount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Sıklığı</label>
                  <select
                    value={formData.duesFrequency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('duesFrequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    {duesFrequencies.map((freq: SelectOption) => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Durumu</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('paymentStatus', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {paymentStatuses.map((status: SelectOption) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Upload className="mr-2 text-blue-600" size={24} />
                Belge Yüklemeleri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kimlik Fotokopisi <span className="text-gray-500">(PDF/JPEG)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <input
                      type="file"
                      accept=".pdf,.jpeg,.jpg"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('idCopyFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="idCopy"
                    />
                    <label htmlFor="idCopy" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">Dosya seçiniz</span>
                      {formData.idCopyFile && (
                        <p className="text-sm text-gray-600 mt-2">{formData.idCopyFile.name}</p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vesikalık Fotoğraf <span className="text-gray-500">(JPEG/PNG)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <input
                      type="file"
                      accept=".jpeg,.jpg,.png"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('photoFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="photo"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">Dosya seçiniz</span>
                      {formData.photoFile && (
                        <p className="text-sm text-gray-600 mt-2">{formData.photoFile.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Approvals Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Shield className="mr-2 text-blue-600" size={24} />
                Onaylar
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="charterApproval"
                    checked={formData.charterApproval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('charterApproval', e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="charterApproval" className="text-sm font-medium text-gray-700">
                      Dernek Tüzüğü Onayı <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Dernek tüzüğünü okuduğumu ve kabul ettiğimi beyan ederim.
                    </p>
                    {errors.charterApproval && <p className="text-red-500 text-sm mt-1">{errors.charterApproval}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="kvkkApproval"
                    checked={formData.kvkkApproval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('kvkkApproval', e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="kvkkApproval" className="text-sm font-medium text-gray-700">
                      KVKK Onayı <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Kişisel verilerimin KVKK kapsamında işlenmesine onay veriyorum.
                    </p>
                    {errors.kvkkApproval && <p className="text-red-500 text-sm mt-1">{errors.kvkkApproval}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <Check size={24} />
                <span>Başvuruyu Gönder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipForm;
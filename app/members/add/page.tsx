"use client"
import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Upload, FileText, Shield, Check, Info
} from 'lucide-react';
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

  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    return file.size <= maxSizeMB * 1024 * 1024;
  };

  const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (field: 'idCopyFile' | 'photoFile', file: File | null): void => {
    if (file) {
      const newErrors: FormErrors = { ...errors };
      
      // File type validation
      if (field === 'idCopyFile') {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
        if (!validateFileType(file, allowedTypes)) {
          newErrors[field] = 'Sadece PDF veya JPEG dosyaları kabul edilir';
          setErrors(newErrors);
          return;
        }
      } else if (field === 'photoFile') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validateFileType(file, allowedTypes)) {
          newErrors[field] = 'Sadece JPEG veya PNG dosyaları kabul edilir';
          setErrors(newErrors);
          return;
        }
      }
      
      // File size validation (5MB max)
      if (!validateFileSize(file, 5)) {
        newErrors[field] = 'Dosya boyutu 5MB\'dan küçük olmalıdır';
        setErrors(newErrors);
        return;
      }
      
      // Clear error if validation passes
      if (newErrors[field]) {
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validations
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad ve soyad gereklidir';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Ad ve soyad en az 3 karakter olmalıdır';
    }

    if (!formData.tcNumber) {
      newErrors.tcNumber = 'T.C. kimlik numarası gereklidir';
    } else if (!validateTCNumber(formData.tcNumber)) {
      newErrors.tcNumber = 'Geçerli bir T.C. kimlik numarası giriniz';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Doğum tarihi gereklidir';
    } else if (!validateAge(formData.birthDate)) {
      newErrors.birthDate = 'Üye olmak için en az 18 yaşında olmalısınız';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Telefon numarası gereklidir';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz (+90 formatında)';
    }

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres bilgisi gereklidir';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Adres en az 10 karakter olmalıdır';
    }

    if (!formData.membershipType) {
      newErrors.membershipType = 'Üyelik türü seçiniz';
    }

    if (!formData.duesAmount) {
      newErrors.duesAmount = 'Aidat miktarı gereklidir';
    } else if (parseFloat(formData.duesAmount) <= 0) {
      newErrors.duesAmount = 'Aidat miktarı 0\'dan büyük olmalıdır';
    }

    if (!formData.duesFrequency) {
      newErrors.duesFrequency = 'Ödeme sıklığı seçiniz';
    }

    if (!formData.paymentStatus) {
      newErrors.paymentStatus = 'Ödeme durumu seçiniz';
    }

    if (!formData.idCopyFile) {
      newErrors.idCopyFile = 'Kimlik fotokopisi yüklemesi gereklidir';
    }

    if (!formData.photoFile) {
      newErrors.photoFile = 'Vesikalık fotoğraf yüklemesi gereklidir';
    }

    if (!formData.charterApproval) {
      newErrors.charterApproval = 'Dernek tüzüğünü kabul etmelisiniz';
    }

    if (!formData.kvkkApproval) {
      newErrors.kvkkApproval = 'KVKK onayı gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      console.log('Form başarıyla gönderildi:', formData);
      alert('Üyelik başvurunuz başarıyla alındı!');
      // Reset form
      setFormData({
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
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen py-16 px-6 lg:px-12 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-10">
          <div className="space-y-12">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
                <User className="mr-3 text-blue-600" size={28} />
                Kişisel Bilgiler
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Ad ve Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Adınız ve soyadınız"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-2">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    T.C. Kimlik Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tcNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tcNumber', e.target.value)}
                    maxLength={11}
                    className={`w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                      errors.tcNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345678901"
                  />
                  {errors.tcNumber && <p className="text-red-500 text-sm mt-2">{errors.tcNumber}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Doğum Tarihi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 text-gray-400" size={24} />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('birthDate', e.target.value)}
                      className={`w-full pl-14 pr-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                        errors.birthDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.birthDate && <p className="text-red-500 text-sm mt-2">{errors.birthDate}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Üyelik Türü <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.membershipType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('membershipType', e.target.value)}
                    className={`w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                      errors.membershipType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Üyelik türü seçiniz</option>
                    {membershipTypes.map((type: SelectOption) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.membershipType && <p className="text-red-500 text-sm mt-2">{errors.membershipType}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
                <Phone className="mr-3 text-blue-600" size={28} />
                İletişim Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-gray-400" size={24} />
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phoneNumber', e.target.value)}
                      className={`w-full pl-14 pr-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-gray-400" size={24} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-14 pr-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Adres <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-400" size={24} />
                    <textarea
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                      rows={4}
                      className={`w-full pl-14 pr-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base resize-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tam adresinizi yazınız (en azından şehir/ilçe bilgisi)"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Membership Details Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
                <CreditCard className="mr-3 text-blue-600" size={28} />
                Üyelik Detayları
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">Başvuru Tarihi</label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    readOnly
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-base"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Aidat Miktarı (TL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duesAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('duesAmount', e.target.value)}
                    className={`w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                      errors.duesAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.duesAmount && <p className="text-red-500 text-sm mt-2">{errors.duesAmount}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Ödeme Sıklığı <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duesFrequency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('duesFrequency', e.target.value)}
                    className={`w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                      errors.duesFrequency ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seçiniz</option>
                    {duesFrequencies.map((freq: SelectOption) => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                  {errors.duesFrequency && <p className="text-red-500 text-sm mt-2">{errors.duesFrequency}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Ödeme Durumu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('paymentStatus', e.target.value)}
                    className={`w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
                      errors.paymentStatus ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {paymentStatuses.map((status: SelectOption) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  {errors.paymentStatus && <p className="text-red-500 text-sm mt-2">{errors.paymentStatus}</p>}
                </div>
              </div>
            </div>
             {/* Membership Details Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
                <Info className="mr-3 text-blue-600" size={28} />
                Ekstra Bilgi
              </h2>
              <div className="lg:col-span-2">
                  <div>
                    <textarea
                      value={formData.address}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('address', e.target.value)}
                      rows={4}
                      className={`w-full pl-3 pr-5 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base resize-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ekstra bilgi varsa buraya yazabilirsiniz..."
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
                </div>
              
            </div>

            {/* File Upload Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
                <Upload className="mr-3 text-blue-600" size={28} />
                Belge Yüklemeleri
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Kimlik Fotokopisi <span className="text-red-500">*</span> <span className="text-gray-500">(PDF/JPEG, max 5MB)</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors ${
                    errors.idCopyFile ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <Upload className="mx-auto text-gray-400 mb-3" size={36} />
                    <input
                      type="file"
                      accept=".pdf,.jpeg,.jpg"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('idCopyFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="idCopy"
                    />
                    <label htmlFor="idCopy" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 text-base">Dosya seçiniz</span>
                      {formData.idCopyFile && (
                        <p className="text-sm text-gray-600 mt-3">{formData.idCopyFile.name}</p>
                      )}
                    </label>
                  </div>
                  {errors.idCopyFile && <p className="text-red-500 text-sm mt-2">{errors.idCopyFile}</p>}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Vesikalık Fotoğraf <span className="text-red-500">*</span> <span className="text-gray-500">(JPEG/PNG, max 5MB)</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-400 transition-colors ${
                    errors.photoFile ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <Upload className="mx-auto text-gray-400 mb-3" size={36} />
                    <input
                      type="file"
                      accept=".jpeg,.jpg,.png"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('photoFile', e.target.files?.[0] || null)}
                      className="hidden"
                      id="photo"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 text-base">Dosya seçiniz</span>
                      {formData.photoFile && (
                        <p className="text-sm text-gray-600 mt-3">{formData.photoFile.name}</p>
                      )}
                    </label>
                  </div>
                  {errors.photoFile && <p className="text-red-500 text-sm mt-2">{errors.photoFile}</p>}
                </div>
              </div>
            </div>

            {/* Approvals Section */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center">
                <Shield className="mr-3 text-blue-600" size={28} />
                Onaylar
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id="charterApproval"
                    checked={formData.charterApproval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('charterApproval', e.target.checked)}
                    className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="charterApproval" className="text-base font-medium text-gray-700">
                      Dernek Tüzüğü Onayı <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-2">
                      Dernek tüzüğünü okuduğumu ve kabul ettiğimi beyan ederim.
                    </p>
                    {errors.charterApproval && <p className="text-red-500 text-sm mt-2">{errors.charterApproval}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id="kvkkApproval"
                    checked={formData.kvkkApproval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('kvkkApproval', e.target.checked)}
                    className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="kvkkApproval" className="text-base font-medium text-gray-700">
                      KVKK Onayı <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-2">
                      Kişisel verilerimin KVKK kapsamında işlenmesine onay veriyorum.
                    </p>
                    {errors.kvkkApproval && <p className="text-red-500 text-sm mt-2">{errors.kvkkApproval}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-16 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-3"
              >
                <Check size={28} />
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipForm;
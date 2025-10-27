'use client';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone, Wifi, WifiOff, RefreshCw, Power, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface WhatsAppConnectionProps {
  onClose?: () => void;
}

const WhatsAppConnection: React.FC<WhatsAppConnectionProps> = ({ onClose }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'qr-received' | 'ready' | 'disconnected' | 'auth-failed'>('connecting');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionTime, setConnectionTime] = useState<string | null>(null);

  useEffect(() => {
    // Socket.IO bağlantısı
    const newSocket = io('http://localhost:8000', {
      transports: ['websocket'],
      cors: { origin: '*' }
    });

    setSocket(newSocket);

    // QR kod geldiğinde
    newSocket.on('whatsapp-qr', (data: { qr: string }) => {
      console.log('QR Kod alındı:', data.qr);
      setQrCode(data.qr);
      setStatus('qr-received');
    });

    // WhatsApp hazır olduğunda
    newSocket.on('whatsapp-ready', (data: { phoneNumber?: string; user?: { id: string } }) => {
      console.log('WhatsApp hazır:', data);
      setQrCode(null);
      setStatus('ready');
      
      // Telefon numarasını formatla
      if (data.phoneNumber) {
        setPhoneNumber(data.phoneNumber);
      } else if (data.user?.id) {
        setPhoneNumber(data.user.id.replace('@c.us', ''));
      }
      
      setConnectionTime(new Date().toLocaleString('tr-TR'));
    });

    // Bağlantı kesildiğinde
    newSocket.on('whatsapp-disconnected', (data: any) => {
      console.log('WhatsApp bağlantısı kesildi:', data);
      setStatus('disconnected');
      setPhoneNumber(null);
      setConnectionTime(null);
    });

    // Kimlik doğrulama hatası
    newSocket.on('whatsapp-auth-failure', (data: any) => {
      console.error('Kimlik doğrulama hatası:', data);
      setStatus('auth-failed');
      setPhoneNumber(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Manuel bağlantı kesme
  const handleDisconnect = () => {
    if (window.confirm('WhatsApp bağlantısını kesmek istediğinizden emin misiniz?')) {
      socket?.emit('whatsapp-logout');
      setStatus('disconnected');
      setPhoneNumber(null);
      setConnectionTime(null);
    }
  };

  // Yeniden bağlan
  const handleReconnect = () => {
    setStatus('connecting');
    setQrCode(null);
    socket?.emit('whatsapp-reconnect');
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`p-4 rounded-lg border-2 ${
        status === 'ready' ? 'bg-green-50 border-green-300' :
        status === 'connecting' || status === 'qr-received' ? 'bg-blue-50 border-blue-300' :
        status === 'disconnected' ? 'bg-orange-50 border-orange-300' :
        'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status === 'ready' && <CheckCircle className="text-green-600" size={24} />}
            {(status === 'connecting' || status === 'qr-received') && <Loader className="text-blue-600 animate-spin" size={24} />}
            {status === 'disconnected' && <WifiOff className="text-orange-600" size={24} />}
            {status === 'auth-failed' && <AlertCircle className="text-red-600" size={24} />}
            
            <div>
              <p className="font-semibold text-gray-800">
                {status === 'ready' && 'WhatsApp Bağlı ve Hazır'}
                {status === 'connecting' && 'WhatsApp\'a Bağlanıyor...'}
                {status === 'qr-received' && 'QR Kod Bekleniyor'}
                {status === 'disconnected' && 'Bağlantı Kesildi'}
                {status === 'auth-failed' && 'Kimlik Doğrulama Başarısız'}
              </p>
              {connectionTime && status === 'ready' && (
                <p className="text-sm text-gray-600">Bağlantı Zamanı: {connectionTime}</p>
              )}
            </div>
          </div>
          
          {status === 'ready' && (
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Power size={18} />
              <span>Bağlantıyı Kes</span>
            </button>
          )}
          
          {(status === 'disconnected' || status === 'auth-failed') && (
            <button
              onClick={handleReconnect}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Yeniden Bağlan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px] flex items-center justify-center">
        {/* Connecting State */}
        {status === 'connecting' && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-lg text-gray-700">WhatsApp sunucusuna bağlanıyor...</p>
            <p className="text-sm text-gray-500">Bu işlem birkaç saniye sürebilir</p>
          </div>
        )}

        {/* QR Code State */}
        {status === 'qr-received' && qrCode && (
          <div className="text-center space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg inline-block">
              <QRCodeCanvas value={qrCode} size={280} level="H" />
            </div>
            
            <div className="space-y-">
              <h3 className="text-xl font-semibold text-gray-800">
                Telefonunuzdan QR Kodu Tarayın
              </h3>
              <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
                <p className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600 mt-0.5">1.</span>
                  <span>WhatsApp&apos;ı telefonunuzda açın</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600 mt-0.5">2.</span>
                  <span>Ayarlar &gt; Bağlı Cihazlar &gt; Cihaz Bağla&apos;ya tıklayın</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600 mt-0.5">3.</span>
                  <span>Bu QR kodu telefonunuzla tarayın</span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Not:</strong> QR kod 60 saniye içinde yenilenir
              </p>
            </div>
          </div>
        )}

        {/* Ready State */}
        {status === 'ready' && (
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
              <Smartphone className="text-white" size={48} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">
                Bağlantı Başarılı!
              </h3>
              <p className="text-gray-600">
                WhatsApp hesabınız başarıyla bağlandı
              </p>
            </div>

            {/* Phone Number Display */}
            {phoneNumber && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Smartphone size={20} />
                  <span className="font-medium">Bağlı Telefon</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {phoneNumber}
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Artık bu hesap üzerinden WhatsApp mesajları gönderebilirsiniz
              </p>
            </div>
          </div>
        )}

        {/* Disconnected State */}
        {status === 'disconnected' && (
          <div className="text-center space-y-4">
            <WifiOff className="text-orange-600 mx-auto" size={64} />
            <h3 className="text-xl font-semibold text-gray-800">Bağlantı Kesildi</h3>
            <p className="text-gray-600">WhatsApp bağlantısı kesildi</p>
            <button
              onClick={handleReconnect}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <RefreshCw size={18} />
              <span>Yeniden Bağlan</span>
            </button>
          </div>
        )}

        {/* Auth Failed State */}
        {status === 'auth-failed' && (
          <div className="text-center space-y-4">
            <AlertCircle className="text-red-600 mx-auto" size={64} />
            <h3 className="text-xl font-semibold text-gray-800">Kimlik Doğrulama Hatası</h3>
            <p className="text-gray-600">WhatsApp kimlik doğrulama başarısız oldu</p>
            <p className="text-sm text-gray-500">Lütfen yeniden deneyin</p>
            <button
              onClick={handleReconnect}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <RefreshCw size={18} />
              <span>Tekrar Dene</span>
            </button>
          </div>
        )}
      </div>

   
    </div>
  );
};

export default WhatsAppConnection;

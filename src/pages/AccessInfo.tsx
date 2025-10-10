import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';
import AccessInfo from '@/components/AccessInfo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Notification from '@/components/Notification';

const AccessInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: affiliationData, loading: affiliationLoading, refetch: refetchAffiliation } = useAffiliation();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, status: 'success' | 'error'} | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refetchAffiliation();
      setNotification({ 
        message: 'Status keanggotaan telah diperbarui', 
        status: 'success' 
      });
    } catch (error) {
      setNotification({ 
        message: 'Gagal memperbarui status keanggotaan', 
        status: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getKoperasiName = () => {
    return affiliationData?.koperasi?.nama_koperasi || 'Koperasi';
  };

  const getApprovalStatus = () => {
    return affiliationData?.merchant?.approval_status || 'PENDING';
  };

  const getAffiliation = () => {
    return affiliationData?.merchant?.affiliation || 'UMUM';
  };

  if (affiliationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Memuat informasi keanggotaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification 
          message={notification.message} 
          status={notification.status} 
          onClose={() => setNotification(null)} 
        />
      )}

      <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
        <Button 
          variant="outline" 
          size="icon" 
          className="flex-shrink-0" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">Informasi Akses Koperasi</h1>
        <div className="ml-auto">
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline" 
            size="sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <AccessInfo
          affiliation={getAffiliation()}
          approvalStatus={getApprovalStatus()}
          koperasiName={getKoperasiName()}
          onRefresh={handleRefresh}
        />

        {/* Additional Information for Pending Members */}
        {getAffiliation() === 'KOPERASI_ANGGOTA' && getApprovalStatus() === 'PENDING' && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Tentang Proses Persetujuan</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Proses persetujuan biasanya memakan waktu 1-3 hari kerja</li>
                <li>• Koperasi induk akan memeriksa data dan dokumen yang Anda berikan</li>
                <li>• Anda akan mendapat notifikasi setelah status berubah</li>
                <li>• Jika ada pertanyaan, hubungi koperasi induk langsung</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Yang Dapat Anda Lakukan Saat Ini</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Mengakses dashboard merchant Anda</li>
                <li>• Melihat katalog publik koperasi</li>
                <li>• Melakukan pembelian dari katalog publik</li>
                <li>• Melihat riwayat transaksi Anda</li>
                <li>• Mengelola profil merchant</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="flex-1"
          >
            Kembali ke Dashboard
          </Button>
          
          {getAffiliation() === 'KOPERASI_ANGGOTA' && getApprovalStatus() === 'PENDING' && (
            <Button 
              onClick={() => navigate('/umum/katalog')} 
              variant="outline"
              className="flex-1"
            >
              Lihat Katalog Publik
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessInfoPage;

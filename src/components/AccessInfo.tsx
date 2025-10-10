import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, Users, Shield, Crown, Info, CheckCircle } from 'lucide-react';

interface AccessInfoProps {
  affiliation: string;
  approvalStatus: string;
  koperasiName?: string;
  onRefresh?: () => void;
}

const AccessInfo: React.FC<AccessInfoProps> = ({ 
  affiliation, 
  approvalStatus, 
  koperasiName,
  onRefresh 
}) => {
  const getStatusInfo = () => {
    if (affiliation === 'KOPERASI_INDUK') {
      return {
        icon: <Crown className="w-6 h-6 text-orange-500" />,
        title: "Akses Penuh Koperasi",
        description: "Sebagai Koperasi Induk, Anda memiliki akses penuh ke semua fitur koperasi.",
        status: "approved",
        color: "text-green-600"
      };
    }

    if (affiliation === 'UMUM') {
      return {
        icon: <Users className="w-6 h-6 text-blue-500" />,
        title: "Merchant Umum",
        description: "Anda dapat mengakses katalog publik koperasi dan fitur umum lainnya.",
        status: "approved",
        color: "text-green-600"
      };
    }

    if (affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'PENDING') {
      return {
        icon: <Clock className="w-6 h-6 text-yellow-500" />,
        title: "Menunggu Persetujuan",
        description: `Permintaan bergabung ke koperasi "${koperasiName || 'Koperasi'}" sedang menunggu persetujuan dari koperasi induk.`,
        status: "pending",
        color: "text-yellow-600"
      };
    }

    if (affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'APPROVED') {
      return {
        icon: <Shield className="w-6 h-6 text-green-500" />,
        title: "Anggota Koperasi",
        description: `Selamat! Anda telah disetujui sebagai anggota koperasi "${koperasiName || 'Koperasi'}".`,
        status: "approved",
        color: "text-green-600"
      };
    }

    if (affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'REJECTED') {
      return {
        icon: <Info className="w-6 h-6 text-red-500" />,
        title: "Permintaan Ditolak",
        description: `Permintaan bergabung ke koperasi "${koperasiName || 'Koperasi'}" telah ditolak.`,
        status: "rejected",
        color: "text-red-600"
      };
    }

    return {
      icon: <Info className="w-6 h-6 text-gray-500" />,
      title: "Status Tidak Diketahui",
      description: "Status keanggotaan Anda tidak dapat ditentukan.",
      status: "unknown",
      color: "text-gray-600"
    };
  };

  const statusInfo = getStatusInfo();

  const getAccessibleFeatures = () => {
    if (affiliation === 'KOPERASI_INDUK') {
      return [
        "Dashboard Koperasi Induk",
        "Manajemen Anggota",
        "Manajemen Katalog",
        "Manajemen Keuangan",
        "Simpan Pinjam",
        "Riwayat Transaksi",
        "Kasir Koperasi"
      ];
    }

    if (affiliation === 'UMUM') {
      return [
        "Dashboard Merchant",
        "Katalog Publik Koperasi",
        "Pembelian Produk",
        "Riwayat Transaksi"
      ];
    }

    if (affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'APPROVED') {
      return [
        "Dashboard Anggota",
        "Katalog Anggota Koperasi",
        "Simpan Pinjam",
        "Riwayat Transaksi"
      ];
    }

    if (affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'PENDING') {
      return [
        "Dashboard Merchant (Terbatas)",
        "Katalog Publik Koperasi",
        "Riwayat Transaksi"
      ];
    }

    return [];
  };

  const getRestrictedFeatures = () => {
    if (affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'PENDING') {
      return [
        "Katalog Anggota Koperasi",
        "Simpan Pinjam",
        "Fitur Khusus Anggota"
      ];
    }

    return [];
  };

  const accessibleFeatures = getAccessibleFeatures();
  const restrictedFeatures = getRestrictedFeatures();

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            {statusInfo.icon}
            <span className={statusInfo.color}>{statusInfo.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{statusInfo.description}</p>
          
          {affiliation === 'KOPERASI_ANGGOTA' && approvalStatus === 'PENDING' && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Informasi Penting:</strong> Anda dapat login dan menggunakan fitur dasar, 
                namun akses ke fitur khusus anggota koperasi akan tersedia setelah persetujuan.
              </AlertDescription>
            </Alert>
          )}

          {onRefresh && (
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              className="mb-4"
            >
              Periksa Status Terbaru
            </Button>
          )}
        </CardContent>
      </Card>

      {accessibleFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Fitur yang Dapat Diakses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {accessibleFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {restrictedFeatures.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Clock className="w-5 h-5" />
              Fitur yang Terbatas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {restrictedFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Fitur-fitur ini akan tersedia setelah persetujuan koperasi induk.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessInfo;

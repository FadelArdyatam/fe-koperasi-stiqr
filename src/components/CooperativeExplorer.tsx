import React, { useEffect, useState } from 'react';
import { AuthClaims } from '../types/auth';
import { getEffectiveTier, isKoperasiOwner } from '../utils/tier';

interface Koperasi {
  id: string;
  nama_koperasi: string;
  no_telp_koperasi: string;
  alamat_koperasi: string;
  email_koperasi: string;
  nama_penanggung_jawab: string;
  createdAt: string;
}

interface CooperativeExplorerProps {
  claims: AuthClaims | null;
  onSelectKoperasi: (koperasiId: string) => void;
}

export const CooperativeExplorer: React.FC<CooperativeExplorerProps> = ({ 
  claims, 
  onSelectKoperasi 
}) => {
  const [koperasiList, setKoperasiList] = useState<Koperasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKoperasiList();
  }, []);

  const fetchKoperasiList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/koperasi', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data koperasi');
      
      const data = await response.json();
      setKoperasiList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const getUserStatus = (koperasiId: string) => {
    if (!claims) return { status: 'umum', label: 'Umum' };
    
    if (isKoperasiOwner(claims, koperasiId)) {
      return { status: 'owner', label: 'Pemilik' };
    }
    
    const tier = getEffectiveTier(claims, koperasiId);
    switch (tier) {
      case 'MEMBER': return { status: 'member', label: 'Anggota' };
      case 'MEMBER_USAHA': return { status: 'usaha', label: 'Anggota Usaha' };
      default: return { status: 'umum', label: 'Umum' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchKoperasiList}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Koperasi Tersedia</h2>
        <p className="text-gray-600">{koperasiList.length} koperasi ditemukan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {koperasiList.map((koperasi) => {
          const userStatus = getUserStatus(koperasi.id);
          
          return (
            <div 
              key={koperasi.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectKoperasi(koperasi.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {koperasi.nama_koperasi}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userStatus.status === 'owner' ? 'bg-purple-100 text-purple-800' :
                  userStatus.status === 'usaha' ? 'bg-green-100 text-green-800' :
                  userStatus.status === 'member' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userStatus.label}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium">Penanggung Jawab:</span>
                  <span className="ml-2">{koperasi.nama_penanggung_jawab}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Alamat:</span>
                  <span className="ml-2 line-clamp-1">{koperasi.alamat_koperasi}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Telepon:</span>
                  <span className="ml-2">{koperasi.no_telp_koperasi}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Lihat Katalog
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {koperasiList.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Koperasi</h3>
          <p className="text-gray-500">Saat ini belum ada koperasi yang tersedia.</p>
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';

interface PendingMember {
  id: string;
  user_id: number;
  nama_member: string;
  jenis_member: 'MEMBER' | 'MEMBER_USAHA';
  status_member: 'PENDING';
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone_number: string;
  };
}

interface ValidateMembersProps {
  koperasiId: string;
}

export const ValidateMembers: React.FC<ValidateMembersProps> = ({ koperasiId }) => {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingMembers();
  }, [koperasiId]);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/koperasi/owner/${koperasiId}/members`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Gagal mengambil data anggota');

      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: string, decision: 'ACTIVE' | 'REJECTED') => {
    try {
      setProcessing(memberId);
      
      if (!koperasiId) {
        throw new Error('Koperasi ID tidak tersedia');
      }
      
      const verb = decision === 'ACTIVE' ? 'approve-merchant' : 'reject-merchant';
      const response = await fetch(`/api/koperasi/${koperasiId}/${verb}/${memberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memproses pengajuan');
      }

      // Remove from list after successful approval/rejection
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      alert(`Pengajuan ${decision === 'ACTIVE' ? 'disetujui' : 'ditolak'} berhasil!`);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          onClick={fetchPendingMembers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Validasi Anggota</h2>
        <div className="text-sm text-gray-600">
          {members.length} pengajuan menunggu validasi
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Pengajuan</h3>
          <p className="text-gray-500">Semua pengajuan keanggotaan sudah diproses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {member.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {member.user.username}
                      </h3>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Telepon:</span>
                      <span className="ml-2 text-gray-600">{member.user.phone_number}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Jenis Keanggotaan:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        member.jenis_member === 'MEMBER_USAHA' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.jenis_member === 'MEMBER_USAHA' ? 'Anggota Usaha' : 'Anggota Biasa'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                      <span className="ml-2 text-gray-600">{formatDate(member.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ID Pengajuan:</span>
                      <span className="ml-2 text-gray-600 font-mono text-xs">{member.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 ml-6">
                  <button
                    onClick={() => handleApprove(member.id, 'REJECTED')}
                    disabled={processing === member.id}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === member.id ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button
                    onClick={() => handleApprove(member.id, 'ACTIVE')}
                    disabled={processing === member.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === member.id ? 'Memproses...' : 'Setujui'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-800 mb-2">Informasi Validasi</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Anggota yang disetujui akan mendapat akses sesuai jenis keanggotaan</li>
          <li>• Anggota Usaha mendapat harga terbaik + akses fitur kasir/settlement</li>
          <li>• Anggota Biasa mendapat harga khusus anggota</li>
          <li>• Pengajuan yang ditolak tidak dapat diajukan ulang</li>
        </ul>
      </div>
    </div>
  );
};

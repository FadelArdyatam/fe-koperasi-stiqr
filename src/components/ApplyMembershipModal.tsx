import React, { useState } from 'react';

interface ApplyMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  koperasiId: string;
  koperasiName: string;
  onSuccess: () => void;
}

export const ApplyMembershipModal: React.FC<ApplyMembershipModalProps> = ({
  isOpen,
  onClose,
  koperasiId,
  koperasiName,
  onSuccess
}) => {
  const [membershipType, setMembershipType] = useState<'MEMBER' | 'MEMBER_USAHA'>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/koperasi/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          id_koperasi: koperasiId,
          jenis_member: membershipType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengajukan keanggotaan');
      }

      onSuccess();
      onClose();
      
      // Show success message
      alert('Pengajuan keanggotaan berhasil dikirim! Menunggu persetujuan dari pemilik koperasi.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Ajukan Keanggotaan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Anda akan mengajukan keanggotaan ke:
            </p>
            <p className="font-semibold text-gray-800">{koperasiName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Keanggotaan
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="MEMBER"
                    checked={membershipType === 'MEMBER'}
                    onChange={(e) => setMembershipType(e.target.value as 'MEMBER')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Anggota Biasa</div>
                    <div className="text-sm text-gray-600">
                      Akses harga khusus anggota dengan margin lebih rendah
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="MEMBER_USAHA"
                    checked={membershipType === 'MEMBER_USAHA'}
                    onChange={(e) => setMembershipType(e.target.value as 'MEMBER_USAHA')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">Anggota Usaha</div>
                    <div className="text-sm text-gray-600">
                      Harga terbaik + akses fitur usaha (kasir, settlement, dll)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Mengajukan...' : 'Ajukan'}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Pengajuan Anda akan ditinjau oleh pemilik koperasi. 
              Anda akan mendapat notifikasi setelah status pengajuan berubah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';

interface MarginRule {
  id: string;
  tier: 'UMUM' | 'MEMBER' | 'MEMBER_USAHA';
  type: 'FLAT' | 'PERCENT';
  value: number;
  isActive: boolean;
  effectiveFrom: string;
  createdAt: string;
}

interface MarginRulesProps {
  koperasiId: string;
}

export const MarginRules: React.FC<MarginRulesProps> = ({ koperasiId }) => {
  const [rules, setRules] = useState<MarginRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [validationError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarginRules();
  }, [koperasiId]);

  const fetchMarginRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/koperasi/margin/${koperasiId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Gagal mengambil aturan margin');

      const data = await response.json();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // const validateHierarchy = (newRules: MarginRule[]) => {
  //   const tierValues = {
  //     UMUM: 0,
  //     MEMBER: 0,
  //     MEMBER_USAHA: 0
  //   };

  //   // Calculate effective values for each tier
  //   newRules.forEach(rule => {
  //     if (rule.isActive) {
  //       const value = rule.type === 'FLAT' ? rule.value : 100 * rule.value / 100;
  //       tierValues[rule.tier] = value;
  //     }
  //   });

  //   // Check hierarchy: UMUM >= MEMBER >= MEMBER_USAHA
  //   if (tierValues.UMUM < tierValues.MEMBER || tierValues.MEMBER < tierValues.MEMBER_USAHA) {
  //     setValidationError('Hierarki margin tidak valid: UMUM ≥ MEMBER ≥ MEMBER_USAHA');
  //     return false;
  //   }

  //   setValidationError(null);
  //   return true;
  // };

  const handleAddRule = async (newRule: Omit<MarginRule, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/koperasi/margin/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          id_koperasi: koperasiId,
          tier: newRule.tier,
          type: newRule.type,
          value: newRule.value,
          effectiveFrom: newRule.effectiveFrom
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambah aturan margin');
      }

      await fetchMarginRules();
      setShowAddModal(false);
      alert('Aturan margin berhasil ditambahkan!');
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'UMUM': return 'Harga Umum';
      case 'MEMBER': return 'Harga Anggota';
      case 'MEMBER_USAHA': return 'Harga Usaha';
      default: return tier;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'UMUM': return 'bg-gray-100 text-gray-800';
      case 'MEMBER': return 'bg-blue-100 text-blue-800';
      case 'MEMBER_USAHA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (rule: MarginRule) => {
    if (rule.type === 'FLAT') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(rule.value);
    } else {
      return `${rule.value}%`;
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
          onClick={fetchMarginRules}
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
        <h2 className="text-2xl font-bold text-gray-800">Aturan Margin</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Tambah Aturan
        </button>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hierarki Margin Tidak Valid</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{validationError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Aturan Margin Aktif</h3>
          <p className="text-sm text-gray-600">Aturan margin yang sedang berlaku untuk koperasi</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Berlaku Sejak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(rule.tier)}`}>
                      {getTierLabel(rule.tier)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rule.type === 'FLAT' ? 'Nominal' : 'Persentase'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatValue(rule)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rule.effectiveFrom).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rule.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-800 mb-2">Informasi Aturan Margin</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>UMUM:</strong> Harga untuk pengguna yang belum menjadi anggota</li>
          <li>• <strong>MEMBER:</strong> Harga untuk anggota biasa (lebih murah dari umum)</li>
          <li>• <strong>MEMBER_USAHA:</strong> Harga untuk anggota usaha (paling murah)</li>
          <li>• <strong>Hierarki:</strong> UMUM ≥ MEMBER ≥ MEMBER_USAHA (harga umum harus paling mahal)</li>
          <li>• <strong>FLAT:</strong> Margin dalam nominal rupiah</li>
          <li>• <strong>PERCENT:</strong> Margin dalam persentase dari harga dasar</li>
        </ul>
      </div>

      {showAddModal && (
        <AddMarginRuleModal
          koperasiId={koperasiId}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRule}
          existingRules={rules}
        />
      )}
    </div>
  );
};

// Modal untuk menambah aturan margin
interface AddMarginRuleModalProps {
  koperasiId: string;
  onClose: () => void;
  onAdd: (rule: Omit<MarginRule, 'id' | 'createdAt'>) => void;
  existingRules: MarginRule[];
}

const AddMarginRuleModal: React.FC<AddMarginRuleModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    tier: 'UMUM' as 'UMUM' | 'MEMBER' | 'MEMBER_USAHA',
    type: 'PERCENT' as 'FLAT' | 'PERCENT',
    value: 0,
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      isActive: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tambah Aturan Margin</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier Harga
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({...formData, tier: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="UMUM">Harga Umum</option>
                <option value="MEMBER">Harga Anggota</option>
                <option value="MEMBER_USAHA">Harga Usaha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Margin
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="PERCENT">Persentase (%)</option>
                <option value="FLAT">Nominal (Rp)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai Margin
              </label>
              <input
                type="number"
                min="0"
                step={formData.type === 'PERCENT' ? '0.1' : '1'}
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formData.type === 'PERCENT' ? '10' : '5000'}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === 'PERCENT' 
                  ? 'Persentase dari harga dasar (contoh: 10 = 10%)'
                  : 'Nominal dalam rupiah (contoh: 5000 = Rp 5.000)'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Berlaku Sejak
              </label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({...formData, effectiveFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tambah Aturan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

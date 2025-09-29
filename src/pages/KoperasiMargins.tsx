import React, { useEffect, useState } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';

type Tier = 'NON_MEMBER' | 'MEMBER' | 'MEMBER_USAHA';
type RuleType = 'FLAT' | 'PERCENT';

interface MarginRule {
  id: string;
  koperasi_id: string;
  tier: Tier;
  type: RuleType;
  value: number;
  is_active: boolean;
  created_at?: string;
}

const KoperasiMargins: React.FC = () => {
  const [koperasiId, setKoperasiId] = useState<string>('');
  const [rules, setRules] = useState<MarginRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState<{ tier: Tier; type: RuleType; value: number }>({
    tier: 'NON_MEMBER',
    type: 'PERCENT',
    value: 0,
  });

  useEffect(() => {
    fetchAffiliation();
  }, []);

  const fetchAffiliation = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/koperasi/affiliation/me');
      const id = res.data?.koperasi?.id;
      if (id) {
        setKoperasiId(id);
        await fetchRules(id);
      } else {
        setErrorMessage('Anda bukan induk koperasi');
        setShowNotification(true);
      }
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || 'Gagal mengambil data');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/koperasi/margin/${id}`);
      setRules(res.data || []);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || 'Gagal mengambil aturan margin');
      setShowNotification(true);
    }
  };

  const submitRule = async () => {
    if (!koperasiId) return;
    setLoading(true);
    try {
      await axiosInstance.post('/koperasi/margin/set', {
        koperasi_id: koperasiId,
        tier: form.tier,
        type: form.type,
        value: Number(form.value),
      });
      setSuccessMessage('Aturan margin disimpan');
      setShowNotification(true);
      await fetchRules(koperasiId);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || 'Gagal menyimpan aturan margin');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Aturan Margin Koperasi</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Tambah / Update Aturan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            className="border rounded p-2"
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value as Tier })}
          >
            <option value="NON_MEMBER">NON_MEMBER</option>
            <option value="MEMBER">MEMBER</option>
            <option value="MEMBER_USAHA">MEMBER_USAHA</option>
          </select>
          <select
            className="border rounded p-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as RuleType })}
          >
            <option value="PERCENT">PERCENT</option>
            <option value="FLAT">FLAT</option>
          </select>
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Nilai"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          />
          <button onClick={submitRule} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white rounded p-2">
            Simpan
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">PERCENT = persen dari harga dasar; FLAT = nominal rupiah ditambahkan.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">Daftar Aturan Aktif</h2>
        {rules.length === 0 ? (
          <div className="text-gray-500">Belum ada aturan margin.</div>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold">{r.tier}</div>
                  <div className="text-gray-600">{r.type} • {r.value}</div>
                </div>
                <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-1">AKTIF</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNotification && (
        <Notification
          message={errorMessage || successMessage}
          onClose={() => setShowNotification(false)}
          status={errorMessage ? 'error' : 'success'}
        />
      )}
    </div>
  );
};

export default KoperasiMargins;


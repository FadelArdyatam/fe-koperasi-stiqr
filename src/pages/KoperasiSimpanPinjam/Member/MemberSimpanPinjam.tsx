import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../hooks/axiosInstance';
import { useAffiliation } from '../../../hooks/useAffiliation';
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  History, 
  Plus, 
  Minus,
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { PaymentModal } from './components/PaymentModal';

interface Balance {
  saldo_pokok: number;
  saldo_wajib: number;
  saldo_sukarela: number;
}

interface Transaction {
  id: string;
  saving_type: 'POKOK' | 'WAJIB' | 'SUKARELA';
  direction: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  method: 'QRIS_NOBU' | 'SALDO_NON_CASH' | 'CASH';
  status: 'PENDING' | 'PAID' | 'FAILED';
  transaction_id: string;
  created_at: string;
  paid_at?: string;
  notes?: string;
  payment_result?: {
    qrCode?: string;
    expiry_time?: string;
    payment_status?: 'PENDING' | 'PAID' | 'FAILED';
    message?: string;
  };
}

const MemberSimpanPinjam: React.FC = () => {
  const { koperasiId } = useParams<{ koperasiId: string }>();
  const navigate = useNavigate();
  const { data: affiliation } = useAffiliation();
  
  const [balance, setBalance] = useState<Balance>({
    saldo_pokok: 0,
    saldo_wajib: 0,
    saldo_sukarela: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'saldo' | 'transaksi' | 'simpan' | 'tarik'>('saldo');
  
  // Form states
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'POKOK' | 'WAJIB' | 'SUKARELA'>('WAJIB');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (koperasiId) {
      fetchData();
    }
  }, [koperasiId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get member ID
      const memberRes = await axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/my-member-id`);
      const memberId = memberRes.data.member_id;
      
      if (!memberId) {
        setError('Anda belum terdaftar sebagai anggota koperasi ini');
        return;
      }
      
      // Fetch balance and transactions
      const [balanceRes, historyRes] = await Promise.all([
        axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/balance/${memberId}`),
        axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/history/${memberId}?page=1&limit=10`)
      ]);
      
      setBalance(balanceRes.data.data || balanceRes.data);
      setTransactions(historyRes.data.data || historyRes.data);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !type) {
      setError('Harap isi semua field yang diperlukan');
      return;
    }

    if (parseFloat(amount) < 1000) {
      setError('Minimum simpanan adalah Rp 1.000');
      return;
    }

    if (parseFloat(amount) > 100000000) {
      setError('Maksimum simpanan adalah Rp 100.000.000');
      return;
    }

    // Show payment modal
    setShowPaymentModal(true);
  };

  const [activeTransaction, setActiveTransaction] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const checkTransactionStatus = async (txId: string) => {
    try {
      const response = await axiosInstance.get(
        `/koperasi-simpan-pinjam/${koperasiId}/transaction/${txId}/status`
      );
      
      if (response.data.status === 'PAID') {
        if (pollingInterval) clearInterval(pollingInterval);
        setActiveTransaction(null);
        handlePaymentSuccess();
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  const startPolling = (txId: string) => {
    setActiveTransaction(txId);
    const interval = setInterval(() => checkTransactionStatus(txId), 3000);
    setPollingInterval(interval);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPollingInterval(null);
      setActiveTransaction(null);
    }, 300000);
  };

  const handlePaymentSuccess = () => {
    // Reset form and refresh data
    setAmount('');
    setNotes('');
    setShowPaymentModal(false);
    setSubmitting(false);
    fetchData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Simpan Pinjam</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'saldo' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('saldo')}
        >
          Saldo
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'transaksi' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('transaksi')}
        >
          Riwayat Transaksi
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'simpan' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('simpan')}
        >
          Simpan
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          {activeTab === 'saldo' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Simpanan Pokok</h3>
                <p className="text-2xl font-bold">Rp {balance.saldo_pokok.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Simpanan Wajib</h3>
                <p className="text-2xl font-bold">Rp {balance.saldo_wajib.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Simpanan Sukarela</h3>
                <p className="text-2xl font-bold">Rp {balance.saldo_sukarela.toLocaleString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'transaksi' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.saving_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={transaction.direction === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.direction === 'DEPOSIT' ? '+' : '-'} Rp {transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'PAID' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'simpan' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jenis Simpanan
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'POKOK' | 'WAJIB' | 'SUKARELA')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="POKOK">Simpanan Pokok</option>
                    <option value="WAJIB">Simpanan Wajib</option>
                    <option value="SUKARELA">Simpanan Sukarela</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    placeholder="Masukkan jumlah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    rows={3}
                    placeholder="Tambahkan catatan"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {submitting ? 'Memproses...' : 'Simpan'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={parseFloat(amount)}
        savingType={type}
        koperasiId={koperasiId || ''}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default MemberSimpanPinjam;

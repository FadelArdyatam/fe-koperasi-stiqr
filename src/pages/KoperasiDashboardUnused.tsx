import React, { useState, useEffect } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import Loading from '@/components/Loading';
import { Link, useNavigate  } from 'react-router-dom';
import {
  Home,
  ScanQrCode,
  CreditCard,
  FileText,
  UserRound,
  Users,
  Percent,
  ShoppingBag,
} from 'lucide-react';

interface PendingMerchant {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  approval_status: string;
  user: {
    username: string;
    email: string;
    phone_number: string;
  };
}

const KoperasiDashboardUnused: React.FC = () => {
  const [pendingMerchants, setPendingMerchants] = useState<PendingMerchant[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [koperasiId, setKoperasiId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAffiliation();
  }, []);

  const fetchAffiliation = async () => {
    setLoadingPage(true);
    try {
      const response = await axiosInstance.get('/koperasi/affiliation/me');
      if (response.data?.koperasi?.id) {
        setKoperasiId(response.data.koperasi.id);
        fetchPendingApprovals(response.data.koperasi.id);
      } else {
        setErrorMessage('Anda bukan induk koperasi');
        setShowNotification(true);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to fetch affiliation');
      setShowNotification(true);
    } finally {
      setLoadingPage(false);
    }
  };

  const fetchPendingApprovals = async (koperasiId: string) => {
    setLoadingPage(true);
    try {
      const response = await axiosInstance.get(`/koperasi/${koperasiId}/pending-approvals`);
      setPendingMerchants(response.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to fetch pending approvals');
      setShowNotification(true);
    } finally {
      setLoadingPage(false);
    }
  };

  const approveMerchant = async (merchantId: string) => {
    setLoadingAction(true);
    try {
      if (!koperasiId) throw new Error('Koperasi ID tidak tersedia');
      await axiosInstance.post(`/koperasi/${koperasiId}/approve-merchant/${merchantId}`);
      setSuccessMessage('Merchant berhasil disetujui');
      setShowNotification(true);
      if (koperasiId) fetchPendingApprovals(koperasiId);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to approve merchant');
      setShowNotification(true);
    } finally {
      setLoadingAction(false);
    }
  };

  const rejectMerchant = async (merchantId: string) => {
    setLoadingAction(true);
    try {
      if (!koperasiId) throw new Error('Koperasi ID tidak tersedia');
      await axiosInstance.post(`/koperasi/${koperasiId}/reject-merchant/${merchantId}`);
      setSuccessMessage('Merchant berhasil ditolak');
      setShowNotification(true);
      if (koperasiId) fetchPendingApprovals(koperasiId);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to reject merchant');
      setShowNotification(true);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-6 mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard Koperasi Induk</h1>
        <div className="text-sm text-gray-500">ID: {koperasiId || '-'}</div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => navigate('/koperasi-members')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
        >
          <Users className="text-orange-500" />
          <span>Anggota</span>
        </button>
        <button
          onClick={() => navigate('/koperasi-loans/products')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
        >
          <ShoppingBag className="text-orange-500" />
          <span>Produk Pinjaman</span>
        </button>
        <button
          onClick={() => navigate('/koperasi-loans/applications')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
        >
          <FileText className="text-orange-500" />
          <span>Pengajuan</span>
        </button>
        <button
          onClick={() => navigate(`/koperasi-margins`)}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
        >
          <Percent className="text-orange-500" />
          <span>Margin Rules</span>
        </button>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Menunggu Persetujuan</h2>
          <span className="text-sm text-gray-500">
            {pendingMerchants.length} merchant
          </span>
        </div>

        {loadingPage && <Loading />}

        {!loadingPage && pendingMerchants.length === 0 && (
          <div className="text-gray-500 text-sm">
            Tidak ada merchant yang menunggu persetujuan.
          </div>
        )}

        {!loadingPage && pendingMerchants.length > 0 && (
          <div className="space-y-3">
            {pendingMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="border rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <h3 className="font-semibold text-lg">{merchant.name}</h3>
                  <div className="text-gray-600 text-sm">
                    {merchant.email} • {merchant.phone_number}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Username: {merchant.user.username}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${merchant.approval_status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {merchant.approval_status}
                  </span>
                  <button
                    onClick={() => approveMerchant(merchant.id)}
                    disabled={loadingAction}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => rejectMerchant(merchant.id)}
                    disabled={loadingAction}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
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


            {/* Bottom Navbar */}
            <div id="navbar" className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>
                <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>
                {/* {affiliation?.affiliation === 'KOPERASI_INDUK' && (
                    <Link to={'/koperasi-dashboard'} className="flex gap-3 flex-col items-center">
                        <Building2 />
                        <p className="uppercase">Koperasi</p>
                    </Link>
                )} */}
                <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>

    </div>
  );
};

export default KoperasiDashboardUnused;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { Link } from 'react-router-dom';
import { Home, ScanQrCode, CreditCard, FileText, UserRound, Building2 } from 'lucide-react';

const KoperasiMemberDetail: React.FC = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/koperasi/member/${id}`);
      setDetail(res.data);
    } catch (e) {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!detail) return <div>Data tidak ditemukan</div>;

  return (
    <div className="pb-20">
      <h2 className="text-2xl font-bold mb-4">Detail Merchant Koperasi</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">Info Merchant</h3>
          <p>Nama: {detail.name}</p>
          <p>Email: {detail.email}</p>
          <p>HP: {detail.phone_number}</p>
          <p>Status: {detail.approval_status}</p>
          <p>Koperasi: {detail.koperasi?.nama_koperasi}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-2">Data Pemilik</h3>
          <p>Username: {detail.user?.username}</p>
          <p>Email: {detail.user?.email}</p>
          <p>HP: {detail.user?.phone_number}</p>
        </div>
      </div>
      <div className="p-4 bg-white rounded shadow mt-4">
        <h3 className="font-semibold mb-2">Pengajuan QRIS</h3>
        {detail.Qris_Submission ? (
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(detail.Qris_Submission, null, 2)}</pre>
        ) : (
          <p>Tidak ada data</p>
        )}
      </div>

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
        {/* <Link to={'/koperasi-dashboard'} className="flex gap-3 flex-col items-center">
          <Building2 />
          <p className="uppercase">Koperasi</p>
        </Link> */}
        <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
          <UserRound />
          <p className="uppercase">Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default KoperasiMemberDetail;
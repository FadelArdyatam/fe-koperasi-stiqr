import React, { useEffect, useState } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import { useAffiliation } from '@/hooks/useAffiliation';
import { Link } from 'react-router-dom';
import { Home, ScanQrCode, CreditCard, FileText, UserRound, Building2 } from 'lucide-react';

const KoperasiMembers: React.FC = () => {
  const { data } = useAffiliation();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');

  const fetchMembers = async () => {
    if (!data?.koperasi?.id) return;
    setLoading(true);
    try {
      const params: any = {};
      if (q) params.q = q;
      if (status) params.status = status;
      const res = await axiosInstance.get(`/koperasi/${data.koperasi.id}/members`, { params });
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.koperasi?.id]);

  return (
    <div className="pb-20">
      <h2 className="text-2xl font-bold mb-4">Anggota Koperasi</h2>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/email/HP" className="border rounded p-2" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
          <option value="">Semua Status</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <button onClick={fetchMembers} className="px-4 py-2 bg-blue-600 text-white rounded">Filter</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Nama</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">HP</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Bergabung</th>
                <th className="text-left p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">{m.email}</td>
                  <td className="p-2">{m.phone_number}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${m.approval_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : m.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{m.approval_status}</span>
                  </td>
                  <td className="p-2">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-2">
                    <a className="text-blue-600 hover:underline" href={`/koperasi-members/${m.id}`}>Detail</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <Link to={'/koperasi-dashboard'} className="flex gap-3 flex-col items-center">
          <Building2 />
          <p className="uppercase">Koperasi</p>
        </Link>
        <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
          <UserRound />
          <p className="uppercase">Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default KoperasiMembers;
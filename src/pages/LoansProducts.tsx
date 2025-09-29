import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ScanQrCode, CreditCard, FileText, UserRound, Building2 } from 'lucide-react';

const LoansProducts: React.FC = () => {
  return (
    <div className="pb-20">
      <h2 className="text-2xl font-bold mb-4">Produk Pinjaman</h2>
      <p>Placeholder: CRUD produk pinjaman akan ditempatkan di sini.</p>
      
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

export default LoansProducts;
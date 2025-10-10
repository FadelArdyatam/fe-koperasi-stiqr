import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import { Home, ScanQrCode, CreditCard, FileText, UserRound } from 'lucide-react';

const Layout = () => {
    const { data: affiliation } = useAffiliation();
    const { pathname } = useLocation();

    // Define dynamic paths based on affiliation
    const isIndukKoperasi = affiliation?.affiliation === 'KOPERASI_INDUK';
    const katalogPath = isIndukKoperasi ? '/induk/manajemen-katalog' : '/catalog';

    return (
        <>
            {/* This Outlet will render the actual page component (e.g., Dashboard, Profile) */}
            <Outlet />

            {/* Shared Bottom Navbar */}
            <div id="navbar" className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-50 safe-area-pb">
                <Link to={'/dashboard'} className={`flex gap-3 flex-col items-center ${pathname === '/dashboard' ? 'text-orange-400' : ''}`}>
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to={'/qr-code'} className={`flex gap-3 flex-col items-center ${pathname === '/qr-code' ? 'text-orange-400' : ''}`}>
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>
                <Link to={katalogPath} className={`flex gap-3 flex-col items-center ${pathname === katalogPath ? 'text-orange-400' : ''}`}>
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>
                <Link to={'/profile'} className={`flex gap-3 flex-col items-center ${pathname === '/profile' ? 'text-orange-400' : ''}`} data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </>
    );
};

export default Layout;

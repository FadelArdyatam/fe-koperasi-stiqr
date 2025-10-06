import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2,  Landmark, Home, ScanQrCode, CreditCard, FileText, UserRound, CirclePercent } from 'lucide-react';

const DashboardAnggota: React.FC = () => {
    const navigate = useNavigate();
    const { data: affiliation, loading: affiliationLoading } = useAffiliation();

    const menuItems = [
        { label: 'Kasir', icon: <CirclePercent className="w-8 h-8 text-orange-500" />, path: '/anggota/kasir' },
        { label: 'Simpanan', icon: <Landmark className="w-8 h-8 text-orange-500" />, path: '/anggota/simpanan' },
    ];

    const Header = () => (
        <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
            <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold truncate">Dashboard Anggota</h1>
        </header>
    );

    if (affiliationLoading) {
        return (
            <div className="pb-28 bg-gray-50 min-h-screen">
                <Header />
                <div className="p-4 space-y-4 animate-pulse">
                    <div className="h-24 w-full bg-gray-200 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 w-full bg-gray-200 rounded-lg"></div>
                        <div className="h-32 w-full bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28 bg-gray-50 min-h-screen font-sans">
            <Header />

            <div className="p-4 space-y-6">
                {/* Affiliation Info Card */}
                <Card className="bg-green-100 border-green-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <Building2 className="w-6 h-6 text-green-800 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-green-800">Anda terdaftar sebagai anggota di:</p>
                                <p className="font-bold text-lg text-green-900">{affiliation?.koperasi?.nama_koperasi || 'Nama Koperasi'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <Card
                            key={item.label}
                            className="text-center hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer group"
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                                <div className="bg-orange-100 p-4 rounded-full group-hover:bg-orange-200 transition-colors">
                                    {item.icon}
                                </div>
                                <p className="text-base font-semibold text-center text-slate-700 group-hover:text-orange-600">{item.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
                <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </div>
    );
};

export default DashboardAnggota;
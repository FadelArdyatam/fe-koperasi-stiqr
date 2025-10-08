import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2, Store, Landmark, Home, ScanQrCode, CreditCard, FileText, UserRound } from 'lucide-react';

const DashboardAnggota: React.FC = () => {
    const navigate = useNavigate();
    const { data: affiliation, loading: affiliationLoading, koperasiId } = useAffiliation();
    const [memberId, setMemberId] = useState<string | null>(null);

    useEffect(() => {
        if (koperasiId) {
            axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/my-member-id`)
                .then(res => {
                    setMemberId(res.data.member_id);
                })
                .catch(err => {
                    console.error("Failed to fetch member ID:", err);
                });
        }
    }, [koperasiId]);

    const menuItems = [
        { label: 'Katalog', icon: <Store className="w-8 h-8 text-orange-500" />, path: '/anggota/katalog' },
        { label: 'Simpanan', icon: <Landmark className="w-8 h-8 text-orange-500" />, path: '/anggota/simpanan' },
    ];

    const Header = () => (
        <header className="sticky top-0 z-20 flex items-center gap-4 p-4 mb-4 bg-white border-b">
            <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold truncate">Dashboard Anggota</h1>
            {memberId && (
                <span className="ml-auto text-xs sm:text-sm font-mono text-slate-500 bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                    ID: {memberId}
                </span>
            )}
        </header>
    );

    if (affiliationLoading) {
        return (
            <div className="min-h-screen pb-28 bg-gray-50">
                <Header />
                <div className="p-4 space-y-4 animate-pulse">
                    <div className="w-full h-24 bg-gray-200 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="w-full h-32 bg-gray-200 rounded-lg"></div>
                        <div className="w-full h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans pb-28 bg-gray-50">
            <Header />

            <div className="p-4 space-y-6">
                {/* Affiliation Info Card */}
                <Card className="bg-green-100 border-green-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <Building2 className="flex-shrink-0 w-6 h-6 text-green-800" />
                            <div>
                                <p className="text-sm text-green-800">Anda terdaftar sebagai anggota di:</p>
                                <p className="text-lg font-bold text-green-900">{affiliation?.koperasi?.nama_koperasi || 'Nama Koperasi'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <Card
                            key={item.label}
                            className="text-center transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-orange-300 group"
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
                                <div className="p-4 transition-colors bg-orange-100 rounded-full group-hover:bg-orange-200">
                                    {item.icon}
                                </div>
                                <p className="text-base font-semibold text-center text-slate-700 group-hover:text-orange-600">{item.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Bottom Navbar */}
            <div id="navbar" className="fixed bottom-0 z-10 flex items-end justify-between w-full gap-5 px-3 py-2 text-xs bg-white border">
                <Link to={'/dashboard'} className="flex flex-col items-center gap-3 text-orange-400">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to={'/qr-code'} className="flex flex-col items-center gap-3">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="relative flex flex-col items-center gap-3">
                    <div className="absolute flex items-center justify-center w-16 h-16 text-white bg-orange-400 rounded-full shadow-md -top-20">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>
                <Link to={'/catalog'} className="flex flex-col items-center gap-3">
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>
                <Link to={'/profile'} className="flex flex-col items-center gap-3" data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </div>
    );
};

export default DashboardAnggota;

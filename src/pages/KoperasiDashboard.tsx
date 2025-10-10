import React, { useState, useEffect } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';

import {
    Users,
    Percent,
    ShoppingBag,
    FileText,
    ArrowLeft,
    Store,
    Home,
    ScanQrCode,
    CreditCard,
    UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PendingMerchantKoperasi {
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

const KoperasiDashboard: React.FC = () => {
    const { data: affiliationData } = useAffiliation();
    const [pendingMerchants, setPendingMerchants] = useState<PendingMerchantKoperasi[]>([]);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const koperasiId = affiliationData?.koperasi?.id;

    useEffect(() => {
        const fetchPendingApprovals = async (id: string) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const response = await axiosInstance.get(`/koperasi/${id}/pending-approvals`);
                setPendingMerchants(response.data || []);
            } catch (error) {
                setErrorMessage('Gagal memuat data merchant.');
                setShowNotification(true);
            } finally {
                setLoadingPage(false);
            }
        };

        if (koperasiId) {
            fetchPendingApprovals(koperasiId);
        } else if (affiliationData) {
            setLoadingPage(false);
        }
    }, [koperasiId, affiliationData]);

    const handleAction = async (action: 'approve' | 'reject', merchantId: string) => {
        if (!koperasiId) {
            setErrorMessage('Koperasi ID tidak tersedia.');
            setShowNotification(true);
            return;
        }
        setLoadingAction(true);
        try {
            const verb = action === 'approve' ? 'approve-merchant' : 'reject-merchant';
            await axiosInstance.post(`/koperasi/${koperasiId}/${verb}/${merchantId}`);
            setSuccessMessage(`Merchant berhasil di ${action === 'approve' ? 'setujui' : 'tolak'}!`);
            setShowNotification(true);
            setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || `Gagal untuk ${action} merchant.`);
            setShowNotification(true);
        } finally {
            setLoadingAction(false);
        }
    };

    const menuItems = [
        { label: 'Anggota', icon: <Users className="w-6 h-6 text-orange-500" />, path: '/koperasi-members' },
        { label: 'Produk Pinjaman', icon: <ShoppingBag className="w-6 h-6 text-orange-500" />, path: '/koperasi-loans/products' },
        { label: 'Pengajuan', icon: <FileText className="w-6 h-6 text-orange-500" />, path: '/koperasi-loans/applications' },
        { label: 'Margin Rules', icon: <Percent className="w-6 h-6 text-orange-500" />, path: '/koperasi-margins' },
        { label: 'Katalog', icon: <Store className="w-6 h-6 text-orange-500" />, path: '/koperasi-catalog' },
    ];

    const PendingApprovalSkeleton = () => (
        <div className="divide-y divide-slate-100">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-grow space-y-2">
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-60 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                        <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                        <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="pb-32 p-4 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <header className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard Koperasi</h1>
                {koperasiId && (
                    <span className="ml-auto text-xs sm:text-sm font-mono text-slate-500 bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                        ID: {koperasiId}
                    </span>
                )}
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {menuItems.map((item) => (
                    <Card
                        key={item.label}
                        className="text-center hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(item.path)}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                            <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                                {item.icon}
                            </div>
                            <p className="text-sm font-medium text-center text-slate-700 group-hover:text-orange-600">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pending Approvals Section */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-white border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-slate-800">Menunggu Persetujuan</CardTitle>
                        {!loadingPage && (
                            <span className="px-3 py-1 text-sm font-semibold text-orange-600 bg-orange-100 rounded-full">
                                {pendingMerchants.length} Merchant
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingPage ? (
                        <PendingApprovalSkeleton />
                    ) : pendingMerchants.length === 0 ? (
                        <div className="text-center p-10 text-slate-500">
                            <p className="font-medium">Tidak ada data</p>
                            <p className="text-sm">Saat ini tidak ada merchant yang menunggu persetujuan.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingMerchants.map((merchant) => (
                                <div
                                    key={merchant.id}
                                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">{merchant.name}</p>
                                        <p className="text-sm text-slate-500">{merchant.email} &bull; {merchant.phone_number}</p>
                                        <p className="text-xs text-slate-500 mt-1">Username: <span className="font-mono">{merchant.user.username}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                                        <Button
                                            onClick={() => handleAction('approve', merchant.id)}
                                            disabled={loadingAction}
                                            size="sm"
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            Setujui
                                        </Button>
                                        <Button
                                            onClick={() => handleAction('reject', merchant.id)}
                                            disabled={loadingAction}
                                            size="sm"
                                            variant="destructive"
                                        >
                                            Tolak
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

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

export default KoperasiDashboard;

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';

import {
    Users,
    Percent,
    FileText,
    ArrowLeft,
    Store,
    Home,
    ScanQrCode,
    CreditCard,
    UserRound,
    Landmark,
    CirclePercent
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

const DashboardInduk: React.FC = () => {
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
        { label: 'Anggota', icon: <Users className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-anggota' },
        { label: 'Katalog', icon: <Store className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-katalog' },
        { label: 'Margin', icon: <Percent className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-keuangan' },
        { label: 'Simpanan', icon: <Landmark className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-simpanan' },
        { label: 'Kasir', icon: <CirclePercent className="w-6 h-6 text-orange-500" />, path: '/induk/kasir' },
    ];

    const PendingApprovalSkeleton = () => (
        <div className="divide-y divide-slate-100">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex-grow space-y-2">
                        <div className="w-40 h-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-60 animate-pulse"></div>
                        <div className="w-48 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center self-end flex-shrink-0 gap-3 sm:self-center">
                        <div className="w-20 bg-gray-200 rounded-md h-9 animate-pulse"></div>
                        <div className="w-20 bg-gray-200 rounded-md h-9 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen p-4 font-sans pb-28 bg-gray-50">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-bold md:text-2xl text-slate-800">Dashboard Koperasi</h1>
                {koperasiId && (
                    <span className="ml-auto text-xs sm:text-sm font-mono text-slate-500 bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                        ID: {koperasiId}
                    </span>
                )}
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {menuItems.map((item) => (
                    <Card
                        key={item.label}
                        className="text-center transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-orange-300 group"
                        onClick={() => navigate(item.path)}
                    >
                        <CardContent className="flex flex-col items-center justify-center gap-2 p-4">
                            <div className="p-3 transition-colors bg-orange-100 rounded-full group-hover:bg-orange-200">
                                {item.icon}
                            </div>
                            <p className="text-sm font-medium text-center text-slate-700 group-hover:text-orange-600">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
                        <div className="p-10 text-center text-slate-500">
                            <p className="font-medium">Tidak ada data</p>
                            <p className="text-sm">Saat ini tidak ada merchant yang menunggu persetujuan.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingMerchants.map((merchant) => (
                                <div
                                    key={merchant.id}
                                    className="flex flex-col items-start justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center hover:bg-slate-50"
                                >
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800">{merchant.name}</p>
                                        <p className="text-sm text-slate-500">{merchant.email} &bull; {merchant.phone_number}</p>
                                        <p className="mt-1 text-xs text-slate-500">Username: <span className="font-mono">{merchant.user.username}</span></p>
                                    </div>
                                    <div className="flex items-center self-end flex-shrink-0 gap-3 sm:self-center">
                                        <Button
                                            onClick={() => handleAction('approve', merchant.id)}
                                            disabled={loadingAction}
                                            size="sm"
                                            className="text-white bg-green-500 hover:bg-green-600"
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

            <div id="navbar" className="fixed bottom-0 left-0 z-10 flex items-end justify-between w-full gap-5 px-3 py-2 text-xs bg-white border">
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

export default DashboardInduk;

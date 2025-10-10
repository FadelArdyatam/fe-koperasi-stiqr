import React, { useState, useEffect } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';

import {
    Users,
    Percent,
    History,
    ArrowLeft, 
    Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationBell from '@/components/NotificationBell';

interface PendingMerchantKoperasi {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    approval_status: string;
    user: { username: string; email: string; phone_number: string; };
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
        if (!koperasiId) {
            if (affiliationData) setLoadingPage(false);
            return;
        }

        const fetchDashboardData = async () => {
            setLoadingPage(true);
            try {
                // Fetch pending approvals
                const approvalRes = await axiosInstance.get(`/koperasi/${koperasiId}/pending-approvals`);

                // Set pending merchants for the main card
                setPendingMerchants(approvalRes.data || []);

            } catch (error) {
                setErrorMessage('Gagal memuat data dashboard.');
                setShowNotification(true);
            } finally {
                setLoadingPage(false);
            }
        };

        fetchDashboardData();
    }, [koperasiId, affiliationData]);

    const handleAction = async (action: 'approve' | 'reject', merchantId: string) => {
        if (!koperasiId) {
            setErrorMessage('Koperasi ID tidak tersedia');
            setShowNotification(true);
            return;
        }
        
        setLoadingAction(true);
        try {
            await axiosInstance.post(`/koperasi/${koperasiId}/${action}-merchant/${merchantId}`);
            setSuccessMessage(`Merchant berhasil di ${action === 'approve' ? 'setujui' : 'tolak'}!`);
            setShowNotification(true);
            setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
            
            // Dispatch event to notify other components about approval status change
            window.dispatchEvent(new CustomEvent('approval-status-changed', { 
                detail: { merchantId, action } 
            }));
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || `Gagal untuk ${action} merchant.`);
            setShowNotification(true);
        } finally {
            setLoadingAction(false);
        }
    };

    const menuItems = [
        { label: 'Anggota', icon: <Users className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-anggota' },
        { label: 'Margin', icon: <Percent className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-keuangan' },
        { label: 'Simpanan', icon: <Landmark className="w-6 h-6 text-orange-500" />, path: '/induk/manajemen-simpanan' },
        { label: 'Riwayat', icon: <History className="w-6 h-6 text-orange-500" />, path: '/induk/riwayat' },
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
            <header className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard Koperasi</h1>
                <div className="ml-auto flex items-center gap-4">
                    <NotificationBell />
                    {koperasiId && (
                        <span className="text-xs sm:text-sm font-mono text-slate-500 bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                            ID: {koperasiId}
                        </span>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {menuItems.map((item) => (
                    <Card
                        key={item.label}
                        className="text-center hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(item.path)}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 relative">
                            <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
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

            
        </div>
    );
};

export default DashboardInduk;

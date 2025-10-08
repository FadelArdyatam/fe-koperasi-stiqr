import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Wallet, Landmark, Users, Shield, Crown } from 'lucide-react';

// --- TYPES ---
interface ProfitSummary {
    total_revenue: number;
    total_margin: number;
    per_tier: {
        [key: string]: {
            total_transactions: number;
            total_revenue: number;
            total_margin: number;
        }
    }
}

interface SavingsSummary {
    data?: {
        total_saldo_semua: number;
        total_anggota_tercatat: number;
    }
}

// --- HELPER COMPONENTS ---

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

const StatCard = ({ title, value, subtitle, icon, color = 'orange' }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color?: string }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <div className={`h-8 w-8 flex items-center justify-center rounded-full bg-${color}-100 text-${color}-500`}>
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </CardContent>
    </Card>
);

const TierProfitRow = ({ tier, data }: { tier: string, data: any }) => {
    const tierInfo = {
        NON_MEMBER: { label: 'Non Anggota', icon: Users, color: 'gray' },
        MEMBER: { label: 'Member', icon: Shield, color: 'blue' },
        MEMBER_USAHA: { label: 'Member Usaha', icon: Crown, color: 'orange' },
    }[tier] || { label: tier, icon: Users, color: 'gray' };

    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-${tierInfo.color}-100 text-${tierInfo.color}-500`}>
                    {React.createElement(tierInfo.icon, { className: "h-5 w-5" })}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{tierInfo.label}</p>
                    <p className="text-xs text-gray-500">{data.total_transactions ?? 0} Transaksi</p>
                </div>
            </div>
            <div className="flex items-center gap-8 text-right">
                <div>
                    <p className="text-xs text-gray-500">Omzet</p>
                    <p className="font-semibold text-gray-700">{formatCurrency(data.total_revenue)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Profit</p>
                    <p className="font-semibold text-green-600">{formatCurrency(data.total_margin)}</p>
                </div>
            </div>
        </div>
    );
};

const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-28 bg-gray-200 rounded-lg"></div>
            <div className="h-28 bg-gray-200 rounded-lg"></div>
            <div className="h-28 bg-gray-200 rounded-lg"></div>
        </div>
        <Card>
            <CardHeader>
                <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-4 mt-2 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
            </CardContent>
        </Card>
    </div>
);

// --- MAIN COMPONENT ---

const ManajemenKeuangan: React.FC = () => {
    const navigate = useNavigate();
    const [koperasiId, setKoperasiId] = useState<string>('');
    const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
    const [savingsSummary, setSavingsSummary] = useState<SavingsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [showNotification, setShowNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/koperasi/affiliation/me');
                const id = res.data?.koperasi?.id;
                if (!id) {
                    setErrorMessage('Anda bukan induk koperasi');
                    setShowNotification(true);
                    setLoading(false);
                    return;
                }
                setKoperasiId(id);

                const [profitRes, savingsRes] = await Promise.all([
                    axiosInstance.get(`/koperasi/${id}/catalog/profit`),
                    axiosInstance.get(`/koperasi-simpan-pinjam/${id}/summary/savings`),
                ]);

                const profitPayload = profitRes?.data;
                setProfitSummary(profitPayload?.data || profitPayload || null);
                setSavingsSummary(savingsRes.data || null);

            } catch (e: any) {
                setErrorMessage(e?.response?.data?.message || 'Gagal mengambil data keuangan');
                setShowNotification(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-bold">Manajemen Keuangan</h1>
                {koperasiId && <span className="ml-auto text-xs sm:text-sm font-mono text-slate-500 bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">ID: {koperasiId}</span>}
            </header>

            <div className="p-4 lg:p-6 space-y-6">
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard 
                                title="Total Omzet" 
                                value={formatCurrency(profitSummary?.total_revenue)} 
                                subtitle="Dari seluruh penjualan produk"
                                icon={<TrendingUp className="w-4 h-4"/>}
                            />
                            <StatCard 
                                title="Total Profit" 
                                value={formatCurrency(profitSummary?.total_margin)} 
                                subtitle="Dari seluruh margin produk"
                                icon={<Wallet className="w-4 h-4"/>}
                                color="green"
                            />
                            <StatCard 
                                title="Total Simpanan Anggota" 
                                value={formatCurrency(savingsSummary?.data?.total_saldo_semua)} 
                                subtitle={`${savingsSummary?.data?.total_anggota_tercatat ?? '-'} anggota tercatat`}
                                icon={<Landmark className="w-4 h-4"/>}
                                color="blue"
                            />
                        </div>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Profit & Omzet per Tier</CardTitle>
                                <CardDescription>Ringkasan pendapatan dibagi berdasarkan tier pelanggan.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {profitSummary?.per_tier ? (
                                    <div className="divide-y divide-gray-100">
                                        {['NON_MEMBER', 'MEMBER', 'MEMBER_USAHA'].map((tier) => (
                                            <TierProfitRow key={tier} tier={tier} data={profitSummary.per_tier[tier] || {}} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-gray-500">Belum ada data ringkasan profit.</div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {showNotification && (
                <Notification
                    message={errorMessage}
                    onClose={() => setShowNotification(false)}
                    status={errorMessage ? 'error' : 'success'}
                />
            )}
        </div>
    );
};

export default ManajemenKeuangan;
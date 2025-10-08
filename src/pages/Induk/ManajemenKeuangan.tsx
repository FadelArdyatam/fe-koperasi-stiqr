import React, { useEffect, useState } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Home, ScanQrCode, CreditCard, FileText, UserRound } from 'lucide-react';

// Tier type not required in this view

const ManajemenKeuangan: React.FC = () => {
    const navigate = useNavigate();
    const [koperasiId, setKoperasiId] = useState<string>('');
    // rules removed (deprecated in UI) - margin rules maintained in catalog/margin service
    const [stats, setStats] = useState<any>(null);
    const [marginSummary, setMarginSummary] = useState<any>(null);
    const [profitSummary, setProfitSummary] = useState<any>(null);
    const [savingsSummary, setSavingsSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const [showNotification, setShowNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    

    // tier labels not needed in this view

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

                // Parallel fetch important data for Manajemen Keuangan
                const [statsRes, marginRes, profitRes, savingsRes] = await Promise.all([
                    axiosInstance.get(`/koperasi/${id}/dashboard/stats`),
                    axiosInstance.get(`/koperasi/${id}/summary/margins`),
                    axiosInstance.get(`/koperasi/${id}/catalog/profit`, { params: { start_date: undefined, end_date: undefined } }),
                    axiosInstance.get(`/koperasi-simpan-pinjam/${id}/summary/savings`),
                ]);

                setStats(statsRes.data || null);
                setMarginSummary(marginRes.data || null);

                // profitRes is expected to return { success: true, data: { per_tier: {...}, total_revenue, total_margin } }
                const profitPayload = profitRes?.data;
                if (profitPayload) {
                    setProfitSummary(profitPayload?.data || profitPayload);
                } else {
                    setProfitSummary(null);
                }

                setSavingsSummary(savingsRes.data || null);
            } catch (e: any) {
                setErrorMessage(e?.response?.data?.message || 'Gagal mengambil data');
                setShowNotification(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // margin creation handled from Manajemen Katalog; UI here is read-only summary

    const SkeletonLoader = () => (
        <div className="space-y-4 animate-pulse">
            <Card>
                <CardHeader>
                    <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="w-1/4 h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen pb-28 bg-gray-50">
            <header className="sticky top-0 z-20 flex items-center gap-4 p-4 mb-0 bg-white border-b">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-bold">Manajemen Keuangan</h1>
                {koperasiId && <span className="ml-auto text-xs sm:text-sm font-mono text-slate-500 bg-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">ID: {koperasiId}</span>}
            </header>

            <div className="p-4 space-y-4">
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Card>
                                <CardContent>
                                    <div className="text-sm text-gray-500">Total Omzet</div>
                                    <div className="text-2xl font-semibold text-gray-800">{profitSummary?.total_revenue ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profitSummary.total_revenue) : (stats?.month?.revenue ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.month.revenue) : '-')}</div>
                                    <div className="text-xs text-gray-500">Periode: {stats?.month ? 'Bulan ini' : (stats?.period || '-')}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <div className="text-sm text-gray-500">Total Profit</div>
                                    <div className="text-2xl font-semibold text-gray-800">{profitSummary?.total_margin ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profitSummary.total_margin) : '-'}</div>
                                    <div className="text-xs text-gray-500">Margin rata-rata: {marginSummary?.data?.average_margin ?? marginSummary?.average_margin ? `${marginSummary.data?.average_margin ?? marginSummary.average_margin}%` : '-'}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <div className="text-sm text-gray-500">Total Simpanan</div>
                                    <div className="text-2xl font-semibold text-gray-800">{savingsSummary?.data?.total_saldo_semua ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(savingsSummary.data.total_saldo_semua) : '-'}</div>
                                    <div className="text-xs text-gray-500">Jumlah anggota: {savingsSummary?.data?.total_anggota_tercatat ?? '-'}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profit & Omzet per Tier */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profit & Omzet per Tier</CardTitle>
                                <CardDescription>Ringkasan omzet dan profit dibagi berdasarkan tier pelanggan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {profitSummary ? (
                                    <div className="space-y-3">
                                        {['NON_MEMBER', 'MEMBER', 'MEMBER_USAHA'].map((t) => {
                                            const item = profitSummary.per_tier?.[t] || {};
                                            return (
                                                <div key={t} className="flex items-center justify-between pb-2 border-b">
                                                    <div>
                                                        <div className="font-medium">{t}</div>
                                                        <div className="text-xs text-gray-500">Transaksi: {item.total_transactions ?? 0}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">Omzet</div>
                                                        <div className="font-semibold">{item.total_revenue ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total_revenue) : '-'}</div>
                                                        <div className="text-sm text-gray-500">Profit</div>
                                                        <div className="font-semibold">{item.total_margin ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total_margin) : '-'}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-gray-500">Belum ada data ringkasan profit.</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Margin summary (read-only) - left as single card for reference */}
                        <div className="grid grid-cols-1 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Margin</CardTitle>
                                    <CardDescription>Ringkasan margin per tier (informasi saja).</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {marginSummary?.data || marginSummary ? (
                                        <div className="space-y-2">
                                            {(marginSummary?.data?.tiers || marginSummary?.tiers || []).map((t: any) => (
                                                <div key={t.tier} className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-700">{t.tier}</div>
                                                    <div className="font-semibold">{t.margin_display ?? (t.margin ? `${t.margin}%` : '-')}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">Tidak ada data ringkasan margin.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
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

export default ManajemenKeuangan;

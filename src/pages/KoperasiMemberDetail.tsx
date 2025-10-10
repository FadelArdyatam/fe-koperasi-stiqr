import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { useAffiliation } from '@/hooks/useAffiliation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Home, ScanQrCode, CreditCard, FileText, UserRound, Check, X, } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// --- Helper Components ---
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'PENDING': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
            case 'APPROVED': return 'border-green-300 bg-green-50 text-green-800';
            case 'REJECTED': return 'border-red-300 bg-red-50 text-red-800';
            default: return 'border-gray-300 bg-gray-50 text-gray-800';
        }
    };
    return (
        <span className={`px-3 py-1 inline-block rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
            {status}
        </span>
    );
};

const DataField = ({ label, value, children }: { label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="text-base font-medium text-gray-800 break-words">
            {children || value || '-'}
        </div>
    </div>
);

const KoperasiMemberDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { data: affiliationData } = useAffiliation();
    const koperasiId = affiliationData?.koperasi?.id;

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            await new Promise(res => setTimeout(res, 500)); // Simulate loading
            const res = await axiosInstance.get(`/koperasi/member/${id}`);
            setDetail(res.data);
        } catch (e) {
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!koperasiId) {
            alert('Koperasi ID tidak tersedia.');
            return;
        }
        setActionLoading(true);
        try {
            const verb = action === 'approve' ? 'approve-merchant' : 'reject-merchant';
            await axiosInstance.post(`/koperasi/${koperasiId}/${verb}/${id}`);
            await fetchDetail();
        } catch (error) {
            console.error(`Failed to ${action} member`, error);
        } finally {
            setActionLoading(false);
        }
    };

    // --- Skeleton Component ---
    const MemberDetailSkeleton = () => (
        <div className="pb-32 p-4 bg-gray-50 min-h-screen animate-pulse">
            <header className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
            </header>
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                        <div className="space-y-2 text-center sm:text-left">
                            <div className="h-8 w-48 bg-gray-200 rounded"></div>
                            <div className="h-5 w-60 bg-gray-200 rounded"></div>
                            <div className="h-6 w-24 bg-gray-200 rounded-full mt-2 mx-auto sm:mx-0"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><div className="h-6 w-1/3 bg-gray-200 rounded"></div></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    if (loading) {
        return <MemberDetailSkeleton />;
    }

    if (!detail) {
        return <div className="flex justify-center items-center h-screen">Data tidak ditemukan</div>;
    }

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            <header className="p-4 flex items-center gap-4 mb-0 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold truncate">Detail Anggota</h1>
            </header>

            <div className="p-4 space-y-4">
                {detail.approval_status === 'PENDING' && (
                    <Card className="bg-yellow-50 border-yellow-200 shadow-none">
                        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg text-yellow-900">Tindakan Diperlukan</CardTitle>
                                <CardDescription className="text-yellow-800">Anggota ini sedang menunggu persetujuan Anda.</CardDescription>
                            </div>
                            <div className="flex gap-2 self-end sm:self-center">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={actionLoading}><X className="w-4 h-4 mr-2"/>Tolak</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Anda yakin ingin menolak anggota ini?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAction('reject')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Ya, Tolak</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" disabled={actionLoading} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-2"/>Setujui</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Anda yakin ingin menyetujui anggota ini?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAction('approve')} className="bg-green-600 hover:bg-green-700">Ya, Setujui</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                {/* Profile Header Card */}
                <Card>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <UserRound className="w-12 h-12 text-orange-500" />
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{detail.name}</h2>
                            <p className="text-base text-gray-600">{detail.email}</p>
                            <div className="pt-2">
                                <StatusBadge status={detail.approval_status} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Informasi Kontak</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <DataField label="No. Handphone" value={detail.phone_number} />
                            <DataField label="Koperasi" value={detail.koperasi?.nama_koperasi} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Akun Pengguna</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <DataField label="Username" value={detail.user?.username} />
                            <DataField label="Email Akun" value={detail.user?.email} />
                            <DataField label="No. HP Akun" value={detail.user?.phone_number} />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Pengajuan QRIS</CardTitle>
                        <CardDescription>Informasi yang relevan dari pengajuan QRIS.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!detail.Qris_Submission ? (
                            <p className="text-sm text-gray-500 col-span-full text-center py-4">Tidak ada data pengajuan QRIS.</p>
                        ) : (
                            <>
                                <DataField label="Merchant ID" value={detail.Qris_Submission.merchant_id} />
                                <DataField label="Submission ID" value={detail.Qris_Submission.id} />
                                <DataField label="Status Pengajuan">
                                    <StatusBadge status={detail.Qris_Submission.status.toUpperCase() === 'OPEN' ? 'APPROVED' : 'REJECTED'} />
                                </DataField>
                                <DataField label="Foto KTP">
                                    {detail.Qris_Submission.ktp ? (
                                        <Button asChild variant="link" className="p-0 h-auto"><a href={detail.Qris_Submission.ktp} target="_blank" rel="noopener noreferrer">Lihat File</a></Button>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </DataField>
                                <DataField label="Foto NPWP">
                                    {detail.Qris_Submission.npwp ? (
                                        <Button asChild variant="link" className="p-0 h-auto"><a href={detail.Qris_Submission.npwp} target="_blank" rel="noopener noreferrer">Lihat File</a></Button>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </DataField>
                                <DataField label="Foto Usaha">
                                    {detail.Qris_Submission.business_photo ? (
                                        <Button asChild variant="link" className="p-0 h-auto"><a href={detail.Qris_Submission.business_photo} target="_blank" rel="noopener noreferrer">Lihat File</a></Button>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </DataField>
                            </>
                        )}
                    </CardContent>
                </Card>
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

export default KoperasiMemberDetail;

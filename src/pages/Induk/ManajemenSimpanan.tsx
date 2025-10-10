import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Search, Store, Landmark, Wallet, PiggyBank } from 'lucide-react';
import Notification from '@/components/Notification';

// --- Interfaces ---
interface SummaryData {
    total_saldo_pokok: number;
    total_saldo_wajib: number;
    total_saldo_sukarela: number;
    total_saldo_semua: number;
}

interface MemberBalance {
    member_id: string;
    user: {
        username: string;
    };
    saldo: {
        total: number;
    };
}

interface MemberBalanceDetail {
    saldo: {
        pokok: number;
        wajib: number;
        sukarela: number;
    };
}

interface Pagination {
    currentPage: number;
    totalPages: number;
}

// --- Main Component ---
const ManajemenSimpanan: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId } = useAffiliation();

    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [members, setMembers] = useState<MemberBalance[]>([]);
    const [detail, setDetail] = useState<MemberBalanceDetail | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Debouncing for Search ---
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500); // 500ms delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // --- Data Fetching ---
    useEffect(() => {
        if (!koperasiId) return;
        setLoadingSummary(true);
        axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/summary/savings`)
            .then(res => {
                setSummary(res.data.data);
            })
            .catch(err => {
                setError('Gagal memuat ringkasan simpanan.');
                console.error(err);
            })
            .finally(() => {
                setLoadingSummary(false);
            });
    }, [koperasiId]);

    // Fetch Members on search/page change
    useEffect(() => {
        if (!koperasiId) return;
        setLoadingMembers(true);
        axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/members/balance`, { params: { page: currentPage, search: debouncedSearchTerm } })
            .then(res => {
                setMembers(res.data.data || []);
                setPagination(res.data.pagination);
            })
            .catch(err => {
                setError('Gagal memuat daftar anggota.');
                console.error(err);
            })
            .finally(() => {
                setLoadingMembers(false);
            });
    }, [koperasiId, currentPage, debouncedSearchTerm]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!selectedMember || !koperasiId) return;

            setLoadingDetail(true);
            try {
                const res = await axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/members/${selectedMember.member_id}/balance-detail`);
                setDetail(res.data.data);
            } catch (err) {
                setError('Gagal memuat detail saldo anggota.');
                console.error(err);
            } finally {
                setLoadingDetail(false);
            }
        };

        fetchDetail();
    }, [selectedMember, koperasiId]);

    const formatRupiah = (price: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);

    const SummaryCard = () => (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Total Simpanan</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingSummary ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>) : (
                    <>
                        <DataDisplay icon={<Wallet className="text-blue-500" />} label="Total Saldo" value={formatRupiah(summary?.total_saldo_semua || 0)} />
                        <DataDisplay icon={<Landmark className="text-green-500" />} label="Simpanan Pokok" value={formatRupiah(summary?.total_saldo_pokok || 0)} />
                        <DataDisplay icon={<Landmark className="text-yellow-500" />} label="Simpanan Wajib" value={formatRupiah(summary?.total_saldo_wajib || 0)} />
                        <DataDisplay icon={<PiggyBank className="text-purple-500" />} label="Simpanan Sukarela" value={formatRupiah(summary?.total_saldo_sukarela || 0)} />
                    </>
                )}
            </CardContent>
        </Card>
    );

    const DataDisplay = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">{icon}</div>
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="pb-32 bg-gray-50 min-h-screen font-sans">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold truncate">Manajemen Simpanan</h1>
            </header>

            <div className="p-4 space-y-4">
                <SummaryCard />

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Saldo Anggota</CardTitle>
                        <CardDescription>Cari dan lihat rincian saldo untuk setiap anggota.</CardDescription>
                        <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama anggota..." className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-gray-100">
                            {loadingMembers ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg my-2 animate-pulse"></div>) : 
                                members.map(member => (
                                    <div key={member.member_id} onClick={() => setSelectedMember(member)} className="p-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 rounded-full"><Store className="w-5 h-5 text-orange-500" /></div>
                                            <p className="font-semibold">{member.user.username}</p>
                                        </div>
                                        <p className="font-bold text-gray-800">{formatRupiah(member.saldo.total)}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </CardContent>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 p-4 border-t">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
                            <span>Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                            <Button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}>Berikutnya</Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Member Detail Modal */}
            <Dialog open={!!selectedMember} onOpenChange={(isOpen) => !isOpen && setSelectedMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail Saldo: {selectedMember?.user.username}</DialogTitle>
                        <DialogDescription>Rincian simpanan untuk anggota yang dipilih.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {loadingDetail ? <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div> : (
                            <>
                                <DataDisplay icon={<Landmark size={20} className="text-green-500" />} label="Simpanan Pokok" value={formatRupiah(detail?.saldo.pokok || 0)} />
                                <DataDisplay icon={<Landmark size={20} className="text-yellow-500" />} label="Simpanan Wajib" value={formatRupiah(detail?.saldo.wajib || 0)} />
                                <DataDisplay icon={<PiggyBank size={20} className="text-purple-500" />} label="Simpanan Sukarela" value={formatRupiah(detail?.saldo.sukarela || 0)} />
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManajemenSimpanan;

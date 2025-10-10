import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from '@/components/Notification';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Home, ScanQrCode, CreditCard, FileText, UserRound, Percent, Tag, ListOrdered, ChevronDown } from 'lucide-react';

type Tier = 'NON_MEMBER' | 'MEMBER' | 'MEMBER_USAHA';
type RuleType = 'FLAT' | 'PERCENT';

interface MarginRule {
  id: string;
  koperasi_id: string;
  tier: Tier;
  type: RuleType;
  value: number;
  is_active: boolean;
  created_at?: string;
}

const KoperasiMargins: React.FC = () => {
    const navigate = useNavigate();
    const [koperasiId, setKoperasiId] = useState<string>('');
    const [rules, setRules] = useState<MarginRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [form, setForm] = useState<{ tier: Tier; type: RuleType; value: string }>({
        tier: 'NON_MEMBER',
        type: 'PERCENT',
        value: '',
    });
    const [tierLabel, setTierLabel] = useState('Non-Anggota');
    const [typeLabel, setTypeLabel] = useState('Persentase (%)');

    const tierLabels: Record<Tier, string> = {
        NON_MEMBER: 'Non-Anggota',
        MEMBER: 'Anggota',
        MEMBER_USAHA: 'Anggota Usaha',
    };

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/koperasi/affiliation/me');
            const id = res.data?.koperasi?.id;
            if (id) {
                setKoperasiId(id);
                await fetchRules(id);
            } else {
                setErrorMessage('Anda bukan induk koperasi');
                setShowNotification(true);
            }
        } catch (e: any) {
            setErrorMessage('Gagal memuat data');
            setShowNotification(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const fetchRules = async (id: string) => {
        try {
            const res = await axiosInstance.get(`/koperasi/margin/${id}`);
            setRules(res.data || []);
        } catch (e: any) {
            setErrorMessage('Gagal memuat aturan margin');
            setShowNotification(true);
        }
    };

    const submitRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!koperasiId || !form.value) return;
        setActionLoading(true);
        try {
            await axiosInstance.post('/koperasi/margin/set', {
                koperasi_id: koperasiId,
                tier: form.tier,
                type: form.type,
                value: Number(form.value),
            });
            setSuccessMessage('Aturan margin berhasil disimpan');
            setShowNotification(true);
            await fetchRules(koperasiId);
            setForm({ ...form, value: '' });
        } catch (e: any) {
            setErrorMessage('Gagal menyimpan aturan margin');
            setShowNotification(true);
        } finally {
            setActionLoading(false);
        }
    };

    const SkeletonLoader = () => (
        <div className="space-y-4 animate-pulse">
            <Card>
                <CardHeader>
                    <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            <header className="p-4 flex items-center gap-4 mb-0 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Aturan Margin Koperasi</h1>
            </header>

            <div className="p-4 space-y-4">
                {loading ? <SkeletonLoader /> : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tambah / Perbarui Aturan</CardTitle>
                                <CardDescription>Aturan yang sudah ada akan diperbarui jika Anda menyimpan tier dan tipe yang sama.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Tingkat Anggota</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {tierLabel}
                                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuItem onSelect={() => { setForm({...form, tier: 'NON_MEMBER'}); setTierLabel('Non-Anggota'); }}>Non-Anggota</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => { setForm({...form, tier: 'MEMBER'}); setTierLabel('Anggota'); }}>Anggota</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => { setForm({...form, tier: 'MEMBER_USAHA'}); setTierLabel('Anggota Usaha'); }}>Anggota Usaha</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Tipe Margin</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {typeLabel}
                                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuItem onSelect={() => { setForm({...form, type: 'PERCENT'}); setTypeLabel('Persentase (%)'); }}>Persentase (%)</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => { setForm({...form, type: 'FLAT'}); setTypeLabel('Flat (Rp)'); }}>Flat (Rp)</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Nilai</label>
                                        <Input 
                                            type="number" 
                                            placeholder={form.type === 'PERCENT' ? 'Contoh: 2.5' : 'Contoh: 5000'} 
                                            value={form.value}
                                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={actionLoading} className="w-full">
                                        {actionLoading ? 'Menyimpan...' : 'Simpan Aturan'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Aturan Aktif</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {rules.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <ListOrdered className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 font-medium">Belum ada aturan margin.</p>
                                        <p className="text-sm">Silakan tambahkan aturan menggunakan form di atas.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {rules.map((r) => (
                                            <div key={r.id} className="py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.type === 'PERCENT' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {r.type === 'PERCENT' ? <Percent className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{tierLabels[r.tier]}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Margin: {r.type === 'PERCENT' ? `${r.value}%` : `Rp ${Number(r.value).toLocaleString('id-ID')}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1">AKTIF</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

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

export default KoperasiMargins;

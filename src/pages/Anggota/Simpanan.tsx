import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';
import { formatRupiah } from '@/hooks/convertRupiah';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Wallet, ArrowUpCircle, History, Loader2, XCircle, TrendingUp, TrendingDown, QrCode } from 'lucide-react';
import Notification from '@/components/Notification';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea.tsx';

// --- Interfaces ---
interface Balance {
    saldo_pokok: string;
    saldo_wajib: string;
    saldo_sukarela: string;
    total?: number;
}

interface Transaction {
    id: string;
    direction: 'DEPOSIT' | 'WITHDRAW';
    amount: string;
    status: 'PAID' | 'PENDING' | 'FAILED';
    created_at: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
}

// --- Main Component ---
const Simpanan: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId } = useAffiliation();

    // States
    const [memberId, setMemberId] = useState<string | null>(null);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [modalState, setModalState] = useState<{ type: 'deposit' | 'status' | 'show_qris' | null, data?: any }>({ type: null });
    const [form, setForm] = useState({ amount: '', notes: '', type: null as 'POKOK' | 'WAJIB' | 'SUKARELA' | null, method: 'SALDO_NON_CASH' as 'SALDO_NON_CASH' | 'QRIS_NOBU' });
    const [formError, setFormError] = useState('');
    const [pin, setPin] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState<{message: string, status: 'success' | 'error'} | null>(null);

    // --- Data Fetching ---
    const fetchInitialData = useCallback(async (showLoading = true) => {
        if (!koperasiId) return;
        if(showLoading) setLoading(true);
        try {
            const memberIdRes = await axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/my-member-id`);
            const currentMemberId = memberIdRes.data.member_id;
            setMemberId(currentMemberId);

            if (currentMemberId) {
                const [balanceRes, historyRes] = await Promise.all([
                    axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/balance/${currentMemberId}`),
                    axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/history/${currentMemberId}`, { params: { page: currentPage } })
                ]);
                const balanceData = balanceRes.data.data;
                const total = Number(balanceData.saldo_pokok) + Number(balanceData.saldo_wajib) + Number(balanceData.saldo_sukarela);
                setBalance({ ...balanceData, total });
                setHistory(historyRes.data.data || []);
                setPagination(historyRes.data.pagination);
            }
        } catch (err) {
            setNotification({ message: 'Gagal memuat data simpanan.', status: 'error' });
        } finally {
            if(showLoading) setLoading(false);
        }
    }, [koperasiId, currentPage]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // --- Handlers ---
    const handleOpenModal = (type: 'deposit') => {
        setForm({ amount: '', notes: '', type: null, method: 'SALDO_NON_CASH' });
        setFormError('');
        setPin('');
        setModalState({ type });
    };

    const handleCloseModal = () => {
        setModalState({ type: null });
    };

    const handleDeposit = async () => {
        setFormError('');
        if (!form.type) {
            setFormError('Silahkan pilih tipe simpanan.');
            return;
        }
        if (Number(form.amount) < 1000) {
            setFormError('Setoran minimum adalah Rp 1.000');
            return;
        }
        if (form.method === 'SALDO_NON_CASH' && !pin) {
            setFormError('PIN diperlukan untuk pembayaran dengan saldo');
            return;
        }
        if (!koperasiId || !memberId) return;

        setActionLoading(true);
        try {
            const response = await axiosInstance.post(`/koperasi-simpan-pinjam/${koperasiId}/deposit`, {
                member_id: memberId,
                type: form.type,
                amount: Number(form.amount),
                method: form.method,
                notes: form.notes,
                pin: form.method === 'SALDO_NON_CASH' ? pin : undefined
            });
            
            if (form.method === 'QRIS_NOBU') {
                setModalState({ 
                    type: 'show_qris', 
                    data: { 
                        qrCode: response.data.qr_code, 
                        transaction_id: response.data.transaction_id,
                        amount: response.data.amount,
                        koperasi_induk_name: response.data.koperasi_induk_name
                    } 
                });
            } else {
                setModalState({ type: 'status', data: { transaction_id: response.data.transaction_id } });
            }
        } catch (err: any) {
            handleCloseModal(); // Close modal first
            setTimeout(() => { // Use timeout to allow modal to close before showing notification
                setNotification({ message: err.response?.data?.message || 'Gagal melakukan setoran.', status: 'error' });
            }, 300);
        } finally {
            setActionLoading(false);
        }
    };


    const getStatusChip = (status: string) => {
        switch (status) {
            case 'PAID': return <div className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">Berhasil</div>;
            case 'PENDING': return <div className="text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">Pending</div>;
            case 'FAILED': return <div className="text-xs font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">Gagal</div>;
            default: return <div className="text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{status}</div>;
        }
    };

    return (
        <div className="pb-32 bg-gray-50 min-h-screen font-sans">
            {notification && <Notification message={notification.message} status={notification.status} onClose={() => setNotification(null)} />}
            <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
                <h1 className="text-xl font-bold truncate">Simpanan Saya</h1>
            </header>

            <div className="p-4 space-y-5">
                <Card className="shadow-sm">
                    <CardContent className="p-6 text-center">
                        {loading ? <div className="h-16 bg-gray-200 rounded-lg animate-pulse w-3/4 mx-auto"></div> : 
                            <>
                                <p className="text-sm text-gray-600">Total Saldo Simpanan</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{formatRupiah(balance?.total || 0)}</p>
                            </>
                        }
                        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t text-center">
                            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>) : (
                                <>
                                    <div><p className="text-xs text-gray-500">Pokok</p><p className="font-semibold">{formatRupiah(Number(balance?.saldo_pokok) || 0)}</p></div>
                                    <div><p className="text-xs text-gray-500">Wajib</p><p className="font-semibold">{formatRupiah(Number(balance?.saldo_wajib) || 0)}</p></div>
                                    <div><p className="text-xs text-gray-500">Sukarela</p><p className="font-semibold">{formatRupiah(Number(balance?.saldo_sukarela) || 0)}</p></div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button variant="default" className="w-full h-24 flex-col gap-2 text-base bg-white text-gray-800 border shadow-sm hover:bg-gray-100" onClick={() => handleOpenModal('deposit')}><ArrowUpCircle className="w-7 h-7 text-green-500"/>Setor Dana</Button>
                </div>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><History size={20}/>Riwayat Transaksi</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>) : 
                                history.length === 0 ? <p className="text-sm text-center text-gray-500 py-8">Belum ada riwayat transaksi.</p> :
                                history.map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center border-b p-3 hover:bg-gray-50 rounded-md">
                                        <div className="flex items-center gap-3">
                                            {tx.direction === 'DEPOSIT' ? <TrendingUp className="w-6 h-6 text-green-500"/> : <TrendingDown className="w-6 h-6 text-red-500"/>}
                                            <div>
                                                <p className={`font-semibold`}>{tx.direction === 'DEPOSIT' ? 'Setoran' : 'Penarikan'}</p>
                                                <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatRupiah(Number(tx.amount))}</p>
                                            {getStatusChip(tx.status)}
                                        </div>
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

            {/* Modals */}
            <Dialog open={modalState.type === 'deposit'} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Setor Dana</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label>Metode Pembayaran</Label>
                            <RadioGroup defaultValue="SALDO_NON_CASH" value={form.method} onValueChange={(value: 'SALDO_NON_CASH' | 'QRIS_NOBU') => setForm(f => ({...f, method: value}))} className="mt-2 grid grid-cols-2 gap-2">
                                <Label htmlFor="r-saldo" className={`border rounded-md p-4 text-center cursor-pointer ${form.method === 'SALDO_NON_CASH' ? 'border-orange-500 bg-orange-50' : ''}`}>
                                    <RadioGroupItem value="SALDO_NON_CASH" id="r-saldo" className="sr-only" />
                                    <div className="flex flex-col items-center gap-1">
                                        <Wallet className="w-5 h-5" />
                                        <span className="text-sm font-medium">Saldo</span>
                                    </div>
                                </Label>
                                <Label htmlFor="r-qris" className={`border rounded-md p-4 text-center cursor-pointer ${form.method === 'QRIS_NOBU' ? 'border-orange-500 bg-orange-50' : ''}`}>
                                    <RadioGroupItem value="QRIS_NOBU" id="r-qris" className="sr-only" />
                                    <div className="flex flex-col items-center gap-1">
                                        <QrCode className="w-5 h-5" />
                                        <span className="text-sm font-medium">QRIS</span>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </div>
                        
                        {form.method === 'SALDO_NON_CASH' && (
                            <div>
                                <Label htmlFor="pin-deposit">PIN Transaksi</Label>
                                <Input 
                                    id="pin-deposit" 
                                    type="password" 
                                    value={pin} 
                                    onChange={(e) => setPin(e.target.value)} 
                                    placeholder="Masukkan PIN" 
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">PIN diperlukan untuk pembayaran dengan saldo</p>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="amount-deposit">Jumlah Setoran</Label>
                            <Input id="amount-deposit" type="text" value={formatRupiah(form.amount)} onChange={(e) => setForm(f => ({...f, amount: e.target.value.replace(/[^0-9]/g, '')}))} placeholder="Rp 0" />
                            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
                        </div>
                        <div>
                            <Label>Tipe Simpanan</Label>
                            <RadioGroup value={form.type || ''} onValueChange={(value: 'POKOK' | 'WAJIB' | 'SUKARELA') => setForm(f => ({...f, type: value}))} className="mt-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="WAJIB" id="r-wajib" /><Label htmlFor="r-wajib">Wajib</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="POKOK" id="r-pokok" /><Label htmlFor="r-pokok">Pokok</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="SUKARELA" id="r-sukarela" /><Label htmlFor="r-sukarela">Sukarela</Label></div>
                            </RadioGroup>
                        </div>
                        <div>
                            <Label htmlFor="notes-deposit">Catatan (Opsional)</Label>
                            <Textarea id="notes-deposit" value={form.notes} onChange={(e) => setForm(f => ({...f, notes: e.target.value}))} placeholder="Contoh: Setoran bulan Oktober" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseModal}>Batal</Button>
                        <Button onClick={handleDeposit} disabled={actionLoading}>{actionLoading ? <Loader2 className="animate-spin"/> : 'Lanjutkan'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={modalState.type === 'show_qris'} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Setor Dana via QRIS Koperasi</DialogTitle>
                        <p className="text-xs text-gray-500 text-center">
                            QRIS diterbitkan oleh koperasi induk: pembayaran masuk ke rekening koperasi
                        </p>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {/* QR Code Container */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100">
                            <img 
                                src={modalState.data?.qrCode} 
                                alt="QRIS Code" 
                                className="w-64 h-64 mx-auto rounded-lg" 
                            />
                        </div>
                        
                        {/* Amount Display */}
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {formatRupiah(modalState.data?.amount || 0)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Tipe: {form.type} • ID: {modalState.data?.transaction_id}
                            </p>
                        </div>
                        
                        {/* Instructions */}
                        <div className="bg-blue-50 p-4 rounded-lg w-full">
                            <p className="text-sm text-blue-800 font-medium text-center mb-2">
                                📱 Cara Pembayaran
                            </p>
                            <ol className="text-xs text-blue-700 space-y-1">
                                <li>1. Buka aplikasi pembayaran (GoPay, OVO, DANA, dll)</li>
                                <li>2. Pilih "Scan QR" atau "QRIS"</li>
                                <li>3. Arahkan kamera ke QR code di atas</li>
                                <li>4. Konfirmasi pembayaran</li>
                            </ol>
                        </div>
                        
                        {/* Status Check */}
                        <div className="w-full">
                            <TransactionStatusCheck 
                                transactionId={modalState.data?.transaction_id || null} 
                                koperasiId={koperasiId || null} 
                                onComplete={() => { 
                                    handleCloseModal(); 
                                    fetchInitialData(false); 
                                    setNotification({ 
                                        message: 'Setoran berhasil! Saldo Anda telah diperbarui.', 
                                        status: 'success' 
                                    });
                                }} 
                            />
                        </div>
                        
                        <Button variant="outline" className="w-full" onClick={handleCloseModal}>
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={modalState.type === 'status'} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Memeriksa Status Transaksi</DialogTitle></DialogHeader>
                    <TransactionStatusCheck 
                        transactionId={modalState.data?.transaction_id || null} 
                        koperasiId={koperasiId || null} 
                        onComplete={() => { 
                            handleCloseModal(); 
                            fetchInitialData(false); 
                        }} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- Status Check Component ---
const TransactionStatusCheck = ({ transactionId, koperasiId, onComplete }: { transactionId: string, koperasiId: string | null, onComplete: () => void }) => {
    const [status, setStatus] = useState('PENDING');

    const pollStatus = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/deposit/${transactionId}/status`);
            const currentStatus = res.data.saving_status;
            if (currentStatus === 'PAID' || currentStatus === 'FAILED') {
                setStatus(currentStatus);
                return true; // Stop polling
            }
        } catch (error) {
            console.error('Polling error:', error);
            setStatus('FAILED');
            return true; // Stop polling on error
        }
        return false; // Continue polling
    }, [transactionId, koperasiId]);

    useEffect(() => {
        if (!transactionId || !koperasiId) return;

        const interval = setInterval(async () => {
            const shouldStop = await pollStatus();
            if (shouldStop) {
                clearInterval(interval);
                setTimeout(onComplete, 2000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [transactionId, koperasiId, onComplete, pollStatus]);

    return (
        <div className="text-center p-8 flex flex-col items-center justify-center">
            {status === 'PENDING' && <Loader2 size={48} className="animate-spin text-yellow-500" />}
            {status === 'PAID' && <ArrowUpCircle size={48} className="text-green-500" />}
            {status === 'FAILED' && <XCircle size={48} className="text-red-500" />}
            <p className="mt-4 font-semibold text-lg">
                {status === 'PENDING' && 'Menunggu Pembayaran...'}
                {status === 'PAID' && 'Setoran Berhasil!'}
                {status === 'FAILED' && 'Setoran Gagal'}
            </p>
            <p className="text-sm text-gray-500">Halaman akan diperbarui secara otomatis.</p>
        </div>
    );
};

export default Simpanan;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';
import { formatRupiah } from '@/hooks/convertRupiah';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ShoppingCart, TrendingUp, ListChecks, Users, Package } from 'lucide-react';
import Notification from '@/components/Notification';

// --- Interfaces ---
interface ProductItem { id: number; product_name: string; quantity: number; total_price: string; }
interface Transaction { id: number; transaction_id: string; customer_name: string; total_amount: string; transaction_status: string; payment_method: string; created_at: string; }
interface MySale { id: number; transaction_id: string; created_at: string; merchant_total: number; merchant_items: ProductItem[]; }
interface Pagination { currentPage: string; totalPages: number; }
interface TransactionSummary { total_transactions: number; formatted_revenue: string; status_breakdown: { PAID: number; PENDING: number; };}
interface MySalesSummary { total_items_sold: number; total_revenue: string; total_transactions: number; formatted_revenue: string;}
type Summary = TransactionSummary | MySalesSummary | null;

// --- Helper Components ---

function isTransactionSummary(summary: Summary): summary is TransactionSummary { return (summary as TransactionSummary)?.status_breakdown !== undefined; }
function isMySalesSummary(summary: Summary): summary is MySalesSummary { return (summary as MySalesSummary)?.total_items_sold !== undefined; }

const StatCard = ({ title, value, subtitle, icon, color = 'orange' }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color?: string }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            <div className={`h-8 w-8 flex items-center justify-center rounded-full bg-${color}-100 text-${color}-500`}>{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </CardContent>
    </Card>
);

const SummarySkeleton = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-lg"></div>
        <div className="h-28 bg-gray-200 rounded-lg"></div>
        <div className="h-28 bg-gray-200 rounded-lg"></div>
    </div>
);

const TableSkeleton = ({ columns, rows = 5 }: { columns: number, rows?: number }) => (
    <Table>
        <TableHeader><TableRow>{[...Array(columns)].map((_, i) => <TableHead key={i}><div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div></TableHead>)}</TableRow></TableHeader>
        <TableBody>{[...Array(rows)].map((_, i) => <TableRow key={i}>{[...Array(columns)].map((_, j) => <TableCell key={j}><div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div></TableCell>)}</TableRow>)}</TableBody>
    </Table>
);

// --- Main Component ---
const RiwayatTransaksi: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId } = useAffiliation();

    const [activeTab, setActiveTab] = useState<'transactions' | 'my-sales'>('transactions');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [mySales, setMySales] = useState<MySale[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [summary, setSummary] = useState<Summary>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!koperasiId) return;
        const endpoint = activeTab === 'transactions' ? `/koperasi/${koperasiId}/history/transactions` : `/koperasi/${koperasiId}/history/my-sales`;
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                const response = await axiosInstance.get(endpoint, { params: { page: currentPage, limit: 20 } });
                if (activeTab === 'transactions') {
                    setTransactions(response.data.data || []);
                    setSummary(response.data.summary as TransactionSummary);
                } else {
                    setMySales(response.data.data || []);
                    setSummary(response.data.summary as MySalesSummary);
                }
                setPagination(response.data.pagination);
            } catch (err) { setError('Gagal memuat riwayat.'); console.error(err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [koperasiId, currentPage, activeTab]);
    
    useEffect(() => { setCurrentPage(1); setSummary(null); setPagination(null); }, [activeTab]);

    const renderTransactionContent = () => {
        if (loading && transactions.length === 0) return <TableSkeleton columns={6} />;
        if (transactions.length === 0) return <p className="text-sm text-center text-gray-500 py-8">Tidak ada riwayat transaksi.</p>;
        return (
            <Table>
                <TableHeader><TableRow><TableHead>ID Transaksi</TableHead><TableHead>Pelanggan</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Metode</TableHead><TableHead>Tanggal</TableHead></TableRow></TableHeader>
                <TableBody>{transactions.map((trx) => <TableRow key={trx.id}>
                    <TableCell className="font-medium">{trx.transaction_id}</TableCell>
                    <TableCell>{trx.customer_name}</TableCell>
                    <TableCell>{formatRupiah(trx.total_amount)}</TableCell>
                    <TableCell><span className={`px-2 py-1 text-xs font-semibold rounded-full ${trx.transaction_status === "PAID" ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{trx.transaction_status === "PAID" ? "Lunas" : "Tertunda"}</span></TableCell>
                    <TableCell>{trx.payment_method.startsWith('QRIS') ? 'QRIS' : trx.payment_method}</TableCell>
                    <TableCell>{new Date(trx.created_at).toLocaleDateString('id-ID')}</TableCell>
                </TableRow>)}</TableBody>
            </Table>
        );
    };

    const renderMySalesContent = () => {
         if (loading && mySales.length === 0) return <TableSkeleton columns={4} />;
        if (mySales.length === 0) return <p className="text-sm text-center text-gray-500 py-8">Tidak ada riwayat penjualan.</p>;
        return (
            <Table>
                <TableHeader><TableRow><TableHead>ID Transaksi</TableHead><TableHead>Tanggal</TableHead><TableHead>Jumlah Item</TableHead><TableHead>Total Penjualan</TableHead></TableRow></TableHeader>
                <TableBody>{mySales.map((sale) => <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.transaction_id}</TableCell>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{sale.merchant_items.length}</TableCell>
                    <TableCell>{formatRupiah(sale.merchant_total)}</TableCell>
                </TableRow>)}</TableBody>
            </Table>
        )
    }

    const renderSummary = () => {
        if (isTransactionSummary(summary)) {
            return (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="Total Transaksi" value={String(summary.total_transactions)} subtitle="Dari semua penjualan" icon={<ShoppingCart className="w-4 h-4"/>} />
                    <StatCard title="Total Pendapatan" value={summary.formatted_revenue} subtitle="Omzet dari semua transaksi" icon={<TrendingUp className="w-4 h-4"/>} color="green" />
                    <StatCard title="Rincian Status" value={`${summary.status_breakdown.PAID} Lunas`} subtitle={`${summary.status_breakdown.PENDING} Tertunda`} icon={<ListChecks className="w-4 h-4"/>} color="blue" />
                </div>
            )
        }
        if (isMySalesSummary(summary)) {
            return (
                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="Total Penjualan Saya" value={String(summary.total_transactions)} subtitle="Jumlah transaksi penjualan Anda" icon={<Users className="w-4 h-4"/>} />
                    <StatCard title="Total Barang Terjual" value={String(summary.total_items_sold)} subtitle="Dari semua penjualan Anda" icon={<Package className="w-4 h-4"/>} />
                    <StatCard title="Total Pendapatan" value={summary.formatted_revenue} subtitle="Omzet dari penjualan Anda" icon={<TrendingUp className="w-4 h-4"/>} color="green" />
                </div>
            )
        }
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
                <h1 className="text-xl font-bold">Riwayat Transaksi</h1>
            </header>

            <main className="p-4 lg:p-6 space-y-6">
                {loading && !summary ? <SummarySkeleton /> : renderSummary()}

                <Card className="shadow-sm">
                    <CardHeader className="p-0">
                        <div className="p-1 bg-gray-100 rounded-t-lg flex gap-1">
                            <button onClick={() => setActiveTab('transactions')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors ${activeTab === 'transactions' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>Semua Transaksi</button>
                            <button onClick={() => setActiveTab('my-sales')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors ${activeTab === 'my-sales' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>Penjualan Saya</button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activeTab === 'transactions' ? renderTransactionContent() : renderMySalesContent()}
                    </CardContent>
                    {pagination && pagination.totalPages > 1 && (
                        <CardContent>
                            <div className="flex justify-center items-center gap-4 pt-4 border-t">
                                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={Number(pagination.currentPage) === 1 || loading}>Sebelumnya</Button>
                                <span>Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                                <Button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={Number(pagination.currentPage) === pagination.totalPages || loading}>Berikutnya</Button>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default RiwayatTransaksi;

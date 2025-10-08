import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import { axiosInstance } from '@/hooks/axiosInstance';
import { convertRupiah } from '@/hooks/convertRupiah';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from 'lucide-react';
import Notification from '@/components/Notification';

// --- Interfaces ---
interface ProductItem {
    id: number;
    product_name: string;
    quantity: number;
    total_price: string;
}

interface Transaction {
  id: number;
  transaction_id: string;
  customer_name: string;
  total_amount: string;
  transaction_status: string;
  payment_method: string;
  created_at: string;
}

interface MySale {
    id: number;
    transaction_id: string;
    created_at: string;
    merchant_total: number;
    merchant_items: ProductItem[];
}

interface Pagination {
  currentPage: string;
  totalPages: number;
}

interface TransactionSummary {
  total_transactions: number;
  formatted_revenue: string;
  status_breakdown: {
    PAID: number;
    PENDING: number;
  };
}

interface MySalesSummary {
    total_items_sold: number;
    total_revenue: string;
    total_transactions: number;
    formatted_revenue: string;
}

type Summary = TransactionSummary | MySalesSummary | null;

// --- Helper Components ---

// Type Guards
function isTransactionSummary(summary: Summary): summary is TransactionSummary {
    return (summary as TransactionSummary)?.status_breakdown !== undefined;
}

function isMySalesSummary(summary: Summary): summary is MySalesSummary {
    return (summary as MySalesSummary)?.total_items_sold !== undefined;
}

const SummarySkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
            </Card>
        ))}
    </div>
);

const TableSkeleton = ({ columns, rows = 5 }: { columns: number, rows?: number }) => (
    <Table>
        <TableHeader>
            <TableRow>
                {[...Array(columns)].map((_, i) => (
                    <TableHead key={i}>
                        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {[...Array(rows)].map((_, i) => (
                <TableRow key={i}>
                    {[...Array(columns)].map((_, j) => (
                        <TableCell key={j}>
                            <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


// --- Main Component ---
const RiwayatTransaksi: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId } = useAffiliation();

    // States
    const [activeTab, setActiveTab] = useState<'transactions' | 'my-sales'>('transactions');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [mySales, setMySales] = useState<MySale[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [summary, setSummary] = useState<Summary>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (!koperasiId) return;

        const endpoint = activeTab === 'transactions' 
            ? `/koperasi/${koperasiId}/history/transactions` 
            : `/koperasi/${koperasiId}/history/my-sales`;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate network delay
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
            } catch (err) {
                setError('Gagal memuat riwayat.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [koperasiId, currentPage, activeTab]);
    
    // Reset page number when tab changes
    useEffect(() => {
        setCurrentPage(1);
        setSummary(null);
        setPagination(null);
    }, [activeTab]);


    const renderTransactionContent = () => {
        if (loading) {
            return <TableSkeleton columns={6} />;
        }
        if (transactions.length === 0) {
            return <p className="text-sm text-center text-gray-500 py-8">Tidak ada riwayat transaksi.</p>;
        }
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID Transaksi</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Tanggal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((trx) => (
                        <TableRow key={trx.id}>
                            <TableCell className="font-medium">{trx.transaction_id}</TableCell>
                            <TableCell>{trx.customer_name}</TableCell>
                            <TableCell>{convertRupiah(trx.total_amount)}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                                    trx.transaction_status === "PAID" 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {trx.transaction_status === "PAID" ? "Lunas" : "Tertunda"}
                                </span>
                            </TableCell>
                            <TableCell>{trx.payment_method}</TableCell>
                            <TableCell>{new Date(trx.created_at).toLocaleDateString('id-ID')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const renderMySalesContent = () => {
         if (loading) {
            return <TableSkeleton columns={4} />;
        }
        if (mySales.length === 0) {
            return <p className="text-sm text-center text-gray-500 py-8">Tidak ada riwayat penjualan.</p>;
        }
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah Item</TableHead>
                        <TableHead>Total Penjualan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mySales.map((sale) => (
                        <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.transaction_id}</TableCell>
                            <TableCell>{new Date(sale.created_at).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{sale.merchant_items.length}</TableCell>
                            <TableCell>{convertRupiah(sale.merchant_total)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    const renderSummary = () => {
        if (isTransactionSummary(summary)) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                        <CardHeader><CardTitle>Total Transaksi</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary.total_transactions}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Pendapatan</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary.formatted_revenue}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Rincian Status</CardTitle></CardHeader>
                        <CardContent>
                            <p>Lunas: {summary.status_breakdown.PAID}</p>
                            <p>Tertunda: {summary.status_breakdown.PENDING}</p>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        if (isMySalesSummary(summary)) {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                        <CardHeader><CardTitle>Total Penjualan</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary.total_transactions}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Barang Terjual</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary.total_items_sold}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Total Pendapatan</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold">{summary.formatted_revenue}</p></CardContent>
                    </Card>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="pb-28 bg-gray-50 min-h-screen font-sans">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
                <h1 className="text-xl font-bold truncate">Riwayat Transaksi</h1>
            </header>

            <main className="p-4">
                {loading && !summary ? <SummarySkeleton /> : renderSummary()}

                <Card>
                    <CardHeader className="p-0">
                        <div className="flex border-b">
                            <button 
                                className={`flex-1 p-3 font-semibold text-center ${activeTab === 'transactions' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('transactions')}
                            >
                                Semua Transaksi
                            </button>
                            <button 
                                className={`flex-1 p-3 font-semibold text-center ${activeTab === 'my-sales' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('my-sales')}
                            >
                                Penjualan Saya
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activeTab === 'transactions' ? renderTransactionContent() : renderMySalesContent()}
                    </CardContent>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 p-4 border-t">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Sebelumnya</Button>
                            <span>Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                            <Button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={Number(pagination.currentPage) === pagination.totalPages || loading}>Berikutnya</Button>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default RiwayatTransaksi;
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, QrCode, Clock, CheckCircle } from 'lucide-react';
import Notification from '@/components/Notification';

const QRPayment: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [qrCode, setQrCode] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [status, setStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'>('PENDING');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get data from navigation state or fetch from API
        if (location.state) {
            setQrCode(location.state.qrCode);
            setAmount(location.state.amount);
        } else if (transactionId) {
            fetchTransactionData();
        }
    }, [location.state, transactionId]);

    useEffect(() => {
        if (status === 'PENDING' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && status === 'PENDING') {
            setStatus('EXPIRED');
        }
    }, [timeLeft, status]);

    const fetchTransactionData = async () => {
        if (!transactionId) return;

        try {
            const response = await axiosInstance.get(`/checkout-anggota/${transactionId}`);
            if (response.data.success) {
                const data = response.data.data;
                setStatus(data.status);
                setAmount(data.total_amount);
                // Note: QR code might not be available in status check
            }
        } catch (error: any) {
            setError('Gagal memuat data transaksi');
        }
    };

    const checkPaymentStatus = async () => {
        if (!transactionId) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/checkout-anggota/${transactionId}`);
            if (response.data.success) {
                const newStatus = response.data.data.status;
                setStatus(newStatus);

                if (newStatus === 'PAID') {
                    // Payment successful
                    setTimeout(() => {
                        navigate('/dashboard', {
                            state: { message: 'Pembayaran berhasil!', status: 'success' }
                        });
                    }, 2000);
                }
            }
        } catch (error: any) {
            setError('Gagal memeriksa status pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatRupiah = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (status === 'PAID') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-green-600 mb-2">Pembayaran Berhasil!</h2>
                        <p className="text-gray-600 mb-4">Transaksi Anda telah berhasil diproses</p>
                        <Button onClick={() => navigate('/dashboard')} className="w-full">
                            Kembali ke Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'EXPIRED') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Pembayaran Kadaluarsa</h2>
                        <p className="text-gray-600 mb-4">Waktu pembayaran telah habis</p>
                        <Button onClick={() => navigate(-1)} variant="outline" className="w-full mr-2">
                            Kembali
                        </Button>
                        <Button onClick={() => navigate('/katalog')} className="w-full">
                            Buat Pesanan Baru
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}

            <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-bold">Pembayaran QRIS</h1>
            </header>

            <div className="p-4">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Scan QR Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {qrCode && (
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                                    <img
                                        src={`data:image/png;base64,${qrCode}`}
                                        alt="QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold">{formatRupiah(amount)}</p>
                            <p className="text-sm text-gray-600">Transaction ID: {transactionId}</p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-orange-600 font-medium">
                                <Clock className="w-4 h-4" />
                                <span>Waktu tersisa: {formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={checkPaymentStatus}
                                disabled={loading}
                                className="w-full"
                                variant="outline"
                            >
                                {loading ? 'Memeriksa...' : 'Periksa Status Pembayaran'}
                            </Button>

                            <p className="text-xs text-gray-500 text-center">
                                Scan QR code dengan aplikasi e-wallet Anda
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default QRPayment;
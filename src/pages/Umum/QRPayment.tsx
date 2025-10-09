import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, QrCode, Clock, CheckCircle } from 'lucide-react';
import Notification from '@/components/Notification';

const QRPayment: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [qrCode, setQrCode] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);
    const [status, setStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'>('PENDING');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get data from navigation state
        if (location.state) {
            setQrCode(location.state.qrCode);
            setOrderId(location.state.orderId);
            setAmount(location.state.amount);
        }
    }, [location.state]);

    // Auto-polling untuk cek status payment setiap 5 detik
    useEffect(() => {
        if (!orderId || status !== 'PENDING') return;

        const pollInterval = setInterval(() => {
            checkPaymentStatus();
        }, 5000); // Poll setiap 5 detik

        // Initial check
        checkPaymentStatus();

        return () => clearInterval(pollInterval);
    }, [orderId, status]);

    useEffect(() => {
        if (status === 'PENDING' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && status === 'PENDING') {
            setStatus('EXPIRED');
        }
    }, [timeLeft, status]);

    const checkPaymentStatus = async () => {
        if (!orderId) return;

        setLoading(true);
        try {
            // Endpoint yang benar untuk umum checkout
            const response = await axiosInstance.get(`/umum-checkout/koperasi-catalog/${orderId}`);
            if (response.data.success) {
                const paymentStatus = response.data.data.payment_status;
                
                // Update status based on payment_status
                if (paymentStatus === 'PAID') {
                    setStatus('PAID');
                    // Payment successful
                    setTimeout(() => {
                        navigate('/umum/pilih-koperasi', {
                            state: { message: 'Pembayaran berhasil!', status: 'success' }
                        });
                    }, 2000);
                } else if (paymentStatus === 'FAILED') {
                    setStatus('FAILED');
                } else {
                    setStatus('PENDING');
                }
            }
        } catch (error: any) {
            setError('Gagal memeriksa status pembayaran');
            console.error(error);
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
                        <Button onClick={() => navigate('/umum/pilih-koperasi')} className="w-full">
                            Kembali ke Pilih Koperasi
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
                        <Button onClick={() => navigate('/umum/pilih-koperasi')} className="w-full">
                            Pilih Koperasi Lain
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
                            <p className="text-sm text-gray-600">Order ID: {orderId}</p>
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
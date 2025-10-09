import React, { useEffect, useState } from 'react';
import { useCountdown } from '@/hooks/useCountdow                <QRCode
                  value={qrCode}
                  size={200}
                  level="M"
                  className="mx-auto"
                />port { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import axiosInstance from '@/hooks/axiosInstance';
import { formatRupiah } from '@/hooks/convertRupiah';
import QRCode from "react-qr-code";

interface QRISPaymentModalProps {
  qrCode: string;
  amount: number;
  onCancel: () => void;
  orderId: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaymentStatusResponse {
  status: string;
}

export const QRISPaymentModal: React.FC<QRISPaymentModalProps> = ({
  qrCode,
  amount,
  onCancel,
  orderId
}) => {
  const [timeLeft, { minutes, seconds }] = useCountdown(900); // 15 minutes timeout to match backend
  const [status, setStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      try {
        // Using main STIQR endpoint for status checking
        const response = await axiosInstance.get<ApiResponse<PaymentStatusResponse>>(`/checkout/koperasi-status/${orderId}`);

        if (response.data.success && response.data.data) {
          const paymentStatus = response.data.data.status;

          if (paymentStatus === 'PAID') {
            setStatus('success');
            alert('Pembayaran Berhasil! QRIS payment telah diterima');
            clearInterval(pollInterval);
            setTimeout(() => {
              onCancel();
            }, 2000);
          } else if (paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') {
            setStatus('failed');
            alert('Pembayaran gagal atau expired');
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Start polling every 3 seconds
    pollInterval = setInterval(checkPaymentStatus, 3000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (status === 'waiting') {
        setStatus('failed');
        alert('Pembayaran Kadaluarsa. Batas waktu pembayaran QRIS telah habis');
      }
    }, 600000); // 10 minutes

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [orderId, onCancel]);

  // Stop countdown when payment complete
  useEffect(() => {
    if (status !== 'waiting') {
      timeLeft.stop();
    }
  }, [status, timeLeft]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'waiting' ? 'Scan QRIS untuk Membayar' :
             status === 'success' ? 'Pembayaran Berhasil!' :
             'Pembayaran Gagal'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'waiting' && (
            <>
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCode
                  value={qrCode}
                  size={240}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-orange-600">
                  {formatRupiah(amount)}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Waktu tersisa: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold text-green-600">
                Pembayaran telah diterima
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-semibold text-red-600">
                Pembayaran gagal diproses
              </p>
            </div>
          )}

          <div className="flex justify-center space-x-2">
            {status === 'waiting' ? (
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-8"
              >
                Batalkan
              </Button>
            ) : (
              <Button
                onClick={onCancel}
                className={status === 'success' ?
                  'bg-green-500 hover:bg-green-600 text-white' :
                  'bg-gray-500 hover:bg-gray-600 text-white'
                }
              >
                {status === 'success' ? 'Selesai' : 'Tutup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

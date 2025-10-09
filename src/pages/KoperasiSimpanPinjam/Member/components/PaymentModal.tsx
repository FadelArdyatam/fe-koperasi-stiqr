import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode.react';
import axiosInstance from '@/hooks/axiosInstance';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  savingType: string;
  koperasiId: string;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  savingType,
  koperasiId,
  onSuccess
}) => {
  const [method, setMethod] = useState<'QRIS_NOBU' | 'SALDO_NON_CASH'>('QRIS_NOBU');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (transactionId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await axiosInstance.get(
            `/koperasi-simpan-pinjam/${koperasiId}/payment-status/${transactionId}`
          );
          
          if (response.data.status === 'PAID') {
            clearInterval(pollInterval);
            onSuccess();
            onClose();
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(pollInterval);
    }
  }, [transactionId, koperasiId]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        `/koperasi-simpan-pinjam/${koperasiId}/payment`,
        {
          amount,
          savingType,
          paymentMethod: method
        }
      );

      if (method === 'QRIS_NOBU') {
        setQrCode(response.data.qrisUrl);
        setTransactionId(response.data.transactionId);
      } else {
        // For SALDO_NON_CASH, payment is processed immediately
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pembayaran Simpanan {savingType}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4",
                method === 'QRIS_NOBU' && "border-primary"
              )}
              onClick={() => setMethod('QRIS_NOBU')}
            >
              <QrCode size={24} />
              <span>QRIS</span>
            </Button>

            <Button
              variant="outline"
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4",
                method === 'SALDO_NON_CASH' && "border-primary"
              )}
              onClick={() => setMethod('SALDO_NON_CASH')}
            >
              <Wallet size={24} />
              <span>Saldo</span>
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          {qrCode && method === 'QRIS_NOBU' ? (
            <div className="flex flex-col items-center gap-4">
              <QRCode value={qrCode} size={200} />
              <p className="text-sm text-gray-500">
                Scan QR code untuk melakukan pembayaran
              </p>
            </div>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Memproses...' : 'Bayar'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
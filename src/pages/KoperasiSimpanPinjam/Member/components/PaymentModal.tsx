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
  const [pin, setPin] = useState('');
  const [userBalance, setUserBalance] = useState<{ non_cash_amount: number } | null>(null);

  // Fetch user balance when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchBalance = async () => {
        try {
          const response = await axiosInstance.get('/balance');
          setUserBalance(response.data.data || response.data);
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      };
      fetchBalance();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transactionId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await axiosInstance.get(
            `/koperasi-simpan-pinjam/${koperasiId}/transaction/${transactionId}/status`
          );
          
          if (response.data.status === 'PAID' || response.data.transaction_status === 'PAID') {
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

      // Validate PIN for SALDO_NON_CASH payment
      if (method === 'SALDO_NON_CASH') {
        if (!pin) {
          setError('PIN diperlukan untuk pembayaran dengan saldo');
          return;
        }

        if (!userBalance) {
          setError('Tidak dapat memuat informasi saldo');
          return;
        }

        if (amount > userBalance.non_cash_amount) {
          setError(`Saldo tidak mencukupi. Saldo Anda: ${userBalance.non_cash_amount.toLocaleString('id-ID')}`);
          return;
        }
      }

      // Get member ID first
      const memberRes = await axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/my-member-id`);
      const memberId = memberRes.data.member_id;

      if (!memberId) {
        setError('Anda belum terdaftar sebagai anggota koperasi ini');
        return;
      }

      const response = await axiosInstance.post(
        `/koperasi-simpan-pinjam/${koperasiId}/deposit`,
        {
          member_id: memberId,
          type: savingType,
          amount,
          method,
          pin: method === 'SALDO_NON_CASH' ? pin : undefined
        }
      );

      if (method === 'QRIS_NOBU') {
        if (!response.data.qrCode) {
          throw new Error('QR Code tidak tersedia dari NOBU');
        }
        setQrCode(response.data.qrCode);
        setTransactionId(response.data.transaction_id);
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
              <div className="bg-white p-4 rounded-lg">
                <QrCode value={qrCode} size={200} level="H" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  Scan QR code menggunakan aplikasi e-wallet yang mendukung QRIS
                </p>
                <p className="text-sm font-medium">
                  Total Pembayaran: Rp {amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {method === 'SALDO_NON_CASH' && (
                <>
                  <div className="text-sm text-gray-500 text-center">
                    Saldo Non-Cash Tersedia: Rp {userBalance?.non_cash_amount?.toLocaleString('id-ID') || 0}
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN (6 digit)"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </>
              )}
              <Button
                onClick={handlePayment}
                disabled={loading || (method === 'SALDO_NON_CASH' && (!pin || pin.length !== 6))}
                className="w-full"
              >
                {loading ? 'Memproses...' : 'Bayar'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

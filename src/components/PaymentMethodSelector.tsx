import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Wallet } from 'lucide-react';

interface PaymentMethodSelectorProps {
    onSelectMethod: (method: 'QRIS' | 'SALDO_NON_CASH', pin?: string) => void;
    onCancel: () => void;
    totalAmount: number;
    loading?: boolean;
    availableMethods?: ('QRIS' | 'SALDO_NON_CASH')[];
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    onSelectMethod,
    onCancel,
    totalAmount,
    loading = false,
    availableMethods = ['QRIS', 'SALDO_NON_CASH']
}) => {
    const [selectedMethod, setSelectedMethod] = useState<'QRIS' | 'SALDO_NON_CASH' | null>(null);
    const [pin, setPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);

    const formatRupiah = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleMethodSelect = (method: 'QRIS' | 'SALDO_NON_CASH') => {
        setSelectedMethod(method);
        if (method === 'SALDO_NON_CASH') {
            setShowPinInput(true);
        } else {
            setShowPinInput(false);
        }
    };

    const handleConfirm = () => {
        if (selectedMethod === 'SALDO_NON_CASH' && !pin) {
            alert('PIN diperlukan untuk pembayaran dengan saldo');
            return;
        }
        onSelectMethod(selectedMethod!, selectedMethod === 'SALDO_NON_CASH' ? pin : undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="text-center">Pilih Metode Pembayaran</CardTitle>
                    <p className="text-center text-lg font-semibold text-orange-600">
                        {formatRupiah(totalAmount)}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* QRIS Payment Option */}
                    {availableMethods.includes('QRIS') && (
                        <div
                            onClick={() => handleMethodSelect('QRIS')}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedMethod === 'QRIS'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-6 h-6 text-orange-500" />
                                <div>
                                    <h3 className="font-semibold">QRIS</h3>
                                    <p className="text-sm text-gray-600">Bayar dengan QR code via e-wallet</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Saldo Payment Option */}
                    {availableMethods.includes('SALDO_NON_CASH') && (
                        <div
                            onClick={() => handleMethodSelect('SALDO_NON_CASH')}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedMethod === 'SALDO_NON_CASH'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Wallet className="w-6 h-6 text-green-500" />
                                <div>
                                    <h3 className="font-semibold">Saldo Non-Tunai</h3>
                                    <p className="text-sm text-gray-600">Bayar dengan saldo koperasi</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PIN Input for Saldo */}
                    {showPinInput && (
                        <div className="space-y-2">
                            <Label htmlFor="pin">Masukkan PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                placeholder="Enter PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            disabled={!selectedMethod || loading || (selectedMethod === 'SALDO_NON_CASH' && !pin)}
                        >
                            {loading ? 'Memproses...' : 'Bayar'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentMethodSelector;
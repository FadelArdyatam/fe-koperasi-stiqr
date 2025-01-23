import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface PaymentMethodProps {
    dataPayment: any;
    setShowPaymentMethodComponent: React.Dispatch<React.SetStateAction<boolean>>;
    selectedMethod: string | null;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ dataPayment, setShowPaymentMethodComponent, selectedMethod }) => {
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");
    const [change, setChange] = useState(0);

    const handlePaymentSubmit = () => {
        const amount = parseInt(paymentAmount.replace(/\D/g, "")); // Hapus karakter non-digit

        // Validasi input
        if (isNaN(amount) || amount <= 0) {
            setErrorMessage("Nominal pembayaran harus lebih dari 0.");
            return;
        }

        if (amount < dataPayment.amount) {
            setErrorMessage("Nominal pembayaran tidak boleh kurang dari total tagihan.");
            return;
        }

        // Reset error dan lanjutkan proses
        setErrorMessage("");
        setChange(amount - dataPayment.amount);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Hanya angka
        setPaymentAmount(value); // Simpan angka mentah tanpa "Rp"
    };

    return (
        <div className="flex w-full flex-col min-h-screen items-center bg-orange-50">
            {/* Header */}
            <div className={`p-5 w-full bg-white`}>
                <div className="w-full flex items-center gap-5 justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowPaymentMethodComponent(false)}><ArrowLeft /></button>

                        <p className="font-semibold text-2xl">{selectedMethod}</p>
                    </div>
                </div>
            </div>

            {/* Total Tagihan */}
            <div className="w-[90%] flex justify-between p-5 items-center bg-white gap-5 mt-5 shadow-lg rounded-md">
                <div>
                    <p className="font-semibold text-lg text-gray-500">Total Tagihan</p>

                    <p className="font-semibold text-2xl">{formatRupiah(dataPayment.amount)}</p>
                </div>

                <Button className="bg-orange-200 text-orange-500 rounded-full">Lihat Detail</Button>
            </div>

            {/* Input Nominal Pembayaran */}
            <div className="w-[90%] flex flex-col mt-5">
                <p className="font-semibold text-lg">Nominal Pembayaran</p>

                <div className="relative mt-2">
                    {/* Label "Rp" */}
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">Rp</span>

                    <input
                        type="text"
                        placeholder="0"
                        value={paymentAmount}
                        onChange={handleInputChange}
                        className="pl-10 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>

                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

                <Button className="bg-orange-200 text-orange-500 rounded-full w-max mt-5" onClick={() => setPaymentAmount(dataPayment.amount)}>Uang Pas</Button>
            </div>

            {/* Tombol Proses Pembayaran */}
            <div className="w-full fixed bottom-0 p-5 bg-white flex flex-col gap-5 justify-end mt-5">
                <div className="flex items-center gap-5 justify-between">
                    <p>kembalian</p>

                    <p className="font-semibold text-lg">{formatRupiah(change)}</p>
                </div>

                <Button
                    onClick={handlePaymentSubmit}
                    className="bg-orange-500 w-full text-white px-5 py-2 rounded-md hover:bg-orange-600"
                >
                    Proses Pembayaran
                </Button>
            </div>
        </div>
    );
};

export default PaymentMethod;

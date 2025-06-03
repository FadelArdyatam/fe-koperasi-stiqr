import Notification from "@/components/Notification";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PaymentMethodProps {
    dataPayment: any;
    setShowPaymentMethodComponent: React.Dispatch<React.SetStateAction<boolean>>;
    selectedMethod: string | null;
    orderId: string | null | undefined;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ dataPayment, setShowPaymentMethodComponent, selectedMethod, orderId }) => {
    console.log('MUNCULLLLLL')
    const [paymentAmount, setPaymentAmount] = useState<string>(""); // Nominal pembayaran
    const [errorMessage, setErrorMessage] = useState(""); // Pesan error
    const [change, setChange] = useState(0); // Kembalian
    const [showNotification, setShowNotification] = useState(false); // Tampilkan notifikasi
    const [loading, setLoading] = useState(false); // Loading

    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Hanya angka
        const amount = parseInt(value || "0", 10); // Konversi ke integer (default 0 jika kosong)

        setPaymentAmount(value); // Update nominal pembayaran

        if (amount < dataPayment.amount) {
            setErrorMessage("Nominal pembayaran tidak boleh kurang dari total tagihan.");
            setChange(0);
        } else {
            setErrorMessage("");
            setChange(amount - dataPayment.amount);
        }
    };

    const paymentHandler = async () => {
        if (change < 0) {
            setErrorMessage("Nominal pembayaran tidak boleh kurang dari total tagihan.");
            return;
        }

        try {
            setLoading(true);

            const response = await axiosInstance.post("/sales/other-payment", {
                sales_id: dataPayment.sales_id,
                paymentType: selectedMethod,
                pay_amount: paymentAmount,
            });

            console.log("Response other payment:", response);

            // setShowNotification(true);

            navigate('/payment-success', {
                state: {
                    orderId: orderId ?? "dummy-order-id",
                    amount: dataPayment.amount ?? 0,
                },
            });

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
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
            </div>

            {/* Input Nominal Pembayaran */}
            <div className="w-[90%] flex flex-col mt-5">
                <p className="font-semibold text-lg">Nominal Pembayaran</p>
                <div className="relative mt-2">
                    <input
                        type="text"
                        placeholder="0"
                        value={formatRupiah(paymentAmount)}
                        onChange={handleInputChange}
                        maxLength={15}
                        className="p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                <Button
                    className="bg-orange-200 text-orange-500 rounded-full w-max mt-5"
                    onClick={() => { setPaymentAmount(dataPayment.amount.toString()); setErrorMessage("") }}
                >
                    Uang Pas
                </Button>
            </div>

            {/* Tombol Proses Pembayaran */}
            <div className="w-full fixed bottom-0 p-5 bg-white flex flex-col gap-5 justify-end mt-5">
                <div className="flex items-center gap-5 justify-between">
                    <p>Kembalian</p>
                    <p className="font-semibold text-lg">{formatRupiah(change)}</p>
                </div>
                <Button
                    disabled={paymentAmount === "" || parseInt(paymentAmount) < dataPayment.amount || loading}
                    onClick={paymentHandler}
                    className="bg-orange-500 w-full text-white px-5 py-2 rounded-md hover:bg-orange-600"
                >
                    Proses Pembayaran
                </Button>
            </div>

            {/* Notifikasi */}
            {showNotification && <Notification message="Pembayaran Berhasil" onClose={() => { setShowNotification(false); navigate("/dashboard") }} status="success" />}
        </div>
    );
};

export default PaymentMethod;
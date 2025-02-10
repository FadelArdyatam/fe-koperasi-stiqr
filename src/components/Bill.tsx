import React, { useState } from 'react';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from './Notification';
import { formatRupiah } from '@/hooks/convertRupiah';

interface BillProps {
    data: {
        inquiryId: any;
        productCode: any;
        phoneNumber: any;
        product: string;
        amount: string;
        date: string;
        time: string;
    };
    marginTop?: boolean;
}

const Bill: React.FC<BillProps> = ({ data, marginTop }) => {
    const [showPinInput, setShowPinInput] = useState(false);
    const [pin, setPin] = useState<string[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleNumberClick = (number: string) => {
        if (pin.length < 6) {
            setPin([...pin, number]); // Tambahkan angka ke PIN
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1)); // Hapus angka terakhir dari PIN
    };

    const handleSubmitPin = async () => {
        // const savedPin = localStorage.getItem("userPin"); // Ambil PIN yang disimpan

        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        console.log("data from bill: ", data)

        try {
            // Mengirim request ke endpoint /payment
            const response = await axiosInstance.post("/ayoconnect/payment", {
                accountNumber: data.phoneNumber,
                productCode: data.productCode,
                inquiryId: data.inquiryId,
                amount: data.amount,
                merchant_id: userData.merchant.id,
                pin: pin.join(''),
            });

            console.log("Payment Response:", response.data);

            // Tampilkan notifikasi sukses setelah API call berhasil
            setShowNotification(true);
        } catch (error: any) {
            console.error("Error saat melakukan pembayaran:", error);

            // Tampilkan notifikasi error
            setError(error.response?.data?.message || "Terjadi kesalahan saat proses pembayaran.");
        }

        setShowPinInput(false);
        setPin([]); // Reset PIN
    };

    const backToHomeHandler = () => {
        setShowNotification(false);
        navigate('/dashboard');
    };

    return (
        <>
            {/* Komponen Detail Tagihan */}
            <div className={`${marginTop ? 'mt-[130px]' : 'mt-[-90px] bg-white'} w-[90%] m-auto shadow-lg p-10 rounded-lg`}>
                <div className='w-16 h-16 flex items-center justify-center border-2 border-black bg-orange-400 rounded-full m-auto'>
                    <Check className='scale-[2] text-white' />
                </div>

                <p className='font-semibold text-xl text-center text-orange-400 uppercase mt-7'>Detail Tagihan</p>

                <div className='mt-10 w-full'>
                    <p className='font-medium'>Produk Yang Dibeli</p>

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-start gap-5 justify-between'>
                        <div>
                            <p>{data.product}</p>
                            <p className='text-sm text-gray-400 mt-2'>1 x {formatRupiah(data.amount)}</p>
                        </div>
                        <p>{formatRupiah(data.amount)}</p>
                    </div>

                    <div className='mt-10 flex items-center gap-5 justify-between'>
                        <p>Total Belanja</p>
                        <p>{formatRupiah(data.amount)}</p>
                    </div>

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-center gap-5 justify-between'>
                        <p>Total Bayar</p>
                        <p className='text-orange-400'>{formatRupiah(data.amount)}</p>
                    </div>

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-center gap-5 justify-between'>
                        <p>Date:</p>
                        <p>{data.date} | {data.time}</p>
                    </div>
                </div>
            </div>

            {/* Tombol Bayar */}
            <Button onClick={() => setShowPinInput(true)} className='uppercase translate-y-10 block text-center w-[90%] m-auto bg-green-500 mb-32 text-white'>
                Bayar
            </Button>

            {/* Komponen Input PIN */}
            {showPinInput && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] p-6 rounded-lg">
                        <h2 className="text-xl font-semibold text-center mb-4">Masukkan PIN Anda</h2>

                        {/* PIN Indicator */}
                        <div className="flex justify-center mb-6">
                            {[...Array(6)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-4 h-4 mx-1 rounded-full ${pin[index] ? 'bg-green-500' : 'bg-gray-300'}`}
                                ></div>
                            ))}
                        </div>

                        {/* Number Pad */}
                        <div className="grid grid-cols-3 gap-5 mb-5 max-w-[400px] mx-auto">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((number) => (
                                <button
                                    key={number}
                                    onClick={() => handleNumberClick(number)}
                                    className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
                                >
                                    {number}
                                </button>
                            ))}
                            <div></div>
                            <button
                                onClick={() => handleNumberClick("0")}
                                className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
                            >
                                0
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-400 text-white text-xl font-bold"
                            >
                                ⌫
                            </button>
                        </div>

                        <div className="flex justify-between">
                            <Button
                                onClick={() => setShowPinInput(false)}
                                className="w-full mr-2 bg-gray-400 text-white"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSubmitPin}
                                className="w-full ml-2 bg-green-500 text-white"
                                disabled={pin.length !== 6}
                            >
                                Konfirmasi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifikasi Error */}
            {error && <Notification onClose={() => setError("")} message={error} status="error" />}

            {/* Notifikasi Sukses */}
            <div className={`${showNotification ? 'flex' : 'hidden'} fixed items-center justify-center top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50`}>
                <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5">
                    <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                        <Check />
                    </div>

                    <p className="font-semibold text-xl">Terimakasih</p>

                    <p className='text-base'>Transaksi pembayaran Anda Berhasil.</p>

                    <Button onClick={backToHomeHandler} className="w-full">Back To Home</Button>
                </div>
            </div>
        </>
    );
};

export default Bill;

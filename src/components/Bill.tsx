import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Info } from 'lucide-react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from './Notification';
import { formatRupiah } from '@/hooks/convertRupiah';
import InprogressPPOB from './InprogressPPOB';
import QRCodePage from '@/pages/QRCode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


interface BillProps {
    data: any;
    marginTop: boolean;
    marginFee?: any
}

const Bill: React.FC<BillProps> = ({ data, marginTop, marginFee = 0 }) => {
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const [showPinInput, setShowPinInput] = useState(false);
    const [pin, setPin] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isPersonal, setIsPersonal] = useState(false)
    const [showInproggresStep, setShowInproggresStep] = useState(false)
    console.log(isPersonal);
    const [refNumber, setRefnumber] = useState<string>("")
    const [total, setTotal] = useState(0);
    useEffect(() => {
        setTotal(data.amount)
    }, []);

    const handleNumberClick = (number: string) => {
        if (pin.length < 6) {
            setPin([...pin, number]);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [stringQR, setStringQR] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300);
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState<string | null>(null)
    const validatePinBalance = async (merchant_id: string, pin: number | string, amount: number) => {
        try {
            const response = await axiosInstance.post('/ayoconnect/check-pin', {
                merchant_id,
                pin,
                amount,
            });
            return response.data; // optional return
        } catch (error: any) {
            // Melempar error agar bisa ditangani di tempat lain (misalnya di handlePaymentQris)
            throw error;
        }
    };
    const handlePaymentQris = async (orderIdQris: string) => {
        setLoading(true);
        setError("");

        try {
            const amountToPay = total + Number(marginFee);

            // Validasi PIN dan saldo
            await validatePinBalance(userData.merchant.id, pin.join(''), amountToPay);

            // Jika berhasil, lanjut ke payment
            const requestBody = {
                email: userData.email,
                firstName: userData.merchant.name,
                lastName: userData.username,
                mobilePhone: userData.phone_number.replace(/^08/, '+628'),
                amount: amountToPay,
                description: "Pembayaran Pesanan",
                successUrl: "http://success",
                type: "qris",
                orderId: orderIdQris,
            };

            const response = await axiosInstance.post(`/finpay/initiate`, requestBody);

            if (response.data?.response?.stringQr) {
                setStringQR(response.data.response.stringQr);
                setShowQRCode(true);

                const timer = setInterval(() => {
                    setTimeLeft(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(timer);
                            navigate("/dashboard");
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
            }
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message;
                setError(message || "Gagal Melakukan Pembayaran");
            } else {
                setError("Terjadi kesalahan yang tidak diketahui");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleSubmitPin = async () => {
        try {
            setLoading(true);
            setShowPinInput(false)

            const payload: any = {
                accountNumber: data.accountNumber,
                productCode: data.productCode,
                inquiryId: data.inquiryId,
                amount: total,
                merchant_id: userData.merchant.id,
                pin: pin.join(''),
                margin: marginFee,
                metode: paymentMethod,
                is_personal: isPersonal,
            }

            if (data.category === "BPJS") {
                payload.month = data.month; // Menambahkan properti ke payload yang sudah ada
            }

            if (paymentMethod == 'qris') {
                const generateRandomString = (length = 10) => {
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
                };
                const generateOrderId = `P${generateRandomString(8)}_${data.inquiryId}`;
                setOrderId(generateOrderId)
                handlePaymentQris(generateOrderId)
            } else if (paymentMethod == 'tunai') {
                const response = await axiosInstance.post("/ayoconnect/payment", payload);
                if (response.data.success) {
                    setLoading(false);
                    setShowInproggresStep(true)
                    setRefnumber(response.data.data.refNumber)
                } else {
                    setShowInproggresStep(false)
                    setError(response.data.message || "Pembayaran gagal, silahkan coba lagi nanti.");
                }
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Terjadi kesalahan saat proses pembayaran.");
            setShowInproggresStep(false)
        }

        setShowPinInput(false);
        setPin([]);
    };
    return (
        <>
            <div className={`${marginTop ? 'mt-[130px]' : 'mt-[-90px] bg-white'} ${(showInproggresStep || showQRCode) ? 'hidden' : 'block'} w-[90%] m-auto shadow-lg p-10 rounded-lg`}>
                <div className='w-16 h-16 flex items-center justify-center border-2 border-black bg-orange-400 rounded-full m-auto'>
                    <Info className='scale-[2] text-white' />
                </div>

                <p className='font-semibold text-xl text-center text-orange-400 uppercase mt-7'>Detail Tagihan</p>

                <div className='mt-10 w-full'>

                    {
                        data.category !== 'Pulsa' && data.category !== 'Paket Data' && (
                            <div>
                                <p className="font-bold text-xl">Detail Pelanggan</p>
                                <div className="w-full my-2 h-[2px] bg-gray-200"></div>

                                {data.customerDetails && data.customerDetails.length > 0 &&
                                    data.customerDetails.map((detail: any, index: number) => (
                                        <div key={index} className="flex justify-between gap-5 mt-5">
                                            <p>{detail.key}</p>
                                            <p>{detail.value}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }

                    <p className="font-bold text-xl mt-5">Detail Tagihan</p>
                    <div className="w-full my-2 h-[2px] bg-gray-200"></div>
                    {
                        (data.category == 'Pulsa' || data.category == 'Paket Data') && (
                            <div>
                                <div className='flex items-start gap-5 justify-between mt-5'>
                                    <p>Nomor HP Pengguna</p>
                                    <p>{data.accountNumber}</p>
                                </div>
                            </div>
                        )
                    }
                    <div className='flex items-start gap-5 justify-between mt-5'>
                        <div>
                            <p>{data.productName}</p>
                            <p className={`text-sm text-gray-400 mt-2 ${data.category == 'Pulsa' || data.category == 'Paket Data' ? 'block' : 'hidden'} `}>1 x {formatRupiah(data.amount)}</p>
                        </div>
                        <p className={`${data.category == 'Pulsa' || data.category == 'Paket Data' ? 'block' : 'hidden'}`}>{formatRupiah(data.amount)}</p>
                    </div>

                    {
                        data.category !== 'Pulsa' && data.category !== 'Paket Data' && data.billDetails.length > 0 && (
                            <div>
                                {data.billDetails.map((bill: any, index: number) => (
                                    <div key={index} className="flex flex-col gap-5 mt-5">
                                        <div className='flex justify-between'>
                                            <p className="font-semibold">{bill.key}</p>
                                            <p className="font-semibold">{formatRupiah(bill.value)}</p>
                                        </div>

                                        {bill.billInfo && bill.billInfo.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {bill.billInfo.map((detail: any, i: number) => (
                                                    <div key={i} className="flex justify-between">
                                                        <p>{detail.key}</p>
                                                        <p>
                                                            {
                                                                /^\d+$/.test(detail.value) // Cek apakah hanya angka (tanpa huruf/simbol)
                                                                    ? formatRupiah(detail.value)  // Format ke Rupiah jika angka
                                                                    : detail.value  // Jika ada huruf, tampilkan apa adanya
                                                            }
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {
                        (data.category != 'Pulsa' && data.category != 'Paket Data') && (
                            <div className='mt-5 flex items-center gap-5 justify-between font-semibold'>
                                <p>Biaya Penanganan</p>
                                <p>{formatRupiah(data.processingFee)}</p>
                            </div>
                        )
                    }

                    <div className='mt-5 flex items-center gap-5 justify-between font-semibold'>
                        <p>Biaya Layanan</p>
                        <p>{formatRupiah(Number(marginFee))}</p>
                    </div>

                    {/* {
                        (data.category != 'Pulsa' && data.category != 'Paket Data') && (
                            <div className='mt-5 flex items-center gap-5 justify-between font-semibold'>
                                <p>Total Belanja</p>
                                <p>{formatRupiah(amount + Number(marginFee))}</p>
                            </div>
                        )
                    } */}

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-center gap-5 justify-between'>
                        <p className='font-bold'>Total Bayar</p>
                        <p className='text-orange-400 font-bold'>{formatRupiah(total + Number(marginFee))}</p>
                    </div>

                    <div className='w-full my-3 h-[2px] bg-gray-200'></div>
                    <div className='flex md:flex-row flex-col md:items-center items-start gap-2 justify-between'>
                        <p className='font-bold text-start'>Metode Pembayaran</p>
                        <select
                            className="h-10 border border-gray-300 rounded-md md:w-52 w-full text-center text-sm"
                            value={paymentMethod || ""}
                            onChange={(e) => { setPaymentMethod(e.target.value); if (e.target.value == 'qris') setIsPersonal(false) }}
                        >
                            <option selected hidden>Pilih Metode Pembayaran</option>
                            <option value="tunai">Tunai</option>
                            <option value="qris">QRIS</option>
                        </select>
                    </div>
                    {
                        paymentMethod == 'tunai' && (
                            <div className='flex flex-row gap-1 items-center'>
                                <input type="checkbox" onChange={() => setIsPersonal(!isPersonal)} className="mr-1" id="personal" />
                                <label htmlFor="personal" className="text-sm text-gray-500">Transaksi ini untuk keperluan Pribadi </label>
                            </div>
                        )
                    }
                </div>
            </div>

            <Button onClick={() => {
                if (!paymentMethod) {
                    setError("Pilih Metode Pembayaran");
                } else {
                    setShowPinInput(true);
                }
            }} className={`${(showInproggresStep || showQRCode) ? 'hidden' : 'block'} uppercase translate-y-10 text-center w-[90%] m-auto bg-green-500 mb-32 text-white`}>
                Bayar
            </Button >

            {
                showPinInput && (
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
                )
            }

            {/* Notifikasi Error */}
            {
                error && <Notification onClose={() => {
                    setError("")
                    setLoading(false)
                }} message={error} status="error" />
            }

            {
                paymentMethod == 'qris' && showQRCode && (
                    <QRCodePage
                        type="kasir"
                        orderId={orderId}
                        stringQR={stringQR}
                        showQRCode={showQRCode}
                        timeLeftOpenBill={timeLeft}
                        setShowQRCode={setShowQRCode}
                        dataAmount={(total + Number(marginFee))}
                    />
                )
            }

            {showInproggresStep && paymentMethod == 'tunai' && <InprogressPPOB data={data} refNumber={refNumber} marginTop={marginTop} marginFee={Number(marginFee)} />}

            {/* Loading */}
            {
                loading && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )
            }
        </>
    );
};

export default Bill;

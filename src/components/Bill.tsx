import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Info } from 'lucide-react';
import axiosInstance from '@/hooks/axiosInstance';
import Notification from './Notification';
import { formatRupiah } from '@/hooks/convertRupiah';
import InprogressPPOB from './InprogressPPOB';
// import { convertDate, convertTime } from '../hooks/convertDate';

// interface BillProps {
//     data: {
//         inquiryId: number;
//         productCode: string;
//         phoneNumber: string;
//         product: string;
//         amount: number;
//         totalAdmin: number;
//         processingFee: number;
//         date: string;
//         time: string;
//         category: string;

//     };
//     marginTop?: boolean;
// }

interface BillProps {
    data: any;
    marginTop: boolean;
    marginFee?: any
}

// const Bill: React.FC<BillProps> = ({ data, marginTop }) => {
const Bill: React.FC<BillProps> = ({ data, marginTop, marginFee = 0 }) => {
    console.log(data)
    const [showPinInput, setShowPinInput] = useState(false);
    const [pin, setPin] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [showInproggresStep, setShowInproggresStep] = useState(false)

    const [refNumber, setRefnumber] = useState<string>("")
    const [total, setTotal] = useState(0);
    // const [amount, setAmount] = useState(0);
    useEffect(() => {
        // setAmount(data.amount - data.processingFee - data.totalAdmin)
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

    const [paymentMethod, setPaymentMethod] = useState("qris");

    const handleSubmitPin = async () => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        console.log("data from bill: ", data)

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
                metode: paymentMethod
            }

            if (data.category === "BPJS") {
                payload.month = data.month; // Menambahkan properti ke payload yang sudah ada
            }

            const response = await axiosInstance.post("/ayoconnect/payment", payload);

            if (response.data.success) {
                setLoading(false);
                setShowInproggresStep(true)
                setRefnumber(response.data.data.refNumber)
            } else {
                setShowInproggresStep(false)
                setError(response.data.message || "Pembayaran gagal, silahkan coba lagi nanti.");
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
            <div className={`${marginTop ? 'mt-[130px]' : 'mt-[-90px] bg-white'} ${showInproggresStep ? 'hidden' : 'block'} w-[90%] m-auto shadow-lg p-10 rounded-lg`}>
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
                            className="h-10 border border-gray-300 rounded-md md:w-52 w-full text-center"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="qris">QRCode (Non Tunai)</option>
                            <option value="tunai">Tunai</option>
                        </select>
                    </div>

                </div>
            </div>

            <Button onClick={() => {
                setShowPinInput(true)
            }} className={`${showInproggresStep ? 'hidden' : 'block'} uppercase translate-y-10 text-center w-[90%] m-auto bg-green-500 mb-32 text-white`}>
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

            {showInproggresStep && <InprogressPPOB data={data} refNumber={refNumber} marginTop={marginTop} marginFee={Number(marginFee)} />}

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

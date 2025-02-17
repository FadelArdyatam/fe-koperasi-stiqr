import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, FileText, Info, XCircle, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Remove Form import from react-router-dom
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { Input } from "@/components/ui/input";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import notransaction from "../images/no-transaction.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"; // Import Form from shadcn/ui
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Notification from "@/components/Notification";

interface BankAccount {
    account_id: string;
    bank_name: string;
    account_number: string;
}
interface IBalance {
    amount: number;
    cash_amount: number;
    non_cash_amount: number;
}

interface ISettlement {
    settlement_id: string;
    created_at: Date;
    amount: number;
    account: {
        bank_name: string;
        account_number: string;
    }
}
const Settlement = () => {
    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const [uangMasuk, setUangMasuk] = useState(0);
    const [uangKeluar, setUangKeluar] = useState(0);
    const [showNotification, setShowNotification] = useState(true);
    const [errorNotification, setErrorNotification] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [mdr, setMdr] = useState(0)
    const [marginMdr, setMarginMdr] = useState(0)
    const [balance, setBalance] = useState<IBalance>({
        amount: 0,
        cash_amount: 0,
        non_cash_amount: 0,
    });
    const navigate = useNavigate();
    // const [startDate, setStartDate] = useState<Date | null>(new Date());
    // const [endDate, setEndDate] = useState<Date | null>(null);
    // const [showCalendar, setShowCalendar] = useState(false);
    // const [histories, setHistories] = useState<any[]>([]);
    // const [filteredHistories, setFilteredHistories] = useState<any[]>([]);

    // const [months, setMonths] = useState(2); // Default 2 bulan

    // useEffect(() => {
    //     const handleResize = () => {
    //         setMonths(window.innerWidth < 768 ? 1 : 2); // Jika kurang dari 768px, tampilkan 1 bulan
    //     };

    //     handleResize(); // Jalankan saat pertama kali load
    //     window.addEventListener("resize", handleResize); // Deteksi perubahan ukuran layar
    //     return () => window.removeEventListener("resize", handleResize);
    // }, []);

    const FormSchema = z.object({
        amount: z.number().min(5, {
            message: "Minimal Penarikan Rp 12.000",
        }),
        account_id: z.string().min(2, {
            message: "Tidak Boleh Kosong",
        }),
    });

    type FormData = z.infer<typeof FormSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            amount: 0,
            account_id: ""
        },
    });

    const [pin, setPin] = useState<string[]>([]);

    const handleNumberClick = (number: string) => {
        if (pin.length < 6) {
            setPin([...pin, number]);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };
    const [showPinInput, setShowPinInput] = useState(false);
    const [loading, setLoading] = useState(false);
    async function onSubmit(data: FormData) {
        try {
            setShowPinInput(true);
            if (showPinInput) {
                setLoading(true);
                const response = await axiosInstance.post(`/settlement/create`, {
                    amount: data.amount.toString(),
                    account_id: data.account_id,
                    pin: pin.join(''),
                    mdr_amount: mdr
                });

                if (response.data.success) {
                    setErrorNotification(true);
                    setMessage("Berhasil melakukan penarikan")
                    setIsSuccess(true)
                    setPin([])
                    setShowPinInput(false)
                    setLoading(false)
                }
            }
        } catch (error: any) {
            setErrorNotification(true);
            setMessage(error.response.data.message);
            setIsSuccess(false)
            setShowPinInput(false)
            setPin([])
            setLoading(false)
            console.error(error);
        }
    }

    useEffect(() => {
        // Ambil informasi user dari sessionStorage
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const getSaldo = async () => {
            try {
                const response = await axiosInstance.get(
                    `/balance/${userData.merchant.id}`,
                );
                console.log('saldo : ')
                console.log(response.data)
                setBalance(response.data);
            } catch (err: any) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        const getMoney = async () => {
            try {
                const uangMasuk = await axiosInstance.get(`/balance/in/${userData?.merchant?.id}`);
                setUangMasuk(uangMasuk.data);

                const uangKeluar = await axiosInstance.get(`/balance/out/${userData?.merchant?.id}`);
                setUangKeluar(uangKeluar.data);
            } catch (error) {
                console.error(error);
            }
        }

        const getAccount = async () => {
            try {
                const response = await axiosInstance.get(`/account/${userData?.merchant?.id}`);
                setAccounts(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        }
        getMoney();
        getAccount();
        getSaldo()
    }, []);
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const [settlements, setSettlements] = useState<ISettlement[]>([])
    useEffect(() => {
        const fetchSettlement = async () => {
            console.log('settlement');
            const res = await axiosInstance.get(`/settlement/${userData.merchant.id}`)
            console.log(res)
            setSettlements(res.data)
        }

        fetchSettlement()
    }, []);

    // useEffect(() => {
    //     if (startDate || endDate) {
    //         const filtered = histories.filter((history) => {
    //             const transactionDate = new Date(history.transaction_date);
    //             return startDate && endDate && transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    //         });
    //         setFilteredHistories(filtered);
    //     }
    // }, [startDate, endDate, histories]);

    // const onChange = (dates: [Date | null, Date | null]) => {
    //     const [start, end] = dates;
    //     setStartDate(start);
    //     setEndDate(end);
    // };


    return (
        <div>
            <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                <Link to="/dashboard" className="bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>

                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center uppercase">
                    Penarikan
                </p>
            </div>

            <div className="w-[90%] m-auto pb-10">
                {showNotification && (
                    <div data-aos="fade-up" data-aos-delay="100" className="flex items-center justify-between gap-3 p-4 mt-24 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 min-w-5 h-5 text-blue-500" />

                            <p className="text-sm text-black">
                                Penarikan dana hanya bisa dilakukan pada jam 18:00 s/d 23:59. Maksimal penarikan akan kembali semula setiap harinya pada jam 00:00
                            </p>
                        </div>

                        <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div data-aos="fade-up" data-aos-delay="200" className={`${showNotification ? 'mt-10' : 'mt-24'} w-full border border-gray-300 rounded-lg p-5`}>
                    <div>
                        <p className="font-semibold text-lg">Total Saldo Stiqr</p>
                        <p className="mt-2 font-semibold text-3xl">{formatRupiah(Number(balance.amount ?? 0))}</p>
                    </div>

                    <div className="w-full h-[1px] bg-gray-300 my-5" />

                    <div className="w-full flex flex-col gap-5">
                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Saldo Pemasukan</p>
                            <p className="font-semibold text-lg">{formatRupiah(uangMasuk)}</p>
                        </div>

                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Saldo Pengeluaran</p>
                            <p className="font-semibold text-lg">{formatRupiah(uangKeluar)}</p>
                        </div>

                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Saldo Non Tunai</p>
                            <p className="font-semibold text-lg">{formatRupiah(balance.non_cash_amount ?? 0)}</p>
                        </div>

                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Saldo Tunai</p>
                            <p className="font-semibold text-lg">{formatRupiah(balance.cash_amount ?? 0)}</p>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">*Saldo hanya bisa dilakukan menggunakan saldo non tunai</p>

                {/* Withdrawal Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
                        <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col gap-3">
                            <p>Pilih Bank</p>
                            <FormField
                                control={form.control}
                                name="account_id"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="w-full p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center justify-between">
                                                    {accounts.find(account => account.account_id === field.value)?.bank_name || "Pilih Akun Bank"}
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {accounts?.map((account, i) => (
                                                        <DropdownMenuItem
                                                            key={i}
                                                            onSelect={() => field.onChange(account.account_id)}
                                                        >
                                                            {account.bank_name} - {account.account_number}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="w-full h-[1px] bg-gray-300 my-3" />
                            <p className="">Saldo Yang Ingin Ditarik</p>
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="w-full font-bold">
                                        <FormControl>
                                            <Input
                                                type="text"
                                                value={formatRupiah(String(field.value) || "0")}
                                                placeholder="Masukkan Jumlah Saldo"
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    value = value.slice(0, 7);
                                                    const maxAmount = balance.non_cash_amount;
                                                    if (Number(value) > maxAmount) {
                                                        value = String(maxAmount);
                                                    }
                                                    field.onChange(value ? Number(value) : "");
                                                    const margin = Number(value) * 0.007;
                                                    setMarginMdr(Math.ceil(margin));
                                                    setMdr(Math.ceil(Number(value) - margin));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between">
                                <p>MDR <i> (0,7%)</i> </p>
                                <p className="font-bold">{formatRupiah(marginMdr)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p>Biaya Admin </p>
                                    <p className="text-xs text-gray-500 italic ">*sementara ditanggung oleh tim STIQR</p>
                                </div>
                                <p className="font-bold">
                                    <span className="line-through font-semibold decoration-red-500">{formatRupiah(1000)}</span> {formatRupiah(0)}
                                </p>

                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p>Saldo yang Diterima </p>
                                    <p className="text-xs text-gray-500 italic ">*saldo yang masuk ke rekening Anda.</p>
                                </div>
                                <p className="font-bold">{formatRupiah(mdr)}</p>
                            </div>
                        </div>

                        <Button type="submit" className="mt-5 w-full text-base bg-orange-500">
                            Tarik Saldo
                        </Button>

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
                                                type="button"
                                                onClick={() => handleNumberClick(number)}
                                                className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
                                            >
                                                {number}
                                            </button>
                                        ))}
                                        <div></div>
                                        <button
                                            onClick={() => handleNumberClick("0")}
                                            type="button"
                                            className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 text-xl font-bold"
                                        >
                                            0
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            type="button"
                                            className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-400 text-white text-xl font-bold"
                                        >
                                            ⌫
                                        </button>
                                    </div>

                                    <div className="flex justify-between">
                                        <Button
                                            onClick={() => setShowPinInput(false)}
                                            type="button"
                                            className="w-full mr-2 bg-gray-400 text-white"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="w-full ml-2 bg-green-500 text-white"
                                            disabled={pin.length !== 6 || loading}
                                        >
                                            Konfirmasi
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </div>


            <div className="pb-32">
                {
                    settlements.length > 0 ? (
                        <div>
                            <p className="text-xl text-center font-bold my-3">Riwayat Penarikan</p>
                            {
                                settlements.map((settlement, index) => (
                                    <div key={index} className="w-[90%] m-auto">
                                        <div className={`${index === 0 ? "hidden" : "block"} w-[100%] h-[2px] my-5 bg-gray-300 rounded-full`}></div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {settlement.account.bank_name} - {settlement.account.account_number}
                                                    </div>
                                                    <p className="text-xs text-gray-400">{settlement.settlement_id}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <p className="text-md font-semibold">{formatRupiah(Number(settlement.amount) ?? 0)}</p>

                                                <div className="flex items-center">
                                                    <p className="text-xs">
                                                        {new Date(settlement.created_at).toLocaleDateString("id-ID", {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </p>

                                                    <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                                    <p className="text-xs">
                                                        {new Date(settlement.created_at).toLocaleTimeString("id-ID", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div></div>
                    )
                }
                {/* <div className="p-5 bg-white w-[94%] m-auto">
                    <p className="font-semibold text-lg">Riwayat Penarikan</p>
                    <Button
                        type="button"
                        className="w-full mt-3 text-base font-medium bg-gray-200 text-gray-700 border border-gray-400 rounded-lg"
                        onClick={() => setShowCalendar(!showCalendar)}
                    >
                        {startDate && endDate
                            ? `${startDate.toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })} - ${endDate.toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}`
                            : "Pilih Rentang Tanggal"}
                    </Button>

                    {showCalendar && (
                        <div className="mt-3 border flex flex-col items-center p-2 border-gray-300 rounded-lg shadow-md">
                            <DatePicker
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                                className="w-full"
                                monthsShown={months}
                            />
                            <Button
                                type="button"
                                className="w-full mt-2 bg-orange-500 text-white rounded-lg py-2"
                                onClick={() => setShowCalendar(false)}
                            >
                                Pilih
                            </Button>
                        </div>
                    )}
                </div> */}

                {/* {histories.length === 0 ? (
                    <div className="flex flex-col items-center gap-5">
                        <img className="p-5" src={notransaction} alt="No transactions" />
                        <p className="font-semibold text-lg text-orange-500">Belum ada transaksi hari ini</p>
                    </div>
                ) : (
                    <div className="mt-5 p-5">
                        {filteredHistories.length > 0 ? (
                            filteredHistories.map((history, index) => (
                                <div key={index} className="w-[94%] m-auto">
                                    <div className={`${index === 0 ? "hidden" : "block"} w-[94%] h-[2px] my-5 bg-gray-300 rounded-full`}></div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-2">
                                            <img src={`${import.meta.env.VITE_ISSUER_BANK_URL}/${history?.channel}.png`} className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden" alt="IMAGE" />

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="uppercase text-sm">{history.sales_id == null ? "QRCode" : "Penjualan"} | {history.payment_method}</p>

                                                    <div className={`${history.transaction_status === "success" ? "bg-green-400" : history.transaction_status === "pending" ? "bg-yellow-400" : "bg-red-400"} px-2 rounded-md text-white text-xs py-[0.5]"`}>
                                                        <p>{history.transaction_status} </p>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-400">{history.transaction_id} | {history.sales ? history.sales.orderId : history.qr_transaction?.orderId}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <p className="text-md font-semibold">{formatRupiah(history.total_amount)}</p>

                                            <div className="flex items-center">
                                                <p className="text-xs">
                                                    {new Date(history.transaction_date).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </p>

                                                <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                                <p className="text-xs">
                                                    {new Date(history.transaction_date).toLocaleTimeString("id-ID", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Jika tidak ada transaksi dalam rentang filter
                            startDate && endDate ? (
                                <div className="flex flex-col items-center gap-5 text-center">
                                    <img className="p-5" src={notransaction} alt="No transactions" />
                                    <p className="font-semibold text-lg text-orange-500">Tidak ada transaksi dalam rentang waktu ini</p>
                                </div>
                            ) : (
                                // Jika tidak ada filter aktif, tampilkan semua transaksi
                                histories.length > 0 ? (
                                    histories.map((history, index) => (
                                        <div key={index} className="w-[94%] m-auto">
                                            <div className={`${index === 0 ? "hidden" : "block"} w-[94%] h-[2px] my-5 bg-gray-300 rounded-full`}></div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-2">
                                                    <img src={`${import.meta.env.VITE_ISSUER_BANK_URL}/${history?.channel}.png`} className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden" alt="IMAGE" />

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="uppercase text-sm">{history.sales_id == null ? "QRCode" : "Penjualan"} | {history.payment_method}</p>

                                                            <div className={`${history.transaction_status === "success" ? "bg-green-400" : history.transaction_status === "pending" ? "bg-yellow-400" : "bg-red-400"} px-2 rounded-md text-white text-xs py-[0.5]"`}>
                                                                <p>{history.transaction_status} </p>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-gray-400">{history.transaction_id} | {history.sales ? history.sales.orderId : history.qr_transaction?.orderId}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <p className="text-md font-semibold">{formatRupiah(history.total_amount)}</p>

                                                    <div className="flex items-center">
                                                        <p className="text-xs">
                                                            {new Date(history.transaction_date).toLocaleDateString("id-ID", {
                                                                day: "2-digit",
                                                                month: "long",
                                                                year: "numeric",
                                                            })}
                                                        </p>

                                                        <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                                        <p className="text-xs">
                                                            {new Date(history.transaction_date).toLocaleTimeString("id-ID", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Jika tidak ada transaksi sama sekali
                                    <div className="flex flex-col items-center gap-5">
                                        <img className="p-5" src={notransaction} alt="No transactions" />
                                        <p className="font-semibold text-lg text-orange-500">Belum ada transaksi</p>
                                    </div>
                                )
                            )
                        )}
                    </div>
                )} */}
            </div>

            {
                errorNotification && (
                    <div>
                        <Notification
                            message={message}
                            onClose={() => {
                                setErrorNotification(false)
                                if (isSuccess) {
                                    navigate('/dashboard')
                                }
                            }}
                            status={isSuccess ? 'success' : 'error'}
                        />
                    </div>
                )
            }

            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to="/dashboard" className="flex gap-3 flex-col items-center">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>

                <Link to="/qr-code" className="flex gap-3 flex-col items-center">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to="/settlement" className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase text-orange-400">Penarikan</p>
                </Link>

                <Link to="/catalog" className="flex gap-3 flex-col items-center">
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to="/profile" className="flex gap-3 flex-col items-center">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </div >
    );
};

export default Settlement;
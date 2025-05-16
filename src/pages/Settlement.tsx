import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, FileText, Info, XCircle, ChevronDown, ChevronsLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Remove Form import from react-router-dom
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { Input } from "@/components/ui/input";
// import DatePicker from "react-datepicker";
import { convertDate, convertTime } from '../hooks/convertDate';
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
import imgNoTransaction from "@/images/no-transaction.png";
import DatePicker from "react-datepicker";

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
    account?: {
        bank_name: string;
        account_number: string;
    },
    type?: string;
    notes?: string;
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
    const [section, setSection] = useState("Penarikan");
    const navigate = useNavigate();

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const onChange = (dates: [any, any]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };
    const [filter, setFilter] = useState("today")
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
    const setCustomDateRange = (start: string | null, end: string | null) => {
        setDateRange({ startDate: start || undefined, endDate: end || undefined });
        setFilter("dateRange");
    };
    const [months, setMonths] = useState(2);

    useEffect(() => {
        const handleResize = () => {
            setMonths(window.innerWidth < 768 ? 1 : 2);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const setFilterHandler = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const FormSchema = z.object({
        amount: z.number({ message: '' }).min(12000, {
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
                    amount: data.amount,
                    account_id: data.account_id,
                    pin: pin.join(''),
                    mdr_amount: mdr,
                    type: section
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

    type FormCatat = z.infer<typeof FormSchemaCatat>;

    const FormSchemaCatat = z.object({
        description: z.string().min(2, {
            message: "Tidak Boleh Kosong",
        }),
        amountCatat: z.number({ message: '' })
            .min(1, { message: "Minimal Pencatatan Rp 1" })
    });

    const formCatat = useForm<FormCatat>({
        resolver: zodResolver(FormSchemaCatat),
        defaultValues: {
            description: '',
            amountCatat: 0,
        },
    });

    async function onSubmitCatat(data: FormCatat) {
        console.log('data');
        console.log(data);
        try {
            setShowPinInput(true);
            if (showPinInput) {
                setLoading(true);
                const response = await axiosInstance.post(`/settlement/create`, {
                    amount: data.amountCatat,
                    pin: pin.join(''),
                    type: section,
                    notes: formCatat.getValues('description'),
                    merchant_id: userData.merchant.id
                });

                if (response.data.success) {
                    setErrorNotification(true);
                    setMessage("Berhasil melakukan pencatatan")
                    setIsSuccess(true)
                    setPin([])
                    setShowPinInput(false)
                    setLoading(false)
                }
            }
        } catch (error: any) {
            console.log(error)
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [latestTunai, setLatestTunai] = useState(null)

    useEffect(() => {
        const fetchSettlement = async () => {
            const params: any = {
                filter,
                page: currentPage,
                limit: 10,
                type: section == 'Tunai' ? 'Tunai' : 'Non Tunai'
            }

            if (filter === "dateRange" && dateRange.startDate) {
                params.startDate = dateRange.startDate;
                params.endDate = dateRange.endDate ?? dateRange.startDate;
            }
            const res = await axiosInstance.get(`/settlement/${userData.merchant.id}`, { params })
            setSettlements(res.data.data)
            setLatestTunai(res.data.latest.created_at)
            setTotalPages(res.data.pagination.totalPages)
        }

        fetchSettlement()
    }, [currentPage, filter, dateRange, section]);

    console.log(latestTunai)
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
                                Penarikan dana hanya bisa dilakukan pada jam 18:00 s/d 23:59. Limit penarikan akan kembali semula setiap harinya pada jam 00:00
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
                            <p className="text-gray-500">Total Uang Masuk</p>
                            <p className="font-semibold text-lg">{formatRupiah(uangMasuk)}</p>
                        </div>

                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Total Uang Keluar</p>
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

                <p className="text-xs text-gray-500 mt-3">*Saldo yang dapat ditarik adalah Saldo Non Tunai</p>

                <div className="w-[90%] md:w-[50%] m-auto items-center justify-center flex mt-10 border border-orange-500 rounded-lg overflow-hidden">
                    <button onClick={() => setSection("Penarikan")} className={`${section === "Penarikan" ? 'bg-orange-500 text-white' : 'bg-transparent text-black'} transition-all text-sm w-full text-center p-1 bg-orange-500 font-medium`}>
                        Penarikan Non Tunai
                    </button>

                    <button onClick={() => setSection("Tunai")} className={`${section === "Tunai" ? 'bg-orange-500 text-white' : 'bg-transparent text-black'} transition-all text-sm w-full text-center p-1 bg-orange-500 font-medium`}>
                        Catat Tunai
                    </button>
                </div>

                {section === "Penarikan" ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
                            <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col gap-3">
                                <p>Pilih Akun</p>
                                <FormField
                                    control={form.control}
                                    name="account_id"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="w-full p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center justify-between rounded-lg border border-gray-300">
                                                        {accounts.find(account => account.account_id === field.value)?.bank_name || "Pilih Akun Penarikan"}
                                                        <ChevronDown className="ml-2 h-4 w-4" />
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent
                                                        className="bg-white p-3 border mt-2 z-10 rounded-lg w-[var(--radix-popper-anchor-width)] max-h-64 overflow-y-auto flex flex-col gap-2 shadow-lg"
                                                        align="start"
                                                    >
                                                        {accounts?.map((account, i) => (
                                                            <DropdownMenuItem
                                                                key={i}
                                                                onSelect={() => field.onChange(account.account_id)}
                                                                className="cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-md"
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
                                                    inputMode="numeric" // Menampilkan numpad di mobile
                                                    autoComplete="off"
                                                    value={formatRupiah(String(field.value) || "0")}
                                                    placeholder="Masukkan Jumlah Saldo"
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, ""); // Hanya angka
                                                        value = value.slice(0, 7);
                                                        const maxAmount = balance.non_cash_amount;
                                                        if (Number(value) > maxAmount) {
                                                            value = String(maxAmount);
                                                        }
                                                        field.onChange(value ? Number(value) : "");
                                                        const margin = Number(value) * 0.007;
                                                        if (Number(value) >= 12000) {
                                                            setMarginMdr(Math.ceil(margin));
                                                            setMdr(Math.ceil(Number(value) - margin - 3000));
                                                        } else if (Number(value) < 12000) {
                                                            setMarginMdr(0);
                                                            setMdr(0);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className="text-xs text-gray-500 italic -mt-1">*Minimal penarikan Rp 12.000</p>


                                <div className="flex justify-between">
                                    <p>MDR <i> (0,7%)</i> </p>
                                    <p className="font-bold">{formatRupiah(marginMdr)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>Biaya Admin </p>
                                        {/* <p className="text-xs text-gray-500 italic ">*sementara ditanggung oleh tim STIQR</p> */}
                                    </div>
                                    <p className="font-bold">
                                        {formatRupiah(3000)}
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

                            <Button disabled={`${form.getValues("amount") < 12000 ? 'disabled' : ''}`} type="submit" className={`mt-5 w-full text-base bg-orange-500 `}>
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
                ) : (
                    <div>
                        <div className="flex items-center justify-between gap-3 p-2 mt-5 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                            <p>* Pencatatan tunai akan tercatat di Riwayat Tunai dibawah</p>
                        </div>

                        <p className="font-semibold mt-5">Terakhir Pencatatan : {latestTunai ? `${convertDate(latestTunai)} | ${convertTime(latestTunai)}` : '-'}  </p>

                        <Form {...formCatat}>
                            <form onSubmit={formCatat.handleSubmit(onSubmitCatat)} className="mt-5">
                                <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col gap-3">
                                    <p>Keterangan</p>
                                    <FormField
                                        control={formCatat.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Masukkan Keterangan"
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <p>Jumlah</p>
                                    <FormField
                                        control={formCatat.control}
                                        name="amountCatat"
                                        render={({ field }) => (
                                            <FormItem className="w-full font-bold">
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric" // Menampilkan numpad di mobile
                                                        autoComplete="off"
                                                        value={formatRupiah(String(field.value) || "0")}
                                                        placeholder="Masukkan Jumlah Saldo"
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, ""); // Hanya angka
                                                            if (Number(value) > balance.cash_amount) return
                                                            field.onChange(value ? Number(value) : "");
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="mt-5 w-full text-base bg-orange-500">
                                        Catat Tunai
                                    </Button>
                                </div>

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
                )}
            </div>

            <div className="pb-32 flex flex-col gap-5 w-[90%] m-auto shadow-lg bg-white rounded-lg">
                <p className="text-xl text-center font-bold my-3">{section === "Penarikan" ? 'Riwayat Penarikan' : 'Riwayat Tunai'}</p>
                <div className="w-full flex gap-5 overflow-x-auto my-5 p-3">
                    <Button onClick={() => {
                        setShowCalendar(!showCalendar); setFilter("dateRange");
                    }} className={`${filter === "dateRange" ? 'bg-orange-500 text-white' : 'bg-transparent border border-orange-500 text-black'} hover:bg-gray-200 transition-all rounded-full w-full py-2`}>Pilih Tanggal Transaksi</Button>
                    <Button onClick={() => { setFilterHandler("today"); setShowCalendar(false) }} className={`${filter === "today" ? 'bg-orange-500 text-white' : 'bg-transparent border border-orange-500 text-black'} hover:bg-gray-200 transition-all rounded-full w-full py-2`}>
                        Hari Ini
                    </Button>
                    <Button onClick={() => { setFilterHandler("yesterday"); setShowCalendar(false) }} className={`${filter === "yesterday" ? 'bg-orange-500 text-white' : 'bg-transparent border border-orange-500 text-black'} hover:bg-gray-200 transition-all rounded-full w-full py-2`}>
                        Kemarin
                    </Button>
                    <Button onClick={() => { setFilterHandler("2days"); setShowCalendar(false) }} className={`${filter === "2days" ? 'bg-orange-500 text-white' : 'bg-transparent border border-orange-500 text-black'} hover:bg-gray-200 transition-all rounded-full w-full py-2`}>
                        2 Hari
                    </Button>
                    <Button onClick={() => { setFilterHandler("7days"); setShowCalendar(false) }} className={`${filter === "7days" ? 'bg-orange-500 text-white' : 'bg-transparent border border-orange-500 text-black'} hover:bg-gray-200 transition-all rounded-full w-full py-2`
                    }>
                        7 Hari
                    </Button>
                </div>
                <div className="flexflex-col items-center gap-5 justify-between">
                    <Button
                        className={`${showCalendar ? 'block' : 'hidden'} text-sm bg-gray-200 border w-full border-gray-400 text-gray-700 rounded-lg px-3 py-2`}
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
                            : "Pilih Tanggal Transaksi"}
                    </Button>
                </div>

                {
                    showCalendar && (
                        <div className="flex flex-col items-center border p-3 rounded-lg shadow-md">
                            <DatePicker
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                                maxDate={
                                    startDate
                                        ? new Date(Math.min(new Date().getTime(), startDate.getTime() + 6 * 24 * 60 * 60 * 1000))
                                        : new Date()
                                }
                                className="w-full"
                                monthsShown={months}
                            />

                            <Button
                                className="w-full mt-3 bg-orange-500 text-white rounded-lg"
                                onClick={() => {
                                    setShowCalendar(false);
                                    setCustomDateRange(
                                        startDate ? startDate.toISOString() : null,
                                        endDate ? endDate.toISOString() : null
                                    )
                                }}
                            >
                                Pilih
                            </Button>
                        </div>
                    )
                }
                {
                    settlements.length > 0 ? (
                        <div>

                            {
                                settlements.map((settlement, index) => (
                                    <div key={index} className="px-5 m-auto">
                                        <div className={`${index === 0 ? "hidden" : "block"} w-[100%] h-[2px] my-5 bg-gray-300 rounded-full`}></div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {
                                                            settlement.type == "Tunai" ? `${settlement.notes}` : `${settlement.account?.bank_name || "Unknown Bank"} - ${settlement.account?.account_number || "Unknown Account"}`
                                                        }

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
                        <div className="flex flex-col items-center justify-center my-10">
                            <img className="p-5" src={imgNoTransaction} alt="No transactions" />
                            <p className="mt-5 font-bold text-orange-500">
                                Belum ada penarikan saldo
                            </p>
                        </div>
                    )
                }

                {
                    settlements.length > 0 && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center mt-12 justify-center gap-5 mb-3 ">
                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft />
                                </Button>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft />
                                </Button>


                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight />
                                </Button>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                    <ChevronsRight />
                                </Button>
                            </div>
                            <span className="text-center">Halaman {currentPage} dari {totalPages}</span>
                        </div>
                    )}
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
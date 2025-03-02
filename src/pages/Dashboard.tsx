import { CircleDollarSign, CreditCard, Droplet, HandCoins, Home, Mail, ScanQrCode, ShieldCheck, Smartphone, Zap, UserRound, X, FileText, ClipboardList, CirclePercent, EyeOff, Eye, UsersRound, ChevronsLeft, ChevronsRight, ChevronRight, ChevronLeft } from "lucide-react";
import logo from "@/images/logo.png";
import { useEffect, useState } from "react";
import linkaja from "@/images/linkaja.jpg";
import gopay from "@/images/gopay.png";
import ovo from "@/images/ovo.jpg";
import dana from "@/images/dana.jpg";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import imgNoTransaction from "@/images/no-transaction.png";
import noIssuerImg from "@/images/no-issuer.png";
import { Button } from "@/components/ui/button";
import Notification from "@/components/Notification"
import AOS from "aos";
import "aos/dist/aos.css";
import { convertDate, convertTime } from "@/hooks/convertDate";

export const admissionFees = [
    {
        image: linkaja,
        title: "LinkAja",
        amount: "100000",
        date: "12/11/2024",
        time: "12:00",
        status: "success",
        code: "INV-1321214"
    },
    {
        image: gopay,
        title: "GoPay",
        amount: "50000",
        date: "14/11/2024",
        time: "12:00",
        status: "failed",
        code: "INV-323023"
    },
    {
        image: ovo,
        title: "OVO",
        amount: "200000",
        date: "23/11/2024",
        time: "12:00",
        status: "success",
        code: "INV-124958"
    },
    {
        image: dana,
        title: "DANA",
        amount: "150000",
        date: "29/11/2024",
        time: "12:00",
        status: "pending",
        code: "INV-439230"
    },
    {
        image: dana,
        title: "DANA",
        amount: "170000",
        date: "11/11/2024",
        time: "12:00",
        status: "pending",
        code: "INV-123456"
    }
]

type TokenPayload = {
    exp: number; // Expiration time in seconds
    [key: string]: any; // Other possible fields
};

interface History {
    image: string;
    transaction_date: string;
    title: string;
    transaction_id: string;
    total_amount: number;
    payment_method: string;
    qr_transaction_id?: string;
    sales_id?: string;
    date: string;
    time: string;
    transaction_status: "success" | "failed" | "pending";
    code: string;
    channel?: number;
    sales?: {
        orderId: string;
    }
    qr_transaction?: {
        orderId: string;
    }
}

interface IBalance {
    amount: number;
    non_cash_amount: number;
    cash_amount: number;
}
const Dashboard = () => {
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [balance, setBalance] = useState<IBalance>({
        amount: 0,
        cash_amount: 0,
        non_cash_amount: 0,
    });
    const [user, setUser] = useState<any>();

    const [showNotificationBPJS, setShowNotificationBPJS] = useState(false);

    const [showBalance, setShowBalance] = useState(false);

    const [uangMasuk, setUangMasuk] = useState(0);
    const [uangKeluar, setUangKeluar] = useState(0);
    const [histories, setHistories] = useState<History[]>([]);
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;
        setUser(userData);

        const checkTokenValidity = () => {
            const token = localStorage.getItem("token");

            if (!token) {
                console.warn("Token tidak ditemukan.");
                navigate("/"); // Redirect jika token tidak ada
                return;
            }

            try {
                const decoded: TokenPayload = jwtDecode(token);
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

                if (decoded.exp < currentTime) {
                    console.warn("Token telah kedaluwarsa.");
                    localStorage.removeItem("token"); // Hapus token dari storage
                    navigate("/"); // Redirect ke halaman login
                    return;
                }
            } catch (err) {
                console.error("Error saat memeriksa token:", err);
                navigate("/"); // Redirect jika token tidak valid
                return;
            }
        };

        const checkProfile = async () => {
            try {
                const response = await axiosInstance.get(
                    `/balance/${userData.merchant.id}`,
                );

                console.log("Profile Response:", response.data);
                setBalance(response.data);
            } catch (err: any) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        const getMoney = async () => {
            try {
                const uangMasuk = await axiosInstance.get(`/balance/in/${userData.merchant.id}`)
                setUangMasuk(uangMasuk.data);
                const uangKeluar = await axiosInstance.get(`/balance/out/${userData.merchant.id}`)
                setUangKeluar(uangKeluar.data);
            } catch (error: any) {
                console.log(error)
            }
        }

        checkTokenValidity();
        checkProfile();
        getMoney();
    }, [navigate]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        if (!userData) return;

        const fetchTransactions = async () => {
            try {
                const params: any = {
                    page: currentPage,
                    limit: 5
                };

                const response = await axiosInstance.get(`/transactions/${userData.merchant.id}`, { params });
                setHistories(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        fetchTransactions();
    }, [currentPage]);


    return (
        <div className="w-full">
            <div id="navbar" className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <Home />

                    <p className="uppercase">Home</p>
                </Link>

                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />

                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to={'/settlement'} className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
                    <FileText />

                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to={'/profile'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            {/* Notification */}
            <div className={`${showNotification ? 'fixed' : 'hidden'} top-0 bottom-0 bg-black bg-opacity-50 w-full left-[50%] -translate-x-[50%] shadow-lg z-20 flex items-end justify-center`}>
                <div
                    className={`${showNotification ? "block" : "hidden"
                        } relative w-[90%] mb-32 rounded-lg p-5 bg-orange-400`}
                >
                    <div className="flex items-center gap-5 justify-center relative">
                        <p className="text-white font-semibold text-center">Lengkapi Data Anda</p>

                        <button onClick={() => setShowNotification(false)}><X className="text-white absolute right-5 -mt-3" /></button>
                    </div>
                    <p className="mt-5 text-sm text-center text-white">Silahkan untuk melengkapi data profile Anda.</p>

                    {/* Triangle */}
                    <div
                        className="absolute -bottom-4 right-4 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-orange-400 border-r-[20px] border-r-transparent"
                    ></div>
                </div>
            </div>

            <div className="w-full relative px-10 pt-10 pb-32 bg-orange-400">
                <div className="flex items-center gap-5">
                    <p className="text-2xl m-auto uppercase font-semibold text-center text-white" data-aos="zoom-in">Home</p>

                    <Link id="inbox" to={'/inbox'} className="bg-transparent text-white absolute right-5 hover:bg-transparent">
                        <Mail className="scale-[1.3]" />
                    </Link>
                </div>

                <p className="text-center text-white mt-16 font-semibold text-xl" data-aos="zoom-in" data-aos-delay="50">Hi, {user?.merchant?.name}</p>
            </div>

            <div id="all-balance" className="w-[90%] m-auto -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <img src={logo} className="w-[50px]" data-aos="fade-up" data-aos-delay="100" alt="" />

                <div className="w-full text-center">
                    <p className="font-semibold text-lg" data-aos="fade-up" data-aos-delay="150">Saldo Anda</p>

                    <div data-aos="fade-up" data-aos-delay="200" className="flex items-center justify-center gap-2">
                        {showBalance ? (
                            <p
                                className={`font-bold mt-2 text-orange-400 ${balance.amount > 99999999 ? "sm:text-3xl text-xl" : "sm:text-4xl text-2xl"
                                    }`}
                            >
                                {Number(balance.amount).toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                })}
                            </p>
                        ) : (
                            <p className="font-bold text-4xl mt-2 text-orange-400">Rp ****</p>
                        )}

                        <button
                            id="balance"
                            onClick={() => setShowBalance(!showBalance)}
                            type="button"
                            className="block mt-3"
                        >
                            {showBalance ? <Eye /> : <EyeOff />}
                        </button>
                    </div>
                </div>

                <div data-aos="fade-up" data-aos-delay="250" className="flex items-center w-full justify-center gap-5 mt-5">
                    <div className="text-center w-[100px] min-w-[100px]">
                        <p className="text-base text-gray-500">Non Tunai</p>

                        <p>{formatRupiah(Number(balance.non_cash_amount) ?? 0)}</p>
                    </div>

                    <div className="w-10 h-[2px] bg-gray-300 rotate-90"></div>

                    <div className="text-center w-[100px] min-w-[100px]">
                        <p className="text-base text-gray-500">Tunai</p>

                        <p>{formatRupiah(Number(balance.cash_amount) ?? 0)}</p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-between">
                    <div data-aos="fade-up" data-aos-delay="250" className="flex items-center gap-3">
                        <div className="w-10 min-w-10 min-h-10 h-10 flex items-center justify-center text-black bg-orange-400 rounded-full">
                            <HandCoins />
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Uang Masuk</p>

                            <p className="text-sm font-semibold">{formatRupiah(uangMasuk)}</p>
                        </div>
                    </div>

                    <div className="w-10 h-[2px] bg-gray-300 rotate-90"></div>

                    <div data-aos="fade-up" data-aos-delay="300" className="flex items-center gap-3">
                        <div className="w-10 min-w-10 min-h-10 h-10 flex items-center justify-center text-black bg-orange-400 rounded-full">
                            <CircleDollarSign />
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Uang Keluar</p>

                            <p className="text-sm font-semibold">{formatRupiah(uangKeluar)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="kasir-pelanggan-pemesanan" className="w-[90%] flex items-center gap-10 justify-center m-auto mt-5 -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <Link data-aos="fade-up" data-aos-delay="350" to={"/booking"} className="flex flex-col gap-2 items-center justify-center">
                    <div className="flex items-center justify-center p-3 bg-orange-400 rounded-full">
                        <ClipboardList className="text-white scale-[1.1]" />
                    </div>

                    <p className="text-sm uppercase">Pemesanan</p>
                </Link>

                <Link data-aos="fade-up" data-aos-delay="400" to={"/casheer"} className="flex flex-col gap-2 items-center justify-center">
                    <div className="flex items-center justify-center p-3 bg-orange-400 rounded-full">
                        <CirclePercent className="text-white scale-[1.1]" />
                    </div>

                    <p className="text-sm uppercase">Kasir</p>
                </Link>

                <Link data-aos="fade-up" data-aos-delay="400" to={"/customer"} className="flex flex-col gap-2 items-center justify-center">
                    <div className="flex items-center justify-center p-3 bg-orange-400 rounded-full">
                        <UsersRound className="text-white scale-[1.1]" />
                    </div>

                    <p className="text-sm uppercase">Pelanggan</p>
                </Link>
            </div>

            <div id="ppob" className="w-[90%] m-auto mt-5 -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <div className="flex items-center justify-between">
                    <Link data-aos="fade-up" data-aos-delay="450" to={'/pulsa'} className="flex m-auto flex-col items-center gap-3">
                        <Smartphone className="text-orange-400" />

                        <p className="uppercase text-center text-sm">Pulsa</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>

                    <Link data-aos="fade-up" data-aos-delay="500" to={'/pam'} className="flex m-auto flex-col items-center gap-3">
                        <Droplet className="text-orange-400" />

                        <p className="uppercase text-center text-sm">PDAM</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>

                    <Link data-aos="fade-up" data-aos-delay="550" to={'/listrik'} className="flex m-auto flex-col items-center gap-3">
                        <Zap className="text-orange-400" />

                        <p className="uppercase text-center text-sm">Listrik</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>
                    <Link data-aos="fade-up" data-aos-delay="550" to={'/bpjs'} className="flex m-auto flex-col items-center gap-3">
                        <ShieldCheck className="text-orange-400" />

                        <p className="uppercase text-center text-sm">BPJS</p>
                    </Link>
                </div>
            </div>

            <div id="date" className="w-[90%] m-auto mt-5 -translate-y-[110px] rounded-lg p-5 bg-white shadow-lg">
                <p className="text-center font-semibold text-lg my-5">Riwayat Transaksi Hari Ini</p>

                <div className="mt-10 flex flex-col gap-5">
                    {histories.length > 0 ? (
                        <div>
                            {histories.map((history, index) => (
                                <div key={index}>
                                    <div className={`${index === 0 ? "hidden" : "block"} w-full h-[2px] my-5 bg-gray-300 rounded-full`}></div>
                                    <div className="flex md:flex-row flex-col md:items-center justify-between">
                                        <div className="flex items-start gap-2">
                                            <img src={history?.channel ? `${import.meta.env.VITE_ISSUER_BANK_URL}/${history.channel}.png` : noIssuerImg} className="rounded-full w-10 h-10" alt="IMAGE" />
                                            <div className="flex flex-col items-start">
                                                <div className="flex md:flex-row flex-col md:gap-2 items-start">
                                                    <p className="uppercase text-sm">{history.sales_id == null ? "QRCode" : "Penjualan"} | {history.payment_method}</p>
                                                    <div className={`${history.transaction_status === "success" ? "bg-green-400 " : history.transaction_status === "pending" ? "bg-yellow-400" : "bg-red-400"} w-fit px-2 rounded-md text-white text-xs py-[0.5]"`}>
                                                        <p>{history.transaction_status}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 text-start">{history.transaction_id} | {history.sales ? history.sales.orderId : history.qr_transaction?.orderId}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end md:mt-0 mt-2">
                                            <p className="text-md font-semibold">{formatRupiah(history.total_amount)}</p>
                                            <div className="flex items-center">
                                                <p className="text-xs">{convertDate(history.transaction_date)}</p>
                                                <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>
                                                <p className="text-xs">{convertTime(history.transaction_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            <div className="flex flex-col items-center w-full mt-10">
                                <div className="flex justify-between items-center w-full mb-5">
                                    {/* Select di pojok kiri */}
                                    <Button>Lihat Semua Transaksi</Button>
                                    {/* Pagination di tengah */}
                                    <div className="flex items-center justify-end gap-5 flex-1">
                                        <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronsLeft />
                                        </Button>

                                        <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft />
                                        </Button>

                                        <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight />
                                        </Button>

                                        <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronsRight />
                                        </Button>
                                    </div>
                                </div>

                                {/* Info halaman */}
                                <p className="text-end items-end">Halaman {currentPage} dari {totalPages}</p>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-5">
                            <img className="p-5" src={imgNoTransaction} alt="No transactions" />
                            <p className="font-semibold text-lg text-orange-500">Belum ada transaksi hari ini</p>
                        </div>)
                    }
                </div>
            </div >

            {/* Notification for BPJS */}
            {showNotificationBPJS && <Notification message={"Fitur ini akan segera hadir"} onClose={() => { setShowNotificationBPJS(false) }} status={"error"} />}

            {/* {run && (
                <Joyride
                    callback={handleJoyrideCallback}
                    steps={steps}
                    run={run}
                    scrollToFirstStep
                    hideCloseButton={true} // Menyembunyikan tombol close
                    disableOverlayClose={true} // Menghindari tutup jika diklik di luar
                    continuous={true} // Langsung lanjut ke langkah berikutnya
                    // disableScrolling={true} // Mencegah scroll yang mengganggu
                    showSkipButton={false} // Menyembunyikan tombol skip
                    showProgress={true} // Menyembunyikan indikator progress
                    spotlightClicks={true} // Menyorot klik pada elemen
                />
            )} */}
        </div >
    );
};

export default Dashboard;
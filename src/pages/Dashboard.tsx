import { CircleDollarSign, CreditCard, Droplet, HandCoins, Home, Mail, ScanQrCode, ShieldCheck, Smartphone, Zap, UserRound, X, FileText, ClipboardList, CirclePercent } from "lucide-react";
import logo from "@/images/logo.png";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
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

interface IHistory {
    image: string;
    transaction_date: string;
    title: string;
    transaction_id: string;
    total_amount: number;
    date: string;
    time: string;
    transaction_status: "success" | "failed" | "pending";
    code: string;
    payment: {
        bank_name: string;
    }
}

const Dashboard = () => {
    // const [field, setField] = useState({ value: "" });
    const navigate = useNavigate();
    // const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to track dropdown open status
    const [showNotification, setShowNotification] = useState(true);
    const [balance, setBalance] = useState(0);
    const [user, setUser] = useState<any>();

    const [uangMasuk, setUangMasuk] = useState(0);
    const [uangKeluar, setUangKeluar] = useState(0);

    // const toggleDropdown = () => {
    //     setIsDropdownOpen((prev) => !prev); 
    // };

    // const handleDropdownChange = (value: string) => {
    //     setField({ value }); 
    // };

    useEffect(() => {
        // Ambil informasi user dari sessionStorage
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
            const token = localStorage.getItem("token");

            if (!token) {
                console.warn("Token tidak ditemukan untuk otorisasi.");
                return;
            }

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


    const [histories, setHistories] = useState<IHistory[]>([]);
    useEffect(() => {
        // Ambil informasi user dari sessionStorage
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;
        setUser(userData);

        const getTransaction = async () => {
            try {
                const response = await axiosInstance.get(
                    `/transactions/${userData.merchant.id}`,
                );
                console.log("Transaction Response:", response.data);
                setHistories(response.data);
            } catch (err: any) {
                console.log(err)
            }
        }
        getTransaction()
    }, []);
    return (
        <div className="w-full">
            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
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
                    <p className="text-2xl m-auto uppercase font-semibold text-center text-white">Home</p>

                    <Link to={'/inbox'} className="bg-transparent text-white absolute right-5 hover:bg-transparent">
                        <Mail className="scale-[1.3]" />
                    </Link>
                </div>

                <p className="text-center text-white mt-16 font-semibold text-xl">Hi, {user?.merchant?.name}</p>
            </div>

            <div className="w-[90%] m-auto -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <img src={logo} className="w-[50px]" alt="" />

                <div className="w-full text-center">
                    <p className="font-semibold text-lg">Saldo Anda</p>

                    <p className="font-bold text-4xl mt-2 text-orange-400">{Number(balance).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>
                </div>

                <div className="mt-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 min-w-10 min-h-10 h-10 flex items-center justify-center text-black bg-orange-400 rounded-full">
                            <HandCoins />
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Uang Masuk</p>

                            <p className="text-sm font-semibold">{formatRupiah(uangMasuk)}</p>
                        </div>
                    </div>

                    <div className="w-10 h-[2px] bg-gray-300 rotate-90"></div>

                    <div className="flex items-center gap-3">
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

            <div className="w-[90%] flex items-center gap-10 justify-center m-auto mt-5 -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <Link to={"/booking"} className="flex flex-col gap-2 items-center justify-center">
                    <div className="flex items-center justify-center p-3 bg-orange-400 rounded-full">
                        <ClipboardList className="text-white scale-[1.1]" />
                    </div>

                    <p className="text-sm uppercase">Pemesanan</p>
                </Link>

                <Link to={"/casheer"} className="flex flex-col gap-2 items-center justify-center">
                    <div className="flex items-center justify-center p-3 bg-orange-400 rounded-full">
                        <CirclePercent className="text-white scale-[1.1]" />
                    </div>

                    <p className="text-sm uppercase">Kasir</p>
                </Link>
            </div>

            <div className="w-[90%] m-auto mt-5 -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <div className="flex items-center justify-between">
                    <Link to={'/pulsa'} className="flex flex-col items-center gap-3">
                        <Smartphone className="text-orange-400" />

                        <p className="uppercase text-center text-sm">Pulsa</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>

                    <Link to={'/pam'} className="flex flex-col items-center gap-3">
                        <Droplet className="text-orange-400" />

                        <p className="uppercase text-center text-sm">PAM</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>

                    <Link to={'/listrik'} className="flex flex-col items-center gap-3">
                        <Zap className="text-orange-400" />

                        <p className="uppercase text-center text-sm">Listrik</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>

                    <Link to={'/bpjs'} className="flex flex-col items-center gap-3">
                        <ShieldCheck className="text-orange-400" />

                        <p className="uppercase text-center text-sm">BPJS</p>
                    </Link>
                </div>
            </div>

            <div className="w-[90%] m-auto mt-5 -translate-y-[110px] rounded-lg p-5 bg-white shadow-lg">
                <div className="flex items-center gap-5 justify-between">
                    <p className="text-base font-semibold">
                        Transaksi Terbaru -{' '}
                        {new Date().toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>

                    <hr />
                    {/* <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <div
                                className="flex items-center gap-5 border border-black rounded-lg p-2 justify-between cursor-pointer"
                                onClick={toggleDropdown}
                            >
                                <button>{field.value || "- Pilih -"}</button>

                                {isDropdownOpen ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg flex flex-col gap-3">
                            <DropdownMenuItem onClick={() => handleDropdownChange("Hari Ini")}>Hari Ini</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Minggu Ini")}>Minggu Ini</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Bulan Ini")}>Bulan Ini</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}
                </div>

                <div className="mt-10 flex flex-col gap-5">
                    {
                        histories.length === 0 && (
                            <div className="w-full mb-10 flex flex-col items-center justify-center text-center text-gray-500 gap-10">
                                <img src={imgNoTransaction} className="md:w-5/12 w-6/12" />
                                <p className="text-center text-orange-400 font-bold text-lg">
                                    Belum ada transaksi hari ini
                                </p>
                            </div>
                        )
                    }
                    {histories.map((history, index) => (
                        <div key={index}>
                            <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[2px] mb-5 bg-gray-300 rounded-full`}></div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-2">
                                    <img src={history.image} className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden" alt="IMAGE" />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="uppercase text-sm">{history.payment.bank_name}</p>

                                            <div className={`${history.transaction_status === 'success' ? 'bg-green-400' : history.transaction_status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5]`}>
                                                <p>{history.transaction_status}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400">{history.transaction_id}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-md font-semibold">{formatRupiah(history.total_amount)}</p>

                                    <div className="flex items-center">
                                        <p className="text-xs">
                                            {new Date(history.transaction_date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>

                                        <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                        <p className="text-xs">
                                            {new Date(history.transaction_date).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import { Button } from "@/components/ui/button";
import { ChevronDown, CircleDollarSign, CreditCard, Droplet, HandCoins, Home, Mail, ScanQrCode, ShieldCheck, Smartphone, Zap, History, UserRound } from "lucide-react";
import logo from "@/images/logo.jpg";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import linkaja from "@/images/linkaja.jpg";
import gopay from "@/images/gopay.png";
import ovo from "@/images/ovo.jpg";
import dana from "@/images/dana.jpg";
import { Link } from "react-router-dom";

const paymentHistory = [
    {
        image: linkaja,
        title: "LinkAja",
        amount: "Rp 100.000",
        date: "12/08/2021",
        time: "12:00",
        status: "success",
        code: "INV-1321214"
    },
    {
        image: gopay,
        title: "GoPay",
        amount: "Rp 50.000",
        date: "12/08/2021",
        time: "12:00",
        status: "failed",
        code: "INV-323023"
    },
    {
        image: ovo,
        title: "OVO",
        amount: "Rp 200.000",
        date: "12/08/2021",
        time: "12:00",
        status: "success",
        code: "INV-124958"
    },
    {
        image: dana,
        title: "DANA",
        amount: "Rp 150.000",
        date: "12/08/2021",
        time: "12:00",
        status: "pending",
        code: "INV-439230"
    },
    {
        image: dana,
        title: "DANA",
        amount: "Rp 170.000",
        date: "12/08/2021",
        time: "12:00",
        status: "pending",
        code: "INV-123456"
    }
]

const Dashboard = () => {
    const [field, setField] = useState({ value: "" });

    const handleDropdownChange = (value: string) => {
        setField({ value }); // Update the field state with the selected value
    };

    console.log(field.value);

    return (
        <div className="w-full">
            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <Home />

                    <p className="uppercase">Home</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />

                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to={'/'} className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <History />

                    <p className="uppercase">Riwayat</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className="w-full relative px-10 pt-10 pb-32 bg-orange-400">
                <div className="flex items-center gap-5">
                    <p className="text-2xl m-auto uppercase font-semibold text-center text-white">Home</p>

                    <Button className="bg-transparent absolute right-5 hover:bg-transparent">
                        <Mail className="scale-[1.5]" />
                    </Button>
                </div>

                <p className="text-center text-white mt-16 font-semibold text-xl">Hi, Kopi Tuku</p>
            </div>

            <div className="w-[90%] m-auto -translate-y-[110px] rounded-lg overflow-hidden p-5 bg-white shadow-lg">
                <img src={logo} className="w-[50px]" alt="" />

                <div className="w-full text-center">
                    <p className="font-semibold text-lg">Saldo Anda</p>

                    <p className="font-bold text-4xl mt-2 text-orange-400">200.000</p>
                </div>

                <div className="mt-10 flex items-center justify-center gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 min-w-10 min-h-10 h-10 flex items-center justify-center text-black bg-orange-400 rounded-full">
                            <HandCoins />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Uang Masuk</p>

                            <p className="text-sm font-semibold">IDR 500.000</p>
                        </div>
                    </div>

                    <div className="w-10 h-[2px] bg-gray-300 rotate-90"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 min-w-10 min-h-10 h-10 flex items-center justify-center text-black bg-orange-400 rounded-full">
                            <CircleDollarSign />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Uang Keluar</p>

                            <p className="text-sm font-semibold">IDR 300.000</p>
                        </div>
                    </div>
                </div>
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

                    <Link to={'/'} className="flex flex-col items-center gap-3">
                        <Zap className="text-orange-400" />

                        <p className="uppercase text-center text-sm">Listrik</p>
                    </Link>

                    <div className="w-10 min-w-10 h-[2px] min-h-[2px] bg-gray-300 rotate-90"></div>

                    <Link to={'/'} className="flex flex-col items-center gap-3">
                        <ShieldCheck className="text-orange-400" />

                        <p className="uppercase text-center text-sm">BPJS</p>
                    </Link>
                </div>
            </div>

            <div className="w-[90%] m-auto mt-5 -translate-y-[110px] rounded-lg p-5 bg-white shadow-lg">
                <div className="flex items-center gap-5 justify-between">
                    <p className="text-base font-semibold">Transaksi Terbaru</p>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-5 border border-black rounded-lg p-2 justify-between">
                                <button>{field.value || "- Pilih -"}</button>

                                <ChevronDown />
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg flex flex-col gap-3">
                            <DropdownMenuItem onClick={() => handleDropdownChange("Hari Ini")}>Hari Ini</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Minggu Ini")}>Minggu Ini</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Bulan Ini")}>Bulan Ini</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-10 flex flex-col gap-5">
                    {paymentHistory.map((payment, index) => (
                        <div key={index}>
                            <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[2px] mb-5 bg-gray-300 rounded-full`}></div>

                            <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-start gap-2">
                                    <img src={payment.image} className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden" alt="" />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="uppercase">{payment.title}</p>

                                            <div className={`${payment.status === 'success' ? 'bg-green-400' : payment.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-sm py-[0.5]`}>
                                                <p>{payment.status}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-400">{payment.code}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-lg font-semibold">{payment.amount}</p>

                                    <div className="flex items-center">
                                        <p className="text-sm">{payment.date}</p>

                                        <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                        <p className="text-sm">{payment.time}</p>
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

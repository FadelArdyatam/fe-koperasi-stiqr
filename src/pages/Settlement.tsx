import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, FileText, Info, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
// import CodePayment from "@/components/CodePayment";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import notransaction from "../images/no-transaction.png";
import AOS from "aos";
import "aos/dist/aos.css";

const Settlement = () => {
    // const [showCodePayment, setShowCodePayment] = useState(false);
    const [uangMasuk, setUangMasuk] = useState(0);
    const [uangKeluar, setUangKeluar] = useState(0);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showNotification, setShowNotification] = useState(true);

    useEffect(() => {
        AOS.init({ duration: 500, once: false });
    }, []);

    useEffect(() => {
        // Ambil informasi user dari sessionStorage
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

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

        getMoney()
    }, [])

    const onChange = (dates: [any, any]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    console.log("startDate: ", startDate);
    console.log("endDate: ", endDate);

    return (
        <div>
            {/* Header */}
            <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                <Link to="/dashboard" className="bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>

                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center uppercase">
                    Settlement
                </p>
            </div>

            {/* Navigation */}
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

            {/* Form Penarikan */}
            <div className="w-[90%] m-auto pb-10">
                <div data-aos="fade-up" data-aos-delay="100" className={`${showNotification ? 'flex' : 'hidden'} items-start gap-3 p-4 mt-24 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-sm`}>
                    <div className="text-blue-500">
                        <Info className="w-5 h-5" />
                    </div>

                    <div className="text-sm text-black">
                        <p>Penarikan dana pada malam hari antara 21.00 s/d 06.00 membutuhkan proses yang lebih lama. Stiqr menganjurkan penarikan dana di luar jam tersebut.</p>
                    </div>

                    <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div data-aos="fade-up" data-aos-delay="200" className={`${showNotification ? 'mt-10' : 'mt-24'} w-full border border-gray-300 rounded-lg p-5`}>
                    <div>
                        <p className="font-semibold text-lg">Total Saldo Stiqr</p>

                        <p className="mt-2 font-semibold text-3xl">{formatRupiah(uangMasuk)}</p>
                    </div>

                    <div className="w-full h-[1px] bg-gray-300 my-5"></div>

                    <div className="w-full flex flex-col gap-5">
                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Saldo Pemasukan</p>

                            <p className="font-semibold text-lg">{formatRupiah(uangMasuk)}</p>
                        </div>

                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-gray-500">Saldo Pengeluaran</p>

                            <p className="font-semibold text-lg">{formatRupiah(uangKeluar)}</p>
                        </div>
                    </div>
                </div>

                <div data-aos="fade-up" data-aos-delay="300" className="mt-5 flex flex-col gap-3">
                    <p>Saldo Yang Ingin Ditarik</p>

                    <Input placeholder="Masukkan Jumlah Saldo" />
                </div>

                <Button data-aos="fade-up" data-aos-delay="300" className="mt-5 w-full text-base bg-orange-500">Tarik Saldo</Button>
            </div>

            <div data-aos="fade-up" data-aos-delay="400" className="pb-20 rounded-lg border border-gray-500">
                {/* Button untuk Rentang Tanggal */}
                <div className="p-5 bg-white rounded-t-lg w-[100%]">
                    <p className="font-semibold text-lg">Riwayat Transaksi</p>

                    <Button
                        className="w-full mt-3 text-base font-medium bg-gray-200 text-gray-700 border border-gray-400 rounded-lg flex justify-center items-center px-3 py-2"
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

                    {/* Kalender DatePicker */}
                    {showCalendar && (
                        <div className="mt-3 border flex flex-col items-center p-2 border-gray-300 rounded-lg shadow-md">
                            <DatePicker
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                            <Button
                                className="w-full mt-2 bg-orange-500 text-white rounded-lg py-2"
                                onClick={() => setShowCalendar(false)}
                            >
                                Pilih
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-5">
                    <img className="p-5" src={notransaction} alt="" />

                    <p className="font-semibold text-lg text-orange-500">Belum ada transaksi hari ini</p>
                </div>
            </div>

            {/* {showCodePayment && <CodePayment />} */}
        </div>
    );
};

export default Settlement;

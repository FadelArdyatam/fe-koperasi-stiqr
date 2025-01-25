import { ChevronLeft, X, Banknote, Calculator, ArrowLeftRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { useRef, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import visa from "../images/visa.svg";
import masterCard from "../images/masterCard.png";
import gopay from "../images/gopay.png";
import ovo from "../images/ovo.jpg";
import dana from "../images/dana.jpg";
import linkAja from "../images/linkaja.jpg";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { Input } from "@/components/ui/input";
import axios from "axios";
import PaymentMethod from "./PaymentMethod.tsx/PaymentMethod";

const payments = [visa, masterCard, gopay, ovo, dana, linkAja];

interface QRCodePageProps {
    type: string;
    datas: any;
}

const QRCodePage: React.FC<QRCodePageProps> = ({ type, datas }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [amount, setAmount] = useState("");
    const [showOtherMethod, setShowOtherMethod] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [dataForPaymentMethod, setDataForPaymentMethod] = useState<any>(null);
    const [showPaymentMehodComponent, setShowPaymentMethodComponent] = useState(false);
    const [stringQR, setStringQR] = useState("");
    const [isLoading, setIsLoading] = useState(false); // State untuk loading
    const [timeLeft, setTimeLeft] = useState(300); // 5 menit dalam detik
    const navigate = useNavigate();

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    console.log("datas from QRCode: ", datas);
    console.log("type from QRCode: ", type);

    // Tambahkan useEffect di bawah definisi fungsi komponen
    useEffect(() => {
        const fetchQRCode = async () => {
            if (!datas || !Array.isArray(datas) || datas.length === 0) {
                console.warn("Datas is empty or invalid, skipping QR Code generation.");
                return;
            }

            setIsLoading(true); // Aktifkan loading

            try {
                const requestBody = {
                    email: "testerfinpay@gmail.com",
                    firstName: "Tester",
                    lastName: "Finpay",
                    mobilePhone: "+62048232329",
                    amount: datas.reduce((acc: number, curr: any) => acc + curr.price * curr.quantity, 0).toString(),
                    description: "Tester",
                    successUrl: "http://success",
                    type: "qris",
                    orderId: generateRandomString(15),
                    item: datas.map((data: any) => ({
                        name: data.product,
                        quantity: data.quantity.toString(),
                        unitPrice: data.price.toString(),
                    })),
                };

                console.log("Request Body: ", requestBody);

                const response = await axios.post("https://dev-middleware.idsmartcare.com/api/v1/finpay/initiate", requestBody);

                if (response.data) {
                    setShowQRCode(true);
                    setDataForPaymentMethod(requestBody)
                    setStringQR(response.data.response.stringQr);

                    // Countdown timer
                    const timer = setInterval(() => {
                        setTimeLeft((prevTime) => {
                            if (prevTime <= 1) {
                                clearInterval(timer);
                                navigate("/dashboard"); // Direct ke /dashboard setelah waktu habis
                                return 0;
                            }
                            return prevTime - 1;
                        });
                    }, 1000);

                    // Cleanup interval saat komponen di-unmount
                    return () => clearInterval(timer);
                } else {
                    alert("Gagal membuat link pembayaran. Mohon coba lagi.");
                }
            } catch (error) {
                console.error("Gagal membuat link pembayaran:", error);
                alert("Terjadi kesalahan saat menghubungi server. Mohon coba lagi.");
            } finally {
                setIsLoading(false); // Nonaktifkan loading
            }
        };

        fetchQRCode();
    }, [datas]);

    const generateRandomString = (length = 10) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    };

    const shareContent = async () => {
        try {
            if (navigator.share) {
                if (contentRef.current) {
                    // Tunggu gambar selesai dimuat
                    const images = (contentRef.current as HTMLElement).querySelectorAll("img");
                    const promises = Array.from(images).map(img => new Promise<void>(resolve => {
                        if (img.complete) resolve();
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    }));
                    await Promise.all(promises);

                    // Tangkap elemen dengan ukuran yang sesuai
                    const canvas = await html2canvas(contentRef.current, {
                        useCORS: true,
                        scale: 5, // Tingkatkan resolusi
                        width: contentRef.current.offsetWidth,
                        height: contentRef.current.offsetHeight,
                    });

                    const dataURL = canvas.toDataURL("image/png");
                    const response = await fetch(dataURL);
                    const blob = await response.blob();
                    const file = new File([blob], "CodePayment.png", { type: "image/png" });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: "QR Code Kedai Kopi",
                            text: "Pindai QR ini untuk melakukan pembayaran.",
                            files: [file],
                        });
                    } else {
                        alert("Perangkat ini tidak mendukung berbagi file.");
                    }
                }
            } else {
                alert("Fitur bagikan tidak didukung di perangkat ini.");
            }
        } catch (error) {
            console.error("Gagal membagikan:", error);
        }
    };

    const showShareLinkGenerator = async () => {
        if (!amount) {
            alert("Silakan masukkan jumlah pembayaran terlebih dahulu!");
            return;
        }

        if (type === '') {
            setIsLoading(true);

            try {
                const requestBody = {
                    email: "testerfinpay@gmail.com",
                    firstName: "Tester",
                    lastName: "Finpay",
                    mobilePhone: "+62048232329",
                    amount: amount, // Gunakan nilai dari state amount
                    description: "Tester",
                    successUrl: "http://success",
                    type: "qris",
                    orderId: generateRandomString(15) // ID pesanan unik
                };

                const response = await axios.post("https://dev-middleware.idsmartcare.com/api/v1/finpay/initiate", requestBody);

                if (response.data) {
                    setShowQRCode(true);

                    setDataForPaymentMethod(requestBody);

                    console.log(response.data)
                    // setShowShareLink(true);
                    setStringQR(response.data.response.stringQr);

                    // Countdown timer
                    const timer = setInterval(() => {
                        setTimeLeft((prevTime) => {
                            if (prevTime <= 1) {
                                clearInterval(timer);
                                navigate("/dashboard"); // Direct ke /dashboard setelah waktu habis
                                return 0;
                            }
                            return prevTime - 1;
                        });
                    }, 1000);

                    // Cleanup interval saat komponen di-unmount
                    return () => clearInterval(timer);
                } else {
                    alert("Gagal membuat link pembayaran. Mohon coba lagi.");
                }
            } catch (error) {
                console.error("Gagal membuat link pembayaran:", error);
                alert("Terjadi kesalahan saat menghubungi server. Mohon coba lagi.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const handleRadioChange = (method: string) => {
        setSelectedMethod(method);
    };

    console.log("stringQR from QRCode: ", stringQR);
    console.log("selectedMethod from QRCode: ", selectedMethod);

    return (
        <>
            {/* Tampilan QR Code */}
            <div className={`${showQRCode && showPaymentMehodComponent === false ? 'block' : 'hidden'} w-full min-h-screen p-8 bg-orange-400`}>
                <div className="flex items-center justify-between gap-5 w-full">
                    <Button onClick={() => { setShowQRCode(false); navigate("/dashboard") }} className="block bg-transparent hover:bg-transparent">
                        <X className="text-white scale-[1.5]" />
                    </Button>

                    <Link to={"/"} className="w-7 h-7 text-xl bg-white rounded-full flex items-center justify-center">
                        ?
                    </Link>
                </div>

                <div className="mt-20 font-medium text-center">
                    <p className="text-white">Pindai QR ini melalui Aplikasi Penerbit kamu.</p>

                    <p className="text-white font-semibold text-2xl">{formatTime(timeLeft)}</p> {/* Countdown Timer */}

                    <div className="mt-10 w-full p-5 bg-white shadow-lg rounded-t-lg">
                        <img src={logo} className="w-10" alt="Logo Kedai Kopi" />

                        <p className="mt-5 text-xl font-semibold">{userData.merchant.name}</p>

                        <div className="mt-10 w-full flex flex-col items-center p-5" ref={contentRef}>
                            <QRCode value={stringQR} size={200} />

                            <div className="mt-10">
                                <p>Menerima Pembayaran</p>

                                <div className="flex flex-col items-center gap-5 mt-5">
                                    <div className="flex items-center gap-5">
                                        {payments.slice(0, 2).map((payment, index) => (
                                            <img key={index} src={payment} className="w-10" alt="" />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-5 mt-2">
                                        {payments.slice(2, 6).map((payment, index) => (
                                            <img key={index} src={payment} className="w-8 bg-cover" alt="" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button onClick={shareContent} className="mt-10 text-orange-400 bg-transparent w-full">
                            Bagikan
                        </Button>

                        <Button onClick={() => setShowOtherMethod(true)} className="mt-5">Pilih Metode Pembayaran Lain</Button>
                    </div>

                    <div className="relative rotate-180">
                        <div className="w-full h-8 bg-orange-400 relative overflow-hidden">
                            {/* Pola Gerigi */}
                            <div className="absolute bottom-0 left-0 w-full h-5 bg-white" style={{
                                clipPath: 'polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)'
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Jumlah Pembayaran */}
            <div className={`${showQRCode || type !== '' ? "hidden" : "block"}`}>
                <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                    <Link to={"/dashboard"} className="bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Link>

                    <p className="font-semibold m-auto text-xl text-white text-center uppercase">
                        QR Code
                    </p>
                </div>

                <div className="mt-28 w-[90%] shadow-lg m-auto p-5 rounded-lg bg-white">
                    <p className="text-gray-700 font-medium">Input Amount</p>

                    <div className="relative mt-5">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            Rp
                        </span>
                        <Input
                            type="number"
                            className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <Button onClick={showShareLinkGenerator} className="uppercase !mt-20 w-[90%] m-auto bg-green-400 block">
                    Buat
                </Button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-orange-400 z-50">
                    <p className="text-white text-xl font-medium">Loading QR Code...</p>
                </div>
            )}

            {/* Metode Pembayaran Lain */}
            <div className={`${showOtherMethod ? "block" : "hidden"} fixed bg-black inset-0 bg-opacity-50 flex items-end justify-center`}>
                <div className="w-full bg-white rounded-t-lg p-5">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-lg">Pilih Metode Pembayaran</p>

                        <Button onClick={() => setShowOtherMethod(false)} className="bg-transparent">
                            <X className="text-gray-500 scale-[1.5]" />
                        </Button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <label className="flex items-center w-full justify-between">
                            <div className="text-black flex items-center gap-3 font-semibold text-lg">
                                <Banknote />

                                <p>Tunai</p>
                            </div>

                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedMethod === "Tunai"}
                                onChange={() => handleRadioChange("Tunai")}
                                className="form-radio h-5 w-5 text-orange-400"
                            />
                        </label>

                        <label className="flex items-center w-full justify-between">
                            <div className="text-black flex items-center gap-3 font-semibold text-lg">
                                <Calculator />

                                <p>EDC</p>
                            </div>

                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedMethod === "EDC"}
                                onChange={() => handleRadioChange("EDC")}
                                className="form-radio h-5 w-5 text-orange-400"
                            />
                        </label>

                        <label className="flex items-center w-full justify-between">
                            <div className="text-black flex items-center gap-3 font-semibold text-lg">
                                <ArrowLeftRight />

                                <p>Transfer</p>
                            </div>

                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedMethod === "Transfer"}
                                onChange={() => handleRadioChange("Transfer")}
                                className="form-radio h-5 w-5 text-orange-400"
                            />
                        </label>
                    </div>

                    <Button
                        onClick={() => {
                            setShowOtherMethod(false);
                            setShowPaymentMethodComponent(true);
                        }}
                        className="mt-5 w-full bg-orange-400 text-white"
                    >
                        Simpan Pilihan
                    </Button>
                </div>
            </div>

            {/* Komponen Metode Pembayaran */}
            {showPaymentMehodComponent && <PaymentMethod dataPayment={dataForPaymentMethod} setShowPaymentMethodComponent={setShowPaymentMethodComponent} selectedMethod={selectedMethod} />}
        </>
    );
};

export default QRCodePage;

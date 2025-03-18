import { ChevronLeft, X, Banknote, Calculator, ArrowLeftRight, CircleAlert, CreditCard, FileText, Home, ScanQrCode, UserRound } from "lucide-react";
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
import PaymentMethod from "./PaymentMethod.tsx/PaymentMethod";
import { getSocket } from "@/hooks/websocket";
import axiosInstance from "@/hooks/axiosInstance";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog";
import Notification from "@/components/Notification";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";
import CalculatorComponent from "@/components/CalculatorComponent";

const payments = [visa, masterCard, gopay, ovo, dana, linkAja];

interface QRCodePageProps {
    type: string;
    orderId?: string | null;
    stringQR?: string | null;
    showQRCode?: boolean;
    setShowQRCode?: React.Dispatch<React.SetStateAction<boolean>>;
    timeLeftOpenBill?: number;
    dataAmount?: any;
    sales_id?: string;
}

const QRCodePage: React.FC<QRCodePageProps> = ({ type, orderId, stringQR, showQRCode, setShowQRCode, timeLeftOpenBill, dataAmount, sales_id }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    // const [showQRCode, setShowQRCode] = useState(false);
    const [amount, setAmount] = useState("");
    const [showOtherMethod, setShowOtherMethod] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [dataForPaymentMethod, setDataForPaymentMethod] = useState<any>(null);
    const [showPaymentMehodComponent, setShowPaymentMethodComponent] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    // const [stringQR, setStringQR] = useState("");
    const [error, setError] = useState({ show: false, message: "" });
    const [isLoading, setIsLoading] = useState(false); // State untuk loading
    const [timeLeft, setTimeLeft] = useState(300); // 5 menit dalam detik
    const navigate = useNavigate();

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const [orderIdInstant, setOrderIdInstant] = useState<string | null>(null)

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    useEffect(() => {
        if (orderId || orderIdInstant) {
            setDataForPaymentMethod({
                sales_id: sales_id,
                amount: dataAmount,
            })

            const socket = getSocket();
            const handlePaymentSuccess = (data: { orderId: string; status: string; amount?: number }) => {
                if ((orderId === data.orderId || orderIdInstant === data.orderId) && data.status === 'PAID') {
                    navigate('/payment-success', {
                        state: {
                            orderId: data.orderId ?? "dummy-order-id",
                            amount: data.amount ?? 0,
                        },
                    });
                }
            };
            socket.on('payment:success', handlePaymentSuccess);
            return () => {
                console.log('Cleaning up WebSocket listeners for QRCODE');
                socket.off('payment:success', handlePaymentSuccess);
            };
        }
    }, [orderId, navigate, orderIdInstant]);

    // Tambahkan useEffect di bawah definisi fungsi komponen
    // useEffect(() => {

    //     const fetchQRCode = async () => {
    //         // if (!datas || !Array.isArray(datas) || datas.length === 0) {
    //         //     console.warn("Datas is empty or invalid, skipping QR Code generation.");
    //         //     return;
    //         // }

    //         if (type !== "kasir") {
    //             // Jika type bukan "kasir", tidak menjalankan efek ini
    //             return;
    //         }

    //         setIsLoading(true); // Aktifkan loading

    //         try {
    //             const requestBody = {
    //                 email: "testerfinpay@gmail.com",
    //                 firstName: "Tester",
    //                 lastName: "Finpay",
    //                 mobilePhone: "+62048232329",
    //                 amount: calculateTotalAmount(),
    //                 description: "Tester",
    //                 successUrl: "http://success",
    //                 type: "qris",
    //                 orderId: orderId,
    //                 item:prepareItems(),
    //             };

    //             console.log("Request Body: ", requestBody);

    //             const response = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/finpay/initiate`, requestBody);

    //             console.log('initiate : ')
    //             console.log(response);
    //             if (response.data) {
    //                 setShowQRCode(true);
    //                 setDataForPaymentMethod(requestBody)
    //                 setStringQR(response.data.response.stringQr);

    //         console.log('initiate : ')
    //         console.log(response);
    //         if (response.data) {
    //             setShowQRCode(true);
    //             setDataForPaymentMethod(requestBody)
    //             setStringQR(response.data.response.stringQr);

    //             // Countdown timer
    //             const timer = setInterval(() => {
    //                 setTimeLeft((prevTime) => {
    //                     if (prevTime <= 1) {
    //                         clearInterval(timer);
    //                         navigate("/dashboard"); // Direct ke /dashboard setelah waktu habis
    //                         return 0;
    //                     }
    //                     return prevTime - 1;
    //                 });
    //             }, 1000);

    //             // Cleanup interval saat komponen di-unmount
    //             return () => clearInterval(timer);
    //         } else {
    //             alert("Gagal membuat link pembayaran. Mohon coba lagi.");
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         console.error("Gagal membuat link pembayaran:", error);
    //         alert("Terjadi kesalahan saat menghubungi server. Mohon coba lagi.");
    //     } finally {
    //         setIsLoading(false); // Nonaktifkan loading
    //     }
    // };
    //             } else {
    //                 alert("Gagal membuat link pembayaran. Mohon coba lagi.");
    //             }
    //         } catch (error) {
    //             console.log(error)
    //             console.error("Gagal membuat link pembayaran:", error);
    //             alert("Terjadi kesalahan saat menghubungi server. Mohon coba lagi.");
    //         } finally {
    //             setIsLoading(false); // Nonaktifkan loading
    //         }
    //     };

    //     fetchQRCode();
    // }, [orderId]);

    console.log("dataForPaymentMethod", dataForPaymentMethod);

    console.log("OrderId", orderId)

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

    const [stringQRInstant, setStringQRInstant] = useState<string | null>(null)
    const [showQRInstant, setShowQRInstant] = useState<boolean | null>(null)

    const showShareLinkGenerator = async () => {
        if (!amount) {
            setError({ show: true, message: "Silakan masukkan jumlah pembayaran terlebih dahulu!" });
            return;
        }

        if (type === '') {
            setIsLoading(true);
            const generateRandomString = (length = 10) => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
            };
            const generateOrderId = generateRandomString(15)
            try {
                const requestBody = {
                    email: "testerfinpay@gmail.com",
                    firstName: "Tester",
                    lastName: "Finpay",
                    mobilePhone: "+62048232329",
                    amount: amount,
                    description: "Tester",
                    successUrl: "http://success",
                    type: "qris",
                    orderId: generateOrderId
                };

                const paymentQR = {
                    orderId: generateOrderId,
                    amount: amount,
                    merchant_id: userData.merchant.id,
                }

                const initiateHooks = await axiosInstance.post("/finpay/initiate", requestBody);
                const paymentQRHooks = await axiosInstance.post('/sales/payment-qr', paymentQR)

                console.log(initiateHooks)
                console.log(paymentQRHooks)

                if (initiateHooks.data) {
                    setStringQRInstant(initiateHooks.data.response.stringQr);
                    setDataForPaymentMethod(requestBody);
                    setShowQRInstant(true);
                    setOrderIdInstant(generateOrderId)

                    const timer = setInterval(() => {
                        setTimeLeft((prevTime) => {
                            if (prevTime <= 1) {
                                clearInterval(timer);
                                navigate("/dashboard");
                                return 0;
                            }
                            return prevTime - 1;
                        });
                    }, 1000);

                    return () => clearInterval(timer);
                } else {
                    alert("Gagal membuat link pembayaran. Mohon coba lagi.");
                }
            } catch (error) {
                console.log(error)
                console.log("Gagal membuat link pembayaran:", error);
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

    const handleCancelPayment = async () => {
        try {
            const response = await axiosInstance.post("/sales/cancel-payment", {
                orderId: orderIdInstant ?? orderId
            })
            if (response.data.success) {
                if (setShowQRCode) {
                    setShowQRCode(false);
                }
                navigate('/dashboard')
            }
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <>
            {/* Tampilan QR Code */}
            <div className={`${(showQRCode || showQRInstant) && showPaymentMehodComponent === false ? 'block' : 'hidden'} w-full min-h-screen p-8 bg-orange-400`}>
                <div className="flex items-center justify-between gap-5 w-full">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="block bg-transparent hover:bg-transparent">
                                <X className="text-white scale-[1.5]" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                            className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-black bg-opacity-50 backdrop-blur-sm"
                        >
                            <div data-aos="zoom-in" className="bg-white text-center p-5 rounded-lg shadow-lg w-[90%]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-semibold text-lg">
                                        <CircleAlert className="m-auto" />

                                        <p className="text-center">Apakah Anda benar-benar yakin?</p>
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-center">
                                        Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus pembayaran Anda secara permanen.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-5 flex flex-col gap-3">
                                    <AlertDialogAction
                                        className="w-full p-2 rounded-lg bg-green-500 text-white"
                                        onClick={handleCancelPayment}
                                    >
                                        Lanjutkan
                                    </AlertDialogAction>
                                    <AlertDialogCancel className="w-full p-2 rounded-lg bg-red-500 text-white">
                                        Batalkan
                                    </AlertDialogCancel>
                                </AlertDialogFooter>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="sm:mt-0 mt-10 font-medium text-center">
                    <p className="text-white" data-aos="fade-up">Pindai QR ini melalui Aplikasi Penerbit kamu.</p>

                    <p className="text-white font-semibold text-2xl" data-aos="fade-up" data-aos-delay="100">{formatTime(timeLeftOpenBill ?? timeLeft)}</p> {/* Countdown Timer */}

                    <div className="mt-10 w-full p-5 bg-white shadow-lg rounded-t-lg">
                        <img src={logo} className="w-10" alt="Logo" data-aos="fade-up" data-aos-delay="150" />

                        <p className="mt-5 text-xl font-semibold" data-aos="fade-up" data-aos-delay="200">{userData.merchant.name}</p>

                        <p className="mt-3 text-xl font-semibold">{formatRupiah(amount || dataForPaymentMethod?.amount || 0)}</p>

                        <div className="mt-10 w-full flex flex-col items-center p-5" data-aos="fade-up" data-aos-delay="250" ref={contentRef}>
                            {stringQR && <QRCode value={stringQR} size={200} />}
                            {stringQRInstant && <QRCode value={stringQRInstant} size={200} />}
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

                        <Button onClick={() => setShowOtherMethod(true)} className={`${sales_id !== undefined ? 'block w-full' : 'hidden'} mt-5`}>Pilih Metode Pembayaran Lain</Button>
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
            <div className={`${(showQRCode || showQRInstant) || type !== '' ? "hidden" : "block"}`}>
                <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                    <Link to={"/dashboard"} className="bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Link>

                    <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center uppercase">
                        QR Code
                    </p>
                </div>

                <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                    <Link to={'/dashboard'} className="flex gap-3 flex-col items-center">
                        <Home />

                        <p className="uppercase">Home</p>
                    </Link>

                    <Link to={'/qr-code'} className="flex gap-3 flex-col text-orange-400 items-center">
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

                <div data-aos="fade-up" data-aos-delay="100" className="mt-28 w-[90%] shadow-lg m-auto p-5 rounded-lg bg-white">
                    <p className="text-gray-700 font-medium">Keterangan</p>

                    <div className="relative mt-3">
                        <Input type="text" className="pl-2 w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
                    </div>

                    <p className="text-gray-700 font-medium mt-5">Masukan Jumlah</p>

                    <div className="relative mt-3">
                        <Input
                            type="text"
                            inputMode="numeric"  // Menampilkan keyboard angka di mobile
                            pattern="[1-9][0-9]*"  // Mencegah karakter non-angka dan angka 0 di awal
                            className="pl-2 w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, ""); // Hanya angka

                                // Mencegah angka nol di awal
                                if (value.startsWith("0")) {
                                    value = value.replace(/^0+/, ""); // Hapus semua nol di awal
                                }

                                if (value.length <= 10) {
                                    setAmount(value);
                                }
                            }}
                            value={formatRupiah(amount)}
                            placeholder="1.00" // Placeholder awal minimal 1 rupiah
                        />
                    </div>
                </div>

                <div className="m-auto flex items-center gap-5 w-[90%] !mt-10">
                    <button type="button" onClick={() => setShowCalculator(true)} className="bg-orange-500 text-white rounded-lg p-2"><Calculator /></button>

                    <Button onClick={showShareLinkGenerator} disabled={Number(amount) <= 0 ? true : false} className={`${Number(amount) <= 0 ? 'bg-gray-500' : 'bg-green-400'} transition-all uppercase w-full m-auto block`}>
                        Buat
                    </Button>
                </div>

                {showCalculator && <CalculatorComponent setAmount={setAmount} amount={amount} setShowCalculator={setShowCalculator} />}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-orange-400 z-50">
                    <p className="text-white text-xl font-medium">Loading QR Code...</p>
                </div>
            )}

            {/* Error */}
            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}

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

            {showPaymentMehodComponent && <PaymentMethod dataPayment={dataForPaymentMethod} setShowPaymentMethodComponent={setShowPaymentMethodComponent} selectedMethod={selectedMethod} orderId={orderId} />}
        </>
    );
};

export default QRCodePage;

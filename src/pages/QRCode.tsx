import { ChevronLeft, X, Banknote, Calculator, CircleAlert, CreditCard, FileText, Home, ScanQrCode, UserRound, Share, Info } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { QRCodeStatic } from "./QRCodeStatic";
import successAudio from '../images/sound.mp3';
import noQris from '../images/no-qris.png'


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
    const location = useLocation();
    const isManual = location.state?.isManual || false;

    useEffect(() => {
        if (isManual) {
            console.log('Mode manual QR aktif');
            setIsQrisStatic(false)
        }
    }, [isManual]);
    const [amount, setAmount] = useState("");
    const [keterangan, setKeterangan] = useState("")
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

    const [showNotification, setShowNotification] = useState(false);

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const [orderIdInstant, setOrderIdInstant] = useState<string | null>(null)
    const [isActiveQris, setIsActiveQris] = useState(false)
    const [loading, setLoading] = useState(false)
    const [qrisStaticUrl, setQrisStaticUrl] = useState("")
    const [subMerchantId, setSubMerchantId] = useState<string>("");
    useEffect(() => {
        const checkQris = async () => {
            setLoading(true)
            try {
                const check = await axiosInstance.get('/merchant/check-qris')

                console.log(check)

                if (check.data.success) {
                    setIsActiveQris(true)
                    setQrisStaticUrl(check.data.data.image_qris)
                    setSubMerchantId(check.data.data.subMerchantId)
                } else {
                    setIsQrisStatic(false)
                }
            } catch (error) {
                setIsActiveQris(false)
                setIsQrisStatic(false)
            } finally {
                setLoading(false)
            }
        }

        checkQris()
    }, []);

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    useEffect(() => {
        console.log(orderId)
        console.log(orderIdInstant)
        if (orderId || orderIdInstant) {
            setDataForPaymentMethod({
                sales_id: sales_id,
                amount: dataAmount,
            })

            const socket = getSocket();
            const handlePaymentSuccess = (data: { orderId: string; status: string; amount?: number }) => {
                if ((orderId === data.orderId || orderIdInstant === data.orderId) && (data.status === 'PAID' || data.status === "SUCCESS")) {
                    const audio = new Audio(successAudio)
                    audio.play()
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

    const shareContent = async () => {
        try {
            if (contentRef.current) {
                // Tunggu semua gambar dalam elemen dimuat sebelum menangkap screenshot
                const images = contentRef.current.querySelectorAll("img");
                const promises = Array.from(images).map(img => new Promise<void>(resolve => {
                    if (img.complete) resolve();
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                }));
                await Promise.all(promises);

                // Tangkap elemen ke dalam canvas
                const canvas = await html2canvas(contentRef.current, {
                    useCORS: true,
                    scale: 2,
                    width: contentRef.current.offsetWidth,
                    height: contentRef.current.offsetHeight,
                });

                // Konversi canvas ke Blob
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        alert("Gagal membuat gambar.");
                        return;
                    }

                    const file = new File([blob], "CodePayment.png", { type: "image/png" });
                    const textMessage = "📌 Pindai QR ini untuk melakukan pembayaran di Kedai Kopi.";

                    try {
                        // 🔹 1. SALIN TEKS & GAMBAR KE CLIPBOARD
                        if (navigator.clipboard && window.ClipboardItem) {
                            const textBlob = new Blob([textMessage], { type: "text/plain" });
                            const clipboardItems = [
                                new ClipboardItem({
                                    "image/png": blob,
                                    "text/plain": textBlob,
                                })
                            ];
                            await navigator.clipboard.write(clipboardItems);
                            setShowNotification(true);
                        } else {
                            throw new Error("Clipboard API tidak mendukung gambar.");
                        }

                        // 🔹 2. TAMPILKAN MENU SHARE KE WHATSAPP, TELEPON, DLL.
                        if (navigator.share && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: "QR Code Kedai Kopi",
                                text: textMessage,
                                files: [file], // Gambar yang akan dibagikan
                            });
                        } else {
                            alert("❌ Perangkat ini tidak mendukung fitur berbagi file.");
                        }
                    } catch (error) {
                        console.warn("❌ Gagal membagikan:", error);

                        // Fallback: Unduh gambar jika clipboard tidak mendukung
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = "CodePayment.png";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setError({ show: true, message: "Gagal membagikan. Gambar berhasil diunduh." });
                    }
                }, "image/png");
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
            const generateOrderId = `S${generateRandomString(15)}`;

            const requestBody = {
                email: userData.email,
                firstName: userData.merchant.name,
                lastName: userData.username,
                mobilePhone: userData.phone_number.replace(/^08/, '+628'),
                amount: amount,
                description: "Pembayaran",
                successUrl: "http://success",
                type: "qris",
                orderId: generateOrderId
            };

            const paymentQR = {
                orderId: generateOrderId,
                amount: amount,
                keterangan: keterangan,
                merchant_id: userData.merchant.id,
            };

            try {
                // --- NOBU PAYMENT ---
                const nobuRequest = {
                    partnerReferenceNo: generateOrderId,
                    amount: {
                        value: `${amount}.00`,
                        currency: "IDR"
                    },
                };

                const initiateHooks = await axiosInstance.post("/nobu/generate-qris/v1.2/qr/qr-mpm-generate/", nobuRequest);
                await axiosInstance.post('/sales/payment-qr', paymentQR);

                if (initiateHooks.data && initiateHooks.data.qrContent) {
                    setStringQRInstant(initiateHooks.data.qrContent);
                    setDataForPaymentMethod(requestBody);
                    setShowQRInstant(true);
                    setOrderIdInstant(generateOrderId);

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
                }

                throw new Error("NOBU gagal tanpa response valid");

            } catch (error: any) {
                // alert(`${error.response.data.message}`);
                setError({ show: true, message: error.response.data.message })
                navigate('/qr-code');

                // --- Fallback Finpay dinonaktifkan, tetap disimpan untuk referensi ---
                /*
                try {
                    const initiateHooks = await axiosInstance.post("/finpay/initiate", requestBody);
                    await axiosInstance.post('/sales/payment-qr', paymentQR);
            
                    if (initiateHooks.data && initiateHooks.data.response?.stringQr) {
                        setStringQRInstant(initiateHooks.data.response.stringQr);
                        setDataForPaymentMethod(requestBody);
                        setShowQRInstant(true);
                        setOrderIdInstant(generateOrderId);
            
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
                } catch (finpayError) {
                    alert("Gagal Melakukan Pembayaran. Silakan coba lagi nanti.");
                    navigate('/booking');
                }
                */
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length >= 50) {
            setError({ show: false, message: "Maksimal 30 karakter." });
            return;
        } else {
            setKeterangan(value);
        }
    };

    const [isQrisStatic, setIsQrisStatic] = useState(true);

    return (
        <>

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

                        <div className="flex items-center gap-5 w-full mt-5 justify-center">
                            <Button onClick={shareContent} className="text-white bg-transparent rounded-full w-10 h-10 bg-orange-400 border-2 border-orange-400">
                                <Share />
                            </Button>
                            {/* 
                            <Button className="text-white bg-transparent rounded-full w-10 h-10 bg-orange-400 border-2 border-orange-400">
                                <Download />
                            </Button> */}
                        </div>

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
                <div className={`fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400 ${isQrisStatic && !loading ? 'md:pb-56' : ''} `}>
                    <Link to={"/dashboard"} className="bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Link>

                    <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center uppercase">
                        QR Code
                    </p>
                </div>

                <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-30">
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

                {loading && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )}

                {!loading && (
                    <div className={`m-auto p-5 rounded-lg ${!isQrisStatic ? 'bg-white shadow-lg mt-28 w-[90%]' : 'w-[80%] md:mt-10 mt-20'} `}>
                        {!isActiveQris ? (
                            <div className="flex flex-col items-center justify-center text-center text-gray-700">
                                <img src={noQris} className="md:w-3/12 h-auto mb-4 z-20" alt="QRIS Belum Aktif" />
                                <h2 className="md:text-md text-sm font-semibold  md:w-3/4 pb-10">
                                    Fitur QRIS saat ini belum aktif. Proses pengajuan QRIS sedang berlangsung dan diperkirakan memerlukan waktu 2 hingga 4 hari kerja.
                                </h2>
                            </div>
                        ) : isQrisStatic ? (
                            <QRCodeStatic
                                url={qrisStaticUrl}
                                setIsQrisStatic={setIsQrisStatic}
                                subMerchantId={subMerchantId} />
                        ) : (
                            <>
                                <div className="flex md:flex-row flex-col items-center gap-3 bg-blue-50 px-2 py-3 rounded-md shadow-sm border border-blue-200 mb-3">
                                    <div className="flex gap-2">
                                        <Info className="md:w-4 md:h-4 w-5 h-5 text-blue-500" />
                                        <p className="text-sm md:hidden block text-blue-500 font-semibold">Info</p>
                                    </div>
                                    <p className="text-xs text-gray-800">
                                        Masukkan nominal pembayaran dan keterangan transaksi. QR Code akan aktif secara otomatis dan dapat dipindai atau dibagikan kepada pembeli.
                                    </p>
                                </div>

                                <p className="text-gray-700 font-medium">Keterangan</p>
                                <div className="relative mt-3">
                                    <Input onChange={(e) => handleChange(e)} maxLength={50} type="text" className="pl-2 w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
                                    <div className="flex flex-row justify-between mt-2">
                                        <p className="text-xs text-gray-400 italic">*Maksimal 50 karakter</p>
                                        <p className="text-xs text-gray-400">{`${keterangan.length + 1}/50`}</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 font-medium mt-5">Masukan Jumlah</p>
                                <div className="relative mt-3">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[1-9][0-9]*"
                                        className="pl-2 w-full border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, "");
                                            if (value.startsWith("0")) {
                                                value = value.replace(/^0+/, "");
                                            }
                                            if (value.length <= 9) {
                                                setAmount(value);
                                            }
                                        }}
                                        value={formatRupiah(amount)}
                                        placeholder="1.000"
                                    />
                                </div>

                                <div className="m-auto flex items-center gap-5 mt-10">
                                    <button type="button" onClick={() => setShowCalculator(true)} className="bg-orange-500 text-white rounded-lg p-2"><Calculator /></button>
                                    <Button onClick={showShareLinkGenerator} disabled={Number(amount) <= 0} className={`${Number(amount) <= 0 ? 'bg-gray-500' : 'bg-green-400'} transition-all uppercase w-full`}>
                                        Buat
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}


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
                        <div
                            onClick={() => handleRadioChange("Tunai")}
                            className={`flex items-center justify-between cursor-pointer border p-4 rounded-lg transition ${selectedMethod === "Tunai" ? "bg-orange-100 border-orange-400" : "bg-white border-gray-300"} hover:bg-orange-50`}>
                            <div className="text-black flex items-center gap-3 font-semibold text-lg">
                                <Banknote />
                                <p>Tunai</p>
                            </div>

                            <div
                                className={`w-4 h-4 rounded-full border-2 ${selectedMethod === "Tunai" ? "border-orange-400 bg-orange-400" : "border-gray-400"}`}
                            />
                        </div>
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

            {/* Notification */}
            {showNotification && <Notification message={"Gambar dan teks berhasil disalin ke clipboard!"} onClose={() => setShowNotification(false)} status={"success"} />}

            {showPaymentMehodComponent && <PaymentMethod dataPayment={dataForPaymentMethod} setShowPaymentMethodComponent={setShowPaymentMethodComponent} selectedMethod={selectedMethod} orderId={orderId} />}
        </>
    );
};

export default QRCodePage;

import { ChevronLeft, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import { useRef, useState } from "react";
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

const payments = [visa, masterCard, gopay, ovo, dana, linkAja];

const QRCodePage = () => {
    const contentRef = useRef(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [amount, setAmount] = useState("");
    // const [showShareLink, setShowShareLink] = useState(false);
    // const [copySuccess, setCopySuccess] = useState("");
    const [stringQR, setStringQR] = useState("");

    const generateRandomString = (length = 10) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    };

    const shareContent = async () => {
        try {
            if (navigator.share) {
                if (contentRef.current) {
                    const canvas = await html2canvas(contentRef.current, { useCORS: true });
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

                console.log(response.data)
                // setShowShareLink(true);
                setStringQR(response.data.response.stringQr);
            } else {
                alert("Gagal membuat link pembayaran. Mohon coba lagi.");
            }
        } catch (error) {
            console.error("Gagal membuat link pembayaran:", error);
            alert("Terjadi kesalahan saat menghubungi server. Mohon coba lagi.");
        }
    };

    // const copyLinkToClipboard = () => {
    //     navigator.clipboard.writeText(linkPayment).then(
    //         () => {
    //             setCopySuccess("Link berhasil disalin!");
    //             setTimeout(() => setCopySuccess(""), 3000); // Reset message after 3 seconds
    //         },
    //         () => {
    //             alert("Gagal menyalin link.");
    //         }
    //     );
    // };

    return (
        <>
            {/* Tampilan QR Code */}
            <div className={`${showQRCode ? 'block' : 'hidden'} w-full min-h-screen p-8 bg-orange-400`}>
                <div className="flex items-center justify-between gap-5 w-full">
                    <Button onClick={() => setShowQRCode(false)} className="block bg-transparent hover:bg-transparent">
                        <X className="text-white scale-[1.5]" />
                    </Button>

                    <Link to={"/"} className="w-7 h-7 text-xl bg-white rounded-full flex items-center justify-center">
                        ?
                    </Link>
                </div>

                <div className="mt-20 font-medium text-center">
                    <p className="text-white">Pindai QR ini melalui Aplikasi Penerbit kamu.</p>

                    <div className="mt-10 w-full p-5 bg-white shadow-lg rounded-t-lg">
                        <img src={logo} className="w-10" alt="Logo Kedai Kopi" />

                        <p className="mt-5 text-xl font-semibold">Kedai Kopi</p>

                        <div className="mt-10 w-full flex flex-col items-center" ref={contentRef}>
                            <QRCode className="m-auto" value={stringQR} size={200} />

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
            <div className={`${showQRCode ? "hidden" : "block"}`}>
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

            {/* Share Link */}
            {/* <div className={`${showShareLink ? "block" : "hidden"} w-full`}>
                <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                    <Button onClick={() => setShowShareLink(false)} className="bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Button>

                    <p className="font-semibold m-auto text-xl text-white text-center uppercase">
                        Share a Link
                    </p>
                </div>

                <div className="mt-28 w-[90%] m-auto text-center p-5 bg-white shadow-lg rounded-lg flex flex-col items-center">
                    <p className="font-medium">Send anyone this link to the campaign.</p>

                    <div className="flex flex-col items-end">
                        <div className="p-3 border border-gray-500 w-full rounded-lg mt-5">
                            <a href={linkPayment} className="text-blue-500 underline break-all">
                                {linkPayment}
                            </a>
                        </div>

                        <Button onClick={copyLinkToClipboard} className="mt-3 bg-transparent text-orange-400 hover:bg-transparent">
                            Copy Link
                        </Button>
                    </div>

                    {copySuccess && <p className="mt-5 text-green-500">{copySuccess}</p>}
                </div>
            </div> */}
        </>
    );
};

export default QRCodePage;

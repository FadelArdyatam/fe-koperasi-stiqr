import { ChevronLeft, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../images/logo.jpg";
import { useEffect, useRef, useState } from "react";
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

const payments = [visa, masterCard, gopay, ovo, dana, linkAja];

const QRCodePage = () => {
    const [qrValue, setQrValue] = useState("");
    const contentRef = useRef(null);
    const [showInputAmount, setShowInputAmount] = useState(false);
    const [amount, setAmount] = useState("");
    const [showShareLink, setShowShareLink] = useState(false);
    const [linkPayment, setLinkPayment] = useState("");
    const [copySuccess, setCopySuccess] = useState("");

    const generateRandomString = (length = 10) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    };

    useEffect(() => {
        setQrValue(generateRandomString());
    }, []);

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

    const showShareLinkGenerator = () => {
        if (amount) {
            const paymentLink = `http://www.stiqr.co.id/pay?amount=${amount}`;
            setLinkPayment(paymentLink);
        } else {
            alert("Silakan masukkan jumlah pembayaran terlebih dahulu!");
        }

        setShowInputAmount(false);
        setShowShareLink(true);
    };

    const copyLinkToClipboard = () => {
        navigator.clipboard.writeText(linkPayment).then(
            () => {
                setCopySuccess("Link berhasil disalin!");
                setTimeout(() => setCopySuccess(""), 3000); // Reset message after 3 seconds
            },
            () => {
                alert("Gagal menyalin link.");
            }
        );
    };

    return (
        <>
            {/* Tampilan QR Code */}
            <div className={`${showInputAmount || showShareLink ? "hidden" : "block"} w-full min-h-screen p-8 bg-orange-400`}>
                <div className="flex items-center justify-between gap-5 w-full">
                    <Link to={"/dashboard"} className="block">
                        <X className="text-white" />
                    </Link>

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
                            <QRCode className="m-auto" value={qrValue} size={200} />

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

                    <Button onClick={() => setShowInputAmount(true)} className="mt-10 w-full bg-green-400 uppercase">
                        Buat Link Pembayaran
                    </Button>
                </div>
            </div>

            {/* Input Jumlah Pembayaran */}
            <div className={`${showInputAmount ? "block" : "hidden"}`}>
                <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                    <Button onClick={() => setShowInputAmount(false)} className="bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Button>

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
            <div className={`${showShareLink ? "block" : "hidden"} w-full`}>
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
            </div>
        </>
    );
};

export default QRCodePage;

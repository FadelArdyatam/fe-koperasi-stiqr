import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, History } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { admissionFees } from "./Dashboard";
import telkomsel from "../images/telkomsel.png";
import pln from "../images/pln.png";
import bpjs from "../images/bpjs.png";
import html2canvas from "html2canvas";

const payments = [
    {
        title: "PLN",
        code: "INV-0001",
        amount: "100000",
        date: "12/10/2021",
        time: "10:00",
        image: pln,
        status: 'success'
    },
    {
        title: "BPJS",
        code: "INV-0002",
        amount: "150000",
        date: "12/10/2021",
        time: "10:00",
        image: bpjs,
        status: 'pending'
    },
    {
        title: "PLN",
        code: "INV-0003",
        amount: "200000",
        date: "12/10/2021",
        time: "10:00",
        image: pln,
        status: 'success'
    },
    {
        title: "Telkomsel",
        code: "INV-0004",
        amount: "300000",
        date: "12/10/2021",
        time: "10:00",
        image: telkomsel,
        status: 'failed'
    },
];

const Riwayat = () => {
    const [type, setType] = useState("Uang Masuk");
    const [showDescription, setShowDescription] = useState({ status: false, index: -1 });
    const contentRef = useRef(null); // Untuk mereferensikan elemen yang akan dirender menjadi gambar

    const downloadImage = async () => {
        if (contentRef.current) {
            try {
                // Render elemen ke dalam Canvas menggunakan html2canvas
                const canvas = await html2canvas(contentRef.current, { useCORS: true });
                const dataURL = canvas.toDataURL("image/png");

                // Buat link untuk mengunduh gambar
                const link = document.createElement("a");
                link.href = dataURL;
                link.download = "CodePayment.png"; // Nama file gambar
                link.click();
            } catch (error) {
                console.error("Error generating image:", error);
            }
        }
    };

    return (
        <div className="relative h-screen">
            {/* Header */}
            <div className={`${showDescription.status ? 'pb-32' : 'pb-0'} fixed w-full top-0 z-10 pt-5 flex flex-col items-center justify-center bg-orange-400`}>
                <div className="flex items-center px-5 justify-center w-full">
                    <Link to="/dashboard" className="bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Link>

                    <p className="font-semibold m-auto text-xl text-white text-center uppercase">Riwayat</p>
                </div>

                <div className={`${showDescription.status ? 'hidden' : 'flex'} items-center w-full relative`}>
                    <Button
                        onClick={() => setType("Uang Masuk")}
                        className={`uppercase block !mt-10 w-full mb-3 bg-transparent hover:bg-transparent rounded-none transition-all`}
                    >
                        Uang Masuk
                    </Button>
                    <Button
                        onClick={() => setType("Pembelian")}
                        className={`uppercase block !mt-10 w-full mb-3 bg-transparent hover:bg-transparent rounded-none transition-all`}
                    >
                        Pembelian
                    </Button>

                    {/* Garis bawah animasi */}
                    <div
                        className={`${type === "Pembelian" ? "translate-x-full" : "translate-x-0"} w-[50%] absolute bottom-0 h-1 bg-white transition-transform duration-300 ease-in-out`}
                    ></div>
                </div>
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
                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to="/history" className="flex gap-3 text-orange-400 flex-col items-center">
                    <History />
                    <p className="uppercase">Riwayat</p>
                </Link>

                <Link to="/" className="flex gap-3 flex-col items-center">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            {/* Konten */}
            <div className={`${showDescription.status ? 'hidden' : 'block'} relative mt-44 h-[calc(100%-14rem)] overflow-hidden`}>
                {/* Konten Uang Masuk */}
                <div
                    className={`absolute inset-0 ${type === "Uang Masuk" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"} transition-all duration-500 ease-in-out`}
                >
                    <div className="flex flex-col gap-5 w-[90%] m-auto p-5 shadow-lg bg-white rounded-lg">
                        {admissionFees.map((admissionFee, index) => (
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={admissionFee.image}
                                            className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex flex-col items-start">
                                            <p className="uppercase text-sm">{admissionFee.title}</p>

                                            <p className="text-xs text-gray-400">{admissionFee.code}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(admissionFee.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">{admissionFee.date}</p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">{admissionFee.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Konten Pembelian */}
                <div
                    className={`absolute inset-0 ${type === "Pembelian" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"} transition-all duration-500 ease-in-out`}
                >
                    <div className="flex flex-col gap-5 w-[90%] m-auto p-5 shadow-lg bg-white rounded-lg">
                        {payments.map((payment, index) => (
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-2">
                                        <img
                                            src={payment.image}
                                            className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex flex-col items-start">
                                            <p className="uppercase text-sm">{payment.title}</p>

                                            <p className="text-xs text-gray-400">{payment.code}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(payment.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">{payment.date}</p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">{payment.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deskripsi Pembelian */}
            <div ref={contentRef} className={`${showDescription.status ? 'block' : 'hidden'} w-[90%] mt-24 left-[50%] -translate-x-[50%] p-5 z-20 absolute bg-white rounded-lg shadow-lg`}>
                {type === "Uang Masuk" ? (
                    <div>
                        <div className="flex items-center gap-3">
                            <img src={admissionFees[showDescription.index]?.image} className="w-10 min-w-10 h-10 min-h-10 rounded-full" alt="" />

                            <div>
                                <p>{admissionFees[showDescription.index]?.title}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-200 rounded-lg flex flex-col gap-5 items-center mt-10">
                            <p className="text-gray-500">Amount</p>

                            <p className="text-3xl text-orange-400 font-semibold">Rp {new Intl.NumberFormat('id-ID').format(Number(admissionFees[showDescription.index]?.amount))}</p>
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">user</p>

                                    <p className="mt-2">Kopi Tuku</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">No. Referensi</p>

                                    <p className="mt-2">{admissionFees[showDescription.index]?.code}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">Status</p>

                                    <p className="mt-2">{admissionFees[showDescription.index]?.status}</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">Tanggal & Waktu</p>

                                    <p className="mt-2">{admissionFees[showDescription.index]?.date} | {admissionFees[showDescription.index]?.time}</p>
                                </div>
                            </div>

                            <Button onClick={downloadImage} className="text-green-400 mt-10 bg-transparent w-full">+ Unduh File</Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-3">
                            <img src={payments[showDescription.index]?.image} className="w-10 min-w-10 h-10 min-h-10 rounded-full" alt="" />

                            <div>
                                <p>{payments[showDescription.index]?.title}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-200 rounded-lg flex flex-col gap-5 items-center mt-10">
                            <p className="text-gray-500">Amount</p>

                            <p className="text-3xl text-orange-400 font-semibold">Rp {new Intl.NumberFormat('id-ID').format(Number(payments[showDescription.index]?.amount))}</p>
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">user</p>

                                    <p className="mt-2">Kopi Tuku</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">No. Referensi</p>

                                    <p className="mt-2">{payments[showDescription.index]?.code}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">Status</p>

                                    <p className="mt-2">{payments[showDescription.index]?.status}</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">Tanggal & Waktu</p>

                                    <p className="mt-2">{payments[showDescription.index]?.date} | {payments[showDescription.index]?.time}</p>
                                </div>
                            </div>

                            <Button onClick={downloadImage} className="text-green-400 mt-10 bg-transparent w-full">+ Unduh File</Button>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default Riwayat;

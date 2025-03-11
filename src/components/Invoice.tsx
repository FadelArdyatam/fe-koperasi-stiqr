import { formatRupiah } from "@/hooks/convertRupiah";
import { Check, Download, Hourglass, Share2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import logo from "../images/logo.png";
import { Button } from "./ui/button";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/hooks/axiosInstance";

interface InvoiceProps {
    data: any;
    refNumber: string;
    marginTop: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ data, refNumber, marginTop }) => {
    const captureRef = useRef<HTMLDivElement>(null);

    const [total, setTotal] = useState(0);
    const [amount, setAmount] = useState(0);
    const [success, setSuccess] = useState(true)
    const [responseCode, setResponseCode] = useState(0)
    console.log(success)
    const navigate = useNavigate();

    const [productDetails, setProductDetails] = useState<any[]>([])
    useEffect(() => {
        const fetchDetail = async () => {
            const response = await axiosInstance.post("/ayoconnect/inquiry/status", {
                refNumber: refNumber
            });
            console.log(response.data.responseCode)
            if (response.data.success) {
                setProductDetails(response.data.data.productDetails)
            }
            setSuccess(response.data.success)
            setResponseCode(response.data.responseCode)
            setAmount(data.amount - data.processingFee - data.totalAdmin);
            setTotal(data.amount);
        }
        fetchDetail()
    }, [data, refNumber]);

    const handleDownloadJPEG = async () => {
        const element = document.getElementById("downloadable-content"); // ID dari elemen yang ingin di-download
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/jpeg", 1.0); // Menghasilkan JPEG dengan kualitas 100%

        const link = document.createElement("a");
        link.href = imgData;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

        link.download = `${data.productName}-${data.accountNumber}-${formattedDate}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (!captureRef.current) return;

        try {
            // Capture elemen yang ingin di-download
            const canvas = await html2canvas(captureRef.current, { backgroundColor: null });
            const dataUrl = canvas.toDataURL("image/jpeg", 1.0); // Simpan sebagai JPEG

            // Konversi ke file Blob
            const blob = await (await fetch(dataUrl)).blob();
            const date = new Date();
            const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
            const fileName = `${data.productName}-${data.accountNumber}-${formattedDate}.jpg`;
            const file = new File([blob], `${fileName}`, { type: "image/jpeg" });

            // Cek apakah Web Share API didukung
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "Bagikan Struk",
                    text: "Cek detail pembayaran ini!",
                });
            } else {
                alert("Fitur bagikan tidak didukung di perangkat ini.");
            }
        } catch (error) {
            console.error("Gagal membagikan gambar:", error);
        }
    };

    return (
        <>
            <div className={`${marginTop ? 'mt-[130px]' : 'mt-[-90px] bg-white'} w-[90%] m-auto shadow-lg z-0 p-10 rounded-lg relative bg-gray-50 overflow-hidden`}>
                {/* Konten Utama */}
                <div className="relative z-10">
                    {/* Icon Sukses */}
                    <div className="w-16 h-16 flex items-center justify-center border-2 border-black bg-orange-400 rounded-full m-auto">
                        {success && responseCode == 0 && (<Check className="scale-[2] text-white" />)}
                        {!success && (responseCode >= 100 && responseCode <= 199) && (<X className="scale-[2] text-white" />)}
                        {success && (responseCode == 188 || (responseCode >= 200 && responseCode <= 299)) && (<Hourglass className="scale-[2] text-white" />)}
                    </div>

                    <p className="font-semibold text-xl text-center text-orange-400 uppercase mt-7">
                        {success && responseCode == 0 && ('Pembayaran Berhasil')}
                        {!success && (responseCode >= 100 && responseCode <= 199) && ('Pembayaran Gagal')}
                        {success && (responseCode == 188 || (responseCode >= 200 && responseCode <= 299)) && ('Pembayaran Dalam Proses')}
                    </p>

                    <div className="mt-10 w-full">
                        {data.category !== "Pulsa" && data.category !== "Paket Data" && (
                            <div>
                                <p className="font-bold text-xl">Detail Pengguna</p>
                                <div className="w-full my-2 h-[2px] bg-gray-200"></div>

                                {data.customerDetails &&
                                    data.customerDetails.length > 0 &&
                                    data.customerDetails.map((detail: any, index: number) => (
                                        <div key={index} className="flex justify-between gap-5 mt-5">
                                            <p>{detail.key}</p>
                                            <p>{detail.value}</p>
                                        </div>
                                    ))}
                            </div>
                        )}

                        <p className="font-bold text-xl mt-5">Detail Tagihan</p>
                        <div className="w-full my-2 h-[2px] bg-gray-200"></div>

                        {(data.category === "Pulsa" || data.category === "Paket Data") && (
                            <div className="flex items-start gap-5 justify-between mt-5">
                                <p>Nomor HP Pengguna</p>
                                <p>{data.accountNumber}</p>
                            </div>
                        )}

                        <div className="flex items-start gap-5 justify-between mt-5">
                            <div>
                                <p>{data.productName}</p>
                                <p
                                    className={`text-sm text-gray-400 mt-2 ${data.category === "Pulsa" || data.category === "Paket Data"
                                        ? "block"
                                        : "hidden"
                                        } `}
                                >
                                    1 x {formatRupiah(data.amount)}
                                </p>
                            </div>
                            <p
                                className={`${data.category === "Pulsa" || data.category === "Paket Data"
                                    ? "block"
                                    : "hidden"
                                    }`}
                            >
                                {formatRupiah(data.amount)}
                            </p>
                        </div>

                        {data.category !== "Pulsa" &&
                            data.category !== "Paket Data" &&
                            data.billDetails.length > 0 && (
                                <div>
                                    {data.billDetails.map((bill: any, index: number) => (
                                        <div key={index} className="flex flex-col gap-5 mt-5">
                                            <div className="flex justify-between">
                                                <p className="font-semibold">{bill.key}</p>
                                                <p className="font-semibold">{formatRupiah(bill.value)}</p>
                                            </div>

                                            {bill.billInfo && bill.billInfo.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    {bill.billInfo.map((detail: any, i: number) => (
                                                        <div key={i} className="flex justify-between">
                                                            <p>{detail.key}</p>
                                                            <p>
                                                                {/^\d+$/.test(detail.value)
                                                                    ? formatRupiah(detail.value)
                                                                    : detail.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        {
                            productDetails.length > 0 && (
                                <div>
                                    {productDetails.map((detail: any, index: number) => (
                                        <div key={index} className="flex justify-between gap-5 mt-5">
                                            <p>{detail.key}</p>
                                            <p>{detail.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        }

                        {data.category !== "Pulsa" && data.category !== "Paket Data" && (
                            <div className="mt-5 flex items-center gap-5 justify-between font-semibold">
                                <p>Biaya Penanganan</p>
                                <p>{formatRupiah(data.processingFee)}</p>
                            </div>
                        )}


                        {data.category !== "Pulsa" && data.category !== "Paket Data" && (
                            <div className="mt-5 flex items-center gap-5 justify-between font-semibold">
                                <p>Total Belanja</p>
                                <p>{formatRupiah(amount)}</p>
                            </div>
                        )}

                        <div className="w-full my-5 h-[2px] bg-gray-200"></div>

                        <div className="flex items-center gap-5 justify-between">
                            <p className="font-bold">Total Bayar</p>
                            <p className="text-orange-400 font-bold">{formatRupiah(total)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-[90%] m-auto mt-10 mb-20 flex items-center justify-end">
                <div className="flex items-center gap-5">
                    <button onClick={handleShare} type="button" className={`${!success ? 'hidden' : ''} border border-orange-500 rounded-full scale-[1.2] p-1 text-orange-500`}>
                        <Share2 />
                    </button>

                    <button onClick={handleDownloadJPEG} type="button" className={`text-orange-500 scale-[1.2] ${!success ? 'hidden' : ''} `}>
                        <Download />
                    </button>

                    <Button onClick={() => navigate("/dashboard")} type="button" className="bg-green-500 text-white w-[150px]">Kembali</Button>
                </div>
            </div>

            {/* Component to download */}
            <div id="downloadable-content" ref={captureRef} className="mt-[130px] w-[550px] m-auto shadow-lg p-10 rounded-lg relative bg-gray-50 overflow-hidden"
                style={{
                    position: "absolute",
                    top: "-9999px"
                }} // Menyembunyikan elemen dari tampilan tetapi tetap bisa dirender
            >
                {/* Background Logo dengan Jarak */}
                <div className="absolute inset-0 opacity-90 overflow-hidden">
                    <div
                        className="grid -rotate-[15deg] justify-center items-center scale-[1.5]"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
                            gap: "50px", // Jarak antar logo diperbesar
                            width: "100%",
                            height: "100%",
                            justifyContent: "center",
                            alignContent: "center",
                        }}
                    >
                        {Array.from({ length: 100 }).map((_, index) => (
                            <img
                                key={index}
                                src={logo}
                                alt="Background Logo"
                                style={{ width: "50px", height: "50px", opacity: 0.1 }}
                            />
                        ))}
                    </div>
                </div>


                {/* Konten Utama */}
                <div className="relative z-10">
                    <img className="w-[40%] m-auto" src={logo} alt="" />

                    <div className="mt-10 w-full">
                        {data.category !== "Pulsa" && data.category !== "Paket Data" && (
                            <div>
                                <p className="font-bold text-xl">Detail Pengguna</p>
                                <div className="w-full my-2 h-[2px] bg-gray-200"></div>

                                {data.customerDetails &&
                                    data.customerDetails.length > 0 &&
                                    data.customerDetails.map((detail: any, index: number) => (
                                        <div key={index} className="flex justify-between gap-5 mt-5">
                                            <p>{detail.key}</p>
                                            <p>{detail.value}</p>
                                        </div>
                                    ))}
                            </div>
                        )}

                        <p className="font-bold text-xl mt-5">Detail Tagihan</p>
                        <div className="w-full my-2 h-[2px] bg-gray-200"></div>

                        {(data.category === "Pulsa" || data.category === "Paket Data") && (
                            <div className="flex items-start gap-5 justify-between mt-5">
                                <p>Nomor HP Pengguna</p>
                                <p>{data.accountNumber}</p>
                            </div>
                        )}

                        <div className="flex items-start gap-5 justify-between mt-5">
                            <div>
                                <p>{data.productName}</p>
                                <p
                                    className={`text-sm text-gray-400 mt-2 ${data.category === "Pulsa" || data.category === "Paket Data"
                                        ? "block"
                                        : "hidden"
                                        } `}
                                >
                                    1 x {formatRupiah(data.amount)}
                                </p>
                            </div>
                            <p
                                className={`${data.category === "Pulsa" || data.category === "Paket Data"
                                    ? "block"
                                    : "hidden"
                                    }`}
                            >
                                {formatRupiah(data.amount)}
                            </p>
                        </div>

                        {data.category !== "Pulsa" &&
                            data.category !== "Paket Data" &&
                            data.billDetails.length > 0 && (
                                <div>
                                    {data.billDetails.map((bill: any, index: number) => (
                                        <div key={index} className="flex flex-col gap-5 mt-5">
                                            <div className="flex justify-between">
                                                <p className="font-semibold">{bill.key}</p>
                                                <p className="font-semibold">{formatRupiah(bill.value)}</p>
                                            </div>

                                            {bill.billInfo && bill.billInfo.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    {bill.billInfo.map((detail: any, i: number) => (
                                                        <div key={i} className="flex justify-between">
                                                            <p>{detail.key}</p>
                                                            <p>
                                                                {/^\d+$/.test(detail.value)
                                                                    ? formatRupiah(detail.value)
                                                                    : detail.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                        {
                            productDetails.length > 0 && (
                                <div>
                                    {productDetails.map((detail: any, index: number) => (
                                        <div key={index} className="flex justify-between gap-5 mt-5">
                                            <p>{detail.key}</p>
                                            <p>{detail.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        }

                        {data.category !== "Pulsa" && data.category !== "Paket Data" && (
                            <div className="mt-5 flex items-center gap-5 justify-between font-semibold">
                                <p>Biaya Penanganan</p>
                                <p>{formatRupiah(data.processingFee)}</p>
                            </div>
                        )}



                        {data.category !== "Pulsa" && data.category !== "Paket Data" && (
                            <div className="mt-5 flex items-center gap-5 justify-between font-semibold">
                                <p>Total Belanja</p>
                                <p>{formatRupiah(amount)}</p>
                            </div>
                        )}

                        <div className="w-full my-5 h-[2px] bg-gray-200"></div>

                        <div className="flex items-center gap-5 justify-between">
                            <p className="font-bold">Total Bayar</p>
                            <p className="text-orange-400 font-bold">{formatRupiah(total)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Invoice;

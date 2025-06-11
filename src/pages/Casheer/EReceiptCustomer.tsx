import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { Check, Download } from 'lucide-react';
import { formatRupiah } from '@/hooks/convertRupiah';
import html2canvas from "html2canvas";
import logo from "@/images/logo.png";

interface IOrder {
    no_transaksi: string;
    date: string;
    merchant: {
        name: string;
        address: string;
        phone: string;
    },
    products: {
        name: string;
        qty: number;
        price: number;
        subtotal: number;
        variants?: { name: string, price: number; }[];
        total?: number;
        notes?:string;
    }[],
    payment: {
        total: number;
        method: string;
        pay: number;
        change: number;
    },
    type: string;
    queue?: string | number;
}

const EReceiptCustomer = () => {
    const captureRef = useRef<HTMLDivElement>(null);

    const [orders, setOrders] = useState<IOrder>()

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        const fetchOrder = async () => {
            const response = await axiosInstance.get(`/sales/order/${orderId}`)
            setOrders(response.data)
        }

        fetchOrder()
    }, [orderId]);

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '-'; // tanggal tidak valid

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta',
        };

        const formatted = new Intl.DateTimeFormat('en-GB', options).format(date);
        return formatted.replace(',', ' -');
    };

    function formatToDDMMYYYY(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function getTimeOnly(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    const handleDownloadJPEG = async () => {
        const element = document.getElementById("downloadable-content"); // ID dari elemen yang ingin di-download
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/jpeg", 1.0); // Menghasilkan JPEG dengan kualitas 100%

        const link = document.createElement("a");
        link.href = imgData;
        const date = new Date();
        const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

        if (orders) {
            link.download = `${orders.no_transaksi}-${formattedDate}.jpeg`;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // const handleShare = async () => {
    //     if (!captureRef.current) return;

    //     try {
    //         // Capture elemen yang ingin di-download
    //         const canvas = await html2canvas(captureRef.current, { backgroundColor: null });
    //         const dataUrl = canvas.toDataURL("image/jpeg", 1.0); // Simpan sebagai JPEG

    //         // Konversi ke file Blob
    //         const blob = await (await fetch(dataUrl)).blob();
    //         const date = new Date();
    //         const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    //         const fileName = `${orders?.no_transaksi}-${formattedDate}.jpg`;
    //         const file = new File([blob], `${fileName}`, { type: "image/jpeg" });

    //         // Cek apakah Web Share API didukung
    //         if (navigator.canShare && navigator.canShare({ files: [file] })) {
    //             await navigator.share({
    //                 files: [file],
    //                 title: "Bagikan Struk",
    //                 text: "Cek detail pembayaran ini!",
    //             });
    //         } else {
    //             alert("Fitur bagikan tidak didukung di perangkat ini.");
    //         }
    //     } catch (error) {
    //         console.error("Gagal membagikan gambar:", error);
    //     }
    // };

    console.log(orders)

    return (
        <>
            <div className='min-h-screen bg-orange-400 flex items-center justify-center md:p-10'>
                <div className='relative flex flex-col items-end gap-5 md:w-[50%] w-full'>
                    <div className='bg-white relative flex flex-col items-center rounded-lg p-10 w-full shadow-md'>
                        <div className='flex flex-col items-center gap-5'>
                            <div className='bg-orange-400 rounded-full border border-black w-20 h-20 flex items-center justify-center'>
                                <Check className='scale-[2] text-white' />
                            </div>

                            <p className='font-semibold text-orange-400 text-xl'>Pembayaran Berhasil</p>
                        </div>

                        <div className='w-max flex items-center gap-5 absolute top-5 right-5'>
                            {/* <button className='p-3  text-orange-400 ' onClick={() => handleShare()}>
                                <Share2 />
                            </button> */}

                            <button className='text-orange-400' onClick={() => handleDownloadJPEG()}>
                                <Download />
                            </button>
                        </div>

                        <div className='flex justify-between border-b border-gray-400 pb-2 items-center w-full mt-10 md:text-xl text-xs font-semibold'>
                            <p>No Transaksi</p>

                            <p>{orders?.no_transaksi}</p>
                        </div>

                        <div className='w-full flex flex-col gap-5 mt-5 md:text-base text-xs'>
                            <div className='flex justify-between items-center w-full '>
                                <p>Jenis Layanan</p>

                                <p>{orders?.type == 'takeaway' ? 'Bayar Sekarang' : 'Bayar Nanti'}</p>
                            </div>

                            <div className='flex justify-between items-center w-full '>
                                <p>Tanggal Pembayaran</p>

                                <p>
                                    {orders?.date && !isNaN(new Date(orders.date).getTime())
                                        ? formatDate(orders.date)
                                        : '-'}
                                </p>
                            </div>

                            <div className='flex justify-between items-center w-full '>
                                <p>Antrian</p>
                                <p>{orders?.queue}</p>
                            </div>

                            <div className='flex justify-between items-center w-full '>
                                <p>Metode Pembayaran</p>
                                <p>{orders?.payment.method}</p>
                            </div>
                        </div>

                        <div className='border-b border-gray-400 pb-2 w-full mt-10 md:text-xl text-sm font-semibold'>
                            <p>Detail Pesanan</p>
                        </div>

                        <table className="w-full mt-5 md:text-sm text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left w-1/6 font-medium">No</th>
                                    <th className="text-left font-medium">Nama Produk</th>
                                    <th className="text-right w-1/3 font-medium">Total Harga</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders?.products.map((item, index) => (
                                    <tr key={index} className="align-top">
                                        <td className="py-2">{index + 1}</td>

                                        <td className="py-2">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="font-medium">{item.qty} x {formatRupiah(item.price)}</div>
                                            {item.variants && (
                                                <div className="text-gray-500 text-sm">
                                                    {item.variants.map((variant, index) => (
                                                        <p key={index}>
                                                            + {variant.name} {`(${item.qty + ` x ` + formatRupiah(variant.price)})`}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="text-gray-500 text-sm">Note: {item.notes}</div>
                                        </td>


                                        <td className="py-2 text-right font-medium">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className='border-b border-gray-400 pb-2 w-full mt-5 md:text-xl text-sm font-semibold'>
                            <p>Rincian Transaksi</p>
                        </div>

                        <div className='w-full flex flex-col gap-5 mt-5 md:text-base text-xs'>
                            <div className='flex justify-between items-center w-full'>
                                <p>Subtotal</p>

                                {/* nanti jika sudah ada diskon atau pajak buat key baru untuk subtotal ya, karena pajak dan diskon belum ada jadi sementara valuenya disamakan dengan total */}
                                <p>{formatRupiah(orders?.payment.total ?? 0)}</p>
                            </div>
                            {/* kalo misal ada diskon atau pajak tambahin disini */}

                            <div className='flex justify-between items-center w-full font-semibold'>
                                <p>Total</p>

                                <p>{formatRupiah(orders?.payment.total ?? 0)}</p>
                            </div>

                            {orders?.payment.method == 'Tunai' && (
                                <div className="border-t border-gray-400 pt-2 w-full flex flex-col gap-2 ">
                                    <div className='flex justify-between items-center w-full '>
                                        <p>Tunai Diterima</p>
                                        <p>{formatRupiah(orders?.payment.pay ?? 0)}</p>
                                    </div>
                                    <div className='flex justify-between items-center w-full '>
                                        <p>Kembalian</p>
                                        <p>{formatRupiah(orders?.payment.change ?? 0)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='w-full text-center md:text-base text-xs flex flex-col gap-2 mt-10'>
                            <p>Belanja Menjadi Lebih Mudah Melalui Kami!</p>

                            <p>Terima kasih telah berkunjung!</p>
                            <div>
                                <span className='italic'>Powered by </span>
                                <span><strong>STIQR</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Component to download */}
            <div className="w-0 h-0 overflow-hidden absolute" >
                <div id="downloadable-content" ref={captureRef} className="min-w-[550px] absolute m-auto shadow-lg p-10 rounded-lg bg-gray-50 overflow-hidden"
                    style={{
                        top: "-9999px",
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

                        <div className='mt-5 text-center text-sm'>
                            {orders?.merchant.address}
                        </div>

                        <div className='w-full h-[2px] bg-gray-400 bounded-lg my-4'></div>

                        <div className="flex justify-between items-start">
                            {/* Kiri: Informasi Transaksi */}
                            <div className="grid grid-cols-2 gap-y-1 text-sm">
                                <span>No Transaksi</span>
                                <span>: {orders?.no_transaksi}</span>

                                <span>Tanggal</span>
                                <span>: {formatToDDMMYYYY(orders?.date ?? "")}</span>

                                <span>Waktu</span>
                                <span>: {getTimeOnly(orders?.date ?? "")}</span>

                                <span>Jenis Layanan</span>
                                <span>: {orders?.type == 'takeaway' ? 'Bayar Sekarang' : 'Bayar Nanti'}</span>

                            </div>

                            {/* Kanan: No Antrian */}
                            <div className="text-center">
                                <p className="text-sm">No Antrian:</p>
                                <p className="text-4xl font-bold">{orders?.queue}</p>
                            </div>
                        </div>

                        <div className='w-full h-[2px] bg-gray-400 bounded-lg my-4'></div>

                        <table className="w-full mb-8 md:text-sm text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left w-1/6 font-medium">No</th>
                                    <th className="text-left font-medium">Nama Produk</th>
                                    <th className="text-right w-1/3 font-medium">Total Harga</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders?.products.map((item, index) => (
                                    <tr key={index} className="align-top">
                                        <td className="py-2">{index + 1}</td>

                                        <td className="py-2">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="font-medium">{item.qty} x {formatRupiah(item.price)}</div>
                                            {item.variants && (
                                                <div className="text-gray-500 text-sm">
                                                    {item.variants.map((variant, index) => (
                                                        <p key={index}>
                                                            + {variant.name} {`(${item.qty + ` x ` + formatRupiah(variant.price)})`}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="text-gray-500 text-sm">Note: {item.notes}</div>
                                        </td>


                                        <td className="py-2 text-right font-medium">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>


                        <div className='border-t border-gray-400 w-full flex flex-col gap-2 md:text-base text-xs'>
                            <div className='flex justify-between items-center w-full'>
                                <p>Subtotal</p>

                                {/* nanti jika sudah ada diskon atau pajak buat key baru untuk subtotal ya, karena pajak dan diskon belum ada jadi sementara valuenya disamakan dengan total */}
                                <p>{formatRupiah(orders?.payment.total ?? 0)}</p>
                            </div>
                            {/* kalo misal ada diskon atau pajak tambahin disini */}

                            <div className='flex justify-between items-center w-full font-semibold'>
                                <p>Total</p>

                                <p>{formatRupiah(orders?.payment.total ?? 0)}</p>
                            </div>

                            {orders?.payment.method == 'Tunai' && (
                                <div className="border-t border-gray-400 mt-2 w-full flex flex-col gap-2 ">
                                    <div className='flex justify-between items-center w-full '>
                                        <p>Tunai Diterima</p>
                                        <p>{formatRupiah(orders?.payment.pay ?? 0)}</p>
                                    </div>
                                    <div className='flex justify-between items-center w-full '>
                                        <p>Kembalian</p>
                                        <p>{formatRupiah(orders?.payment.change ?? 0)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='w-full text-center md:text-base text-xs flex flex-col gap-2 mt-10'>
                            <p>Belanja Menjadi Lebih Mudah Melalui Kami!</p>

                            <p>Terima kasih telah berkunjung!</p>
                            <div>
                                <span className='italic'>Powered by </span>
                                <span><strong>STIQR</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EReceiptCustomer
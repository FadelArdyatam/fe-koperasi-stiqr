import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import axiosInstance from '@/hooks/axiosInstance';
import { Check, ChevronLeft, Download, Share2 } from 'lucide-react';
import { formatRupiah } from '@/hooks/convertRupiah';
import html2canvas from "html2canvas";
import logo from "@/images/logo.png";
import { Button } from '@/components/ui/button';

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
        variants?: { name: string, price: number }[];
        total?: number;
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

const EReceipt = () => {
    const captureRef = useRef<HTMLDivElement>(null);

    const [orders, setOrders] = useState<IOrder>()
    const [showReceipt, setShowReceipt] = useState(true);
    const [showInvoice, setShowInvoice] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    const currentUrl = `${window.location.origin}/orderCustomer?orderId=${orderId}`;

    useEffect(() => {
        const fetchOrder = async () => {
            const response = await axiosInstance.get(`/sales/order/${orderId}`)
            setOrders(response.data)
        }

        fetchOrder()
    }, [orderId]);

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // gunakan 24 jam
            timeZone: 'Asia/Jakarta', // sesuaikan jika perlu
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
            const fileName = `${orders?.no_transaksi}-${formattedDate}.jpg`;
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

    console.log(orders)

    return (
        <>
            <div className="p-10 flex flex-col md:bg-orange-400 min-h-screen items-center justify-center gap-6">
                {orderId && !showReceipt ? (
                    <div className='fixed flex items-center justify-center top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10'>
                        <div className="bg-white md:w-[50%] p-10 flex flex-col items-center justify-center rounded-md shadow-md">
                            <QRCode value={currentUrl} />
                            <p className="text-black font-semibold text-lg text-center mt-10">*Scan QR Code Berikut untuk mendapatkan Struk Digital Anda!</p>

                            <div className="flex w-full flex-col gap-5 mt-6">
                                <button
                                    onClick={() => { setShowReceipt(true); setShowInvoice(true) }}
                                    className="bg-green-500 w-full text-center text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Lihat Struk
                                </button>

                                <button
                                    onClick={() => setShowReceipt(true)}
                                    className="bg-orange-500 w-full text-center text-white px-4 py-2 rounded hover:bg-orange-600"
                                >
                                    Kembali
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className={`${showReceipt ? 'hidden' : 'block'} text-red-500`}>Order ID tidak ditemukan di URL</p>
                )}

                {showInvoice && (
                    <div className='fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50'>
                        <div className="relative max-w-4xl w-[90%] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-gray-50 shadow-lg p-10 rounded-lg">

                            {/* Background Logo */}
                            <div className="absolute inset-0 opacity-90  pointer-events-none z-0">
                                <div
                                    className="grid -rotate-[15deg] justify-center items-center scale-[1.5]"
                                    style={{
                                        gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
                                        gap: "50px",
                                        width: "100%",
                                        height: "100%",
                                    }}
                                >
                                    {Array.from({ length: 70 }).map((_, index) => (
                                        <img
                                            key={index}
                                            src={logo}
                                            alt="Background Logo"
                                            className="w-[50px] h-[50px] opacity-10"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Konten Utama */}
                            <div className="relative z-10">
                                <img className="w-[40%] mx-auto" src={logo} alt="" />

                                <div className='mt-5 text-center text-sm'>
                                    {orders?.merchant.address}
                                </div>

                                <div className='w-full h-[2px] bg-gray-400 bounded-lg my-5'></div>

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

                                <div className='w-full h-[2px] bg-gray-400 bounded-lg my-5'></div>

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

                                                    <div className="text-gray-500 text-sm">Note: -</div>
                                                </td>


                                                <td className="py-2 text-right font-medium">
                                                    {formatRupiah(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>


                                <div className='border-t border-gray-400 w-full flex flex-col mt-2 gap-2 md:text-base text-xs'>
                                    <div className='flex justify-between items-center w-full mt-2'>
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

                        <Button className='max-w-4xl w-full bg-red-500 mt-5' onClick={() => setShowInvoice(false)}>Close</Button>
                    </div>
                )}

                {orders && (
                    <>
                        <div className='relative flex flex-col items-end gap-5 md:w-[80%] w-full'>
                            <div className='md:absolute md:block hidden top-0 -left-20'>
                                <button onClick={() => navigate(-1)}>
                                    <ChevronLeft className='text-black scale-[2]' />
                                </button>
                            </div>
                            <div className='bg-white relative flex flex-col items-center rounded-lg md:p-10 w-full '>
                                <div className='flex flex-col items-center gap-5'>
                                    <div className='bg-orange-400 rounded-full border border-black w-20 h-20 flex items-center justify-center'>
                                        <Check className='scale-[2] text-white' />
                                    </div>

                                    <p className='font-semibold text-orange-400 text-xl'>Pembayaran Berhasil</p>
                                </div>

                                <div className='w-max flex items-center gap-5 absolute md:top-5 md:right-5 top-0 right-0'>
                                    <button className='p-3  text-orange-400 ' onClick={() => handleShare()}>
                                        <Share2 />
                                    </button>

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

                                                    <div className="text-gray-500 text-sm">Note: -</div>
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
                            <div className='md:block hidden'>
                                <Button onClick={() => setShowReceipt(false)} className='bg-green-500 text-white'>Generate QR</Button>
                            </div>
                        </div>
                        <div className='flex flex-row justify-between gap-3 w-full md:hidden '>
                            <Button onClick={() => navigate(-1)} className='bg-orange-500 text-white'>Kembali</Button>

                            <Button onClick={() => setShowReceipt(false)} className='bg-green-500 text-white'>Generate QR</Button>
                        </div>
                    </>
                )}
            </div >

            {/* Component to download */}
            <div className="w-0 h-0 overflow-hidden absolute">
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

                        <div className='w-full h-[2px] bg-gray-400 bounded-lg my-4 '></div>

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
                                        <td >{index + 1}</td>

                                        <td >
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

                                            <div className="text-gray-500 text-sm">Note: -</div>
                                        </td>

                                        <td className="text-right font-medium">
                                            {formatRupiah(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>


                        <div className='border-t border-gray-400 w-full flex flex-col mt-4 gap-2 md:text-base text-xs'>
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
    );
};

export default EReceipt;

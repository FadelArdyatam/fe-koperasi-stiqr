import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ArrowLeft, CircleAlert, Computer } from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, useState, useEffect } from "react";
import QRCodePage from "../QRCode";
import axiosInstance from "@/hooks/axiosInstance";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import noProduct from '../../images/no-product.png'
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
// import { ISales } from "../Booking/Booking";

interface OrderProcessedProps {
    setShowOrderProcess: React.Dispatch<React.SetStateAction<boolean>>;
    basket: any;
    type: string;
    orderId?: string | null;
    tagih?: boolean;
    setTagih?: React.Dispatch<React.SetStateAction<boolean>>;
    sales_id?: string
    selectedCustomer: any;
    noMeja: string;
}
interface SalesDetail {
    product: {
        product_name: string;
        product_price: number;
    };
    quantity: number;
}

interface ProductItem {
    product: string;
    price: number;
    quantity: number;
}

const OrderProcessed: React.FC<OrderProcessedProps> = ({ basket, setShowOrderProcess, type, orderId, tagih, setTagih, sales_id, selectedCustomer, noMeja }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    // const [orderId, setOrderId] = useState<string>(null);
    const [stringQR, setStringQR] = useState<string | null>(null);

    const navigate = useNavigate()

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const calculateTotalAmount = () => {
        if (Array.isArray((basket as { sales_details?: SalesDetail[] }).sales_details)) {
            const salesDetails = (basket as { sales_details: SalesDetail[] }).sales_details;
            return salesDetails.reduce((acc, curr) =>
                acc + (curr.product.product_price * curr.quantity), 0).toString();
        }
        if (Array.isArray(basket)) {
            return (basket as ProductItem[]).reduce((acc, curr) =>
                acc + (curr.price * curr.quantity), 0).toString();
        }
        return "0";
    };

    const prepareItems = () => {
        if (Array.isArray((basket as { sales_details?: SalesDetail[] }).sales_details)) {
            const salesDetails = (basket as { sales_details: SalesDetail[] }).sales_details;
            return salesDetails.map(data => ({
                name: data.product.product_name,
                quantity: data.quantity.toString(),
                unitPrice: data.product.product_price.toString(),
            }));
        }

        if (Array.isArray(basket)) {
            return (basket as ProductItem[]).map(data => ({
                name: data.product,
                quantity: data.quantity.toString(),
                unitPrice: data.price.toString(),
            }));
        }

        return [];
    };

    const [timeLeft, setTimeLeft] = useState(300)

    useEffect(() => {
        if (!tagih) {
            return
        }
        handleTagih()
    }, []);

    const handleTagih = async () => {
        try {
            const requestBody = {
                email: "testerfinpay@gmail.com",
                firstName: "Tester",
                lastName: "Finpay",
                mobilePhone: "+62048232329",
                amount: calculateTotalAmount(),
                description: "Tester",
                successUrl: "http://success",
                type: "qris",
                orderId: orderId,
                item: prepareItems(),
            };

            const response = await axiosInstance.post(`/finpay/initiate`, requestBody);
            if (response.data) {
                setStringQR(response.data.response.stringQr);
                setShowQRCode(true)
                if (setTagih) {
                    setTagih(false);
                }
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
            // setIsLoading(false); // Nonaktifkan loading
        }
    }

    const handleCancelPayment = async () => {
        try {
            const response = await axiosInstance.post("/sales/cancel-payment", {
                orderId: orderId
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

    console.log("Basket from OrderProcessed:", basket);

    return (
        <>
            <div className={`${showQRCode && !tagih ? 'hidden' : 'flex'} w-full flex-col min-h-screen pb-[250px] items-center bg-orange-50`}>
                <div className={`p-5 w-full bg-white`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <button onClick={() => {
                                if (type === "detail") {
                                    navigate("/booking");
                                    setShowOrderProcess(false);
                                } else {
                                    navigate("/dashboard")
                                }
                            }}><ArrowLeft /></button>

                            <p data-aos="zoom-in" className="font-semibold text-2xl">{type === "detail" ? 'Detail Pesanan' : 'Pesanan Diproses'}</p>
                        </div>
                    </div>
                </div>

                <div className="w-[90%] flex flex-col items-center mt-5 bg-white p-5 shadow-lg rounded-md">
                    <div data-aos="fade-up" data-aos-delay="100" className="w-full flex items-center gap-5 justify-between">
                        <p className="font-semibold text-xl">Informasi Pesanan</p>

                        <div className={`${basket.status === 'done' ? 'bg-green-100 text-green-400' : basket.status === 'inprogress' ? 'bg-orange-100 text-orange-400' : basket.status === 'cancel' ? 'bg-red-100 text-red-400' : 'bg-orange-100 text-orange-400'} text-sm p-2 rounded-full text-center`}>
                            <p>{basket.status === "done" ? 'Sudah Dibayar' : basket.status === "inprogress" ? 'Belum Dibayar' : basket.status === "cancel" ? 'Dibatalkan' : 'Belum Dibayar'}</p>
                        </div>
                    </div>

                    <div className="w-full mt-5 flex items-center gap-5 justify-between">
                        <div data-aos="fade-up" data-aos-delay="200" className="w-full p-5 bg-orange-300 rounded-lg flex items-center gap-5 justify-between">
                            <p className="font-semibold">No. Antrian</p>

                            <p className="font-semibold">{basket.queue_number}</p>
                        </div>

                        <div data-aos="fade-up" data-aos-delay="200" className="w-full p-5 bg-orange-300 rounded-lg flex items-center gap-5 justify-between">
                            <p className="font-semibold">No. Meja</p>

                            <p className="font-semibold">{noMeja}</p>
                        </div>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="300" className="w-full mt-5">
                        <div className="flex items-center gap-5 w-full justify-between">
                            <p className="font-semibold text-gray-500">Pesanan</p>

                            <div className="flex items-center gap-3">
                                <Computer />

                                <p className="font-semibold">Kasir</p>
                            </div>
                        </div>

                        <div className="w-full mt-5 flex items-center gap-5 justify-between">
                            <p className="font-semibold text-gray-500">Layanan</p>

                            <p className="font-semibold">{basket?.order_type === 'dinein' ? 'Makan di Tempat' : 'Bawa Pulang'}</p>
                        </div>
                        <div className="w-full mt-5 flex  gap-5 flex-col">
                            <p className="font-bold">Informasi Pelanggan</p>
                            <div className="flex justify-between">
                                <p className="font-semibold text-gray-500">Nama</p>
                                <p className="font-semibold">{selectedCustomer?.customer?.name ?? '-'}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-semibold text-gray-500">Email</p>
                                <p className="font-semibold">{selectedCustomer?.customer?.email ?? '-'}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-semibold text-gray-500">Nomor Handphone</p>
                                <p className="font-semibold">{selectedCustomer?.customer?.phone ?? '-'}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-semibold text-gray-500">Nomor Lainnya</p>
                                <p className="font-semibold">{selectedCustomer?.customer?.other_number ?? '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-[90%] rounded-xl p-5 min-h-full bg-white mt-5 flex flex-col items-center gap-5">
                    <div data-aos="fade-up" data-aos-delay="400" className={`${basket.status === 'done' || basket.status === 'cancel' ? 'hidden' : 'flex'} w-full items-center gap-5 justify-between bg-white shadow-lg p-3 rounded-lg`}>
                        <p className="font-semibold">Ada lagi pesanannya?</p>

                        <Button onClick={() => setShowOrderProcess(false)} className="bg-orange-400">+ Tambah</Button>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="500" className="w-full mt-5 bg-white rounded-lg shadow-lg p-3">
                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-xl font-semibold">Daftar Pesanan</p>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button data-aos="fade-up" data-aos-delay="400" className={`${basket.status === 'done' || basket.status === 'cancel' ? 'hidden' : 'block'} font-semibold text-orange-500 bg-transparent`}>Pembatalan</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                    className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm"
                                >
                                    <div data-aos="zoom-in" className="bg-white text-center p-5 rounded-lg shadow-lg w-[90%]">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-semibold text-lg">
                                                <CircleAlert className="m-auto" />

                                                <p className="text-center">Apakah Anda benar-benar yakin?</p>
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-center">
                                                Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus Pemesanan Anda secara permanen.
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

                        <div className="w-full h-[1px] bg-gray-200 my-5"></div>

                        <div className="w-full flex flex-col items-start gap-5 px-3">
                            {type === 'detail' ? <>
                                {basket?.sales_details?.map((item: {
                                    product_image: any; product: { product_name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; product_price: any; }; quantity: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
                                }, index: number) => (
                                    <div data-aos="fade-up" data-aos-delay={index * 100} key={index}>
                                        <div className="flex items-center gap-5">
                                            <img className="w-10" src={`${item.product_image ?? noProduct}`} alt="" />

                                            <div>
                                                <p className="text-lg font-semibold">{item.product.product_name}</p>

                                                <div className="flex items-center gap-3">
                                                    <p className="font-semibold text-xl">{Number(item.product.product_price).toLocaleString("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                    })}</p>

                                                    <div className="flex items-center justify-center w-8 h-8 bg-orange-200 rounded-lg">
                                                        <p>x{item.quantity}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full h-[1px] bg-gray-200 my-5"></div>
                                    </div>
                                ))}
                            </> : <>
                                {Array.isArray(basket) && basket.map((item, index) => (
                                    <div data-aos="fade-up" data-aos-delay={index * 100} key={index} className="flex items-center gap-5 p-3">
                                        <img className="w-10" src={`${item.product_image ?? noProduct}`} alt="" />

                                        <div>
                                            <p className="text-lg font-semibold">{item.product}</p>

                                            <div className="flex items-center gap-3">
                                                <p className="font-semibold text-xl">{Number(item.price).toLocaleString("id-ID", {
                                                    style: "currency",
                                                    currency: "IDR",
                                                })}</p>

                                                <div className="flex items-center justify-center w-8 h-8 bg-orange-200 rounded-lg">
                                                    <p>x{item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>}
                        </div>
                    </div>
                </div>

                <div data-aos="fade-up" data-aos-delay="600" className={`${basket.status === 'cancel' ? 'hidden' : 'flex'} fixed bottom-0 w-full bg-white p-5 flex-col items-center justify-between`}>
                    <div className="flex w-full items-center justify-between gap-5">
                        <p className="font-semibold text-xl">Total Tagihan</p>

                        <p className="font-semibold text-xl">
                            {type === 'detail' ? <>
                                {formatRupiah(basket.subtotal)}
                            </> : <>
                                {Array.isArray(basket) && Number(basket.reduce((acc, curr) => acc + (curr.price ?? 0) * curr.quantity, 0)).toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                })}
                            </>}
                        </p>
                    </div>

                    <div className="w-full mt-10 flex items-center gap-5 justify-between">
                        <Button type="button" className={`flex bg-orange-500 items-center justify-center text-white w-full rounded-full py-6 text-lg font-semibold`}>Cetak Struk</Button>

                        <Button type="button" onClick={handleTagih} className={`${basket.status === 'done' ? 'hidden' : ''} bg-orange-500 text-white w-full rounded-full py-6 text-lg font-semibold`}>Tagih</Button>
                    </div>
                </div>
            </div>

            {
                tagih && (<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-orange-400 z-50">
                    <p className="text-white text-xl font-medium">Loading QR Code...</p>
                </div>)
            }

            {showQRCode &&
                <QRCodePage
                    type="kasir"
                    orderId={orderId}
                    stringQR={stringQR}
                    showQRCode={showQRCode}
                    timeLeftOpenBill={timeLeft}
                    setShowQRCode={setShowQRCode}
                    dataAmount={calculateTotalAmount()}
                    sales_id={basket.sales_id !== undefined ? basket.sales_id : sales_id}
                />}
        </>
    )
}

export default OrderProcessed
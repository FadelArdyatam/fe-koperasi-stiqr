import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ArrowLeft, Computer, Image } from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key, useState, useEffect } from "react";
import QRCodePage from "../QRCode";
import axiosInstance from "@/hooks/axiosInstance";
import { useNavigate } from "react-router-dom";
// import { ISales } from "../Booking/Booking";

interface OrderProcessedProps {
    setShowOrderProcess: React.Dispatch<React.SetStateAction<boolean>>;
    basket: any;
    type: string;
    orderId?:string|null;
    tagih?: boolean;
    setTagih?: React.Dispatch<React.SetStateAction<boolean>>;

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

const OrderProcessed: React.FC<OrderProcessedProps> = ({ basket, setShowOrderProcess, type,orderId, tagih, setTagih }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    // const [orderId, setOrderId] = useState<string>(null);
    const [stringQR, setStringQR] = useState<string | null>(null);
    const navigate = useNavigate()
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
    const [timeLeft,setTimeLeft] = useState(300)
    useEffect(() => {
        if(!tagih) {
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


    return (
        <>
            <div className={`${showQRCode && !tagih ? 'hidden' : 'flex'} w-full flex-col min-h-screen pb-[250px] items-center bg-orange-50`}>
                <div className={`p-5 w-full bg-white`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <button onClick={() => setShowOrderProcess(false)}><ArrowLeft /></button>

                            <p className="font-semibold text-2xl">Pesanan Diproses</p>
                        </div>
                    </div>
                </div>

                <div className="w-[90%] flex flex-col items-center mt-5 bg-white p-5 shadow-lg rounded-md">
                    <div className="w-full flex items-center gap-5 justify-between">
                        <p className="font-semibold text-xl">Informasi Pesanan</p>

                        <div className="bg-orange-100 text-orange-400 text-sm p-2 rounded-full text-center">
                            <p>Belum Dibayar</p>
                        </div>
                    </div>

                    <div className="w-full p-5 bg-orange-300 rounded-lg mt-5 flex items-center gap-5 justify-between">
                        <p className="font-semibold">No. Antrian</p>

                        <p className="font-semibold">{basket.queue_number}</p>
                    </div>

                    <div className="w-full mt-5">
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
                    </div>
                </div>

                <div className="w-full rounded-t-xl p-5 min-h-full bg-white mt-5 flex flex-col items-center gap-5">
                    <div className="w-full flex items-center gap-5 justify-between bg-white shadow-lg p-3 rounded-lg">
                        <p className="font-semibold">Ada lagi pesanannya?</p>

                        <Button onClick={() => setShowOrderProcess(false)} className="bg-orange-400">+ Tambah</Button>
                    </div>

                    <div className="w-full mt-5 bg-white rounded-lg shadow-lg p-3">
                        <div className="w-full flex items-center gap-5 justify-between">
                            <p className="text-xl font-semibold">Daftar Pesanan</p>

                            <button className="font-semibold text-orange-500">Pembatalan</button>
                        </div>

                        <div className="w-full h-[1px] bg-gray-200 my-5"></div>

                        <div className="w-full flex flex-col items-start gap-5 px-3">
                            {type === 'detail' ? <>
                                {basket?.sales_details?.map((item: { product: { product_name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; product_price: any; }; quantity: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }, index: Key | null | undefined) => (
                                    <div key={index}>
                                        <div className="flex items-center gap-5">
                                            <Image className="scale-[2]" />

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
                                    <div key={index} className="flex items-center gap-5">
                                        <Image className="scale-[2]" />

                                        <div>
                                            <p className="text-lg font-semibold">{item.product.product_name}</p>

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

                <div className="fixed bottom-0 w-full bg-white p-5 flex flex-col items-center justify-between">
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

                        <Button type="button" onClick={handleTagih} className="bg-orange-500 text-white w-full rounded-full py-6 text-lg font-semibold">Tagih</Button>
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
                    setShowQRCode={setShowQRCode} />}
        </>
    )
}

export default OrderProcessed
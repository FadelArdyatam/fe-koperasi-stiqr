import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ArrowLeft, Computer, Image } from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key, useState } from "react";
import QRCodePage from "../QRCode";
// import { ISales } from "../Booking/Booking";

interface OrderProcessedProps {
    setShowOrderProcess: React.Dispatch<React.SetStateAction<boolean>>;
    basket: any;
    type: string;
}

const OrderProcessed: React.FC<OrderProcessedProps> = ({ basket, setShowOrderProcess, type }) => {
    const [showQRCode, setShowQRCode] = useState(false);

    console.log("basket from order processed: ", basket)

    console.log("showQRCode: ", showQRCode)

    return (
        <>
            <div className={`${showQRCode ? 'hidden' : 'flex'} w-full flex-col min-h-screen pb-[250px] items-center bg-orange-50`}>
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

                        <Button type="button" onClick={() => setShowQRCode(true)} className="bg-orange-500 text-white w-full rounded-full py-6 text-lg font-semibold">Tagih</Button>
                    </div>
                </div>
            </div>

            {showQRCode && <QRCodePage type="kasir" datas={basket} />}
        </>
    )
}

export default OrderProcessed
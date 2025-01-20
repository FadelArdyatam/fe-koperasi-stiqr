import { ArrowLeft, Save, Image, Trash2, Pencil } from "lucide-react";
import takeAway from "../../images/take-away.png"
import dineIn from "../../images/dine-in.png"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import OrderProcessed from "./OrderProcessed";
import { bookingDatas } from '@/pages/Booking/Booking';

interface OrderSummaryProps {
    basket: any[];
    setBasket: React.Dispatch<React.SetStateAction<any[]>>;
    showService: { show: boolean; service: string | null };
    setShowService: React.Dispatch<React.SetStateAction<{ show: boolean; service: string | null }>>;
    references: React.MutableRefObject<HTMLDivElement | null>;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ setBasket, basket, showService, setShowService, references }) => {
    const [mergedBasket, setMergedBasket] = useState<any[]>([]);
    const [showOrderProcess, setShowOrderProcess] = useState(false);

    // Update mergedBasket setiap kali basket berubah
    useEffect(() => {
        const mergedBasket = basket.reduce((acc, curr) => {
            const existingProduct = acc.find((item: { product: any }) => item.product === curr.product);

            if (existingProduct) {
                existingProduct.quantity += curr.quantity;
                existingProduct.price += curr.price;
            } else {
                acc.push({ ...curr });
            }

            return acc;
        }, []);

        setMergedBasket(mergedBasket);
    }, [basket]);

    // Function untuk menambah kuantitas
    const increaseHandler = (index: number) => {
        const updatedBasket = [...basket];
        const productToUpdate = mergedBasket[index];

        setBasket(
            updatedBasket.map((item) =>
                item.product === productToUpdate.product
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    // Function untuk mengurangi kuantitas
    const decreaseHandler = (index: number) => {
        const updatedBasket = [...basket];
        const productToUpdate = mergedBasket[index];

        setBasket(
            updatedBasket
                .map((item) =>
                    item.product === productToUpdate.product
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0) // Hapus item jika quantity <= 0
        );
    };

    console.log("show service from order summary: ", showService);
    console.log("merged basket: ", mergedBasket);

    return (
        <div ref={references}>
            <div className={`${showOrderProcess ? 'hidden' : 'flex'} w-full flex-col min-h-screen pb-[250px] items-center bg-orange-50`}>
                <div className={`p-5 w-full bg-white`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <button onClick={() => setShowService({ show: false, service: null })}><ArrowLeft /></button>

                            <p className="font-semibold text-2xl">Ringkasan Pesanan</p>
                        </div>

                        <div className="flex items-center justify-center p-3 bg-orange-100 rounded-full">
                            <Save />
                        </div>
                    </div>
                </div>

                <div className="w-[90%] flex items-center justify-between gap-5 mt-5 bg-white p-5 shadow-lg rounded-md">
                    <img className="w-10" src={showService.service === "Dine In" ? dineIn : takeAway} alt="" />

                    <p className="font-semibold text-lg">{showService.service === "Dine In" ? "Makan di Tempat" : "Bawa Pulang"}</p>

                    <Button type="button" className="block bg-orange-100 text-orange-400 rounded-full">Ubah</Button>
                </div>

                <div className="mt-10 w-[90%]">
                    <div className="flex items-center gap-5">
                        <div className="w-[65%]">
                            <p className="font-semibold">Nama Pesanan (Opsional)</p>

                            <Input type="text" placeholder="Nama Pesanan" className="w-full bg-white p-3 rounded-lg mt-2" />
                        </div>

                        <div className="w-[35%]">
                            <p className="font-semibold">No. Meja</p>

                            <Input placeholder="No. Meja" className="w-full bg-white p-3 rounded-lg mt-2" />
                        </div>
                    </div>

                    <div className="mt-5 w-full flex items-center gap-5 justify-between bg-white p-5 rounded-lg">
                        <p className="font-semibold">Ada lagi pesanannya?</p>

                        <Button onClick={() => setShowService({ show: false, service: null })} className="bg-orange-400">+ Tambah</Button>
                    </div>
                </div>

                <div className="mt-5 w-[90%]">
                    {mergedBasket.map((item, index) => (
                        <div key={index} className="w-full mt-5 p-5 rounded-lg bg-white shadow-lg">
                            <div className="flex items-start gap-5 justify-between">
                                <div className="flex items-center gap-5">
                                    <Image className="scale-[2]" />

                                    <div>
                                        <p className="text-lg font-semibold">{item.product}</p>

                                        <p className="font-semibold text-xl">{Number(item.price).toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        })}</p>
                                    </div>
                                </div>

                                <button onClick={() => decreaseHandler(index)} className="text-red-500"><Trash2 /></button>
                            </div>

                            <div className="mt-10 flex items-center justify-between gap-5">
                                <button className="flex items-center gap-3 font-semibold text-orange-400 rounded-lg">
                                    <Pencil />

                                    <p>Edit</p>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => decreaseHandler(index)} className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl">-</button>

                                    <span className="font-semibold">{item.quantity}</span>

                                    <button onClick={() => increaseHandler(index)} className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-0 w-full bg-white p-5 flex flex-col items-center justify-between">
                    <div className="flex w-full items-center justify-between gap-5">
                        <p className="font-semibold text-xl">Total Tagihan</p>

                        <p className="font-semibold text-xl">{Number(mergedBasket.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                        })}</p>
                    </div>

                    <div className="w-full mt-10 flex items-center gap-5 justify-between">
                        <Button onClick={() => setBasket([])} className="rounded-full w-14 h-14 min-w-14 min-h-14 bg-orange-100 text-orange-400 font-semibold"><Trash2 className="scale-[1.5]" /></Button>

                        <Button onClick={() => { setShowOrderProcess(true); bookingDatas.push(mergedBasket) }} className={`${showService.service === "Take Away" ? 'hidden' : 'flex'} bg-orange-500 items-center justify-center text-white w-full rounded-full py-6 text-lg font-semibold`}>Open Bill</Button>

                        <Button className="bg-orange-500 text-white w-full rounded-full py-6 text-lg font-semibold">Tagih</Button>
                    </div>
                </div>
            </div>

            {showOrderProcess && <OrderProcessed setShowOrderProcess={setShowOrderProcess} basket={mergedBasket} showService={showService} />}
        </div>
    )
}

export default OrderSummary
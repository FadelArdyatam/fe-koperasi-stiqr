import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Computer, Search, SlidersHorizontal, Image } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const bookingDatas: any[] = [[{ product: 'dana', quantity: 2, price: 12000, notes: '', date: "1/20/2025, 12:46:16 AM" }]];

const Booking = () => {
    const [searchTerm, setSearchTerm] = useState('')

    console.log("bookingDatas: ", bookingDatas)

    return (
        <div className="w-full flex flex-col min-h-screen items-center bg-orange-50">
            <div className={`p-5 w-full`}>
                <div className="w-full flex items-center gap-5 justify-between">
                    <div className="flex items-center gap-5">
                        <Link to={"/dashboard"}><ArrowLeft /></Link>

                        <p className="font-semibold text-2xl">Pesanan</p>
                    </div>
                </div>

                <div className="mt-10 relative">
                    {/* Ikon Pencarian */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <Search />
                    </div>

                    {/* Input */}
                    <Input
                        placeholder="Cari Produk"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-12 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500"
                    />

                    {/* Ikon Pengaturan */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <SlidersHorizontal />
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-5 justify-between">
                    <Button className={`bg-orange-100 rounded-full text-orange-500`}>
                        Diproses
                    </Button>
                </div>
            </div>

            <div className="mt-5 w-[90%] bg-white p-5 rounded-lg shadow-lg">
                {bookingDatas.map((datas, index) => (
                    <div key={index} className="w-full">
                        <div key={index} className="w-full">
                            <div className="w-full flex items-center gap-5 justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-lg">Antrian {Number(index) + 1}</p>

                                    <div className="text-sm p-1 text-orange-500 w-max bg-orange-200 rounded-lg flex items-center justify-center">
                                        <p>Belum Dibayar</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Computer />

                                    <p className="font-semibold">Kasir</p>
                                </div>
                            </div>

                            <div className="w-full h-[1px] bg-gray-300 my-5"></div>

                            <div>
                                <div className="flex items-center gap-5">
                                    <Image className="scale-[2]" />

                                    <div>
                                        <p className="text-lg font-semibold">{datas[0].product}</p>

                                        <p className="text-base text-gray-500">{datas[0].date}</p>

                                        <p className={`${datas.length > 1 ? 'block' : 'hidden'} text-base text-gray-500`}>+{datas.length - 1} produk lainnya</p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center gap-2">
                                    <p className="font-semibold text-xl">{Number((Number(datas[0].price) * Number(datas[0].quantity ?? 0))).toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                    })}</p>

                                    <p className="font-semibold text-gray-500">({datas[0].quantity} produk)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                )}
            </div>
        </div>
    )
}

export default Booking;
export { bookingDatas };
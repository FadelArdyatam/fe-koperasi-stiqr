import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/hooks/axiosInstance";
import noDataImg from "@/images/no-data-image/product.png";
import {
    ArrowLeft,
    Computer,
    Search,
    SlidersHorizontal,
    Image,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderProcessed from "../Casheer/OrderProcessed";
import { formatRupiah } from "../../hooks/convertRupiah";
import { convertDate, convertTime } from "@/hooks/convertDate";

const bookingDatas: any[] = [
    [
        {
            product: "dana",
            quantity: 2,
            price: 12000,
            notes: "",
            date: "1/20/2025, 12:46:16 AM",
        },
    ],
];

export interface ISales {
    sales_id: string;
    queue_number: number;
    quantity: number;
    subtotal: number;
    customer_name: string;
    status: "inprogress" | "done" | "cancel";
    order_type: "dinein" | "takeaway" | "delivery"; // Sesuaikan dengan jenis order yang valid
    table_number: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
    sales_details: ISalesDetail[];
}

export interface ISalesDetail {
    id: string;
    sales_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    price: number;
    subtotal: number;
    created_at: string;
    updated_at: string;
    product: IProduct;
    variant: IVariant | null;
}

export interface IProduct {
    id: number;
    product_id: string;
    product_name: string;
    product_sku: string;
    product_weight: string;
    product_category: string;
    product_price: number;
    product_status: boolean;
    product_description: string;
    product_image: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
}

export interface IVariant {
    id: number;
    variant_id: string;
    variant_name: string;
    product_id: string;
    variant_description: string;
    is_multiple: boolean;
    multiple_value: string;
    merchant_id: string;
    created_at: string;
    updated_at: string;
}
const Booking = () => {
    const LabelStatus = ({ status }: { status: string }) => {
        switch (status) {
            case "inprogress":
                return (
                    <div className="text-sm px-2 py-1 text-orange-500 w-max bg-orange-200 rounded-lg flex items-center justify-center">
                        <p>Belum Dibayar</p>
                    </div>
                );
            case "done":
                return (
                    <div className="text-sm px-2 py-1 text-green-500 w-max bg-green-200 rounded-lg flex items-center justify-center">
                        <p>Selesai</p>
                    </div>
                );
            case "cancel":
                return (
                    <div className="text-sm px-2 py-1 text-red-500 w-max bg-red-200 rounded-lg flex items-center justify-center">
                        <p>Dibatalkan</p>
                    </div>
                );
            default:
                return (
                    <div className="text-sm px-2 py-1 text-gray-500 w-max bg-gray-200 rounded-lg flex items-center justify-center">
                        <p>Status Tidak Diketahui</p>
                    </div>
                );
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [showOrderProcess, setShowOrderProcess] = useState(false);
    const [index, setIndex] = useState(0);
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const [status, setStatus] = useState<string>("inprogress");
    const [datas, setDatas] = useState<ISales[]>([]); // Disesuaikan sesuai tipe data response

    const statuses = [
        { value: "inprogress", label: "Belum Dibayar" },
        { value: "done", label: "Selesai" },
        { value: "cancel", label: "Dibatalkan" },
    ];
    const handleChangeStatus = (value: string) => {
        setStatus(value);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(
                    `/sales/${userData.merchant.id}?status=${status}`
                );
                setDatas(response.data);
                console.log(response.data);
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchData();
    }, [status]);

    console.log(datas);
    return (
        <>
            <div
                className={`${showOrderProcess ? "hidden" : "flex"
                    } w-full flex-col min-h-screen items-center bg-orange-50`}
            >
                <div className={`p-5 w-full`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <Link to={"/dashboard"}>
                                <ArrowLeft />
                            </Link>

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
                </div>

                <div className=" w-[90%] flex flex-col gap-5">
                    <div className="flex gap-3">
                        {statuses.map((status, i) => (
                            <div key={i} className="flex items-center gap-5 justify-between">
                                <Button
                                    onClick={() => handleChangeStatus(status.value)}
                                    className={`bg-orange-100 rounded-full text-orange-500`}
                                >
                                    {status.label}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {datas.length == 0 && (
                    <div className="mt-20 flex justify-center flex-col items-center gap-5">
                        <img src={noDataImg} className="md:w-9/12 w-8/12" />
                        <p className="text-orange-500 font-bold text-xl">
                            Belum ada Pemesanan
                        </p>
                    </div>
                )}
                    {datas.map((data, index) => (
                        <div className="mt-5 w-[90%] bg-white p-5 rounded-lg shadow-lg">
                            <div key={index} className="w-full">
                                <div key={index} className="w-full">
                                    <div className="w-full flex items-center gap-5 justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-lg">
                                                Antrian {Number(index) + 1}
                                            </p>
                                            <LabelStatus status={status} />
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
                                                <p className="text-lg font-semibold">
                                                    {data.sales_details[0]?.product.product_name}
                                                </p>

                                                <p className="text-base text-gray-500">
                                                    {convertDate(data.created_at)} |{" "}
                                                    {convertTime(data.created_at)}{" "}
                                                </p>

                                                <p
                                                    className={`${data.sales_details.length > 1 ? "block" : "hidden"
                                                        } text-base text-gray-500`}
                                                >
                                                    +{data.sales_details.length - 1} produk lainnya
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center gap-2">
                                            <p className="font-semibold text-xl">
                                                {formatRupiah(data.subtotal)}
                                            </p>

                                            <p className="font-semibold text-gray-500">
                                                ({data.quantity} produk)
                                            </p>
                                        </div>
                                        <div className="w-full mt-5">
                                            <div className="w-full flex items-center gap-5">
                                                <Button className="w-full rounded-full bg-transparent border border-orange-500 text-orange-500">
                                                    Tambah Pesanan
                                                </Button>

                                                <Button className="w-full rounded-full bg-orange-200 border border-orange-500 text-orange-500">
                                                    Cetak Struk
                                                </Button>
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    setShowOrderProcess(true);
                                                    setIndex(index);
                                                }}
                                                className="mt-5 bg-orange-500 text-white w-full rounded-full"
                                            >
                                                Detail Pemesanan
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {console.log(datas[index])}

            {showOrderProcess && (
                <OrderProcessed
                    setShowOrderProcess={setShowOrderProcess}
                    basket={datas[index]}
                />
            )}
        </>
    );
};

export default Booking;
export { bookingDatas };

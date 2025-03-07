import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/hooks/axiosInstance";
import noDataImg from "@/images/no-data-image/product.png";
import {
    ArrowLeft,
    ClipboardList,
    Computer,
    CookingPot,
    ReceiptText,
    Search,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderProcessed from "../Casheer/OrderProcessed";
import { formatRupiah } from "../../hooks/convertRupiah";
import { convertDate, convertTime } from "@/hooks/convertDate";
import Receipt from "@/components/Receipt";
import AOS from "aos";
import "aos/dist/aos.css";
import noProduct from '../../images/no-product.png'


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
    orderId?: string;
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
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

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
    const [showReceipt, setShowReceipt] = useState({ type: "", show: false, index: index });

    const [tagih, setTagih] = useState(false)


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
        <div>
            <div className={`${showOrderProcess || !showReceipt.show && showReceipt.type !== "" ? "hidden" : "flex"} pb-10 w-full flex-col min-h-screen items-center bg-orange-50`}>
                <div className={`p-5 w-full`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <Link to={"/dashboard"}>
                                <ArrowLeft />
                            </Link>

                            <p data-aos="zoom-in" className="font-semibold text-2xl">Pemesanan</p>
                        </div>
                    </div>

                    <div data-aos="zoom-in" data-aos-delay="100" className="mt-10 relative">
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
                    </div>
                </div>

                <div data-aos="zoom-in" data-aos-delay="200" className="w-[90%] flex flex-col gap-5">
                    <div className="flex gap-3">
                        {statuses.map((status) => (
                            <div key={status.value} className="flex items-center gap-5 justify-between">
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
                    <div data-aos="fade-up" data-aos-delay="300" className="mt-20 flex justify-center flex-col items-center gap-5">
                        <img src={noDataImg} className="md:w-9/12 w-8/12" />
                        <p className="text-orange-500 font-bold text-xl">
                            Belum ada Pemesanan
                        </p>
                    </div>
                )}

                {datas.map((data, index) => (
                    <div data-aos="zoom-in" data-aos-delay={index * 100} key={data.sales_id} className="mt-5 w-[90%] bg-white p-5 rounded-lg shadow-lg">
                        <div className="w-full">
                            <div className="w-full">
                                <div className="w-full flex items-center gap-5 justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-lg">
                                            Antrian {data.queue_number}
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
                                        <img src={`${data?.sales_details[0]?.product?.product_image ?? noProduct}`} alt={data?.sales_details[0]?.product?.product_image} className="h-12 w-12 object-cover rounded-md" />

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
                                        <div className={`${status === 'cancel' ? 'hidden' : 'flex'} w-full items-center gap-5`}>
                                            <Button className={`${status === 'done' || status === 'cancel' ? 'hidden' : 'block'} w-full rounded-full bg-transparent border border-orange-500 text-orange-500`}>
                                                Tambah Pesanan
                                            </Button>

                                            <Button onClick={() => setShowReceipt({ type: "", show: true, index: index })} className="w-full rounded-full bg-orange-200 border border-orange-500 text-orange-500">
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

            {showOrderProcess && (
                <OrderProcessed
                    setShowOrderProcess={setShowOrderProcess}
                    basket={datas[index]}
                    tagih={tagih}
                    setTagih={setTagih}
                    orderId={datas[index].orderId}
                    type="detail"
                    selectedCustomer={undefined} />
            )}

            {showReceipt.show && (
                <div className="fixed flex items-end justify-center top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50">
                    <div className="w-[100%] bg-white p-5 mt-5 rounded-t-lg flex items-center flex-col gap-5">
                        <div className="flex items-center gap-5 justify-between w-full">
                            <p className="font-semibold text-lg m-auto">
                                Pilih Jenis Struk Antrian {datas[showReceipt.index].queue_number}
                            </p>

                            <button onClick={() => setShowReceipt({ type: "", show: false, index: 0 })}>
                                <X />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 w-full">
                            {/* Struk Dapur */}
                            <label
                                htmlFor="dapur"
                                className="flex items-center justify-between gap-5 cursor-pointer p-2 rounded-lg hover:bg-orange-100"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 min-w-10 min-h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                                        <CookingPot />
                                    </div>

                                    <div>
                                        <p className="font-semibold">Struk Dapur</p>
                                        <p>Informasi menu yang harus disiapkan oleh juru masak.</p>
                                    </div>
                                </div>

                                <Input
                                    type="radio"
                                    id="dapur"
                                    name="receiptType"
                                    value="dapur"
                                    className="w-6 h-6"
                                    onChange={(e) =>
                                        setShowReceipt({
                                            ...showReceipt,
                                            type: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            {/* Struk Checker */}
                            <label
                                htmlFor="checker"
                                className="flex items-center justify-between gap-5 cursor-pointer p-2 rounded-lg hover:bg-orange-100"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 min-w-10 min-h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                                        <ClipboardList />
                                    </div>

                                    <div>
                                        <p className="font-semibold">Struk Checker</p>
                                        <p>Informasi untuk memeriksa kesesuaian pesanan pembeli.</p>
                                    </div>
                                </div>

                                <Input
                                    type="radio"
                                    id="checker"
                                    name="receiptType"
                                    value="checker"
                                    className="w-6 h-6"
                                    onChange={(e) =>
                                        setShowReceipt({
                                            ...showReceipt,
                                            type: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            {/* Struk Tagihan */}
                            <label
                                htmlFor="tagihan"
                                className="flex items-center justify-between gap-5 cursor-pointer p-2 rounded-lg hover:bg-orange-100"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 min-w-10 min-h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                                        <ReceiptText />
                                    </div>

                                    <div>
                                        <p className="font-semibold">Struk Tagihan</p>
                                        <p>Informasi bukti pembayaran untuk pembeli.</p>
                                    </div>
                                </div>

                                <Input
                                    type="radio"
                                    id="tagihan"
                                    name="receiptType"
                                    value="tagihan"
                                    className="w-6 h-6"
                                    onChange={(e) =>
                                        setShowReceipt({
                                            ...showReceipt,
                                            type: e.target.value,
                                        })
                                    }
                                />
                            </label>
                        </div>

                        <Button
                            className="mt-5 bg-orange-500 text-white w-full rounded-full"
                            disabled={!showReceipt.type}
                            onClick={() => {
                                console.log(`Jenis struk yang dipilih: ${showReceipt.type}`);
                                setShowReceipt({ ...showReceipt, show: false });
                            }}
                        >
                            Konfirmasi
                        </Button>
                    </div>
                </div>
            )}

            {!showReceipt.show && showReceipt.type !== "" && <Receipt data={datas[showReceipt.index]} showReceipt={showReceipt} setShowReceipt={setShowReceipt} />}
        </div>
    );
};

export default Booking;
export { bookingDatas };
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Bill from "@/components/Bill";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";
import Notification from "@/components/Notification";

// interface BillData {
//     product: string;
//     amount: number;
//     date: string;
//     time: string;
//     productCode: string;
//     phoneNumber: string;
//     inquiryId: number;
//     processingFee: number;
//     totalAdmin: number;
// }

const Listrik = () => {
    const [nominal, setNominal] = useState("");
    const [noMeter, setNoMeter] = useState("");
    const [type, setType] = useState("");
    const [dataBill, setDataBill] = useState<any | null>(null);
    const [showBill, setShowBill] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelecteProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({ show: false, message: "" });

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const responseProducts = await axiosInstance.post("/ayoconnect/products",
                    {
                        "category": "listrik",
                        "status": "active",
                        "biller": type == 'Token Listrik' ? "PLN prepaid" : "PLN postpaid"
                    },);
                setProducts(responseProducts.data.data);

                console.log("Products Response:", responseProducts.data);
            } catch (err) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        checkProfile();
    }, [type])

    const sendBill = async () => {
        setLoading(true)
        try {

            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;

            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: noMeter,
                productCode: selectedProduct.code,
                amount: selectedProduct.amount,
                merchant_id: userData.merchant.id,
            });

            if (response.data.success) {
                const data = {
                    ...response.data.data,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                };
                setDataBill(data);
                setShowBill(true);
                setLoading(false)
            }
        } catch (err: any) {
            setLoading(false)
            setError({ show: true, message: err.response.data ? err.response.data.message : "Terjadi kesalahan saat melakukan pembelian paket. Silakan coba lagi." });
        }

    };

    const handleDropdownChange = (value: string) => {
        console.log("Value:", value);
        setSelecteProduct(products.find((product) => product.amount === value))
        setNominal(value);
    };

    const handleRadioChange = (value: string) => {
        setType(value);
        AOS.refresh();
        if (value === "Tagihan Listrik") {
            console.log('tagihan listrik')
            console.log(products)
            setNominal("");
            setSelecteProduct(products[0])
        }
    };

    console.log(selectedProduct)
    return (
        <>
            <div className="w-full p-10 pb-32 flex items-center justify-center bg-orange-400 bg-opacity-100">
                <Link to={"/dashboard"} className="bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>

                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center uppercase">
                    Listrik
                </p>
            </div>

            <div className={`${showBill ? "hidden" : "block"}`}>
                <div className="bg-white w-[90%] -translate-y-[100px] p-10 shadow-lg rounded-md m-auto">
                    <p data-aos="fade-up" data-aos-delay="100" className="font-semibold m-auto text-xl text-center">
                        Beli Token Atau Bayar Listrik
                    </p>

                    <RadioGroup
                        data-aos="fade-up"
                        data-aos-delay="200"
                        defaultValue=""
                        onValueChange={handleRadioChange}
                        className="mt-10 w-full flex items-center gap-5 justify-center"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Token Listrik" id="r1" />
                            <Label htmlFor="r1">Token Listrik</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Tagihan Listrik" id="r2" />
                            <Label htmlFor="r2">Tagihan Listrik</Label>
                        </div>
                    </RadioGroup>

                    <div data-aos="fade-up" data-aos-delay="300" className="mt-10">
                        <p>No. Meter/ID Pel</p>

                        <Input
                            onChange={(e) => setNoMeter(e.target.value)}
                            type="number"
                            className="w-full p-5 border border-black bg-white shadow-lg mt-2"
                        />
                    </div>

                    {/* Dropdown hanya muncul jika tipe adalah "Token Listrik" */}
                    {type === "Token Listrik" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div data-aos="fade-up" className="mt-10">
                                    <p>Nominal</p>

                                    <div className="flex items-center gap-5 border mt-2 text-gray-400 border-black rounded-lg p-2 justify-between">
                                        <button>{formatRupiah(nominal) || "Nominal"}</button>

                                        <ChevronDown />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg w-full sm:min-w-[600px] min-w-max max-h-32 overflow-y-auto flex flex-col gap-3">
                                {products.map((product, index) => (
                                    <DropdownMenuItem onClick={() => handleDropdownChange(product.amount)} key={index}>
                                        {Number(product.amount).toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        })}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className={`${type.length === 0 || noMeter.length === 0 || (type === "Token Listrik" && nominal.length === 0) ? "hidden" : "block"} w-[90%] m-auto shadow-lg -translate-y-10 rounded-lg p-5`}>
                    <p className="font-semibold">Keterangan</p>

                    <p className="mt-3">
                        1. Informasi kode token yang Anda bayar akan dikirimkan{" "}
                        <span className="font-semibold">maksimal 2 x 24 jam.</span>
                    </p>

                    <p className="mt-3">
                        2. Pembelian token listrik tidak dapat dilakukan pada{" "}
                        <span className="font-semibold">jam 23:00 - 00:59.</span>
                    </p>
                </div>

                <Button
                    onClick={sendBill}
                    className={`${type.length === 0 || noMeter.length === 0 || (type === "Token Listrik" && nominal.length === 0) ? "hidden" : "block"} w-[90%] m-auto bg-green-400 text-white py-3 rounded-md hover:bg-green-500 mb-10`}
                >
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={false} />}
            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}
            {
                loading && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )
            }
        </>
    );
};

export default Listrik;

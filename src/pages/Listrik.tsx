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

interface BillData {
    product: string;
    amount: string;
    date: string;
    time: string;
    productCode: any;
    phoneNumber: any;
    inquiryId: any;
}

const Listrik = () => {
    const [nominal, setNominal] = useState("");
    const [noMeter, setNoMeter] = useState("");
    const [type, setType] = useState("");
    const [dataBill, setDataBill] = useState<BillData | null>(null);
    const [showBill, setShowBill] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelecteProduct] = useState<any>(null);

    useEffect(() => {
        AOS.init({ duration: 500, once: false, offset: 100 });
    }, []);

    useEffect(() => {
        const checkProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                console.warn("Token tidak ditemukan untuk otorisasi.");
                return;
            }

            try {

                const responseProducts = await axiosInstance.post("/ayoconnect/products",
                    {
                        "category": "listrik",
                        "status": "active"
                    },);

                setProducts(responseProducts.data.data);

                console.log("Products Response:", responseProducts.data);
            } catch (err) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        checkProfile();
    }, [])

    const sendBill = async () => {
        try {
            console.log('Selected Product:', selectedProduct)

            // Ambil informasi user dari sessionStorage
            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;

            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: noMeter,
                productCode: selectedProduct.code,
                amount: selectedProduct.amount,
                merchant_id: userData.merchant.id,
            });

            console.log('Inquiry Response:', response.data)

            const data = {
                product: selectedProduct.name,
                amount: selectedProduct.amount + 300,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                productCode: selectedProduct.code, // Add appropriate value
                phoneNumber: noMeter, // Add appropriate value
                inquiryId: response.data.data.inquiryId, // Add appropriate
            };

            setDataBill(data);
            setShowBill(true);
        } catch (err) {
            console.error("Error saat mengambil profile:", err);
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
            setNominal(""); // Reset nominal jika tipe "Tagihan Listrik" dipilih
        }
    };

    console.log("Products:", products);

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
                                        <button>{nominal || "Nominal"}</button>

                                        <ChevronDown />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg w-[300px] flex flex-col gap-3">
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

                <div className={`${type.length === 0 || noMeter.length === 0 || (type === "Token Listrik" && nominal.length === 0) ? "hidden" : "block"} w-[90%] m-auto shadow-lg rounded-lg p-5`}>
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
                    className={`${type.length === 0 || noMeter.length === 0 || (type === "Token Listrik" && nominal.length === 0) ? "hidden" : "block"} w-[90%] m-auto bg-green-400 text-white py-3 rounded-md hover:bg-green-500 mt-10 mb-10`}
                >
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={false} />}
        </>
    );
};

export default Listrik;

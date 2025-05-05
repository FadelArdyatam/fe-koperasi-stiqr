import Bill from "@/components/Bill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/hooks/axiosInstance";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { ChevronDown, ChevronLeft, History, Info, Tag } from "lucide-react"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import AOS from "aos";
import "aos/dist/aos.css";
import Notification from "@/components/Notification";
import RecomendationModalPPOB from "@/components/RecomendationModalPPOB";
import MarginPPOB from "@/components/MarginPPOB";
import useMarginPPOB from "@/hooks/useMarginPPOB";

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
// interface BillData {
//     data:any;
// }

const PAM = () => {
    const [region, setregion] = useState("")
    const [phoneNumber, setphoneNumber] = useState("")
    const [dataBill, setDataBill] = useState<any | null>(null)
    const [showBill, setShowBill] = useState(false)
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelecteProduct] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({ show: false, message: "" });

    const hooksMargin = useMarginPPOB()
    const [showRecomendation, setShowRecomendation] = useState(false)
    const [showMargin, setShowMargin] = useState(false)
    const [margin, setMargin] = useState("0");

    useEffect(() => {
        if (hooksMargin.margin.pdam !== undefined) {
            setMargin(String(hooksMargin.margin.pdam));
        }
    }, [hooksMargin.margin.pdam]);
    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
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
                        "category": "PDAM",
                        "status": "active"
                    },
                );

                setProducts(responseProducts.data.data);

                console.log("Products Response:", responseProducts.data);
            } catch (err) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        checkProfile();
    }, [])

    const sendBill = async () => {
        if (!selectedProduct) {
            setError({ show: true, message: "Silakan pilih produk terlebih dahulu." });
            return;
        }
        setLoading(true)
        try {
            console.log('Selected Product:', selectedProduct)

            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;

            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: phoneNumber,
                productCode: selectedProduct.code,
                merchant_id: userData.merchant.id,
                amount: selectedProduct.amount,
                margin: margin
            });

            const data = {
                ...response.data.data,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
            }

            setDataBill(data)
            setShowBill(true)
            setLoading(false)
        } catch (error: any) {
            setLoading(false)
            setError({ show: true, message: error.response.data ? error.response.data.message : "Terjadi kesalahan saat melakukan pembelian paket. Silakan coba lagi." });
        }
    }

    const handleDropdownChange = (value: string) => {
        setSelecteProduct(products.find((product) => product.name === value))
        setregion(value)
    };

    return (
        <>
            <div className='w-full p-10 pb-32 flex items-center justify-center bg-orange-400 bg-opacity-100'>
                <Link to={'/dashboard'} className='bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>PDAM</p>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div className="bg-white w-[90%] -translate-y-[100px] p-10 shadow-lg rounded-md m-auto relative">
                    <p data-aos="fade-up" data-aos-delay="100" className="font-semibold m-auto text-xl text-center">Bayar Tagihan Air</p>
                    <div className="flex md:flex-row flex-col mt-5 mx-auto justify-between">
                        {/* Disclaimer kiri dengan icon dan warna disesuaikan */}
                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-md shadow-sm border border-blue-200">
                            <Info className="w-5 h-5 text-blue-500" />
                            <p className="text-sm text-gray-800 ">
                                Reseller: <span className="font-medium">Wajib Atur Biaya Tambahan</span> untuk keuntungan Anda.
                            </p>
                        </div>

                        {/* Tombol pojok kanan atas */}
                        <div className="flex p-2">
                            <div
                                onClick={() => setShowMargin(true)}
                                className="flex md:w-auto w-full justify-center items-center gap-2 bg-green-500 text-white text-xs px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition duration-300 cursor-pointer whitespace-nowrap"
                            >
                                <Tag className="w-4 h-4" />
                                <span className="font-medium">Atur Biaya Tambahan</span>
                            </div>
                        </div>
                    </div>


                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div data-aos="fade-up" data-aos-delay="200" className="mt-5 w-full">
                                <p>Wilayah</p>

                                <div className="flex items-center gap-5 border mt-2 text-gray-400 border-black rounded-lg p-2 justify-between">
                                    <button>{region || "Wilayah"}</button>

                                    <ChevronDown />
                                </div>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="bg-white p-5 border mt-3 z-10 rounded-lg w-[var(--radix-popper-anchor-width)] max-h-64 overflow-y-auto flex flex-col gap-3"
                            align="start"
                        >
                            {products.map((product, index) => (
                                <DropdownMenuItem key={index} onClick={() => handleDropdownChange(product?.name)}>
                                    {product?.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div data-aos="fade-up" data-aos-delay="300" className="mt-5">
                        <div className="flex flex-row justify-between mb-2 ">
                            <p>Nomor Pelanggan</p>
                            <History onClick={() => setShowRecomendation(true)} className="text-orange-400 hover:cursor-pointer" />
                        </div>
                        <div className="flex flex-row items-center gap-5">
                            <Input onChange={(e) => setphoneNumber(e.target.value)} type="number" value={phoneNumber} className="border border-black" />
                        </div>

                    </div>
                </div>

                <Button onClick={sendBill} className={`${phoneNumber.length === 0 || region.length === 0 ? 'hidden' : 'block'} uppercase text-center w-[90%] mb-10 bg-green-500 fixed bottom-[20%] left-[50%] -translate-x-[50%] text-white z-0`}>
                    Lanjutkan
                </Button>
            </div>
            {showRecomendation && (
                <RecomendationModalPPOB category="PDAM" setAccountNumber={setphoneNumber} setShowRecomendation={setShowRecomendation} />
            )}
            {showBill && dataBill && <Bill data={dataBill} marginTop={false} marginFee={margin} />}
            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}
            {
                loading && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )
            }
            {
                showMargin && <MarginPPOB showMargin={showMargin} setShowMargin={setShowMargin} type="PDAM" margin={margin} setMargin={setMargin} />
            }
        </>
    )
}

export default PAM
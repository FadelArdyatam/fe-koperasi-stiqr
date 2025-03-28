import Bill from "@/components/Bill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { ChevronLeft, ChevronDown, History, Tag } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AOS from "aos";
import "aos/dist/aos.css";
import axiosInstance from "@/hooks/axiosInstance"
import Notification from "@/components/Notification"
import RecomendationModalPPOB from "@/components/RecomendationModalPPOB"
import MarginPPOB from "@/components/MarginPPOB"
import useMarginPPOB from "@/hooks/useMarginPPOB"

interface BillData {
    product: string;
    amount: string;
    date: string;
    time: string;
    productCode: any;
    phoneNumber: any;
    inquiryId: any;
}

const BPJS = () => {
    const [range, setRange] = useState<number>(1)
    const [KTP, setKTP] = useState("")
    const [dataBill, setDataBill] = useState<BillData | null>(null)
    const [showBill, setShowBill] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({ show: false, message: "" });
    const [productCode, setProductCode] = useState("")

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, [])

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const responseProducts = await axiosInstance.post("/ayoconnect/products",
                    {
                        "category": "BPJS",
                        "status": "active",
                        // "code": "TBPU"
                    },);
                setProducts(responseProducts.data.data);
                console.log("Products Response:", responseProducts.data);
            } catch (err) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        checkProfile();
    }, [])
    console.log(products)
    const sendBill = async () => {
        setLoading(true)
        try {
            if (!productCode) {
                setLoading(false)
                return setError({ show: true, message: "Silakan pilih produk yang akan dibeli." });
            }

            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;
            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: KTP,
                productCode: productCode,
                merchant_id: userData.merchant.id,
                month: range
            });
            if (response.data.success) {
                const data = {
                    ...response.data.data,
                    month: range,
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
    }

    const handleDropdownChange = (value: number) => {
        setRange(value)
    };

    const handleProductCode = (value: string) => {
        setProductCode(value);
    };

    const hooksMargin = useMarginPPOB()
    const [showRecomendation, setShowRecomendation] = useState(false)
    const [showMargin, setShowMargin] = useState(false)
    const [margin, setMargin] = useState("0");

    useEffect(() => {
        if (hooksMargin.margin.bpjs !== undefined) {
            setMargin(String(hooksMargin.margin.bpjs)); // Pastikan format string
        }
    }, [hooksMargin.margin.bpjs]);
    return (
        <>
            <div className='w-full p-10 pb-32 flex items-center justify-center bg-orange-400 bg-opacity-100'>
                <Link to={'/dashboard'} className='bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>BPJS Kesehatan</p>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div className="bg-white w-[90%] -translate-y-[100px] p-10 shadow-lg rounded-md m-auto relative">
                    <p data-aos="fade-up" data-aos-delay="100" className="font-semibold m-auto text-xl text-center">Bayar BPJS</p>
                    <div className="absolute top-0 right-0 p-2">
                        <div onClick={() => setShowMargin(true)} className="flex bg-green-400 flex-row items-center gap-1 text-xs rounded-full px-2 py-1 hover:cursor-pointer hover:bg-green-400 text-white transition ease-in-out duration-300">
                            <Tag className="w-3 h-3 " />
                            <p>Atur Biaya Tambahan</p>
                        </div>
                    </div>
                    {/* <RadioGroup
                        data-aos="fade-up"
                        data-aos-delay="200"
                        defaultValue=""
                        onValueChange={handleRadioChange}
                        className="mt-10 w-full flex items-center gap-5 justify-center"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BPJS Kesehatan" id="r1" />
                            <Label htmlFor="r1">Kesehatan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BPJS TK BPU" id="r2" />
                            <Label htmlFor="r2">Ketenagakerjaan BPU</Label>
                        </div>
                    </RadioGroup> */}
                    <RadioGroup
                        data-aos="fade-up"
                        data-aos-delay="200"
                        defaultValue=""
                        onValueChange={handleProductCode}
                        className="mt-10 w-full flex items-center gap-5 justify-center"
                    >
                        {
                            products.map((product, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <RadioGroupItem value={product.code} id={`r${i + 3}`} />
                                    <Label htmlFor={`r${i + 3}`}>{product.name}</Label>
                                </div>
                            ))
                        }
                    </RadioGroup>

                    <div data-aos="fade-up" data-aos-delay="300" className="mt-5">
                        <div className="flex flex-row justify-between">
                            <p>Nomor BPJS</p>
                            <History onClick={() => setShowRecomendation(true)} className="text-orange-400 hover:cursor-pointer" />
                        </div>
                        <div className="flex fle-row gap-5 items-center mt-2">
                            <Input
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 20);
                                    setKTP(value);
                                }}
                                type="text"
                                value={KTP}
                                className="border border-black"
                            />
                        </div>

                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div data-aos="fade-up" data-aos-delay="400" className="mt-10">
                                <p>Bayar untuk</p>

                                <div className="flex items-center gap-5 border mt-2 text-gray-400 border-black rounded-lg p-2 justify-between">
                                    <button>{range || "type"}</button>

                                    <ChevronDown />
                                </div>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg w-[300px] flex flex-col gap-3">
                            <DropdownMenuItem onClick={() => handleDropdownChange(1)}>1 bulan</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange(2)}>2 bulan</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange(3)}>3 bulan</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* <Button onClick={sendBill} className={`${KTP.length === 0 || type.length === 0 || range.length === 0 ? 'hidden' : 'block'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}> */}
                <Button onClick={sendBill} className={`block uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}>
                    Lanjutkan
                </Button>
            </div>

            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}

            {
                loading && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )
            }

            {showRecomendation && (
                <RecomendationModalPPOB category="BPJS" setAccountNumber={setKTP} setShowRecomendation={setShowRecomendation} />
            )}

            {
                showMargin && <MarginPPOB showMargin={showMargin} setShowMargin={setShowMargin} type="BPJS" margin={margin} setMargin={setMargin} />
            }

            {showBill && dataBill && <Bill data={dataBill} marginTop={false} marginFee={margin} />}
        </>
    )
}

export default BPJS
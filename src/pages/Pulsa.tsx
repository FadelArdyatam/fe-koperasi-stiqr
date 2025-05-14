import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronUp, History, Info, Tag } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Bill from "@/components/Bill"
import axiosInstance from "@/hooks/axiosInstance"
import AOS from "aos";
import "aos/dist/aos.css";
import Notification from "@/components/Notification"
import provider from "@/data/provider.json"
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

const Pulsa = () => {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [selectedProduct, setSelecteProduct] = useState<any>(null)
    const [dataBill, setDataBill] = useState<BillData | null>(null)
    const [showBill, setShowBill] = useState(false)
    const [indexButton, setIndexButton] = useState(-1)
    interface Balance {
        non_cash_amount(non_cash_amount: any): unknown
        amount: number;
    }

    const [balance, setBalance] = useState<Balance>({ amount: 0, non_cash_amount: () => { } });
    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState<string | null>(null);
    const [isClicked, setIsClicked] = useState(false);
    const [error, setError] = useState({ show: false, message: "" });
    const [loading, setLoading] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null)


    const hooksMargin = useMarginPPOB()
    const [showRecomendation, setShowRecomendation] = useState(false)
    const [showMargin, setShowMargin] = useState(false)
    const [margin, setMargin] = useState("0");

    useEffect(() => {
        if (hooksMargin.margin.pulsa !== undefined) {
            setMargin(String(hooksMargin.margin.pulsa)); // Pastikan format string
        }
    }, [hooksMargin.margin.pulsa]);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        const fetchBalance = async () => {
            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;
            try {
                const response = await axiosInstance.get(
                    `/balance/${userData.merchant.id}`,
                );
                setBalance(response.data);
            } catch (err) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        fetchBalance();
    }, [])

    const sendBill = async () => {
        if (!selectedProduct) {
            setError({ show: true, message: "Silakan pilih produk terlebih dahulu." });
            return;
        }
        try {
            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;

            setLoading(true);

            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: phoneNumber,
                productCode: selectedProduct.code,
                merchant_id: userData.merchant.id,
                amount: selectedProduct.amount,
                margin: margin,
            });

            if (response.data) {
                setLoading(false);
                const data = {
                    ...response.data.data,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                };

                setDataBill(data);
                setShowBill(true);
            }

        } catch (error: any) {
            setLoading(false)
            setError({ show: true, message: error.response.data ? error.response.data.message : "Terjadi kesalahan saat melakukan pembelian paket. Silakan coba lagi." });
        }
    };

    const selectedAmountHandler = (amount: object, index: number) => {
        setSelecteProduct(amount);
        setIndexButton(index)
        setIsClicked(true)
    }

    const setCategoryHandler = (newCategory: string) => {
        setCategory(newCategory);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (category != null && selectedProvider != null) {
                const responseProducts = await axiosInstance.post("/ayoconnect/products",
                    {
                        "category": category,
                        "status": "active",
                        "biller": selectedProvider
                    });
                console.log("Products Response:", responseProducts.data);
                setProducts(responseProducts.data.data);
            }
        }

        fetchProduct()
    }, [category, selectedProvider]);


    return (
        <div>
            <div className='fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400 bg-opacity-100'>
                <Link to={'/dashboard'} className='bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>Beli Pulsa</p>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div data-aos="fade-up" data-aos-delay="100" className="relative mt-[70px] text-xl w-full p-8 shadow-lg flex flex-col items-center gap-2 justify-center">
                    <p className="font-bold">Saldo</p>

                    <p className="font-semibold text-orange-500 text-2xl">{Number(balance.non_cash_amount).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>
                </div>

                {/* Kiri: Disclaimer */}
                <div className="flex md:flex-row flex-col mt-5 mx-auto justify-between  w-[90%]">
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
                <div data-aos="fade-up" data-aos-delay="400" className="mt-5 w-[90%] m-auto flex flex-row items-center justify-center gap-5 relative">
                    <Button onClick={() => setCategoryHandler("pulsa")} className={`${category == 'pulsa' ? 'hover:bg-orange-400 bg-orange-400 text-white' : 'hover:bg-orange-400 hover:text-white transition ease-in-out 300 bg-[#F4F4F4] text-black'} w-full`}>
                        Pulsa
                    </Button>

                    <Button onClick={() => setCategoryHandler("paket data")} className={`${category == 'paket data' ? 'hover:bg-orange-400 bg-orange-400 text-white' : 'hover:bg-orange-400 hover:text-white transition ease-in-out 300 bg-[#F4F4F4] text-black'} w-full`}>
                        Paket Data
                    </Button>

                </div>

                <div data-aos="fade-up" className="relative w-[90%] m-auto mt-5">

                    <button
                        type="button"
                        className="p-2 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4] text-left border rounded-md text-sm"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {selectedProvider || "Pilih Provider"}

                        {dropdownOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {selectedProvider == 'Telkomsel' && (
                        <span className="text-gray-500 text-xs italic">*Pembelian atau transaksi produk Telkomsel tidak dapat diproses pada 23:30 - 00:30 WIB.</span>
                    )}

                    {dropdownOpen && (
                        <ul className="left-0 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto z-50">
                            {provider.brand.map((item, index) => (
                                <li
                                    key={index}
                                    className="p-3 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => {
                                        setSelectedProvider(item);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}

                </div>

                <div data-aos="fade-up" data-aos-delay="300" className="mt-5 w-[90%] m-auto flex flex-col items-center gap-5 z-0">
                    <div className="flex flex-row w-full bg-white items-center shadow-sm p-3 border rounded-md gap-3">
                        <input
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value) && value.length <= 15) {
                                    setPhoneNumber(value);
                                }
                            }}
                            value={phoneNumber}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="08xx..."
                            className="w-full p-2"
                        />
                        <History onClick={() => setShowRecomendation(true)} className="text-orange-500 hover:cursor-pointer  shadow-md rounded-full w-9 h-9" />
                    </div>

                    <div className="w-[90%] h-[2px] bg-gray-200 -translate-y-[35px]"></div>
                </div>


                <div className="mt-5 w-[90%] mb-10 m-auto flex flex-col items-center gap-5 shadow-lg">
                    <div className="w-full flex flex-wrap">
                        {products.map((product, index) => (
                            <button type="button" data-aos={isClicked ? undefined : 'fade-up'} data-aos-delay={index * 100} key={index} onClick={() => selectedAmountHandler(product, index)} className={`${indexButton === index ? 'bg-orange-400' : ''} p-10 border transition-all border-gray-300 w-[50%] text-md text-center font-semibold`}>{product.name}</button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={sendBill}
                    className={`${(phoneNumber.length > 0 && category != null && selectedProvider != null) ? 'block' : 'hidden'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}
                >
                    Lanjutkan
                </Button>
            </div>
            {showRecomendation && (
                <RecomendationModalPPOB category="Pulsa" setAccountNumber={setPhoneNumber} setShowRecomendation={setShowRecomendation} />
            )}

            {showBill && dataBill && <Bill data={dataBill} marginTop={true} marginFee={margin} />}

            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}

            {
                showMargin && <MarginPPOB showMargin={showMargin} setShowMargin={setShowMargin} type="Pulsa" margin={margin} setMargin={setMargin} />
            }
            {
                loading && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )
            }
        </div >
    )
}

export default Pulsa
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Bill from "@/components/Bill"
import axiosInstance from "@/hooks/axiosInstance"
import AOS from "aos";
import "aos/dist/aos.css";
import Notification from "@/components/Notification"
import provider from "@/data/provider.json"

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
        try {
            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;

            setLoading(true);

            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: phoneNumber,
                productCode: selectedProduct.code,
                merchant_id: userData.merchant.id,
                amount: selectedProduct.amount,
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

                <div data-aos="fade-up" data-aos-delay="400" className="mt-10 w-[90%] m-auto flex flex-row items-center justify-center gap-5">
                    <Button onClick={() => setCategoryHandler("pulsa")} className={`${category == 'pulsa' ? 'hover:bg-orange-400 bg-orange-400 text-white' : 'hover:bg-orange-400 hover:text-white transition ease-in-out 300 bg-[#F4F4F4] text-black'} w-full`}>
                        Pulsa
                    </Button>

                    <Button onClick={() => setCategoryHandler("paket data")} className={`${category == 'paket data' ? 'hover:bg-orange-400 bg-orange-400 text-white' : 'hover:bg-orange-400 hover:text-white transition ease-in-out 300 bg-[#F4F4F4] text-black'} w-full`}>
                        Paket Data
                    </Button>
                </div>

                <div data-aos="fade-up" className="relative w-[90%] m-auto mt-10">

                    <button
                        type="button"
                        className="p-3 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4] text-left border rounded-md"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {selectedProvider || "Select Provider"}

                        {dropdownOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>

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

                <div data-aos="fade-up" data-aos-delay="300" className="mt-10 w-[90%] m-auto flex flex-col items-center gap-5 z-0">
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
                        placeholder="0812..."
                        className="w-full p-5 bg-white shadow-lg"
                    />

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

            {showBill && dataBill && <Bill data={dataBill} marginTop={true} />}

            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}

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
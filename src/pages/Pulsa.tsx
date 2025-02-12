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
    const [balance, setBalance] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState("pulsa");
    const [searchTerm, setSearchTerm] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [error, setError] = useState({ show: false, message: "" });
    const [loading, setLoading] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState("")

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        const checkProfile = async () => {
            const token = localStorage.getItem("token");

            // Ambil informasi user dari sessionStorage
            const userItem = sessionStorage.getItem("user");
            const userData = userItem ? JSON.parse(userItem) : null;

            if (!token) {
                console.warn("Token tidak ditemukan untuk otorisasi.");
                return;
            }

            try {
                const response = await axiosInstance.get(
                    `/balance/${userData.merchant.id}`,
                );

                const responseProducts = await axiosInstance.post("/ayoconnect/products",
                    {
                        "category": category,
                        "status": "active"
                    },);

                setProducts(responseProducts.data.data);

                console.log("Profile Response:", response);
                console.log("Products Response:", responseProducts.data);
                setBalance(response.data);
            } catch (err) {
                console.error("Error saat mengambil profile:", err);
            }
        };

        checkProfile();
    }, [])

    const sendBill = async () => {
        try {
            // Ambil informasi user dari sessionStorage
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
                console.log("Inquiry Response:", response.data);
            }

            const data = {
                product: selectedProduct.name,
                amount: selectedProduct.amount,
                phoneNumber: phoneNumber,
                productCode: selectedProduct.code,
                inquiryId: response.data.data.inquiryId, // Assuming inquiryId comes from response
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
            };

            setDataBill(data);
            setShowBill(true);
        } catch (error: any) {
            console.error("Error saat melakukan inquiry:", error);
            setError({ show: true, message: error.response.data ? error.response.data.message : "Terjadi kesalahan saat melakukan pembelian paket. Silakan coba lagi." });
        }
    };

    const selectedAmountHandler = (amount: object, index: number) => {
        setSelecteProduct(amount);
        setIndexButton(index)
        setIsClicked(true)
    }

    const setCategoryHandler = async (newCategory: string) => {
        setCategory(newCategory);

        const token = localStorage.getItem("token");

        try {
            const responseProducts = await axiosInstance.post("/ayoconnect/products",
                {
                    "category": newCategory, // Gunakan parameter langsung
                    "status": "active"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            console.log("Products Response:", responseProducts.data);

            setProducts(responseProducts.data.data);
        } catch (err) {
            console.error("Error saat mengambil produk:", err);
        }
    };

    // Validasi sebelum memanggil filter
    const filteredProducts = Array.isArray(products)
        ? products.filter(product =>
            product?.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    console.log("Selected Products:", selectedProduct);

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

                    <p className="font-semibold text-orange-500 text-2xl">{Number(balance).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>
                </div>

                <div data-aos="fade-up" data-aos-delay="400" className="mt-10 w-[90%] m-auto flex flex-row items-center justify-center gap-5">
                    <Button onClick={() => setCategoryHandler("pulsa")} className="bg-orange-400 text-white w-full">
                        Pulsa
                    </Button>

                    <Button onClick={() => setCategoryHandler("paket data")} className="bg-orange-400 text-white w-full">
                        Paket Data
                    </Button>
                </div>

                <div data-aos="fade-up" data-aos-delay="300" className="mt-10 w-[90%] m-auto flex flex-col items-center gap-5">
                    <input
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 15) {
                                setPhoneNumber(value);
                            }
                        }}
                        value={phoneNumber}
                        type="text"
                        placeholder="No Telephone"
                        className="w-full p-5 bg-white shadow-lg"
                    />

                    <div className="w-[90%] h-[2px] bg-gray-200 -translate-y-[35px]"></div>
                </div>

                <div data-aos="fade-up" className="relative w-[90%] m-auto mt-5">
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

                <div data-aos="fade-up" data-aos-delay="200" className="mt-10 w-[90%] m-auto flex flex-col gap-5">
                    <div className="bg-white shadow-lg rounded-lg p-5 gap-5">
                        <p className="text-gray-500 font-semibold">Provider</p>
                        <div className="flex flex-row items-center">
                            <input
                                onChange={(e) => setSearchTerm(e.target.value)}
                                type="text"
                                placeholder="Search"
                                className="w-full p-3"
                            />
                        </div>
                    </div>
                    <div className="w-[90%] h-[2px] bg-gray-200 -translate-y-[35px]"></div>

                </div>

                <div className="mt-5 w-[90%] mb-10 m-auto flex flex-col items-center gap-5 shadow-lg">
                    <div className="w-full flex flex-wrap">
                        {searchTerm !== '' ? filteredProducts.map((product, index) => (
                            <button type="button" data-aos={isClicked ? undefined : 'fade-up'} data-aos-delay={index * 100} key={index} onClick={() => selectedAmountHandler(product, index)} className={`${indexButton === index ? 'bg-orange-400' : ''} p-10 border transition-all border-gray-300 w-[50%] text-md text-center font-semibold`}>{product.name}</button>
                        )) : products.map((product, index) => (
                            <button type="button" data-aos={isClicked ? undefined : 'fade-up'} data-aos-delay={index * 100} key={index} onClick={() => selectedAmountHandler(product, index)} className={`${indexButton === index ? 'bg-orange-400' : ''} p-10 border transition-all border-gray-300 w-[50%] text-md text-center font-semibold`}>{product.name}</button>
                        ))}
                    </div>
                </div>

                <Button onClick={sendBill} className={`${phoneNumber.length === 0 ? 'hidden' : 'block'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}>
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={true} />}

            {error.show && <Notification message={error.message} onClose={() => setError({ show: false, message: "" })} status={"error"} />}

            {loading && (
                <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                </div>
            )}
        </div>
    )
}

export default Pulsa
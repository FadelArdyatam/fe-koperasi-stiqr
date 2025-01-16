import { Button } from "@/components/ui/button"
import { ChevronLeft, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import telkomsel from '../images/telkomsel.png'
import Bill from "@/components/Bill"
import axiosInstance from "@/hooks/axiosInstance"

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
            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: phoneNumber,
                productCode: selectedProduct.code,
            });

            console.log("Inquiry Response:", response.data);

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
        } catch (error) {
            console.error("Error saat melakukan inquiry:", error);
            alert("Terjadi kesalahan saat melakukan inquiry.");
        }
    };

    const selectedAmountHandler = (amount: object, index: number) => {
        setSelecteProduct(amount);
        setIndexButton(index)
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

            setProducts(responseProducts.data.data);
        } catch (err) {
            console.error("Error saat mengambil produk:", err);
        }
    };

    console.log("Selected Products:", selectedProduct);

    return (
        <div>
            <div className='fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400 bg-opacity-100'>
                <Link to={'/dashboard'} className='bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p className='font-semibold m-auto text-xl text-white text-center'>Beli Pulsa</p>

                <Button className="bg-transparent absolute right-5 hover:bg-transparent">
                    <Mail className="scale-[1.5]" />
                </Button>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div className="relative mt-[105px] w-full p-8 shadow-lg flex items-center gap-5 justify-center">
                    <p className="absolute left-5">Saldo</p>

                    <p className="font-semibold text-orange-500 m-auto">{Number(balance).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>
                </div>

                <div className="mt-10 w-[90%] m-auto flex flex-col items-center gap-5">
                    <input onChange={(e) => setPhoneNumber(e.target.value)} type="number" placeholder="No Telphone" className="w-full p-5 bg-white shadow-lg" />

                    <div className="w-[90%] h-[2px] bg-gray-200 -translate-y-[35px]"></div>
                </div>

                <div className="mt-10 w-[90%] m-auto flex flex-row items-center justify-center gap-5">
                    <Button onClick={() => setCategoryHandler("pulsa")} className="bg-orange-400 text-white w-full">
                        Pulsa
                    </Button>

                    <Button onClick={() => setCategoryHandler("paket data")} className="bg-orange-400 text-white w-full">
                        Paket Data
                    </Button>
                </div>

                <div className="mt-10 w-[90%] mb-10 m-auto flex flex-col items-center gap-5 shadow-lg">
                    <div className="w-full flex items-center justify-center">
                        <img src={telkomsel} className="w-[50%]" alt="" />
                    </div>

                    <div className="w-full flex flex-wrap">
                        {products.map((product, index) => (
                            <button key={index} onClick={() => selectedAmountHandler(product, index)} className={`${indexButton === index ? 'bg-orange-400' : ''} p-10 border transition-all border-gray-300 w-[50%] text-md text-center font-semibold`}>{product.name}</button>
                        ))}
                    </div>
                </div>

                <Button onClick={sendBill} className={`${phoneNumber.length === 0 ? 'hidden' : 'block'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}>
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={true} />}
        </div>
    )
}

export default Pulsa

import Bill from "@/components/Bill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/hooks/axiosInstance";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { ChevronDown, ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"

interface BillData {
    product: string;
    amount: string;
    date: string;
    time: string;
    productCode: any;
    phoneNumber: any;
    inquiryId: any;
}

const PAM = () => {
    const [region, setregion] = useState("")
    const [phoneNumber, setphoneNumber] = useState("")
    const [dataBill, setDataBill] = useState<BillData | null>(null)
    const [showBill, setShowBill] = useState(false)
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelecteProduct] = useState<any>(null)

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

            const response = await axiosInstance.post("/ayoconnect/inquiry", {
                accountNumber: phoneNumber,
                productCode: selectedProduct.code,
            });

            console.log('Inquiry Response:', response.data)

            const data = {
                product: selectedProduct.name,
                amount: response.data.data.amount,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                productCode: selectedProduct.code, // Add appropriate value
                phoneNumber: phoneNumber,  // Add appropriate value
                inquiryId: response.data.data.inquiryId,  // Add appropriate
            }

            setDataBill(data)
            setShowBill(true)
        } catch (error) {
            console.log(error)
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

                <p className='font-semibold m-auto text-xl text-white text-center'>PDAM</p>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div className="bg-white w-[90%] -translate-y-[100px] p-10 shadow-lg rounded-md m-auto">
                    <p className="font-semibold m-auto text-xl text-center">Bayar Tagihan Air</p>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="mt-10">
                                <p>Wilayah</p>

                                <div className="flex items-center gap-5 border mt-2 text-gray-400 border-black rounded-lg p-2 justify-between">
                                    <button>{region || "Wilayah"}</button>

                                    <ChevronDown />
                                </div>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg w-[300px] flex flex-col gap-3">
                            {products.map((product, index) => (
                                <DropdownMenuItem key={index} onClick={() => handleDropdownChange(product?.name)}>{product?.name}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="mt-5">
                        <p>Nomor Pelanggan</p>

                        <Input onChange={(e) => setphoneNumber(e.target.value)} type="number" className="mt-3 border border-black" />
                    </div>
                </div>

                <Button onClick={sendBill} className={`${phoneNumber.length === 0 || region.length === 0 ? 'hidden' : 'block'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}>
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={false} />}
        </>
    )
}

export default PAM
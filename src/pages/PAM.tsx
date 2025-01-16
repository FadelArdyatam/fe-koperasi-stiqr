import Bill from "@/components/Bill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { ChevronDown, ChevronLeft } from "lucide-react"
import { useState } from "react";
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

    const sendBill = () => {
        const data = {
            product: 'Tagihan Air',
            amount: '150.000',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            productCode: '', // Add appropriate value
            phoneNumber: '',  // Add appropriate value
            inquiryId: '',  // Add appropriate
        }

        setDataBill(data)
        setShowBill(true)
    }

    const handleDropdownChange = (value: string) => {
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
                            <DropdownMenuItem onClick={() => handleDropdownChange("Kab Indramayu")}>Kab Indramayu</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Kab Sukabumi")}>Kab Sukabumi</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Kab Bekasi")}>Kab Bekasi</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Kota Bekasi")}>Kota Bekasi</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Aceh Barat")}>Aceh Barat</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Aceh Timur")}>Aceh Timur</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Intan Ajar")}>Intan Ajar</DropdownMenuItem>
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
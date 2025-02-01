import Bill from "@/components/Bill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { ChevronLeft, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const BPJS = () => {
    const [type, setType] = useState("")
    const [range, setRange] = useState("")
    const [KTP, setKTP] = useState("")
    const [dataBill, setDataBill] = useState<BillData | null>(null)
    const [showBill, setShowBill] = useState(false)

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, [])

    const sendBill = () => {
        const data = {
            product: 'Tagihan BPJS',
            amount: '150.000',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            productCode: '', // Add appropriate value
            phoneNumber: '',  // Add appropriate value
            inquiryId: ''  // Add appropriate
        }

        setDataBill(data)
        setShowBill(true)
    }

    const handleDropdownChange = (value: string) => {
        setRange(value)
    };

    const handleRadioChange = (value: string) => {
        setType(value);
    };

    return (
        <>
            <div className='w-full p-10 pb-32 flex items-center justify-center bg-orange-400 bg-opacity-100'>
                <Link to={'/dashboard'} className='bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>BPJS Kesehatan</p>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div className="bg-white w-[90%] -translate-y-[100px] p-10 shadow-lg rounded-md m-auto">
                    <p data-aos="fade-up" data-aos-delay="100" className="font-semibold m-auto text-xl text-center">Bayar BPJS</p>

                    <RadioGroup
                        data-aos="fade-up"
                        data-aos-delay="200"
                        defaultValue=""
                        onValueChange={handleRadioChange}
                        className="mt-10 w-full flex items-center gap-5 justify-center"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Kesehatan" id="r1" />
                            <Label htmlFor="r1">Kesehatan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Ketenagakerjaan" id="r2" />
                            <Label htmlFor="r2">Ketenagakerjaan</Label>
                        </div>
                    </RadioGroup>

                    <div data-aos="fade-up" data-aos-delay="300" className="mt-5">
                        <p>Nomor KTP</p>

                        <Input onChange={(e) => setKTP(e.target.value)} type="number" className="mt-3 border border-black" />
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
                            <DropdownMenuItem onClick={() => handleDropdownChange("1 bulan")}>1 bulan</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("2 bulan")}>2 bulan</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("3 bulan")}>3 bulan</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Button onClick={sendBill} className={`${KTP.length === 0 || type.length === 0 || range.length === 0 ? 'hidden' : 'block'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}>
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={false} />}
        </>
    )
}

export default BPJS
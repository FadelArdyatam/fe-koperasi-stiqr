import { Button } from "@/components/ui/button"
import { ChevronLeft, Mail } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import telkomsel from '../images/telkomsel.png'
import Bill from "@/components/Bill"

interface BillData {
    product: string;
    amount: string;
    date: string;
    time: string;
}

const amounts = [
    '10.',
    '25.',
    '50.',
    '100.',
    '150.',
    '200.',
    '300.',
    '500.',
]

const Pulsa = () => {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [selectedAmount, setSelectedAmount] = useState("")
    const [dataBill, setDataBill] = useState<BillData | null>(null)
    const [showBill, setShowBill] = useState(false)
    const [indexButton, setIndexButton] = useState(-1)

    const sendBill = () => {
        const data = {
            product: 'Telkomsel - Simpati',
            amount: selectedAmount,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        }

        setDataBill(data)
        setShowBill(true)
    }

    const selectedAmountHandler = (amount: string, index: number) => {
        setSelectedAmount(`${amount}000`)
        setIndexButton(index)
    }

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

                    <p className="font-semibold text-orange-500 m-auto">Rp 200.000</p>
                </div>

                <div className="mt-10 w-[90%] m-auto flex flex-col items-center gap-5">
                    <input onChange={(e) => setPhoneNumber(e.target.value)} type="number" placeholder="No Telphone" className="w-full p-5 bg-white shadow-lg" />

                    <div className="w-[90%] h-[2px] bg-gray-200 -translate-y-[35px]"></div>
                </div>

                <div className="mt-10 w-[90%] mb-10 m-auto flex flex-col items-center gap-5 shadow-lg">
                    <div className="w-full flex items-center justify-center">
                        <img src={telkomsel} className="w-[50%]" alt="" />
                    </div>

                    <div className="w-full flex flex-wrap">
                        {amounts.map((amount, index) => (
                            <button key={index} onClick={() => selectedAmountHandler(amount, index)} className={`${indexButton === index ? 'bg-orange-400' : ''} p-10 border transition-all border-gray-300 w-[50%] text-2xl font-semibold`}>{amount}<span className="text-xs">000</span></button>
                        ))}
                    </div>
                </div>

                <Button onClick={sendBill} className={`${phoneNumber.length === 0 || selectedAmount.length === 0 ? 'hidden' : 'block'} uppercase mt-5 text-center w-[90%] m-auto mb-10 bg-green-500 text-white`}>
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={true} />}
        </div>
    )
}

export default Pulsa
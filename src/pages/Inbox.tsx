import { Home, ScanQrCode, CreditCard, UserRound, History } from "lucide-react"
import { Link } from "react-router-dom"
import linkaja from "@/images/linkaja.jpg";
import gopay from "@/images/gopay.png";
import ovo from "@/images/ovo.jpg";
import dana from "@/images/dana.jpg";

const paymentHistory = [
    {
        image: linkaja,
        title: "LinkAja",
        amount: "Rp 100.000",
        date: "12/08/2021",
        time: "12:00",
        status: "success",
        code: "INV-1321214"
    },
    {
        image: gopay,
        title: "GoPay",
        amount: "Rp 50.000",
        date: "12/08/2021",
        time: "12:00",
        status: "failed",
        code: "INV-323023"
    },
    {
        image: ovo,
        title: "OVO",
        amount: "Rp 200.000",
        date: "12/08/2021",
        time: "12:00",
        status: "success",
        code: "INV-124958"
    },
    {
        image: dana,
        title: "DANA",
        amount: "Rp 150.000",
        date: "12/08/2021",
        time: "12:00",
        status: "pending",
        code: "INV-439230"
    },
    {
        image: dana,
        title: "DANA",
        amount: "Rp 170.000",
        date: "12/08/2021",
        time: "12:00",
        status: "pending",
        code: "INV-123456"
    }
]

const Inbox = () => {
    return (
        <div>
            <div className="p-5 w-full bg-orange-400">
                <p className="text-white font-semibold uppercase">Inbox</p>
            </div>

            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 flex-col items-center">
                    <Home />

                    <p className="uppercase">Home</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />

                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to={'/'} className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <History />

                    <p className="uppercase">Riwayat</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className="mt-10 w-[90%] m-auto">
                {paymentHistory.map((payment, index) => (
                    <>
                        <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[2px] my-5 bg-gray-300`}></div>

                        <div className="flex items-center gap-5">
                            <img className="w-10 h-10 rounded-full" src={payment.image} alt="" />

                            <div className="w-full">
                                <div className="flex items-center gap-5 justify-between">
                                    <p className="font-semibold text-black">{payment.title}</p>

                                    <p className="text-sm text-gray-500">{payment.date}, {payment.time}</p>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">YAY! you got Rp {payment.amount} from your transaction merchant KOPISUSU.</p>
                            </div>
                        </div>
                    </>
                ))}

            </div>
        </div>
    )
}

export default Inbox
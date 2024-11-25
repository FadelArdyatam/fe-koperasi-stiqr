import { Home, ScanQrCode, CreditCard, UserRound, History } from "lucide-react"
import { Link } from "react-router-dom"
import { admissionFees } from "./Dashboard";

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

                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />

                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to={'/settlement'} className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={'/history'} className="flex gap-3 flex-col items-center">
                    <History />

                    <p className="uppercase">Riwayat</p>
                </Link>

                <Link to={'/'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className="mt-10 w-[90%] m-auto mb-32">
                {admissionFees.map((admissionFee, index) => (
                    <div key={index}>
                        <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[2px] my-5 bg-gray-300`}></div>

                        <div className="flex items-center gap-5">
                            <img className="w-10 h-10 rounded-full" src={admissionFee.image} alt="" />

                            <div className="w-full">
                                <div className="flex items-center gap-5 justify-between">
                                    <p className="font-semibold text-black">{admissionFee.title}</p>

                                    <p className="text-sm text-gray-500">{admissionFee.date}, {admissionFee.time}</p>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">YAY! you got Rp {new Intl.NumberFormat('id-ID').format(Number(admissionFee.amount))} from your transaction merchant KOPISUSU.</p>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Inbox
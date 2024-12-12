import TermsandCondition from "@/components/TermsandCondition"
import { ChevronLeft, ChevronRight, CreditCard, Home, ScanQrCode, User, UserRound, FileText } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const Profile = () => {
    const [showTermsandConditions, setShowTermsandConditions] = useState(false)

    return (
        <>
            <div className={`${showTermsandConditions ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <Link to={'/dashboard'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>

                    <p className='font-semibold m-auto text-xl text-white text-center'>Settings</p>
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

                    <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
                        <FileText />

                        <p className="uppercase">Catalog</p>
                    </Link>

                    <Link to={'/profile'} className="flex gap-3 flex-col text-orange-400 items-center">
                        <UserRound />

                        <p className="uppercase">Profile</p>
                    </Link>
                </div>

                <div className="bg-white w-[90%] -translate-y-20 p-5 flex items-center gap-5 rounded-lg shadow-lg z-20">
                    <div className="w-20 h-20 rounded-full flex items-center bg-gray-300 justify-center">
                        <User className="scale-[1.5]" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-xl font-semibold">Rani Destrian</p>

                        <p className="text-sm text-gray-500">Rani.destrian@gmail.com</p>
                    </div>
                </div>

                <div className="bg-white w-[90%] p-5 rounded-lg shadow-lg mt-5 -translate-y-20">
                    <Link to={"/profile/security"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Keamanan</p>

                            <p className="text-sm text-gray-500">Password & Pin</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link to={"/profile/owner-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Pemilik</p>

                            <p className="text-sm text-gray-500">Nama, Email, No Hp, Alamat</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link to={"/profile/merchant-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Merchant</p>

                            <p className="text-sm text-gray-500">Nama Bisnis, Email Bisnis, No Hp Bisnis</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link to={"/profile/payment-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Pembayaran</p>

                            <p className="text-sm text-gray-500">Nama, Bank, Nomer Bank</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <button onClick={() => setShowTermsandConditions(true)} className="flex items-center w-full gap-5 justify-between">
                        <div className="flex flex-col items-start">
                            <p>Syarat & Ketentuan</p>

                            <p className="text-sm text-gray-500">Syarat & Peraturan</p>
                        </div>

                        <ChevronRight />
                    </button>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link to={"/profile/history"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Riwayat</p>

                            <p className="text-sm text-gray-500">Uang Masuk, Pembelian</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link to={"/profile/employee"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Pegawai</p>

                            <p className="text-sm text-gray-500">Pengaturan Seputar Pegawaimu</p>
                        </div>

                        <ChevronRight />
                    </Link>
                </div>
            </div>

            {showTermsandConditions && <TermsandCondition setShowTermsandConditions={setShowTermsandConditions} backToPageProfile={true} />}
        </>
    )
}

export default Profile
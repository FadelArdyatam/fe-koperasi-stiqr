import TermsandConditionInProfile from "@/components/TermsandConditionInProfile"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { ChevronLeft, ChevronRight, CreditCard, Home, ScanQrCode, User, UserRound, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AOS from "aos";
import "aos/dist/aos.css";

const Profile = () => {
    const [showTermsandConditions, setShowTermsandConditions] = useState(false)
    const [data, setData] = useState<any>()

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        setData(JSON.parse(sessionStorage.getItem('user') || '{}'))
    }, [])

    const navigate = useNavigate()
    const handleSignOut = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    'X-Access-Token': `${localStorage.getItem('token') || ''}`
                }
            })
            if (response.data.status) {
                localStorage.removeItem('token')
                sessionStorage.removeItem('user')
                navigate('/')
            }
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className={`${showTermsandConditions ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <Link to={'/dashboard'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>

                    <p data-aos="zoom-in" data-aos-once="true" className='font-semibold m-auto text-xl text-white text-center'>Settings</p>
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

                <div className="bg-white w-[90%] -translate-y-20 p-5 rounded-lg shadow-lg z-20">
                    <div className="flex gap-5 items-center">
                        <div data-aos="fade-up" data-aos-once="true" className="w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                            {data?.photo ? (
                                <img
                                    src={`${data?.photo}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="text-gray-500 scale-[1.5]" />
                            )}
                        </div>

                        <div data-aos="fade-up" data-aos-once="true" className="flex flex-col gap-3">
                            <p className="text-xl font-semibold">{data?.username || data?.name}</p>
                            <p className="text-sm text-gray-500">{data?.email}</p>
                        </div>
                    </div>

                    <Button data-aos="fade-up" data-aos-once="true" onClick={handleSignOut} className="w-full mt-5 bg-orange-400">
                        Sign Out
                    </Button>
                </div>


                <div className="bg-white w-[90%] p-5 rounded-lg shadow-lg mt-5 -translate-y-20 mb-20">
                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/security"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Keamanan</p>

                            <p className="text-sm text-gray-500">Password & Pin</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/owner-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Pemilik</p>

                            <p className="text-sm text-gray-500">Nama, Email, No Hp, Alamat</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/merchant-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Merchant</p>

                            <p className="text-sm text-gray-500">Nama Bisnis, Email Bisnis, No Hp Bisnis</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/customer-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Pelanggan</p>

                            <p className="text-sm text-gray-500">Nama Pemesan, No Hp, Email, Nomor Lain</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/payment-data"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Data Pembayaran</p>

                            <p className="text-sm text-gray-500">Nama, Bank, Nomer Bank</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <button data-aos="fade-up" data-aos-once="true" onClick={() => setShowTermsandConditions(true)} className="flex items-center w-full gap-5 justify-between">
                        <div className="flex flex-col items-start">
                            <p>Syarat & Ketentuan</p>

                            <p className="text-sm text-gray-500">Syarat & Peraturan</p>
                        </div>

                        <ChevronRight />
                    </button>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/history"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Riwayat</p>

                            <p className="text-sm text-gray-500">Uang Masuk, Pembelian</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                    <Link data-aos="fade-up" data-aos-once="true" to={"/profile/employee"} className="flex items-center gap-5 justify-between">
                        <div>
                            <p>Pegawai</p>

                            <p className="text-sm text-gray-500">Pengaturan Seputar Pegawaimu</p>
                        </div>

                        <ChevronRight />
                    </Link>

                    {/* <div className="w-full h-[2px] my-5 bg-gray-200"></div> */}

                    {/* <Link data-aos="fade-up" data-aos-once="true" to={"/profile/printer"} className="flex items-center gap-5 justify-between ">
                        <div>
                            <p>Printer</p>

                            <p className="text-sm text-gray-500">Atur printer untuk cetak transaksi</p>
                        </div>

                        <ChevronRight />
                    </Link> */}
                </div>
            </div>

            {showTermsandConditions && <TermsandConditionInProfile setShowTermsandConditions={setShowTermsandConditions} />}
        </>
    )
}

export default Profile
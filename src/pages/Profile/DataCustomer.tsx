import { ChevronLeft, CreditCard, FileText, Home, ScanQrCode, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";

const dataCustomer = [
    {
        name: 'Nama Pemesan',
        status: false
    },
    {
        name: 'Nomor Telepon',
        status: false
    },
    {
        name: 'Email',
        status: false
    },
    {
        name: 'Other Number',
        status: false
    }
]

const DataCustomer = () => {
    const [data, setData] = useState(dataCustomer)

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, [])

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>Data Customer</p>
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

            <div className="bg-white w-[90%] -translate-y-20 p-5 flex flex-col items-center rounded-lg shadow-lg z-0 mb-10">
                {data.map((item, index) => (
                    <div data-aos="fade-up" data-aos-delay={index * 100} key={index} className="w-full">
                        <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[1px] min-h-[1px] my-5 bg-gray-200`}></div>

                        <div className="flex items-center justify-between">
                            <p>{item.name}</p>

                            <button
                                className={`flex items-center justify-center w-14 min-w-14 h-8 p-1 rounded-full cursor-pointer 
                                ${item.status ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={() => setData(data.map((data, i) => i === index ? { ...data, status: !data.status } : data))}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${item.status ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DataCustomer
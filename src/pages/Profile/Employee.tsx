import AddEmployee from "@/components/AddEmployee";
import EditEmployee from "@/components/EditEmployee";
import axiosInstance from "@/hooks/axiosInstance";
import { ChevronLeft, ChevronRight, CreditCard, FileText, Home, ScanQrCode, User, UserRound } from "lucide-react"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"

// const initialEmployees = [
//     {
//         id: 1,
//         name: 'Rani Destrian',
//         phone_number: '08123456789',
//         email: 'Rani@gmail.com',
//         role_name: 'Manager',
//         password: "rani",
//         role_description: "Administrator dengan akses penuh"

//     },
//     {
//         id: 2,
//         name: 'John Doe',
//         phone_number: '08123456789',
//         email: 'johndoe@gmail.com',
//         role_name: 'Kasir',
//         password: "john",
//         role_description: "Kasir dengan akses terbatas"
//     }
// ]

// const accordionDatas = [
//     {
//         title: 'Admin',
//         spoiler: 'Dapat melakukan manajemen katalog, melihat semua laporan transaksi dan mengatur akses pegawai.',
//         content: [
//             'Manajemen produk dan etalase',
//             'Melakukan transaksi di kasir',
//             'Terima pembayaran dan berbagai metode pembayaran yang tersedia',
//             'Tolak dan terima pesanan online',
//             'Melihat semua laporan',
//             'Manajemen pegawai (kasir)',
//             'Manajemen toko online',
//             'Akses fitur Belanja dan mengajukan pembelian produk ke Pemilik',
//             'Memberi otorisasi untuk melakukan void transaksi'
//         ]
//     },
//     {
//         title: 'Kasir',
//         spoiler: 'Dapat melakukan transaksi dan lihat laporan pendapatan.',
//         content: [
//             'Melakukan transaksi di kasir',
//             'Terima pembayaran dan berbagai metode pembayaran yang tersedia',
//             'Tolak dan terima pesanan online',
//             'Melihat laporan pendapatan',
//         ]
//     },
// ]

interface Employee {
    role_id: string;
    id: number;
    name: string;
    phone_number: string;
    email: string;
    password: string;
    role_description: string;
}

const Employee = () => {

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [addEmployee, setAddEmployee] = useState(false);
    const [open, setOpen] = useState({
        id: -1,
        status: false,
    });
    const [isSuccess,setIsSuccess] = useState(false);
    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`/employee`)
                setEmployees(response.data.data)
            } catch (error) {
                console.log(error)
            }
        };

        fetchData();
    }, [isSuccess])

    const handleOpen = (id: number) => {
        setOpen({
            id: id - 1,
            status: true,
        });
    };

    return (
        <>
            <div className={`${open.status || addEmployee ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center bg-orange-50`}>
                <div className='w-full px-5 pt-5 flex items-center justify-center'>
                    <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-black' />
                    </Link>

                    <p className='font-semibold m-auto text-xl text-black text-center'>Pegawai</p>
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

                <div className="mt-10 w-[90%] flex flex-col gap-5 mb-24">
                    {employees?.map((employee, index) => (
                        <div key={index} onClick={() => handleOpen(employee?.id)} className="bg-white w-full p-5 flex items-center gap-5 rounded-lg justify-between shadow-lg hover:cursor-pointer">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-lg flex items-center bg-gray-300 justify-center">
                                    <User className="scale-[1.2]" />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <p className="text-lg font-semibold">{employee?.name}</p>

                                    <p className="text-sm text-gray-500">{employee?.role.role_name}</p>
                                </div>
                            </div>

                            <ChevronRight />
                        </div>
                    ))}
                </div>

                <button onClick={() => {
                    setAddEmployee(true)
                    setIsSuccess(false)
                    }} 
                    className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500 p-3 rounded-full text-white">
                    Tambah Pegawai
                </button>
            </div>

            {open.status && <EditEmployee setOpen={setOpen} employees={employees} setEmployees={setEmployees} editIndex={open.id} open={open} />}

            {addEmployee && <AddEmployee setAddEmployee={setAddEmployee} setIsSuccess={setIsSuccess} />}
        </>
    )
}

export default Employee
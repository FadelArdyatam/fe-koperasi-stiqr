import AddEmployee from "@/components/AddEmployee";
import EditEmployee from "@/components/EditEmployee";
import axiosInstance from "@/hooks/axiosInstance";
import { ChevronLeft, ChevronRight, CreditCard, FileText, Home, Plus, ScanQrCode, User, UserRound } from "lucide-react"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import noPegawai from "@/images/no-data-image/no-pegawai.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";

interface Employee {
    employee_id: string;
    role: any;
    role_id: string;
    id: number;
    name: string;
    phone_number: string;
    email: string;
    password: string;
    role_description: string;
    // role: {}
}

const Employee = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [addEmployee, setAddEmployee] = useState(false);
    const [open, setOpen] = useState({
        id: "",
        status: false,
    });
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`/employee`)
                setEmployees(response.data.data)
            } catch (error: any) {
                console.log(error)
            }
        };

        fetchData();
    }, [isSuccess])

    const handleOpen = (id: string) => {
        setOpen({
            id: id,
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

                    <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-black text-center'>Pegawai</p>
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
                    {employees.length === 0 ? (
                        <div data-aos="fade-up" data-aos-delay="100" className="flex flex-col items-center justify-center gap-3">
                            <img src={noPegawai} className="md:w-3/12 w-2/3 " alt="" />
                            <p className="font-semibold text-orange-500 md:text-xl text-center">Belum ada Pegawai yang terdaftar</p>
                            <Button onClick={() => {
                                setAddEmployee(true)
                                setIsSuccess(false)
                            }}
                                className={` bg-orange-500 w-fit self-center `}>
                                <Plus /> Tambah Pegawai
                            </Button>
                        </div>
                    ) : employees?.map((employee, index) => (
                        <div data-aos="fade-up" data-aos-delay={index * 100} key={index} onClick={() => handleOpen(employee?.employee_id)} className="bg-white w-full p-5 flex items-center gap-5 rounded-lg justify-between shadow-lg hover:cursor-pointer">
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
                    className={`${employees.length === 0 ? 'hidden' : 'block'} fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500 p-3 rounded-full text-white`}>
                    Tambah Pegawai
                </button>
            </div>

            {open.status && <EditEmployee setOpen={setOpen} employees={employees} setEmployees={setEmployees} editIndex={open.id} open={open} setIsSuccess={setIsSuccess} />}

            {addEmployee && <AddEmployee setAddEmployee={setAddEmployee} setIsSuccess={setIsSuccess} />}
        </>
    )
}

export default Employee
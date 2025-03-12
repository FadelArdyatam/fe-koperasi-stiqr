import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Home, ScanQrCode, CreditCard, FileText, UserRound, ChevronsLeft, ChevronsRight, ChevronRight } from "lucide-react";
import AddCustomer from "@/components/AddCustomer";
import axiosInstance from "@/hooks/axiosInstance";

interface Customer {
    id: number;
    customer: {
        phone: string;
        email: string;
        address: string;
        name: string;
        other_number: string;
    };
}

const Customer = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showDetail, setShowDetail] = useState({ show: false, index: -1 });

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    const [reset, setReset] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    console.log(currentPage)
    useEffect(() => {
        if (!userData) return;

        const fetchData = async () => {
            const params: any = {
                page: currentPage,
                limit: 5,
                is_pagination: true,
            };
            try {
                const response = await axiosInstance.get(`/customers/${userData.merchant.id}`, { params });
                setCustomers(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            } catch (error: any) {
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, [reset, currentPage]);

    console.log("Customers", customers);

    return (
        <div className="w-full flex flex-col items-center pb-32">
            <div className="w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400">
                {isAdding ? (
                    <ChevronLeft onClick={() => setIsAdding(false)} className="text-white scale-[1.3] absolute left-5" />
                ) : showDetail.show ? (
                    <ChevronLeft onClick={() => setShowDetail({ show: false, index: -1 })} className="text-white scale-[1.3] absolute left-5" />
                ) : (
                    <Link to={'/dashboard'} className="absolute left-5">
                        <ChevronLeft className="scale-[1.3] text-white" />
                    </Link>
                )}

                <p className="font-semibold m-auto text-xl text-white text-center">
                    {isAdding ? 'Tambah Data Pelanggan' : showDetail ? 'Detail Pelanggan' : 'Data Pelanggan'}
                </p>
            </div>

            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 text-orange-400 flex-col items-center">
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

                <Link to={'/profile'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            {/* Container Data Pelanggan */}
            <Card className={`${isAdding || showDetail.show ? 'hidden' : 'block'} -translate-y-20 w-[90%] shadow-lg pt-5`}>
                <CardContent>
                    {customers.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black text-base">Nama</TableHead>
                                        <TableHead className="text-black text-base">Nomor Lainnya</TableHead>
                                        <TableHead className="text-black text-base">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="min-w-[150px]">{customer.customer?.name || "Nama tidak tersedia"}</TableCell>
                                            <TableCell>{customer.customer?.other_number || "-"}</TableCell>
                                            <TableCell className="max-w-[40px]">
                                                <Button onClick={() => setShowDetail({ show: true, index: index })} className="bg-orange-500">Detail</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-center gap-5 my-10">
                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft />
                                </Button>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft />
                                </Button>

                                <span>Page {currentPage} of {totalPages}</span>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight />
                                </Button>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                    <ChevronsRight />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">Tidak ada data pelanggan.</p>
                    )}
                </CardContent>
            </Card>

            {/* Tombol Tambah Customer */}
            <Button onClick={() => { setIsAdding(true); setReset(false) }} className={`${isAdding || showDetail.show ? 'hidden' : 'block'} w-[90%] -translate-y-10 bg-orange-500`}>
                Tambah Customer
            </Button>

            {/* Form Add Customer */}
            {isAdding && <AddCustomer setIsAdding={setIsAdding} setReset={setReset} />}

            {/* Detail Customer */}
            <div className={`${showDetail.show ? 'block' : 'hidden'} bg-white flex flex-col gap-5 -translate-y-20 w-[90%] p-5 rounded-lg shadow-lg z-0 mb-10`}>
                <div className="w-full flex items-center justify-between">
                    <p className="font-semibold text-black">Nama</p>
                    <p className="text-gray-500">{customers[showDetail.index]?.customer.name}</p>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="w-full flex items-center justify-between">
                    <p className="font-semibold text-black">No Hp</p>
                    <p className="text-gray-500">{customers[showDetail.index]?.customer.phone}</p>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="w-full flex items-center justify-between">
                    <p className="font-semibold text-black">Email</p>
                    <p className="text-gray-500">{customers[showDetail.index]?.customer.email}</p>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="w-full flex items-center justify-between">
                    <p className="font-semibold text-black">Nomor Lainnya</p>
                    <p className="text-gray-500">{customers[showDetail.index]?.customer.other_number}</p>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="w-full flex items-center justify-between">
                    <p className="font-semibold text-black">Alamat</p>
                    <p className="text-gray-500">{customers[showDetail.index]?.customer.address}</p>
                </div>
            </div>
        </div>
    );
};

export default Customer;

import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, Filter, ArrowDownAZ, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { admissionFees } from "../Dashboard";
import html2canvas from "html2canvas";
import axiosInstance from "@/hooks/axiosInstance";

interface Purchase {
    refnumber: string;
    type: string;
    purchase_id: string;
    amount: string;
    date: string;
    image?: string;
    status: string;
}

const Riwayat = () => {
    const [type, setType] = useState("Uang Masuk");
    const [showDescription, setShowDescription] = useState({ status: false, index: -1 });
    const contentRef = useRef(null); // Untuk mereferensikan elemen yang akan dirender menjadi gambar
    const [typeSorting, setTypeSorting] = useState({ show: false, type: 'asc' });
    const [sortingPurchases, setSortingPurchases] = useState<Purchase[]>([]);
    const [sortingAdmissionFees, setSortingAdmissionFees] = useState<typeof admissionFees>([]);
    const [typeFilter, setTypeFilter] = useState({ show: false, type: 'all' });
    const [filterPurchases, setFilterPurchases] = useState<Purchase[]>([]);
    const [filterAdmissionFees, setFilterAdmissionFees] = useState<typeof admissionFees>([]);

    const [dataUser, setDataUser] = useState<any>();

    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        setDataUser(userData);

        const fetchPurchase = async () => {
            const response = await axiosInstance.get(`/history/purchases/${userData.merchant.id}`);
            setPurchases(response.data);
        }

        fetchPurchase();
    }, []);

    const downloadImage = async () => {
        if (contentRef.current) {
            try {
                // Render elemen ke dalam Canvas menggunakan html2canvas
                const canvas = await html2canvas(contentRef.current, { useCORS: true });
                const dataURL = canvas.toDataURL("image/png");

                // Buat link untuk mengunduh gambar
                const link = document.createElement("a");
                link.href = dataURL;
                link.download = "CodePayment.png"; // Nama file gambar
                link.click();
            } catch (error) {
                console.error("Error generating image:", error);
            }
        }
    };

    const sortingHandler = () => {
        // Sorting Payments by Date
        const sortedPurchase = [...purchases].sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('/')); // Convert DD/MM/YYYY to YYYY/MM/DD
            const dateB = new Date(b.date.split('/').reverse().join('/')); // Convert DD/MM/YYYY to YYYY/MM/DD

            if (typeSorting.type === 'asc') {
                return dateA.getTime() - dateB.getTime();
            } else {
                return dateB.getTime() - dateA.getTime();
            }
        });

        // Sorting Admission Fees by Date
        const sortedAdmissionFees = [...admissionFees].sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('/')); // Convert DD/MM/YYYY to YYYY/MM/DD
            const dateB = new Date(b.date.split('/').reverse().join('/')); // Convert DD/MM/YYYY to YYYY/MM/DD

            if (typeSorting.type === 'asc') {
                return dateA.getTime() - dateB.getTime();
            } else {
                return dateB.getTime() - dateA.getTime();
            }
        });

        // Update State
        setSortingPurchases(sortedPurchase);
        setSortingAdmissionFees(sortedAdmissionFees);

        // Toggle Sorting Order
        setTypeSorting({ show: true, type: typeSorting.type === 'asc' ? 'desc' : 'asc' });
    };

    const filterHandler = (filterType: string) => {
        setTypeSorting({ show: false, type: typeSorting.type === 'asc' ? 'desc' : 'asc' });

        // Update Filter Type
        setTypeFilter({ show: true, type: filterType });

        // Filter Payments by Status
        const filteredPurchases = purchases.filter(purchase => {
            if (filterType === 'all') {
                return true; // Include all payments
            } else {
                return purchase.status === filterType;
            }
        });

        // Filter Admission Fees by Status
        const filteredAdmissionFees = admissionFees.filter(admissionFee => {
            if (filterType === 'all') {
                return true; // Include all admission fees
            } else {
                return admissionFee.status === filterType;
            }
        });

        // Update State
        setFilterPurchases(filteredPurchases);
        setFilterAdmissionFees(filteredAdmissionFees);
    };

    console.log(typeSorting.show)

    console.log("Purchases: ", purchases);

    return (
        <div className="relative h-screen">
            {/* Header */}
            <div className={`${showDescription.status ? 'pb-32' : 'pb-0'} fixed w-full top-0 z-10 pt-5 flex flex-col items-center justify-center bg-orange-400`}>
                <div className="flex items-center px-5 justify-center w-full">
                    {showDescription.status ? (
                        <button>
                            <ChevronLeft className="scale-[1.3] text-white" onClick={() => setShowDescription({ status: false, index: -1 })} />
                        </button>
                    ) : (
                        <Link to="/profile" className="bg-transparent hover:bg-transparent">
                            <ChevronLeft className="scale-[1.3] text-white" />
                        </Link>
                    )}

                    <p className="font-semibold m-auto text-xl text-white text-center uppercase">Riwayat</p>
                </div>

                <div className={`${showDescription.status ? 'hidden' : 'flex'} items-center w-full relative`}>
                    <Button
                        onClick={() => setType("Uang Masuk")}
                        className={`uppercase block !mt-10 w-full mb-3 bg-transparent hover:bg-transparent rounded-none transition-all`}
                    >
                        Uang Masuk
                    </Button>
                    <Button
                        onClick={() => setType("Pembelian")}
                        className={`uppercase block !mt-10 w-full mb-3 bg-transparent hover:bg-transparent rounded-none transition-all`}
                    >
                        Pembelian
                    </Button>

                    {/* Garis bawah animasi */}
                    <div
                        className={`${type === "Pembelian" ? "translate-x-full" : "translate-x-0"} w-[50%] absolute bottom-0 h-1 bg-white transition-transform duration-300 ease-in-out`}
                    ></div>
                </div>
            </div>

            {/* Navigation */}
            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to="/dashboard" className="flex gap-3 flex-col items-center">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>

                <Link to="/qr-code" className="flex gap-3 flex-col items-center">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to="/settlement" className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to="/catalog" className="flex gap-3 flex-col items-center">
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to="/profile" className="flex gap-3 text-orange-400 flex-col items-center">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            {/* Konten */}
            <div className={`${showDescription.status ? 'hidden' : 'block'} relative mt-44 h-[calc(100%-14rem)] overflow-hidden`}>
                {/* Konten Uang Masuk */}
                <div
                    className={`absolute inset-0 ${type === "Uang Masuk" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"} transition-all duration-500 ease-in-out`}
                >
                    <div className="flex flex-col gap-5 w-[90%] m-auto p-5 shadow-lg bg-white rounded-lg">
                        {typeSorting.show ? sortingAdmissionFees.map((admissionFee, index) => ( // Tampilkan data yang sudah diurutkan
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={admissionFee.image}
                                            className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex flex-col items-start">
                                            <div className="flex items-center gap-2">
                                                <p className="uppercase text-sm">{admissionFee.title}</p>

                                                <div className={`${admissionFee.status === 'success' ? 'bg-green-400' : admissionFee.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5]`}>
                                                    <p>{admissionFee.status}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-400">{admissionFee.code}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(admissionFee.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">{admissionFee.date}</p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">{admissionFee.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )) : typeFilter.show ? filterAdmissionFees.map((admissionFee, index) => ( // Tampilkan data yang belum diurutkan
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={admissionFee.image}
                                            className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex flex-col items-start">
                                            <div className="flex items-center gap-2">
                                                <p className="uppercase text-sm">{admissionFee.title}</p>

                                                <div className={`${admissionFee.status === 'success' ? 'bg-green-400' : admissionFee.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5]`}>
                                                    <p>{admissionFee.status}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-400">{admissionFee.code}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(admissionFee.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">{admissionFee.date}</p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">{admissionFee.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )) : admissionFees.map((admissionFee, index) => ( // Tampilkan data yang belum diurutkan
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={admissionFee.image}
                                            className="rounded-full w-10 h-10 min-w-10 min-h-10 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex flex-col items-start">
                                            <div className="flex items-center gap-2">
                                                <p className="uppercase text-sm">{admissionFee.title}</p>

                                                <div className={`${admissionFee.status === 'success' ? 'bg-green-400' : admissionFee.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5]`}>
                                                    <p>{admissionFee.status}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-400">{admissionFee.code}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(admissionFee.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">{admissionFee.date}</p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">{admissionFee.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Konten Pembelian */}
                <div
                    className={`absolute inset-0 ${type === "Pembelian" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"} transition-all duration-500 ease-in-out`}
                >
                    <div className="flex flex-col gap-5 w-[90%] m-auto p-5 shadow-lg bg-white rounded-lg">
                        {typeSorting.show ? sortingPurchases.map((purchase, index) => ( // Tampilkan data yang sudah diurutkan
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex md:items-center md:justify-between md:flex-row flex-col">
                                    <div className="flex md:items-start items-center gap-5">
                                        <img
                                            src={purchase.image}
                                            className="rounded-full w-12 h-12 min-w-12 min-h-12 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex md:flex-row flex-col items-start gap-5">
                                            <div className="flex flex-col gap-2">
                                                <p className="uppercase text-sm">{purchase.type}</p>
                                                <p className="text-xs text-start text-gray-400">{purchase.purchase_id}</p>
                                            </div>
                                            <div className={`${purchase.status === 'Berhasil' ? 'bg-green-400' : purchase.status === 'Dalam Proses' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5] p-1`}>
                                                <p>{purchase.status}</p>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="flex md:mt-0 mt-5 flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(purchase.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">
                                                {new Date(purchase.date).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">
                                                {new Date(purchase.date).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )) : typeFilter.show ? filterPurchases.map((purchase, index) => ( // Tampilkan data yang belum diurutkan
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex md:items-center md:justify-between md:flex-row flex-col">
                                    <div className="flex md:items-start items-center gap-5">
                                        <img
                                            src={purchase.image}
                                            className="rounded-full w-12 h-12 min-w-12 min-h-12 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex md:flex-row flex-col items-start gap-5">
                                            <div className="flex flex-col gap-2">
                                                <p className="uppercase text-sm">{purchase.type}</p>
                                                <p className="text-xs text-start text-gray-400">{purchase.purchase_id}</p>
                                            </div>
                                            <div className={`${purchase.status === 'Berhasil' ? 'bg-green-400' : purchase.status === 'Dalam Proses' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5] p-1`}>
                                                <p>{purchase.status}</p>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="flex md:mt-0 mt-5 flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(purchase.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">
                                                {new Date(purchase.date).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">
                                                {new Date(purchase.date).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )) : purchases.map((purchase, index) => ( // Tampilkan data yang belum diurutkan
                            <button onClick={() => setShowDescription({ status: true, index: index })} className="block" key={index}>
                                <div
                                    className={`${index === 0 ? "hidden" : "block"
                                        } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                ></div>

                                <div className="flex md:items-center md:justify-between md:flex-row flex-col">
                                    <div className="flex md:items-start items-center gap-5">
                                        <img
                                            src={purchase.image}
                                            className="rounded-full w-12 h-12 min-w-12 min-h-12 overflow-hidden"
                                            alt=""
                                        />

                                        <div className="flex md:flex-row flex-col items-start gap-5">
                                            <div className="flex flex-col gap-2">
                                                <p className="uppercase text-sm">{purchase.type}</p>
                                                <p className="text-xs text-start text-gray-400">{purchase.purchase_id}</p>
                                            </div>
                                            <div className={`${purchase.status === 'Berhasil' ? 'bg-green-400' : purchase.status === 'Dalam Proses' ? 'bg-yellow-400' : 'bg-red-400'} px-2 rounded-md text-white text-xs py-[0.5] p-1`}>
                                                <p>{purchase.status}</p>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="flex md:mt-0 mt-5 flex-col items-end">
                                        <p className="text-md font-semibold">
                                            Rp {new Intl.NumberFormat("id-ID").format(Number(purchase.amount))}
                                        </p>

                                        <div className="flex items-center">
                                            <p className="text-xs">
                                                {new Date(purchase.date).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>

                                            <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>

                                            <p className="text-xs">
                                                {new Date(purchase.date).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-32 w-full m-auto flex items-center justify-center">
                <div className="flex relative items-center justify-center py-3 px-5 rounded-full bg-white shadow-lg gap-5">
                    {/* Tombol Filter */}
                    <button onClick={() => setTypeFilter(prev => ({ ...prev, show: !prev.show }))} className="flex items-center gap-2 text-gray-500">
                        <Filter />

                        <p>Filter</p>
                    </button>

                    {/* Dropdown Filter */}
                    {typeFilter.show && (
                        <div className="absolute flex bg-gray-200 p-2 rounded-lg items-center gap-3 -top-12">
                            <button onClick={() => filterHandler('all')} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                                All
                            </button>

                            <button onClick={() => filterHandler('Berhasil')} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                                Success
                            </button>

                            <button onClick={() => filterHandler('pending')} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                                Pending
                            </button>

                            <button onClick={() => filterHandler('failed')} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                                Failed
                            </button>
                        </div>
                    )}

                    {/* Tombol Sorting */}
                    <button onClick={sortingHandler} className="flex items-center gap-2 text-gray-500">
                        <ArrowDownAZ />
                        <p>Sorting</p>
                    </button>
                </div>
            </div>

            {/* Deskripsi Pembelian */}
            <div ref={contentRef} className={`${showDescription.status ? 'block' : 'hidden'} w-[90%] mt-24 left-[50%] -translate-x-[50%] p-5 z-20 absolute bg-white rounded-lg shadow-lg`}>
                {type === "Uang Masuk" ? (
                    <div>
                        <div className="flex items-center gap-3">
                            <img src={admissionFees[showDescription.index]?.image} className="w-10 min-w-10 h-10 min-h-10 rounded-full" alt="" />

                            <div>
                                <p>{admissionFees[showDescription.index]?.title}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-200 rounded-lg flex flex-col gap-5 items-center mt-10">
                            <p className="text-gray-500">Amount</p>

                            <p className="text-3xl text-orange-400 font-semibold">Rp {new Intl.NumberFormat('id-ID').format(Number(admissionFees[showDescription.index]?.amount))}</p>
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">user</p>

                                    <p className="mt-2">Kopi Tuku</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">No. Referensi</p>

                                    <p className="mt-2">{admissionFees[showDescription.index]?.code}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">Status</p>

                                    <p className="mt-2">{admissionFees[showDescription.index]?.status}</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">Tanggal & Waktu</p>

                                    <p className="mt-2">{admissionFees[showDescription.index]?.date} | {admissionFees[showDescription.index]?.time}</p>
                                </div>
                            </div>

                            <Button onClick={downloadImage} className="text-green-400 mt-10 bg-transparent w-full">+ Unduh File</Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-3">
                            <img src={purchases[showDescription.index]?.image} className="w-10 min-w-10 h-10 min-h-10 rounded-full" alt="" />

                            <div>
                                <p>{purchases[showDescription.index]?.type}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-200 rounded-lg flex flex-col gap-5 items-center mt-10">
                            <p className="text-gray-500">Amount</p>

                            <p className="text-3xl text-orange-400 font-semibold">Rp {new Intl.NumberFormat('id-ID').format(Number(purchases[showDescription.index]?.amount))}</p>
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">user</p>

                                    <p className="mt-2">{dataUser.merchant.name}</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">No. Referensi</p>

                                    <p className="mt-2">{purchases[showDescription.index]?.refnumber}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex items-center gap-5 justify-between w-full">
                                <div className="flex flex-col items-start">
                                    <p className="text-gray-500">Status</p>

                                    <p className="mt-2">{purchases[showDescription.index]?.status}</p>
                                </div>

                                <div className="flex flex-col items-end">
                                    <p className="text-gray-500">Tanggal & Waktu</p>

                                    <p className="mt-2">
                                        {new Date(purchases[showDescription.index]?.date).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}{" "}
                                        |{" "}
                                        {new Date(purchases[showDescription.index]?.date).toLocaleTimeString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <Button onClick={downloadImage} className="text-green-400 mt-10 bg-transparent w-full">+ Unduh File</Button>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default Riwayat;

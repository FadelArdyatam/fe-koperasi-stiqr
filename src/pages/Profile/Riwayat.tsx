import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, FileText, ChevronsLeft, ChevronsRight, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import html2canvas from "html2canvas";
import axiosInstance from "@/hooks/axiosInstance";
import noTransactionImage from "../../images/no-transaction.png"
import { formatRupiah } from "@/hooks/convertRupiah";
import { convertDate, convertTime } from "@/hooks/convertDate";
import noIssuerImg from "@/images/no-issuer.png";
import DatePicker from "react-datepicker";
import imgNoTransaction from "@/images/no-transaction.png";
import Invoice from "@/components/Invoice";


interface Purchase {
    refnumber: string;
    type: string;
    purchase_id: string;
    amount: string;
    date: string;
    image?: string;
    status: string;
    biller?: string;
    marginFee?: number;
    log_purchases: any;
}

interface ISales {
    sales_id: string;
    total_amount: number;
    channel: number;
    transaction_date: string;
    transaction_id: string;
    transaction_status: string;
    net_amount?: number;
    sales?: {
        orderId: string;
    },
    qr_transaction?: {
        orderId: string;
        keterangan?: string;
    }
    payment_method: string;
}


const Riwayat = () => {

    const location = useLocation();

    const [type, setType] = useState("Uang Masuk");

    const [showDescription, setShowDescription] = useState({ status: false, index: -1 });
    const contentRef = useRef(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const onChange = (dates: [any, any]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };
    // const [dataUser, setDataUser] = useState<any>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPageSales, setCurrentPageSales] = useState(1);
    const [totalPagesSales, setTotalPagesSales] = useState(1);
    const [limit, setLimit] = useState(10);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [sales, setSales] = useState<ISales[]>([]);
    const [filter, setFilter] = useState("all")
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
    const setCustomDateRange = (start: string | null, end: string | null) => {
        setDateRange({ startDate: start || undefined, endDate: end || undefined });
        setFilter("dateRange");
    };
    // const [isOpenFilter, setIsOpenFilter] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string | null>(null)
    const [months, setMonths] = useState(2);

    useEffect(() => {
        const handleResize = () => {
            setMonths(window.innerWidth < 768 ? 1 : 2);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const setFilterHandler = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };
    const [limitPurchase, setLimitPurchase] = useState(10);
    useEffect(() => {
        const params: any = {
            page: currentPage,
            limit: limitPurchase,
            status: filterStatus
        }
        // setDataUser(userData);

        const fetchPurchase = async () => {
            const response = await axiosInstance.get(`/history/purchases/${userData.merchant.id}`, { params });
            setPurchases(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        }

        fetchPurchase();
    }, [currentPage, filterStatus, limitPurchase]);

    useEffect(() => {
        // Jika filter dateRange, pastikan startDate sudah ada dulu
        if (filter === "dateRange" && !dateRange.startDate) {
            return; // skip fetch jika belum ada tanggal startDate
        }

        const params: any = {
            filter,
            page: currentPageSales,
            limit: limit
        };

        if (filter === "dateRange") {
            const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date();
            const end = new Date(dateRange.endDate ?? dateRange.startDate ?? new Date().toISOString());

            // Tambahkan 1 hari
            start.setDate(start.getDate() + 1);
            end.setDate(end.getDate() + 1);

            // Simpan full ISO string termasuk waktu (bagian setelah T)
            params.startDate = start.toISOString();
            params.endDate = end.toISOString();
        }
        const fetchPurchase = async () => {
            try {
                const response = await axiosInstance.get(`/history/sales/${userData.merchant.id}`, { params });
                setSales(response.data.data);
                setTotalPagesSales(response.data.pagination.totalPages);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };

        fetchPurchase();
    }, [currentPageSales, filter, dateRange, limit]);


    useEffect(() => {
        if (location.state?.type) {
            setType(location.state.type);
        }
        // setDataUser(userData);

    }, [location.state]);

    const navigate = useNavigate();
    const handleDetailSales = (orderId: string) => {
        navigate(`/order?orderId=${orderId}`);
    }

    return (
        <div className={`relative h-screen ${!showDescription.status ? 'overflow-y-hidden' : ''} `}>
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
                        Penjualan
                    </Button>
                    <Button
                        onClick={() => setType("Pembelian")}
                        className={`uppercase block !mt-10 w-full mb-3 bg-transparent hover:bg-transparent rounded-none transition-all`}
                    >
                        Pembelian
                    </Button>

                    <div
                        className={`${type === "Pembelian" ? "translate-x-full" : "translate-x-0"} w-[50%] absolute bottom-0 h-1 bg-white transition-transform duration-300 ease-in-out`}
                    ></div>
                </div>
            </div>

            {/* Navigation */}
            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-50">
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
            <div className={`${showDescription.status ? 'hidden' : 'block'} relative mt-44 h-[calc(100%-14rem)] overflow-y-auto overflow-x-hidden`}>
                {/* Konten Uang Masuk */}
                <div
                    className={`absolute inset-0 ${type === "Uang Masuk" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"} transition-all duration-500 ease-in-out`}
                >
                    <div className="flex flex-col gap-5 w-[90%] m-auto p-5 shadow-lg bg-white rounded-lg">
                        <div className="w-full flex items-center justify-between flex-wrap gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center justend gap-3 w-full sm:w-auto">
                                {/* Kalender Icon */}
                                <button
                                    onClick={() => { setShowCalendar(!showCalendar); setFilter("dateRange"); }}
                                    className="p-2 rounded-full hover:bg-orange-400 hover:text-white  text-orange-400 border border-orange-400 transition-all"
                                    title="Pilih Tanggal"
                                >
                                    <Calendar className="w-5 h-5" />
                                </button>

                                {/* Filter Dropdown */}
                                <div className="relative w-full sm:w-auto">
                                    <select
                                        value={filter}
                                        onChange={(e) => {
                                            setFilterHandler(e.target.value);
                                            if (e.target.value === "dateRange") {
                                                setShowCalendar(true);
                                            } else {
                                                setDateRange({ startDate: undefined, endDate: undefined });
                                                setShowCalendar(false);
                                            }
                                        }}
                                        className="appearance-none pr-10 pl-4 py-2  hover:bg-orange-400 hover:text-white  text-orange-400 border border-orange-400 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 w-full cursor-pointer"
                                    >
                                        <option value="all">Lihat Semua</option>
                                        <option value="today">Hari Ini</option>
                                        <option value="yesterday">Kemarin</option>
                                        <option value="2days">2 Hari</option>
                                        <option value="7days">7 Hari</option>
                                        <option value="dateRange">Rentang Tanggal</option>
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center ">
                                        <ChevronDown className="w-5 h-5 text-orange-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-5 justify-between">
                            <Button
                                className={`${showCalendar ? 'block' : 'hidden'} text-sm bg-gray-200 border w-full border-gray-400 text-gray-700 rounded-lg px-3 py-2`}
                            >
                                {startDate && endDate
                                    ? `${startDate.toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })} - ${endDate.toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}`
                                    : "Pilih Tanggal Transaksi"}
                            </Button>
                        </div>

                        {
                            showCalendar && (
                                <div className="flex flex-col items-center border p-3 rounded-lg shadow-md">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={onChange}
                                        startDate={startDate}
                                        endDate={endDate}
                                        selectsRange
                                        inline
                                        maxDate={
                                            startDate
                                                ? new Date(Math.min(new Date().getTime(), startDate.getTime() + 6 * 24 * 60 * 60 * 1000))
                                                : new Date()
                                        }
                                        className="w-full"
                                        monthsShown={months}
                                    />

                                    <Button
                                        className="w-full mt-3 bg-orange-500 text-white rounded-lg"
                                        onClick={() => {
                                            setShowCalendar(false);
                                            setCustomDateRange(
                                                startDate ? startDate.toISOString() : null,
                                                endDate ? endDate.toISOString() : null
                                            )
                                        }}
                                    >
                                        Pilih
                                    </Button>
                                </div>
                            )
                        }

                        {
                            sales.length > 0 ? (
                                <div>
                                    {sales.map((history, index) => (
                                        <div key={index}
                                            className={`${history.sales?.orderId ? 'cursor-pointer' : ''}`}
                                            title={history.sales?.orderId ? 'Lihat Detail' : ''}
                                            onClick={() => {
                                                const orderId = history.sales?.orderId;
                                                if (orderId) {
                                                    handleDetailSales(orderId);
                                                }
                                            }} >
                                            <div className={`${index === 0 ? "hidden" : "block"} w-full h-[2px] my-5 bg-gray-300 rounded-full`}></div>
                                            <div className="flex md:flex-row flex-col md:items-center justify-between">
                                                <div className="flex items-start gap-2">
                                                    <img src={history?.channel ? `${import.meta.env.VITE_ISSUER_BANK_URL}/${history.channel}.png` : noIssuerImg} className="rounded-full w-10 h-10" alt="IMAGE" />
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex md:flex-row flex-col md:gap-2 items-start">
                                                            <p className="uppercase text-sm">
                                                                {history.sales_id == null
                                                                    ? history.qr_transaction?.orderId?.startsWith("P")
                                                                        ? "PPOB"
                                                                        : "QRCode"
                                                                    : "Penjualan"}{" "}
                                                                | {history.payment_method}
                                                            </p>

                                                            <div className={`${history.transaction_status === "success" ? "bg-green-400 " : history.transaction_status === "pending" ? "bg-yellow-400" : "bg-red-400"} w-fit px-2 rounded-md text-white text-xs py-[0.5]"`}>
                                                                <p>{history.transaction_status}</p>
                                                            </div>
                                                        </div>
                                                        {history.sales_id == null && history.qr_transaction?.keterangan != null ? <p className="text-sm text-gray-700 break-all">{history.qr_transaction?.keterangan}</p> : ""}

                                                        <p className="text-xs text-gray-400 text-start"><p className="text-xs text-gray-400 text-start">
                                                            {history.transaction_id}
                                                            {history.sales?.orderId || history.qr_transaction?.orderId
                                                                ? ` | ${history.sales?.orderId || history.qr_transaction?.orderId}`
                                                                : ''}
                                                        </p></p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end md:mt-0 mt-2">
                                                    <p className="text-md font-semibold">{formatRupiah(history.total_amount)}</p>
                                                    {
                                                        history.payment_method == 'QRIS' || history.payment_method == 'QRIS Static' && (
                                                            <p className="text-xs text-red-500 mb-2">
                                                                - {history.net_amount == null || history.total_amount == history.net_amount
                                                                    ? formatRupiah(0)
                                                                    : formatRupiah((history.total_amount ?? 0) - history.net_amount)
                                                                }
                                                                {" "} (MDR)
                                                            </p>
                                                        )
                                                    }
                                                    <div className="flex items-center">
                                                        <p className="text-xs">{convertDate(history.transaction_date)}</p>
                                                        <div className="w-5 h-[2px] bg-gray-300 rotate-90 rounded-full"></div>
                                                        <p className="text-xs">{convertTime(history.transaction_date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    <div className="flex flex-col items-center w-full mt-10">
                                        <div className="flex justify-between w-full mb-5">
                                            {/* Select di pojok kiri */}
                                            <select
                                                className="h-10 border border-gray-300 rounded-md md:w-20 w-14 text-center"
                                                value={limit}
                                                onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPageSales(1); }}
                                            >
                                                <option value="5">5</option>
                                                <option value="10">10</option>
                                                <option value="25">25</option>
                                                <option value="50">50</option>
                                            </select>

                                            {/* Pagination di tengah */}
                                            <div className="flex flex-col md:justify-center justify-end items-center flex-1 md:gap-5 ">
                                                <div className="flex gap-5 items-center ">
                                                    <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                                        onClick={() => setCurrentPageSales(1)}
                                                        disabled={currentPageSales === 1}
                                                    >
                                                        <ChevronsLeft />
                                                    </Button>

                                                    <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                                        onClick={() => setCurrentPageSales(prev => prev - 1)}
                                                        disabled={currentPageSales === 1}
                                                    >
                                                        <ChevronLeft />
                                                    </Button>

                                                    <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                                        onClick={() => setCurrentPageSales(prev => prev + 1)}
                                                        disabled={currentPageSales === totalPagesSales}
                                                    >
                                                        <ChevronRight />
                                                    </Button>

                                                    <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50"
                                                        onClick={() => setCurrentPageSales(totalPagesSales)}
                                                        disabled={currentPageSales === totalPagesSales}
                                                    >
                                                        <ChevronsRight />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <span className="md:block hidden text-center">Halaman {currentPageSales} dari {totalPagesSales}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info halaman */}
                                        <span className="text-center md:hidden block">Halaman {currentPageSales} dari {totalPagesSales}</span>
                                    </div>


                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-5">
                                    <img className="p-5" src={imgNoTransaction} alt="No transactions" />
                                    <p className="font-semibold text-lg text-orange-500">Belum ada transaksi hari ini</p>
                                </div>)
                        }

                    </div >
                </div >

                {/* Konten Pembelian */}
                < div
                    className={`absolute inset-0 ${type === "Pembelian" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"} transition-all duration-500 ease-in-out `}
                >
                    <div className="flex flex-col gap-5 w-[90%] m-auto p-5 shadow-lg bg-white rounded-lg ">
                        <label htmlFor="filter-status" className="text-sm text-gray-700">Filter Status:</label>
                        <select
                            id="filter-status"
                            value={filterStatus || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFilterStatus(value === "" ? null : value);
                                setCurrentPage(1);
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1 -mt-3 mb-3"
                        >
                            <option value="">Semua</option>
                            <option value="Berhasil">Berhasil</option>
                            <option value="Dalam Proses">Dalam Proses</option>
                            <option value="Gagal">Gagal</option>
                        </select>
                        {purchases.length === 0 ? (
                            <div className="flex items-center flex-col justify-center gap-10">
                                <img className="" src={noTransactionImage} alt="" />

                                <p className="font-semibold text-orange-500 text-center">Belum ada transaksi pembelian</p>
                            </div>) : (
                            <>

                                {purchases.map((purchase, index) => (
                                    <button onClick={() => setShowDescription({ status: true, index: index })} className={`${index === purchases.length - 1 ? 'mb-10' : 'mb-0'} block`} key={index}>
                                        <div
                                            className={`${index === 0 ? "hidden" : "block"
                                                } w-full h-[2px] mb-5 bg-gray-300 rounded-full`}
                                        ></div>

                                        <div className="flex md:items-center md:justify-between md:flex-row flex-col">
                                            <div className="flex md:items-start items-center gap-5">
                                                <img
                                                    src={`https://is3.cloudhost.id/stiqr/ppob/${purchase.biller}.png`}
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
                                                {
                                                    (purchase.marginFee ?? 0) > 0 && (
                                                        <p className="text-sm text-green-500">
                                                            + {formatRupiah(purchase.marginFee || 0)}
                                                        </p>
                                                    )
                                                }

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
                            </>
                        )

                        }
                        {
                            totalPages > 0 && (
                                <div className="flex flex-col items-center w-full mb-10">
                                    <div className="flex justify-between w-full">
                                        <select
                                            className="h-10 border border-gray-300 rounded-md md:w-20 w-14 text-center"
                                            value={limitPurchase}
                                            onChange={(e) => { setLimitPurchase(Number(e.target.value)); setCurrentPage(1); }}
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                        </select>
                                        <div className="flex flex-col md:justify-center justify-end items-center flex-1 md:gap-5 ">
                                            <div className="flex gap-5 items-center ">
                                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                                    <ChevronsLeft />
                                                </Button>

                                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                                                    <ChevronLeft />
                                                </Button>


                                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                                                    <ChevronRight />
                                                </Button>

                                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                                    <ChevronsRight />
                                                </Button>
                                            </div>
                                            <div>
                                                <span className="md:block hidden text-center">Halaman {currentPage} dari {totalPages}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-center md:hidden block">Halaman {currentPage} dari {totalPages}</span>
                                </div>
                            )
                        }
                    </div>
                </div >
            </div >

            {/* {
                type != "Uang Masuk" && (
                    <div className={`${showDescription.status ? 'hidden' : 'fixed bottom-20 w-full m-auto flex items-center justify-center'} `}>
                        <div className="flex relative items-center justify-center py-3 px-5 rounded-full bg-white shadow-lg gap-5">
                            <button onClick={() => setIsOpenFilter(!isOpenFilter)} className={`flex items-center gap-2 text-gray-500`}>
                                <Filter />

                                <p>Filter Status</p>
                            </button>

                            {isOpenFilter && (
                                <div className="absolute flex bg-gray-200 p-2 rounded-lg items-center gap-3 -top-12">
                                    <button onClick={() => { setFilterStatus(null); setIsOpenFilter(false); setCurrentPage(1) }} className="text-sm font-medium text-gray-600 hover:text-gray-800 w-24">
                                        Semua
                                    </button>

                                    <button onClick={() => { setFilterStatus('Berhasil'); setIsOpenFilter(false); setCurrentPage(1) }} className="text-sm font-medium text-gray-600 hover:text-gray-800 w-24">
                                        Berhasil
                                    </button>

                                    <button onClick={() => { setFilterStatus('Dalam Proses'); setIsOpenFilter(false); setCurrentPage(1) }} className="text-sm font-medium text-gray-600 hover:text-gray-800 w-24">
                                        Dalam Proses
                                    </button>

                                    <button onClick={() => { setFilterStatus('Gagal'); setIsOpenFilter(false); setCurrentPage(1) }} className="text-sm font-medium text-gray-600 hover:text-gray-800 w-24">
                                        Gagal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            } */}

            {/* Deskripsi Pembelian */}
            <div ref={contentRef} className={`${showDescription.status ? 'block' : 'hidden'} w-full xs:w-[90%] mt-24 left-[50%] -translate-x-[50%] p-5 z-20 absolute rounded-lg `}>
                {type === "Uang Masuk" ? (
                    <div>
                        {/* <div className="flex items-center gap-3">
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
                        </div> */}
                    </div>
                ) : (
                    <div>
                        {
                            purchases[showDescription.index] && (
                                <>
                                    <Invoice refNumber={purchases[showDescription.index]?.refnumber} marginTop={!showDescription.status} isDetail={true} />
                                </>
                            )
                        }
                    </div>
                )}
            </div >
        </div >
    );
};

export default Riwayat;

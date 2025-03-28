import { ChevronLeft, CreditCard, FileText, Home, ScanQrCode, UserRound } from 'lucide-react';
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import { Button } from '@/components/ui/button';
import Notification from '@/components/Notification';

const DataCustomer = () => {
    const [data, setData] = useState({
        is_name: false,
        is_phone: false,
        is_email: false,
        is_other_number: false,
    });
    const [loading, setLoading] = useState(false);

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`/customers/setting/${userData.merchant?.id}`);
                setData(response.data);
            } catch (error) {
                console.error("Gagal mengambil data pelanggan:", error);
            }
        };

        fetchData();
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const [showNotification, setShowNotification] = useState<{
        show: boolean;
        message: string;
        type: "success" | "error";
    }>({
        show: false,
        message: "",
        type: "success",
    });

    const handleToggle = (field: keyof typeof data) => {
        setData((prevData) => ({
            ...prevData,
            [field]: !prevData[field],
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(`/customers/setting/${userData.merchant?.id}/update`, data);
            if (response.status === 200) {
                setShowNotification({ show: true, message: "Berhasil menyimpan perubahan.", type: "success" });
            }
        } catch (error) {
            console.error("Gagal menyimpan perubahan:", error);
            setShowNotification({ show: true, message: "Gagal menyimpan perubahan.", type: "error" });
        }
        setLoading(false);
    };

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            {/* Header */}
            <div className="w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400">
                <Link to="/profile" className="absolute left-5 bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>
                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center">
                    Pengaturan Data Pelanggan
                </p>
            </div>

            {/* Data Pelanggan */}
            <div className="bg-white w-[90%] -translate-y-20 p-5 flex flex-col items-center rounded-lg shadow-lg z-0 ">
                {Object.entries({
                    is_name: "Nama Pelanggan",
                    is_phone: "Nomor Telepon",
                    is_email: "Email",
                    is_other_number: "Nomor Lainnya",
                }).map(([field, label], index) => {
                    const key = field as keyof typeof data; // Tambahkan type assertion

                    return (
                        <div key={field} className="w-full" data-aos="fade-up" data-aos-delay={index * 100}>
                            {index !== 0 && <div className="w-full h-[1px] my-5 bg-gray-200"></div>}

                            <div className="flex items-center justify-between">
                                <p>{label}</p>
                                <button
                                    className={`flex items-center justify-center w-14 min-w-14 h-8 p-1 rounded-full cursor-pointer 
                    ${data[key] ? "bg-orange-500" : "bg-gray-300"} transition-colors`}
                                    onClick={() => handleToggle(key)}
                                >
                                    <div
                                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                        ${data[key] ? "transform translate-x-3" : "transform -translate-x-3"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tombol Simpan */}
            <Button
                onClick={handleSave}
                disabled={loading}
                className="w-[90%] bg-orange-500 text-white px-6 py-2 rounded-lg shadow-md transition hover:bg-orange-600 disabled:bg-gray-300"
            >
                {loading ? "Tunggu..." : "Simpan Perubahan"}
            </Button>

            {
                showNotification.show && (
                    <Notification message={showNotification.message} status={showNotification.type} onClose={() => setShowNotification({ show: false, message: '', type: 'success' })} />
                )
            }

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
                <Link to="/profile" className="flex gap-3 flex-col text-orange-400 items-center">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </div>
    );
};

export default DataCustomer;

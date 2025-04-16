import { Save, X } from "lucide-react";
import { Input } from "./ui/input";
import { formatRupiah } from "@/hooks/convertRupiah";
import { Button } from "./ui/button";
import axiosInstance from "@/hooks/axiosInstance";
import { useState } from "react";
import Notification from "./Notification";

interface MarginProps {
    type?: string;
    showMargin: boolean;
    setShowMargin: (show: boolean) => void;
    margin: string;
    setMargin: (value: string) => void;
}

const MarginPPOB: React.FC<MarginProps> = ({ type, showMargin, setShowMargin, margin, setMargin }) => {
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const merchant_id = userData?.merchant?.id;

    const [showNotification, setShowNotification] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" })

    const handleSubmit = async () => {
        if (!type) return;
        const newType = type.toLowerCase()
        const payload = {
            merchant_id,
            [newType]: Number(margin.replace(/\D/g, ""))
        };

        try {
            await axiosInstance.post('/margin-ppob', payload);
            setShowNotification({ show: true, message: `Berhasil mengubah margin ${type}`, type: "success" })
        } catch (error) {
            setShowNotification({ show: true, message: `Gagal mengubah margin ${type}`, type: "error" })
        }
    };


    return (
        <>
            {showMargin && !showNotification.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
                    <div data-aos="zoom-in" className="bg-white w-[90%] md:max-w-md max-w-sm rounded-lg shadow-lg p-5">
                        <div className="md:text-end flex items-center justify-between">
                            <p className="text-lg font-semibold">Atur Biaya Tambahan - {type}</p>
                            <X className="hover:cursor-pointer" onClick={() => setShowMargin(false)} />
                        </div>
                        <div className="flex flex-col gap-3 mt-5">
                            <Input
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, "");

                                    // Default ke "0" kalau kosong
                                    if (!value) value = "0";

                                    // Hapus nol di depan, kecuali kalau memang hanya "0"
                                    if (value.length > 1 && value.startsWith("0")) {
                                        value = value.replace(/^0+/, "") || "0";
                                    }

                                    // Batas maksimum 2000
                                    if (Number(value) > 2000) value = "2000";

                                    setMargin(value);
                                }}
                                value={formatRupiah(margin)}
                                type="text"
                            />
                            <div>
                                <p className="text-gray-400 italic text-xs">*Biaya Tambahan adalah margin keuntungan yang akan Anda peroleh</p>
                                <p className="text-gray-400 italic text-xs">*Biaya Tambahan akan tertulis menjadi Biaya Layanan di detail tagihan</p>
                                <p className="text-gray-400 italic text-xs">*Maksimal Rp2.000</p>
                            </div>
                            <Button className="bg-green-400 flex items-center gap-2" onClick={handleSubmit}>
                                <Save /> Terapkan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {
                showNotification.show && <Notification message={showNotification.message}
                    onClose={() => {
                        setShowNotification({ show: false, message: '', type: 'success' });
                        setShowMargin(false);
                    }}
                    status={showNotification.type} />
            }
        </>
    );
};

export default MarginPPOB;

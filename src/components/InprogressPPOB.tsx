import React, { useEffect, useState } from "react";
import Invoice from "./Invoice";
import waitingImg from "@/images/waiting.png";
import { Hourglass, ListCheck, X } from "lucide-react";
import { formatRupiah } from '../hooks/convertRupiah';
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface BillProps {
    data: any;
    marginTop: boolean;
    refNumber: string;
    isDetail?: boolean;
}
const InprogressPPOB: React.FC<BillProps> = ({ data, marginTop, refNumber, isDetail }) => {
    const navigate = useNavigate()
    const [showInvoice, setShowInvoice] = useState(false);
    useEffect(() => {
        if (!isDetail) {
            const timer = setTimeout(() => {
                setShowInvoice(true);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isDetail]);
    return (
        <>
            <div className={`${marginTop ? 'mt-[130px]' : 'mt-[-90px] bg-white'} ${showInvoice ? 'hidden' : 'block'} w-[90%] m-auto shadow-lg z-0 p-10 rounded-lg relative bg-white overflow-hidden`}>
                <div className="relative z-10">
                    <div className="flex justify-center flex-col items-center gap-5 mb-5">
                        <div className='w-16 h-16 flex items-center justify-center border-2 border-black bg-orange-400 rounded-full m-auto'>
                            <Hourglass className="scale-[2] text-white" />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-orange-500 font-bold text-xl">Mohon tunggu</p>
                            <span className="text-orange-500 animate-bounce">.</span>
                            <span className="text-orange-500 animate-bounce delay-200">.</span>
                            <span className="text-orange-500 animate-bounce delay-400">.</span>
                        </div>
                        <img src={waitingImg} className="" />
                        <p>Pesanan anda sedang di proses, mohon untuk menunggu</p>
                    </div>
                    <div className="flex justify-start flex-col items-start gap-2">
                        <p className="font-bold">Detail Tagihan</p>
                        <div className="w-full my-2 h-[2px] bg-gray-200"></div>
                        <div className="flex justify-between w-full">
                            <p className="text-gray-500">Nomor Akun</p>
                            <p>{data?.accountNumber}</p>
                        </div>
                        <div className="flex justify-between w-full">
                            <p className="text-gray-500">{data?.category} - {data?.productName}</p>
                            <p>{formatRupiah(data?.amount)}</p>
                        </div>
                        <div className="w-full my-2 h-[2px] bg-gray-200 mb-3"></div>
                        <div className="flex justify-between w-full">
                            <p className="text-gray-500">Total Tagihan</p>
                            <p>{formatRupiah(data?.amount)}</p>
                        </div>
                    </div>
                    <div className="flex md:flex-row flex-col justify-center gap-5 mt-5 w-full">
                        <Button onClick={() => navigate('/dashboard')} className="w-full bg-orange-400"><X /> Tutup</Button>
                        <Button onClick={() => navigate('/profile/history', {
                            state: { type: "Pembelian" }
                        })} className="w-full bg-green-400"><ListCheck /> Lihat Riwayat</Button>
                    </div>
                </div>
            </div>
            {showInvoice && <Invoice refNumber={refNumber} marginTop={marginTop} />}
        </>
    );
};

export default InprogressPPOB;

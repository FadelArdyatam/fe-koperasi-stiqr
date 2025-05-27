import { formatRupiah } from "@/hooks/convertRupiah";
import { CheckCircleIcon, ChevronLeft } from "lucide-react";
import logo from "../../images/logo.png";
import { convertDate, convertTime } from "@/hooks/convertDate";

interface SettlementData {
    amount: number;
    settlement_id: string;
    admin_fee: number;
    created_at: Date | string;
    status?: string;
    account?: {
        bank_name?: string;
        account_number?: string;
        owner_name?: string;
    };
}

interface DetailSettlementProps {
    data: SettlementData;
    handleClose: () => void;
}

export const DetailSettlement: React.FC<DetailSettlementProps> = ({ data, handleClose }) => {
    const amount = data.amount ?? 0;
    const adminFee = data.admin_fee ?? 0;
    const mdr = amount * 0.007;
    console.log(data)

    return (
        <>
            <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                <ChevronLeft onClick={handleClose} className="scale-[1.3] text-white cursor-pointer" />
                <p data-aos="zoom-in" className="font-semibold m-auto text-xl text-white text-center uppercase">
                    Penarikan
                </p>
            </div>

            <div className="relative mt-24 p-10 flex flex-col w-[90%] m-auto shadow-xl shadowin bg-white rounded-lg">
                <div className="absolute top-0 right-0 py-1 bg-green-400 px-5 rounded-bl-md text-white shadow-inner">
                    <div className="flex flex-row gap-3">
                        <CheckCircleIcon className="w-5 h-5" />
                        <p className="md:text-md text-sm">{data.status}</p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <img src={logo} className="w-16 mb-5" alt="Logo" />
                </div>

                <div className="flex md:flex-row flex-col text md:text-lg text-md items-center justify-between">
                    <h2 className="font-bold">Detail Penarikan</h2>
                    <h2 className="md:font-bold">{data.settlement_id}</h2>
                </div>

                <hr className="my-3" />
                <div className="flex justify-between text-sm my-1">
                    <p>Tanggal Penarikan</p>
                    <p>{convertDate(data.created_at.toString())} | {convertTime(data.created_at.toString())} </p>
                </div>
                <div className="flex justify-between text-sm my-1">
                    <p>Metode Penarikan</p>
                    <p>{data.account?.bank_name || "Unknown Bank"}</p>
                </div>
                <div className="flex justify-between text-sm my-1">
                    <p>Akun Penarikan</p>
                    <p>{data.account?.account_number || "Unknown Account"}</p>
                </div>

                <div className="flex justify-between text-sm my-1">
                    <p>Nama Pemilik</p>
                    <p>{data.account?.owner_name || "Unknown Owner"}</p>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-sm my-1">
                    <p>Jumlah Penarikan</p>
                    <p>{formatRupiah(amount)}</p>
                </div>
                <div className="flex justify-between text-sm my-1">
                    <p>MDR <i>(0,7%)</i></p>
                    <p className="text-red-500">- {formatRupiah(mdr)}</p>
                </div>
                <div className="flex justify-between text-sm my-1 items-center font-bold">
                    <p>Saldo yang Diterima</p>
                    <p>{formatRupiah(amount - mdr)}</p>
                </div>
                <p className="text-xs text-gray-500 italic font-normal">
                    *saldo yang masuk ke rekening Anda.
                </p>

                <hr className="my-3" />

                <div className="flex justify-between text-sm my-1 items-center">
                    <p>Biaya Layanan</p>
                    <p>{formatRupiah(adminFee)}</p>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between text-sm my-1 items-center font-bold">
                    <p>Total Biaya Penarikan</p>
                    <p>{formatRupiah(adminFee + amount)}</p>
                </div>
            </div>
        </>
    );
};

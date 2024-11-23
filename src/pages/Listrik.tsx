import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Bill from "@/components/Bill";
import { Input } from "@/components/ui/input";

interface BillData {
    product: string;
    amount: string;
    date: string;
    time: string;
}

const Listrik = () => {
    const [nominal, setNominal] = useState("");
    const [noMeter, setNoMeter] = useState("");
    const [type, setType] = useState("");
    const [dataBill, setDataBill] = useState<BillData | null>(null);
    const [showBill, setShowBill] = useState(false);

    const sendBill = () => {
        const data = {
            product: "Tagihan Listrik",
            amount: nominal,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        };

        setDataBill(data);
        setShowBill(true);
    };

    const handleDropdownChange = (value: string) => {
        setNominal(value);
    };

    const handleRadioChange = (value: string) => {
        setType(value);
    };

    return (
        <>
            <div className="w-full p-10 pb-32 flex items-center justify-center bg-orange-400 bg-opacity-100">
                <Link to={"/dashboard"} className="bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>

                <p className="font-semibold m-auto text-xl text-white text-center uppercase">
                    Listrik
                </p>
            </div>

            <div className={`${showBill ? 'hidden' : 'block'}`}>
                <div className="bg-white w-[90%] -translate-y-[100px] p-10 shadow-lg rounded-md m-auto">
                    <p className="font-semibold m-auto text-xl text-center">
                        Beli Token Atau Bayar Listrik
                    </p>

                    <RadioGroup
                        defaultValue=""
                        onValueChange={handleRadioChange}
                        className="mt-10 w-full flex items-center gap-5 justify-center"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Token Listrik" id="r1" />
                            <Label htmlFor="r1">Token Listrik</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Tagihan Listrik" id="r2" />
                            <Label htmlFor="r2">Tagihan Listrik</Label>
                        </div>
                    </RadioGroup>

                    <div className="mt-10">
                        <p>No. Meter/ID Pel</p>

                        <Input
                            onChange={(e) => setNoMeter(e.target.value)}
                            type="number"
                            className="w-full p-5 border border-black bg-white shadow-lg mt-2"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="mt-10">
                                <p>Wilayah</p>

                                <div className="flex items-center gap-5 border mt-2 text-gray-400 border-black rounded-lg p-2 justify-between">
                                    <button>{nominal || "Wilayah"}</button>

                                    <ChevronDown />
                                </div>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg w-[300px] flex flex-col gap-3">
                            <DropdownMenuItem onClick={() => handleDropdownChange("20.000")}>
                                20.000
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("50.000")}>
                                50.000
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("100.000")}>
                                100.000
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("150.000")}>
                                150.000
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("200.000")}>
                                200.000
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className={`${nominal.length === 0 || type.length === 0 || noMeter.length === 0 ? 'hidden' : 'block'} w-[90%] m-auto shadow-lg rounded-lg p-5`}>
                    <p className="font-semibold">Keterangan</p>

                    <p className="mt-3">1. Informasi kode token yang Anda bayar akan di kirimkan <span className="font-semibold">maksimal 2 x 24 jam.</span></p>

                    <p className="mt-3">2. Pembelian token listrik tidak dapat dilakukan pada <span className="font-semibold">jam 23:00 - 00:59.</span></p>
                </div>

                <Button
                    onClick={sendBill}
                    className={`${nominal.length === 0 || type.length === 0 || noMeter.length === 0 ? 'hidden' : 'block'} w-[90%] m-auto bg-green-400 text-white py-3 rounded-md hover:bg-green-500 mt-10 mb-10`}
                >
                    Lanjutkan
                </Button>
            </div>

            {showBill && dataBill && <Bill data={dataBill} marginTop={false} />}
        </>
    );
};

export default Listrik;

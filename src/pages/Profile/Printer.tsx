import { ChevronLeft, CreditCard, FileText, Home, PrinterCheck, ScanQrCode, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import AddPrinter from "@/components/AddPrinter";
import EditPrinter from "@/components/EditPrinter";

const initialPrinter: any[] | (() => any[]) = []

const Printer = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showOption, setShowOption] = useState(false);
    const [showManualInputPrinter, setShowManualInputPrinter] = useState(false);
    const [printers, setPrinters] = useState(initialPrinter)
    const [open, setOpen] = useState({
        id: -1,
        status: false,
    });

    console.log(printers)

    async function connectToPrinter() {
        setIsConnecting(true);
        setErrorMessage(null);

        try {
            console.log("Requesting Bluetooth Device...");
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ["printer"], // Ganti dengan UUID layanan printer Anda
            });

            console.log("Connecting to GATT Server...");
            const server = await device.gatt.connect();

            console.log("Getting Printer Service...");
            const service = await server.getPrimaryService("printer"); // Ganti dengan UUID layanan printer Anda

            console.log("Getting Characteristics...");
            const characteristic = await service.getCharacteristic("characteristic-uuid"); // Ganti dengan UUID karakteristik printer Anda

            console.log("Sending Data...");
            const encoder = new TextEncoder();
            const data = encoder.encode("Print this text!");
            await characteristic.writeValue(data);

            console.log("Data sent successfully!");
            alert("Data sent successfully to the printer!");
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(`Failed to connect to the printer: ${(error as any).message}`);
        } finally {
            setIsConnecting(false);
        }
    }

    const handleOpen = (id: number) => {
        setOpen({
            id: id - 1,
            status: true,
        });
    };

    return (
        <>
            <div className={`${showManualInputPrinter || open.status ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center`}>
                <div className="w-full px-5 pt-5 flex items-center justify-center">
                    <Link to={"/profile"} className="absolute left-5 bg-transparent hover:bg-transparent">
                        <ChevronLeft className="scale-[1.3] text-black" />
                    </Link>
                    <p className="font-semibold m-auto text-xl text-black text-center">Pengaturan Perangkat</p>
                </div>

                <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                    <Link to={"/dashboard"} className="flex gap-3 flex-col items-center">
                        <Home />
                        <p className="uppercase">Home</p>
                    </Link>
                    <Link to={"/qr-code"} className="flex gap-3 flex-col items-center">
                        <ScanQrCode />
                        <p className="uppercase">Qr Code</p>
                    </Link>
                    <Link to={"/settlement"} className="flex relative gap-3 flex-col items-center">
                        <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                            <CreditCard />
                        </div>
                        <p className="uppercase">Penarikan</p>
                    </Link>
                    <Link to={"/catalog"} className="flex gap-3 flex-col items-center">
                        <FileText />
                        <p className="uppercase">Catalog</p>
                    </Link>
                    <Link to={"/profile"} className="flex gap-3 flex-col text-orange-400 items-center">
                        <UserRound />
                        <p className="uppercase">Profile</p>
                    </Link>
                </div>

                <div className="w-full flex items-center p-5">
                    {printers.length === 0 ? <PrinterCheck className="block scale-[5] mt-32 m-auto" /> : (
                        <div className="w-full bg-orange-50 p-5 mt-10 rounded-lg flex flex-col gap-5">
                            {printers.map((printer, index) => (
                                <div key={index} onClick={() => handleOpen(printer.id)} className="flex items-center gap-5">
                                    <div className="p-5 bg-orange-200 rounded-lg flex items-center justify-center">
                                        <PrinterCheck className="block scale-[1.5] text-gray-500" />
                                    </div>

                                    <div>
                                        <p>{printer.name}</p>

                                        <p className="text-gray-500">{printer.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {showOption && (
                    <div className="fixed bg-black bg-opacity-50 inset-0 z-20 -translate-y-10">
                        <div className="bg-white p-4 rounded-lg mt-10 translate-y-10 absolute bottom-0 w-full">
                            <div className="flex mb-3 items-center gap-5 justify-between">
                                <p className="text-lg font-semibold">Tambah Perangkat Baru</p>

                                <button onClick={() => setShowOption(false)}><X /></button>
                            </div>

                            <p className="text-gray-500">Sesuaikan koneksi dengan perangkat kamu, ya.</p>

                            <button
                                onClick={connectToPrinter}
                                className={`w-full p-3 mt-5 rounded-full text-white ${isConnecting ? "bg-gray-500 cursor-not-allowed" : "bg-orange-400"
                                    }`}
                                disabled={isConnecting}
                            >Bluetooth</button>

                            <button onClick={() => { setShowManualInputPrinter(true); setShowOption(false) }} className="w-full p-3 mt-5 rounded-full text-orange-500 bg-orange-100">Tambahkan Secara Manual</button>

                            {errorMessage && <p className="text-red-500 text-sm mt-5">{errorMessage}</p>}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowOption(true)}
                    className={`fixed bottom-32 left-[50%] -translate-x-[50%] p-3 w-[90%] rounded-full text-white ${isConnecting ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500"
                        }`}
                    disabled={isConnecting}
                >
                    {isConnecting ? "Menyambungkan..." : "Tambah Perangkat Baru"}
                </button>
            </div>

            {showManualInputPrinter && <AddPrinter setShowManualInputPrinter={setShowManualInputPrinter} printers={printers} setPrinters={setPrinters} />}

            {open.status && <EditPrinter setOpen={setOpen} printers={printers} setPrinters={setPrinters} editIndex={open.id} open={open} />}
        </>
    );
};

export default Printer;

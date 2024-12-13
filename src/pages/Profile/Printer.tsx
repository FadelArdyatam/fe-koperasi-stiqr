import { ChevronLeft, CreditCard, FileText, Home, PrinterCheck, ScanQrCode, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Printer = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
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

            <PrinterCheck className="block scale-[5] mt-[200px]" />

            <button
                onClick={connectToPrinter}
                className={`fixed bottom-32 left-[50%] -translate-x-[50%] p-3 rounded-full text-white ${isConnecting ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500"
                    }`}
                disabled={isConnecting}
            >
                {isConnecting ? "Menyambungkan..." : "Tambah Perangkat Baru"}
            </button>

            {errorMessage && (
                <p className="text-red-500 mt-5 text-center px-5">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default Printer;

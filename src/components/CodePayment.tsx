import { Check } from "lucide-react"
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";

const CodePayment = () => {
    const [randomNumber, setRandomNumber] = useState("");
    const contentRef = useRef(null); // Untuk mereferensikan elemen yang akan dirender menjadi gambar

    useEffect(() => {
        const generateRandomNumber = () => {
            // Generate a 6-digit random number as a string
            const number = Math.floor(100000 + Math.random() * 900000).toString();
            setRandomNumber(number);
        };

        generateRandomNumber();
    }, [])

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

    return (
        <div className="mt-28">
            <div className='w-16 h-16 flex items-center justify-center border-2 border-black bg-orange-400 rounded-full m-auto'>
                <Check className='scale-[2] text-white' />
            </div>

            <div className="mt-10 w-[90%] m-auto text-center">
                <p className="uppercase font-semibold">Kode Berhasil Dibuat</p>

                <p className="mt-2 text-gray-500 text-sm">Masukkan kode tarik tunai ini pada layar Atm Anda.</p>

                <div className="mt-10 p-5 text-center bg-gray-200 rounded-lg" ref={contentRef}>
                    <p className="text-3xl font-semibold">{randomNumber}</p>

                    <p className="mt-5 text-gray-500 text-sm">Kode Anda</p>
                </div>

                <Button onClick={downloadImage} className="text-green-400 mt-10 bg-transparent w-full">+ Unduh File</Button>

                <Link to={'/dashboard'} className="uppercase mt-10 block bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-all text-white">Kembali Ke Dashboard</Link>
            </div>
        </div>
    )
}

export default CodePayment
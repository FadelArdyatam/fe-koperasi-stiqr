import { convertDate, convertTime } from "@/hooks/convertDate";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ISales } from "@/pages/Booking/Booking";
import { useRef } from "react";

interface ReceiptProps {
    data: ISales;
    // setShowReceipt: React.Dispatch<React.SetStateAction<{ type: string; show: boolean; index: number }>>;
    showReceipt: any;
}

const Receipt: React.FC<ReceiptProps> = ({ data, showReceipt }) => {
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>Cetak Struk</title>
                            <style>
                                /* Gaya Umum */
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 0;
                                    padding: 0;
                                }

                                /* Kontainer */
                                .w-full {
                                    width: 100%;
                                }

                                .flex {
                                    display: flex;
                                }

                                .flex-col {
                                    flex-direction: column;
                                }

                                .items-center {
                                    align-items: center;
                                }

                                .justify-between {
                                    justify-content: space-between;
                                }

                                .gap-5 {
                                    gap: 20px;
                                }

                                .mt-3 {
                                    margin-top: 12px;
                                }

                                /* Teks */
                                .text-2xl {
                                    font-size: 1.5rem;
                                }

                                .text-xl {
                                    font-size: 1.25rem;
                                }

                                .text-lg {
                                    font-size: 1.125rem;
                                }

                                .font-semibold {
                                    font-weight: 600;
                                }

                                .text-gray-500 {
                                    color: #6b7280;
                                }

                                .text-center {
                                    text-align: center;
                                }

                                /* Garis */
                                hr {
                                    border: 0;
                                    border-top: 1px dashed #ccc;
                                    margin: 10px 0;
                                }

                                .border-dashed {
                                    border-style: dashed;
                                }

                                .border-gray-300 {
                                    border-color: #d1d5db;
                                }

                                /* Pemosisian */
                                .translate-x-[30px] {
                                    padding-left: 30px;
                                }
                            </style>
                        </head>
                        <body>
                            ${printContent}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };

    console.log("Data Receipt:", data);
    console.log("Show Receipt:", showReceipt);

    return (
        <div className="p-5 w-full">
            {showReceipt.type === "dapur" && (
                <div className="w-full flex flex-col items-center gap-5 justify-between" ref={printRef}>
                    <p className="text-2xl text-center font-semibold">{userData?.merchant.name}</p>

                    {/* Garis Putus-Putus */}
                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <p className="text-xl font-semibold">Nomor Antrian {data.queue_number}</p>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    {/* Informasi Pesanan */}
                    <div className="w-full">
                        <p className="text-lg font-semibold">{data.order_type === "dinein" ? "Makan Ditempat" : "Bawa Pulang"}</p>

                        <div className="flex justify-between mt-3">
                            <span>Nama Pemesan</span>
                            <span className="font-semibold">{data.customer_name}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>No. Pesanan</span>
                            <span className="font-semibold">{data.sales_id}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>Waktu Pesanan</span>
                            <span className="font-semibold">{convertDate(data.created_at)} | {convertTime(data.created_at)}</span>
                        </div>
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    {/* Daftar Pesanan */}
                    <div className="w-full flex flex-col gap-3">
                        {data.sales_details.map((item, index) => (
                            <div key={index}>
                                <p>
                                    {item.quantity}x {item.product.product_name}
                                </p>

                                {item.variant && (
                                    <p className="translate-x-[30px] text-gray-500">{item.variant.variant_name}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />
                </div>
            )}

            {showReceipt.type === "checker" && (
                <div className="w-full flex flex-col items-center gap-5 justify-between" ref={printRef}>
                    <p className="text-2xl text-center font-semibold">{userData?.merchant.name}</p>

                    {/* Garis Putus-Putus */}
                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <p className="text-xl font-semibold">Nomor Antrian {data.queue_number}</p>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    {/* Informasi Pesanan */}
                    <div className="w-full">
                        <div className="flex justify-between mt-3">
                            <p className="text-lg font-semibold">{data.order_type === "dinein" ? "Makan Ditempat" : "Bawa Pulang"}</p>
                            <p className="font-semibold">Meja {data.table_number}</p>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>Nama Pemesan</span>
                            <span className="font-semibold">{data.customer_name}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>No. Pesanan</span>
                            <span className="font-semibold">{data.sales_id}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>Waktu Pesanan</span>
                            <span className="font-semibold">{convertDate(data.created_at)} | {convertTime(data.created_at)}</span>
                        </div>
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    {/* Daftar Pesanan */}
                    <div className="w-full flex flex-col gap-3">
                        {data.sales_details.map((item, index) => (
                            <div key={index}>
                                <p>
                                    {item.quantity}x {item.product.product_name}
                                </p>

                                {item.variant && (
                                    <p className="translate-x-[30px] text-gray-500">{item.variant.variant_name}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <p className="">Bill ini bukan bukti pembayaran</p>
                </div>
            )}

            {showReceipt.type === "tagihan" && (
                <div className="w-full flex flex-col items-center gap-5 justify-between" ref={printRef}>
                    <div>
                        <p className="text-2xl text-center font-semibold">{userData?.merchant.name}</p>

                        <p className="text-xl text-center font-semibold text-gray-500 mt-2">{userData?.merchant.address}</p>

                        <p className="text-xl text-center font-semibold text-gray-500 mt-2">{userData?.merchant.phone_number}</p>
                    </div>

                    {/* Garis Putus-Putus */}
                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <div className="flex justify-between w-full">
                        <p className="text-lg font-semibold">{data.order_type === "dinein" ? "Makan Ditempat" : "Bawa Pulang"}</p>

                        <p className="font-semibold">Meja {data.table_number}</p>
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    {/* Informasi Pesanan */}
                    <div className="w-full">
                        <div className="flex justify-between mt-3">
                            <span>Nama Pemesan</span>
                            <span className="font-semibold">{data.customer_name}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>No. Pesanan</span>
                            <span className="font-semibold">{data.sales_id}</span>
                        </div>

                        <div className="flex justify-between mt-3">
                            <span>Waktu Pesanan</span>
                            <span className="font-semibold">{convertDate(data.created_at)} | {convertTime(data.created_at)}</span>
                        </div>
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    {/* Daftar Pesanan */}
                    <div className="w-full flex flex-col gap-3">
                        {data.sales_details.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center w-full justify-between">
                                    <p>
                                        {item.quantity}x {item.product.product_name}
                                    </p>

                                    <p className="font-semibold">{formatRupiah(item.product.product_price)}</p>
                                </div>

                                {item.variant && (
                                    <p className="translate-x-[30px] text-gray-500">{item.variant.variant_name}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center gap-5 justify-between w-full">
                            <p className="text-gray-500">Subtotal</p>

                            <p className="font-semibold">{formatRupiah(data.subtotal)}</p>
                        </div>

                        <div className="flex items-center gap-5 justify-between w-full">
                            <p className="text-gray-500">Pajak (11%)</p>

                            <p className="font-semibold">{formatRupiah((data.subtotal * 11) / 100)}</p>
                        </div>
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <div className="flex items-center gap-5 justify-between w-full">
                        <p>Total Tagihan</p>

                        <p className="font-semibold">{formatRupiah(data.subtotal + (data.subtotal * 11) / 100)}</p>
                    </div>

                    <hr className="border-t-2 border-dashed border-gray-300 w-full" />

                    <p className="">Bill ini bukan bukti pembayaran</p>
                </div>
            )}

            <button
                onClick={handlePrint}
                className="mt-5 bg-orange-500 w-full text-white py-2 px-4 rounded-lg"
            >
                Cetak Struk
            </button>
        </div>
    );
};

export default Receipt;

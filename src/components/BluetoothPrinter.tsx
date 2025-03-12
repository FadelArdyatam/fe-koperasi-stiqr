import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/hooks/convertRupiah';
import { convertDate, convertTime } from '@/hooks/convertDate';

interface PrinterProps {
  data: {
    no_transaksi: string;
    date: string;
    merchant: {
      name: string;
      address: string;
      phone: string;
    }
    products: {
      name: string;
      qty: number;
      price: number;
      subtotal: number;
    }[]
    payment: {
      total: number;
      method: string;
      pay: number;
      change?: number;
    }
  };
  style: string;
}
const BluetoothPrinter: React.FC<PrinterProps> = ({ data, style, }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bluetooth-print-js@1.0/index.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const handlePrint = () => {
    // @ts-ignore
    const printer = new PrintPlugin("80mm");

    printer.connectToPrint({
      onReady: async (print: any) => {
        await print.writeText(data.merchant.name, {
          align: "center",
          bold: true,
          size: "double",
        });
        await print.writeText(
          data.merchant.address,
          { align: "center" }
        );
        await print.writeText(data.merchant.phone, { align: "center" });
        await print.writeLineBreak();
        await print.writeText(`No.Transaksi: ${data.no_transaksi}`, {
          align: "center",
        });
        await print.writeText(`${convertDate(data.date)} ${convertTime(data.date)}`, { align: "center" });

        await print.writeDashLine();
        if (data.products.length > 0) {
          for (let i = 0; i < data.products.length; i++) {
            const product = data.products[i];

            await print.writeText(product.name || "Produk", { align: "left" });
            await print.writeTextWith2Column(
              `${product.qty} x ${formatRupiah(product.price).replace(" ", "")}`,
              `${formatRupiah(product.subtotal).replace(" ", "")}`
            );

            if (i !== data.products.length - 1) {
              await print.writeLineBreak();
            }
          }
        }

        await print.writeDashLine();

        await print.writeTextWith2Column("Total :", formatRupiah(data.payment.total).replace(" ", ""));
        await print.writeTextWith2Column("Bayar :", formatRupiah(data.payment.pay).replace(" ", ""));
        await print.writeTextWith2Column("Kembali :", formatRupiah(0).replace(" ", ""));
        await print.writeTextWith2Column("Metode :", data.payment.method);

        await print.writeLineBreak();
        await print.writeText(
          "Terimakasih sudah berkunjung ke Toko Kami.",
          { align: "center" }
        );
        await print.writeLineBreak();
        await print.writeLineBreak();
        await print.writeLineBreak();
      },
      onFailed: (message: any) => {
        console.log(message);
      },
    });
  };

  return (
    <>
      <Button className={style} onClick={handlePrint}>Cetak Struk</Button>
      <p id="status" className="mt-2 hidden"></p>
    </>
  );
};

export default BluetoothPrinter;

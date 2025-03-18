import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import axiosInstance from "@/hooks/axiosInstance";
import BluetoothPrinter from "./BluetoothPrinter";
import { formatRupiah } from "@/hooks/convertRupiah";

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const { orderId, amount } = location.state || {};

  interface IOrder {
    no_transaksi: string;
    date: string;
    merchant: {
      name: string;
      address: string;
      phone: string;
    },
    products: {
      name: string;
      qty: number;
      price: number;
      subtotal: number;
    }[],
    payment: {
      total: number;
      method: string;
      pay: number;
      change: number;
    }
  }
  const [orders, setOrders] = useState<IOrder>()
  useEffect(() => {
    const fetchOrder = async () => {
      const response = await axiosInstance.get(`/sales/order/${orderId}`)
      setOrders(response.data)
    }
    fetchOrder()
  }, [orderId]);

  return (
    <div className="min-h-screen bg-orange-400 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center w-full max-w-md">
        <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="text-white w-12 h-12" />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Pembayaran Berhasil
        </h2>

        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <p className="text-gray-700">
            Order ID:
            <span className="font-semibold ml-2">{orderId || "N/A"}</span>
          </p>
          <p className="text-gray-700">
            Total Bayar:
            <span className="font-semibold ml-2">
              {amount ? formatRupiah(amount.toLocaleString()) : "N/A"}
            </span>
          </p>
        </div>

        <p className="text-gray-600 mb-6">
          Terima kasih telah melakukan pembayaran. Transaksi Anda telah berhasil
          diproses.
        </p>

        <div className="flex space-x-4 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-2 w-40 text-white bg-orange-400 rounded-md hover:bg-orange-500 transition text-center"
          >
            Kembali
          </Link>
          {orders && (
            <BluetoothPrinter
              style="px-6 py-2 w-40 text-white bg-green-500 rounded-md hover:bg-green-600 transition text-center"
              data={orders}
            ></BluetoothPrinter>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

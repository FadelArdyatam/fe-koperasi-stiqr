import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, AlertCircle } from "lucide-react"; // Tambahkan ikon untuk error jika diperlukan

interface NotificationProps {
    message: string;
    onClose: () => void;
    status: "success" | "error";
}

const Notification: React.FC<NotificationProps> = ({ message, onClose, status }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
            <div className="bg-white w-[90%] max-w-sm rounded-lg shadow-lg p-5">
                {status === "success" ? (
                    <CircleCheck className="text-green-500 scale-150 mx-auto mt-5" />
                ) : (
                    <AlertCircle className="text-red-500 scale-150 mx-auto mt-5" />
                )}
                <p
                    className={`text-center mt-5 text-lg font-medium ${status === "success" ? "text-green-500" : "text-red-500"
                        }`}
                >
                    {message}
                </p>
                <div className="flex justify-center mt-5">
                    <Button onClick={onClose} className={`w-full ${status === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
                        Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Notification;

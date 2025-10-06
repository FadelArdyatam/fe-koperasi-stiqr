import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, AlertCircle, AlertTriangle } from "lucide-react"; // Tambah ikon warning
import AOS from "aos";
import "aos/dist/aos.css";

interface NotificationProps {
    message: string;
    onClose: () => void;
    status: "success" | "error" | "warning";
    text?: string
}

const Notification: React.FC<NotificationProps> = ({ message, onClose, status, text = 'Tutup' }) => {
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const getIcon = () => {
        switch (status) {
            case "success":
                return <CircleCheck className="text-green-500 scale-150 mx-auto mt-5" />;
            case "error":
                return <AlertCircle className="text-red-500 scale-150 mx-auto mt-5" />;
            case "warning":
                return <AlertTriangle className="text-yellow-500 scale-150 mx-auto mt-5" />;
            default:
                return null;
        }
    };

    const getTextColor = () => {
        switch (status) {
            case "success":
                return "text-green-500";
            case "error":
                return "text-red-500";
            case "warning":
                return "text-yellow-500";
            default:
                return "";
        }
    };

    const getButtonColor = () => {
        switch (status) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500 text-black"; // text hitam biar kontras di kuning
            default:
                return "";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center">
            <div data-aos="zoom-in" className="bg-white w-[90%] max-w-sm rounded-lg shadow-lg p-5">
                {getIcon()}
                <p className={`text-center mt-5 text-sm font-medium ${getTextColor()}`}>
                    {message}
                </p>
                <div className="flex justify-center mt-5">
                    <Button onClick={onClose} className={`w-full ${getButtonColor()}`}>
                        {text}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Notification;

import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react"; // Gunakan ikon yang sesuai

interface NotificationProps {
    message: string;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
            <div className="bg-white w-[90%] rounded-lg m-auto p-5">
                <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />
                <p className="text-green-500 text-sm text-center mt-10">{message}</p>
                <div className="flex items-center gap-5 mt-5">
                    <Button onClick={onClose} className="w-full bg-green-400">
                        Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Notification;

import {
    Home,
    ScanQrCode,
    CreditCard,
    UserRound,
    FileText,
    ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import imgNotification from "@/images/notification(404).png";
import AOS from "aos";
import "aos/dist/aos.css";

interface INotification {
    id: number;
    description: string;
    title: string;
    type?: string;
    created_at: Date;
}
const Inbox = () => {
    const [notifications, setNotifications] = useState<INotification[]>([]);

    console.log("Notifications", notifications)

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;
        const fetchNotification = async () => {
            try {
                const response = await axiosInstance.get(`/notifications/${userData.merchant.id}`);
                setNotifications(response.data);
            } catch (error) {
                console.log(error)
            }
        };
        fetchNotification();
    }, []);
    return (
        <div>
            <div className="p-5 w-full bg-orange-400">
                <div className="w-full flex items-center gap-5 justify-between">
                    <div className="flex items-center justify-center w-full gap-5">
                        <Link to={"/dashboard"}><ArrowLeft /></Link>

                        <p data-aos="zoom-in" className="font-semibold m-auto text-white text-2xl">Notifikasi</p>
                    </div>
                </div>
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

                <Link
                    to={"/settlement"}
                    className="flex relative gap-3 flex-col items-center"
                >
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={"/catalog"} className="flex gap-3 flex-col items-center">
                    <FileText />

                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to={"/profile"} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className={`mt-10 w-[90%] m-auto mb-32 ${notifications.length === 0 ? '' : 'border p-5 rounded-md'} `}>
                {
                    notifications.length === 0 && (
                        <div data-aos="fade-up" data-aos-delay="100" className="flex items-center flex-col justify-center gap-10">
                            <img src={imgNotification} className="md:w-5/12 11/12 mt-24" />
                            <p className="text-center text-orange-400 font-bold text-lg">Tidak ada notifikasi</p>
                        </div>
                    )
                }

                {notifications.map((notification, index) => (
                    <div data-aos="fade-up" data-aos-delay={index * 100} key={index}>
                        <div
                            className={`${index === 0 ? "hidden" : "block"
                                } w-full h-[2px] my-5 bg-gray-300`}
                        ></div>

                        <div className="flex items-center gap-5">
                            {/* <img className="w-10 h-10 rounded-full" src={notification.image} alt="" /> */}
                            <div className="w-full">
                                <div className="flex items-center gap-5 justify-between">
                                    <p className="font-semibold text-black">
                                        {notification.title}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {new Intl.DateTimeFormat("id-ID", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        }).format(new Date(notification.created_at))}
                                        , {new Intl.DateTimeFormat("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }).format(new Date(notification.created_at))}
                                    </p>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    {notification.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Inbox;

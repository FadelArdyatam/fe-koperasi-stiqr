import {
    Home,
    ScanQrCode,
    CreditCard,
    UserRound,
    FileText,
    ChevronLeft,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import imgNotification from "@/images/notification(404).png";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";

interface INotification {
    id: number;
    description: string;
    title: string;
    type?: string;
    is_read: boolean;
    created_at: Date;
}
const Inbox = () => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    useEffect(() => {
        const fetchNotification = async () => {
            try {
                const response = await axiosInstance.get(`/notifications/${userData.merchant.id}`, {
                    params: {
                        page: currentPage,
                        limit: 10,
                    }
                });
                setNotifications(response.data.data);
                setTotalPages(response.data.pagination.totalPages)
            } catch (error) {
                console.log(error)
            }
        };
        fetchNotification();
    }, [currentPage]);

    const readNotification = async (id: number) => {
        try {
            await axiosInstance.patch(`/notifications/${userData.merchant.id}/${id}/read`);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id ? { ...notif, is_read: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    return (
        <div>
            <div className="p-5 w-full bg-orange-400">
                <div className="w-full flex items-center gap-5 justify-between">
                    <div className="flex items-center justify-center w-full gap-5">
                        <Link to={"/dashboard"}><ChevronLeft className="text-white scale-[1.2]" /></Link>

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

            <div className={`mt-10 w-[90%] m-auto mb-32 ${notifications.length === 0 ? '' : 'border rounded-md'} `}>
                {
                    notifications.length === 0 && (
                        <div data-aos="fade-up" data-aos-delay="100" className="flex items-center flex-col justify-center gap-10">
                            <img src={imgNotification} className="md:w-5/12 11/12 mt-24" />
                            <p className="text-center text-orange-400 font-bold text-lg">Tidak ada notifikasi</p>
                        </div>
                    )
                }

                {notifications.map((notification, index) => (
                    <div
                        key={notification.id}
                        className="px-5 py-3 cursor-pointer"
                        onClick={(e) => {
                            // Find the animated element and remove AOS attributes
                            const animatedElement = e.currentTarget.querySelector('[data-aos]');
                            if (animatedElement) {
                                animatedElement.removeAttribute('data-aos');
                                animatedElement.removeAttribute('data-aos-delay');
                            }
                            // Call your notification handler
                            readNotification(notification.id);
                        }}
                    >
                        <div
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            title={!notification.is_read ? 'Tandai sudah dibaca' : ''}
                            className={`px-5 py-3 ${!notification.is_read ? 'bg-orange-100 rounded-md' : ''}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-full">
                                    <div className="flex items-center gap-5 justify-between">
                                        <p className="font-semibold text-black">{notification.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Intl.DateTimeFormat("id-ID", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            }).format(new Date(notification.created_at))},
                                            {new Intl.DateTimeFormat("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }).format(new Date(notification.created_at))}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 mb-5">{notification.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-[2px] bg-gray-300"></div>
                    </div>
                ))}

                {
                    notifications.length > 0 && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center mt-12 justify-center gap-5 mb-3 ">
                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                    <ChevronsLeft />
                                </Button>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft />
                                </Button>


                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight />
                                </Button>

                                <Button className="px-2 text-sm sm:text-base sm:px-4 py-2 bg-gray-200 text-black rounded-md disabled:opacity-50" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                    <ChevronsRight />
                                </Button>
                            </div>
                            <span className="text-center">Halaman {currentPage} dari {totalPages}</span>
                        </div>
                    )}

            </div>
        </div>
    );
};

export default Inbox;

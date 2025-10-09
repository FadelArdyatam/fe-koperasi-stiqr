
import React, { useEffect, useState, useCallback } from "react";
import { useAffiliation } from "@/hooks/useAffiliation";
import axiosInstance from "@/hooks/axiosInstance";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ShoppingCart, UserCheck, Check, X } from "lucide-react";
import Notification from "@/components/Notification";


type NotificationType = "TRANSACTION" | "PENDING_APPROVAL";

interface BaseNotification {
  id: string | number;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}

interface TransactionNotification extends BaseNotification {
  type: "TRANSACTION";
}

interface ApprovalNotification extends BaseNotification {
  type: "PENDING_APPROVAL";
  merchantId: string;
}

type UnifiedNotification = TransactionNotification | ApprovalNotification;


const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return Math.floor(seconds) + " detik lalu";
};



const NotificationItem = ({
  notification,
  onMarkRead,
  onApprove,
  onReject,
}: {
  notification: UnifiedNotification;
  onMarkRead: (id: number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  const { id, type, title, description, createdAt, isRead } = notification;

  const icon = {
    TRANSACTION: <ShoppingCart className="w-5 h-5 text-blue-500" />,
    PENDING_APPROVAL: <UserCheck className="w-5 h-5 text-orange-500" />,
  }[type];

  const handleItemClick = () => {
    if (type === "TRANSACTION" && !isRead) {
      onMarkRead(id as number);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`p-3 flex gap-3 border-b transition-colors ${
        !isRead ? "bg-orange-50" : ""
      } ${type === "TRANSACTION" ? "cursor-pointer hover:bg-gray-100" : ""}`}
    >
      <div className="flex-shrink-0 pt-1">{icon}</div>
      <div className="flex-grow">
        <p className={`text-sm font-semibold text-gray-800 ${!isRead && "font-bold"}`}>{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(createdAt)}</p>
        {type === "PENDING_APPROVAL" && (
          <div className="flex gap-2 mt-2">
            <Button size="xs" className="bg-green-500 hover:bg-green-600 h-7" onClick={() => onApprove((notification as ApprovalNotification).merchantId)}>
              <Check className="w-3 h-3 mr-1" /> Setujui
            </Button>
            <Button size="xs" variant="destructive" className="h-7" onClick={() => onReject((notification as ApprovalNotification).merchantId)}>
              <X className="w-3 h-3 mr-1" /> Tolak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-2 animate-pulse p-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start gap-3 p-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="flex-grow space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-3 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);



const NotificationBell: React.FC = () => {
  const { koperasiId } = useAffiliation();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [systemNotification, setSystemNotification] = useState<{ message: string; status: "success" | "error"; } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = useCallback(async (isBackgroundFetch = false) => {
    if (!koperasiId) return;
    if (!isBackgroundFetch) {
        setLoading(true);
    }
    try {
      const [notifRes, approvalRes] = await Promise.all([
        axiosInstance.get(`/koperasi/${koperasiId}/notifications`, { params: { limit: 20 } }),
        axiosInstance.get(`/koperasi/${koperasiId}/pending-approvals`),
      ]);

      const generalNotifs: UnifiedNotification[] = (notifRes.data.data || []).map((n: any) => ({
        id: n.id, type: "TRANSACTION", title: n.title, description: n.description, createdAt: n.created_at, isRead: n.is_read,
      }));

      const approvalNotifs: UnifiedNotification[] = (approvalRes.data || []).map((m: any) => ({
        id: m.id, type: "PENDING_APPROVAL", title: "Persetujuan Anggota Baru", description: `"${m.name}" menunggu persetujuan.`, createdAt: m.created_at, isRead: false, merchantId: m.id,
      }));

      const combined = [...approvalNotifs, ...generalNotifs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(combined);
      
      const totalUnread = combined.filter(n => !n.isRead).length;
      setUnreadCount(totalUnread);

    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      if (!isBackgroundFetch) {
        setLoading(false);
      }
    }
  }, [koperasiId]);

  // Initial fetch for badge count on component mount
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Fetch full data when popover is opened
  useEffect(() => {
    if (isOpen) {
      fetchData(false);
    }
  }, [isOpen, fetchData]);

  const handleMarkRead = async (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await axiosInstance.post(`/koperasi/${koperasiId}/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark as read:", error);

      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: false } : n)));
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleAction = async (action: 'approve' | 'reject', merchantId: string) => {
    const originalNotifications = notifications;
    setNotifications(prev => prev.filter(n => (n as ApprovalNotification).merchantId !== merchantId));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await axiosInstance.post(`/koperasi/${action}-merchant/${merchantId}`);
      setSystemNotification({ message: `Merchant berhasil di${action === 'approve' ? 'setujui' : 'tolak'}`, status: "success" });
    } catch (err: any) {
      setSystemNotification({ message: err.response?.data?.message || `Gagal ${action} merchant`, status: "error" });
      setNotifications(originalNotifications); // Revert on error
      setUnreadCount(prev => prev + 1);
    }
  };

  return (
    <>
      {systemNotification && <Notification message={systemNotification.message} status={systemNotification.status} onClose={() => setSystemNotification(null)} />}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Card className="border-none shadow-none">
            <CardHeader className="border-b p-3">
              <CardTitle className="text-base">Notifikasi</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {loading ? (
                <SkeletonLoader />
              ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={`${n.type}-${n.id}`}
                      notification={n}
                      onMarkRead={handleMarkRead}
                      onApprove={(merchantId) => handleAction('approve', merchantId)}
                      onReject={(merchantId) => handleAction('reject', merchantId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p className="text-sm">Tidak ada notifikasi baru.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default NotificationBell;

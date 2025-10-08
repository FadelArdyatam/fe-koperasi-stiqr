import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAffiliation } from "@/hooks/useAffiliation";
import axiosInstance from "@/hooks/axiosInstance";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Bell,
  ShoppingCart,
  UserCheck,
  Check,
  X,
} from "lucide-react";
import Notification from "@/components/Notification";

// --- Interfaces ---
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

// --- Helper Functions ---
const timeAgo = (date: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
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

// --- Sub-Components ---

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
      className={`p-4 flex gap-4 border-b transition-colors ${
        !isRead ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-gray-50"
      } ${type === "TRANSACTION" ? "cursor-pointer" : ""}`}
    >
      {!isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      )}
      <div className={`flex-shrink-0 ${isRead ? "ml-4" : ""}`}>{icon}</div>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(createdAt)}</p>
        {type === "PENDING_APPROVAL" && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600"
              onClick={() =>
                onApprove((notification as ApprovalNotification).merchantId)
              }
            >
              <Check className="w-4 h-4 mr-1" /> Setujui
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                onReject((notification as ApprovalNotification).merchantId)
              }
            >
              <X className="w-4 h-4 mr-1" /> Tolak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-start gap-4 p-4 border-b">
        <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="flex-grow space-y-2">
          <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Component ---

const Notifikasi: React.FC = () => {
  const navigate = useNavigate();
  const { koperasiId } = useAffiliation();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemNotification, setSystemNotification] = useState<{
    message: string;
    status: "success" | "error";
  } | null>(null);

  const fetchData = useCallback(async () => {
    if (!koperasiId) return;
    setLoading(true);
    try {
      const [notifRes, approvalRes] = await Promise.all([
        axiosInstance.get(`/koperasi/${koperasiId}/notifications`, {
          params: { limit: 50 },
        }),
        axiosInstance.get(`/koperasi/${koperasiId}/pending-approvals`),
      ]);

      const generalNotifs: UnifiedNotification[] = (
        notifRes.data.data || []
      ).map((n: any) => ({
        id: n.id,
        type: "TRANSACTION",
        title: n.title,
        description: n.description,
        createdAt: n.created_at,
        isRead: n.is_read,
      }));

      const approvalNotifs: UnifiedNotification[] = (
        approvalRes.data || []
      ).map((m: any) => ({
        id: m.id, // merchant id
        type: "PENDING_APPROVAL",
        title: "Persetujuan Anggota Baru",
        description: `Merchant "${m.name}" (${m.email}) menunggu persetujuan Anda untuk bergabung.`,
        createdAt: m.created_at,
        isRead: false, // Actionable notifications are always considered "unread"
        merchantId: m.id,
      }));

      const combined = [...approvalNotifs, ...generalNotifs];
      combined.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(combined);
    } catch (err: any) {
      setSystemNotification({
        message: err.response?.data?.message || "Gagal memuat notifikasi",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [koperasiId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await axiosInstance.post(
        `/koperasi/${koperasiId}/notifications/${id}/read`
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleApprove = async (merchantId: string) => {
    try {
      await axiosInstance.post(
        `/koperasi/${koperasiId}/approve-merchant/${merchantId}`
      );
      setSystemNotification({
        message: "Merchant berhasil disetujui",
        status: "success",
      });
      setNotifications((prev) =>
        prev.filter(
          (n) => (n as ApprovalNotification).merchantId !== merchantId
        )
      );
    } catch (err: any) {
      setSystemNotification({
        message: err.response?.data?.message || "Gagal menyetujui merchant",
        status: "error",
      });
    }
  };

  const handleReject = async (merchantId: string) => {
    try {
      await axiosInstance.post(
        `/koperasi/${koperasiId}/reject-merchant/${merchantId}`
      );
      setSystemNotification({
        message: "Merchant berhasil ditolak",
        status: "success",
      });
      setNotifications((prev) =>
        prev.filter(
          (n) => (n as ApprovalNotification).merchantId !== merchantId
        )
      );
    } catch (err: any) {
      setSystemNotification({
        message: err.response?.data?.message || "Gagal menolak merchant",
        status: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {systemNotification && (
        <Notification
          message={systemNotification.message}
          status={systemNotification.status}
          onClose={() => setSystemNotification(null)}
        />
      )}
      <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" /> Notifikasi
        </h1>
      </header>

      <main>
        <Card className="m-4 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <SkeletonLoader />
            ) : notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((n) => (
                  <NotificationItem
                    key={`${n.type}-${n.id}`}
                    notification={n}
                    onMarkRead={handleMarkRead}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-16 text-gray-500">
                <Bell className="w-16 h-16 mx-auto" />
                <p className="mt-2 font-semibold">Tidak ada notifikasi</p>
                <p className="text-sm">
                  Semua notifikasi Anda akan muncul di sini.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Notifikasi;

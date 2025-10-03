import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/hooks/axiosInstance";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Home,
  ScanQrCode,
  CreditCard,
  FileText,
  UserRound,
  Building2,
  User,
  Mail,
  Phone,
  Check,
  X,
  Fingerprint,
  Info,
  Camera,
  Briefcase,
  BadgeHelp,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- Helper Components ---
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "PENDING":
        return "border-yellow-300 bg-yellow-50 text-yellow-800";
      case "APPROVED":
        return "border-green-300 bg-green-50 text-green-800";
      case "REJECTED":
        return "border-red-300 bg-red-50 text-red-800";
      default:
        return "border-gray-300 bg-gray-50 text-gray-800";
    }
  };
  return (
    <span
      className={`px-3 py-1 inline-block rounded-full text-xs font-semibold border ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

const DataField = ({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <p className="text-xs font-medium">{label}</p>
    </div>
    <div className="text-base font-semibold text-gray-800 break-words mt-1 pl-6">
      {children || value || "-"}
    </div>
  </div>
);

const DetailAnggota: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      const res = await axiosInstance.get(`/koperasi/member/${id}`);
      setDetail(res.data);
    } catch (e) {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleAction = async (action: "approve" | "reject") => {
    setActionLoading(true);
    try {
      await axiosInstance.post(`/koperasi/${action}/${id}`);
      await fetchDetail();
    } catch (error) {
      console.error(`Failed to ${action} member`, error);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Skeleton Component ---
  const MemberDetailSkeleton = () => (
    <div className="pb-28 p-4 bg-gray-50 min-h-screen animate-pulse">
      <header className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
      </header>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-16 w-full bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return <MemberDetailSkeleton />;
  }

  if (!detail) {
    return (
      <div className="flex justify-center items-center h-screen">
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div className="pb-28 bg-gray-50 min-h-screen">
      <header className="p-4 flex items-center gap-4 mb-0 bg-white border-b sticky top-0 z-20">
        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold truncate">Detail Anggota</h1>
      </header>

      <div className="p-4 space-y-4">
        {detail.approval_status === "PENDING" && (
          <Card className="bg-yellow-50 border-yellow-200 shadow-none">
            <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-yellow-900">
                  Tindakan Diperlukan
                </CardTitle>
                <CardDescription className="text-yellow-800">
                  Anggota ini sedang menunggu persetujuan Anda.
                </CardDescription>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Tolak
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Anda yakin ingin menolak anggota ini?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleAction("reject")}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Ya, Tolak
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Setujui
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Anda yakin ingin menyetujui anggota ini?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleAction("approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Ya, Setujui
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-bold text-gray-900">
                {detail.name}
              </h2>
              <p className="text-base text-gray-600">{detail.email}</p>
              <div className="pt-3">
                <StatusBadge status={detail.approval_status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataField
                icon={<Phone size={14} />}
                label="No. Handphone"
                value={detail.phone_number}
              />
              <DataField
                icon={<Building2 size={14} />}
                label="Koperasi"
                value={detail.koperasi?.nama_koperasi}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Akun Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataField
                icon={<User size={14} />}
                label="Username"
                value={detail.user?.username}
              />
              <DataField
                icon={<Mail size={14} />}
                label="Email Akun"
                value={detail.user?.email}
              />
              <DataField
                icon={<Phone size={14} />}
                label="No. HP Akun"
                value={detail.user?.phone_number}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Pengajuan QRIS</CardTitle>
            <CardDescription>
              Informasi yang relevan dari pengajuan QRIS.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {!detail.Qris_Submission ? (
              <p className="text-sm text-gray-500 col-span-full text-center py-4">
                Tidak ada data pengajuan QRIS.
              </p>
            ) : (
              <>
                <DataField
                  icon={<Fingerprint size={14} />}
                  label="Merchant ID"
                  value={detail.Qris_Submission.merchant_id}
                />
                <DataField
                  icon={<Fingerprint size={14} />}
                  label="Submission ID"
                  value={detail.Qris_Submission.qris_submission_id}
                />
                <DataField
                  icon={<BadgeHelp size={14} />}
                  label="Status Pengajuan"
                >
                  <StatusBadge
                    status={
                      detail.Qris_Submission.status.toUpperCase() === "OPEN"
                        ? "APPROVED"
                        : "REJECTED"
                    }
                  />
                </DataField>
                <DataField icon={<Camera size={14} />} label="Foto KTP">
                  {detail.Qris_Submission.ktp ? (
                    <Button asChild variant="link" className="p-0 h-auto">
                      <a
                        href={detail.Qris_Submission.ktp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat File
                      </a>
                    </Button>
                  ) : (
                    <span>-</span>
                  )}
                </DataField>
                <DataField icon={<Camera size={14} />} label="Foto NPWP">
                  {detail.Qris_Submission.npwp ? (
                    <Button asChild variant="link" className="p-0 h-auto">
                      <a
                        href={detail.Qris_Submission.npwp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat File
                      </a>
                    </Button>
                  ) : (
                    <span>-</span>
                  )}
                </DataField>
                <DataField icon={<Briefcase size={14} />} label="Foto Usaha">
                  {detail.Qris_Submission.bussiness_photo ? (
                    <Button asChild variant="link" className="p-0 h-auto">
                      <a
                        href={detail.Qris_Submission.bussiness_photo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat File
                      </a>
                    </Button>
                  ) : (
                    <span>-</span>
                  )}
                </DataField>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navbar */}
      <div
        id="navbar"
        className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10"
      >
        <Link
          to={"/dashboard"}
          className="flex gap-3 text-orange-400 flex-col items-center"
        >
          <Home />
          <p className="uppercase">Home</p>
        </Link>
        <Link to={"/qr-code"} className="flex gap-3 flex-col items-center">
          <ScanQrCode />
          <p className="uppercase">Qr Code</p>
        </Link>
        <Link
          to={"/settlement"}
          data-cy="penarikan-btn"
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
        <Link
          to={"/profile"}
          className="flex gap-3 flex-col items-center"
          data-cy="profile-link"
        >
          <UserRound />
          <p className="uppercase">Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default DetailAnggota;

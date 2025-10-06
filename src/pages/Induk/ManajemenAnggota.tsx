import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { useAffiliation } from '@/hooks/useAffiliation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, ScanQrCode, CreditCard, FileText, UserRound,  Search, ChevronDown, ArrowLeft, Users } from 'lucide-react';

// Helper component for status badges
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'PENDING': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
            case 'APPROVED': return 'border-green-300 bg-green-50 text-green-800';
            case 'REJECTED': return 'border-red-300 bg-red-50 text-red-800';
            default: return 'border-gray-300 bg-gray-50 text-gray-800';
        }
    };
    return (
        <span className={`px-2.5 py-0.5 inline-block rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
            {status}
        </span>
    );
};

const ManajemenAnggota: React.FC = () => {
    const { data } = useAffiliation();
    const navigate = useNavigate();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [status, setStatus] = useState<string>('');
    const [statusLabel, setStatusLabel] = useState('Semua Status');

    const fetchMembers = useCallback(async () => {
        if (!data?.koperasi?.id) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            const params: any = {};
            if (q) params.q = q;
            if (status) params.status = status;
            const res = await axiosInstance.get(`/koperasi/${data.koperasi.id}/members`, { params });
            setMembers(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [data?.koperasi?.id, q, status]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (data?.koperasi?.id) {
                fetchMembers();
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [q, status, data?.koperasi?.id, fetchMembers]);

    const handleStatusSelect = (value: string, label: string) => {
        setStatus(value);
        setStatusLabel(label);
    };

    const MemberSkeletonCard = () => (
        <Card className="animate-pulse">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                        <div className="h-5 w-3/5 bg-gray-200 rounded"></div>
                        <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                        <div className="h-4 w-2/5 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-1/4 max-w-[100px] bg-gray-200 rounded-full"></div>
                </div>
            </CardContent>
        </Card>
    );
    
    const EmptyState = () => (
        <div className="text-center py-16 px-4 bg-white rounded-lg border">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak Ada Anggota</h3>
            <p className="mt-1 text-sm text-gray-500">Belum ada anggota yang terdaftar atau sesuai dengan filter Anda.</p>
        </div>
    );

    const MemberCard = ({ member }: { member: any }) => (
        <Card 
            className="hover:shadow-md hover:border-orange-300 transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/induk/detail-anggota/${member.id}`)}
        >
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate text-lg">{member.name}</p>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    <p className="text-sm font-mono text-gray-600 truncate">{member.phone_number}</p>
                </div>
                <div className="flex-shrink-0">
                    <StatusBadge status={member.approval_status} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="pb-28 bg-gray-50 min-h-screen">
            <header className="p-4 flex items-center gap-4 mb-0 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Anggota Koperasi</h1>
            </header>

            <div className="p-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Anggota</CardTitle>
                        <CardDescription>Cari atau filter anggota berdasarkan status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email..." className="pl-10" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto justify-between min-w-[180px]">
                                        {statusLabel}
                                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleStatusSelect('', 'Semua Status')}>Semua Status</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusSelect('PENDING', 'Pending')}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusSelect('APPROVED', 'Approved')}>Approved</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusSelect('REJECTED', 'Rejected')}>Rejected</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {loading ? (
                        <>
                            <MemberSkeletonCard />
                            <MemberSkeletonCard />
                            <MemberSkeletonCard />
                        </>
                    ) : members.length > 0 ? (
                        members.map((m) => (
                            <MemberCard key={m.id} member={m} />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>

            {/* Bottom Navbar */}
            <div id="navbar" className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>
                <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>
                <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </div>
    );
};

export default ManajemenAnggota;
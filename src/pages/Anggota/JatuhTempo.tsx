import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import { useDueDate } from '@/hooks/useDueDate';
import DueDateCard from '@/components/DueDateCard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Notification from '@/components/Notification';

const JatuhTempo: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId } = useAffiliation();
    const { dueDates, summary, loading, error, refetch } = useDueDate(koperasiId);
    const [activeTab, setActiveTab] = useState('pending');

    const getStatusCounts = () => {
        const pending = dueDates.filter(dd => dd.status === 'PENDING').length;
        const paid = dueDates.filter(dd => dd.status === 'PAID').length;
        const expired = dueDates.filter(dd => dd.status === 'EXPIRED').length;
        return { pending, paid, expired };
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'PAID': return <CheckCircle className="w-4 h-4" />;
            case 'EXPIRED': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'EXPIRED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePayDueDate = (dueDate: any) => {
        // Navigate to simpanan page with pre-filled form
        navigate('/anggota/simpanan', { 
            state: { 
                prefillForm: {
                    amount: dueDate.amount_required.toString(),
                    type: dueDate.saving_type,
                    notes: `Pembayaran jatuh tempo ${dueDate.saving_type} - ${new Date(dueDate.due_date).toLocaleDateString('id-ID')}`
                }
            }
        });
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <div className="pb-32 bg-gray-50 min-h-screen font-sans">
                <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
                    <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-bold truncate">Jatuh Tempo Simpanan</h1>
                </header>
                <div className="p-4 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-32 bg-gray-50 min-h-screen font-sans">
            {error && <Notification message={error} status="error" onClose={() => {}} />}
            
            <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold truncate">Jatuh Tempo Simpanan</h1>
            </header>

            <div className="p-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="text-center">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-gray-600">Belum Dibayar</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-600">Sudah Dibayar</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{statusCounts.paid}</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-gray-600">Terlambat</span>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{statusCounts.expired}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Belum Dibayar ({statusCounts.pending})
                        </TabsTrigger>
                        <TabsTrigger value="paid" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Sudah Dibayar ({statusCounts.paid})
                        </TabsTrigger>
                        <TabsTrigger value="expired" className="flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Terlambat ({statusCounts.expired})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-3 mt-4">
                        {dueDates.filter(dd => dd.status === 'PENDING').length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Tidak ada jatuh tempo yang belum dibayar</p>
                                </CardContent>
                            </Card>
                        ) : (
                            dueDates.filter(dd => dd.status === 'PENDING').map((dueDate) => (
                                <DueDateCard
                                    key={dueDate.id}
                                    dueDate={dueDate}
                                    onPayNow={() => handlePayDueDate(dueDate)}
                                    showActions={true}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="paid" className="space-y-3 mt-4">
                        {dueDates.filter(dd => dd.status === 'PAID').length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Belum ada pembayaran jatuh tempo</p>
                                </CardContent>
                            </Card>
                        ) : (
                            dueDates.filter(dd => dd.status === 'PAID').map((dueDate) => (
                                <DueDateCard
                                    key={dueDate.id}
                                    dueDate={dueDate}
                                    showActions={false}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="expired" className="space-y-3 mt-4">
                        {dueDates.filter(dd => dd.status === 'EXPIRED').length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Tidak ada jatuh tempo yang terlambat</p>
                                </CardContent>
                            </Card>
                        ) : (
                            dueDates.filter(dd => dd.status === 'EXPIRED').map((dueDate) => (
                                <DueDateCard
                                    key={dueDate.id}
                                    dueDate={dueDate}
                                    onPayNow={() => handlePayDueDate(dueDate)}
                                    showActions={true}
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>

                {/* Refresh Button */}
                <div className="flex justify-center pt-4">
                    <Button 
                        variant="outline" 
                        onClick={refetch}
                        disabled={loading}
                    >
                        {loading ? 'Memuat...' : 'Refresh Data'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default JatuhTempo;

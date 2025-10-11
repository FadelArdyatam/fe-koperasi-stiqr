import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';
import { formatRupiah } from '@/hooks/convertRupiah';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Plus, Search, AlertTriangle, CheckCircle, Clock, XCircle, Users, DollarSign } from 'lucide-react';
import Notification from '@/components/Notification';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DueDate {
  id: string;
  due_date: string;
  amount_required: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  saving_type: 'POKOK' | 'WAJIB' | 'SUKARELA';
  paid_at?: string;
  expired_at?: string;
  next_due_date?: string;
  created_at: string;
  member: {
    id: string;
    Merchant: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
}

interface DueDateSummary {
  pending: number;
  expired: number;
  upcoming: number;
  total: number;
}

interface CreateDueDateForm {
  amountRequired: string;
  dueDate: string;
  savingType: 'POKOK' | 'WAJIB' | 'SUKARELA';
  memberId?: string;
  createForAll: boolean;
}

const ManajemenJatuhTempo: React.FC = () => {
  const navigate = useNavigate();
  const { koperasiId } = useAffiliation();

  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [summary, setSummary] = useState<DueDateSummary | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDueDateForm>({
    amountRequired: '',
    dueDate: '',
    savingType: 'WAJIB',
    createForAll: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (koperasiId) {
      fetchData();
    }
  }, [koperasiId]);

  const fetchData = async () => {
    if (!koperasiId) return;
    
    setLoading(true);
    try {
      const [dueDatesRes, summaryRes, membersRes] = await Promise.all([
        axiosInstance.get(`/koperasi-due-date/${koperasiId}`, {
          params: { limit: 100, offset: 0 }
        }),
        axiosInstance.get(`/koperasi-due-date/${koperasiId}/summary`),
        axiosInstance.get(`/koperasi-simpan-pinjam/${koperasiId}/members/balance`)
      ]);

      setDueDates(dueDatesRes.data.data || []);
      setSummary(summaryRes.data);
      setMembers(membersRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data jatuh tempo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDueDate = async () => {
    if (!koperasiId) return;
    
    setSubmitting(true);
    try {
      const payload = {
        amountRequired: parseFloat(createForm.amountRequired),
        dueDate: createForm.dueDate,
        savingType: createForm.savingType
      };

      if (createForm.createForAll) {
        await axiosInstance.post(`/koperasi-due-date/${koperasiId}/create-all`, payload);
      } else if (createForm.memberId) {
        await axiosInstance.post(`/koperasi-due-date/${koperasiId}/create`, {
          ...payload,
          memberId: createForm.memberId
        });
      }

      setShowCreateModal(false);
      setCreateForm({
        amountRequired: '',
        dueDate: '',
        savingType: 'WAJIB',
        createForAll: true
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat jadwal jatuh tempo');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Belum Dibayar'
        };
      case 'PAID':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800',
          label: 'Sudah Dibayar'
        };
      case 'EXPIRED':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800',
          label: 'Terlambat'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800',
          label: 'Unknown'
        };
    }
  };

  const getSavingTypeLabel = (type: string) => {
    switch (type) {
      case 'POKOK': return 'Simpanan Pokok';
      case 'WAJIB': return 'Simpanan Wajib';
      case 'SUKARELA': return 'Simpanan Sukarela';
      default: return type;
    }
  };

  const filteredDueDates = dueDates.filter(dd => {
    const matchesSearch = !searchTerm || 
                         dd.member?.Merchant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dd.member?.Merchant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || dd.status === activeTab.toUpperCase();
    return matchesSearch && matchesTab;
  });

  const statusCounts = {
    pending: dueDates.filter(dd => dd.status === 'PENDING').length,
    paid: dueDates.filter(dd => dd.status === 'PAID').length,
    expired: dueDates.filter(dd => dd.status === 'EXPIRED').length,
    total: dueDates.length
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen font-sans">
      {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
      
      <header className="p-4 flex items-center gap-4 mb-4 bg-white border-b sticky top-0 z-20">
        <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold truncate">Manajemen Jatuh Tempo</h1>
        <Button 
          className="ml-auto"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Jadwal
        </Button>
      </header>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama member atau email..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Semua ({statusCounts.total})</TabsTrigger>
            <TabsTrigger value="pending">Belum Dibayar ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="paid">Sudah Dibayar ({statusCounts.paid})</TabsTrigger>
            <TabsTrigger value="expired">Terlambat ({statusCounts.expired})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
              ))
            ) : filteredDueDates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada data jatuh tempo</p>
                </CardContent>
              </Card>
            ) : (
              filteredDueDates.map((dueDate) => {
                const statusInfo = getStatusInfo(dueDate.status);
                const isOverdue = dueDate.status === 'PENDING' && new Date(dueDate.due_date) < new Date();
                
                return (
                  <Card key={dueDate.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{dueDate.member?.Merchant?.name || 'Nama tidak tersedia'}</h3>
                            <p className="text-sm text-gray-500">{dueDate.member?.Merchant?.email || '-'}</p>
                          </div>
                        </div>
                        <Badge className={`${statusInfo.color} border-0`}>
                          <div className="flex items-center gap-1">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Jenis:</span>
                          <p className="font-medium">{getSavingTypeLabel(dueDate.saving_type)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jumlah:</span>
                          <p className="font-medium">{formatRupiah(dueDate.amount_required)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jatuh Tempo:</span>
                          <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                            {new Date(dueDate.due_date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                            {isOverdue ? 'Terlambat' : 'Aktif'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Due Date Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Jadwal Jatuh Tempo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Jenis Simpanan</Label>
              <select
                value={createForm.savingType}
                onChange={(e) => setCreateForm(f => ({...f, savingType: e.target.value as any}))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="POKOK">Simpanan Pokok</option>
                <option value="WAJIB">Simpanan Wajib</option>
                <option value="SUKARELA">Simpanan Sukarela</option>
              </select>
            </div>
            
            <div>
              <Label>Jumlah Wajib</Label>
              <Input
                type="number"
                value={createForm.amountRequired}
                onChange={(e) => setCreateForm(f => ({...f, amountRequired: e.target.value}))}
                placeholder="Masukkan jumlah"
              />
            </div>
            
            <div>
              <Label>Tanggal Jatuh Tempo</Label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm(f => ({...f, dueDate: e.target.value}))}
              />
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.createForAll}
                  onChange={(e) => setCreateForm(f => ({...f, createForAll: e.target.checked}))}
                />
                Buat untuk semua member aktif
              </Label>
            </div>
            
            {!createForm.createForAll && (
              <div>
                <Label>Pilih Member</Label>
                <select
                  value={createForm.memberId || ''}
                  onChange={(e) => setCreateForm(f => ({...f, memberId: e.target.value}))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Pilih member</option>
                  {members.map(member => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateDueDate} disabled={submitting}>
              {submitting ? 'Membuat...' : 'Buat Jadwal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenJatuhTempo;

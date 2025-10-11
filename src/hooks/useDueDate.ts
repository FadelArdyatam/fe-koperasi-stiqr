import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

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
  updated_at: string;
}

interface DueDateSummary {
  pending: number;
  expired: number;
  upcoming: number;
  total: number;
}

interface UseDueDateReturn {
  dueDates: DueDate[];
  summary: DueDateSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getMyDueDates: () => Promise<void>;
  getDueDateSummary: () => Promise<void>;
}

export const useDueDate = (koperasiId?: string): UseDueDateReturn => {
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [summary, setSummary] = useState<DueDateSummary | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState<string | null>(null);

  const getMyDueDates = async () => {
    console.log('getMyDueDates called with koperasiId:', koperasiId);
    
    if (!koperasiId) {
      console.log('No koperasiId, setting loading to false');
      setLoading(false);
      return;
    }
    
    console.log('Starting to fetch due dates...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching due dates for koperasiId:', koperasiId);
      console.log('User data from session:', sessionStorage.getItem('user'));
      
      // Gunakan endpoint yang benar untuk member
      const response = await axiosInstance.get('/koperasi-due-date/my-due-dates', {
        params: {
          limit: 50,
          offset: 0
        }
      });
      
      console.log('Due dates response:', response.data);
      console.log('Due dates data array:', response.data.data);
      console.log('Due dates count:', response.data.data?.length || 0);
      
      setDueDates(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching due dates:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || err.message || 'Gagal memuat data jatuh tempo');
      setDueDates([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getDueDateSummary = async () => {
    if (!koperasiId) return;
    
    try {
      const response = await axiosInstance.get(`/koperasi-due-date/${koperasiId}/summary`);
      setSummary(response.data);
    } catch (err: any) {
      console.error('Error fetching due date summary:', err);
    }
  };

  const refetch = async () => {
    await Promise.all([
      getMyDueDates(),
      getDueDateSummary()
    ]);
  };

  useEffect(() => {
    console.log('useDueDate useEffect triggered with koperasiId:', koperasiId);
    if (koperasiId) {
      console.log('Calling refetch...');
      refetch();
    } else {
      console.log('No koperasiId, setting loading to false');
      setLoading(false);
    }
  }, [koperasiId]);

  return {
    dueDates,
    summary,
    loading,
    error,
    refetch,
    getMyDueDates,
    getDueDateSummary
  };
};

export default useDueDate;

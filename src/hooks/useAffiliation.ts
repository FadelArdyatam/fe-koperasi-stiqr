import { useEffect, useState } from 'react';
import axiosInstance from '@/hooks/axiosInstance';

export type AffiliationResponse = {
  merchantId?: string;
  affiliation?: 'UMUM' | 'KOPERASI_INDUK' | 'KOPERASI_ANGGOTA';
  approval_status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  koperasi?: { id: string; nama_koperasi: string } | null;
};

export function useAffiliation() {
  const [data, setData] = useState<AffiliationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliation = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log('[useAffiliation] Token:', token);
    if (!token) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('[useAffiliation] Fetching affiliation...');
      const res = await axiosInstance.get('/koperasi/affiliation/me');
      console.log('[useAffiliation] Raw response:', res);
      console.log('[useAffiliation] Response data:', res.data);
      console.log('[useAffiliation] Response status:', res.status);
      setData(res.data ?? null);
    } catch (e: any) {
      console.error('[useAffiliation] Error:', e);
      console.error('[useAffiliation] Error response:', e.response);
      console.error('[useAffiliation] Error message:', e.message);
      
      // Fallback: try to get affiliation from JWT token
      try {
        console.log('[useAffiliation] Trying JWT fallback...');
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('[useAffiliation] JWT payload:', payload);
          const fallbackData = {
            merchantId: payload.merchant_id,
            affiliation: payload.affiliation || 'UMUM',
            approval_status: payload.approval_status || 'APPROVED',
            koperasi: payload.koperasi_id ? {
              id: payload.koperasi_id,
              nama_koperasi: payload.koperasi_name
            } : null
          };
          console.log('[useAffiliation] Fallback data:', fallbackData);
          setData(fallbackData);
          return;
        }
      } catch (jwtErr) {
        console.error('[useAffiliation] JWT decode error:', jwtErr);
      }
      
      // Try debug endpoint
      try {
        console.log('[useAffiliation] Trying debug endpoint...');
        const debugRes = await axiosInstance.get('/koperasi/debug/me');
        console.log('[useAffiliation] Debug response:', debugRes.data);
      } catch (debugErr) {
        console.error('[useAffiliation] Debug error:', debugErr);
      }
      setError(e?.response?.data?.message || 'Failed to fetch affiliation');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when token changes
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetchAffiliation();
    } else {
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof window !== 'undefined' ? localStorage.getItem('token') : null]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAffiliation,
    // Convenience getters
    affiliation: data?.affiliation,
    koperasiId: data?.koperasi?.id,
    merchantId: data?.merchantId,
    approvalStatus: data?.approval_status
  };
}
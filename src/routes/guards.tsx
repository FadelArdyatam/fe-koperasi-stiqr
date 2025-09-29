import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';

export const RequireIndukKoperasi: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, loading, error } = useAffiliation();
  console.log('[RequireIndukKoperasi] ===== DEBUG START =====');
  console.log('[RequireIndukKoperasi] data:', data);
  console.log('[RequireIndukKoperasi] loading:', loading);
  console.log('[RequireIndukKoperasi] error:', error);
  console.log('[RequireIndukKoperasi] data?.affiliation:', data?.affiliation);
  console.log('[RequireIndukKoperasi] data?.affiliation === "KOPERASI_INDUK":', data?.affiliation === 'KOPERASI_INDUK');
  
  // Check JWT token as fallback
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let jwtAffiliation = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      jwtAffiliation = payload.affiliation;
      console.log('[RequireIndukKoperasi] JWT affiliation:', jwtAffiliation);
    } catch (e) {
      console.error('[RequireIndukKoperasi] JWT decode error:', e);
    }
  }
  
  console.log('[RequireIndukKoperasi] ===== DEBUG END =====');
  
  if (loading) {
    console.log('[RequireIndukKoperasi] Still loading...');
    return <div>Loading...</div>;
  }
  
  // Check both API data and JWT token
  const hasAccess = data?.affiliation === 'KOPERASI_INDUK' || jwtAffiliation === 'KOPERASI_INDUK';
  
  if (hasAccess) {
    console.log('[RequireIndukKoperasi] ✅ Access granted, rendering children');
    return <>{children}</>;
  }
  
  console.log('[RequireIndukKoperasi] ❌ Access denied, redirecting to dashboard');
  console.log('[RequireIndukKoperasi] API affiliation:', data?.affiliation);
  console.log('[RequireIndukKoperasi] JWT affiliation:', jwtAffiliation);
  return <Navigate to="/dashboard" replace />;
};

export const RequireAnggotaKoperasi: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, loading } = useAffiliation();
  if (loading) return <div>Loading...</div>;
  if (data?.affiliation === 'KOPERASI_ANGGOTA') return <>{children}</>;
  return <Navigate to="/dashboard" replace />;
};

export const RequireUmum: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, loading } = useAffiliation();
  if (loading) return <div>Loading...</div>;
  if (!data || data?.affiliation === 'UMUM') return <>{children}</>;
  // If koperasi, redirect to appropriate dashboard
  if (data?.affiliation === 'KOPERASI_INDUK') return <Navigate to="/koperasi-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};
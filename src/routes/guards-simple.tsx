import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple route guard that only checks JWT token
export const RequireIndukKoperasiSimple: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    console.log('[RequireIndukKoperasiSimple] No token found, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('[RequireIndukKoperasiSimple] JWT payload:', payload);
    console.log('[RequireIndukKoperasiSimple] JWT affiliation:', payload.affiliation);
    
    if (payload.affiliation === 'KOPERASI_INDUK') {
      console.log('[RequireIndukKoperasiSimple] ✅ Access granted via JWT');
      return <>{children}</>;
    }
    
    console.log('[RequireIndukKoperasiSimple] ❌ Access denied, affiliation:', payload.affiliation);
    return <Navigate to="/dashboard" replace />;
  } catch (e) {
    console.error('[RequireIndukKoperasiSimple] JWT decode error:', e);
    return <Navigate to="/dashboard" replace />;
  }
};

export const RequireAnggotaKoperasiSimple: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('[RequireAnggotaKoperasiSimple] JWT payload:', payload);
    console.log('[RequireAnggotaKoperasiSimple] affiliation:', payload.affiliation);
    console.log('[RequireAnggotaKoperasiSimple] approval_status:', payload.approval_status);
    
    if (payload.affiliation === 'KOPERASI_ANGGOTA') {
      // Check approval status
      if (payload.approval_status === 'APPROVED') {
        console.log('[RequireAnggotaKoperasiSimple] ✅ Access granted - approved member');
        return <>{children}</>;
      } else {
        console.log('[RequireAnggotaKoperasiSimple] ❌ Access denied - pending/rejected member');
        return <Navigate to="/access-info" replace />;
      }
    }
    
    console.log('[RequireAnggotaKoperasiSimple] ❌ Access denied - not a member');
    return <Navigate to="/dashboard" replace />;
  } catch (e) {
    console.error('[RequireAnggotaKoperasiSimple] JWT decode error:', e);
    return <Navigate to="/dashboard" replace />;
  }
};

export const RequireUmumSimple: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    return <>{children}</>;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.affiliation || payload.affiliation === 'UMUM') {
      return <>{children}</>;
    }
    // If koperasi, redirect to appropriate dashboard
    if (payload.affiliation === 'KOPERASI_INDUK') {
      return <Navigate to="/koperasi-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  } catch (e) {
    return <>{children}</>;
  }
};

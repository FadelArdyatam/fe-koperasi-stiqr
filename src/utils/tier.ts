import { AuthClaims, EffectiveTier } from '../types/auth';

export function getEffectiveTier(claims: AuthClaims | null, koperasiId: string): EffectiveTier {
  if (!claims) return 'UMUM';
  
  const membership = claims.koperasiMemberships?.find(
    m => m.id_koperasi === koperasiId && m.status_member === 'ACTIVE'
  );
  
  if (!membership) return 'UMUM';
  
  return membership.jenis_member === 'MEMBER_USAHA' ? 'MEMBER_USAHA' : 'MEMBER';
}

export function isKoperasiOwner(claims: AuthClaims | null, koperasiId: string): boolean {
  if (!claims) return false;
  
  return claims.ownedKoperasi?.some(k => k.id === koperasiId && k.is_active) ?? false;
}

export function getTierLabel(tier: EffectiveTier): string {
  switch (tier) {
    case 'UMUM': return 'Harga Umum';
    case 'MEMBER': return 'Harga Anggota';
    case 'MEMBER_USAHA': return 'Harga Usaha';
    default: return 'Harga Umum';
  }
}

export function getTierColor(tier: EffectiveTier): string {
  switch (tier) {
    case 'UMUM': return 'text-gray-600';
    case 'MEMBER': return 'text-blue-600';
    case 'MEMBER_USAHA': return 'text-green-600';
    default: return 'text-gray-600';
  }
}
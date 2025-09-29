export type MembershipClaim = {
  id_koperasi: string;
  status_member: 'PENDING' | 'ACTIVE' | 'REJECTED';
  jenis_member?: 'MEMBER' | 'MEMBER_USAHA';
  koperasi?: {
    nama_koperasi: string;
    is_active: boolean;
  };
};

export type AuthClaims = {
  id: number;
  email: string;
  username: string;
  login_as: 'users' | 'employees';
  merchant_id?: string;
  koperasiMemberships: MembershipClaim[];
  ownedKoperasi: Array<{
    id: string;
    nama_koperasi: string;
    is_active: boolean;
  }>;
  is_first_login: boolean;
};

export type EffectiveTier = 'UMUM' | 'MEMBER' | 'MEMBER_USAHA';
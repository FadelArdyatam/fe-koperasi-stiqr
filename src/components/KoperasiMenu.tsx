import React from 'react';
import { AuthClaims } from '../types/auth';
import { getEffectiveTier, isKoperasiOwner } from '../utils/tier';

interface KoperasiMenuProps {
  koperasiId: string;
  claims: AuthClaims | null;
  currentPath?: string;
}

export const KoperasiMenu: React.FC<KoperasiMenuProps> = ({ 
  koperasiId, 
  claims, 
  currentPath 
}) => {
  const tier = getEffectiveTier(claims, koperasiId);
  const isOwner = isKoperasiOwner(claims, koperasiId);

  const menuItems = [
    {
      label: 'Katalog',
      href: `/koperasi/${koperasiId}/catalog`,
      icon: '📦',
      show: true
    },
    {
      label: 'Riwayat Pembelian',
      href: '/orders',
      icon: '📋',
      show: true
    },
    {
      label: 'Promo Anggota',
      href: `/koperasi/${koperasiId}/promo`,
      icon: '🎁',
      show: tier !== 'UMUM'
    },
    {
      label: 'Kasir',
      href: `/koperasi/${koperasiId}/cashier`,
      icon: '🛒',
      show: tier === 'MEMBER_USAHA'
    },
    {
      label: 'Settlement',
      href: `/koperasi/${koperasiId}/settlement`,
      icon: '💰',
      show: tier === 'MEMBER_USAHA'
    },
    {
      label: 'Printer',
      href: `/koperasi/${koperasiId}/printer`,
      icon: '🖨️',
      show: tier === 'MEMBER_USAHA'
    }
  ];

  const ownerMenuItems = [
    {
      label: 'Validasi Anggota',
      href: `/koperasi/${koperasiId}/owner/members`,
      icon: '👥',
      show: true
    },
    {
      label: 'Aturan Margin',
      href: `/koperasi/${koperasiId}/owner/margin`,
      icon: '📊',
      show: true
    },
    {
      label: 'Produk & Etalase',
      href: `/koperasi/${koperasiId}/owner/products`,
      icon: '🏪',
      show: true
    },
    {
      label: 'Laporan',
      href: `/koperasi/${koperasiId}/owner/reports`,
      icon: '📈',
      show: true
    }
  ];

  const isActive = (href: string) => {
    return currentPath === href;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {menuItems.map((item) => {
              if (!item.show) return null;
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </div>

          {isOwner && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Owner Console:</span>
                <div className="flex space-x-2">
                  {ownerMenuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-1">{item.icon}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Status Anda:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOwner ? 'bg-purple-100 text-purple-800' :
                tier === 'MEMBER_USAHA' ? 'bg-green-100 text-green-800' :
                tier === 'MEMBER' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {isOwner ? 'Pemilik Koperasi' :
                 tier === 'MEMBER_USAHA' ? 'Anggota Usaha' :
                 tier === 'MEMBER' ? 'Anggota' :
                 'Umum'}
              </span>
            </div>
            
            {tier === 'UMUM' && !isOwner && (
              <div className="text-gray-600">
                <span className="text-yellow-600">⚠️</span> Anda belum menjadi anggota. 
                <a href={`/koperasi/${koperasiId}/catalog`} className="text-blue-600 hover:underline ml-1">
                  Lihat katalog untuk mengajukan keanggotaan
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
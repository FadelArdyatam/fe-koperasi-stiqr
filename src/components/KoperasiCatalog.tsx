import React, { useEffect, useState } from 'react';
import { AuthClaims, EffectiveTier } from '../types/auth';
import { getEffectiveTier, getTierLabel, getTierColor, isKoperasiOwner } from '../utils/tier';

interface Product {
  id: number;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  finalPrice: number;
  tier: string;
  product_description: string;
  product_image?: string;
  detail_product?: {
    stok: number;
    is_stok: boolean;
    stok_minimum: number;
  };
  product_variant?: Array<{
    variant: {
      variant_name: string;
      detail_variant: Array<{
        name: string;
        price: number;
      }>;
    };
  }>;
}

interface KoperasiCatalogProps {
  koperasiId: string;
  claims: AuthClaims | null;
  onApplyMembership: (koperasiId: string) => void;
}

export const KoperasiCatalog: React.FC<KoperasiCatalogProps> = ({ 
  koperasiId, 
  claims, 
  onApplyMembership 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [koperasiInfo, setKoperasiInfo] = useState<any>(null);

  useEffect(() => {
    if (koperasiId) {
      fetchKoperasiInfo();
      fetchProducts();
    }
  }, [koperasiId]);

  const fetchKoperasiInfo = async () => {
    try {
      const response = await fetch(`/api/koperasi/${koperasiId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setKoperasiInfo(data);
      }
    } catch (err) {
      console.error('Error fetching koperasi info:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/koperasi/${koperasiId}/catalog`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil katalog produk');
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getUserStatus = () => {
    if (!claims) return { tier: 'UMUM', isOwner: false };
    
    const tier = getEffectiveTier(claims, koperasiId);
    const isOwner = isKoperasiOwner(claims, koperasiId);
    
    return { tier, isOwner };
  };

  const { tier, isOwner } = getUserStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {koperasiInfo?.nama_koperasi || 'Katalog Koperasi'}
            </h1>
            {koperasiInfo && (
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Penanggung Jawab:</span> {koperasiInfo.nama_penanggung_jawab}</p>
                <p><span className="font-medium">Alamat:</span> {koperasiInfo.alamat_koperasi}</p>
                <p><span className="font-medium">Anggota Aktif:</span> {koperasiInfo._count?.merchant_koperasi || 0}</p>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier as EffectiveTier)} bg-gray-100`}>
              {getTierLabel(tier as EffectiveTier)}
            </div>
            {tier === 'UMUM' && !isOwner && (
              <button
                onClick={() => onApplyMembership(koperasiId)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Ajukan Keanggotaan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {product.product_image && (
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.product_image}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {product.product_name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.product_description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Harga Dasar:</span>
                  <span className="text-sm text-gray-600 line-through">
                    {formatPrice(product.product_price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getTierColor(tier as EffectiveTier)}`}>
                    {getTierLabel(tier as EffectiveTier)}:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.finalPrice)}
                  </span>
                </div>
                
                {product.detail_product?.is_stok && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Stok:</span>
                    <span className={`text-sm font-medium ${
                      product.detail_product.stok > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.detail_product.stok} unit
                    </span>
                  </div>
                )}
              </div>
              
              <button 
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={product.detail_product?.is_stok && product.detail_product.stok === 0}
              >
                {product.detail_product?.is_stok && product.detail_product.stok === 0 
                  ? 'Stok Habis' 
                  : 'Tambah ke Keranjang'
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Produk</h3>
          <p className="text-gray-500">Koperasi ini belum memiliki produk yang tersedia.</p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliation } from '../hooks/useAffiliation';
import axios from 'axios';
import { CreditCard, FileText, Home, ScanQrCode, UserRound } from 'lucide-react';

interface Product {
  id: string;
  product_name: string;
  product_price: number;
  finalPrice: number;
  tier: string;
  product_image?: string;
  product_description?: string;
  merchant: {
    id: string;
    name: string;
    email: string;
    affiliation: string;
    approval_status: string;
  };
  product_variant: any[];
  detail_product: any[];
}

const KoperasiCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { affiliation, koperasiId, loading, error } = useAffiliation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');

  useEffect(() => {
    console.log('[KoperasiCatalog] Debug info:', {
      affiliation,
      koperasiId,
      loading,
      error
    });
    
    if (koperasiId && !loading) {
      fetchProducts();
    }
  }, [koperasiId, loading]);

  const fetchProducts = async () => {
    if (!koperasiId) return;
    
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/koperasi/${koperasiId}/catalog`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.merchant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'ALL' || product.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'NON_MEMBER': return 'bg-gray-100 text-gray-800';
      case 'MEMBER': return 'bg-blue-100 text-blue-800';
      case 'MEMBER_USAHA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'NON_MEMBER': return 'Non Member';
      case 'MEMBER': return 'Member';
      case 'MEMBER_USAHA': return 'Member Wirausaha';
      default: return tier;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug affiliation check
  console.log('[KoperasiCatalog] Affiliation check:', {
    affiliation,
    isKoperasiInduk: affiliation === 'KOPERASI_INDUK',
    loading,
    error
  });

  if (affiliation !== 'KOPERASI_INDUK') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Only Koperasi Induk can access this page.
            <br />
            Current affiliation: {affiliation || 'undefined'}
            <br />
            Loading: {loading ? 'true' : 'false'}
            {error && <><br />Error: {error}</>}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Katalog Koperasi</h1>
              <p className="text-gray-600">Kelola produk dan harga untuk anggota koperasi</p>
            </div>
            <button
              onClick={() => navigate('/koperasi-dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Produk
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama produk atau merchant..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Tier
              </label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Semua Tier</option>
                <option value="NON_MEMBER">Non Member</option>
                <option value="MEMBER">Member</option>
                <option value="MEMBER_USAHA">Member Wirausaha</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk</h3>
            <p className="text-gray-600">
              {searchTerm || filterTier !== 'ALL' 
                ? 'Tidak ada produk yang sesuai dengan filter' 
                : 'Belum ada produk yang terdaftar di koperasi ini'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {product.product_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        oleh {product.merchant.name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(product.tier)}`}>
                      {getTierLabel(product.tier)}
                    </span>
                  </div>

                  {product.product_image && (
                    <div className="mb-4">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {product.product_description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.product_description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Harga Asli:</span>
                      <span className="text-sm text-gray-600 line-through">
                        {formatPrice(product.product_price)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Harga Final:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(product.finalPrice)}
                      </span>
                    </div>
                    {product.finalPrice !== product.product_price && (
                      <div className="text-xs text-green-600 font-medium">
                        Diskon: {formatPrice(product.product_price - product.finalPrice)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Status: {product.merchant.approval_status}</span>
                      <span>Affiliation: {product.merchant.affiliation}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Menampilkan {filteredProducts.length} dari {products.length} produk</span>
              <span>Total produk: {products.length}</span>
            </div>
          </div>
        )}
      </div>



            {/* Bottom Navbar */}
            <div id="navbar" className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase">Penarikan</p>
                </Link>
                <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
                    <FileText />
                    <p className="uppercase">Catalog</p>
                </Link>
                {/* {affiliation?.affiliation === 'KOPERASI_INDUK' && (
                    <Link to={'/koperasi-dashboard'} className="flex gap-3 flex-col items-center">
                        <Building2 />
                        <p className="uppercase">Koperasi</p>
                    </Link>
                )} */}
                <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
    </div>
  );
};

export default KoperasiCatalog;
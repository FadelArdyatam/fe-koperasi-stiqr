import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliation } from '../hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Search, ChevronDown, ShoppingBag,Home, ScanQrCode, CreditCard, UserRound, FileText } from 'lucide-react';
import { getEffectiveTier } from '../utils/tier';
import { AuthClaims, EffectiveTier } from '../types/auth';

// Helper to decode JWT token to get claims
const decodeToken = (token: string | null): AuthClaims | null => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload as AuthClaims;
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};

interface TierPrice {
    tier: EffectiveTier;
    price: number;
}

interface Product {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    tier_prices: TierPrice[];
    koperasi_id: string;
    stok: number;
    category: string;
    product_image?: string;
    // These will be calculated on the frontend
    finalPrice?: number;
    displayTier?: EffectiveTier;
}

const KoperasiCatalog: React.FC = () => {
    const navigate = useNavigate();
    const { affiliation, koperasiId, loading: affiliationLoading } = useAffiliation();
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState('ALL');
    const [tierLabel, setTierLabel] = useState('Semua Tier');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userClaims = useMemo(() => decodeToken(token), [token]);
    const effectiveUserTier = useMemo(() => koperasiId ? getEffectiveTier(userClaims, koperasiId) : 'UMUM', [userClaims, koperasiId]);

    const calculateProductPrices = useCallback((fetchedProducts: Product[]) => {
        return fetchedProducts.map(product => {
            let finalPrice = product.base_price;
            let displayTier: EffectiveTier = 'UMUM';

            // Find the price for the effective user tier
            const tierPrice = product.tier_prices.find(tp => tp.tier === effectiveUserTier);
            if (tierPrice) {
                finalPrice = tierPrice.price;
                displayTier = effectiveUserTier;
            } else {
                // Fallback to UMUM if specific tier price not found
                const umumPrice = product.tier_prices.find(tp => tp.tier === 'UMUM');
                if (umumPrice) {
                    finalPrice = umumPrice.price;
                }
                displayTier = 'UMUM';
            }

            return { ...product, finalPrice, displayTier };
        });
    }, [effectiveUserTier]);

    const fetchProducts = useCallback(async () => {
        if (!koperasiId) return;
        setLoadingProducts(true);
        try {
            await new Promise(res => setTimeout(res, 500)); // Simulate loading
            const response = await axiosInstance.get(`/koperasi/${koperasiId}/catalog`);
            console.log(response)
            const processedProducts = calculateProductPrices(response.data || []);
            setProducts(processedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }, [koperasiId, calculateProductPrices]);

    useEffect(() => {
        if (koperasiId && !affiliationLoading) {
            fetchProducts();
        }
        if (!affiliationLoading && affiliation !== 'KOPERASI_INDUK') {
            setLoadingProducts(false);
        }
    }, [koperasiId, affiliationLoading, affiliation, fetchProducts]);

    const filteredProducts = useMemo(() => products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = filterTier === 'ALL' || product.displayTier === filterTier;
        return matchesSearch && matchesTier;
    }), [products, searchTerm, filterTier]);

    const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);

    const tierDisplay: Record<EffectiveTier, { label: string, className: string }> = {
        UMUM: { label: 'Umum', className: 'border-gray-300 bg-gray-50 text-gray-800' },
        NON_MEMBER: { label: 'Non-Anggota', className: 'border-gray-300 bg-gray-50 text-gray-800' },
        MEMBER: { label: 'Anggota', className: 'border-blue-300 bg-blue-50 text-blue-800' },
        MEMBER_USAHA: { label: 'Anggota Usaha', className: 'border-green-300 bg-green-50 text-green-800' },
    };

    const ProductSkeletonCard = () => (
        <Card className="animate-pulse overflow-hidden">
            <div className="h-40 bg-gray-200"></div>
            <CardContent className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="flex justify-between items-center pt-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-6 w-2/5 bg-gray-200 rounded"></div>
                </div>
            </CardContent>
        </Card>
    );

    if (affiliationLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
    }

    if (affiliation !== 'KOPERASI_INDUK') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
                    <p className="text-gray-600 mb-6">Hanya Koperasi Induk yang dapat mengakses halaman ini.</p>
                    <Button onClick={() => navigate('/koperasi-dashboard')}>Kembali ke Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28 bg-gray-50 min-h-screen">
            <header className="p-4 flex items-center gap-4 mb-0 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate('/koperasi-dashboard')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Katalog Koperasi</h1>
            </header>

            <div className="p-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Katalog</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama produk atau kategori..." className="pl-10" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto justify-between min-w-[180px]">
                                    {tierLabel}
                                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                <DropdownMenuItem onSelect={() => { setFilterTier('ALL'); setTierLabel('Semua Tier'); }}>Semua Tier</DropdownMenuItem>
                                {Object.keys(tierDisplay).map(tierKey => (
                                    <DropdownMenuItem key={tierKey} onSelect={() => { setFilterTier(tierKey); setTierLabel(tierDisplay[tierKey as EffectiveTier].label); }}>
                                        {tierDisplay[tierKey as EffectiveTier].label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>

                {loadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <ProductSkeletonCard key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-lg border">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak Ada Produk</h3>
                        <p className="mt-1 text-sm text-gray-500">Tidak ada produk yang ditemukan dengan filter saat ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <Card key={product.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
                                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {product.product_image ? (
                                        <img src={product.product_image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <ShoppingBag className="w-16 h-16 text-gray-300" />
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierDisplay[product.displayTier || 'UMUM']?.className || tierDisplay.UMUM.className}`}>
                                            {tierDisplay[product.displayTier || 'UMUM']?.label || 'Umum'}
                                        </span>
                                        <span className="text-xs text-gray-500">Stok: {product.stok}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 leading-snug truncate group-hover:text-orange-600 transition-colors">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">Kategori: {product.category}</p>
                                    
                                    <div className="mt-auto pt-3 space-y-2 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Harga Dasar</span>
                                            <span className="text-sm text-gray-500 line-through">{formatPrice(product.base_price)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-800">Harga Anda</span>
                                            <span className="text-lg font-bold text-orange-600">{formatPrice(product.finalPrice || product.base_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
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
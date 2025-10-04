import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingBag, Search, X, Plus, Minus } from 'lucide-react';
import Notification from '@/components/Notification';
import noProduct from "@/images/no-product.png";

// --- Interfaces ---
interface Product {
    id: number;
    product_id: string;
    product_name: string;
    product_price: number;
    product_status: boolean;
    product_image: string | null;
}

interface CartItem extends Product {
    quantity: number;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

// --- Main Component ---
const KasirAnggota: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId, loading: affiliationLoading } = useAffiliation();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (koperasiId) {
            console.log('[KasirAnggota] Fetching data for koperasiId:', koperasiId);
            setLoading(true);
            axiosInstance.get(`/koperasi/${koperasiId}/catalog`, { params: { page: currentPage } })
                .then(response => {
                    console.log('[KasirAnggota] API Response:', response.data);
                    const activeProducts = response.data.data.filter((p: Product) => p.product_status === true);
                    console.log('[KasirAnggota] Filtered Active Products:', activeProducts);
                    setProducts(activeProducts);
                    setPagination(response.data.pagination);
                })
                .catch(err => {
                    setError('Gagal memuat katalog.');
                    console.error('[KasirAnggota] Error fetching catalog:', err);
                })
                .finally(() => setLoading(false));
        } else {
            console.log('[KasirAnggota] Waiting for koperasiId...');
        }
    }, [koperasiId, currentPage]);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleAddToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const handleUpdateQuantity = (productId: number, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        });
    };

    const totalCartPrice = useMemo(() => 
        cart.reduce((total, item) => total + (item.product_price * item.quantity), 0), 
    [cart]);

    const handleCheckout = () => {
        console.log("--- CHECKOUT ---");
        console.log("Items:", cart);
        console.log("Total:", formatRupiah(totalCartPrice));
        alert(`Checkout dengan total: ${formatRupiah(totalCartPrice)}`);
    };

    const formatRupiah = (price: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);

    return (
        <div className="min-h-screen bg-gray-50">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            <header className="p-4 flex items-center gap-4 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold truncate">Kasir Koperasi</h1>
            </header>

            <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
                {/* Products Section */}
                <div className="w-full md:w-2/3 p-4 overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama produk..." className="pl-10 bg-white" />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <Card key={product.id} onClick={() => handleAddToCart(product)} className="overflow-hidden cursor-pointer hover:border-orange-400 transition-colors">
                                    <div className="h-28 bg-gray-100 flex items-center justify-center">
                                        <img src={product.product_image || noProduct} alt={product.product_name} className="h-full w-full object-cover" />
                                    </div>
                                    <CardContent className="p-2">
                                        <h3 className="text-sm font-semibold truncate">{product.product_name}</h3>
                                        <p className="text-sm font-bold text-orange-600">{formatRupiah(product.product_price)}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
                            <span>Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                            <Button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}>Berikutnya</Button>
                        </div>
                    )}
                </div>

                {/* Cart Section */}
                <div className="w-full md:w-1/3 bg-white border-l flex flex-col h-full">
                    <CardHeader>
                        <CardTitle>Keranjang</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="text-center text-gray-500 pt-16">
                                <ShoppingBag className="mx-auto h-12 w-12" />
                                <p className="mt-2">Keranjang masih kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                                    <img src={item.product_image || noProduct} alt={item.product_name} className="w-12 h-12 rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium truncate">{item.product_name}</p>
                                        <p className="text-xs text-gray-600">{formatRupiah(item.product_price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                    <div className="p-4 border-t space-y-4 bg-gray-50">
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatRupiah(totalCartPrice)}</span>
                        </div>
                        <Button onClick={handleCheckout} className="w-full bg-orange-500 hover:bg-orange-600" disabled={cart.length === 0}>Checkout</Button>
                        <Button onClick={() => setCart([])} className="w-full" variant="outline" disabled={cart.length === 0}>Kosongkan Keranjang</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KasirAnggota;

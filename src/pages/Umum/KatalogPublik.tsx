import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingBag, Search,  Plus, Minus, ShoppingCart } from 'lucide-react';
import Notification from '@/components/Notification';
import noProduct from "@/images/no-product.png";

// --- Interfaces ---
interface Product {
    id: number;
    product_id: string;
    product_name: string;
    product_price: number;
    finalPrice: number;
    product_image: string | null;
}

interface CartItem extends Product {
    quantity: number;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
}

// --- Main Component ---
const KatalogPublik: React.FC = () => {
    const { koperasiId } = useParams<{ koperasiId: string }>();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (koperasiId) {
            setLoading(true);
            axiosInstance.get(`/koperasi/${koperasiId}/catalog/public`, { params: { page: currentPage } })
                .then(response => {
                    setProducts(response.data.data || []);
                    setPagination(response.data.pagination);
                })
                .catch(err => {
                    setError('Gagal memuat katalog.');
                    console.error(err);
                })
                .finally(() => setLoading(false));
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

    const totalCartItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
    const totalCartPrice = useMemo(() => cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0), [cart]);

    const handleCheckout = () => {
        alert(`Checkout dengan total: ${formatRupiah(totalCartPrice)}`);
    };

    const formatRupiah = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const CartContent = () => (
        <>
            <CardHeader>
                <CardTitle>Keranjang</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-4 space-y-3 overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="pt-16 text-center text-gray-500">
                        <ShoppingBag className="w-12 h-12 mx-auto" />
                        <p className="mt-2">Keranjang masih kosong</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                            <img src={item.product_image || noProduct} alt={item.product_name} className="object-cover w-12 h-12 rounded-md" />
                            <div className="flex-grow">
                                <p className="text-sm font-medium truncate">{item.product_name}</p>
                                <p className="text-xs text-gray-600">{formatRupiah(item.finalPrice)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="w-6 h-6" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="w-4 h-4" /></Button>
                                <span className="w-6 font-semibold text-center">{item.quantity}</span>
                                <Button size="icon" variant="outline" className="w-6 h-6" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
            <div className="p-4 space-y-4 border-t bg-gray-50">
                <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatRupiah(totalCartPrice)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-orange-500 hover:bg-orange-600" disabled={cart.length === 0}>Checkout</Button>
                <Button onClick={() => setCart([])} className="w-full" variant="outline" disabled={cart.length === 0}>Kosongkan Keranjang</Button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
                <h1 className="text-xl font-bold truncate">Katalog Koperasi</h1>
            </header>

            <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
                <div className="w-full p-4 pb-24 overflow-y-auto md:w-2/3 md:pb-4">
                    <div className="relative mb-4">
                        <Search className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama produk..." className="pl-10 bg-white" />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-56 bg-gray-200 rounded-lg animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map(product => {
                                const cartItem = cart.find(item => item.id === product.id);
                                const quantityInCart = cartItem ? cartItem.quantity : 0;

                                return (
                                    <Card key={product.id} className="flex flex-col justify-between overflow-hidden">
                                        <div onClick={() => quantityInCart === 0 && handleAddToCart(product)} className="cursor-pointer">
                                            <div className="flex items-center justify-center bg-gray-100 h-28">
                                                <img src={product.product_image || noProduct} alt={product.product_name} className="object-cover w-full h-full" />
                                            </div>
                                            <CardContent className="p-2">
                                                <h3 className="h-10 text-sm font-semibold truncate">{product.product_name}</h3>
                                                <p className="text-sm font-bold text-orange-600">{formatRupiah(product.finalPrice)}</p>
                                            </CardContent>
                                        </div>
                                        <div className="p-2 mt-auto border-t md:hidden">
                                            {quantityInCart === 0 ? (
                                                <Button variant="outline" className="w-full" onClick={() => handleAddToCart(product)}>Tambah</Button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => handleUpdateQuantity(product.id, quantityInCart - 1)}><Minus className="w-4 h-4" /></Button>
                                                    <span className="w-8 text-lg font-bold text-center">{quantityInCart}</span>
                                                    <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => handleUpdateQuantity(product.id, quantityInCart + 1)}><Plus className="w-4 h-4" /></Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</Button>
                            <span>Halaman {pagination.currentPage} dari {pagination.totalPages}</span>
                            <Button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}>Berikutnya</Button>
                        </div>
                    )}
                </div>

                <div className="flex-col hidden w-full h-full bg-white border-l md:flex md:w-1/3">
                    <CartContent />
                </div>
            </div>

            <div className="fixed z-30 md:hidden bottom-5 right-5">
                <Button onClick={() => setIsCartOpen(true)} size="icon" className="w-16 h-16 bg-orange-500 rounded-full shadow-lg">
                    <ShoppingCart className="w-8 h-8" />
                    {totalCartItems > 0 && 
                        <span className="absolute top-0 right-0 flex items-center justify-center block w-6 h-6 text-xs text-white bg-red-600 rounded-full">{totalCartItems}</span>
                    }
                </Button>
            </div>

            {isCartOpen && (
                <div className="fixed inset-0 z-40 md:hidden bg-black/50" onClick={() => setIsCartOpen(false)}>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col bg-white h-3/4 rounded-t-2xl" onClick={(e) => e.stopPropagation()}>
                        <CartContent />
                    </div>
                </div>
            )}
        </div>
    );
};

export default KatalogPublik;

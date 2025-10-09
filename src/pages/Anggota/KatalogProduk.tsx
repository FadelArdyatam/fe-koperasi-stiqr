import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliation } from '@/hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingBag, Search, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import Notification from '@/components/Notification';
import noProduct from "@/images/no-product.png";
import PaymentMethodSelector from '@/components/PaymentMethodSelector';

// --- Interfaces ---
interface Product {
    id: number;
    product_id: string;
    product_name: string;
    product_price: number;
    finalPrice: number;
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

// --- Helper & Sub-Components ---

const formatRupiah = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const MobileBasketTrigger = ({ totalItems, total, onClick }: { totalItems: number, total: number, onClick: () => void }) => {
    const isDisabled = totalItems === 0;
    return (
        <div 
            onClick={!isDisabled ? onClick : undefined} 
            className={`fixed bottom-0 left-0 right-0 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex items-center justify-between transition-colors duration-300 ${
                isDisabled 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-orange-500 text-white cursor-pointer'
            }`}>
            <div className={`flex items-center gap-3 ${isDisabled ? 'text-gray-600' : 'text-white'}`}>
                <ShoppingCart/>
                <p className="font-semibold">{isDisabled ? 'Keranjang Kosong' : 'Lihat Keranjang'}</p>
            </div>
            <p className={`font-bold text-lg ${isDisabled ? 'text-gray-700' : 'text-white'}`}>
                {formatRupiah(total)}
            </p>
        </div>
    );
};

const MobileBasketDrawer = ({ children, onClose, isOpen }: { children: React.ReactNode, onClose: () => void, isOpen: boolean }) => (
    <div className={`fixed inset-0 z-40 md:hidden ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Overlay */}
        <div onClick={onClose} className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        {/* Drawer */}
        <div className={`fixed bottom-0 left-0 right-0 h-3/4 bg-gray-100 rounded-t-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-shrink-0 p-4 text-center relative border-b bg-white rounded-t-2xl">
                <h2 className="text-lg font-semibold">Keranjang</h2>
                <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-2 right-2"><X className="h-5 w-5"/></Button>
            </div>
            {children}
        </div>
    </div>
);

// --- Main Component ---
const KatalogProduk: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId } = useAffiliation();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showPaymentSelector, setShowPaymentSelector] = useState(false);

    useEffect(() => {
        if (koperasiId) {
            setLoading(true);
            axiosInstance.get(`/koperasi/${koperasiId}/catalog/merchant`, { params: { page: currentPage } })
                .then(response => {
                    const activeProducts = response.data.data.filter((p: Product) => p.product_status === true);
                    setProducts(activeProducts);
                    setPagination(response.data.pagination);
                })
                .catch(err => {
                    setError(`Gagal memuat katalog. ${err.message}`);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
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

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setShowPaymentSelector(true);
    };

    const handlePaymentMethodSelect = async (method: 'QRIS' | 'SALDO_NON_CASH', pin?: string) => {
        try {
            setCheckoutLoading(true);
            setShowPaymentSelector(false);

            // Prepare checkout data
            const checkoutData = {
                koperasi_id: koperasiId,
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    notes: ''
                })),
                payment_method: method,
                customer_info: {
                    name: 'Customer Name', // You might want to get this from user profile
                    phone: '081234567890', // You might want to get this from user profile
                    email: 'customer@example.com' // You might want to get this from user profile
                },
                pin: pin || '' // PIN for saldo payment
            };

            // Call checkout API
            const response = await axiosInstance.post('/checkout-anggota', checkoutData);

            if (response.data.success) {
                const { transaction_id, payment_result } = response.data.data;

                if (method === 'QRIS' && payment_result?.qrCode) {
                    // Navigate to QR payment page
                    navigate(`/anggota/qr-payment/${transaction_id}`, {
                        state: {
                            qrCode: payment_result.qrCode,
                            amount: totalCartPrice,
                            transactionId: transaction_id
                        }
                    });
                } else if (method === 'SALDO_NON_CASH') {
                    // For saldo payment, show success message
                    alert(`Pembayaran berhasil! Transaction ID: ${transaction_id}`);
                    setCart([]); // Clear cart
                    navigate('/anggota/dashboard');
                } else {
                    // For other payment methods
                    alert(`Checkout berhasil! Transaction ID: ${transaction_id}`);
                    setCart([]); // Clear cart
                }
            } else {
                alert(`Checkout gagal: ${response.data.message}`);
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const CartContent = () => (
        <div className="flex flex-col h-full bg-white">
            <CardHeader>
                <CardTitle className="flex items-center"><ShoppingBag className="w-5 h-5 mr-2 text-orange-500"/>Keranjang Anda</CardTitle>
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
                            <img src={item.product_image || noProduct} alt={item.product_name} className="object-cover w-12 h-12 rounded-md bg-gray-100" />
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
                <Button onClick={handleCheckout} className="w-full bg-orange-500 hover:bg-orange-600" disabled={cart.length === 0 || checkoutLoading}>
                    {checkoutLoading ? 'Memproses...' : 'Checkout'}
                </Button>
                <Button onClick={() => setCart([])} className="w-full" variant="outline" disabled={cart.length === 0}>Kosongkan Keranjang</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            <header className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white border-b">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-bold truncate">Katalog Anggota</h1>
            </header>

            <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
                {/* Product List */}
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
                                    <Card key={product.id} className="flex flex-col justify-between overflow-hidden transition-shadow hover:shadow-md">
                                        <div onClick={() => quantityInCart === 0 && handleAddToCart(product)} className="cursor-pointer">
                                            <div className="flex items-center justify-center bg-gray-100 h-28">
                                                <img src={product.product_image || noProduct} alt={product.product_name} className="object-cover w-full h-full" />
                                            </div>
                                            <CardContent className="p-2">
                                                <h3 className="h-10 text-sm font-semibold line-clamp-2">{product.product_name}</h3>
                                                <p className="text-sm font-bold text-orange-600">{formatRupiah(product.finalPrice)}</p>
                                            </CardContent>
                                        </div>
                                        <div className="p-2 mt-auto border-t">
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

                {/* Desktop Cart */}
                <div className="flex-col hidden w-full h-full bg-white border-l md:flex md:w-1/3">
                    <CartContent />
                </div>
            </div>

            {/* Mobile Cart (New Implementation) */}
            <div className="md:hidden">
                <MobileBasketTrigger 
                    totalItems={totalCartItems} 
                    total={totalCartPrice} 
                    onClick={() => setIsCartOpen(true)} 
                />
                <MobileBasketDrawer 
                    isOpen={isCartOpen} 
                    onClose={() => setIsCartOpen(false)}
                >
                    <CartContent />
                </MobileBasketDrawer>
            </div>

            {/* Payment Method Selector Modal */}
            {showPaymentSelector && (
                <PaymentMethodSelector
                    onSelectMethod={handlePaymentMethodSelect}
                    onCancel={() => setShowPaymentSelector(false)}
                    totalAmount={totalCartPrice}
                    loading={checkoutLoading}
                />
            )}
        </div>
    );
};

export default KatalogProduk;

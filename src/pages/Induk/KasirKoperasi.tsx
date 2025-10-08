import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Search,
  ShoppingCart,
  Users,
  Crown,
  Shield,
  Wallet,
  QrCode,
  CheckCircle,
  ArrowLeft,
  Plus,
  Minus,
  UserCheck,
  Store,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { useAffiliation } from "@/hooks/useAffiliation";
import Notification from "@/components/Notification";

// --- TYPES --- //
interface Product { id: string; product_id: string; product_name: string; product_price: number; finalPrice?: number; price_non_member?: number | null; price_member?: number | null; price_member_usaha?: number | null; product_image?: string; product_description?: string; tier: string; stock: number; merchant: { id: string; name: string; email: string; affiliation: string; approval_status: string; };}
interface BasketItem { product_id: string; product_image?: string; product: string; quantity: number; price: number; finalPrice: number; margin_amount: number; notes?: string;}
interface Member { id: string; name: string; email: string; phone_number: string; tier: "NON_MEMBER" | "MEMBER" | "MEMBER_USAHA";}
interface ApiResponse<T> { success: boolean; data?: T; message?: string;}
interface CheckoutResponse { qr_code?: string; order_id: string;}
interface PaymentStatusResponse { status: string;}
interface MarginRule { tier: "NON_MEMBER" | "MEMBER" | "MEMBER_USAHA" | "UMUM"; type: 'FLAT' | 'PERCENT'; value: number; }

// --- SUB-COMPONENTS --- //

const BasketContent = ({ basket, total, margin, onUpdateQuantity, onCheckout }: { basket: BasketItem[], total: number, margin: number, onUpdateQuantity: (id: string, q: number) => void, onCheckout: () => void }) => (
    <>
        <CardHeader className="flex-shrink-0 border-b lg:border-none">
            <CardTitle className="text-base flex items-center"><ShoppingCart className="w-5 h-5 mr-2 text-orange-500"/>Keranjang</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-3">
            {basket.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300"/>
                    <p className="mt-2 text-sm text-gray-500">Keranjang masih kosong</p>
                </div>
            ) : basket.map(item => (
                <BasketItemCard key={item.product_id} item={item} onUpdateQuantity={onUpdateQuantity} />
            ))}
        </CardContent>
        <CardFooter className="flex-shrink-0 p-4 bg-white border-t border-gray-200 flex flex-col">
            <div className="w-full space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatRupiah(total - margin)}</span></div>
                <div className="flex justify-between text-orange-600"><span>Margin</span><span>{formatRupiah(margin)}</span></div>
                <div className="flex justify-between font-bold text-base"><span className="text-gray-800">Total</span><span className="text-orange-600">{formatRupiah(total)}</span></div>
            </div>
            <Button onClick={onCheckout} disabled={basket.length === 0} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-base font-bold mt-4">
                <Wallet className="w-5 h-5 mr-2" /> Lanjutkan Pembayaran
            </Button>
        </CardFooter>
    </>
);

const MobileBasketTrigger = ({ totalItems, total, onClick }: { totalItems: number, total: number, onClick: () => void }) => {
    const isDisabled = totalItems === 0;
    return (
        <div onClick={!isDisabled ? onClick : undefined} className={`fixed bottom-0 left-0 right-0 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex items-center justify-between transition-colors duration-300 ${
                isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-orange-500 text-white cursor-pointer'
            }`}>
            <div className={`flex items-center gap-3 ${isDisabled ? 'text-gray-600' : 'text-white'}`}>
                <ShoppingCart/>
                <p className="font-semibold">{isDisabled ? 'Keranjang Kosong' : 'Lihat Keranjang'}</p>
            </div>
            <p className={`font-bold text-lg ${isDisabled ? 'text-gray-700' : 'text-white'}`}>{formatRupiah(total)}</p>
        </div>
    );
};

const MobileBasketDrawer = ({ children, onClose, isOpen }: { children: React.ReactNode, onClose: () => void, isOpen: boolean }) => (
    <div className={`fixed inset-0 z-40 lg:hidden ${isOpen ? 'visible' : 'invisible'}`}>
        <div onClick={onClose} className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`fixed bottom-0 left-0 right-0 h-[85%] bg-gray-100 rounded-t-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex-shrink-0 p-4 text-center relative border-b bg-white rounded-t-2xl">
                <h2 className="text-lg font-semibold">Keranjang</h2>
                <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-2 right-2"><X className="h-5 w-5"/></Button>
            </div>
            {children}
        </div>
    </div>
);

const ProductCard = ({ product, onAddToBasket, memberTier, computePrice }: { product: Product, onAddToBasket: (p: Product) => void, memberTier?: string, computePrice: (p: Product, t?: string) => number }) => {
    const finalPrice = computePrice(product, memberTier);
    return (
        <Card onClick={() => onAddToBasket(product)} className="overflow-hidden cursor-pointer group transition-all hover:shadow-md hover:-translate-y-1">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.product_image ? <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover"/> : <Store className="w-10 h-10 text-gray-300"/>}
            </div>
            <div className="p-2">
                <p className="text-xs font-medium text-gray-800 line-clamp-2 h-9">{product.product_name}</p>
                <p className="text-base font-bold text-orange-600 mt-1">{formatRupiah(finalPrice)}</p>
            </div>
        </Card>
    );
};

const BasketItemCard = ({ item, onUpdateQuantity }: { item: BasketItem, onUpdateQuantity: (id: string, q: number) => void }) => (
    <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
            {item.product_image ? <img src={item.product_image} alt={item.product} className="w-full h-full object-cover"/> : <Store className="w-6 h-6 text-gray-400 m-auto"/>}
        </div>
        <div className="flex-grow">
            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product}</p>
            <p className="text-sm font-semibold text-orange-600">{formatRupiah(item.finalPrice)}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}><Minus className="h-3 w-3"/></Button>
            <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}><Plus className="h-3 w-3"/></Button>
        </div>
    </div>
);

const DialogCustomerSearch = ({ onSelectMember, currentMember, fetchMembers, members }: { onSelectMember: (m: Member) => void, currentMember: Member | null, fetchMembers: (q: string) => void, members: Member[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); fetchMembers(e.target.value); };
    const selectAndClose = (member: Member) => { onSelectMember(member); setIsOpen(false); };
    return (
        <>
            <Button variant="outline" onClick={() => setIsOpen(true)}>Ubah</Button>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
                    <Card className="w-full max-w-md">
                        <CardHeader><CardTitle>Cari Pelanggan</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Input placeholder="Ketik nama, email, atau telepon..." value={query} onChange={handleSearch} autoFocus/>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                <div onClick={() => selectAndClose({id: 'non-member', name: 'Non Anggota', email: '', phone_number: '', tier: 'NON_MEMBER'})} className={`p-3 border rounded-lg cursor-pointer ${currentMember?.tier === 'NON_MEMBER' ? 'bg-orange-50 border-orange-400' : 'hover:bg-gray-50'}`}>Non Anggota</div>
                                {members.map(member => (
                                    <div key={member.id} onClick={() => selectAndClose(member)} className={`p-3 border rounded-lg cursor-pointer ${currentMember?.id === member.id ? 'bg-orange-50 border-orange-400' : 'hover:bg-gray-50'}`}>
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.tier.replace('_', ' ')}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end"><Button variant="ghost" onClick={() => setIsOpen(false)}>Tutup</Button></CardFooter>
                    </Card>
                </div>
            )}
        </>
    )
}

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
        {[...Array(10)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-2 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
            </Card>
        ))}
    </div>
);

const ModalTemplate = ({ children, title, onClose }: { children: React.ReactNode, title: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
        <div className="w-full max-w-sm">
            <Card>
                <CardHeader className="text-center relative">
                    <CardTitle>{title}</CardTitle>
                    {onClose && <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2"><X className="h-5 w-5"/></Button>}
                </CardHeader>
                {children}
            </Card>
        </div>
    </div>
);

// --- MAIN COMPONENT --- //

const KasirKoperasi: React.FC = () => {
  const navigate = useNavigate();
  const { koperasiId, loading: affiliationLoading } = useAffiliation();

  const [products, setProducts] = useState<Product[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [marginRules, setMarginRules] = useState<MarginRule[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileBasketOpen, setIsMobileBasketOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{message: string, status: 'success' | 'error' | 'warning'} | null>(null);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderData, setLastOrderData] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => { setSelectedMember({ id: "non-member", name: "Non Anggota", email: "", phone_number: "", tier: "NON_MEMBER" }); }, []);

  const fetchProducts = useCallback(async (): Promise<void> => {
    if (!koperasiId) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/koperasi/${koperasiId}/catalog/items`);
      const payload = response.data?.data ?? response.data ?? [];
      const items = Array.isArray(payload) ? payload : [];
      const mapped: Product[] = items.map((it: any) => ({ id: String(it.product?.id ?? it.id ?? it.product_id ?? Math.random()), product_id: String(it.product?.product_id ?? it.product_id ?? it.id), product_name: it.product?.product_name ?? it.product_name ?? it.name ?? "", product_price: Number(it.product?.product_price ?? it.product_price ?? it.price ?? 0), price_non_member: it.price_non_member !== undefined ? it.price_non_member : it.product?.price_non_member ?? null, price_member: it.price_member !== undefined ? it.price_member : it.product?.price_member ?? null, price_member_usaha: it.price_member_usaha !== undefined ? it.price_member_usaha : it.product?.price_member_usaha ?? null, product_image: it.product?.product_image ?? it.product_image ?? it.image ?? undefined, stock: Number(it.product?.stock ?? it.stock ?? 99999), merchant: it.product?.merchant ?? {}, tier: "NON_MEMBER", product_description: it.product?.product_description ?? "" }));
      setProducts(mapped);
    } catch (error) { console.error("Error fetching products:", error); } finally { setLoading(false); }
  }, [koperasiId]);

  const fetchMembers = useCallback(async (q: string): Promise<void> => {
    if (!koperasiId) return;
    try {
      const res = await axiosInstance.get(`/koperasi/${koperasiId}/members`, { params: { status: "APPROVED", q, limit: 50 } });
      const membersArray = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      const membersData: Member[] = membersArray.map((m: any) => ({ id: m.id, name: m.name || m.user?.username || m.email || "Unknown", email: m.email || "", phone_number: m.phone_number || "", tier: (m.category || "").toUpperCase().includes("USAHA") ? "MEMBER_USAHA" : "MEMBER" }));
      setMembers(membersData);
    } catch (error) { console.error("Error fetching members:", error); }
  }, [koperasiId]);

  const fetchMarginRules = useCallback(async (): Promise<void> => {
    if (!koperasiId) return;
    try {
        const res = await axiosInstance.get(`/koperasi/${koperasiId}/margins`);
        setMarginRules(res.data || []);
    } catch (error) {
        console.error("Error fetching margin rules:", error);
        setNotification({ message: 'Gagal memuat aturan margin.', status: 'error' });
    }
  }, [koperasiId]);

  useEffect(() => { if (koperasiId && !affiliationLoading) { fetchProducts(); fetchMembers(""); fetchMarginRules(); } }, [koperasiId, affiliationLoading, fetchProducts, fetchMembers, fetchMarginRules]);

  useEffect(() => {
    const handleCatalogUpdate = () => {
        fetchProducts();
    };

    window.addEventListener('catalog-item-updated', handleCatalogUpdate);

    return () => {
        window.removeEventListener('catalog-item-updated', handleCatalogUpdate);
    };
  }, [fetchProducts]);

  const calculateSellingPrice = useCallback((basePrice: number, tier: string) => {
      const rule = marginRules.find(r => r.tier === tier);
      if (!rule) return basePrice;

      if (rule.type === 'FLAT') {
          return basePrice + rule.value;
      }
      if (rule.type === 'PERCENT') {
          return basePrice + (basePrice * (rule.value / 100));
      }
      return basePrice;
  }, [marginRules]);

  const computeFinalPriceForProduct = useCallback((product: Product, memberTier?: string): number => {
    const tier = memberTier || "NON_MEMBER";
    const basePrice = Number(product.product_price) || 0;
    if (tier === "MEMBER_USAHA" && product.price_member_usaha != null) return Number(product.price_member_usaha);
    if (tier === "MEMBER" && product.price_member != null) return Number(product.price_member);
    if (tier === "NON_MEMBER" && product.price_non_member != null) return Number(product.price_non_member);
    return calculateSellingPrice(basePrice, tier);
  }, [calculateSellingPrice]);

  const updateMemberSelection = (member: Member | null) => {
    const newMember = member || { id: "non-member", name: "Non Anggota", email: "", phone_number: "", tier: "NON_MEMBER" };
    setSelectedMember(newMember);
    setBasket((prevBasket) => prevBasket.map((item) => {
        const originalProduct = products.find((p) => String(p.product_id) === String(item.product_id));
        if (!originalProduct) return item;
        const finalPrice = computeFinalPriceForProduct(originalProduct, newMember.tier);
        return { ...item, finalPrice, margin_amount: finalPrice - item.price };
      })
    );
  };

  const filteredProducts = useMemo(() => products.filter((p) => p.product_name.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, products]);
  const { total, margin, totalItems } = useMemo(() => basket.reduce((acc, item) => { acc.total += item.finalPrice * item.quantity; acc.margin += item.margin_amount * item.quantity; acc.totalItems += item.quantity; return acc; }, { total: 0, margin: 0, totalItems: 0 }), [basket]);

  const addToBasket = (product: Product) => {
    const finalPrice = computeFinalPriceForProduct(product, selectedMember?.tier);
    setBasket((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) return prev.map((item) => item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item);
      return [ ...prev, { product_id: product.product_id, product: product.product_name, product_image: product.product_image, quantity: 1, price: product.product_price, finalPrice, margin_amount: finalPrice - product.product_price }];
    });
  };

  const updateBasketQuantity = (productId: string, newQuantity: number) => { setBasket((prev) => newQuantity <= 0 ? prev.filter((item) => item.product_id !== productId) : prev.map((item) => item.product_id === productId ? { ...item, quantity: newQuantity } : item)); };

  const handleCheckout = () => { if (basket.length === 0) return; setShowPaymentModal(true); };

  const handlePaymentMethodSelect = async (method: "CASH" | "QRIS") => {
    setPaymentMethod(method);
    setShowPaymentModal(false);
    setPaymentLoading(true);
    try {
      const checkoutData = { koperasi_id: koperasiId, items: basket.map((item) => ({ product_id: item.product_id, quantity: item.quantity, unit_price: item.finalPrice, original_price: item.price })), customer_info: { name: selectedMember?.name || "Guest", email: selectedMember?.email || "", phone: selectedMember?.phone_number || "" }, payment_method: method, order_summary: { subtotal: total - margin, margin, total }, selected_member_tier: selectedMember?.tier || "NON_MEMBER" };
      const response = await axiosInstance.post<ApiResponse<CheckoutResponse>>("/checkout/koperasi-catalog", checkoutData);
      if (response.data.success && response.data.data) {
        setLastOrderData({ ...checkoutData, ...response.data.data });
        if (method === "QRIS" && response.data.data.qr_code) {
          setQrCode(response.data.data.qr_code);
        } else {
          setShowReceipt(true);
          setNotification({ message: "Pembayaran tunai berhasil dicatat.", status: "success" });
        }
      } else {
        setNotification({ message: response.data.message || "Pembayaran gagal", status: "error" });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Terjadi kesalahan saat checkout";
      setNotification({ message, status: "error" });
    } finally {
      setPaymentLoading(false);
    }
  };

  const resetTransaction = (status?: 'cancelled' | 'completed') => {
    setBasket([]);
    updateMemberSelection(null);
    setShowPaymentModal(false);
    setPaymentMethod(null);
    setPaymentLoading(false);
    setQrCode(null);
    setShowSuccess(false);
    setShowReceipt(false);
    setIsMobileBasketOpen(false);
    if (status === 'cancelled') {
        setNotification({ message: 'Transaksi dibatalkan.', status: 'warning' });
    } else if (status === 'completed') {
        setNotification({ message: 'Transaksi berhasil diselesaikan.', status: 'success' });
    }
  };

  if (affiliationLoading) return <div className="flex items-center justify-center h-screen">Memuat...</div>;
  if (!koperasiId) return <div className="flex items-center justify-center h-screen">Akses Ditolak.</div>;

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans">
        {notification && <Notification message={notification.message} status={notification.status} onClose={() => setNotification(null)} />}

      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h1 className="text-lg font-bold text-gray-800">Kasir Koperasi</h1><p className="text-xs text-gray-500">ID Koperasi: {koperasiId}</p></div>
        </div>
        <div className="hidden lg:flex items-center gap-4"><p className='text-sm'>Total:</p><p className="text-xl font-bold text-orange-600">{formatRupiah(total)}</p></div>
      </header>

      <main className="flex-grow lg:grid lg:grid-cols-12 gap-0 lg:overflow-hidden">
        <section className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col bg-white overflow-y-auto pb-24 lg:pb-0">
            <div className="p-4 border-b border-gray-200">
                <CardHeader className="p-0 mb-3"><CardTitle className="text-base flex items-center"><UserCheck className="w-5 h-5 mr-2 text-orange-500"/>Pelanggan</CardTitle></CardHeader>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${selectedMember?.tier === 'MEMBER' ? 'bg-blue-100 text-blue-600' : selectedMember?.tier === 'MEMBER_USAHA' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}>{React.createElement(selectedMember?.tier === 'MEMBER' ? Shield : selectedMember?.tier === 'MEMBER_USAHA' ? Crown : Users, {className: 'w-5 h-5'})}</div>
                    <div className="flex-grow"><p className="font-semibold text-gray-800">{selectedMember?.name}</p><p className="text-xs text-gray-500">{selectedMember?.tier?.replace('_', ' ')}</p></div>
                    <DialogCustomerSearch onSelectMember={updateMemberSelection} currentMember={selectedMember} fetchMembers={fetchMembers} members={members} />
                </div>
            </div>
            <div className="p-4 flex-grow">
                <div className="relative mb-4"><Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" /><Input placeholder="Cari produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-50" /></div>
                {loading ? <ProductGridSkeleton /> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">{filteredProducts.map(product => <ProductCard key={product.id} product={product} onAddToBasket={addToBasket} memberTier={selectedMember?.tier} computePrice={computeFinalPriceForProduct} />)}</div>}
            </div>
        </section>

        <aside className="hidden lg:flex col-span-12 lg:col-span-5 xl:col-span-4 bg-gray-100 border-l border-gray-200 flex-col h-full">
            <BasketContent basket={basket} total={total} margin={margin} onUpdateQuantity={updateBasketQuantity} onCheckout={handleCheckout} />
        </aside>
      </main>

      <div className="lg:hidden">
        <MobileBasketTrigger totalItems={totalItems} total={total} onClick={() => setIsMobileBasketOpen(true)} />
        <MobileBasketDrawer isOpen={isMobileBasketOpen} onClose={() => setIsMobileBasketOpen(false)}><BasketContent basket={basket} total={total} margin={margin} onUpdateQuantity={updateBasketQuantity} onCheckout={handleCheckout} /></MobileBasketDrawer>
      </div>

      {showPaymentModal && <ModalTemplate title="Metode Pembayaran" onClose={() => setShowPaymentModal(false)}><CardContent className="space-y-3">
          <Button onClick={() => handlePaymentMethodSelect('CASH')} disabled={paymentLoading} className="w-full h-16 justify-start"><Wallet className="mr-3"/>Bayar Tunai</Button>
          <Button onClick={() => handlePaymentMethodSelect('QRIS')} disabled={paymentLoading} className="w-full h-16 justify-start"><QrCode className="mr-3"/>QRIS</Button>
      </CardContent><CardFooter><Button variant="destructive" onClick={() => setShowPaymentModal(false)}>Batal</Button></CardFooter></ModalTemplate>}

      {showReceipt && lastOrderData && <ModalTemplate title="Struk Pembayaran" onClose={() => resetTransaction('completed')}><CardContent className="text-sm space-y-2">
          <p><strong>Order ID:</strong> {lastOrderData.order_id}</p>
          <p><strong>Pelanggan:</strong> {lastOrderData.customer_info.name}</p>
          <div className="border-t pt-2 mt-2">{lastOrderData.items.map((it: any, i: number) => <div key={i} className="flex justify-between"><span>{it.product_id} x{it.quantity}</span><span>{formatRupiah(it.unit_price * it.quantity)}</span></div>)}</div>
          <div className="border-t pt-2 mt-2 font-bold flex justify-between"><span>Total</span><span>{formatRupiah(lastOrderData.order_summary.total)}</span></div>
      </CardContent><CardFooter><Button onClick={() => resetTransaction('completed')}>Tutup & Transaksi Baru</Button></CardFooter></ModalTemplate>}

      {qrCode && <ModalTemplate title="Scan untuk Membayar" onClose={() => resetTransaction('cancelled')}><CardContent className="text-center">
          <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48"/>
          <p className="text-2xl font-bold mt-2">{formatRupiah(total)}</p>
          <p className="text-sm text-gray-500">Menunggu pembayaran...</p>
      </CardContent><CardFooter><Button variant="destructive" onClick={() => resetTransaction('cancelled')}>Batal</Button></CardFooter></ModalTemplate>}

      {showSuccess && <ModalTemplate title="" onClose={() => resetTransaction('completed')}><CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500"/>
          <h3 className="text-xl font-bold mt-4">Pembayaran Berhasil</h3>
          <p className="text-2xl font-bold text-orange-600">{formatRupiah(total)}</p>
          <Button onClick={() => resetTransaction('completed')} className="mt-4 w-full">Transaksi Baru</Button>
      </CardContent></ModalTemplate>}
    </div>
  );
};

export default KasirKoperasi;
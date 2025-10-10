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
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { useAffiliation } from "@/hooks/useAffiliation";
import Notification from "@/components/Notification";
import { getSocket } from "@/hooks/websocket";
import noProduct from "@/images/no-product.png";

// --- TYPES --- //
interface Product { id: string; product_id: string; product_name: string; product_price: number; finalPrice?: number; price_non_member?: number | null; price_member?: number | null; price_member_usaha?: number | null; product_image?: string; product_description?: string; tier: string; stock: number; merchant: { id: string; name: string; email: string; affiliation: string; approval_status: string; };}
interface BasketItem { product_id: string; product_image?: string; product: string; quantity: number; price: number; finalPrice: number; margin_amount: number; notes?: string;}
interface Member { id: string; name: string; email: string; phone_number: string; tier: "NON_MEMBER" | "MEMBER" | "MEMBER_USAHA";}
interface ApiResponse<T> { success: boolean; data?: T; message?: string;}
interface CheckoutResponse { qr_code?: string; order_id: string;}
interface MarginRule { tier: "NON_MEMBER" | "MEMBER" | "MEMBER_USAHA" | "UMUM"; type: 'FLAT' | 'PERCENT'; value: number; }

// --- SUB-COMPONENTS --- //

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
  const [pin, setPin] = useState("");

  // WebSocket states
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'>('PENDING');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  
  // QRIS waiting states
  const [showQRISWaiting, setShowQRISWaiting] = useState(false);
  const [qrisError, setQrisError] = useState<string | null>(null);

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

  // WebSocket event listeners
  useEffect(() => {
    const socket = getSocket();

    const handleQRISGenerated = (data: any) => {
      console.log('[KasirKoperasi] QRIS generated:', data);
      if (data.orderId === currentOrderId && paymentMethod === 'QRIS') {
        setQrCode(data.qrCode);
        setShowQRModal(true);
        setPaymentStatus('PENDING');
        setTimeLeft(300); // Reset timer
      }
    };

    const handlePaymentSuccess = (data: any) => {
      console.log('[KasirKoperasi] Payment success:', data);
      if (data.orderId === currentOrderId) {
        setPaymentStatus('PAID');
        setShowQRModal(false);
        
        // Only show success modal for QRIS payments, not cash
        if (data.payment_method === 'QRIS') {
          setShowSuccess(true);
        }
        
        setNotification({ 
          message: `Pembayaran berhasil! Order ID: ${data.orderId}`, 
          status: 'success' 
        });
      }
    };

    const handlePaymentFailed = (data: any) => {
      console.log('[KasirKoperasi] Payment failed:', data);
      if (data.orderId === currentOrderId) {
        setPaymentStatus('FAILED');
        setShowQRModal(false);
        setNotification({ 
          message: `Pembayaran gagal! Order ID: ${data.orderId}`, 
          status: 'error' 
        });
      }
    };

    // Register event listeners
    socket.on('qris:generated', handleQRISGenerated);
    socket.on('payment:success', handlePaymentSuccess);
    socket.on('payment:failed', handlePaymentFailed);

    return () => {
      socket.off('qris:generated', handleQRISGenerated);
      socket.off('payment:success', handlePaymentSuccess);
      socket.off('payment:failed', handlePaymentFailed);
    };
  }, [currentOrderId, paymentMethod]);

  // Timer for QRIS countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showQRModal && timeLeft > 0 && paymentStatus === 'PENDING') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPaymentStatus('EXPIRED');
            setShowQRModal(false);
            setNotification({ 
              message: 'Waktu pembayaran QRIS telah habis', 
              status: 'warning' 
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQRModal, timeLeft, paymentStatus]);

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
  const { total, margin } = useMemo(() => basket.reduce((acc, item) => { acc.total += item.finalPrice * item.quantity; acc.margin += item.margin_amount * item.quantity; return acc; }, { total: 0, margin: 0 }), [basket]);

  const updateBasketQuantity = (productId: string, newQuantity: number) => { 
    setBasket((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((item) => item.product_id !== productId);
      }
      
      const existing = prev.find((item) => item.product_id === productId);
      if (existing) {
        return prev.map((item) => 
          item.product_id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        );
      } else {
        // Add new item if quantity > 0
        const product = products.find(p => p.product_id === productId);
        if (product) {
    const finalPrice = computeFinalPriceForProduct(product, selectedMember?.tier);
          return [...prev, { 
            product_id: product.product_id, 
            product: product.product_name, 
            product_image: product.product_image, 
            quantity: newQuantity, 
            price: product.product_price, 
            finalPrice, 
            margin_amount: finalPrice - product.product_price 
          }];
        }
        return prev;
      }
    });
  };

  const handlePaymentMethodSelect = async (method: "CASH" | "QRIS") => {
    // Validate PIN first
    if (!pin || pin.length !== 6) {
      setNotification({ 
        message: "PIN harus 6 digit", 
        status: "error" 
      });
      return;
    }

    setPaymentMethod(method);
    setShowPaymentModal(false);
    setPaymentLoading(true);
    
    try {
      const checkoutData = { 
        koperasi_id: koperasiId, 
        items: basket.map((item) => ({ 
          product_id: item.product_id, 
          quantity: item.quantity, 
          unit_price: item.finalPrice, 
          original_price: item.price 
        })), 
        customer_info: { 
          name: selectedMember?.name || "Guest", 
          email: selectedMember?.email || "", 
          phone: selectedMember?.phone_number || "" 
        }, 
        payment_method: method, 
        order_summary: { 
          subtotal: total - margin, 
          margin, 
          total 
        }, 
        selected_member_tier: selectedMember?.tier || "NON_MEMBER", 
        pin: pin 
      };
      
      const response = await axiosInstance.post<ApiResponse<CheckoutResponse>>("/checkout/koperasi-catalog", checkoutData);
      
      if (response.data.success && response.data.data) {
        setLastOrderData({ ...checkoutData, ...response.data.data });
        setCurrentOrderId(response.data.data.order_id);
        
        if (method === "QRIS") {
          // For QRIS, show waiting state
          setPaymentStatus('PENDING');
          setTimeLeft(300);
          setShowQRISWaiting(true);
          setQrisError(null);
          
          if (response.data.data.qr_code) {
            // QRIS available, show QR modal
          setQrCode(response.data.data.qr_code);
            setShowQRModal(true);
            setShowQRISWaiting(false);
          } else {
            // QRIS not available, show waiting state
            setNotification({ 
              message: "Menunggu QRIS...", 
              status: "success" 
            });
          }
        } else {
          // For CASH, show receipt immediately and clear all QR states
          setShowReceipt(true);
          setShowQRModal(false);
          setShowSuccess(false);
          setQrCode(null);
          setPaymentStatus('PENDING');
          setCurrentOrderId(null);
          setNotification({ 
            message: "Pembayaran tunai berhasil dicatat.", 
            status: "success" 
          });
          // Clear basket after successful payment
          setBasket([]);
        }
      } else {
        setNotification({ 
          message: response.data.message || "Pembayaran gagal", 
          status: "error" 
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let message = "Terjadi kesalahan saat checkout";
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
        
        // Check if it's QRIS related error
        if (message.includes("QRIS") || message.includes("qris") || message.includes("pengajuan")) {
          setQrisError(message);
          setShowQRISWaiting(true);
          setPaymentMethod("QRIS");
        }
      } else if (error.message) {
        message = error.message;
      }
      
      setNotification({ message, status: "error" });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    setPin(""); // Reset PIN
    
    // Reset WebSocket states
    setCurrentOrderId(null);
    setShowQRModal(false);
    setPaymentStatus('PENDING');
    setTimeLeft(300);
    
    // Reset QRIS waiting states
    setShowQRISWaiting(false);
    setQrisError(null);
    
    if (status === 'cancelled') {
        setNotification({ message: 'Transaksi dibatalkan.', status: 'warning' });
    } else if (status === 'completed') {
        setNotification({ message: 'Transaksi berhasil diselesaikan.', status: 'success' });
    }
  };

  if (affiliationLoading) return <div className="flex items-center justify-center h-screen">Memuat...</div>;
  if (!koperasiId) return <div className="flex items-center justify-center h-screen">Akses Ditolak.</div>;

  return (
    <>
        {notification && <Notification message={notification.message} status={notification.status} onClose={() => setNotification(null)} />}

      {/* Main Layout - STIQR Style */}
      <div className={`${showPaymentModal || showQRModal || showReceipt || showSuccess || showQRISWaiting ? 'hidden' : 'flex'} w-full pb-40 flex-col min-h-screen items-center bg-orange-50`}>
        <div className="p-5 w-full">
          {/* Header */}
          <div className="w-full flex items-center gap-5 justify-between">
            <div className="flex items-center gap-5">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-semibold text-2xl">Kasir Koperasi</h1>
                <p className="text-xs text-gray-500">ID Koperasi: {koperasiId}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-orange-100 rounded-full text-orange-500 p-2"
            >
              + Input Manual
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-10 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
              <Search className="w-4 h-4" />
            </div>
            <Input
              placeholder="Cari Produk"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-12 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Customer Selection */}
          <div className="mt-5 p-3 border rounded-lg bg-white">
        <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${selectedMember?.tier === 'MEMBER' ? 'bg-blue-100 text-blue-600' : selectedMember?.tier === 'MEMBER_USAHA' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}>
                {React.createElement(selectedMember?.tier === 'MEMBER' ? Shield : selectedMember?.tier === 'MEMBER_USAHA' ? Crown : Users, {className: 'w-5 h-5'})}
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-gray-800">{selectedMember?.name}</p>
                <p className="text-xs text-gray-500">{selectedMember?.tier?.replace('_', ' ')}</p>
        </div>
                    <DialogCustomerSearch onSelectMember={updateMemberSelection} currentMember={selectedMember} fetchMembers={fetchMembers} members={members} />
                </div>
            </div>
        </div>

        {/* Products List - STIQR Style */}
        <div className="w-full px-5">
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-5 flex-1 cursor-auto overflow-hidden">
                    {/* Product Image */}
                    <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md overflow-hidden">
                      <img
                        src={product.product_image || noProduct}
                        alt={product.product_name}
                        className="h-full w-full object-cover rounded-md"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-start items-start min-w-0 overflow-hidden flex-grow">
                      <p className="text-lg font-semibold text-start truncate w-full">
                        {product.product_name}
                      </p>
                      <p className="font-semibold text-orange-600">
                        {formatRupiah(computeFinalPriceForProduct(product, selectedMember?.tier))}
                      </p>
                      {product.stock !== undefined && (
                        <span className="bg-orange-100 px-3 py-1 mt-1 rounded-full text-orange-500 font-normal text-xs">
                          Stok: {product.stock}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateBasketQuantity(product.product_id, Math.max(0, (basket.find(item => item.product_id === product.product_id)?.quantity || 0) - 1))}
                        className="w-8 h-8 flex items-center justify-center text-2xl font-semibold rounded-full bg-orange-100"
                      >
                        -
                      </button>

                      <Input
                        type="number"
                        className="text-center w-16 border rounded-md appearance-none px-2"
                        value={basket.find(item => item.product_id === product.product_id)?.quantity || 0}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          updateBasketQuantity(product.product_id, newQuantity);
                        }}
                        min={0}
                        max={product.stock || 999}
                      />

                      <button
                        onClick={() => updateBasketQuantity(product.product_id, (basket.find(item => item.product_id === product.product_id)?.quantity || 0) + 1)}
                        className="w-8 h-8 flex items-center justify-center text-2xl font-semibold rounded-full bg-orange-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Checkout Button - STIQR Style */}
        {basket.length > 0 && basket.some((item) => item.quantity > 0) && (
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="fixed w-[90%] bottom-20 rounded-full left-[50%] -translate-x-[50%] bg-green-500 text-white px-5 py-[25px] flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-5 justify-between w-full">
              <p className="text-base font-medium">{basket.reduce((total, item) => total + (item.quantity > 0 ? 1 : 0), 0)} Produk</p>
              <div className="flex items-center gap-2">
                <ShoppingCart className="scale-[1.5]" />
                <p className="text-lg font-bold">{formatRupiah(total)}</p>
              </div>
            </div>
          </Button>
        )}
      </div>

      {/* Payment Modal - STIQR Style */}
      {showPaymentModal && (
        <div className="fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 z-20 flex items-end justify-center">
          <div className="w-full bg-white rounded-t-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-2xl">Pilih Metode Pembayaran</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* PIN Input */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">PIN Transaksi</label>
              <Input 
                type="password" 
                placeholder="Masukkan PIN (6 digit)" 
                value={pin} 
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only numbers
                  if (value.length <= 6) {
                    setPin(value);
                  }
                }}
                maxLength={6}
                className="w-full text-center text-lg tracking-widest"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <p className="text-xs text-gray-500 mt-1">
                {pin.length}/6 digit
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Button 
                onClick={() => handlePaymentMethodSelect('CASH')} 
                disabled={paymentLoading || !pin || pin.length !== 6} 
                className="w-full h-16 justify-start bg-orange-100 text-orange-500 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading && paymentMethod === 'CASH' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500 mr-3"></div>
                ) : (
                  <Wallet className="mr-3" size={20} />
                )}
                <div className="text-left">
                  <div className="font-semibold">
                    {paymentLoading && paymentMethod === 'CASH' ? 'Memproses...' : 'Bayar Tunai'}
                  </div>
                  <div className="text-sm opacity-75">Pembayaran langsung</div>
                </div>
              </Button>

              <Button 
                onClick={() => handlePaymentMethodSelect('QRIS')} 
                disabled={paymentLoading || !pin || pin.length !== 6} 
                className="w-full h-16 justify-start bg-blue-100 text-blue-500 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading && paymentMethod === 'QRIS' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                ) : (
                  <QrCode className="mr-3" size={20} />
                )}
                <div className="text-left">
                  <div className="font-semibold">
                    {paymentLoading && paymentMethod === 'QRIS' ? 'Memproses...' : 'QRIS'}
                  </div>
                  <div className="text-sm opacity-75">Scan QR untuk pembayaran</div>
                </div>
              </Button>
      </div>

            {/* Order Summary */}
            <div className="mt-5 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Ringkasan Pesanan</h3>
              <div className="space-y-2">
                {basket.filter(item => item.quantity > 0).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.product} x{item.quantity}</span>
                    <span>{formatRupiah(item.finalPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastOrderData && <ModalTemplate title="Struk Pembayaran" onClose={() => resetTransaction('completed')}><CardContent className="text-sm space-y-2">
          <p><strong>Order ID:</strong> {lastOrderData.order_id}</p>
          <p><strong>Pelanggan:</strong> {lastOrderData.customer_info.name}</p>
          <div className="border-t pt-2 mt-2">{lastOrderData.items.map((it: any, i: number) => <div key={i} className="flex justify-between"><span>{it.product_id} x{it.quantity}</span><span>{formatRupiah(it.unit_price * it.quantity)}</span></div>)}</div>
          <div className="border-t pt-2 mt-2 font-bold flex justify-between"><span>Total</span><span>{formatRupiah(lastOrderData.order_summary.total)}</span></div>
      </CardContent><CardFooter><Button onClick={() => resetTransaction('completed')}>Tutup & Transaksi Baru</Button></CardFooter></ModalTemplate>}

      {showQRModal && qrCode && <ModalTemplate title="Scan untuk Membayar" onClose={() => resetTransaction('cancelled')}><CardContent className="text-center">
          <div className="mb-4">
          <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48"/>
          </div>
          <p className="text-2xl font-bold mt-2">{formatRupiah(total)}</p>
          
          {/* Payment Status */}
          <div className="mt-4 space-y-2">
            {paymentStatus === 'PENDING' && (
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span className="text-sm font-medium">Menunggu pembayaran...</span>
              </div>
            )}
            
            {paymentStatus === 'PAID' && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Pembayaran berhasil!</span>
              </div>
            )}
            
            {paymentStatus === 'FAILED' && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Pembayaran gagal</span>
              </div>
            )}
            
            {paymentStatus === 'EXPIRED' && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Waktu pembayaran habis</span>
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {paymentStatus === 'PENDING' && timeLeft > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600">Waktu tersisa:</div>
              <div className="text-lg font-bold text-orange-600">{formatTime(timeLeft)}</div>
            </div>
          )}

          {/* Order ID */}
          {currentOrderId && (
            <div className="mt-4 text-xs text-gray-500">
              Order ID: {currentOrderId}
            </div>
          )}
      </CardContent><CardFooter><Button variant="destructive" onClick={() => resetTransaction('cancelled')}>Batal</Button></CardFooter></ModalTemplate>}

      {/* QRIS Loading Modal */}
      {currentOrderId && !showQRModal && paymentStatus === 'PENDING' && <ModalTemplate title="Memproses QRIS" onClose={() => resetTransaction('cancelled')}><CardContent className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Memproses QRIS...</h3>
          <p className="text-sm text-gray-600 mb-4">Mohon tunggu sebentar</p>
          <div className="text-xs text-gray-500">
            Order ID: {currentOrderId}
          </div>
      </CardContent><CardFooter><Button variant="destructive" onClick={() => resetTransaction('cancelled')}>Batal</Button></CardFooter></ModalTemplate>}

      {showSuccess && <ModalTemplate title="" onClose={() => resetTransaction('completed')}><CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500"/>
          <h3 className="text-xl font-bold mt-4">Pembayaran Berhasil</h3>
          <p className="text-2xl font-bold text-orange-600">{formatRupiah(total)}</p>
          <Button onClick={() => resetTransaction('completed')} className="mt-4 w-full">Transaksi Baru</Button>
      </CardContent></ModalTemplate>}

      {/* QRIS Waiting Modal */}
      {showQRISWaiting && !qrisError && <ModalTemplate title="Menunggu QRIS" onClose={() => resetTransaction('cancelled')}><CardContent className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Menunggu QRIS...</h3>
          <p className="text-sm text-gray-600 mb-4">QRIS sedang diproses, mohon tunggu sebentar</p>
          {currentOrderId && (
            <div className="text-xs text-gray-500">
              Order ID: {currentOrderId}
            </div>
          )}
      </CardContent><CardFooter><Button variant="destructive" onClick={() => resetTransaction('cancelled')}>Batal</Button></CardFooter></ModalTemplate>}

      {/* QRIS Error Modal */}
      {showQRISWaiting && qrisError && <ModalTemplate title="QRIS Tidak Tersedia" onClose={() => resetTransaction('cancelled')}><CardContent className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-500"/>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-600">QRIS Belum Tersedia</h3>
          <p className="text-sm text-gray-600 mb-4">{qrisError}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p className="font-medium">Solusi:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Pastikan koperasi induk sudah melakukan pengajuan QRIS</li>
              <li>• Tunggu approval QRIS dari pihak NOBU</li>
              <li>• Gunakan metode pembayaran tunai untuk sementara</li>
            </ul>
    </div>
      </CardContent><CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => resetTransaction('cancelled')}>Batal</Button>
          <Button onClick={() => {
            setShowQRISWaiting(false);
            setQrisError(null);
            setShowPaymentModal(true);
          }}>Ganti Metode</Button>
      </CardFooter></ModalTemplate>}
    </>
  );
};

export default KasirKoperasi;

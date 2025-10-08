import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Search, 
  ShoppingCart, 
  Users, 
  Crown, 
  Shield, 
  Wallet, 
  QrCode, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Minus,
  UserCheck,
  Store
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { useAffiliation } from "@/hooks/useAffiliation";
import AOS from "aos";
import "aos/dist/aos.css";

// Types
interface Product {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
    finalPrice?: number;
    // Manual per-catalog prices (if present) - mapped from catalog item
    price_non_member?: number | null;
    price_member?: number | null;
    price_member_usaha?: number | null;
  product_image?: string;
  product_description?: string;
  tier: string;
  stock: number;
  merchant: {
    id: string;
    name: string;
    email: string;
    affiliation: string;
    approval_status: string;
  };
}

interface BasketItem {
  product_id: string;
  product_image?: string;
  product: string;
  quantity: number;
  price: number;
  finalPrice: number;
  margin_amount: number;
  notes?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  tier: 'NON_MEMBER' | 'MEMBER' | 'MEMBER_USAHA';
}

interface MarginRule {
  id: string;
  tier: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  product_id?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface CheckoutResponse {
  qr_code?: string;
  order_id: string;
}

interface PaymentStatusResponse {
  status: string;
}

const KasirKoperasi: React.FC = () => {
  const navigate = useNavigate();
  const { koperasiId, loading: affiliationLoading } = useAffiliation();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberQuery, setMemberQuery] = useState('');
  const [marginRules, setMarginRules] = useState<MarginRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('non_member');
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [lastOrderData, setLastOrderData] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 500, once: true });
  }, []);

  // Set initial tab and default member tier to Non Member so prices display correctly immediately
  useEffect(() => {
    setActiveTab('non_member');
    updateMemberSelection({ id: 'non-member', name: 'Non Anggota', email: '', phone_number: '', tier: 'NON_MEMBER' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API Functions
  const fetchProducts = useCallback(async (): Promise<void> => {
    if (!koperasiId) return;
    
    setLoading(true);
    try {
      // use merchant-scoped catalog which already contains pricing (manual overrides)
      // backend returns catalog items with shape similar to CatalogItem in ManajemenKatalog
      const response = await axiosInstance.get(`/koperasi/${koperasiId}/catalog/merchant`);
      const payload = response.data?.data ?? response.data ?? response.data;
      const items = Array.isArray(payload) ? payload : [];

      // Map catalog items to Product shape used in this component.
      const mapped: Product[] = items.map((it: any) => ({
        id: String(it.product?.id ?? it.id ?? it.product_id ?? Math.random()),
        product_id: String(it.product?.product_id ?? it.product_id ?? it.id),
        product_name: it.product?.product_name ?? it.product_name ?? it.name ?? '',
        product_price: Number(it.product?.product_price ?? it.product_price ?? it.price ?? 0),
        finalPrice: undefined,
        price_non_member: it.price_non_member !== undefined ? (it.price_non_member) : (it.product?.price_non_member ?? null),
        price_member: it.price_member !== undefined ? (it.price_member) : (it.product?.price_member ?? null),
        price_member_usaha: it.price_member_usaha !== undefined ? (it.price_member_usaha) : (it.product?.price_member_usaha ?? null),
        product_image: it.product?.product_image ?? it.product_image ?? it.image ?? undefined,
        product_description: it.product?.product_description ?? it.description ?? '',
        tier: it.product?.tier ?? 'NON_MEMBER',
        stock: Number(it.product?.stock ?? it.stock ?? 99999),
        merchant: it.product?.merchant ?? it.merchant ?? { id: '', name: '', email: '', affiliation: '', approval_status: '' }
      }));

      // store raw mapped products; finalPrice will be computed at render time
      setProducts(mapped);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [koperasiId]);

  // Product final prices are computed on render using current selectedMember

  // When switching tabs, set a default selectedMember tier so prices update immediately
  useEffect(() => {
    // If user already selected a specific member (id not one of defaults), preserve it
    const isDefaultMemberId = (id?: string | null) => !id || id === 'non-member' || id === 'member' || id === 'member-usaha';

    if (activeTab === 'non_member') {
      // Always set to non-member tier
      updateMemberSelection({ id: 'non-member', name: 'Non Anggota', email: '', phone_number: '', tier: 'NON_MEMBER' });
    } else if (activeTab === 'member') {
      // If currently no specific member selected, set generic MEMBER tier so prices update
      if (!selectedMember || isDefaultMemberId(selectedMember.id)) {
        updateMemberSelection({ id: 'member', name: 'Member', email: '', phone_number: '', tier: 'MEMBER' });
      }
    } else if (activeTab === 'member_usaha') {
      if (!selectedMember || isDefaultMemberId(selectedMember.id)) {
        updateMemberSelection({ id: 'member-usaha', name: 'Member Usaha', email: '', phone_number: '', tier: 'MEMBER_USAHA' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchMembers = useCallback(async (q: string): Promise<void> => {
    if (!koperasiId) return;
    
    try {
      const res = await axiosInstance.get(`/koperasi/${koperasiId}/members`, { 
        params: { status: 'APPROVED', q, limit: 50 }
      });
      // backend returns array directly; normalise if wrapped
      const raw = res.data;
      const membersArray = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);

      // Ensure each member has a tier derived from merchant.category when possible
      const membersData: Member[] = membersArray.map((m: any) => ({
        id: m.id,
        // Some merchant records may not have 'name' populated; fall back to user.username or email
        name: m.name || (m.user && m.user.username) || m.email || 'Unknown',
        email: m.email || '',
        phone_number: m.phone_number || '',
        tier: (m.category || '').toUpperCase().includes('USAHA') ? 'MEMBER_USAHA' : 'MEMBER'
      }));

      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  }, [koperasiId]);

  const fetchMarginRules = useCallback(async (): Promise<void> => {
    if (!koperasiId) return;
    
    try {
      const res = await axiosInstance.get<MarginRule[]>(`/koperasi/${koperasiId}/margins`);
      setMarginRules(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching margin rules:', error);
      setMarginRules([]);
    }
  }, [koperasiId]);

  // Compute final price for a product given a member tier and margin rules
  const computeFinalPriceForProduct = (product: Product, memberTier?: string): number => {
    const basePrice = Number(product.product_price) || 0;
    // Prefer manual catalog prices when available
    if (memberTier === 'MEMBER_USAHA' && product.price_member_usaha !== undefined && product.price_member_usaha !== null) {
      return Number(product.price_member_usaha);
    }
    if (memberTier === 'MEMBER' && product.price_member !== undefined && product.price_member !== null) {
      return Number(product.price_member);
    }
    if ((memberTier === 'NON_MEMBER' || memberTier === 'UMUM') && product.price_non_member !== undefined && product.price_non_member !== null) {
      return Number(product.price_non_member);
    }

    // If backend already provided finalPrice (computed server-side), use it
    if (typeof product.finalPrice === 'number') return Number(product.finalPrice);

    // IMPORTANT: do NOT use margin rules from Prisma to compute selling price/margin.
    // Per requirement, profit must be derived from the catalog item manual prices (price_non_member/price_member/price_member_usaha)
    // If no manual price is present and backend didn't provide finalPrice, fallback to base price.
    return basePrice;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (koperasiId && !affiliationLoading) {
        await Promise.all([
          fetchProducts(),
          fetchMembers(''),
          fetchMarginRules()
        ]);
      }
    };
    void fetchData();
    const onCatalogUpdate = () => {
      // re-fetch products to pick up manual price changes
      void fetchProducts();
    };
    window.addEventListener('catalog-item-updated', onCatalogUpdate as EventListener);
    return () => window.removeEventListener('catalog-item-updated', onCatalogUpdate as EventListener);
  }, [koperasiId, affiliationLoading, fetchProducts, fetchMembers, fetchMarginRules]);

  // Filter products based on search
  useEffect(() => {
    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Helper functions
  const getRuleForTier = (tier?: string): MarginRule | null => {
    if (!tier) return null;
    const rule = marginRules.find(r => r.tier === tier && !r.product_id);
    return rule || null;
  };

  const applyMargin = (basePrice: number, rule: MarginRule | null): number => {
    if (!rule) return basePrice;
    if (rule.type === 'PERCENT') {
      return Math.max(0, basePrice + (basePrice * Number(rule.value) / 100));
    }
    if (rule.type === 'FLAT') {
      return Math.max(0, basePrice + Number(rule.value));
    }
    return basePrice;
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'NON_MEMBER':
        return { 
          label: 'Non Anggota', 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Users,
          bgColor: 'bg-gray-50'
        };
      case 'MEMBER':
        return { 
          label: 'Member', 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Shield,
          bgColor: 'bg-blue-50'
        };
      case 'MEMBER_USAHA':
        return { 
          label: 'Member Usaha', 
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: Crown,
          bgColor: 'bg-orange-50'
        };
      default:
        return { 
          label: tier, 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Users,
          bgColor: 'bg-gray-50'
        };
    }
  };

  // Basket functions
  const addToBasket = (product: Product) => {
    if (!product || !product.product_id) return;

    const productPrice = Number(product.product_price) || 0;
    // Determine unit selling price preferring per-catalog manual prices, then finalPrice, then computed fallback
    const manualPrice = computeFinalPriceForProduct(product, selectedMember?.tier || 'NON_MEMBER');
    const finalPrice = manualPrice;
    const marginAmount = finalPrice - productPrice;

    setBasket((prevBasket) => {
      const existingIndex = prevBasket.findIndex(item => item.product_id === product.product_id);
      
      if (existingIndex >= 0) {
        return prevBasket.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevBasket,
          {
            product_id: product.product_id,
            product_image: product.product_image,
            product: product.product_name,
            quantity: 1,
            // price = original/base buying price
            price: productPrice,
            // finalPrice = selling price we will use for checkout
            finalPrice: finalPrice,
            margin_amount: marginAmount,
          },
        ];
      }
    });
  };

  const removeFromBasket = (productId: string) => {
    setBasket((prevBasket) => {
      const existingIndex = prevBasket.findIndex(item => item.product_id === productId);
      
      if (existingIndex >= 0) {
        return prevBasket
          .map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0);
      }
      return prevBasket;
    });
  };

  const updateMemberSelection = (member: Member | null) => {
    setSelectedMember(member);
    
    // Recalculate basket prices when member changes
    if (basket.length > 0) {
      setBasket(prevBasket => 
        prevBasket.map(item => {
          const memberTier = member?.tier || 'NON_MEMBER';
          // Try to find the original product to compute per-product rules first
          const originalProduct = products.find(p => String(p.product_id) === String(item.product_id));
          let finalPrice = item.price;
          if (originalProduct) {
            // recompute using catalog manual prices preference
            finalPrice = computeFinalPriceForProduct(originalProduct, memberTier);
          } else {
            // fallback to tier-wide rule
            const rule = getRuleForTier(memberTier);
            finalPrice = applyMargin(item.price, rule);
          }
          const marginAmount = finalPrice - item.price;

          return {
            ...item,
            finalPrice: finalPrice,
            margin_amount: marginAmount
          };
        })
      );
    }
  };

  const getBasketTotal = (): number => {
    if (!basket || basket.length === 0) return 0;
    return basket.reduce((total, item) => {
      const finalPrice = Number(item.finalPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (finalPrice * quantity);
    }, 0);
  };

  const getTotalMargin = (): number => {
    if (!basket || basket.length === 0) return 0;
    return basket.reduce((total, item) => {
      const marginAmount = Number(item.margin_amount) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (marginAmount * quantity);
    }, 0);
  };

  // Payment functions
  const handleCheckout = () => {
    if (basket.length === 0) {
      setPaymentError('Keranjang masih kosong');
      return;
    }

    // If no member selected, open customer selection dialog first
    if (!selectedMember) {
      setPendingCheckout(true);
      setShowCustomerDialog(true);
      return;
    }

    setShowPaymentModal(true);
    setPaymentError('');
  };

  const handlePaymentMethodSelect = async (method: 'CASH' | 'QRIS') => {
    setPaymentMethod(method);
    setPaymentError('');
    setShowPaymentModal(false);
    
    setPaymentLoading(true);
    try {
      const checkoutData = {
        koperasi_id: koperasiId,
        // Recompute unit prices server-side should be authoritative but we send the chosen unit_price
        items: basket.map(item => {
          const originalProduct = products.find(p => String(p.product_id) === String(item.product_id));
          // prefer catalog/manual selling price stored in item.finalPrice
          const computedUnitPrice = originalProduct ? computeFinalPriceForProduct(originalProduct, selectedMember?.tier || 'NON_MEMBER') : item.finalPrice;
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: Number(item.finalPrice ?? computedUnitPrice ?? item.price),
            original_price: item.price
          };
        }),
        customer_info: {
          name: selectedMember?.name || 'Guest',
          email: selectedMember?.email || '',
          phone: selectedMember?.phone_number || ''
        },
        payment_method: method,
        notes: '',
        // Recalculate order summary from recomputed unit prices to ensure checkout uses the edited/manual prices
        order_summary: (() => {
          const recomputed = basket.map(item => {
            const originalProduct = products.find(p => String(p.product_id) === String(item.product_id));
            const unit = Number(item.finalPrice ?? (originalProduct ? computeFinalPriceForProduct(originalProduct, selectedMember?.tier || 'NON_MEMBER') : item.price));
            const margin = unit - item.price;
            return { unit, margin, quantity: item.quantity };
          });
          const subtotal = recomputed.reduce((s, r) => s + (r.unit - r.margin) * r.quantity, 0);
          const totalMargin = recomputed.reduce((s, r) => s + (r.margin * r.quantity), 0);
          const total = recomputed.reduce((s, r) => s + (r.unit * r.quantity), 0);
          return { subtotal, margin: totalMargin, total };
        })(),
        selected_member_tier: selectedMember?.tier || 'NON_MEMBER'
      };

      const response = await axiosInstance.post<ApiResponse<CheckoutResponse>>('/checkout/koperasi-catalog', checkoutData);

      if (response.data.success && response.data.data) {
        // Save last order data to show receipt
        setLastOrderData(response.data.data as any);

        if (method === 'QRIS' && response.data.data.qr_code) {
          setQrCode(response.data.data.qr_code);
          startPaymentStatusPolling(response.data.data.order_id);
        } else {
          // Cash payment success -> show receipt modal with details
          setShowReceipt(true);
        }
      } else {
        setPaymentError(response.data.message || 'Pembayaran gagal');
      }
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Terjadi kesalahan saat memproses pembayaran';
      setPaymentError(errorMessage as string);
    } finally {
      setPaymentLoading(false);
    }
  };

  const startPaymentStatusPolling = (orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<PaymentStatusResponse>>(`/checkout/koperasi-status/${orderId}`);
        
        if (response.data.success && response.data.data) {
          const status = response.data.data.status;
          
          if (status === 'PAID') {
            clearInterval(pollInterval);
            setShowSuccess(true);
            setTimeout(() => {
              resetTransaction();
            }, 3000);
          } else if (status === 'FAILED' || status === 'EXPIRED') {
            clearInterval(pollInterval);
            setPaymentError('Pembayaran gagal atau expired. Silakan coba lagi.');
            setQrCode(null);
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000);

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (qrCode && !showSuccess) {
        setPaymentError('Waktu pembayaran habis. Silakan coba lagi.');
        setQrCode(null);
      }
    }, 600000);
  };

  const resetTransaction = () => {
    setBasket([]);
    setSelectedMember(null);
    setShowPaymentModal(false);
    setPaymentMethod(null);
    setPaymentLoading(false);
    setQrCode(null);
    setPaymentError('');
    setShowSuccess(false);
  };

  // Custom Badge component
  const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );

  // Custom Tabs component
  const Tabs = ({ 
    children 
  }: { 
    children: React.ReactNode;
  }) => (
    <div className="w-full">
      {children}
    </div>
  );

  const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );

  const TabsTrigger = ({ 
    value, 
    children, 
    className = '' 
  }: { 
    value: string; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        activeTab === value 
          ? 'bg-white text-gray-950 shadow-sm' 
          : 'text-gray-500 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );

  const TabsContent = ({ 
    value, 
    children, 
    className = '' 
  }: { 
    value: string; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 ${className}`}>
      {activeTab === value && children}
    </div>
  );

  // Loading and error states
  if (affiliationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-lg text-gray-600">Memuat kasir koperasi...</p>
        </div>
      </div>
    );
  }

  if (!koperasiId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Akses Ditolak</h3>
            <p className="mb-6 text-gray-600">
              Anda tidak memiliki akses ke kasir koperasi ini atau belum terafiliasi dengan koperasi.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="text-white bg-orange-500 hover:bg-orange-600"
            >
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <div className="p-6 text-white shadow-lg bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-orange-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Kasir Koperasi Induk</h1>
                <p className="text-orange-100">Sistem Point of Sale untuk Anggota Koperasi</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="text-orange-600 bg-white">
                <Store className="w-4 h-4 mr-1" />
                Koperasi Induk
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Products and Member Selection */}
          <div className="space-y-6 lg:col-span-2">
            {/* Member Selection Card */}
            <Card data-aos="fade-up">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <UserCheck className="w-5 h-5 mr-2 text-orange-500" />
                  Pilih Pembeli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="non_member" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Non Anggota
                    </TabsTrigger>
                    <TabsTrigger value="member" className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Member
                    </TabsTrigger>
                    <TabsTrigger value="member_usaha" className="flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      Member Usaha
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="non_member" className="mt-4 space-y-4">
                    <div className="p-4 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Non Anggota - Harga Normal</p>
                      <Button 
                        onClick={() => updateMemberSelection({
                          id: 'non-member',
                          name: 'Non Anggota',
                          email: '',
                          phone_number: '',
                          tier: 'NON_MEMBER'
                        })}
                        variant={selectedMember?.tier === 'NON_MEMBER' ? 'default' : 'outline'}
                        className="mt-2"
                      >
                        {selectedMember?.tier === 'NON_MEMBER' ? 'Terpilih' : 'Pilih Non Anggota'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="member" className="mt-4 space-y-4">
                    <Input
                      placeholder="Cari nama member..."
                      value={memberQuery}
                      onChange={(e) => {
                        setMemberQuery(e.target.value);
                        void fetchMembers(e.target.value);
                      }}
                      className="w-full"
                    />
                    <div className="space-y-2 overflow-y-auto max-h-60">
                      {(() => {
                        const memberList = members.filter(m => m.tier === 'MEMBER');
                        if (memberList.length === 0) return <div className="p-4 text-sm text-center text-gray-500">Tidak ada anggota ditemukan.</div>;
                        return memberList.map(member => (
                          <div
                            key={member.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedMember?.id === member.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                            }`}
                            onClick={() => updateMemberSelection(member)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.phone_number}</p>
                              </div>
                              <Badge className="text-blue-800 bg-blue-100">Member</Badge>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </TabsContent>

                  <TabsContent value="member_usaha" className="mt-4 space-y-4">
                    <Input
                      placeholder="Cari nama member usaha..."
                      value={memberQuery}
                      onChange={(e) => {
                        setMemberQuery(e.target.value);
                        void fetchMembers(e.target.value);
                      }}
                      className="w-full"
                    />
                    <div className="space-y-2 overflow-y-auto max-h-60">
                      {(() => {
                        const usahaList = members.filter(m => m.tier === 'MEMBER_USAHA');
                        if (usahaList.length === 0) return <div className="p-4 text-sm text-center text-gray-500">Tidak ada anggota usaha ditemukan.</div>;
                        return usahaList.map(member => (
                          <div
                            key={member.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedMember?.id === member.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                            }`}
                            onClick={() => updateMemberSelection(member)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.phone_number}</p>
                              </div>
                              <Badge className="text-orange-800 bg-orange-100">Member Usaha</Badge>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </TabsContent>
                </Tabs>

                {selectedMember && (
                  <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">{selectedMember.name}</p>
                          <p className="text-sm text-green-600">{selectedMember.tier}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMemberSelection(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Ubah
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products Catalog */}
            <Card data-aos="fade-up" data-aos-delay="100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Store className="w-5 h-5 mr-2 text-orange-500" />
                    Katalog Produk Koperasi
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <Input
                      placeholder="Cari produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 mx-auto border-2 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Memuat produk...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Tidak ada produk ditemukan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product) => {
                      // compute finalPrice dynamically using selectedMember tier
                      const finalPrice = Number(computeFinalPriceForProduct(product, selectedMember?.tier || 'NON_MEMBER') ?? product.product_price);
                      const marginAmount = finalPrice - product.product_price;
                      const basketItem = basket.find(item => item.product_id === product.product_id);
                      // Show the buyer's tier (selectedMember) in the product card so badge matches displayed selling price
                      const tierInfo = getTierInfo(selectedMember?.tier || product.tier);
                      // determine if price came from a manual catalog override
                      const isManualPrice = (
                        (selectedMember?.tier === 'MEMBER_USAHA' && product.price_member_usaha !== undefined && product.price_member_usaha !== null) ||
                        (selectedMember?.tier === 'MEMBER' && product.price_member !== undefined && product.price_member !== null) ||
                        ((selectedMember?.tier === 'NON_MEMBER' || !selectedMember) && product.price_non_member !== undefined && product.price_non_member !== null)
                      );

                      return (
                        <div
                          key={product.product_id}
                          className="p-4 transition-all bg-white border rounded-lg hover:shadow-md"
                        >
                          <div className="mb-3 overflow-hidden bg-gray-100 rounded-lg aspect-square">
                            {product.product_image ? (
                              <img
                                src={product.product_image}
                                alt={product.product_name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                <Store className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="flex-1 text-sm font-medium line-clamp-2">
                                {product.product_name}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${tierInfo.color}`}>
                                  {tierInfo.label}
                                </Badge>
                                {isManualPrice && (
                                  <Badge className="text-xs text-green-800 bg-green-100">
                                    Catalog
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Harga Dasar:</span>
                                <span className="text-xs text-gray-600">
                                  {formatRupiah(product.product_price)}
                                </span>
                              </div>
                              {marginAmount > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-orange-600">Margin:</span>
                                  <span className="text-xs text-orange-600">
                                    +{formatRupiah(marginAmount)}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Harga Jual:</span>
                                <span className="font-bold text-orange-600">
                                  {formatRupiah(finalPrice)}
                                </span>
                                {!isManualPrice && (
                                  <div className="text-xs text-gray-500">(rule)</div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              {basketItem ? (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromBasket(product.product_id)}
                                    className="w-8 h-8 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 font-medium text-center">
                                    {basketItem.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addToBasket(product)}
                                    className="w-8 h-8 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToBasket(product)}
                                  className="text-white bg-orange-500 hover:bg-orange-600"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Tambah
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Basket and Checkout */}
          <div className="space-y-6">
            {/* Basket Summary */}
            <Card data-aos="fade-left">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <ShoppingCart className="w-5 h-5 mr-2 text-orange-500" />
                  Keranjang Belanja
                </CardTitle>
              </CardHeader>
              <CardContent>
                {basket.length === 0 ? (
                  <div className="py-8 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Keranjang masih kosong</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {basket.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center flex-1 space-x-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product} className="object-cover w-10 h-10 rounded" />
                            ) : (
                              <Store className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{item.product}</p>
                            <p className="text-xs text-gray-600">
                              {formatRupiah(item.finalPrice)} × {item.quantity}
                            </p>
                            {/* indicate if this basket item used a manual catalog price */}
                            {(() => {
                              const prod = products.find(p => String(p.product_id) === String(item.product_id));
                              const usedManual = prod ? (
                                (selectedMember?.tier === 'MEMBER_USAHA' && prod.price_member_usaha !== undefined && prod.price_member_usaha !== null) ||
                                (selectedMember?.tier === 'MEMBER' && prod.price_member !== undefined && prod.price_member !== null) ||
                                ((selectedMember?.tier === 'NON_MEMBER' || !selectedMember) && prod.price_non_member !== undefined && prod.price_non_member !== null)
                              ) : false;
                              return usedManual ? <div className="text-xs text-green-600">Harga dari katalog</div> : null;
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">
                            {formatRupiah(item.finalPrice * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromBasket(item.product_id)}
                            className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Summary */}
                    <div className="pt-3 space-y-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatRupiah(getBasketTotal() - getTotalMargin())}</span>
                      </div>
                      {getTotalMargin() > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-600">Total Margin:</span>
                          <span className="text-orange-600">+{formatRupiah(getTotalMargin())}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 text-lg font-bold border-t">
                        <span>Total Tagihan:</span>
                        <span className="text-orange-600">{formatRupiah(getBasketTotal())}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={!selectedMember || basket.length === 0}
                      className="w-full py-3 text-white bg-orange-500 hover:bg-orange-600"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Proses Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Member Info */}
            {selectedMember && (
              <Card data-aos="fade-left" data-aos-delay="200">
                <CardContent className="pt-6">
                  <div className={`p-4 rounded-lg ${getTierInfo(selectedMember.tier).bgColor}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getTierInfo(selectedMember.tier).color}`}>
                        {React.createElement(getTierInfo(selectedMember.tier).icon, { className: "w-5 h-5" })}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedMember.name}</p>
                        <p className="text-sm text-gray-600">{selectedMember.tier}</p>
                        {selectedMember.phone_number && (
                          <p className="text-sm text-gray-600">{selectedMember.phone_number}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Pilih Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handlePaymentMethodSelect('CASH')}
                disabled={paymentLoading}
                className="justify-start w-full h-16 border-2 border-green-200 bg-green-50 hover:bg-green-100"
              >
                <Wallet className="w-6 h-6 mr-3 text-green-600" />
                <div className="text-left">
                  <p className="font-semibold">Bayar Tunai</p>
                  <p className="text-sm text-gray-600">Pembayaran langsung di kasir</p>
                </div>
              </Button>

              <Button
                onClick={() => handlePaymentMethodSelect('QRIS')}
                disabled={paymentLoading}
                className="justify-start w-full h-16 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100"
              >
                <QrCode className="w-6 h-6 mr-3 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold">QRIS</p>
                  <p className="text-sm text-gray-600">Scan QR code untuk pembayaran</p>
                </div>
              </Button>

              {paymentError && (
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentLoading}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Selection Dialog (appears when checkout started without selected member) */}
      {showCustomerDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center">Pilih Pembeli untuk Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button onClick={() => { updateMemberSelection({ id: 'non-member', name: 'Non Anggota', email: '', phone_number: '', tier: 'NON_MEMBER' }); setShowCustomerDialog(false); if (pendingCheckout) { setPendingCheckout(false); setShowPaymentModal(true); } }} className={`flex-1 ${selectedMember?.tier === 'NON_MEMBER' ? 'bg-orange-500 text-white' : ''}`}>Non Anggota</Button>
                  <Button onClick={() => { updateMemberSelection({ id: 'member', name: 'Member', email: '', phone_number: '', tier: 'MEMBER' }); setShowCustomerDialog(false); if (pendingCheckout) { setPendingCheckout(false); setShowPaymentModal(true); } }} className={`flex-1 ${selectedMember?.tier === 'MEMBER' ? 'bg-blue-500 text-white' : ''}`}>Member</Button>
                  <Button onClick={() => { updateMemberSelection({ id: 'member-usaha', name: 'Member Usaha', email: '', phone_number: '', tier: 'MEMBER_USAHA' }); setShowCustomerDialog(false); if (pendingCheckout) { setPendingCheckout(false); setShowPaymentModal(true); } }} className={`flex-1 ${selectedMember?.tier === 'MEMBER_USAHA' ? 'bg-orange-600 text-white' : ''}`}>Member Usaha</Button>
                </div>

                <div>
                  <Input placeholder="Cari nama member..." value={memberQuery} onChange={(e) => { setMemberQuery(e.target.value); void fetchMembers(e.target.value); }} />
                  <div className="mt-2 max-h-48 overflow-y-auto">
                    {members.length === 0 ? <div className="p-2 text-sm text-gray-500">Tidak ada member</div> : members.map(m => (
                      <div key={m.id} className={`p-2 border rounded mb-1 cursor-pointer ${selectedMember?.id === m.id ? 'bg-orange-50 border-orange-300' : 'border-gray-100'}`} onClick={() => { updateMemberSelection(m); setShowCustomerDialog(false); if (pendingCheckout) { setPendingCheckout(false); setShowPaymentModal(true); } }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-gray-500">{m.phone_number}</div>
                          </div>
                          <div className="text-xs text-gray-400">{m.tier}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowCustomerDialog(false); setPendingCheckout(false); }}>Batal</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Struk Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Order ID</span><span>{lastOrderData.order_id}</span></div>
                <div className="flex justify-between"><span>Buyer</span><span>{selectedMember?.name ?? 'Guest'} ({lastOrderData.member_type ?? selectedMember?.tier})</span></div>
                <div className="flex justify-between"><span>Metode</span><span>{lastOrderData.payment_method}</span></div>
                <div className="pt-2 border-t">
                  <div className="font-medium">Items</div>
                  {lastOrderData.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div>{it.product_id} × {it.quantity}</div>
                      <div>{formatRupiah(it.unit_price * it.quantity)}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(Number(lastOrderData.total_amount) - Number(lastOrderData.margin_amount || 0))}</span></div>
                  <div className="flex justify-between"><span>Total Margin</span><span className="text-orange-600">+{formatRupiah(Number(lastOrderData.margin_amount || 0))}</span></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span>{formatRupiah(Number(lastOrderData.total_amount))}</span></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button onClick={() => { setShowReceipt(false); resetTransaction(); setLastOrderData(null); }}>Tutup & Baru</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* QR Code Modal */}
      {qrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-sm text-center">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white border-2 border-gray-300 border-dashed rounded-lg">
                <div className="flex items-center justify-center w-48 h-48 mx-auto bg-gray-100 rounded-lg">
                  <QrCode size={120} className="text-gray-400" />
                </div>
                <p className="mt-2 text-xs text-gray-500">QR: {qrCode.substring(0, 20)}...</p>
              </div>
              <p className="text-lg font-semibold text-orange-600">
                {formatRupiah(getBasketTotal())}
              </p>
              <p className="text-sm text-gray-600">Menunggu pembayaran...</p>
              <Button
                variant="outline"
                onClick={resetTransaction}
                disabled={paymentLoading}
              >
                Batalkan
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-sm text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">Pembayaran Berhasil!</h3>
              <p className="mb-4 text-gray-600">
                Transaksi telah berhasil diproses. {paymentMethod === 'QRIS' ? 'Pembayaran QRIS' : 'Pembayaran tunai'} telah diterima.
              </p>
              <p className="mb-4 text-lg font-semibold text-orange-600">
                {formatRupiah(getBasketTotal())}
              </p>
              <Button
                onClick={resetTransaction}
                className="text-white bg-orange-500 hover:bg-orange-600"
              >
                Transaksi Baru
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading Overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-sm text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
              <p className="text-gray-600">
                {paymentMethod === 'QRIS' ? 'Memproses QRIS...' : 'Memproses pembayaran tunai...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KasirKoperasi;
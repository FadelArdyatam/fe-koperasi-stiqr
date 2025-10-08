import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliation } from '../../hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Notification from '@/components/Notification';

import { ArrowLeft, Pencil, Trash2, Home, ScanQrCode, CreditCard, FileText, UserRound, Tag, Percent } from 'lucide-react';

// --- Interfaces ---
type Tier = 'NON_MEMBER' | 'MEMBER' | 'MEMBER_USAHA' | 'UMUM';

interface MasterProduct {
    id: number;
    product_id: string;
    product_name: string;
    product_price: number;
    product_category: string;
    product_image: string;
}

interface CatalogItem {
    id: number;
    is_active: boolean;
    notes: string | null;
    price_non_member?: number | null;
    price_member?: number | null;
    price_member_usaha?: number | null;
    product: MasterProduct;
}

interface MarginRule {
    tier: Tier;
    type: 'FLAT' | 'PERCENT';
    value: number;
}

// --- Main Component ---
const ManajemenKatalog: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId, loading: affiliationLoading } = useAffiliation();

    const [items, setItems] = useState<CatalogItem[]>([]);
    const [marginRules, setMarginRules] = useState<MarginRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<CatalogItem> | null>(null);

    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState({ message: '', status: 'success' as 'success' | 'error' });

    const triggerNotification = (message: string, status: 'success' | 'error') => {
        setNotification({ message, status });
        setShowNotification(true);
    };

    const fetchItems = useCallback(async () => {
        if (!koperasiId) return;
        setLoading(true);
        try {
            const [itemsRes, marginsRes] = await Promise.all([
                axiosInstance.get(`/koperasi/${koperasiId}/catalog/items`),
                axiosInstance.get(`/koperasi/${koperasiId}/margins`)
            ]);
            setItems(itemsRes.data || []);
            setMarginRules(marginsRes.data || []);
        } catch (error) {
            triggerNotification('Gagal memuat data katalog atau margin.', 'error');
        } finally {
            setLoading(false);
        }
    }, [koperasiId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const calculateSellingPrice = useCallback((basePrice: number, tier: Tier) => {
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

    // Prefer manual prices set per catalog item; fallback to margin rules calculation
    const getDisplayedPriceForItem = useCallback((item: CatalogItem, tier: Tier) => {
        const basePrice = item.product.product_price;
        if (tier === 'MEMBER_USAHA' && (item.price_member_usaha !== undefined && item.price_member_usaha !== null)) {
            return Number(item.price_member_usaha);
        }
        if (tier === 'MEMBER' && (item.price_member !== undefined && item.price_member !== null)) {
            return Number(item.price_member);
        }
        if ((tier === 'NON_MEMBER' || tier === 'UMUM') && (item.price_non_member !== undefined && item.price_non_member !== null)) {
            return Number(item.price_non_member);
        }

        // fallback to rule-based calculation
        return calculateSellingPrice(basePrice, tier);
    }, [calculateSellingPrice]);

    const handleSaveNotes = useCallback(async () => {
        if (!editingItem || !editingItem.id || !koperasiId) return;
        const url = `/koperasi/${koperasiId}/catalog/items/${editingItem.id}`;
        const payload: any = { notes: editingItem.notes, is_active: editingItem.is_active };
        // include manual prices if present
        if (editingItem.price_non_member !== undefined) payload.price_non_member = editingItem.price_non_member === null ? null : Number(editingItem.price_non_member);
        if (editingItem.price_member !== undefined) payload.price_member = editingItem.price_member === null ? null : Number(editingItem.price_member);
        if (editingItem.price_member_usaha !== undefined) payload.price_member_usaha = editingItem.price_member_usaha === null ? null : Number(editingItem.price_member_usaha);
    // margin_percent removed: frontend will derive margin from price fields (selling - buying)
        try {
            await axiosInstance.put(url, payload);
            triggerNotification(`Catatan berhasil diperbarui.`, 'success');
            // Optimistic UI Update
            setItems(prevItems =>
                prevItems.map(item => {
                    if (item.id !== editingItem.id) return item;
                    return {
                        ...item,
                        notes: editingItem.notes ?? item.notes ?? null,
                        price_non_member: editingItem.price_non_member !== undefined ? editingItem.price_non_member : (item as any).price_non_member ?? null,
                        price_member: editingItem.price_member !== undefined ? editingItem.price_member : (item as any).price_member ?? null,
                        price_member_usaha: editingItem.price_member_usaha !== undefined ? editingItem.price_member_usaha : (item as any).price_member_usaha ?? null,
                        // no margin_percent field - margin is computed from prices
                    } as CatalogItem;
                })
            );
            // Notify other parts of the app (e.g., kasir) that catalog item was updated so they can refetch
            try {
                window.dispatchEvent(new CustomEvent('catalog-item-updated', { detail: { itemId: editingItem.id } }));
            } catch (e) {
                // ignore if window not available (SSR) or dispatch fails
            }
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (error: any) {
            triggerNotification(error.response?.data?.message || `Gagal menyimpan catatan.`, 'error');
        }
    }, [editingItem, koperasiId]);

    const handleDeleteItem = useCallback(async (itemId: number) => {
        try {
            await axiosInstance.delete(`/koperasi/${koperasiId}/catalog/items/${itemId}`);
            triggerNotification('Item berhasil dihapus dari katalog.', 'success');
            fetchItems(); // Re-fetch data on success
        } catch (error: any) {
            triggerNotification(error.response?.data?.message || 'Gagal menghapus item.', 'error');
        }
    }, [koperasiId, fetchItems]);

    const handleToggleActive = useCallback(async (item: CatalogItem) => {
        const payload = { is_active: !item.is_active, notes: item.notes };
        try {
            await axiosInstance.put(`/koperasi/${koperasiId}/catalog/items/${item.id}`, payload);
            triggerNotification(`Status item berhasil diperbarui.`, 'success');
            setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, is_active: !item.is_active } : i));
        } catch (error: any) {
            triggerNotification(error.response?.data?.message || 'Gagal memperbarui status.', 'error');
        }
    }, [koperasiId]);

    const openModal = useCallback((item: CatalogItem) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    }, []);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // parse numeric price fields into numbers or null
        if (name.startsWith('price_')) {
            const numeric = value === '' ? null : Number(value);
            setEditingItem(prev => (prev ? { ...prev, [name]: numeric } : null));
        } else {
            setEditingItem(prev => (prev ? { ...prev, [name]: value } : null));
        }
    }, []);

    const formatRupiah = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const Header = () => (
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 p-4 mb-0 bg-white border-b">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
                <h1 className="text-xl font-bold">Manajemen Katalog</h1>
            </div>
        </header>
    );

    if (affiliationLoading || loading) {
        return (
            <div className="min-h-screen pb-28 bg-gray-50">
                <Header />
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-200 rounded-lg h-72 animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28 bg-gray-50">
            {showNotification && <Notification message={notification.message} status={notification.status} onClose={() => setShowNotification(false)} />}
            <Header />
            <div className="p-4">
                {items.length === 0 ? (
                    <div className="py-16 text-center"><p>Katalog kosong.</p></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => {
                            const basePrice = item.product.product_price;
                            const memberPrice = getDisplayedPriceForItem(item, 'MEMBER');
                            const nonMemberPrice = getDisplayedPriceForItem(item, 'NON_MEMBER');
                            const memberUsahaPrice = getDisplayedPriceForItem(item, 'MEMBER_USAHA');

                            return (
                                <Card key={item.id} className="flex flex-col overflow-hidden transition-all duration-300 group">
                                    <CardHeader className="relative p-0">
                                        <div className="flex items-center justify-center h-40 overflow-hidden bg-gray-100">
                                            <img src={item.product.product_image || undefined} alt={item.product.product_name} className={`h-full w-full object-contain transition-all ${!item.is_active ? 'grayscale' : ''}`} />
                                            {!item.is_active && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                                    <p className="text-xl font-bold tracking-wider text-white">NONAKTIF</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-grow p-3">
                                        <h3 className="text-base font-semibold leading-snug truncate">{item.product.product_name}</h3>
                                        <p className="mb-2 text-xs text-gray-500">{item.product.product_category}</p>

                                        <div className="flex-grow pt-2 mt-2 space-y-1 text-xs border-t">
                                            <div className="flex items-center justify-between text-gray-600">
                                                <span className="flex items-center gap-1"><Tag size={12} /> Harga Beli</span>
                                                <span className="font-semibold">{formatRupiah(basePrice)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-green-600">
                                                <span className="flex items-center gap-1"><Percent size={12} /> Jual (Anggota)</span>
                                                <span className="font-semibold">{formatRupiah(memberPrice)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-orange-600">
                                                <span className="flex items-center gap-1"><Percent size={12} /> Jual (Anggota Usaha)</span>
                                                <span className="font-semibold">{formatRupiah(memberUsahaPrice)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-blue-600">
                                                <span className="flex items-center gap-1"><Percent size={12} /> Jual (Umum)</span>
                                                <span className="font-semibold">{formatRupiah(nonMemberPrice)}</span>
                                            </div>
                                        </div>
                                        <p className="pt-2 mt-2 text-xs text-gray-500 truncate border-t">Catatan: {item.notes || '-'}</p>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-between gap-1 p-2 border-t bg-gray-50">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" title="Edit Catatan" onClick={() => openModal(item)}><Pencil className="w-4 h-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" title="Hapus dari Katalog"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Hapus item ini?</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Hapus</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor={`switch-${item.id}`} className="text-sm font-medium">Aktif</Label>
                                            <Switch id={`switch-${item.id}`} checked={item.is_active} onCheckedChange={() => handleToggleActive(item)} />
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Catatan Item</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="notes">Catatan</Label>
                        <Input id="notes" name="notes" value={editingItem?.notes || ''} onChange={handleFormChange} />
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="price_non_member">Harga Non Member (IDR)</Label>
                            <Input id="price_non_member" name="price_non_member" value={editingItem?.price_non_member ?? ''} onChange={handleFormChange} />

                            <Label htmlFor="price_member">Harga Member (IDR)</Label>
                            <Input id="price_member" name="price_member" value={editingItem?.price_member ?? ''} onChange={handleFormChange} />

                            <Label htmlFor="price_member_usaha">Harga Member Usaha (IDR)</Label>
                            <Input id="price_member_usaha" name="price_member_usaha" value={editingItem?.price_member_usaha ?? ''} onChange={handleFormChange} />

                            {/* Display computed margins (selling - buying) for visibility */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>Margin (Anggota)</span>
                                    <span className="font-semibold">{editingItem ? formatRupiah(getDisplayedPriceForItem(editingItem as CatalogItem, 'MEMBER') - ((editingItem as any)?.product?.product_price ?? 0)) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>Margin (Anggota Usaha)</span>
                                    <span className="font-semibold">{editingItem ? formatRupiah(getDisplayedPriceForItem(editingItem as CatalogItem, 'MEMBER_USAHA') - ((editingItem as any)?.product?.product_price ?? 0)) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>Margin (Umum)</span>
                                    <span className="font-semibold">{editingItem ? formatRupiah(getDisplayedPriceForItem(editingItem as CatalogItem, 'NON_MEMBER') - ((editingItem as any)?.product?.product_price ?? 0)) : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleSaveNotes}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div id="navbar" className="fixed bottom-0 z-10 flex items-end justify-between w-full gap-5 px-3 py-2 text-xs bg-white border">
                <Link to={'/dashboard'} className="flex flex-col items-center gap-3 text-orange-400"><Home /><p className="uppercase">Home</p></Link>
                <Link to={'/qr-code'} className="flex flex-col items-center gap-3"><ScanQrCode /><p className="uppercase">Qr Code</p></Link>
                <Link to={'/settlement'} data-cy='penarikan-btn' className="relative flex flex-col items-center gap-3"><div className="absolute flex items-center justify-center w-16 h-16 text-white bg-orange-400 rounded-full shadow-md -top-20"><CreditCard /></div><p className="uppercase">Penarikan</p></Link>
                <Link to={'/catalog'} className="flex flex-col items-center gap-3"><FileText /><p className="uppercase">Catalog</p></Link>
                <Link to={'/profile'} className="flex flex-col items-center gap-3" data-cy="profile-link"><UserRound /><p className="uppercase">Profile</p></Link>
            </div>
        </div>
    );
};

export default ManajemenKatalog;
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAffiliation } from '../../hooks/useAffiliation';
import axiosInstance from '@/hooks/axiosInstance';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Notification from '@/components/Notification';

import { ArrowLeft, ShoppingBag, Pencil, Trash2, Home, ScanQrCode, CreditCard, FileText, UserRound } from 'lucide-react';

// --- Interface ---
interface MasterProduct {
    id: number;
    product_id: string;
    product_name: string;
    product_price: number;
    product_category: string;
    product_description: string;
    product_image: string;
}

interface CatalogItem {
    id: number;
    koperasi_id: string;
    product_id: string;
    is_active: boolean;
    notes: string | null;
    product: MasterProduct;
}

// --- Main Component ---
const ManajemenKatalog: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId, loading: affiliationLoading } = useAffiliation();
    
    const [items, setItems] = useState<CatalogItem[]>([]);
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
            const response = await axiosInstance.get(`/koperasi/${koperasiId}/catalog/items`);
            setItems(response.data || []);
        } catch (error) {
            triggerNotification('Gagal memuat produk dari katalog.', 'error');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [koperasiId]);

    useEffect(() => {
        if (koperasiId) {
            fetchItems();
        }
    }, [koperasiId, fetchItems]);

    const handleSaveNotes = async () => {
        if (!editingItem || !editingItem.id || !koperasiId) return;

        const url = `/koperasi/${koperasiId}/catalog/items/${editingItem.id}`;
        const payload = {
            notes: editingItem.notes,
            is_active: editingItem.is_active,
        };

        try {
            await axiosInstance.put(url, payload);
            triggerNotification(`Catatan berhasil diperbarui.`, 'success');
            setIsModalOpen(false);
            setEditingItem(null);
            fetchItems();
        } catch (error: any) {
            triggerNotification(error.response?.data?.message || `Gagal menyimpan catatan.`, 'error');
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        try {
            await axiosInstance.delete(`/koperasi/${koperasiId}/catalog/items/${itemId}`);
            triggerNotification('Item berhasil dihapus dari katalog.', 'success');
            fetchItems();
        } catch (error: any) {
            triggerNotification(error.response?.data?.message || 'Gagal menghapus item.', 'error');
        }
    };
    
    const handleToggleActive = async (item: CatalogItem) => {
        const payload = { is_active: !item.is_active, notes: item.notes };
        try {
            await axiosInstance.put(`/koperasi/${koperasiId}/catalog/items/${item.id}`, payload);
            triggerNotification(`Status item berhasil diperbarui.`, 'success');
            setItems(prevItems => prevItems.map(i => i.id === item.id ? {...i, is_active: !item.is_active} : i));
        } catch (error: any) {
            triggerNotification(error.response?.data?.message || 'Gagal memperbarui status.', 'error');
        }
    };


    const openModal = (item: CatalogItem) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (!editingItem) return;
        setEditingItem({
            ...editingItem,
            [name]: value,
        });
    };

    // --- Skeleton Component ---
    const ProductCardSkeleton = () => (
        <Card className="overflow-hidden">
            <div className="h-40 bg-gray-200 animate-pulse"></div>
            <CardContent className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-md animate-pulse"></div>
            </CardFooter>
        </Card>
    );

    const Header = () => (
        <header className="p-4 flex items-center justify-between gap-4 mb-0 bg-white border-b sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Manajemen Katalog</h1>
            </div>
            <div className="flex items-center gap-2">
            </div>
        </header>
    );


    if (affiliationLoading || loading) {
        return (
            <div className="pb-4 bg-gray-50 min-h-screen">
                <Header />
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28 bg-gray-50 min-h-screen">
            {showNotification && <Notification message={notification.message} status={notification.status} onClose={() => setShowNotification(false)} />}
            
            <Header />

            <div className="p-4">
                {items.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-lg border">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Katalog Kosong</h3>
                        <p className="mt-1 text-sm text-gray-500">Belum ada produk di katalog ini. Coba sinkronkan produk lama jika ada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <Card key={item.id} className="overflow-hidden flex flex-col group transition-all duration-300">
                                <CardHeader className="p-0 relative">
                                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {item.product.product_image ? (
                                            <img src={item.product.product_image} alt={item.product.product_name} className={`h-full w-full object-contain transition-all ${!item.is_active ? 'grayscale' : ''}`} />
                                        ) : (
                                            <ShoppingBag className="w-16 h-16 text-gray-300" />
                                        )}
                                        {!item.is_active && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <p className="text-white font-bold text-xl tracking-wider">NONAKTIF</p>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow flex flex-col">
                                    <h3 className="font-semibold leading-snug truncate">{item.product.product_name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">Kategori: {item.product.product_category}</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.product.product_price)}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">Catatan: {item.notes || '-'}</p>
                                </CardContent>
                                <CardFooter className="p-2 bg-gray-50 border-t flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" title="Edit Catatan" onClick={() => openModal(item)}><Pencil className="w-4 h-4 text-blue-600" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" title="Hapus dari Katalog"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Anda yakin ingin menghapus item ini?</AlertDialogTitle>
                                                    <AlertDialogDescription>"{item.product.product_name}" akan dihapus dari katalog koperasi Anda, bukan dari katalog pusat.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor={`switch-${item.id}`} className="text-sm font-medium">Aktif</Label>
                                        <Switch
                                            id={`switch-${item.id}`}
                                            checked={item.is_active}
                                            onCheckedChange={() => handleToggleActive(item)}
                                        />
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Notes Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Catatan Item</DialogTitle>
                        <DialogDescription>Tambahkan atau ubah catatan untuk produk ini di katalog koperasi Anda.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">Catatan</Label>
                            <Input id="notes" name="notes" value={editingItem?.notes || ''} onChange={handleFormChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleSaveNotes}>Simpan Catatan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                <Link to={'/profile'} className="flex gap-3 flex-col items-center" data-cy="profile-link">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>
        </div>
    );
};

export default ManajemenKatalog;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, ShoppingBag, } from 'lucide-react';
import Notification from '@/components/Notification';

// --- Interface (diasumsikan sama dengan di ManajemenKatalog) ---
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
    product: MasterProduct;
}

const KatalogPublik: React.FC = () => {
    const { koperasiId } = useParams<{ koperasiId: string }>();
    const navigate = useNavigate();
    
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [koperasiInfo, setKoperasiInfo] = useState({ nama_koperasi: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicCatalog = async () => {
            if (!koperasiId) return;
            setLoading(true);
            try {
                // GANTI DENGAN ENDPOINT YANG BENAR
                const response = await axiosInstance.get(``); 
                
                // Asumsi respons memiliki data items dan info koperasi
                setItems(response.data.items || []);
                setKoperasiInfo(response.data.koperasi || { nama_koperasi: 'Katalog Koperasi' });

            } catch (err) {
                setError('Gagal memuat katalog koperasi.');
                console.error("Error fetching public catalog:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicCatalog();
    }, [koperasiId]);

    const ProductCardSkeleton = () => (
        <Card className="animate-pulse overflow-hidden">
            <div className="h-40 bg-gray-200"></div>
            <CardContent className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            </CardContent>
        </Card>
    );

    const Header = () => (
        <header className="p-4 flex items-center justify-between gap-4 mb-0 bg-white border-b sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold truncate">{koperasiInfo.nama_koperasi}</h1>
            </div>
        </header>
    );

    return (
        <div className="pb-4 bg-gray-50 min-h-screen">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}
            
            <Header />

            <div className="p-4">
                {loading ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-lg border">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Katalog Kosong</h3>
                        <p className="mt-1 text-sm text-gray-500">Koperasi ini belum memiliki produk untuk ditampilkan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <Card key={item.id} className="overflow-hidden group">
                                <CardHeader className="p-0 relative">
                                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {item.product.product_image ? (
                                            <img src={item.product.product_image} alt={item.product.product_name} className="h-full w-full object-contain" />
                                        ) : (
                                            <ShoppingBag className="w-16 h-16 text-gray-300" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <h3 className="font-semibold text-sm leading-snug truncate group-hover:text-orange-600">{item.product.product_name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{item.product.product_category}</p>
                                    <p className="text-base font-bold text-gray-800">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.product.product_price)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KatalogPublik;
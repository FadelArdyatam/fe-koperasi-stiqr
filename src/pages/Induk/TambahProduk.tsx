import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { useAffiliation } from '@/hooks/useAffiliation';
import AddProduct from '@/components/AddProduct';

// This component acts as a stateful wrapper for the AddProduct component,
// turning it into a navigable page.
const TambahProdukInduk: React.FC = () => {
    const navigate = useNavigate();
    const { koperasiId, data: affiliation } = useAffiliation();
    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const merchantId = userData?.merchant?.id;

    // State required by the AddProduct component
    const [products, setProducts] = useState<Array<any>>([]);
    const [etalases, setEtalases] = useState<Array<any>>([]);
    const [variants, setVariants] = useState<Array<any>>([]);
    const [reset, setReset] = useState(false); // Dummy state for now
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data needed for the AddProduct form (etalases, variants, etc.)
    useEffect(() => {
        if (!merchantId) {
            setLoading(false);
            setError("Merchant ID tidak ditemukan. Mohon login ulang.");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Assuming these endpoints exist based on the AddProduct component logic
                const [etalaseRes, variantRes, productRes] = await Promise.all([
                    axiosInstance.get(`/showcase/${merchantId}`),
                    axiosInstance.get(`/varian/${merchantId}`),
                    axiosInstance.get(`/product/${merchantId}`)
                ]);
                setEtalases(etalaseRes.data.data || []);
                setVariants(variantRes.data.data || []);
                setProducts(productRes.data.data || []);
            } catch (err) {
                console.error("Failed to fetch data for AddProduct page:", err);
                setError("Gagal memuat data yang diperlukan untuk form tambah produk.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [merchantId]);

    // This handler will be passed to the AddProduct component to act as its "close" button.
    const handleFinish = () => {
        navigate('/induk/manajemen-katalog'); // Navigate back to the catalog list
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Memuat data form...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <AddProduct
                koperasiId={koperasiId}
                affiliation={affiliation} // Pass affiliation data down
                setAddProduct={handleFinish} // Pass the navigation handler
                products={products}
                setProducts={setProducts}
                etalases={etalases}
                setEtalases={setEtalases}
                variants={variants}
                setVariants={setVariants}
                setReset={setReset} // Pass the dummy setter
            />
        </div>
    );
};

export default TambahProdukInduk;

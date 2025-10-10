import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, FileText, Home, ScanQrCode, Search, SlidersHorizontal, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import Variant from './Variant';
import Etalase from "./Etalase";
import { Link } from "react-router-dom";
import axiosInstance from "@/hooks/axiosInstance";
import Product from "./Product";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAffiliation } from "@/hooks/useAffiliation";

interface ProductType {
    id: number;
    detail_product: any;
    product_id: string;
    product_name: string;
    product_sku: string;
    product_weight: string;
    product_category: string;
    product_price: number;
    product_status: boolean;
    product_description: string;
    product_image: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
    product_variant: Array<{
        variant: any;
        variant_id: string;
    }> & { product_variant: Array<{ variant_id: string }> };
}

interface Merchant {
    id: string;
    name: string;
    phone_number: string;
    email: string;
    address: string;
    post_code: string;
    category: string;
    city: string;
    type: string;
    pin: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
}

interface ShowcaseProduct {
    id: number,
    showcase_product_id: string,
    showcase_id: string,
    product_id: string,
    created_at: string,
    updated_at: string
}

interface Etalase {
    id: number;
    showcase_id: string;
    showcase_name: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
    showcase_product: ShowcaseProduct[];
    merchant: Merchant;
}

interface Variant {
    variant_status: any;
    product_variant: any;
    id: number;
    variant_id: string;
    variant_name: string;
    product_id: string;
    variant_description: string;
    is_multiple: boolean;
    merchant_id: string;
    products: number[];
    mustBeSelected: boolean;
    methods: string;
    choises: [];
    showVariant: boolean;
}

const options = ["Semua", "Aktif", "Non-aktif"];
const stok_options = ["Stok Tersedia", "Stok Habis"]

const Catalog = () => {
    const [show, setShow] = useState('Produk');
    const [products, setProducts] = useState<ProductType[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [variantsProduct, setVariantsProduct] = useState<Variant[]>([]);
    const [etalases, setEtalases] = useState<Etalase[]>([]);
    const [addProduct, setAddProduct] = useState(false);
    const [addVariant, setAddVariant] = useState(false);
    const [addEtalase, setAddEtalase] = useState(false);
    const [open, setOpen] = useState({
        id: "",
        status: false,
    });
    const [showVariantProductHandler, setShowVariantProductHandler] = useState({ id: "", status: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    console.log(error)

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const { koperasiId } = useAffiliation();
    console.log("ID Koperasi dari Catalog.tsx:", koperasiId);
    const [showFilterSection, setShowFilterSection] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'new' | 'highest' | 'lowest' | 'Semua' | 'Aktif' | 'Non-aktif' | 'Stok Tersedia' | 'Stok Habis'>('new');
    const [sortOrderVarian, setSortOrderVarian] = useState<'asc' | 'desc' | 'new' | 'Semua' | 'Aktif' | 'Non-aktif'>('new');

    const [reset, setReset] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get(`/product/${userData?.merchant?.id}`);
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    console.error("Invalid response format for products:", response.data);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data produk.");
                console.error("Error saat mengambil data produk:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchEtalases = async () => {
            try {
                const response = await axiosInstance.get(`/showcase/${userData?.merchant?.id}`);
                if (Array.isArray(response.data)) {
                    setEtalases(response.data);
                } else {
                    console.error("Invalid response format for etalases:", response.data);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data etalase.");
                console.error("Error saat mengambil data etalase:", err);
            } finally {
                setLoading(false);
            };
        }

        const fetchVariants = async () => {
            try {
                const merchantId = userData.merchant.id;

                const [response, response2] = await Promise.all([
                    axiosInstance.get(`/varian/${merchantId}`, { params: { filter: 'all' } }),
                    axiosInstance.get(`/varian/${merchantId}`)
                ]);

                setVariants(response.data.data);
                setVariantsProduct(response2.data.data);

            } catch (err: any) {
                setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data varian.");
                console.error("Error saat mengambil data varian:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        fetchEtalases();
        fetchVariants();
    }, [reset]);

    const [tempSortOrder, setTempSortOrder] = useState(sortOrder);
    const [tempSortOrderVarian, setTempSortOrderVarian] = useState(sortOrderVarian);

    const applyFilter = () => {
        if (show == 'Produk') {
            setSortOrder(tempSortOrder);
        } else {
            setSortOrderVarian(tempSortOrderVarian);
        }
        setShowFilterSection(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [sortOrder]);

    useEffect(() => {

        fetchVariants();
    }, [sortOrderVarian]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let status = undefined;
            if (sortOrder === 'Aktif') status = 'active';
            if (sortOrder === 'Non-aktif') status = 'inactive';

            let is_stok = undefined;
            if (sortOrder === 'Stok Tersedia') is_stok = 'Tersedia';
            if (sortOrder === 'Stok Habis') is_stok = 'Habis';

            const sortParam = ['asc', 'desc', 'new', 'highest', 'lowest'].includes(sortOrder)
                ? sortOrder
                : undefined;

            const response = await axiosInstance.get(`/product/${userData?.merchant?.id}`, {
                params: {
                    sort: sortParam,
                    status: status,
                    is_stok: is_stok
                }
            });

            setProducts(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data produk.");
            console.error("Error saat mengambil data produk:", err);
        } finally {
            setLoading(false);
        }
    };
    const fetchVariants = async () => {
        setLoading(true);
        try {
            let status = undefined;
            if (sortOrderVarian === 'Aktif') status = 'active';
            if (sortOrderVarian === 'Non-aktif') status = 'inactive';

            const sortParam = ['asc', 'desc', 'new'].includes(sortOrderVarian)
                ? sortOrderVarian
                : undefined;

            const response = await axiosInstance.get(`/varian/${userData?.merchant?.id}`, {
                params: {
                    sort: sortParam,
                    status: status,
                    filter: 'all'
                }
            });

            setVariants(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data produk.");
            console.error("Error saat mengambil data produk:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product =>
            product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const filteredVariants = Array.isArray(variants)
        ? variants.filter(variant =>
            variant?.variant_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const filteredEtalases = Array.isArray(etalases)
        ? etalases.filter(etalase =>
            etalase?.showcase_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    let allOptions = [...options];

    if (show === 'Produk') {
        allOptions = [...options, ...stok_options];
    }

    return (
        <div className="w-full flex flex-col min-h-screen items-center bg-orange-50">
            <div className={`${addProduct || addVariant || addEtalase || open.status || showVariantProductHandler.status ? 'hidden' : 'block'} p-5 w-full`}>
                <div data-aos="zoom-in" className="w-full">
                    <p className="font-semibold text-2xl">Catalog</p>
                </div>

                <div data-aos="zoom-in" data-aos-delay="100" className="mt-10 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <Search />
                    </div>

                    <Input
                        placeholder={show === 'Produk' ? 'Cari produk' : show === 'Varian' ? 'Cari varian' : 'Cari etalase'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-12 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500"
                    />

                    <div className={`${show === "Etalase" ? 'hidden' : 'absolute'} right-3 top-1/2 transform -translate-y-1/2 text-orange-500`} onClick={() => setShowFilterSection(true)}>
                        <SlidersHorizontal />
                    </div>
                </div>

                {showFilterSection && (
                    <div className="fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 z-20 flex items-end">
                        <div data-aos="fade-up" className="w-full bg-white rounded-t-xl p-5">
                            <div className="flex items-center justify-between w-full">
                                <p className="font-semibold text-2xl">Kondisi Produk</p>
                                <button type="button" onClick={() => setShowFilterSection(false)}>
                                    <X />
                                </button>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {allOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            if (show !== 'Varian') {
                                                setTempSortOrder(option as 'Semua' | 'Aktif' | 'Non-aktif' | 'asc' | 'desc' | 'new' | 'highest' | 'lowest' | 'Stok Tersedia' | 'Stok Habis');
                                            } else {
                                                setTempSortOrderVarian(option as 'Semua' | 'Aktif' | 'Non-aktif' | 'asc' | 'desc' | 'new');
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-full border transition 
                                            ${show === 'Produk'
                                                ? (tempSortOrder === option ? "bg-blue-100 text-blue-600 border-blue-500" : "border-gray-300 text-gray-600 hover:bg-gray-100")
                                                : (tempSortOrderVarian === option ? "bg-blue-100 text-blue-600 border-blue-500" : "border-gray-300 text-gray-600 hover:bg-gray-100")
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="my-5 w-full h-[1px] bg-gray-400"></div>

                            <p className="font-semibold text-2xl">Urutkan Berdasarkan</p>

                            <div className="mt-5 flex flex-col gap-3">
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="new"
                                        checked={show == 'Varian' ? tempSortOrderVarian === 'new' : tempSortOrder === 'new'}
                                        onChange={() => { show !== 'Varian' ? setTempSortOrder('new') : setTempSortOrderVarian('new'); }}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">{`${show === "Varian" ? 'Varian' : 'Produk'}`} Terbaru</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="asc"
                                        checked={show == 'Varian' ? tempSortOrderVarian === 'asc' : tempSortOrder === 'asc'}
                                        onChange={() => { show !== 'Varian' ? setTempSortOrder('asc') : setTempSortOrderVarian('asc'); }}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Abjad A-Z</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="desc"
                                        checked={show == 'Varian' ? tempSortOrderVarian === 'desc' : tempSortOrder === 'desc'}
                                        onChange={() => { show !== 'Varian' ? setTempSortOrder('desc') : setTempSortOrderVarian('desc'); }}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Abjad Z-A</span>
                                </label>

                                <label className={`${show === "Varian" ? 'hidden' : 'flex'} items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer`}>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="highest"
                                        checked={tempSortOrder === 'highest'}
                                        onChange={() => setTempSortOrder('highest')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Harga Tertinggi</span>
                                </label>

                                <label className={`${show === "Varian" ? 'hidden' : 'flex'} items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer`}>
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="lowest"
                                        checked={tempSortOrder === 'lowest'}
                                        onChange={() => setTempSortOrder('lowest')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Harga Terendah</span>
                                </label>
                            </div>

                            <Button
                                onClick={applyFilter}
                                className="mt-5 w-full h-12 bg-orange-500 text-white rounded-xl"
                            >
                                Tampilkan
                            </Button>
                        </div>
                    </div>
                )}

                <div data-aos="zoom-in" data-aos-delay="200" className="mt-5 flex items-center gap-5 justify-between">
                    <Button onClick={() => { setShow('Produk') }} className={`${show === 'Produk' ? 'bg-orange-100' : 'bg-transparent'} transition-all text-orange-500 rounded-full w-full`}>Produk</Button>

                    <Button onClick={() => setShow('Varian')} className={`${show === 'Varian' ? 'bg-orange-100' : 'bg-transparent'} transition-all text-orange-500 rounded-full w-full`}>Varian</Button>

                    <Button onClick={() => setShow('Etalase')} className={`${show === 'Etalase' ? 'bg-orange-100' : 'bg-transparent'} transition-all text-orange-500 rounded-full w-full`}>Etalase</Button>
                </div>
            </div>

            {loading && <p>Loading...</p>}

            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 flex-col items-center">
                    <Home />

                    <p className="uppercase">Home</p>
                </Link>

                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />

                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to={'/settlement'} className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={'/catalog'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <FileText />

                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to={'/profile'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className="w-full">
                {show === 'Produk' && <Product koperasiId={koperasiId} products={searchTerm !== '' ? filteredProducts : products} setProducts={setProducts} addProduct={addProduct} setAddProduct={setAddProduct} setOpen={setOpen} open={open} setEtalases={setEtalases} etalases={etalases} variants={variantsProduct} setVariants={setVariants} setReset={setReset} />}
            </div>

            <div className="w-full">
                {show === 'Varian' && <Variant variants={searchTerm !== '' ? filteredVariants : variants} setVariants={setVariants} addVariant={addVariant} setAddVariant={setAddVariant} setOpen={setOpen} open={open} products={products} setShowVariantProductHandler={setShowVariantProductHandler} showVariantProductHandler={showVariantProductHandler} setReset={setReset} />}
            </div>

            {show === 'Etalase' && <Etalase etalases={searchTerm !== '' ? filteredEtalases : etalases} setEtalases={setEtalases} addEtalase={addEtalase} setAddEtalase={setAddEtalase} setOpen={setOpen} open={open} products={products} setReset={setReset} />}
        </div>
    );
};

export default Catalog;

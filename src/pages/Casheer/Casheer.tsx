import DetailProduct from "@/pages/Casheer/DetailProduct"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/hooks/axiosInstance"
import { ArrowLeft, Search, SlidersHorizontal, ShoppingBasket, X, Wrench } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import takeAway from "../../images/take-away.png"
import dineIn from "../../images/bayar-sekarang.png"
import OrderSummary from "./OrderSummary"
import AOS from "aos";
import "aos/dist/aos.css";
import noProduct from '../../images/no-product.png'
import { formatRupiah } from "@/hooks/convertRupiah"

const Casheer = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [etalases, setEtalases] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showDetailProduct, setShowDetailProduct] = useState(false);
    const [basket, setBasket] = useState<any[]>([]);
    const [showService, setShowService] = useState<{ show: boolean, service: string | null }>({ show: false, service: null });
    const [showFilterSection, setShowFilterSection] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'new' | 'highest' | 'lowest'>('asc');
    const serviceRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    const addQuantityHandler = useCallback(
        (index: number) => {
            const product = products[index];
            setBasket((prevBasket) => {
                const existingProductIndex = prevBasket.findIndex(
                    (item) => item.product === product.product_name
                );

                if (existingProductIndex >= 0) {
                    return prevBasket.map((item, idx) =>
                        idx === existingProductIndex
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
                            price: product.product_price,
                            notes: product.notes,
                            date: new Date().toLocaleString(),
                            detail_variant: [],
                            service: showService?.service,
                        },
                    ];
                }
            });
        },
        [products]
    );

    console.log("Products", products)

    const removeQuantityHandler = useCallback(
        (index: number) => {
            const product = products[index];
            setBasket((prevBasket) => {
                const existingProductIndex = prevBasket.findIndex(
                    (item) => item.product === product.product_name
                );

                if (existingProductIndex >= 0) {
                    return prevBasket
                        .map((item, idx) =>
                            idx === existingProductIndex
                                ? { ...item, quantity: item.quantity - 1 }
                                : item
                        )
                        .filter((item) => item.quantity > 0); // Remove item jika quantity <= 0
                }
                return prevBasket;
            });
        },
        [products]
    );

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get(`/product/${userData?.merchant?.id}?status=active`);
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
                    setEtalases([{ showcase_id: null, showcase_name: "Semua Produk" }, ...(Array.isArray(response.data) ? response.data : [])]);

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

        fetchProducts();
        fetchEtalases();
    }, [])

    useEffect(() => {
        const handleSortAll = () => {
            const sortArray = (arr: any[], key: string) => {
                return arr.sort((a, b) => {
                    // Jika key adalah 'createdAt', urutkan berdasarkan tanggal
                    if (key === 'created_at') {
                        const dateA = new Date(a[key]);
                        const dateB = new Date(b[key]);
                        if (sortOrder === 'asc') {
                            return dateA > dateB ? 1 : -1; // Urutkan berdasarkan tanggal lebih baru jika 'desc'
                        } else {
                            return dateA < dateB ? 1 : -1; // Urutkan berdasarkan tanggal lebih lama jika 'asc'
                        }
                    } else if (key === 'product_name') {
                        // Pengurutan berdasarkan nama produk (A-Z atau Z-A)
                        if (sortOrder === 'asc') {
                            return a[key]?.toLowerCase() > b[key]?.toLowerCase() ? 1 : -1;
                        } else {
                            return a[key]?.toLowerCase() < b[key]?.toLowerCase() ? 1 : -1;
                        }
                    } else if (key === 'product_price') {
                        // Pengurutan berdasarkan harga tertinggi
                        if (sortOrder === 'highest') {
                            return a[key] < b[key] ? 1 : -1;
                        } else {
                            return a[key] > b[key] ? 1 : -1;
                        }
                    }

                    return 0; // Default return value
                });
            };

            if (sortOrder === 'new') {
                setProducts((prev) => [...sortArray(prev, 'created_at')]); // Sort berdasarkan tanggal terbaru
            } else if (sortOrder === 'asc') {
                setProducts((prev) => [...sortArray(prev, 'product_name')]); // Sort berdasarkan nama produk A-Z
            } else if (sortOrder === 'desc') {
                setProducts((prev) => [...sortArray(prev, 'product_name')]); // Sort berdasarkan nama produk Z-A
            } else if (sortOrder === 'highest') {
                setProducts((prev) => [...sortArray(prev, 'product_price')]); // Sort berdasarkan harga tertinggi
            } else if (sortOrder === 'lowest') {
                setProducts((prev) => [...sortArray(prev, 'product_price')]); // Sort berdasarkan harga terendah
            }
        };

        handleSortAll();
    }, [sortOrder]);

    // Show Product By Etalase Handler
    const showProductByEtalaseHandler = async (showcaseId: any) => {
        try {
            if (showcaseId !== null) {
                const response = await axiosInstance.get(`/product/${userData?.merchant?.id}?showcase_id=${showcaseId}`);
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    console.error("Invalid response format for products:", response.data);
                }
            } else {
                const response = await axiosInstance.get(`/product/${userData?.merchant?.id}?status=active`);
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    console.error("Invalid response format for products:", response.data);
                }
            }

        } catch (err: any) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data produk.");
        } finally {
            setLoading(false);
        }
    }
    //

    // ClickOutsideHandler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
                setShowService({ show: false, service: null });
            }
        };

        if (showService.show) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showService.show]);
    // 

    console.log(error)

    if (loading) {
        return <div>Loading...</div>
    }

    // const detailProductHandler = (index: number) => {
    //     setShowDetailProduct(true);
    //     setSelectedProduct(products[index]);
    // }

    // Validasi sebelum memanggil filter
    const filteredProducts = Array.isArray(products)
        ? products.filter(product =>
            product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <>
            <div className={`${showDetailProduct || showService.service !== null ? 'hidden' : 'flex'} w-full pb-32 flex-col min-h-screen items-center bg-orange-50`}>
                <div className={`p-5 w-full`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <Link to={"/dashboard"}><ArrowLeft /></Link>

                            <p data-aos="zoom-in" className="font-semibold text-2xl">Kasir</p>
                        </div>

                        <Button data-aos="zoom-in" data-aos-delay="100"
                            onClick={() => navigate('/qr-code', {
                                state: {
                                    isManual: true,
                                }
                            })} className={`bg-orange-100 rounded-full text-orange-500 p-2`}>+ Input Manual</Button>
                    </div>

                    <div data-aos="zoom-in" data-aos-delay="200" className="mt-10 relative">
                        {/* Ikon Pencarian */}
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                            <Search />
                        </div>

                        {/* Input */}
                        <Input
                            placeholder="Cari Produk"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-12 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500"
                        />

                        {/* Ikon Pengaturan */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500" onClick={() => setShowFilterSection(true)}>
                            <SlidersHorizontal />
                        </div>
                    </div>

                    <div data-aos="zoom-in" data-aos-delay="300" className="mt-5 flex items-center gap-5 overflow-x-auto scrollbar-hide">
                        {etalases.map((etalase, index) => (
                            <Button
                                onClick={() => showProductByEtalaseHandler(etalase.showcase_id)}
                                key={index}
                                className="bg-orange-100 whitespace-nowrap rounded-full text-orange-500 px-4 py-2"
                            >
                                {etalase.showcase_name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Filter Section */}
                {showFilterSection && (
                    <div className="fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 z-20 flex items-end">
                        <div data-aos="fade-up" className="w-full bg-white rounded-t-xl p-5">
                            <div className="flex items-center justify-between w-full">
                                <p className="font-semibold text-2xl">Urutkan Berdasarkan</p>

                                <button type="button" onClick={() => setShowFilterSection(false)}>
                                    <X />
                                </button>
                            </div>

                            <div className="mt-5 flex flex-col gap-3">
                                {/* Produk Terbaru */}
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="new"
                                        checked={sortOrder === 'new'}
                                        onChange={() => setSortOrder('new')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Produk Terbaru</span>
                                </label>

                                {/* Abjad A-Z */}
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="asc"
                                        checked={sortOrder === 'asc'}
                                        onChange={() => setSortOrder('asc')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Abjad A-Z</span>
                                </label>

                                {/* Abjad Z-A */}
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="desc"
                                        checked={sortOrder === 'desc'}
                                        onChange={() => setSortOrder('desc')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Abjad Z-A</span>
                                </label>

                                {/* Highest Price */}
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="highest"
                                        checked={sortOrder === 'highest'}
                                        onChange={() => setSortOrder('highest')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Harga Tertinggi</span>
                                </label>

                                {/* Lowest Price */}
                                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl cursor-pointer">
                                    <input
                                        type="radio"
                                        name="sort"
                                        value="lowest"
                                        checked={sortOrder === 'lowest'}
                                        onChange={() => setSortOrder('lowest')}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-orange-500 font-medium">Harga Terendah</span>
                                </label>
                            </div>

                            {/* Tombol Tutup */}
                            <Button
                                onClick={() => setShowFilterSection(false)}
                                className="mt-5 w-full h-12 bg-orange-500 text-white rounded-xl"
                            >
                                Tampilkan
                            </Button>
                        </div>
                    </div>
                )}

                <div className="w-[90%] mt-5 flex flex-col items-center gap-5">
                    {products.length === 0 ? <Link data-aos="fade-up" data-aos-delay="400" to={"/catalog"} className="w-full bg-orange-500 rounded-lg text-center p-2 font-semibold text-white">Tambah Produk</Link> : searchTerm !== "" ? filteredProducts.map((product, index) => (
                        <div
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            key={index}
                            className="flex items-center gap-5 w-full p-5 bg-white rounded-lg justify-between"
                        >
                            {/* Detail Produk */}
                            <div
                                // onClick={() => detailProductHandler(index)}
                                className="flex items-center gap-5 flex-1 cursor-auto overflow-hidden"
                            >
                                {/* Gambar Produk */}
                                <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={product.product_image ?? noProduct}
                                        alt={product?.product_name}
                                        className="h-full w-full object-cover rounded-md"
                                    />
                                </div>

                                {/* Informasi Produk */}
                                <div className="flex flex-col justify-start items-start min-w-0 overflow-hidden">
                                    <p className="text-lg font-semibold text-start truncate w-full">
                                        {product.product_name}
                                    </p>

                                    <p className="font-semibold">
                                        {formatRupiah(product.product_price)}
                                    </p>

                                    {product?.detail_product?.is_stok && (
                                        <span className="bg-orange-100 px-3 py-1 mt-1 rounded-full text-orange-500 font-normal text-xs">
                                            Stok: {product?.detail_product?.stok}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tombol Tambah dan Kurangi Kuantitas */}
                            <div className="flex items-center gap-2">
                                {/* Tombol Kurangi */}
                                <button
                                    onClick={() => removeQuantityHandler(index)}
                                    className="w-8 h-8 flex items-center justify-center text-2xl font-semibold rounded-full bg-orange-100"
                                >
                                    -
                                </button>

                                {/* Input Jumlah */}
                                <Input
                                    type="number"
                                    className="text-center xs:w-24 w-16 border rounded-md appearance-none px-2"
                                    value={
                                        basket
                                            .filter((item) => item.product === product.product_name)
                                            .reduce((total, item) => total + item.quantity, 0) || ""
                                    }
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const newQuantity = inputValue === "" ? 0 : parseInt(inputValue, 10);

                                        if (inputValue === "" || (!isNaN(newQuantity) && newQuantity >= 0 && newQuantity <= product?.detail_product?.stok)) {
                                            setBasket((prevBasket) => {
                                                const existingProductIndex = prevBasket.findIndex(
                                                    (item) => item.product === product.product_name
                                                );

                                                if (existingProductIndex >= 0) {
                                                    if (newQuantity === 0) {
                                                        return prevBasket.filter((_, idx) => idx !== existingProductIndex);
                                                    }
                                                    return prevBasket.map((item, idx) =>
                                                        idx === existingProductIndex ? { ...item, quantity: newQuantity } : item
                                                    );
                                                } else if (newQuantity > 0) {
                                                    return [
                                                        ...prevBasket,
                                                        {
                                                            product_id: product.product_id,
                                                            product: product.product_name,
                                                            quantity: newQuantity,
                                                            price: product.product_price,
                                                            notes: "",
                                                            date: new Date().toLocaleString(),
                                                            detail_variant: [],
                                                            service: showService?.service,
                                                        },
                                                    ];
                                                }
                                                return prevBasket;
                                            });
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "" || Number(e.target.value) < 1) {
                                            setBasket((prevBasket) =>
                                                prevBasket.filter((item) => item.product !== product.product_name)
                                            );
                                        }
                                    }}
                                    min={0}
                                    max={product?.detail_product?.stok} // Tambahkan batas maksimal
                                />

                                {/* Tombol Tambah */}
                                <button
                                    onClick={() => {
                                        const currentQuantity = basket
                                            .filter((item) => item.product === product.product_name)
                                            .reduce((total, item) => total + item.quantity, 0);
                                        if (currentQuantity < product?.detail_product?.stok) {
                                            addQuantityHandler(index);
                                        }
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-2xl font-semibold rounded-full bg-orange-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )) : products.map((product, index) => (
                        <div
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            key={product.id}
                            title={product?.detail_product?.is_stok && product?.detail_product?.stok === 0 ? 'Stok Habis' : ''}
                            className={`flex items-center gap-5 w-full p-5 rounded-lg justify-between 
        ${product?.detail_product?.is_stok && product?.detail_product?.stok === 0 ? 'bg-red-100' : 'bg-white'}`}
                        >
                            {/* Detail Produk */}
                            <div
                                // onClick={() => detailProductHandler(index)}
                                className="flex items-center gap-4 flex-1 cursor-auto overflow-hidden"
                            >
                                {/* Gambar Produk */}
                                <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={product.product_image ?? noProduct}
                                        alt={product?.product_name}
                                        className="h-full w-full object-cover rounded-md"
                                    />
                                </div>

                                {/* Informasi Produk */}
                                <div className="flex flex-col justify-start items-start min-w-0 overflow-hidden">
                                    <p className="text-lg font-semibold text-start truncate w-full">
                                        {product.product_name}
                                    </p>

                                    <p className="font-semibold text-wrap">
                                        {formatRupiah(product.product_price)}
                                    </p>

                                    {product?.detail_product?.is_stok && (
                                        <span className="bg-orange-100 px-3 py-1 mt-1 rounded-full text-orange-500 font-normal text-xs">
                                            Stok: {product?.detail_product?.stok}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tombol Tambah & Kurangi Kuantitas */}
                            <div className="flex items-center gap-2">
                                {/* Tombol Kurangi */}
                                <button
                                    onClick={() => removeQuantityHandler(index)}
                                    disabled={product?.detail_product?.is_stok === false ? false : product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                                    className={`w-8 h-8 flex items-center justify-center text-2xl font-semibold rounded-full 
      ${product?.detail_product?.is_stok && product?.detail_product?.stok === 0 ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'bg-orange-100'}`}
                                >
                                    -
                                </button>

                                {/* Input Jumlah */}
                                <Input
                                    type="number"
                                    className="text-center xs:w-24 w-16 border rounded-md appearance-none px-2"
                                    disabled={product?.detail_product?.is_stok === false ? false : product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                                    value={
                                        basket
                                            .filter((item) => item.product === product.product_name)
                                            .reduce((total, item) => total + item.quantity, 0) || ""
                                    }
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const newQuantity = inputValue === "" ? 0 : parseInt(inputValue, 10);

                                        if (inputValue === "" || (!isNaN(newQuantity) && newQuantity >= 0 && (product?.detail_product?.is_stok === false || newQuantity <= product?.detail_product?.stok))) {
                                            setBasket((prevBasket) => {
                                                const existingProductIndex = prevBasket.findIndex(
                                                    (item) => item.product === product.product_name
                                                );

                                                if (existingProductIndex >= 0) {
                                                    if (newQuantity === 0) {
                                                        return prevBasket.filter((_, idx) => idx !== existingProductIndex);
                                                    }
                                                    return prevBasket.map((item, idx) =>
                                                        idx === existingProductIndex ? { ...item, quantity: newQuantity } : item
                                                    );
                                                } else if (newQuantity > 0) {
                                                    return [
                                                        ...prevBasket,
                                                        {
                                                            product_id: product.product_id,
                                                            product_image: product.product_image,
                                                            product: product.product_name,
                                                            quantity: newQuantity,
                                                            price: product.product_price,
                                                            notes: "",
                                                            date: new Date().toLocaleString(),
                                                            detail_variant: [],
                                                            service: showService?.service,
                                                        },
                                                    ];
                                                }
                                                return prevBasket;
                                            });
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "" || Number(e.target.value) < 1) {
                                            setBasket((prevBasket) =>
                                                prevBasket.filter((item) => item.product !== product.product_name)
                                            );
                                        }
                                    }}
                                    min={0}
                                    max={product?.detail_product?.stok} // Tambahkan max di HTML
                                />

                                {/* Tombol Tambah */}
                                <button
                                    onClick={() => {
                                        const currentQuantity = basket
                                            .filter((item) => item.product === product.product_name)
                                            .reduce((total, item) => total + item.quantity, 0);
                                        if (product?.detail_product?.is_stok === false || currentQuantity < product?.detail_product?.stok) {
                                            addQuantityHandler(index);
                                        }
                                    }}
                                    disabled={product?.detail_product?.is_stok === false ? false : product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                                    className={`w-8 h-8 flex items-center justify-center text-2xl font-semibold rounded-full 
      ${product?.detail_product?.is_stok && product?.detail_product?.stok === 0 ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'bg-orange-100'}`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {basket.length > 0 && basket.some((item) => item.quantity > 0) && (
                    <Button
                        onClick={() => setShowService({ show: true, service: null })}
                        className="fixed w-[90%] bottom-5 rounded-full left-[50%] -translate-x-[50%] bg-green-500 text-white px-5 py-[25px] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-5 justify-between w-full">
                            <p className="text-base font-medium">{basket.reduce((total, item) => total + (item.quantity > 0 ? 1 : 0), 0)} Produk</p>

                            <div className="flex items-center gap-2">
                                <ShoppingBasket className="scale-[1.5]" />

                                <p className="text-lg font-bold">
                                    {basket
                                        .reduce(
                                            (total, item) => total + item.price * item.quantity, // Kalikan harga dengan quantity
                                            0
                                        )
                                        .toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        })}
                                </p>
                            </div>
                        </div>
                    </Button>
                )}

                {showService.show && (
                    <div className="fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 z-20 flex items-end justify-center">
                        <div ref={serviceRef} data-aos="fade-up" className="w-full bg-white rounded-t-xl p-5">
                            <p className="font-semibold text-2xl">Pilih Layanan</p>

                            <div className="mt-5 flex gap-5">
                                {/* Bayar Nanti - Disabled */}
                                <div className="relative w-full h-40">
                                    <Button
                                        className="w-full h-full bg-orange-100 rounded-xl text-orange-500 p-5 flex flex-col items-center justify-center blur-[2px] cursor-not-allowed"
                                        disabled
                                    >
                                        <img className="w-16 h-16 block" src={dineIn} alt="" />
                                        <p className="text-lg mt-3 text-wrap">Bayar Nanti</p>
                                    </Button>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="bg-orange-500 flex gap-2 p-2 font-semibold text-center shadow-md text-white bg-opacity-90 px-3 py-1 rounded">
                                            <Wrench />   Fitur ini akan segera hadir
                                        </p>
                                    </div>
                                </div>

                                {/* Bayar Sekarang - Active */}
                                <Button
                                    onClick={() => setShowService({ show: true, service: "Pay Now" })}
                                    className="w-full h-40 bg-orange-100 rounded-xl text-orange-500 p-5 flex flex-col items-center justify-center"
                                >
                                    <img className="w-16 h-16 block" src={takeAway} alt="" />
                                    <p className="text-lg mt-3">Bayar Sekarang</p>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {showDetailProduct && <DetailProduct product={selectedProduct} setShowDetailProduct={setShowDetailProduct} basket={basket} setBasket={setBasket} showService={showService} />}

            {showService.show && showService.service !== null && <OrderSummary references={serviceRef} setBasket={setBasket} basket={basket} setShowService={setShowService} showService={showService} setSelectedProduct={setSelectedProduct} setShowDetailProduct={setShowDetailProduct} />}
            {/* {showService.show && showService.service !== null && <OrderSummary references={serviceRef} setBasket={setBasket} basket={basket} setShowService={setShowService} showService={showService}  />} */}
        </>
    )
}

export default Casheer

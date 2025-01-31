import DetailProduct from "@/pages/Casheer/DetailProduct"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/hooks/axiosInstance"
import { ArrowLeft, Search, SlidersHorizontal, ShoppingBasket } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import takeAway from "../../images/take-away.png"
import dineIn from "../../images/dine-in.png"
import OrderSummary from "./OrderSummary"
import AOS from "aos";
import "aos/dist/aos.css";

const Casheer = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [etalases, setEtalases] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showDetailProduct, setShowDetailProduct] = useState(false);
    const [basket, setBasket] = useState<any[]>([]);
    const [showService, setShowService] = useState<{ show: boolean, service: string | null }>({ show: false, service: null });
    const serviceRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        AOS.init({ duration: 500, once: false });
    }, []);

    const urlImage = `${import.meta.env.VITE_API_URL.replace('/api', '')}`;

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
                            product: product.product_name,
                            quantity: 1,
                            price: product.product_price,
                            notes: "",
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
                const response = await axiosInstance.get(`/varian/${userData?.merchant?.id}`);
                setVariants(response.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Terjadi kesalahan saat memuat data varian.");
                console.error("Error saat mengambil data varian:", err);
            } finally {
                setLoading(false);
            };
        };

        fetchProducts();
        fetchEtalases();
        fetchVariants();
    }, [])

    // Show Product By Etalase Handler
    const showProductByEtalaseHandler = async (showcaseId: any) => {
        try {
            const response = await axiosInstance.get(`/product/${userData?.merchant?.id}?showcase_id=${showcaseId}`);
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                console.error("Invalid response format for products:", response.data);
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

    if (loading) {
        return <div>Loading...</div>
    }

    const detailProductHandler = (index: number) => {
        setShowDetailProduct(true);
        setSelectedProduct(products[index]);
    }
    console.log(error)

    console.log("Basket:", basket);

    return (
        <>
            <div className={`${showDetailProduct || showService.service !== null ? 'hidden' : 'flex'} w-full pb-32 flex-col min-h-screen items-center bg-orange-50`}>
                <div className={`p-5 w-full`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <Link to={"/dashboard"}><ArrowLeft /></Link>

                            <p data-aos="zoom-in" className="font-semibold text-2xl">Kasir</p>
                        </div>

                        <Link data-aos="zoom-in" data-aos-delay="100" to={"/qr-code"} className={`bg-orange-100 rounded-full text-orange-500 p-2`}>+ Input Manual</Link>
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
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500">
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

                <div className="w-[90%] mt-5 flex flex-col items-center gap-5">
                    {products.length === 0 ? <Link data-aos="fade-up" data-aos-delay="400" to={"/catalog"} className="w-full bg-orange-500 rounded-lg text-center p-2 font-semibold text-white">Tambah Produk</Link> : products.map((product, index) => (
                        <div
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            key={index}
                            className="flex items-center gap-5 w-full p-5 bg-white rounded-lg justify-between"
                        >
                            {/* Detail Produk */}
                            <div
                                onClick={() => detailProductHandler(index)}
                                className="flex items-center gap-5 w-full cursor-pointer"
                            >
                                <img src={`${urlImage}/uploads/products/${product.product_image}`} alt={product?.product_name} className="h-12 w-12 object-cover rounded-md" />

                                <div className="flex flex-col justify-start items-start">
                                    <p className="font-semibold">{product.product_name}</p>

                                    <p className="font-semibold text-wrap">
                                        {/* Format angka dengan pemotongan */}
                                        {String(product.product_price).length > 5
                                            ? `${Number(product.product_price)
                                                .toLocaleString("id-ID", {
                                                    style: "currency",
                                                    currency: "IDR",
                                                })
                                                .slice(0, 10)}...`
                                            : Number(product.product_price).toLocaleString("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                            })}
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Tambah dan Kurangi Kuantitas */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => removeQuantityHandler(index)}
                                    className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                                >
                                    -
                                </button>

                                <Input
                                    type="number"
                                    className="text-center w-10 border rounded-md"
                                    value={
                                        basket
                                            .filter((item) => item.product === product.product_name)
                                            .reduce((total, item) => total + item.quantity, 0) || "" // Tampilkan input kosong jika kuantitas 0
                                    }
                                    onChange={(e) => {
                                        const inputValue = e.target.value;

                                        // Validasi input hanya angka positif
                                        if (inputValue === "" || (Number(inputValue) >= 0 && !isNaN(Number(inputValue)))) {
                                            const newQuantity = inputValue === "" ? 0 : parseInt(inputValue, 10);

                                            setBasket((prevBasket) => {
                                                const existingProductIndex = prevBasket.findIndex(
                                                    (item) => item.product === product.product_name
                                                );

                                                if (existingProductIndex >= 0) {
                                                    // Jika kuantitas 0, hapus produk dari basket
                                                    if (newQuantity === 0) {
                                                        return prevBasket.filter((_, idx) => idx !== existingProductIndex);
                                                    }

                                                    // Update kuantitas jika produk ada di basket
                                                    return prevBasket.map((item, idx) =>
                                                        idx === existingProductIndex ? { ...item, quantity: newQuantity } : item
                                                    );
                                                } else if (newQuantity > 0) {
                                                    // Tambahkan produk baru ke basket jika belum ada
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
                                        // Jika input kosong atau < 1, hapus dari basket
                                        if (e.target.value === "" || Number(e.target.value) < 1) {
                                            setBasket((prevBasket) =>
                                                prevBasket.filter((item) => item.product !== product.product_name)
                                            );
                                        }
                                    }}
                                    min={0} // Mencegah angka negatif
                                />

                                <button
                                    onClick={() => addQuantityHandler(index)}
                                    className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
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
                        <div ref={serviceRef} className="w-full bg-white rounded-t-xl p-5">
                            <p className="font-semibold text-2xl">Pilih Layanan</p>

                            <div className="mt-5 flex gap-5">
                                <Button onClick={() => setShowService({ show: true, service: "Dine In" })} className="w-full h-40 bg-orange-100 rounded-xl text-orange-500 p-5 flex flex-col
                                ">
                                    <img className="w-16 h-16 block" src={dineIn} alt="" />

                                    <p className="text-lg mt-3 text-wrap">Makan di Tempat</p>
                                </Button>

                                <Button onClick={() => setShowService({ show: true, service: "Take Away" })} className="w-full h-40 bg-orange-100 rounded-xl text-orange-500 p-5 flex flex-col
                                ">
                                    <img className="w-16 h-16 block" src={takeAway} alt="" />

                                    <p className="text-lg mt-3">Bawa Pulang</p>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showDetailProduct && <DetailProduct product={selectedProduct} variants={variants} setShowDetailProduct={setShowDetailProduct} basket={basket} setBasket={setBasket} showService={showService} />}

            {showService.show && showService.service !== null && <OrderSummary references={serviceRef} setBasket={setBasket} basket={basket} setShowService={setShowService} showService={showService} />}
        </>
    )
}

export default Casheer
import DetailProduct from "@/pages/Casheer/DetailProduct"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/hooks/axiosInstance"
import { ArrowLeft, Search, SlidersHorizontal, Image, ShoppingBasket } from "lucide-react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import takeAway from "../../images/take-away.png"
import dineIn from "../../images/dine-in.png"
import OrderSummary from "./OrderSummary"

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
                            product: product.product_name,
                            quantity: 1,
                            price: product.product_price,
                            notes: "",
                            date: new Date().toLocaleString(),
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

    console.log("Etalases:", etalases);
    console.log("Products:", products);

    const detailProductHandler = (index: number) => {
        setShowDetailProduct(true);
        setSelectedProduct(products[index]);
        console.log("Detail Product:", products[index]);
    }

    console.log("Basket:", basket);

    console.log("showService:", showService);

    return (
        <>
            <div className={`${showDetailProduct || showService.service !== null ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center bg-orange-50`}>
                <div className={`p-5 w-full`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <Link to={"/dashboard"}><ArrowLeft /></Link>

                            <p className="font-semibold text-2xl">Kasir</p>
                        </div>

                        <Link to={"/qr-code"} className={`bg-orange-100 rounded-full text-orange-500`}>+ Input Manual</Link>
                    </div>

                    <div className="mt-10 relative">
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

                    <div className="mt-5 flex items-center gap-5 justify-between">
                        {etalases.map((etalase, index) => (
                            <Button key={index} className={`bg-orange-100 rounded-full text-orange-500`}>
                                {etalase.showcase_name}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="w-[90%] mt-5 flex flex-col items-center gap-5">
                    {products.map((product, index) => (
                        <div key={index} className="flex items-center gap-5 justify-between w-full p-5 bg-white rounded-lg">
                            {/* Detail Produk */}
                            <div onClick={() => detailProductHandler(index)} className="flex items-center gap-5 w-full cursor-pointer">
                                <Image className="scale-[1.5]" />

                                <div className="flex flex-col justify-start items-start">
                                    <p className="font-semibold">{product.product_name}</p>

                                    <p className="font-semibold">{Number(product.product_price).toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                    })}</p>
                                </div>
                            </div>

                            {/* Tombol Tambah dan Kurangi Kuantitas */}
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => removeQuantityHandler(index)}
                                    className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                                >
                                    -
                                </button>

                                <p>
                                    {basket
                                        .filter((item) => item.product === product.product_name) // Filter sesuai produk
                                        .reduce((total, item) => total + item.quantity, 0)} {/* Hitung quantity */}
                                </p>

                                <button
                                    onClick={() => addQuantityHandler(index)}
                                    className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {basket.length > 0 && (
                    <Button onClick={() => setShowService({ show: true, service: null })} className="fixed w-[90%] bottom-5 rounded-full left-[50%] -translate-x-[50%] bg-blue-500 text-white px-5 py-[25px] flex items-center justify-between">
                        <div className="flex items-center gap-5 justify-between w-full">
                            <p className="text-base font-medium">{basket.length} Produk</p>

                            <div className="flex items-center gap-2">
                                <ShoppingBasket />

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

            {showDetailProduct && <DetailProduct product={selectedProduct} variants={variants} setShowDetailProduct={setShowDetailProduct} basket={basket} setBasket={setBasket} />}

            {showService.show && showService.service !== null && <OrderSummary references={serviceRef} setBasket={setBasket} basket={basket} setShowService={setShowService} showService={showService} />}
        </>
    )
}

export default Casheer
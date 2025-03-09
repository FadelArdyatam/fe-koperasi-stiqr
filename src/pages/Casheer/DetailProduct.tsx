import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "@/components/ui/input";
import AOS from "aos";
import "aos/dist/aos.css";
import noProduct from '../../images/no-product.png'
import { formatRupiah } from "@/hooks/convertRupiah";


interface DetailProductProps {
    product: any;
    setShowDetailProduct: any;
    basket: any[];
    setBasket: any;
    showService: { show: boolean; service: string | null };
}

const DetailProduct: React.FC<DetailProductProps> = ({ product, setShowDetailProduct, basket, setBasket, showService }) => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(product.product_price);
    const [notes, setNotes] = useState("");
    const [detailVariant, setDetailVariant] = useState<any[]>([]);
    const [tempPrice, setTempPrice] = useState(0);
    const [tempVariantId, setTempVariantId] = useState("");

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    // const handleVariantChange = (variantId: string, variantName: string, checked: boolean) => {
    //     setDetailVariant((prev) => {
    //         if (checked) {
    //             // Add the selected variant
    //             return [...prev, { variant_id: variantId, variant_name: variantName, value }];
    //         } else {
    //             // Remove the unselected variant
    //             return prev.filter((variant) => !(variant.variant_id === variantId && variant.variant_name === variantName && variant.value === value));
    //         }
    //     });
    // };

    const addBasketHandler = () => {
        const payload = {
            product_id: product.product_id || product.id,
            product_image: product.product_image || noProduct,
            product: product.product_name || product.product,
            quantity: quantity || product.quantity,
            price: price || product.product_price || product.price,
            notes: notes || "",
            date: new Date().toLocaleString(),
            detail_variants: detailVariant,
            service: showService?.service,
        };

        setBasket([...basket, payload]);
        setShowDetailProduct(false);
    };

    console.log("detailVariant", detailVariant);

    console.log(product)

    return (
        <div className="flex w-full flex-col min-h-screen items-center bg-orange-50 pb-[150px]">
            <div className={`p-5 w-full bg-white`}>
                <div className="w-full flex items-center gap-5 justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowDetailProduct(false)}><ArrowLeft /></button>

                        <p data-aos="zoom-in" className="font-semibold text-2xl">Detail Produk</p>
                    </div>
                </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="100" className="w-[90%] flex flex-col items-end mt-5 bg-white p-5 shadow-lg rounded-md">
                <div className="w-full">
                    <div className="flex items-center gap-5">
                        <img src={`${product.product_image ?? noProduct}`} alt={product?.product_name || product.product} className="h-12 w-12 object-cover rounded-md" />

                        <p className="font-semibold text-lg">{product.product_name || product.product}</p>
                    </div>

                    <div className="mt-5">
                        <p className="text-base">Deskripsi Produk</p>

                        <p className="text-gray-500 text-sm">{product.product_description}</p>
                    </div>
                </div>

                <div className="mt-5">
                    <p className="text-orange-400 text-xl font-semibold">{Number(product.product_price || product.price).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>
                </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="w-[90%] mt-5 p-5 rounded-lg bg-white shadow-lg">
                <div className="mt-5">
                    <div className="flex flex-col w-full gap-5">
                        {product?.product_variant?.map((detail: any, valueIndex: number) => (
                            <div key={valueIndex} className="flex flex-col gap-2">
                                <p className="font-semibold">{detail.variant.variant_name}</p>
                                <p className="text-gray-500">{detail.variant.is_multiple ? 'Pilih lebih dari 1' : 'Pilih Maksimal 1'}</p>
                                {
                                    detail?.variant?.detail_variant.map((variant: any, i: number) => (
                                        <div key={i} className="flex flex-row justify-between">
                                            <div className="flex gap-3 items-center">
                                                <input
                                                    type={detail.variant.is_multiple ? "checkbox" : "radio"}
                                                    id={`checkbox-${valueIndex}-${i}`}
                                                    name={!detail.variant.is_multiple ? "variant-option" : `checkbox-${valueIndex}`}
                                                    value={detail.variant.variant_name}
                                                    className="w-4 h-4 border-gray-300 rounded"
                                                    checked={
                                                        detail.variant.is_multiple
                                                            ? detailVariant.some((v) => v.detail_variant_id === variant.detail_variant_id) // ✅ Checkbox tetap checked jika ada di detailVariant
                                                            : tempVariantId === variant.detail_variant_id // ✅ Radio tetap checked jika sesuai state
                                                    }
                                                    onClick={() => {
                                                        if (!detail.variant.is_multiple && tempVariantId === variant.detail_variant_id) {
                                                            // ✅ Jika radio diklik lagi, uncheck
                                                            setTempVariantId("");
                                                            setTempPrice(0);
                                                            setDetailVariant((prev) =>
                                                                prev.filter((v) => v.detail_variant_id !== variant.detail_variant_id)
                                                            );
                                                            setPrice(price - tempPrice);
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        let newPrice = price;

                                                        if (detail.variant.is_multiple) {
                                                            // ✅ Untuk Checkbox
                                                            if (e.target.checked) {
                                                                newPrice += variant.price;
                                                                setDetailVariant((prev) => [...prev, { detail_variant_id: variant.detail_variant_id }]);
                                                            } else {
                                                                newPrice -= variant.price;
                                                                setDetailVariant((prev) => prev.filter((v) => v.detail_variant_id !== variant.detail_variant_id));
                                                            }
                                                        } else {
                                                            // ✅ Untuk Radio Button
                                                            if (tempVariantId !== variant.detail_variant_id) {
                                                                setTempVariantId(variant.detail_variant_id);
                                                                setTempPrice(variant.price);
                                                                newPrice = (newPrice - tempPrice) + variant.price;

                                                                setDetailVariant((prev) => {
                                                                    const updatedVariants = prev.filter((v) => v.detail_variant_id !== tempVariantId);
                                                                    return [...updatedVariants, { detail_variant_id: variant.detail_variant_id }];
                                                                });
                                                            }
                                                        }

                                                        setPrice(newPrice);
                                                    }}
                                                />

                                                <label htmlFor={`checkbox-${valueIndex}-${i}`} className="text-gray-700">
                                                    {variant.name}
                                                </label>
                                            </div>
                                            <label htmlFor={`checkbox-${valueIndex}-${i}`} className="text-gray-700">
                                                {formatRupiah(variant.price)}
                                            </label>
                                        </div>
                                    ))
                                }
                            </div>
                        ))}
                        <div className="w-full h-[1px] bg-gray-300 my-5"></div>
                    </div>
                </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className="w-[90%] bg-white p-5 rounded-lg shadow-lg mt-5">
                <p className="font-semibold">Catatan Pesanan</p>

                <textarea onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-500 mt-5 rounded-lg p-2" placeholder="Tulis catatan untuk pesananmu" />
            </div>

            <div data-aos="fade-up" data-aos-delay="400" className="fixed bottom-0 w-full bg-white p-5 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-xl">Total</p>

                    <div className="flex items-center gap-5 mt-5">
                        {/* Tombol Kurangi */}
                        <button
                            onClick={() => {
                                if (quantity > 1) {
                                    setQuantity(quantity - 1);
                                    setPrice(product.product_price || product.price);
                                }
                            }}
                            disabled={product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                        >
                            -
                        </button>

                        {/* Input Kuantitas */}
                        <Input
                            type="number"
                            className="text-center w-10 border rounded-md"
                            value={quantity}
                            disabled={product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                            onChange={(e) => {
                                const inputValue = parseInt(e.target.value, 10);

                                // Validasi input angka positif
                                if (!isNaN(inputValue) && inputValue > 0) {
                                    setQuantity(inputValue);
                                    setPrice(product.product_price || product.price);
                                } else if (e.target.value === "") {
                                    setQuantity(1); // Default jika input kosong
                                }
                            }}
                            onBlur={(e) => {
                                // Jika input kosong atau kurang dari 1, kembalikan ke nilai default 1
                                if (e.target.value === "" || parseInt(e.target.value, 10) < 1) {
                                    setQuantity(1);
                                }
                            }}
                            min={1} // Mencegah angka negatif melalui UI
                        />

                        {/* Tombol Tambah */}
                        <button
                            onClick={() => {
                                setQuantity(quantity + 1);
                                setPrice(product.product_price || product.price);
                            }}
                            disabled={product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <p className="font-semibold text-xl">{Number(price * quantity).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>

                    <Button disabled={product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                        onClick={addBasketHandler} className="bg-orange-400 text-white">
                        Tambah ke Keranjang
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;

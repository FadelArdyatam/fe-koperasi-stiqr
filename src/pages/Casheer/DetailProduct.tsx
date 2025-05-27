import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "@/components/ui/input";
import AOS from "aos";
import "aos/dist/aos.css";
import noProduct from '../../images/no-product.png'
import { formatRupiah } from "@/hooks/convertRupiah";
import Notification from "@/components/Notification";


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
    const [priceWithVariant, setPriceWithVariant] = useState(0);

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const addBasketHandler = () => {
        const missingRequired = product?.product_variant?.some((variantGroup: any, index: number) => {
            const { variant } = variantGroup;

            if (variant.is_required) {
                if (variant.is_multiple) {
                    return !detailVariant.some((v: any) =>
                        variant.detail_variant.some((dv: any) => dv.detail_variant_id === v.detail_variant_id)
                    );
                } else {
                    return !selectedVariants.hasOwnProperty(index);
                }
            }

            return false;
        });

        if (missingRequired) {
            setMessage({ show: true, message: "Pilih Varian" })
            return;
        }

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

    const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({});
    const [message, setMessage] = useState({ show: false, message: "" })

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
                    <div className="flex items-center justify-between gap-5">
                        <div className="flex items-center gap-5">
                            <img src={`${product.product_image ?? noProduct}`} alt={product?.product_name || product.product} className="h-12 w-12 object-cover rounded-md" />

                            <p className="font-semibold text-lg">{product.product_name || product.product}</p>
                        </div>
                        <div>
                            <p className="text-orange-400 text-xl font-semibold">{Number(product.product_price || product.price).toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                            })}</p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="text-base">Deskripsi Produk</p>

                        <p className="text-gray-500 text-sm">
                            {product.product_description || "-"}
                        </p>
                    </div>
                </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="w-[90%] mt-5 p-5 rounded-lg bg-white shadow-lg">
                <div className="mt-5">
                    <div className="flex flex-col w-full gap-2">
                        {product?.product_variant?.map((detail: { variant: { variant_name: string; is_required: boolean; is_multiple: boolean; detail_variant: { detail_variant_id: string; price: number; name: string }[] } }, valueIndex: number) => (
                            <div key={valueIndex} className="flex flex-col gap-2">
                                <p className="font-semibold">{detail.variant.variant_name}</p>
                                <p className="text-gray-500 text-xs">
                                    {detail.variant.is_required ? 'Wajib Dipilih' : 'Opsional'} -{' '}
                                    {detail.variant.is_multiple
                                        ? `Pilih maks. ${detail.variant.detail_variant?.length}`
                                        : 'Pilih 1'}
                                </p>

                                {detail?.variant?.detail_variant.map((variant: any, i: number) => (
                                    <div key={i} className="flex flex-row justify-between">
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type={detail.variant.is_multiple ? 'checkbox' : 'radio'}
                                                id={`checkbox-${valueIndex}-${i}`}
                                                name={detail.variant.is_multiple ? `checkbox-${valueIndex}` : `variant-option-${valueIndex}`}
                                                className={`border-gray-300 ${detail.variant.is_multiple ? 'w-4 h-4 rounded' : 'scale-[1.5] rounded-full'}`}
                                                checked={
                                                    detail.variant.is_multiple
                                                        ? detailVariant.some(v => v.detail_variant_id === variant.detail_variant_id)
                                                        : selectedVariants[valueIndex] === variant.detail_variant_id
                                                }
                                                onClick={() => {
                                                    // Hanya untuk uncheck jika is_multiple: false dan is_required: false
                                                    if (
                                                        !detail.variant.is_multiple &&
                                                        selectedVariants[valueIndex] === variant.detail_variant_id &&
                                                        !detail.variant.is_required
                                                    ) {
                                                        const prevVariant = detail.variant.detail_variant.find(
                                                            (v: { detail_variant_id: string }) => v.detail_variant_id === variant.detail_variant_id
                                                        );
                                                        const prevPrice = prevVariant?.price || 0;

                                                        setSelectedVariants(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[valueIndex];
                                                            return updated;
                                                        });

                                                        setDetailVariant(prev =>
                                                            prev.filter(v => v.detail_variant_id !== variant.detail_variant_id)
                                                        );

                                                        const newPrice = price - prevPrice;
                                                        setPrice(newPrice);
                                                        setPriceWithVariant(newPrice);
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    if (detail.variant.is_multiple) {
                                                        // Logic untuk multiple
                                                        let newPrice = price;
                                                        if (e.target.checked) {
                                                            newPrice += variant.price;
                                                            setDetailVariant(prev => [...prev, { detail_variant_id: variant.detail_variant_id }]);
                                                        } else {
                                                            newPrice -= variant.price;
                                                            setDetailVariant(prev =>
                                                                prev.filter(v => v.detail_variant_id !== variant.detail_variant_id)
                                                            );
                                                        }
                                                        setPrice(newPrice);
                                                        setPriceWithVariant(newPrice);
                                                    } else {
                                                        // Logic untuk single
                                                        const prevVariantId = selectedVariants[valueIndex];
                                                        if (prevVariantId !== variant.detail_variant_id) {
                                                            const prevVariant = detail.variant.detail_variant.find(
                                                                v => v.detail_variant_id === prevVariantId
                                                            );
                                                            const prevPrice = prevVariant?.price || 0;
                                                            const newPrice = price - prevPrice + variant.price;

                                                            setSelectedVariants(prev => ({
                                                                ...prev,
                                                                [valueIndex]: variant.detail_variant_id,
                                                            }));

                                                            setDetailVariant(prev => {
                                                                const updated = prev.filter(v => v.detail_variant_id !== prevVariantId);
                                                                return [...updated, { detail_variant_id: variant.detail_variant_id }];
                                                            });

                                                            setPrice(newPrice);
                                                            setPriceWithVariant(newPrice);
                                                        }
                                                    }
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
                                ))}

                                {valueIndex !== product.product_variant.length - 1 && (
                                    <div className="w-full h-[1px] bg-gray-300 my-2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className="w-[90%] bg-white p-5 rounded-lg shadow-lg mt-5">
                <p className="font-semibold">Catatan Pesanan <span className="font-normal"> (opsional)</span> </p>

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
                                    setPrice(priceWithVariant !== 0 ? priceWithVariant : price);
                                }
                            }}
                            disabled={product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                        >
                            -
                        </button>

                        <Input
                            type="number"
                            className="text-center w-20 border rounded-md"
                            value={quantity}
                            disabled={product?.detail_product?.is_stok && product?.detail_product?.stok === 0}
                            onChange={(e) => {
                                const inputValue = parseInt(e.target.value, 10);

                                // Validasi input angka positif dan tidak melebihi stok
                                if (!isNaN(inputValue) && inputValue > 0) {
                                    if (product?.detail_product?.is_stok && inputValue > product?.detail_product?.stok) {
                                        setQuantity(product?.detail_product?.stok); // Set ke stok maksimal
                                    } else {
                                        setQuantity(inputValue);
                                    }
                                    setPrice(priceWithVariant !== 0 ? priceWithVariant : price);
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
                            max={product?.detail_product?.is_stok ? product?.detail_product?.stok : undefined} // Set batas maksimal stok
                        />

                        {/* Tombol Tambah */}
                        <button
                            onClick={() => {
                                if (!product?.detail_product?.is_stok || quantity < product?.detail_product?.stok) {
                                    setQuantity(quantity + 1);
                                    setPrice(priceWithVariant !== 0 ? priceWithVariant : price);
                                }
                            }}
                            disabled={product?.detail_product?.is_stok && quantity >= product?.detail_product?.stok}
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
            {
                message.show && (
                    <Notification message={message.message} status="error" onClose={() => setMessage({ show: false, message: "" })} />
                )
            }
        </div>
    );
};

export default DetailProduct;

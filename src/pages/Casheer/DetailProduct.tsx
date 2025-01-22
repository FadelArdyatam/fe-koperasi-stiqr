import { ArrowLeft, Image } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";

interface DetailProductProps {
    product: any;
    setShowDetailProduct: any;
    variants: any[];
    basket: any[];
    setBasket: any;
    showService: { show: boolean; service: string | null };
}

const DetailProduct: React.FC<DetailProductProps> = ({ product, setShowDetailProduct, variants, basket, setBasket, showService }) => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(product.product_price);
    const [notes, setNotes] = useState("");
    const [detailVariant, setDetailVariant] = useState<any[]>([]);

    console.log("variants from detail product: ", variants);

    const handleVariantChange = (variantId: string, variantName: string, value: string, checked: boolean) => {
        setDetailVariant((prev) => {
            if (checked) {
                // Add the selected variant
                return [...prev, { variant_id: variantId, variant_name: variantName, value }];
            } else {
                // Remove the unselected variant
                return prev.filter((variant) => !(variant.variant_id === variantId && variant.variant_name === variantName && variant.value === value));
            }
        });
    };

    const addBasketHandler = () => {
        const payload = {
            product_id: product.product_id,
            product: product.product_name,
            quantity: quantity,
            price: price,
            notes: notes,
            date: new Date().toLocaleString(),
            detail_variant: detailVariant,
            service: showService?.service,
        };

        setBasket([...basket, payload]);
        setShowDetailProduct(false);
    };

    return (
        <div className="flex w-full flex-col min-h-screen items-center bg-orange-50">
            <div className={`p-5 w-full bg-white`}>
                <div className="w-full flex items-center gap-5 justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowDetailProduct(false)}><ArrowLeft /></button>
                        <p className="font-semibold text-2xl">Detail Produk</p>
                    </div>
                </div>
            </div>

            <div className="w-[90%] flex flex-col items-end mt-5 bg-white p-5 shadow-lg rounded-md">
                <div className="w-full">
                    <div className="flex items-center gap-5">
                        <Image className="scale-[1.5]" />
                        <p className="font-semibold text-lg">{product.product_name}</p>
                    </div>
                    <div className="mt-5">
                        <p className="text-base">Deskripsi Produk</p>
                        <p className="text-gray-500 text-sm">{product.product_description}</p>
                    </div>
                </div>
                <div className="mt-5">
                    <p className="text-orange-400 text-xl font-semibold">{Number(product.product_price).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    })}</p>
                </div>
            </div>

            <div className="w-[90%] mt-5 p-5 rounded-lg bg-white shadow-lg">
                {variants.map((variant, index) => (
                    <div key={index}>
                        <p className="font-semibold">{variant.variant_name}</p>

                        <p className="text-gray-500">Optional - pilih maksimum {variant.multiple_value.split(",").map((value: string) => value.trim()).length}</p>

                        <div className="w-full h-[1px] bg-gray-300 my-5"></div>

                        <div className="flex flex-col w-full gap-5">
                            {variant.multiple_value.split(",").map((value: string, valueIndex: number) => (
                                <div key={valueIndex} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`checkbox-${index}-${valueIndex}`}
                                        value={value.trim()}
                                        className="w-4 h-4 border-gray-300 rounded"
                                        onChange={(e) => handleVariantChange(variant.variant_id, variant.variant_name, value.trim(), e.target.checked)}
                                    />

                                    <label htmlFor={`checkbox-${index}-${valueIndex}`} className="text-gray-700">
                                        {value.trim()}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-[90%] bg-white p-5 rounded-lg shadow-lg mt-5">
                <p className="font-semibold">Catatan Pesanan</p>

                <textarea onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-500 mt-5 rounded-lg p-2" placeholder="Tulis catatan untuk pesananmu" />
            </div>

            <div className="fixed bottom-0 w-full bg-white p-5 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-xl">Total</p>

                    <div className="flex items-center gap-5 mt-5">
                        <button
                            onClick={() => {
                                if (quantity > 1) {
                                    setQuantity(quantity - 1);
                                    setPrice(product.product_price);
                                }
                            }}
                            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl"
                        >
                            -
                        </button>

                        <p>{quantity}</p>

                        <button
                            onClick={() => {
                                setQuantity(quantity + 1);
                                setPrice(product.product_price);
                            }}
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

                    <Button onClick={addBasketHandler} className="bg-orange-400 text-white">
                        Tambah ke Keranjang
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DetailProduct;

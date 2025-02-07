import axiosInstance from "@/hooks/axiosInstance";
import { formatRupiah } from "@/hooks/convertRupiah";
import { ChevronLeft, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditVarianProductProps {
    setShowVariantProductHandler: (showVariantProductHandler: { id: string; status: boolean }) => void;
    variantId: string;
    products: Array<{
        id: number;
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
    }>;
    setReset: (reset: boolean) => void;
}

const EditVarianProduct: React.FC<EditVarianProductProps> = ({ setShowVariantProductHandler, variantId, products, setReset }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [variantProductToEdit, setVariantProductToEdit] = useState<any>({});
    const [selectedProducts, setSelectedProducts] = useState<{ product_id: string }[]>([])

    useEffect(() => {
        if (variantProductToEdit?.product_variant) {
            const initialProducts = variantProductToEdit.product_variant.map((item: { product: { product_id: any } }) => ({
                product_id: item.product.product_id
            }));

            setSelectedProducts(initialProducts);
        }
    }, [variantProductToEdit]);

    console.log("SelectedProduct", selectedProducts)

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        const fetchVariantDetails = async () => {
            try {
                const response = await axiosInstance.get(`/varian/${variantId}/detail`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setVariantProductToEdit(response.data);
            } catch (err: any) {
                console.error("Error fetching variant details:", err);
                setError("Failed to fetch variant details.");
            } finally {
                setLoading(false);
            }
        };

        fetchVariantDetails();
    }, [variantId]);

    const FormSchema = z.object({
        products: z.array(z.object({
            product_id: z.string()
        }))
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            products: [],
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            console.log("data: ", data)

            const payload = {
                variant_id: variantProductToEdit.variant_id,
                products: data.products,
            };

            const response = await axiosInstance.put(
                `/varian/add/product`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("Variant updated successfully:", response.data);
            setShowVariantProductHandler({ id: "", status: false });
            setReset(true);
        } catch (err: any) {
            console.error("Error updating variant:", err.response?.data || err.message);
        }
    };

    console.log("variantProductToEdit:", variantProductToEdit);

    return (
        <div className="pt-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setShowVariantProductHandler({ id: "", status: false })}>
                    <ChevronLeft />
                </button>

                <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Terapkan Varian Ke Produk</p>
            </div>

            {!loading && !error && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 mt-6 bg-white p-5 rounded-lg"
                    >
                        <FormField
                            control={form.control}
                            name="products"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="500">
                                    <FormLabel>Produk</FormLabel>
                                    <FormControl>
                                        <div>
                                            {products.map((product) => (
                                                <label key={product.id} className="flex items-center mb-5">
                                                    <input
                                                        type="checkbox"
                                                        value={product.product_id}
                                                        checked={selectedProducts.some(p => p.product_id === product.product_id)}
                                                        onChange={() => {
                                                            const updatedSelectedProducts = selectedProducts.some(p => p.product_id === product.product_id)
                                                                ? selectedProducts.filter(p => p.product_id !== product.product_id)
                                                                : [...selectedProducts, { product_id: product.product_id }];

                                                            setSelectedProducts(updatedSelectedProducts);
                                                            field.onChange(updatedSelectedProducts);
                                                        }}
                                                        className="mr-2"
                                                    />

                                                    <div className="flex items-center gap-5">
                                                        <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded-md">
                                                            <Package className="scale-[1.5] text-gray-500" />
                                                        </div>

                                                        <div className="flex flex-col items-start gap-1">
                                                            <p className="font-semibold">{product.product_name.length > 20
                                                                ? product.product_name.slice(0, 20) + "..."
                                                                : product.product_name}</p>

                                                            <p className="font-semibold text-gray-500">{formatRupiah(product.product_price)}</p>

                                                            <div className={`${product.product_status ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'} py-1 px-3 rounded-full text-center`}>
                                                                <p className="text-sm">{product.product_status ? 'stok tersedia' : 'stok tidak tersedia'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button data-aos="fade-up" data-aos-delay={500} type="submit" className="w-full bg-green-500 text-white">
                            Simpan Perubahan
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}

export default EditVarianProduct
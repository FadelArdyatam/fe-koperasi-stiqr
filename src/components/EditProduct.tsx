import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/hooks/axiosInstance";

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

interface EditProductProps {
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    products: Array<{
        id: number,
        product_id: string,
        product_name: string,
        product_sku: string,
        product_weight: string,
        product_category: string,
        product_price: string,
        product_status: boolean,
        product_description: string,
        product_image: string,
        created_at: string,
        updated_at: string,
        merchant_id: string,
    }>;
    editIndex: string; // Tambahkan properti ini untuk mengetahui indeks produk yang diedit
    etalases: Array<{
        id: number;
        showcase_id: string;
        showcase_name: string;
        created_at: string;
        updated_at: string;
        merchant_id: string;
        showcase_product: ShowcaseProduct[],
        merchant: Merchant,
    }>;
}

const EditProduct: React.FC<EditProductProps> = ({
    setOpen,
    editIndex,
    etalases
}) => {
    const [productToEdit, setProductToEdit] = useState<EditProductProps['products'][0] | undefined>(undefined);
    const [quantity, setQuantity] = useState(productToEdit?.product_weight?.endsWith("g") ? "g" : "kg");
    const [loading, setLoading] = useState(true); // State untuk mengelola status loading
    const [error, setError] = useState<string | null>(); // State untuk mengelola
    const [selectedEtalase, setSelectedEtalase] = useState<string | undefined>(undefined);

    console.log(editIndex)

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            return;
        }

        const fetchProductDetail = async () => {
            try {
                const response = await axiosInstance.get(`/product/detail/${editIndex}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProductToEdit(response.data.data);

                // Reset form setelah data berhasil di-fetch
                form.reset({
                    photo: undefined,
                    name: response.data.data.product_name,
                    SKU: response.data.data.product_sku,
                    price: response.data.data.product_price,
                    weight: response.data.data.product_weight?.replace(/g|kg/, ""),
                    description: response.data.data.product_description,
                    etalase: [], // Sesuaikan jika ada data etalase
                });
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to fetch product details.");
            } finally {
                setLoading(false);
            }
        };

        if (editIndex) {
            fetchProductDetail();
        }
    }, [editIndex]); // Tambahkan editIndex sebagai dependency


    console.log("Product to edit:", productToEdit);

    // Validasi schema untuk form
    const FormSchema = z.object({
        photo: z.instanceof(File, {
            message: "Photo must be a valid file.",
        }).optional(),
        name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name must be less than 50 characters." }),
        SKU: z.string().min(1, { message: "SKU is required." }).max(20, { message: "SKU must be less than 20 characters." }),
        price: z.string().min(1, { message: "Price is required." }),
        weight: z.string().min(1, { message: "Weight is required." }),
        etalase: z.array(z.string()).nonempty({ message: "At least one etalase must be selected." }),
        description: z.string().max(100, { message: "Description must be less than 100 characters." }).optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            photo: undefined,
            name: productToEdit?.product_name,
            SKU: productToEdit?.product_sku,
            price: productToEdit?.product_price,
            weight: productToEdit?.product_weight?.replace(/g|kg/, ""),
            etalase: ['semua produk'],
            description: productToEdit?.product_description,
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const formData = new FormData();
            formData.append("product_name", data.name);
            formData.append("product_weight", (data.weight + quantity).toString());
            formData.append("product_category", "ExampleCategory"); // Replace with actual value
            formData.append("product_price", data.price.toString());
            formData.append("product_description", data.description || productToEdit?.product_description || "");

            if (data.photo) {
                formData.append("product_image", data.photo);
            }

            const response = await axiosInstance.patch(
                `/product/${editIndex}/allProduct`,
                formData,
            );

            console.log(response.data)

            console.log("selected etalase: ", selectedEtalase);
            console.log("product id: ", response?.data?.data?.product_id);

            const response2 = await axiosInstance.post(
                "/showcase-product/create",
                {
                    product_id: response?.data?.data?.product_id,
                    showcase_id: selectedEtalase
                },
            )

            console.log("Updated product:", response.data);

            console.log(response2.data);

            // Close the form modal
            setOpen({ id: "", status: false });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error updating product:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error updating product:", error);
            }
        }
    }

    const deleteHandler = async () => {
        try {
            const response = await axiosInstance.delete(
                `/product/${editIndex}/delete`,
            );

            console.log(response.data);

            // Close the form modal
            setOpen({ id: "", status: false });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error deleting product:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error deleting product:", error);
            }
        }
    }

    return (
        <div className="pt-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: "", status: false })}>
                    <ChevronLeft />
                </button>
                <p className="font-semibold text-xl text-center uppercase">Edit Product</p>
            </div>

            {/* Indikator loading */}
            {loading && (
                <p className="text-center text-gray-500 mt-5">Loading product details...</p>
            )}

            {/* Error handling */}
            {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded-lg mt-5 text-center">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className=" bg-white rounded-lg p-5  mt-10 ">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                            {/* Form fields tetap sama */}
                            {/* Photo */}
                            <FormField
                                control={form.control}
                                name="photo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Foto Produk (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Produk</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Enter product name"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                                {/* Counter */}
                                                <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                                    {/* {field.value.length}/50 */}
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* SKU */}
                            <FormField
                                control={form.control}
                                name="SKU"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU Produk</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Enter SKU"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                    disabled={true}
                                                />
                                                <p className="absolute right-2 -bottom-5 text-sm text-gray-500">
                                                    {/* {field.value.length}/20 */}
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter price"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Weight */}
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Berat</FormLabel>
                                        <FormControl className="w-full">
                                            <div className="flex items-center space-x-2">
                                                {/* Input untuk nilai berat */}
                                                <input
                                                    type="number"
                                                    placeholder="Masukkan berat"
                                                    {...field}
                                                    className="p-2 border border-gray-300 w-full rounded-md"
                                                />
                                                {/* Dropdown untuk memilih satuan */}
                                                <select
                                                    className="h-10 border border-gray-300 w-full rounded-md"
                                                >
                                                    <option value="" disabled>
                                                        Pilih satuan
                                                    </option>
                                                    <option onClick={() => setQuantity('g')}>Gram (g)</option>
                                                    <option onClick={() => setQuantity('kg')}>Kilogram (kg)</option>
                                                </select>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deskripsi (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <textarea
                                                    className="block w-full border rounded-lg p-3"
                                                    placeholder="Jelaskan apa yang spesial dari produkmu"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                                <p className="absolute right-2 -bottom-5 text-sm text-gray-500">
                                                    {/* {(field.value?.length ?? 0)}/100 */}
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Etalase */}
                            <FormField
                                control={form.control}
                                name="etalase"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilih Etalase</FormLabel>
                                        <div className="space-y-2 mt-2">
                                            {etalases.map((etalase) => (
                                                <div key={etalase.showcase_id} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        id={`etalase-${etalase.showcase_id}`}
                                                        name="etalase"
                                                        value={etalase.showcase_id}
                                                        checked={field.value.includes(etalase.showcase_id)}
                                                        onChange={(e) => {
                                                            field.onChange([e.target.value]); // Perbarui nilai dalam form
                                                            setSelectedEtalase(e.target.value); // Perbarui state etalase yang dipilih
                                                        }}
                                                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <label
                                                        htmlFor={`etalase-${etalase.showcase_id}`}
                                                        className="text-sm font-medium text-gray-700"
                                                    >
                                                        {etalase.showcase_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ... */}
                            <Button type="submit" className="w-full bg-blue-500 text-white">
                                Update
                            </Button>
                        </form>
                    </Form>
                    <Button onClick={deleteHandler} className="w-full mt-5 bg-red-500 text-white">Delete</Button>
                </div>
            )}

        </div>
    );
};

export default EditProduct;

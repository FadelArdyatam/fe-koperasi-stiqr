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
import { ChevronLeft, CircleCheck } from "lucide-react";
import { useState, useEffect } from "react";
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

interface AddProductProps {
    setAddProduct: (value: boolean) => void;
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

const AddProduct: React.FC<AddProductProps> = ({ setAddProduct, etalases }) => {
    const [quantity, setQuantity] = useState('g');
    const [showNotification, setShowNotification] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedEtalase, setSelectedEtalase] = useState<string | undefined>(undefined);

    // Cleanup preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Validation schema for form
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
            name: "",
            SKU: "",
            price: '',
            weight: "",
            etalase: ['semua produk'],
            description: "",
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const formData = new FormData();

        formData.append('product_name', data.name);
        formData.append('product_sku', data.SKU);
        formData.append('product_weight', data.weight + quantity);
        formData.append('product_category', 'Kain');
        formData.append('product_price', data.price);
        formData.append('product_status', 'true');
        formData.append('product_description', data.description || '');

        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        formData.append('merchant_id', userData?.merchant?.id || 'Unknown');

        if (data.photo) {
            formData.append('product_image', data.photo);

            console.log(data.photo)
        }

      
        try {
            const response = await axiosInstance.post(
                "/product/create",
                formData,
            );
            console.log(etalases)
            const response2 = await axiosInstance.post(
                "/showcase-product/create",
                {
                    product_id: response?.data?.data?.product_id,
                    showcase_id: selectedEtalase,
                },
                
            )

            // // Add to local state with the returned image URL
            // const newProduct = {
            //     id: products.length + 1,
            //     product_id: response.data.product_id || "",
            //     product_name: data.name,
            //     product_sku: data.SKU,
            //     product_weight: `${data.weight + quantity}`,
            //     product_category: 'Kain',
            //     product_price: data.price,
            //     product_status: true,
            //     product_description: data.description || "",
            //     product_image: response.data.photo_url || "",
            //     created_at: response.data.created_at || "",
            //     updated_at: response.data.updated_at || "",
            //     merchant_id: userData?.merchant?.id || 'Unknown',
            // };

            // setProducts([...products, newProduct]);

            // // Update each selected etalase
            // data.etalase.forEach((selectedEtalase) => {
            //     etalases.forEach((etalase) => {
            //         if (etalase.name === selectedEtalase || etalase.name === "semua produk") {
            //             etalase.products.push(newProduct.id);
            //         }
            //     });
            // });

            console.log("Product successfully added to API:", response.data);
            console.log("Showcase Product successfully added to API:", response2.data);
            setShowNotification(true);

        } catch (error) {
            console.error("Error while adding product to API:", error);
        }
    }

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} pt-5 w-full mb-32`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddProduct(false)}>
                        <ChevronLeft />
                    </button>
                    <p className="font-semibold text-xl text-center uppercase">Add Product</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10 bg-white p-5 rounded-lg">
                        {/* Photo */}
                        <FormField
                            control={form.control}
                            name="photo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Foto Produk (Optional)</FormLabel>
                                    <FormControl>
                                        <div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        field.onChange(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            {imagePreview && (
                                                <div className="mt-2">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="max-w-[200px] rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
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
                                            <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                                {field.value.length}/50
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
                                            />
                                            <p className="absolute right-2 -bottom-5 text-sm text-gray-500">
                                                {field.value.length}/20
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
                                            <input
                                                type="number"
                                                placeholder="Masukkan berat"
                                                {...field}
                                                className="p-2 border border-gray-300 w-full rounded-md"
                                            />
                                            <select
                                                className="h-10 border border-gray-300 w-full rounded-md"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                            >
                                                <option value="g">Gram (g)</option>
                                                <option value="kg">Kilogram (kg)</option>
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
                                                {(field.value?.length ?? 0)}/100
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
                            render={() => (
                                <FormItem>
                                    <FormLabel>Etalase</FormLabel>
                                    {etalases?.map((etalase) => (
                                        <label key={etalase.id} className="flex items-center mt-2 gap-2">
                                            <input
                                                type="radio"
                                                name="etalase"
                                                value={etalase.showcase_id}
                                                checked={selectedEtalase === etalase.showcase_id}
                                                onChange={() => setSelectedEtalase(etalase.showcase_id)}
                                            />
                                            {etalase.showcase_name}
                                        </label>
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-green-500 text-white">
                            Submit
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Success Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />
                    <p className="mt-10 font-semibold text-xl text-center">Product added successfully!</p>
                    <Button onClick={() => setAddProduct(false)} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddProduct;

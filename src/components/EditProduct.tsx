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
import { useState } from "react";

interface EditProductProps {
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    products: Array<{
        id: number;
        name: string;
        price: string;
        showProduct: boolean;
        SKU: string;
        weight: string;
        description: string;
        outlet: string;
        etalase: string;
        photo: string;
        variants: string[];
    }>;
    setProducts: (products: Array<{
        id: number;
        name: string;
        price: string;
        showProduct: boolean;
        SKU: string;
        weight: string;
        description: string;
        outlet: string;
        etalase: string;
        photo: string;
        variants: string[];
    }>) => void;
    editIndex: number; // Tambahkan properti ini untuk mengetahui indeks produk yang diedit
}

const EditProduct: React.FC<EditProductProps> = ({
    setOpen,
    products,
    setProducts,
    editIndex,
}) => {
    const productToEdit = products[editIndex]; // Produk yang sedang diedit
    console.log("Product to edit:", productToEdit);
    const [quantity, setQuantity] = useState(productToEdit?.weight.endsWith("g") ? "g" : "kg");

    // Validasi schema untuk form
    const FormSchema = z.object({
        photo: z.instanceof(File, {
            message: "Photo must be a valid file.",
        }).optional(),
        name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name must be less than 50 characters." }),
        SKU: z.string().min(1, { message: "SKU is required." }).max(20, { message: "SKU must be less than 20 characters." }),
        price: z.string().min(1, { message: "Price is required." }),
        weight: z.string().min(1, { message: "Weight is required." }),
        outlet: z.string().min(1, { message: "Outlet is required." }),
        etalase: z.string().min(1, { message: "Etalase is required." }),
        description: z.string().max(100, { message: "Description must be less than 100 characters." }).optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            photo: undefined,
            name: productToEdit.name,
            SKU: productToEdit.SKU,
            price: productToEdit.price,
            weight: productToEdit.weight.replace(/g|kg/, ""),
            outlet: productToEdit.outlet,
            etalase: productToEdit.etalase,
            description: productToEdit.description,
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const updatedProduct = {
            ...productToEdit,
            photo: data.photo ? URL.createObjectURL(data.photo) : productToEdit.photo,
            name: data.name,
            SKU: data.SKU,
            price: data.price,
            weight: data.weight + quantity,
            description: data.description || productToEdit.description,
            outlet: data.outlet,
            etalase: data.etalase,
        };

        const updatedProducts = [...products];
        updatedProducts[editIndex] = updatedProduct; // Update produk pada indeks tertentu

        setProducts(updatedProducts);

        console.log("Updated product:", updatedProduct);

        // Tutup form
        setOpen({ id: -1, status: false });
    }

    return (
        <div className="p-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: -1, status: false })}>
                    <ChevronLeft />
                </button>
                <p className="font-semibold text-xl text-center uppercase">Edit Product</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10">
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
                                        {/* Input untuk nilai berat */}
                                        <input
                                            type="number"
                                            placeholder="Masukkan berat"
                                            {...field}
                                            className="p-2 border border-gray-300 w-full rounded-md"
                                        />
                                        {/* Dropdown untuk memilih satuan */}
                                        <select
                                            className="p-5 h-10 border border-gray-300 w-full rounded-md"
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
                                            {(field.value?.length ?? 0)}/100
                                        </p>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Outlet */}
                    <FormField
                        control={form.control}
                        name="outlet"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Outlet</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter outlet name" {...field} />
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
                                <FormLabel>Etalase</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter etalase name" {...field} />
                                </FormControl>
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
        </div>
    );
};

export default EditProduct;

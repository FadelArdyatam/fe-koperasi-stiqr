import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Package, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface EditEtalaseProps {
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    setEtalases: (products: Array<{
        id: number;
        name: string;
        products: number[];
    }>) => void;
    etalases: Array<{
        id: number;
        name: string;
        products: number[];
    }>;
    editIndex: number; // Tambahkan properti ini untuk mengetahui indeks produk yang diedit
    products: Array<{
        id: number;
        name: string;
        price: string;
        showProduct: boolean;
        SKU: string;
        weight: string;
        description: string;
        etalase: string[];
        photo: string;
        variants: number[];
    }>;
}

const EditEtalase: React.FC<EditEtalaseProps> = ({ setOpen, etalases, setEtalases, editIndex, products }) => {
    const [showSetProductInput, setShowSetProductInput] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const etalaseToEdit = etalases[editIndex]; // Produk yang sedang diedit
    console.log("Product to edit:", etalaseToEdit);

    // Validasi schema untuk form
    const FormSchema = z.object({
        name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name must be less than 30 characters." }),
        products: z.array(z.number()),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: etalaseToEdit.name,
            products: etalaseToEdit.products,
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // Perbarui etalase yang sedang diedit
        const updatedEtalase = {
            ...etalaseToEdit,
            name: data.name,
            products: data.products,
        };

        const updatedEtalases = [...etalases];
        updatedEtalases[editIndex] = updatedEtalase;  // Mengupdate etalase pada indeks yang sesuai

        console.log("Updated product:", updatedEtalase);

        // Perbarui produk yang terhubung dengan etalase
        const updatedProducts = [...products];
        updatedProducts.forEach((product) => {
            if (updatedEtalase.products.includes(product.id)) {
                product.etalase = [...product.etalase, updatedEtalase.name];
            } else {
                product.etalase = product.etalase.filter((name) => name !== updatedEtalase.name);
            }
        });

        console.log("Updated products:", products);

        // Tutup form
        setOpen({ id: -1, status: false });
    }


    return (
        <>
            <div className={`${showSetProductInput ? 'hidden' : 'block'}`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setOpen({ id: -1, status: false })}>
                        <ChevronLeft />
                    </button>
                    <p className="font-semibold text-xl text-center uppercase">Edit Etalase</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10">
                        {/* Form fields tetap sama */}
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

                        {/* Products */}
                        <div>
                            <div className="flex items-start gap-5 justify-between">
                                <div>
                                    <p>Daftar Produk</p>
                                    <p className="text-sm text-gray-400">{etalaseToEdit.products.length} Produk</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSetProductInput(true)}
                                    className="text-orange-400"
                                >
                                    Atur Produk
                                </button>
                            </div>

                            <div className="mt-10 flex flex-col gap-5">
                                {etalaseToEdit.products.map((productId) => {
                                    const product = products.find((product) => product.id === productId);

                                    return (
                                        <div key={productId} className="flex items-center gap-5 w-full">
                                            <div className="w-20 h-20 min-w-20 min-h-20 rounded-lg bg-orange-50 flex items-center justify-center">
                                                <Package className="scale-[2] text-gray-500" />
                                            </div>

                                            <div className="flex items-center w-full gap-5 justify-between">
                                                <div className="flex flex-col">
                                                    <p>{product?.name}</p>

                                                    <p className="text-lg">
                                                        Rp {new Intl.NumberFormat("id-ID").format(Number(product?.price))}
                                                    </p>

                                                    <div className="p-1 rounded-lg bg-green-100">
                                                        <p className="text-xs text-green-500">Stok Tersedia</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ... */}
                        <Button type="submit" className="w-full bg-blue-500 text-white">
                            Update
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Form Atur Produk */}
            <div className={`${showSetProductInput ? "block" : "hidden"}`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setShowSetProductInput(false)}>
                        <ChevronLeft />
                    </button>
                    <div className="flex items-center gap-5 justify-between w-full">
                        <p className="font-semibold text-xl uppercase">Atur Produk</p>
                        <Button
                            onClick={() => setShowSetProductInput(false)}
                            className="bg-orange-50 rounded-full text-orange-500"
                        >
                            Simpan
                        </Button>
                    </div>
                </div>

                <div className="mt-5">
                    <p className="font-medium text-lg">Tambah Produk</p>

                    <p className="text-sm text-gray-400">Pilih produk yang akan dimasukkan ke etalase.</p>

                    <div className="mt-5 relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                            <Search />
                        </div>
                        <Input
                            placeholder="Cari nama produk"
                            className="pl-10 pr-12 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="mt-5 space-y-5">
                        <p>{form.getValues('products').length} Produk Terpilih</p>

                        {products.map((product) => (
                            <label key={product.id} className="flex items-center gap-3 w-full">
                                <div className="w-20 h-20 min-w-20 min-h-20 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Package className="scale-[2] text-gray-500" />
                                </div>

                                <div className="flex items-center w-full gap-5 justify-between">
                                    <div className="flex flex-col">
                                        <p>{product.name}</p>

                                        <p className="text-lg">Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}</p>

                                        <div className="p-1 rounded-lg bg-green-100">
                                            <p className="text-xs text-green-500">Stok Tersedia</p>
                                        </div>
                                    </div>

                                    <input
                                        type="checkbox"
                                        value={product.id}
                                        checked={etalaseToEdit.products.includes(product.id)}
                                        onChange={() => {
                                            // Create a new array instead of modifying etalaseToEdit.products
                                            const updatedProducts = etalaseToEdit.products.includes(product.id)
                                                ? etalaseToEdit.products.filter((id) => id !== product.id) // Remove the product ID
                                                : [...etalaseToEdit.products, product.id]; // Add the product ID

                                            // Update the form state using the provided method
                                            form.setValue("products", updatedProducts);

                                            // Update the etalases state immutably
                                            const newEtalases = etalases.map((etalase, index) =>
                                                index === editIndex ? { ...etalase, products: updatedProducts } : etalase
                                            );
                                            setEtalases(newEtalases);
                                        }}
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditEtalase
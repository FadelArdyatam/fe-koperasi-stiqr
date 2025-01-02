import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Package, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { array, z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";

interface EditEtalaseProps {
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
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
    editIndex: number; 
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
        merchant_id: string
    }>;
}

const EditEtalase: React.FC<EditEtalaseProps> = ({ setOpen, etalases, setEtalases, editIndex, products }) => {
console.log(etalases)
    useEffect(() => {
        const fetchDetailShowcase = async() => {
            try {
                const showcase = await axiosInstance.get(`/showcase/detail/${editIndex}`)
                setEtalasaToEdit(showcase.data.data)
            } catch (error) {
                console.log(error.message)
            }
        }
        fetchDetailShowcase()
    }, []);
    const [showSetProductInput, setShowSetProductInput] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [etalaseToEdit,setEtalasaToEdit] = useState();
    console.log(etalaseToEdit)

    const FormSchema = z.object({
        name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name must be less than 30 characters." }),
        products: z.array(z.number()),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: etalaseToEdit?.name,
            products: etalaseToEdit?.showcase_product,
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const updatedEtalase = {
            ...etalaseToEdit,
            name: data?.name,
            products: data?.showcase_product,
        };

        const updatedEtalases = [...etalases];
        updatedEtalases[editIndex] = updatedEtalase;  

        console.log("Updated product:", updatedEtalase);

        const updatedProducts = [...products];
        updatedProducts.forEach((product) => {
            if (updatedEtalase?.products?.includes(product.id)) {
                product.etalase = [...product.etalase, updatedEtalase?.name];
            } else {
                product.etalase = product.etalase.filter((name) => name !== updatedEtalase?.name);
            }
        });

        console.log("Updated products:", products);

        // Tutup form
        setOpen({ id: -1, status: false });
    }


    return (
        <>
            <div className={`${showSetProductInput ? 'hidden' : 'block'} pt-5`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setOpen({ id: -1, status: false })}>
                        <ChevronLeft />
                    </button>
                    <p className="font-semibold text-xl text-center uppercase">Edit Etalase</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10 p-5 bg-white rounded-lg">
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
                                                placeholder="Enter Showcase Name"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                            {/* Counter */}
                                            <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                                {field.value?.length}/50
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
                                    <p className="text-sm text-gray-400">{etalaseToEdit?.showcase_product?.length} Produk</p>
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
                                {etalaseToEdit?.showcase_product?.map((products,i) => {
                                    const product = products.product
                                    return (
                                        <div key={i} className="flex items-center gap-5 w-full">
                                            <div className="w-20 h-20 min-w-20 min-h-20 rounded-lg bg-orange-50 flex items-center justify-center">
                                                <Package className="scale-[2] text-gray-500" />
                                            </div>

                                            <div className="flex items-center w-full gap-5 justify-between">
                                                <div className="flex flex-col">
                                                    <p>{product?.product_name}</p>

                                                    <p className="text-lg">
                                                        Rp {new Intl.NumberFormat("id-ID").format(Number(product?.product_price))}
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
            <div className={`${showSetProductInput ? "block" : "hidden"} pt-5`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setShowSetProductInput(false)}>
                        <ChevronLeft />
                    </button>
                    <div className="flex items-center gap-5 justify-between w-full">
                        <p className="font-semibold text-xl uppercase">Atur Produk</p>
                        <Button
                            onClick={() => setShowSetProductInput(false)}
                            className="bg-orange-100 rounded-full text-orange-500"
                        >
                            Simpan
                        </Button>
                    </div>
                </div>

                <div className="mt-5 p-5 bg-white rounded-lg">
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
                        <p>{form.getValues('products')?.length} Produk Terpilih</p>

                        {products?.map((product) => (
                            <label key={product.id} className="flex items-center gap-3 w-full">
                                <div className="w-20 h-20 min-w-20 min-h-20 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Package className="scale-[2] text-gray-500" />
                                </div>

                                <div className="flex items-center w-full gap-5 justify-between">
                                    <div className="flex flex-col">
                                        <p>{product.product_name}</p>

                                        <p className="text-lg">Rp {new Intl.NumberFormat('id-ID').format(Number(product.product_price))}</p>

                                        <div className="p-1 rounded-lg bg-green-100">
                                            <p className="text-xs text-green-500">Stok Tersedia</p>
                                        </div>
                                    </div>

                                    <input
                                        type="checkbox"
                                        value={product.id}
                                        checked={etalaseToEdit?.products?.includes(product.id)}
                                        onChange={() => {
                                            // Create a new array instead of modifying etalaseToEdit.products
                                            const updatedProducts = etalaseToEdit?.products?.includes(product.id)
                                                ? etalaseToEdit?.products.filter((id) => id !== product.id) // Remove the product ID
                                                : [...etalaseToEdit?.products, product.id]; // Add the product ID

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
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleCheck, Package, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AddEtalaseProps {
    setAddEtalase: (value: boolean) => void;
    etalases: Array<{
        id: number;
        name: string;
        products: number[];
    }>;
    setEtalases: (etalases: Array<{
        id: number;
        name: string;
        products: number[];
    }>) => void;
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

const AddEtalase: React.FC<AddEtalaseProps> = ({ setAddEtalase, etalases, setEtalases, products }) => {
    const [showSetProductInput, setShowSetProductInput] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNotification, setShowNotification] = useState(false);

    const FormSchema = z.object({
        name: z.string().nonempty("Nama etalase wajib diisi").max(30, "Maksimal 30 karakter"),
        products: z.array(z.number()),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            products: [],
        },
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        const newEtalase = {
            id: etalases.length + 1,
            name: data.name,
            products: selectedProducts,
        };

        // To update the etalase field in products
        products.map((product) => {
            if (!product.etalase.includes(data.name) && selectedProducts.includes(product.id)) {
                product.etalase = [...product.etalase, data.name]
            }
        })

        setEtalases([...etalases, newEtalase]);

        setShowNotification(true);

        console.log(products)
    };

    return (
        <>
            {/* Form Nama Etalase */}
            <div className={`${showSetProductInput || showNotification ? "hidden" : "block"} pt-5`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddEtalase(false)}>
                        <ChevronLeft />
                    </button>
                    <p className="font-semibold text-xl uppercase">Tambah Etalase</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10 p-5 bg-white rounded-lg">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Etalase</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Contoh: Makanan, Gadget"
                                                {...field}
                                            />
                                            <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                                {field.value.length}/30
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
                                    <p className="text-sm text-gray-400">{selectedProducts.length} Produk</p>
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
                                {selectedProducts.map((productId) => {
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

                        <Button type="submit" className="w-full bg-green-500 text-white">
                            Submit
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
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => {
                                            const updatedProducts = selectedProducts.includes(product.id)
                                                ? selectedProducts.filter((id) => id !== product.id)
                                                : [...selectedProducts, product.id];
                                            setSelectedProducts(updatedProducts);
                                            form.setValue("products", updatedProducts);
                                        }}
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p className="mt-10 font-semibold text-xl text-center">Etalase added successfully!</p>

                    <Button onClick={() => setAddEtalase(false)} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddEtalase;

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface Choice {
    name: string;
    price: number;
    show: boolean;
}

interface EditVariantProps {
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    variants: Array<{
        id: number;
        name: string;
        choises: Choice[];
        mustBeSelected: boolean;
        methods: string;
        products: number[];
        showVariant: boolean;
    }>;
    setVariants: (variants: Array<{
        id: number;
        name: string;
        choises: Choice[];
        mustBeSelected: boolean;
        methods: string;
        products: number[];
        showVariant: boolean;
    }>) => void;
    editIndex: number; // Tambahkan properti ini untuk mengetahui indeks produk yang diedit
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
        etalase: string[];
        variants: number[];
    }>;
}

const EditVariant: React.FC<EditVariantProps> = ({ setOpen, variants, setVariants, editIndex, products }) => {
    const [showChoisesInput, setShowChoisesInput] = useState(false);
    const [showEditChoisesInput, setShowEditChoisesInput] = useState({ editName: false, editPrice: false, status: false, index: -1 });
    const [newChoiceName, setNewChoiceName] = useState("");
    const [newChoicePrice, setNewChoicePrice] = useState<number | "">("");
    const [showChoice, setShowChoice] = useState(false);
    const [, setTemporaryChoiceValue] = useState<Choice[]>([]); // State untuk menyimpan nilai sementara pilihan {dan masih gatau fungsinya untuk apa}

    const variantToEdit = variants[editIndex]; // Produk yang sedang diedit
    console.log("Variant to edit:", variantToEdit);

    const FormSchema = z.object({
        name: z.string().nonempty("Nama varian wajib diisi"),
        choises: z.array(
            z.object({
                name: z.string().nonempty("Nama pilihan wajib diisi"),
                price: z.number().positive("Harga harus positif"),
                show: z.boolean(),  // Tambahkan atribut show
            })
        ),
        mustBeSelected: z.boolean(),
        methods: z.string().nonempty("Metode wajib dipilih"),
        products: z.array(z.number()),
        showVariant: z.boolean(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: variantToEdit.name,
            choises: variantToEdit.choises,
            mustBeSelected: variantToEdit.mustBeSelected,
            methods: variantToEdit.methods,
            products: variantToEdit.products,
            showVariant: variantToEdit.showVariant,
        },
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        const updatedVariant = {
            ...variantToEdit,
            name: data.name,
            choises: data.choises,
            mustBeSelected: data.mustBeSelected,
            methods: data.methods,
            products: data.products,
            showVariant: data.showVariant,
        };

        const updatedVariants = [...variants];

        updatedVariants[editIndex] = updatedVariant; // Perbarui produk yang diedit

        setVariants(updatedVariants);

        console.log("Updated variants:", updatedVariants);

        // To update the variants field in products
        products.map((product) => {
            if (data.products.includes(product.id)) {
                const updatedVariants = [...product.variants, updatedVariant.id];
                product.variants = updatedVariants;
            }
        })

        setOpen({ id: -1, status: false }); // Tutup form edit
    };

    const addNewChoice = () => {
        if (newChoiceName && newChoicePrice) {
            const newChoice: Choice = {
                name: newChoiceName,
                price: Number(newChoicePrice),
                show: showChoice,
            };

            // Menggabungkan pilihan yang ada dengan yang baru
            const updatedChoices = [...form.getValues("choises"), newChoice];

            form.setValue("choises", updatedChoices);  // Mengupdate data form
            setNewChoiceName("");
            setNewChoicePrice("");
            setShowChoisesInput(false);
        }
    };

    const updateShowChoises = (indexToUpdate: number) => {
        const choises = form.getValues("choises");

        const updatedChoises = choises.map((choice, index) =>
            index === indexToUpdate ? { ...choice, show: !choice.show } : choice
        );

        // Mengupdate form state dengan data yang sudah diperbarui
        form.setValue("choises", updatedChoises);

        setTemporaryChoiceValue(updatedChoises);

        console.log("Void:", form.getValues("choises"));
    };

    // console.log("This temporary: ", temporaryChoiceValue)

    return (
        <div className="pt-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: -1, status: false })}>
                    <ChevronLeft />
                </button>
                <p className="font-semibold text-xl text-center uppercase">Edit Varian</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6 bg-white p-5 rounded-lg">
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Varian</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Masukkan nama varian"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="button" onClick={() => setShowChoisesInput(true)} className="bg-transparent hover:bg-transparent border-2 border-orange-400 w-full text-orange-400">Tambah Pilihan</Button>

                    {/* Choises */}
                    <div className="mt-5">
                        {form.getValues("choises").map((choise, index) => (
                            <div key={index} className="mt-5">
                                <p>Pilihan {index + 1}</p>

                                <div className="border border-gray-500 p-5 rounded-lg mt-3">
                                    <div className="flex items-center gap-5 justify-between">
                                        <p>{choise.name}</p>

                                        <button type="button" onClick={() => setShowEditChoisesInput({ ...showEditChoisesInput, status: true, index: index })} className="text-orange-400">Ubah</button>
                                    </div>

                                    <div className="mt-3 flex items-center gap-5 justify-between">
                                        <p className="text-gray-500">{choise.price}</p>

                                        <div
                                            onClick={() => updateShowChoises(index)}
                                            className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${choise.show ? "bg-orange-400" : "bg-gray-300"}`}
                                        >
                                            <div
                                                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${choise.show ? "translate-x-6" : "translate-x-0"}`}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Popup untuk Input Harga dan Nama */}
                    {showChoisesInput && (
                        <div className="fixed bg-black bg-opacity-50 inset-0 z-20 -translate-y-10">
                            <div className="bg-white p-4 rounded-lg mt-10 translate-y-10 absolute bottom-0 w-full">
                                <p className="text-center mb-10 text-lg font-semibold">Tambah Pilihan</p>

                                <div>
                                    <p>Nama Pilihan</p>

                                    <Input
                                        className="mt-3"
                                        placeholder="Nama Pilihan"
                                        value={newChoiceName}
                                        onChange={(e) => setNewChoiceName(e.target.value)}
                                    />
                                </div>

                                <div className="mt-5">
                                    <p>Harga</p>

                                    <Input
                                        className="mt-3"
                                        type="number"
                                        placeholder="Harga"
                                        value={newChoicePrice}
                                        onChange={(e) => setNewChoicePrice(Number(e.target.value))}
                                    />
                                </div>

                                <div className="mt-5">
                                    <p>Tampilkan</p>

                                    <div
                                        onClick={() => setShowChoice(!showChoice)}
                                        className={`w-14 h-8 mt-3 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${showChoice ? "bg-orange-400" : "bg-gray-300"
                                            }`}
                                    >
                                        <div
                                            className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${showChoice ? "translate-x-6" : "translate-x-0"
                                                }`}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 mt-5">
                                    <Button
                                        onClick={addNewChoice}
                                        className="bg-green-500 w-full"
                                    >
                                        Simpan
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={() => setShowChoisesInput(false)}
                                        className="bg-gray-300 w-full"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Popup untuk Edit Harga dan Nama */}
                    {showEditChoisesInput.status && (
                        <div className="fixed bg-black bg-opacity-50 inset-0 z-20">
                            <div className="bg-white p-4 rounded-lg mt-10 absolute bottom-0 w-full">
                                <p className="text-center mb-10 text-lg font-semibold">Ubah Pilihan</p>

                                {/* Input Nama Pilihan */}
                                <div>
                                    <p>Nama Pilihan</p>
                                    <Input
                                        className="mt-3"
                                        placeholder="Nama Pilihan"
                                        onChange={(e) => {
                                            const updatedChoises = form.getValues("choises").map((choice, index) =>
                                                index === showEditChoisesInput.index
                                                    ? { ...choice, name: e.target.value }
                                                    : choice
                                            );
                                            form.setValue("choises", updatedChoises);
                                        }}
                                    />
                                </div>

                                {/* Input Harga */}
                                <div className="mt-5">
                                    <p>Harga</p>
                                    <Input
                                        className="mt-3"
                                        type="number"
                                        placeholder="Harga"
                                        onChange={(e) => {
                                            const updatedChoises = form.getValues("choises").map((choice, index) =>
                                                index === showEditChoisesInput.index
                                                    ? { ...choice, price: Number(e.target.value) }
                                                    : choice
                                            );
                                            form.setValue("choises", updatedChoises);
                                        }}
                                    />
                                </div>

                                {/* Toggle Pilihan */}
                                <div className="mt-5">
                                    <p>Tampilkan</p>
                                    <div
                                        onClick={() => setShowChoice(!showChoice)}
                                        className={`w-14 h-8 mt-3 flex items-center rounded-full p-1 cursor-pointer ${showChoice ? "bg-orange-400" : "bg-gray-300"
                                            }`}
                                    >
                                        <div
                                            className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${showChoice ? "translate-x-6" : "translate-x-0"
                                                }`}
                                        ></div>
                                    </div>
                                </div>

                                {/* Tombol Simpan dan Tutup */}
                                <div className="flex items-center gap-5 mt-5">
                                    <Button
                                        onClick={() => {
                                            // Tutup modal setelah menyimpan perubahan
                                            setShowEditChoisesInput({ editName: false, editPrice: false, status: false, index: -1 });
                                        }}
                                        className="bg-green-500 w-full"
                                    >
                                        Simpan
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={() => {
                                            // Batalkan perubahan dan tutup modal
                                            setShowEditChoisesInput({ editName: false, editPrice: false, status: false, index: -1 });
                                        }}
                                        className="bg-gray-300 w-full"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Must Be Selected */}
                    <FormField
                        control={form.control}
                        name="mustBeSelected"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-5 justify-between">
                                    <FormLabel>Wajib Dipilih?</FormLabel>
                                    <FormControl>
                                        <div
                                            className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${field.value ? "bg-orange-400" : "bg-gray-300"
                                                }`}
                                            onClick={() => field.onChange(!field.value)}
                                        >
                                            <div
                                                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${field.value ? "translate-x-6" : "translate-x-0"
                                                    }`}
                                            ></div>
                                        </div>
                                    </FormControl>
                                </div>

                                <p className="text-sm text-gray-500">Varian harus dipilih pembeli.</p>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Methods */}
                    <FormField
                        control={form.control}
                        name="methods"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Metode</FormLabel>
                                <FormControl>
                                    <div>
                                        <label className="flex items-center mb-2">
                                            <input
                                                type="radio"
                                                value="single"
                                                checked={field.value === "single"}
                                                onChange={() => field.onChange("single")}
                                                className="mr-2"
                                            />
                                            <span>Maks. Pilih 1</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="more"
                                                checked={field.value === "more"}
                                                onChange={() => field.onChange("more")}
                                                className="mr-2"
                                            />
                                            <span>Boleh lebih dari 1</span>
                                        </label>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Products */}
                    <FormField
                        control={form.control}
                        name="products"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Produk</FormLabel>
                                <FormControl>
                                    <div>
                                        {products.map((product) => (
                                            <label key={product.id} className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    value={product.id}
                                                    checked={field.value.includes(product.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            field.onChange([...field.value, product.id]);
                                                        } else {
                                                            field.onChange(field.value.filter((id) => id !== product.id));
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                <span>{product.product_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-green-500 text-white">
                        Simpan Varian
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default EditVariant
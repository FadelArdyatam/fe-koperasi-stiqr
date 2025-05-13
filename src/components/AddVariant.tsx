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
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import Notification from "./Notification";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";

interface Choice {
    name: string;
    price: number;
    show: boolean;
}

interface AddVariantProps {
    setAddVariant: (value: boolean) => void;
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
    variants: Array<{
        id: number;
        variant_id: string;
        variant_name: string;
        product_id: string;
        variant_description: string;
        is_multiple: boolean;
        merchant_id: string;
        products: number[];
        mustBeSelected: boolean;
        methods: string;
        choises: [];
        showVariant: boolean;
    }>;

    setVariants: (variants: Array<{
        variant_status: any;
        product_variant: any;
        id: number;
        variant_id: string;
        variant_name: string;
        product_id: string;
        variant_description: string;
        is_multiple: boolean;
        merchant_id: string;
        products: number[];
        mustBeSelected: boolean;
        methods: string;
        choises: [];
        showVariant: boolean;
    }>) => void;
}

const AddVariant: React.FC<AddVariantProps> = ({ setAddVariant, variants, setVariants }) => {
    const [showChoisesInput, setShowChoisesInput] = useState(false);
    const [showEditChoisesInput, setShowEditChoisesInput] = useState({ status: false, index: -1 });
    const [newChoiceName, setNewChoiceName] = useState("");
    const [newChoicePrice, setNewChoicePrice] = useState<number | "">("");
    const [showChoice, setShowChoice] = useState(false);
    const [displayChoises, setDisplayChoises] = useState<Choice[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const FormSchema = z.object({
        name: z.string().nonempty("Nama varian wajib diisi"),
        choises: z.array(
            z.object({
                name: z.string().nonempty("Nama pilihan wajib diisi"),
                price: z.number().refine((val) => val >= 0, {
                    message: "Harga tidak boleh negatif",
                }),
                show: z.boolean(),  // Tambahkan atribut show
            })
        ),
        mustBeSelected: z.boolean(),
        methods: z.string().nonempty("Metode wajib dipilih"),
        products: z.array(z.string()),
        showVariant: z.boolean(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            choises: [],
            mustBeSelected: false,
            methods: "",
            products: [],
            showVariant: false,
        },
    });

    console.log(displayChoises)
    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const payload = {
            variant_name: data.name,
            product_id: data.products.join(","), // Konversi array ke string dengan koma
            variant_description: "Deskripsi untuk variant", // Bisa diambil dari form jika diperlukan
            is_multiple: data.methods === "more",
            multiple_value: displayChoises, // Semua pilihan nama
            merchant_id: userData?.merchant?.id, // ID merchant
            is_required: data.mustBeSelected
        };


        try {
            const response = await axiosInstance.post(
                "/varian/create",
                payload
            );

            if (response.status === 200 || response.status === 201) {
                setVariants([...variants, response.data.data]);

                console.log("Varian berhasil ditambahkan:", response.data);
                setShowNotification(true);
            } else {
                console.error("Gagal menambahkan varian:", response.data);
            }
        } catch (error: any) {
            console.error("Terjadi kesalahan saat mengirim data:", error.response?.data || error.message);
        }
    };

    const addNewChoice = () => {
        if (newChoiceName) {
            if (Number(newChoicePrice) < 0) {
                console.log('error disini kah?')
                setShowError(true);
                return;
            }

            const newChoice = {
                name: newChoiceName,
                price: Number(newChoicePrice),
                show: showChoice,
            };

            const updatedChoices = [...form.getValues("choises"), newChoice];
            form.setValue("choises", updatedChoices);
            setDisplayChoises(updatedChoices);

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

        form.setValue("choises", updatedChoises);
        setDisplayChoises(updatedChoises);
    };

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} pt-5 w-full`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddVariant(false)}>
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="font-semibold text-xl uppercase">Tambah Varian</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6 bg-white p-5 rounded-lg">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="100">
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

                        <Button data-aos="fade-up" data-aos-delay="200" type="button" onClick={() => setShowChoisesInput(true)} className="bg-transparent hover:bg-transparent border-2 border-orange-400 w-full text-orange-400">Tambah Pilihan</Button>

                        {/* Choises */}
                        <div className="mt-5">
                            {displayChoises.map((choise, index) => (
                                <div data-aos="fade-up" data-aos-delay={index * 100} key={index} className="mt-5">
                                    <p>Pilihan {index + 1}</p>

                                    <div className="border border-gray-500 p-5 rounded-lg mt-3">
                                        <div className="flex items-center gap-5 justify-between">
                                            <p>{choise.name}</p>

                                            <button type="button" onClick={() => setShowEditChoisesInput({ status: true, index: index })} className="text-orange-400">Ubah</button>
                                        </div>

                                        <div className="mt-3 flex items-center gap-5 justify-between">
                                            <p className="text-gray-500">{formatRupiah(choise.price)}</p>

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
                            <div className="fixed bg-black bg-opacity-50 inset-0 z-20 h-screen -translate-y-8">
                                <div data-aos="fade-up" className="bg-white p-4 rounded-t-lg mt-10 absolute bottom-0 w-full">
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
                                            inputMode="numeric"
                                            type="text"
                                            placeholder="Harga"
                                            value={formatRupiah(newChoicePrice.toString() ?? 0)}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                setNewChoicePrice(rawValue ? Number(rawValue) : 0);
                                            }}
                                        />
                                        {showError && <p className="text-red-500 text-sm">Harga harus positif</p>}
                                    </div>

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

                                    <div className="flex items-center gap-5 mt-5">
                                        <Button onClick={addNewChoice} className="bg-green-500 w-full">
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


                        {/* Notification */}
                        {showError && <Notification message="Harga harus positif" onClose={() => setShowError(false)} status={"error"} />}

                        {/* Popup untuk Edit Harga dan Nama */}
                        {
                            showEditChoisesInput.status && (
                                <div className="fixed bg-black bg-opacity-50 inset-0 z-20 h-screen -translate-y-8">
                                    <div data-aos="fade-up" className="bg-white p-4 rounded-t-lg mt-10 translate-y-10 absolute bottom-0 w-full">
                                        <p className="text-center mb-10 text-lg font-semibold">Ubah Pilihan</p>

                                        <div>
                                            <p>Nama Pilihan</p>

                                            <Input
                                                className="mt-3"
                                                placeholder="Nama Pilihan"
                                                value={displayChoises[showEditChoisesInput.index].name}
                                                onChange={(e) => {
                                                    const updatedChoises = displayChoises.map((choise, index) =>
                                                        index === showEditChoisesInput.index ? { ...choise, name: e.target.value } : choise
                                                    );

                                                    form.setValue("choises", updatedChoises);
                                                    setDisplayChoises(updatedChoises);
                                                }}
                                            />
                                        </div>

                                        <div className="mt-5">
                                            <p>Harga</p>

                                            <Input
                                                className="mt-3"
                                                type="number"
                                                placeholder="Harga"
                                                value={displayChoises[showEditChoisesInput.index].price}
                                                onChange={(e) => {
                                                    const updatedChoises = displayChoises.map((choise, index) =>
                                                        index === showEditChoisesInput.index ? { ...choise, price: Number(e.target.value) } : choise
                                                    );

                                                    form.setValue("choises", updatedChoises);
                                                    setDisplayChoises(updatedChoises);
                                                }}
                                            />
                                        </div>

                                        <div className="mt-5">
                                            <p>Tampilkan</p>

                                            <div
                                                onClick={() => {
                                                    const updatedChoises = displayChoises.map((choise, index) =>
                                                        index === showEditChoisesInput.index ? { ...choise, show: !choise.show } : choise
                                                    );

                                                    form.setValue("choises", updatedChoises);
                                                    setDisplayChoises(updatedChoises);
                                                }}
                                                className={`w-14 h-8 mt-3 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${displayChoises[showEditChoisesInput.index].show ? "bg-orange-400" : "bg-gray-300"
                                                    }`}
                                            >
                                                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${displayChoises[showEditChoisesInput.index].show ? "translate-x-6" : "translate-x-0"
                                                    }`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 mt-5">
                                            <Button
                                                onClick={() => setShowEditChoisesInput({ status: false, index: -1 })}
                                                className="bg-green-500 w-full"
                                            >
                                                Simpan
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={() => setShowEditChoisesInput({ status: false, index: -1 })}
                                                className="bg-gray-300 w-full"
                                            >
                                                Tutup
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* Must Be Selected */}
                        <FormField
                            control={form.control}
                            name="mustBeSelected"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="300">
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
                                <FormItem data-aos="fade-up" data-aos-delay="400">
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
                        {/* <FormField
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
                                                        checked={field.value.includes(product.product_id)} // Memastikan `product_id` digunakan
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                field.onChange([...field.value, product.product_id]); // Tambahkan jika checked
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter((id) => id !== product.product_id) // Hapus jika unchecked
                                                                );
                                                            }
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
                        /> */}

                        <Button data-aos="fade-up" data-aos-delay="600" type="submit" className="w-full bg-green-500 text-white">
                            Simpan Varian
                        </Button>
                    </form >
                </Form >
            </div >

            {/* Notification */}
            {
                showNotification && (
                    <div className="p-10">
                        <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                        <p data-aos="fade-up" data-aos-delay="100" className="mt-10 font-semibold text-xl text-center">Berhasil menambahkan varian</p>

                        <Button data-aos="fade-up" data-aos-delay="200" onClick={() => setAddVariant(false)} className="w-full bg-green-500 text-white mt-10">
                            Done
                        </Button>
                    </div>
                )
            }
        </>
    );
};

export default AddVariant;

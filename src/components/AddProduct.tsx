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
import Notification from "./Notification";
import { useState, useEffect } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";

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

interface Variant {
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
}

interface Choice {
    name: string;
    price: number;
    show: boolean;
}

interface AddProductProps {
    setProducts: (products: Array<{
        id: number,
        detail_product: any;
        product_id: string,
        product_name: string,
        product_sku: string,
        product_weight: string,
        product_category: string,
        product_price: number,
        product_status: boolean,
        product_description: string,
        product_image: string,
        created_at: string,
        updated_at: string,
        merchant_id: string,
        product_variant: Array<{
            variant: any;
            variant_id: string;
        }> & { product_variant: Array<{ variant_id: string }> };
    }>) => void;

    products: Array<{
        id: number,
        detail_product: any;
        product_id: string,
        product_name: string,
        product_sku: string,
        product_weight: string,
        product_category: string,
        product_price: number,
        product_status: boolean,
        product_description: string,
        product_image: string,
        created_at: string,
        updated_at: string,
        merchant_id: string,
        product_variant: Array<{
            variant: any;
            variant_id: string;
        }> & { product_variant: Array<{ variant_id: string }> };
    }>;
    setAddProduct: (value: boolean) => void;
    setEtalases: (etalases: Array<{
        id: number;
        showcase_id: string;
        showcase_name: string;
        created_at: string;
        updated_at: string;
        merchant_id: string;
        showcase_product: ShowcaseProduct[],
        merchant: Merchant,
    }>) => void;
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
    variants: Variant[];
    setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
}

const AddProduct: React.FC<AddProductProps> = ({ setProducts, products, setAddProduct, etalases, setEtalases, variants, setVariants }) => {
    const [quantity, setQuantity] = useState('g');
    const [showNotification, setShowNotification] = useState(false);
    const [showNotificationEtalase, setShowNotificationEtalase] = useState(false);
    const [showNotificationVariant, setShowNotificationVariant] = useState(false);
    const [showNotificationAddProduct, setShowNotificationAddProduct] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedEtalase, setSelectedEtalase] = useState<string | undefined>(undefined);
    const [selectedVariants, setSelectedVariants] = useState<{ variant_id: string }[]>([]);
    const [showPopUpAddEtalase, setShowPopUpAddEtalase] = useState(false);
    const [showPopUpAddVariant, setShowPopUpAddVariant] = useState(false);
    const [showChoisesInput, setShowChoisesInput] = useState(false);
    const [showEditChoisesInput, setShowEditChoisesInput] = useState({ status: false, index: -1 });
    const [newChoiceName, setNewChoiceName] = useState("");
    const [newChoicePrice, setNewChoicePrice] = useState<number | "">("");
    const [showChoice, setShowChoice] = useState(false);
    const [displayChoises, setDisplayChoises] = useState<Choice[]>([]);
    const [showError, setShowError] = useState(false);
    const [showErrorForAddProduct, setShowErrorForAddProduct] = useState(false)
    const [section, setSection] = useState({ addProduct: true, detailProduct: false });
    const [showField, setShowField] = useState({ stock: false, variant: false });
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [allData, setAllData] = useState<any>([]);
    const [stock, setStock] = useState({ stock: 0, minimumStock: 0 });

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    console.log("Product", products)

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
        product_image: z.instanceof(File, {
            message: "Photo must be a valid file.",
        }).optional(),
        product_name: z.string().min(1, { message: "Masukkan Nama Anda." }).max(50, { message: "Name must be less than 50 characters." }),
        product_SKU: z.string().min(1, { message: "SKU Dibutuhkan." }).max(20, { message: "SKU must be less than 20 characters." }),
        product_price: z.string().min(1, { message: "Masukkan Harga." }),
        product_weight: z.string().min(1, { message: "Masukkan Berat." }),
        product_etalase: z.array(z.string()).nonempty({ message: "Minimal satu etalase harus dipilih." }),
        product_description: z.string().max(100, { message: "Deskripsi harus kurang dari 100 karakter." }).optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            product_image: undefined,
            product_name: "",
            product_SKU: "",
            product_price: '',
            product_weight: "",
            product_etalase: ['semua produk'],
            product_description: "",
        },
    });

    console.log("selectedEtalase", selectedEtalase)

    console.log("selectedVariant", selectedVariants)

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        // Buat objek FormData
        const formData = new FormData();

        // Tambahkan data ke FormData
        formData.append("product_name", data.product_name);
        formData.append("product_sku", data.product_SKU);
        formData.append("product_weight", (data.product_weight + quantity).toString());
        formData.append("product_category", "Kain");
        formData.append("product_price", data.product_price.toString()); // Pastikan angka dikonversi ke string
        formData.append("product_status", "true"); // FormData tidak mendukung boolean langsung
        formData.append("product_description", data.product_description || "");
        formData.append("showcase_id", selectedEtalase || "1"); // Jika tidak ada etalase yang dipilih, gunakan etalase "Semua Produk"

        // Ambil merchant_id dari sessionStorage
        const merchantId = sessionStorage.getItem("user")
            ? JSON.parse(sessionStorage.getItem("user")!).merchant?.id || "Unknown"
            : "Unknown";

        formData.append("merchant_id", merchantId);

        // Handle gambar jika ada
        if (data.product_image) {
            formData.append("product_image", data.product_image);
        }

        console.log("FormData Debug:");
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1], typeof pair[1]); // Cek apakah `product_image` terbaca sebagai `File`
        }

        // Update allData dengan FormData (hanya untuk debugging, tidak bisa langsung digunakan di state)
        setAllData([...allData, Object.fromEntries(formData.entries())]);

        setSection({ addProduct: true, detailProduct: true });
    }

    const FormSchemaEtalase = z.object({
        showcase_name: z.string().nonempty("Nama etalase wajib diisi").max(30, "Maksimal 30 karakter"),
    });

    const formEtalase = useForm<z.infer<typeof FormSchemaEtalase>>({
        resolver: zodResolver(FormSchemaEtalase),
        defaultValues: {
            showcase_name: "",
        },
    });

    async function onSubmitEtalase(data: z.infer<typeof FormSchemaEtalase>) {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        try {
            const requestBody = {
                showcase_name: data.showcase_name,
                merchant_id: userData?.merchant?.id,
            };
            const response = await axiosInstance.post(`showcase/create`, requestBody);

            console.log("Etalase successfully added to API:", response.data);

            // Agar etalase yang baru ditambahkan langsung muncul di halaman etalase
            setEtalases([...etalases, response?.data?.data]);

            setShowPopUpAddEtalase(false);

            setShowNotificationEtalase(true);
        } catch (error: any) {
            console.error("Error while adding etalase to API:", error);
        }
    }

    const FormSchemaVariant = z.object({
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
        products: z.array(z.string()),
        showVariant: z.boolean(),
    });

    const formVariant = useForm<z.infer<typeof FormSchemaVariant>>({
        resolver: zodResolver(FormSchemaVariant),
        defaultValues: {
            name: "",
            choises: [],
            mustBeSelected: false,
            methods: "",
            products: [],
            showVariant: false,
        },
    });

    console.log("variants", variants);

    const onSubmitVariant = async (data: z.infer<typeof FormSchemaVariant>) => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const payload = {
            variant_name: data.name,
            product_id: data.products.join(","), // Konversi array ke string dengan koma
            variant_description: "Deskripsi untuk variant", // Bisa diambil dari form jika diperlukan
            is_multiple: data.methods === "more",
            multiple_value: displayChoises.map((choice) => choice.name).join(", "), // Semua pilihan nama
            merchant_id: userData?.merchant?.id, // ID merchant
        };

        console.log(data);

        try {
            const response = await axiosInstance.post(
                "/varian/create",
                payload
            );

            if (response.status === 200 || response.status === 201) {
                // Agar varian yang baru ditambahkan langsung muncul di halaman varian
                setVariants([...variants, response.data.data]);

                setShowPopUpAddVariant(false)
                setShowNotificationVariant(true);
            } else {
                console.error("Gagal menambahkan varian:", response.data);
            }
        } catch (error: any) {
            console.error("Terjadi kesalahan saat mengirim data:", error.response?.data || error.message);
        }
    };

    const addProductHandler = async () => {
        const data = {
            is_stok: showField.stock,
            is_variant: showField.variant,
            variants: selectedVariants,
            stok: stock.stock,
            stok_minimum: stock.minimumStock,
        };

        // Menggabungkan semua objek dalam `allData` dengan `data`
        const mergedData = allData.reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
        mergedData.details_products = data;

        console.log("Merged Data:", mergedData);
        try {
            const response = await axiosInstance.post("/product/create", mergedData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Product successfully added to API:", response.data);

            setProducts([...products, response.data.data]);

            if (selectedEtalase) {
                const response2 = await axiosInstance.post("/showcase-product/create", {
                    product_id: response?.data?.data?.product_id,
                    showcase_id: selectedEtalase,
                });

                console.log(response2);
            }

            setShowNotification(true);
        } catch (error) {
            console.error("Error while adding product to API:", error);
            setShowErrorForAddProduct(true);
        }
    };

    const addNewChoice = () => {
        if (newChoiceName && newChoicePrice) {
            if (newChoicePrice < 0) {
                setShowError(true);
                return;
            }

            const newChoice = {
                name: newChoiceName,
                price: Number(newChoicePrice),
                show: showChoice,
            };

            const updatedChoices = [...formVariant.getValues("choises"), newChoice];
            formVariant.setValue("choises", updatedChoices);
            setDisplayChoises(updatedChoices);

            setNewChoiceName("");
            setNewChoicePrice("");
            setShowChoisesInput(false);
        }
    };

    const updateShowChoises = (indexToUpdate: number) => {
        const choises = formVariant.getValues("choises");
        const updatedChoises = choises.map((choice, index) =>
            index === indexToUpdate ? { ...choice, show: !choice.show } : choice
        );

        formVariant.setValue("choises", updatedChoises);
        setDisplayChoises(updatedChoises);
    };

    const handleVariantChange = (variant_id: string) => {
        setSelectedVariants((prevSelected) =>
            prevSelected.some(variant => variant.variant_id === variant_id)
                ? prevSelected.filter((variant) => variant.variant_id !== variant_id) // Hapus jika sudah dipilih
                : [...prevSelected, { variant_id }] // Tambah jika belum dipilih
        );
    };

    console.log("All Data", allData)

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} pt-5 w-full mb-32`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddProduct(false)}>
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Tambah Produk</p>
                </div>

                <div className="w-full mt-10">
                    <p className="font-semibold"><span className="text-gray-500">{section.detailProduct ? '2' : '1'}/2:</span> {section.addProduct ? 'Informasi Product' : 'Detail Product'}</p>

                    <div className="mt-2 flex items-center gap-3">
                        <div className={`${section.addProduct ? 'bg-orange-500' : 'bg-gray-300'} w-full h-1.5 transition-all rounded-full`}></div>

                        <div className={`${section.detailProduct ? 'bg-orange-500' : 'bg-gray-300'} w-full h-1.5 transition-all rounded-full`}></div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={`${section.detailProduct ? 'hidden' : 'block'} space-y-10 mt-5 bg-white p-5 rounded-lg`}>
                        {/* Photo */}
                        <FormField
                            control={form.control}
                            name="product_image"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="100">
                                    <FormLabel>Foto Produk (Optional)</FormLabel>
                                    <FormControl>
                                        <div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        console.log("Selected file:", file); // Debugging file
                                                        field.onChange(file); // Simpan file ke state form
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
                            name="product_name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="200">
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
                            name="product_SKU"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="300">
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
                            name="product_price"
                            render={({ field }) => {
                                const [displayValue, setDisplayValue] = useState(formatRupiah(field.value || "0"));
                                return (
                                    <FormItem data-aos="fade-up" data-aos-delay="400">
                                        <FormLabel>Harga</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="numeric" // Tampilkan keyboard angka di mobile
                                                placeholder="Enter price"
                                                value={displayValue} // Gunakan nilai yang sudah diformat
                                                maxLength={16}
                                                onChange={(e) => {
                                                    let rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka

                                                    // Pastikan nilai tidak bisa 0 rupiah
                                                    if (rawValue.startsWith("0") && rawValue.length > 1) {
                                                        rawValue = rawValue.replace(/^0+/, ""); // Hapus nol di awal
                                                    }

                                                    const limitedValue = rawValue.slice(0, 16); // Batasi 16 digit
                                                    setDisplayValue(formatRupiah(limitedValue)); // Tampilkan format Rp
                                                    field.onChange(limitedValue); // Simpan angka bersih ke form
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {/* Weight */}
                        <FormField
                            control={form.control}
                            name="product_weight"
                            render={({ field }) => (
                                <FormItem className="w-full" data-aos="fade-up" data-aos-delay="500">
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
                            name="product_description"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="600">
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
                            name="product_etalase"
                            render={() => (
                                <FormItem data-aos="fade-up">
                                    <FormLabel className="flex items-center gap-5">
                                        <p>Etalase</p>

                                        <button onClick={() => setShowPopUpAddEtalase(true)} className="p-2 rounded-lg bg-orange-500 text-white" type="button">+ Add Etalase</button>
                                    </FormLabel>

                                    {etalases
                                        ?.filter((etalase) => etalase?.showcase_name !== "Semua Produk")
                                        .map((etalase, index) => (
                                            <label key={etalase.showcase_id || `etalase-${index}`} className="flex items-center mt-2 gap-2">
                                                <input
                                                    type="radio"
                                                    name="etalase"
                                                    value={etalase.showcase_id}
                                                    checked={selectedEtalase === etalase.showcase_id}
                                                    onChange={() => setSelectedEtalase(etalase.showcase_id)}
                                                />
                                                {etalase?.showcase_name}
                                            </label>
                                        ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Variant */}
                        {/* <FormField
                            control={form.control}
                            name="variant"
                            render={() => (
                                <FormItem data-aos="fade-up">
                                    <FormLabel className="flex items-center gap-5">
                                        <p>Varian</p>

                                        <button onClick={() => setShowPopUpAddVariant(true)} className="p-2 rounded-lg bg-orange-500 text-white" type="button">+ Add Variant</button>
                                    </FormLabel>

                                    {variants
                                        .map((variant, index) => (
                                            <label key={variant.variant_id || `variant-${index}`} className="flex items-center mt-2 gap-2">
                                                <input
                                                    type="radio"
                                                    name="variant"
                                                    value={variant.variant_id}
                                                    checked={selectedVariant === variant.variant_id}
                                                    onChange={() => setSelectedVariant(variant.variant_id)}
                                                />
                                                {variant?.variant_name}
                                            </label>
                                        ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}

                        <Button data-aos="fade-up" type="submit" className="w-full bg-green-500 text-white">
                            Simpan
                        </Button>
                    </form>
                </Form>

                <div className={`${section.detailProduct && !showAddVariant ? 'flex' : 'hidden'} mt-5 bg-white p-5 rounded-lg w-full flex-col gap-5`}>
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Stok</p>

                            <button
                                className={`flex items-center justify-center w-14 min-w-14 h-8 p-1 rounded-full cursor-pointer 
                                ${showField.stock ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={() => setShowField({ ...showField, stock: !showField.stock })}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${showField.stock ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                />
                            </button>
                        </div>

                        <p className="mt-5 text-gray-500">Atur jumlah stok produk ini.</p>

                        <div className={`${showField.stock ? 'flex' : 'hidden'} flex-col mt-5 items-center gap-3`}>
                            <div className="flex items-center gap-5">
                                <div className="flex flex-col gap-2">
                                    <p className="font-semibold">Jumlah Stok</p>

                                    <Input placeholder="1" type="number" onChange={(e) => setStock({ stock: Number(e.target.value), minimumStock: stock.minimumStock })} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <p className="font-semibold">Stok Minimum</p>

                                    <Input placeholder="1" type="number" onChange={(e) => { setStock({ stock: stock.stock, minimumStock: Number(e.target.value) }) }} />
                                </div>
                            </div>

                            <p className="text-gray-500">Kamu akan diingatkan saat produk kurang dari stok minimum.</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Variant</p>

                            <button
                                className={`flex items-center justify-center w-14 min-w-14 h-8 p-1 rounded-full cursor-pointer 
                                ${showField.variant ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={() => setShowField({ ...showField, variant: !showField.variant })}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${showField.variant ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                />
                            </button>
                        </div>

                        <p className="mt-5 text-gray-500">Atur jumlah stok produk ini.</p>

                        <div className={`${showField.variant ? 'flex' : 'hidden'} flex-col mt-5 items-center gap-3`}>
                            <Button onClick={() => setShowAddVariant(true)} className="bg-transparent border border-orange-500 text-black w-full">
                                <p>Pilih Variant</p>
                            </Button>
                        </div>
                    </div>

                    <Button onClick={() => { setSection({ addProduct: true, detailProduct: false }) }} className="w-full bg-orange-500 text-white">Kembali</Button>

                    <Button onClick={addProductHandler}>Simpan</Button>
                </div>

                {/* Variant Control */}
                {showAddVariant && (
                    <div className="mt-5 bg-white p-5 rounded-lg w-full gap-5">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-xl">Pilih Variant</p>
                            <button onClick={() => setShowAddVariant(false)}>
                                <ChevronLeft />
                            </button>
                        </div>

                        <Button onClick={() => setShowPopUpAddVariant(true)} className="mt-5 w-full bg-orange-100 text-orange-500">+ Tambah Variant Baru</Button>

                        <div className="mt-5">
                            {variants.map((variant, index) => (
                                <label key={variant.variant_id || `variant-${index}`} className="p-3 border border-orange-500 rounded-lg flex items-center mt-5 gap-3 font-semibold">
                                    <input
                                        type="checkbox"
                                        name="variant"
                                        value={variant.variant_id}
                                        checked={selectedVariants.some((selected) => selected.variant_id === variant.variant_id)}
                                        onChange={() => handleVariantChange(variant.variant_id)}
                                    />
                                    {variant?.variant_name}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Etalase Pop Up */}
            {showPopUpAddEtalase && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div data-aos="fade-up" className="bg-white p-5 rounded-lg w-[90%]">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-xl">Add Etalase</p>
                            <button onClick={() => setShowPopUpAddEtalase(false)}>
                                <ChevronLeft />
                            </button>
                        </div>

                        <Form {...formEtalase}>
                            <form onSubmit={formEtalase.handleSubmit(onSubmitEtalase)} className="space-y-10 mt-10">
                                <FormField
                                    control={formEtalase.control}
                                    name="showcase_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Etalase</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter etalase name"
                                                    {...field}
                                                />
                                            </FormControl>
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
                </div>
            )}

            {/* Add Variant Pop Up */}
            {showPopUpAddVariant && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-start overflow-y-auto py-10 justify-center">
                    <div data-aos="fade-up" className="bg-white p-5 rounded-lg w-[90%]">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-xl">Add Variant</p>
                            <button onClick={() => setShowPopUpAddVariant(false)}>
                                <ChevronLeft />
                            </button>
                        </div>

                        <Form {...formVariant}>
                            <form onSubmit={formVariant.handleSubmit(onSubmitVariant)} className="space-y-8 mt-6 bg-white p-5 rounded-lg">
                                {/* Name */}
                                <FormField
                                    control={formVariant.control}
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
                                                    inputMode="numeric"  // Menampilkan keyboard angka di mobile
                                                    pattern="[0-9]*"     // Mencegah karakter non-angka
                                                    type="text"
                                                    placeholder="Harga"
                                                    value={formatRupiah(newChoicePrice.toString())}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^0-9]/g, ""); // Hanya ambil angka
                                                        setNewChoicePrice(rawValue ? Number(rawValue) : ""); // Simpan angka saja tanpa format
                                                    }}
                                                />
                                                {showError && <p className="text-red-500 text-sm">Harga harus positif</p>}
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

                                {/* Notification */}
                                {showError && <Notification message="Harga harus positif" onClose={() => setShowError(false)} status={"error"} />}

                                {/* Popup untuk Edit Harga dan Nama */}
                                {showEditChoisesInput.status && (
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

                                                        formVariant.setValue("choises", updatedChoises);
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

                                                        formVariant.setValue("choises", updatedChoises);
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

                                                        formVariant.setValue("choises", updatedChoises);
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
                                )}

                                {/* Must Be Selected */}
                                <FormField
                                    control={formVariant.control}
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
                                    control={formVariant.control}
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
                                    control={formVariant.control}
                                    name="products"
                                    render={({ field }) => (
                                        <FormItem data-aos="fade-up" data-aos-delay="500">
                                            <FormLabel>Produk</FormLabel>
                                            <FormControl>
                                                <div>
                                                    {products.map((product) => (
                                                        <label key={product.id} className="flex items-center mb-2">
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
                                                            <span>{product.product_name}</span>
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
                            </form>
                        </Form>
                    </div>
                </div>
            )}

            {/* Success Notification for Etalase */}
            {showNotificationEtalase && <Notification message="Etalase berhasil ditambahkan!" onClose={() => setShowNotificationEtalase(false)} status="success" />}

            {/* Success Notification for Variant */}
            {showNotificationVariant && <Notification message="Varian berhasil ditambahkan!" onClose={() => setShowNotificationVariant(false)} status="success" />}

            {/* Success Notification for Add Product */}
            {showNotificationAddProduct && <Notification message="Produk berhasil ditambahkan!" onClose={() => setShowNotificationAddProduct(false)} status="success" />}

            {/* Error Notification */}
            {showErrorForAddProduct && <Notification message="Terjadi kesalahan saat menambahkan produk" onClose={() => setShowErrorForAddProduct(false)} status="error" />}

            {/* Success Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p data-aos="fade-up" data-aos-delay="100" className="mt-10 font-semibold text-xl text-center">Product added successfully!</p>

                    <Button data-aos="fade-up" data-aos-delay="200" onClick={() => setAddProduct(false)} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddProduct;

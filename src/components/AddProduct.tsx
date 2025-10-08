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
import { ChevronLeft, CircleCheck, X } from "lucide-react";
import Notification from "./Notification";
import { useState, useEffect } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";

// interface Merchant {
//     id: string;
//     name: string;
//     phone_number: string;
//     email: string;
//     address: string;
//     post_code: string;
//     category: string;
//     city: string;
//     type: string;
//     pin: string | null;
//     created_at: string;
//     updated_at: string;
//     user_id: number;
// }

// interface ShowcaseProduct {
//     id: number,
//     showcase_product_id: string,
//     showcase_id: string,
//     product_id: string,
//     created_at: string,
//     updated_at: string
// }

// interface Variant {
//     variant_status: any;
//     product_variant: any;
//     id: number;
//     variant_id: string;
//     variant_name: string;
//     product_id: string;
//     variant_description: string;
//     is_multiple: boolean;
//     merchant_id: string;
//     products: number[];
//     mustBeSelected: boolean;
//     methods: string;
//     choises: [];
//     showVariant: boolean;
// }

interface Choice {
    name: string;
    price: number;
    show: boolean;
}

interface AddProductProps {
    koperasiId?: string; // Added to receive koperasiId
    setProducts: (products: Array<any>) => void;
    products: Array<any>;
    setAddProduct: (value: boolean) => void;
    setEtalases: (etalases: Array<any>) => void;
    etalases: Array<any>;
    variants: any[];
    setVariants: React.Dispatch<React.SetStateAction<any[]>>;
    setReset: (reset: boolean) => void;
}

const AddProduct: React.FC<AddProductProps> = ({ koperasiId, setProducts, products, setAddProduct, etalases, setEtalases, variants, setVariants, setReset }) => {
    const [quantity, setQuantity] = useState('g');
    const [showNotification, setShowNotification] = useState(false);
    const [showNotificationEtalase, setShowNotificationEtalase] = useState(false);
    const [showNotificationVariant, setShowNotificationVariant] = useState(false);
    const [showNotificationAddProduct, setShowNotificationAddProduct] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedEtalase, setSelectedEtalase] = useState<string[]>([]);
    const handleCheckboxChange = (etalaseId: string) => {
        setSelectedEtalase((prev) =>
            prev.includes(etalaseId)
                ? prev.filter((id) => id !== etalaseId)
                : [...prev, etalaseId]
        );
    };
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
    const [loading, setloading] = useState(false);
    const [message, setMessage] = useState("")
    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

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

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const formData = new FormData();
        formData.append("product_name", data.product_name);
        formData.append("product_sku", data.product_SKU);
        formData.append("product_weight", (data.product_weight + quantity).toString());
        formData.append("product_category", "Kain");
        formData.append("product_price", data.product_price.toString());
        formData.append("product_status", "true");
        formData.append("product_description", data.product_description || "");

        const merchantId = sessionStorage.getItem("user")
            ? JSON.parse(sessionStorage.getItem("user")!).merchant?.id || "Unknown"
            : "Unknown";

        formData.append("merchant_id", merchantId);

        if (data.product_image) {
            formData.append("product_image", data.product_image);
        }

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
                price: z.number().refine((val) => val >= 0, {
                    message: "Harga tidak boleh negatif",
                }),
                show: z.boolean(),
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


    const onSubmitVariant = async (data: z.infer<typeof FormSchemaVariant>) => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const payload = {
            variant_name: data.name,
            product_id: data.products.join(","),
            variant_description: "Deskripsi untuk variant",
            is_multiple: data.methods === "more",
            multiple_value: displayChoises,
            merchant_id: userData?.merchant?.id,
        };

        try {
            const response = await axiosInstance.post("/varian/create", payload);
            if (response.status === 200 || response.status === 201) {
                setVariants(prevVariants => [...prevVariants, response.data.data]);
                setShowPopUpAddVariant(false)
                setShowNotificationVariant(true);
                setReset(true)
                formVariant.reset();
                setDisplayChoises([]);
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

        const mergedData = allData.reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
        mergedData.details_products = data;

        try {
            setloading(true)

            // Step 1: Create the master product
            const response = await axiosInstance.post("/product/create", mergedData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const newProductId = response.data?.data?.product_id;

            // Step 2: Link the new product to the cooperative catalog
            if (koperasiId && newProductId) {
                const koperasiPostBody = {
                    product_id: newProductId,
                    is_active: true, // Default to active
                    visibility: "PUBLIC",
                    pinned: false,
                    notes: ""
                };
                try {
                    await axiosInstance.post(`/koperasi/${koperasiId}/catalog/items`, koperasiPostBody);
                    console.log(`Successfully linked product ${newProductId} to koperasi ${koperasiId}`);
                    // margin computation/assignment removed: per-item margin is derived in ManajemenKatalog from price fields
                } catch (koperasiError) {
                    // Log this error but don't block the main success message
                    console.error("Failed to link product to koperasi catalog:", koperasiError);
                }
            }

            setProducts([...products, response.data.data]);

            if (selectedEtalase.length > 0) {
                await axiosInstance.post("/showcase-product/create", {
                    product_id: newProductId,
                    showcase_id: selectedEtalase,
                });
            }

            setShowNotification(true);
        } catch (error: any) {
            console.error("Error while adding product to API:", error);
            setShowErrorForAddProduct(true);
            setMessage(error.response?.data?.message || "Terjadi kesalahan")
        } finally {
            setloading(false)
        }
    };
    
    const addNewChoice = () => {
        if (newChoiceName && newChoicePrice !== "") {
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

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} pt-5 w-full mb-32`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddProduct(false)} aria-label="Kembali">
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="text-xl font-semibold text-center uppercase">Tambah Produk</p>
                </div>

                <div className="w-full mt-10">
                    <p className="font-semibold"><span className="text-gray-500">{section.detailProduct ? '2' : '1'}/2:</span> {section.addProduct ? 'Informasi Product' : 'Detail Product'}</p>

                    <div className="flex items-center gap-3 mt-2">
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
                                            <p className="absolute text-sm text-gray-500 right-2 -bottom-7">
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
                                            <p className="absolute text-sm text-gray-500 right-2 -bottom-5">
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
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                            />
                                            <select
                                                className="w-full h-10 border border-gray-300 rounded-md"
                                                aria-label="Satuan berat"
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
                                                className="block w-full p-3 border rounded-lg"
                                                placeholder="Jelaskan apa yang spesial dari produkmu"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                            <p className="absolute text-sm text-gray-500 right-2 -bottom-5">
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

                                        <button onClick={() => setShowPopUpAddEtalase(true)} className="p-2 text-white bg-orange-500 rounded-lg" type="button">+ Tambah Etalase</button>
                                    </FormLabel>

                                    {etalases?.filter((etalase) => etalase?.showcase_name !== "Semua Produk")
                                        .map((etalase, index) => (
                                            <label key={etalase.showcase_id || `etalase-${index}`} className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    name="etalase"
                                                    value={etalase.showcase_id}
                                                    checked={selectedEtalase.includes(etalase.showcase_id)}
                                                    onChange={() => handleCheckboxChange(etalase.showcase_id)}
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

                                        <button onClick={() => setShowPopUpAddVariant(true)} className="p-2 text-white bg-orange-500 rounded-lg" type="button">+ Add Variant</button>
                                    </FormLabel>

                                    {variants
                                        .map((variant, index) => (
                                            <label key={variant.variant_id || `variant-${index}`} className="flex items-center gap-2 mt-2">
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

                        <Button data-aos="fade-up" type="submit" className="w-full text-white bg-green-500">
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
                                aria-label="Toggle stok"
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
                                aria-label="Toggle variant"
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${showField.variant ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                />
                            </button>
                        </div>

                        <p className="mt-5 text-gray-500">Atur variant produk ini.</p>

                        <div className={`${showField.variant ? "flex" : "hidden"} w-full flex-col mt-5 items-center gap-3`}>
                            {selectedVariants.map((variant, i) => (
                                <p key={i} className="flex items-center w-full gap-3 p-3 font-semibold border border-orange-500 rounded-lg">
                                    {variants.find((v) => v.variant_id === variant.variant_id)?.variant_name}
                                </p>
                            ))}
                        </div>

                        <div className={`${showField.variant ? 'flex' : 'hidden'} flex-col mt-5 items-center gap-3`}>
                            <Button onClick={() => setShowAddVariant(true)} className="w-full text-white bg-orange-500 border border-orange-500">
                                <p>Pilih Variant</p>
                            </Button>
                        </div>
                    </div>

                    <Button onClick={() => { setSection({ addProduct: true, detailProduct: false }) }} className="w-full text-white bg-orange-500">Kembali</Button>

                    <Button onClick={addProductHandler} disabled={loading ? true : false}>Simpan</Button>
                </div>

                {/* Variant Control */}
                {showAddVariant && (
                    <div className="w-full gap-5 p-5 mt-5 bg-white rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold">Pilih Variant</p>
                            <button onClick={() => setShowAddVariant(false)} aria-label="Tutup pilih variant">
                                <X />
                            </button>
                        </div>

                        <Button onClick={() => setShowPopUpAddVariant(true)} className="w-full mt-5 text-orange-500 bg-orange-100">+ Tambah Variant Baru</Button>

                        <div className="mt-5">
                            {variants.map((variant, index) => (
                                <label key={variant.variant_id || `variant-${index}`} className="flex items-center gap-3 p-3 mt-5 font-semibold border border-orange-500 rounded-lg">
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
                        <Button onClick={() => setShowAddVariant(false)} className="w-full mt-5 bg-green-400">Submit</Button>
                    </div>
                )}
            </div>

            {/* Add Etalase Pop Up */}
            {showPopUpAddEtalase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div data-aos="fade-up" className="bg-white p-5 rounded-lg w-[90%]">
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold">Tambah Etalase
                            </p>
                            <button onClick={() => setShowPopUpAddEtalase(false)} aria-label="Tutup tambah etalase">
                                <X />
                            </button>
                        </div>

                        <Form {...formEtalase}>
                            <form onSubmit={formEtalase.handleSubmit(onSubmitEtalase)} className="mt-10 space-y-10">
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

                                <Button type="submit" className="w-full text-white bg-green-500">
                                    Submit
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            )}

            {/* Add Variant Pop Up */}
            {showPopUpAddVariant && (
                <div className="fixed inset-0 z-50 flex items-start justify-center py-10 overflow-y-auto bg-black bg-opacity-50">
                    <div data-aos="fade-up" className="bg-white p-5 rounded-lg w-[90%]">
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold">Tambah Varian</p>
                            <button onClick={() => setShowPopUpAddVariant(false)} aria-label="Tutup tambah varian">
                                <X />
                            </button>
                        </div>

                        <Form {...formVariant}>
                            <form onSubmit={formVariant.handleSubmit(onSubmitVariant)} className="p-5 mt-6 space-y-8 bg-white rounded-lg">
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

                                <Button data-aos="fade-up" data-aos-delay="200" type="button" onClick={() => setShowChoisesInput(true)} className="w-full text-orange-400 bg-transparent border-2 border-orange-400 hover:bg-transparent">Tambah Pilihan</Button>

                                {/* Choises */}
                                <div className="mt-5">
                                    {displayChoises.map((choise, index) => (
                                        <div data-aos="fade-up" data-aos-delay={index * 100} key={index} className="mt-5">
                                            <p>Pilihan {index + 1}</p>

                                            <div className="p-5 mt-3 border border-gray-500 rounded-lg">
                                                <div className="flex items-center justify-between gap-5">
                                                    <p>{choise.name}</p>

                                                    <button type="button" onClick={() => setShowEditChoisesInput({ status: true, index: index })} className="text-orange-400">Ubah</button>
                                                </div>

                                                <div className="flex items-center justify-between gap-5 mt-3">
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
                                    <div className="fixed inset-0 z-20 h-screen -translate-y-8 bg-black bg-opacity-50">
                                        <div data-aos="fade-up" className="absolute bottom-0 w-full p-4 mt-10 bg-white rounded-t-lg">
                                            <p className="mb-10 text-lg font-semibold text-center">Tambah Pilihan</p>

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
                                                {showError && <p className="text-sm text-red-500">Harga harus positif</p>}
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
                                                    className="w-full bg-green-500"
                                                >
                                                    Simpan
                                                </Button>

                                                <Button
                                                    type="button"
                                                    onClick={() => setShowChoisesInput(false)}
                                                    className="w-full bg-gray-300"
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
                                    <div className="fixed inset-0 z-20 h-screen -translate-y-8 bg-black bg-opacity-50">
                                        <div data-aos="fade-up" className="absolute bottom-0 w-full p-4 mt-10 translate-y-10 bg-white rounded-t-lg">
                                            <p className="mb-10 text-lg font-semibold text-center">Ubah Pilihan</p>

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
                                                    className="w-full bg-green-500"
                                                >
                                                    Simpan
                                                </Button>

                                                <Button
                                                    type="button"
                                                    onClick={() => setShowEditChoisesInput({ status: false, index: -1 })}
                                                    className="w-full bg-gray-300"
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
                                            <div className="flex items-center justify-between gap-5">
                                                <FormLabel>Apakah varian wajib dipilih ?</FormLabel>
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

                                <Button type="submit" className="w-full text-white bg-green-500">
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
            {showErrorForAddProduct && <Notification message={message} onClose={() => setShowErrorForAddProduct(false)} status="error" />}

            {/* Success Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p data-aos="fade-up" data-aos-delay="100" className="mt-10 text-xl font-semibold text-center">Berhasil menambahkan produk</p>

                    <Button data-aos="fade-up" data-aos-delay="200" onClick={() => setAddProduct(false)} className="w-full mt-10 text-white bg-green-500">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddProduct;
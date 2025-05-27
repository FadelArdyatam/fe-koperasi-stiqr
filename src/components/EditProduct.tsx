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
import { ChevronLeft, CircleAlert, CircleCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/hooks/axiosInstance";
import Notification from "./Notification";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";

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

interface EditProductProps {
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    products: Array<{
        id: number,
        detail_product: any,
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
    variants: Variant[];
    setVariants: React.Dispatch<React.SetStateAction<Variant[]>>
    setReset: (reset: boolean) => void;
}

const EditProduct: React.FC<EditProductProps> = ({
    // products,
    setOpen,
    editIndex,
    setVariants,
    variants,
    setReset
}) => {
    const [productToEdit, setProductToEdit] = useState<EditProductProps['products'][0] | undefined>(undefined);
    const [quantity, setQuantity] = useState(productToEdit?.product_weight?.endsWith("g") ? "g" : "kg");
    const [loading, setLoading] = useState(true); // State untuk mengelola status loading
    const [error, setError] = useState<string | null>(); // State untuk mengelola
    const [showNotificationVariant, setShowNotificationVariant] = useState(false);
    // const [selectedEtalase, setSelectedEtalase] = useState<string | undefined>(undefined);
    const [showNotification, setShowNotification] = useState(false);
    const [showPopUpAddVariant, setShowPopUpAddVariant] = useState(false);
    const [showChoisesInput, setShowChoisesInput] = useState(false);
    const [showEditChoisesInput, setShowEditChoisesInput] = useState({ status: false, index: -1 });
    const [newChoiceName, setNewChoiceName] = useState("");
    const [newChoicePrice, setNewChoicePrice] = useState<number | "">("");
    const [showChoice, setShowChoice] = useState(false);
    const [displayChoises, setDisplayChoises] = useState<Choice[]>([]);
    const [selectedVariants, setSelectedVariants] = useState<{ variant_id: string }[]>([]);
    const [section, setSection] = useState({ addProduct: true, detailProduct: false });
    const [showField, setShowField] = useState({ stock: false, variant: false });
    const [showAddVariant, setShowAddVariant] = useState(false);
    const [showError, setShowError] = useState(false);
    const [allData, setAllData] = useState<any>([]);
    const [stock, setStock] = useState({ stock: "", minimumStock: "" });
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    useEffect(() => {
        if (productToEdit?.product_variant) {
            const initialVariants = productToEdit.product_variant.map((item) => ({ variant_id: item.variant.variant_id }));
            setSelectedVariants(initialVariants);
        }

        setShowField({ stock: productToEdit?.detail_product?.is_stok, variant: productToEdit?.detail_product?.is_variant });
        setStock({ stock: productToEdit?.detail_product?.stok, minimumStock: productToEdit?.detail_product?.stok_minimum });
    }, [productToEdit]);

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
                    // etalase: [], // Sesuaikan jika ada data etalase
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
            message: "Foto harus berupa file yang valid.",
        }).optional(),
        name: z.string()
            .min(1, { message: "Nama wajib diisi." })
            .max(50, { message: "Nama tidak boleh lebih dari 50 karakter." }),
        SKU: z.string()
            .min(1, { message: "SKU wajib diisi." })
            .max(20, { message: "SKU tidak boleh lebih dari 20 karakter." }),
        price: z.number()
            .min(1, { message: "Harga harus lebih dari 0." }),
        weight: z.string()
            .min(1, { message: "Berat wajib diisi." }),
        description: z.string()
            .max(100, { message: "Deskripsi tidak boleh lebih dari 100 karakter." })
            .optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            photo: undefined,
            name: productToEdit?.product_name,
            SKU: productToEdit?.product_sku,
            price: productToEdit?.product_price,
            weight: productToEdit?.product_weight?.replace(/g|kg/, ""),
            // etalase: ['semua produk'],
            description: productToEdit?.product_description,
        },
    });

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            console.log("Form data:", data);
            const formData = new FormData();
            formData.append("product_name", data.name);
            formData.append("product_weight", (data.weight + quantity).toString());
            formData.append("product_category", "ExampleCategory"); // Replace with actual value
            formData.append("product_price", data.price.toString());
            formData.append("product_description", data.description || productToEdit?.product_description || "");
            formData.append("merchant_id", userData.merchant.id)
            if (data.photo) {
                formData.append("product_image", data.photo);
            }

            // const response = await axiosInstance.patch(
            //     `/product/${editIndex}/allProduct`,
            //     formData,
            // );

            // Update allData dengan FormData (hanya untuk debugging, tidak bisa langsung digunakan di state)
            setAllData([...allData, Object.fromEntries(formData.entries())]);

            // console.log(response.data)

            // console.log("selected etalase: ", selectedEtalase);
            // console.log("product id: ", response?.data?.data?.product_id);

            // const response2 = await axiosInstance.post(
            //     "/showcase-product/create",
            //     {
            //         product_id: response?.data?.data?.product_id,
            //         showcase_id: selectedEtalase
            //     },
            // )

            // console.log("Updated product:", response.data);

            // console.log(response2.data);

            setSection({ addProduct: true, detailProduct: true })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error updating product:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error updating product:", error);
            }
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

    const onSubmitVariant = async (data: z.infer<typeof FormSchemaVariant>) => {
        console.log("SUBMIT VARIANTTTTTTTTTTTTTTTTT")
        console.log(data)
        setLoadingSubmit(true);


        const payload = {
            variant_name: data.name,
            product_id: data.products.join(","),
            variant_description: "Deskripsi untuk variant",
            is_multiple: data.methods === "more",
            multiple_value: displayChoises.map((choice) => choice.name).join(", "),
            merchant_id: userData?.merchant?.id,
            is_required: data.mustBeSelected
        };


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
                setReset(true)
                formVariant.reset({
                    name: "",
                    choises: [],
                    mustBeSelected: false,
                    methods: "",
                    products: [],
                    showVariant: false,
                });

                // Optional: Clear displayChoises jika perlu
                setDisplayChoises([]);
            } else {
                console.error("Gagal menambahkan varian:", response.data);
            }
        } catch (error: any) {
            console.error("Terjadi kesalahan saat mengirim data:", error.response?.data || error.message);
        }

        setLoadingSubmit(false);
    };

    const deleteHandler = async () => {

        try {
            setLoadingSubmit(true);

            const response = await axiosInstance.delete(
                `/product/${editIndex}/delete`,
            );

            console.log(response.data);

            // Close the form modal
            setLoadingSubmit(false);
            setOpen({ id: "", status: false });
            setReset(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error deleting product:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error deleting product:", error);
            }
        }
    }

    const addProductHandler = async () => {
        setLoadingSubmit(true);

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

        const update = await axiosInstance.patch(`/product/${editIndex}/allProduct`, mergedData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        console.log(update)

        setShowNotification(true);
        setReset(true)

        setLoadingSubmit(false);
    }

    const addNewChoice = () => {
        if (newChoiceName && newChoicePrice !== "") {
            if (Number(newChoicePrice) < 0) {
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

    console.log("selectedVariants", selectedVariants)

    const handleStockChange = (e: any) => {
        let value = e.target.value;

        if (value === "") {
            setStock((prev) => ({ ...prev, stock: "0" }));
            return;
        }

        if (value.length > 1 && value.startsWith("0")) {
            value = value.replace(/^0+/, "");
        }

        if (/^\d*$/.test(value)) {
            setStock((prev) => ({ ...prev, stock: value }));
        }
    };

    const handleMinimumStockChange = (e: any) => {
        let value = e.target.value;

        if (value === "") {
            setStock((prev) => ({ ...prev, minimumStock: "0" }));
            return;
        }

        if (value.length > 1 && value.startsWith("0")) {
            value = value.replace(/^0+/, "");
        }

        if (/^\d*$/.test(value)) {
            setStock((prev) => ({ ...prev, minimumStock: value }));
        }
    };

    console.log("variants", variants)

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} pt-5 w-full mb-32`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setOpen({ id: "", status: false })}>
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Edit Produk</p>
                </div>

                <div className="w-full mt-10">
                    <p className="font-semibold"><span className="text-gray-500">{section.detailProduct ? '2' : '1'}/2:</span> {section.addProduct ? 'Informasi Product' : 'Detail Product'}</p>

                    <div className="mt-2 flex items-center gap-3">
                        <div className={`${section.addProduct ? 'bg-orange-500' : 'bg-gray-300'} w-full h-1.5 transition-all rounded-full`}></div>

                        <div className={`${section.detailProduct ? 'bg-orange-500' : 'bg-gray-300'} w-full h-1.5 transition-all rounded-full`}></div>
                    </div>
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

                {/* Loading */}
                {loadingSubmit && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 z-20 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )}

                {!loading && !error && (
                        <div className=" bg-white rounded-lg p-5 mt-5">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className={`${section.detailProduct ? 'hidden' : 'block'} space-y-10`}>
                                    {/* Form fields tetap sama */}
                                    {/* Photo */}
                                    <FormField
                                        control={form.control}
                                        name="photo"
                                        render={({ field }) => (
                                            <FormItem data-aos="fade-up" data-aos-delay="100">
                                                <FormLabel>Foto Produk (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*" // Hanya menerima file gambar
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file && file.type.startsWith("image/")) {
                                                                field.onChange(file);
                                                            } else {
                                                                e.target.value = ""; // Reset input jika bukan gambar
                                                            }
                                                        }}
                                                    />
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
                                            <FormItem data-aos="fade-up" data-aos-delay="400">
                                                <FormLabel>Harga</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text" // Ubah ke "text" agar bisa menampilkan format Rupiah
                                                        placeholder="Enter price"
                                                        value={formatRupiah(field.value)} // Tampilkan format Rupiah
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, ""); // Hanya ambil angka
                                                            value = value.slice(0, 10); // Batasi 10 digit
                                                            field.onChange(Number(value)); // Simpan sebagai angka
                                                        }}
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
                                            <FormItem className="w-full" data-aos="fade-up" data-aos-delay="500">
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
                                                            {/* {(field.value?.length ?? 0)}/100 */}
                                                        </p>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Etalase */}
                                    {/* <FormField
                                        control={form.control}
                                        name="etalase"
                                        render={({ field }) => (
                                            <FormItem data-aos="fade-up">
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
                                    /> */}

                                    {/* Variant */}
                                    {/* <FormField
                                    control={form.control}
                                    name="variant"
                                    render={({ field }) => (
                                        <FormItem data-aos="fade-up">
                                            <FormLabel>Pilih Variant</FormLabel>
                                            <div className="space-y-2 mt-2">
                                                {variants.map((variant) => (
                                                    <div key={variant.variant_id} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            id={`variant-${variant.variant_id}`}
                                                            name="variant"
                                                            value={variant.variant_id}
                                                            // checked={field.value.includes(variant.variant_id)}
                                                            onChange={(e) => {
                                                                field.onChange([e.target.value]); // Perbarui nilai dalam form
                                                                setSelectedVariant(e.target.value); // Perbarui state variant yang dipilih
                                                            }}
                                                            className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <label
                                                            htmlFor={`variant-${variant.variant_id}`}
                                                            className="text-sm font-medium text-gray-700"
                                                        >
                                                            {variant.variant_name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

                                    {/* ... */}
                                    <Button data-aos="fade-up" type="submit" className="w-full bg-blue-500 text-white">
                                        Lanjutkan
                                    </Button>
                                </form>
                            </Form>

                            <div className={`${section.detailProduct && !showAddVariant ? 'flex' : 'hidden'} bg-white rounded-lg w-full flex-col gap-5`}>
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

                                    <div className={`${showField.stock ? "flex" : "hidden"} flex-col mt-5 items-center gap-3`}>
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col gap-2">
                                                <p className="font-semibold">Jumlah Stok</p>
                                                <Input
                                                    onChange={handleStockChange}
                                                    placeholder="1"
                                                    value={stock.stock}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <p className="font-semibold">Stok Minimum</p>
                                                <Input
                                                    onChange={handleMinimumStockChange}
                                                    placeholder="1"
                                                    value={stock.minimumStock}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                />
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

                                    <p className="mt-5 text-gray-500">Atur variant produk ini.</p>

                                    <div className={`${showField.variant ? "flex" : "hidden"} w-full flex-col mt-5 items-center gap-3`}>
                                        {selectedVariants.map((variant) => (
                                            <p key={variant.variant_id} className="p-3 border w-full border-orange-500 rounded-lg flex items-center mt-5 gap-3 font-semibold">
                                                {variants.find((v) => v.variant_id === variant.variant_id)?.variant_name}
                                            </p>
                                        ))}
                                    </div>

                                    <div className={`${showField.variant ? 'flex' : 'hidden'} flex-col mt-5 items-center gap-3`}>
                                        <Button onClick={() => setShowAddVariant(true)} className="bg-orange-500 border border-orange-500 text-white w-full">
                                            <p>Pilih Variant</p>
                                        </Button>
                                    </div>
                                </div>

                                <Button disabled={loadingSubmit ? true : false} className="bg-orange-500 text-white" onClick={addProductHandler}>Simpan</Button>
                            </div>

                            {/* Variant Control */}
                            {showAddVariant && (
                                <div className="bg-white rounded-lg w-full gap-5">
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

                                    <Button onClick={() => setShowAddVariant(false)} className="w-full mt-5 bg-green-400">Submit</Button>
                                </div>
                            )}

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button data-aos="fade-up" data-aos-delay="400" className={`${showAddVariant ? 'hidden' : 'block'} w-full !mt-5 m-auto bg-red-400`}>Hapus</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                    className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-black bg-opacity-50 backdrop-blur-sm"
                                >
                                    <div data-aos="zoom-in" className="bg-white text-center p-5 rounded-lg shadow-lg w-[90%]">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-semibold text-lg">
                                                <CircleAlert className="m-auto" />

                                                <p className="text-center">Apakah Anda benar-benar yakin?</p>
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-center">
                                                Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus produk Anda secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-5 flex flex-col gap-3">
                                            <AlertDialogAction
                                                className="w-full p-2 rounded-lg bg-green-500 text-white"
                                                onClick={deleteHandler}
                                            >
                                                Lanjutkan
                                            </AlertDialogAction>
                                            <AlertDialogCancel className="w-full p-2 rounded-lg bg-red-500 text-white">
                                                Batalkan
                                            </AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </div>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                )}
            </div>

            {/* Add Variant Pop Up */}
            {showPopUpAddVariant && (
                <div className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-start overflow-y-auto py-10 justify-center">
                    <div data-aos="fade-up" className="bg-white p-5 rounded-lg w-[90%]">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-xl">Tambah Varian</p>
                            <button onClick={() => setShowPopUpAddVariant(false)}>
                                <X />
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
                                    <div className="fixed bg-black bg-opacity-50 inset-0 z-20 -translate-y-8 ">
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
                                                    inputMode="numeric"
                                                    type="text"
                                                    placeholder="Harga"
                                                    value={formatRupiah(newChoicePrice.toString() ?? 0)}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                                        setNewChoicePrice(rawValue ? Number(rawValue) : 0);
                                                    }}
                                                />


                                                {/* <Input
                                                    className="mt-3"
                                                    type="number"
                                                    placeholder="Harga"
                                                    value={newChoicePrice}
                                                    onChange={(e) => setNewChoicePrice(Number(e.target.value))}
                                                /> */}

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
                                                    type="button"
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
                                    <div className="fixed bg-black bg-opacity-50 inset-0 z-20 -translate-y-8">
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
                                                    type="text"
                                                    placeholder="Harga"
                                                    value={formatRupiah(displayChoises[showEditChoisesInput.index].price.toString())}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/[^0-9]/g, ''); // hanya angka
                                                        const newPrice = Number(rawValue);

                                                        const updatedChoises = displayChoises.map((choise, index) =>
                                                            index === showEditChoisesInput.index
                                                                ? { ...choise, price: newPrice }
                                                                : choise
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

                                <Button disabled={loadingSubmit ? true : false} type="submit" className="w-full bg-green-500 text-white">
                                    Simpan Varian
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Loading */}
                    {loadingSubmit && (
                        <div className="fixed top-0 bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Success Notification for Variant */}
            {showNotificationVariant && <Notification message="Varian berhasil ditambahkan!" onClose={() => setShowNotificationVariant(false)} status="success" />}

            {/* Success Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p data-aos="fade-up" data-aos-delay="100" className="mt-10 font-semibold text-xl text-center">Berhasil mengubah produk</p>

                    <Button data-aos="fade-up" data-aos-delay="200" onClick={() => setOpen({ id: "", status: false })} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default EditProduct;
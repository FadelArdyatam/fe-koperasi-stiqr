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
import { ChevronLeft, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import { formatRupiah } from "@/hooks/convertRupiah";
import axios from "axios";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";

interface Choice {
    detail_variant_id?: string | null;
    name: string;
    price: number;
    show: boolean;
}

interface EditVariantProps {
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    editIndex: string;
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
        detail_product: {
            is_stok: boolean;
            stok: number;
        }
        product_variant: Array<{
            variant: any;
            variant_id: string;
        }> & { product_variant: Array<{ variant_id: string }> };
    }>;
    setReset: (reset: boolean) => void;
}

const EditVariant: React.FC<EditVariantProps> = ({ setOpen, editIndex, setReset }) => {
    const [variantToEdit, setVariantToEdit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayChoises, setDisplayChoises] = useState<Choice[]>([]);
    const [showChoisesInput, setShowChoisesInput] = useState(false);
    // const [showEditChoisesInput, setShowEditChoisesInput] = useState({ status: false, index: -1 });
    const [newChoiceName, setNewChoiceName] = useState("");
    const [newChoicePrice, setNewChoicePrice] = useState<number | "">("");
    const [showChoice, setShowChoice] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const choises = variantToEdit?.detail_variant.map((item: any) => ({
            detail_variant_id: item.detail_variant_id,
            name: item.name,
            price: item.price,
            show: item.status,
        }));
        console.log(choises)

        setDisplayChoises(choises);
        form.setValue("choises", choises); // Pastikan set ke form

    }, [variantToEdit]);

    console.log("displayChoises", displayChoises);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        const fetchVariantDetails = async () => {
            try {
                const response = await axiosInstance.get(`/varian/${editIndex}/detail`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setVariantToEdit(response.data);

                form.reset({
                    name: response.data.variant_name,
                    choises: displayChoises,
                    mustBeSelected: response.data.mustBeSelected || false,
                    methods: response.data.is_multiple || false ? "more" : "single",
                });
            } catch (err: any) {
                console.error("Error fetching variant details:", err);
                setError("Failed to fetch variant details.");
            } finally {
                setLoading(false);
            }
        };

        fetchVariantDetails();
    }, [editIndex]);

    const FormSchema = z.object({
        name: z.string().min(1, { message: "Nama varian wajib diisi." }),
        choises: z.array(
            z.object({
                detail_variant_id: z.string().optional().nullable(),
                name: z.string().nonempty("Nama pilihan wajib diisi"),
                price: z.number().positive("Harga harus positif"),
                show: z.boolean(),  // Tambahkan atribut show
            })
        ),
        mustBeSelected: z.boolean(),
        methods: z.string().nonempty("Metode wajib dipilih"),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            choises: [],
            mustBeSelected: false,
            methods: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        console.log("Form data:", data);

        try {
            const payload = {
                variant_name: data.name,
                detail_variants: data.choises,
                mustBeSelected: data.mustBeSelected,
                is_multiple: data.methods === "single" ? false : true,
            };

            const response = await axiosInstance.patch(
                `/varian/${editIndex}/update`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("Variant updated successfully:", response.data);

            setOpen({ id: "", status: false });

            setReset(true);
        } catch (err: any) {
            console.error("Error updating variant:", err.response?.data || err.message);
        }
    };

    const deleteHandler = async () => {
        try {
            console.log("Deleting variant with ID:", editIndex);

            const response = await axiosInstance.delete(
                `/varian/${editIndex}/delete`,
            );

            console.log(response.data);

            // Close the form modal
            setOpen({ id: "", status: false });
            setReset(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error deleting variant:", error.response?.data || error.message);
            } else {
                console.error("Unexpected error deleting variant:", error);
            }
        }
    }

    const addNewChoice = () => {
        if (newChoiceName && newChoicePrice) {
            if (newChoicePrice < 0) {
                setShowError(true);
                return;
            }


            const newChoice = {
                detail_variant_id: null, // Tambahkan detail_variant_id
                name: newChoiceName,
                price: Number(newChoicePrice),
                show: showChoice,
            };

            const updatedChoices = [...displayChoises, newChoice];
            console.log('updatechoises')
            console.log(updatedChoices)
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
        <div className="pt-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: "", status: false })}>
                    <ChevronLeft />
                </button>

                <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Edit Varian</p>
            </div>

            {loading && <p className="text-center text-gray-500 mt-5">Loading variant details...</p>}

            {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded-lg mt-5 text-center">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((data) => {
                            console.log("Form submitted with data:", data);
                            onSubmit(data);
                        },
                            (errors) => {
                                console.error("Form validation errors:", errors);
                            })}
                        className="space-y-8 mt-6 bg-white p-5 rounded-lg"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay={100}>
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
                            {displayChoises?.map((choise, index) => (
                                <div data-aos="fade-up" data-aos-delay={index * 100} key={index} className="mt-5">
                                    <p>Pilihan {index + 1}</p>

                                    <div className="border border-gray-500 p-5 rounded-lg mt-3">
                                        <div className="flex items-center gap-5 justify-between">
                                            <p>{choise.name}</p>

                                            {/* <button type="button" onClick={() => setShowEditChoisesInput({ status: true, index: index })} className="text-orange-400">Ubah</button> */}
                                        </div>

                                        <div className="mt-3 flex items-center gap-5 justify-between">
                                            <p className="text-gray-500">{formatRupiah(choise.price)}</p>

                                            <button
                                                onClick={() => updateShowChoises(index)}
                                                type="button"
                                                className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${choise.show ? "bg-orange-400" : "bg-gray-300"}`}
                                            >
                                                <div
                                                    className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${choise.show ? "translate-x-6" : "translate-x-0"}`}
                                                ></div>
                                            </button>
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

                        <FormField
                            control={form.control}
                            name="mustBeSelected"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay={400}>
                                    <div className="flex items-center gap-5 justify-between">
                                        <FormLabel>Harus Dipilih?</FormLabel>
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
                                                    defaultChecked={variantToEdit?.is_multiple === false ? true : false}
                                                    onChange={() => field.onChange("single")}
                                                    className="mr-2"
                                                />
                                                <span>Maks. Pilih 1</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="more"
                                                    defaultChecked={variantToEdit?.is_multiple === true ? true : false}
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

                        <Button data-aos="fade-up" data-aos-delay={500} type="submit" className="w-full bg-green-500 text-white">
                            Simpan Perubahan
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button data-aos="fade-up" data-aos-delay="400" className={`w-full !mt-5 m-auto bg-red-400`}>
                                    Hapus Varian
                                </Button>
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
                                            Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus pembayaran Anda secara permanen.
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
                    </form>
                </Form>
            )}
        </div>
    );
};

export default EditVariant;

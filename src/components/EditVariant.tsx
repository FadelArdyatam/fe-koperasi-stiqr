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
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";

interface EditVariantProps {
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    editIndex: string;
}

const EditVariant: React.FC<EditVariantProps> = ({ setOpen, editIndex }) => {
    const [variantToEdit, setVariantToEdit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    description: response.data.variant_description,
                    is_multiple: response.data.is_multiple,
                    multiple_value: response.data.multiple_value,
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
        description: z.string().optional(),
        is_multiple: z.boolean(),
        multiple_value: z.string().optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            description: "",
            is_multiple: false,
            multiple_value: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            const payload = {
                variant_name: data.name,
                variant_description: data.description || variantToEdit?.variant_description,
                is_multiple: data.is_multiple,
                multiple_value: data.multiple_value,
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
        } catch (err: any) {
            console.error("Error updating variant:", err.response?.data || err.message);
        }
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
                        onSubmit={form.handleSubmit(onSubmit)}
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

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay={200}>
                                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Tambahkan deskripsi"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_multiple"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay={300}>
                                    <div className="flex items-center gap-5 justify-between">
                                        <FormLabel>Bisa Memilih Lebih dari Satu?</FormLabel>
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
                            name="multiple_value"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay={400}>
                                    <FormLabel>Nilai Pilihan (Pisahkan dengan koma)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="10,20,30"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button data-aos="fade-up" data-aos-delay={500} type="submit" className="w-full bg-green-500 text-white">
                            Simpan Perubahan
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default EditVariant;

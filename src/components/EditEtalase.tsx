import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Package } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";

interface EditEtalaseProps {
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
        product_variant: Array<{
            variant: any;
            variant_id: string;
        }> & { product_variant: Array<{ variant_id: string }> };
    }>;
    setReset: (reset: boolean) => void;
}

const EditEtalase: React.FC<EditEtalaseProps> = ({ setOpen, editIndex, products, setReset }) => {
    interface Showcase {
        showcase_id: any;
        showcase_name: string;
        showcase_product: {
            product: {
                id: any;
                product_name: string;
                product_price: string;
            };
        }[];
    }

    const [etalaseToEdit, setEtalaseToEdit] = useState<Showcase | null>(null);
    const [showSetProductInput, setShowSetProductInput] = useState(false);
    // const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const FormSchema = z.object({
        name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name must be less than 50 characters." }),
        products: z.array(z.number()),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            products: [],
        },
    });

    const watchedProducts = useWatch({
        control: form.control,
        name: "products",
    });

    useEffect(() => {
        const fetchDetailShowcase = async () => {
            try {
                const response = await axiosInstance.get(`/showcase/detail/${editIndex}`);
                const data = response.data.data;
                setEtalaseToEdit(data);

                form.reset({
                    name: data.showcase_name,
                    products: data.showcase_product.map((p: any) => p.product.id),
                });
            } catch (error: any) {
                console.error("Failed to fetch showcase details:", error.message);
            }
        };

        fetchDetailShowcase();
    }, [editIndex, form]);

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        console.log("Form submitted:", data);
        const token = localStorage.getItem("token");

        try {
            if (etalaseToEdit) {
                const response = await axiosInstance.patch(
                    `/showcase/${etalaseToEdit.showcase_id}/update`,
                    { showcase_name: data.name },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log("API Response:", response.data);
            }

            setOpen({ id: "", status: false });

            setReset(true);
        } catch (error) {
            console.error("Error updating showcase:", error);
            alert("Failed to update showcase. Please try again.");
        }
    };

    const deleteHandler = async () => {
        try {
            const response = await axiosInstance.delete(`/showcase/${editIndex}/delete`);
            console.log(response.data.message);
            setOpen({ id: "", status: false });
            setReset(true);
        } catch (error: any) {
            console.error("Error deleting showcase:", error.message);
        }
    };

    const toggleProductSelection = (productId: number) => {
        const currentProducts = form.getValues("products");
        if (currentProducts.includes(productId)) {
            form.setValue(
                "products",
                currentProducts.filter((id) => id !== productId)
            );
        } else {
            form.setValue("products", [...currentProducts, productId]);
        }
    };

    return (
        <>
            <div className={`${showSetProductInput ? "hidden" : "block"} pt-5`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setOpen({ id: "", status: false })}>
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Edit Etalase</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10 p-5 bg-white rounded-lg">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="100">
                                    <FormLabel>Nama Produk</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Showcase Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <div data-aos="fade-up" data-aos-delay="200" className="flex items-start gap-5 justify-between">
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

                            <div className="mt-5 space-y-5">
                                {etalaseToEdit?.showcase_product?.map((item, index) => (
                                    <div data-aos="fade-up" data-aos-delay={index * 100} key={index} className="flex items-center gap-4 p-2 border rounded-md">
                                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                                            <Package className="text-gray-500" />
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-lg font-medium">{item.product.product_name}</p>
                                            <p className="text-sm text-gray-500">
                                                Rp {new Intl.NumberFormat("id-ID").format(Number(item.product.product_price))}
                                            </p>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={watchedProducts.includes(item.product.id)}
                                            onChange={() => toggleProductSelection(item.product.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button data-aos="fade-up" data-aos-delay="300" type="submit" className="w-full bg-blue-500 text-white">
                            Update
                        </Button>

                        <Button data-aos="fade-up" data-aos-delay="400" type="button" onClick={deleteHandler} className="w-full m-auto block bg-red-500 text-white">
                            Delete
                        </Button>
                    </form>
                </Form>
            </div>

            {showSetProductInput && (
                <div className="pt-5">
                    <div className="flex items-center gap-5 text-black">
                        <button onClick={() => setShowSetProductInput(false)}>
                            <ChevronLeft />
                        </button>

                        <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Atur Produk</p>
                    </div>

                    <div className="mt-5 space-y-5">
                        {products.map((product, index) => (
                            <label data-aos="fade-up" data-aos-delay={index * 100} key={product.id} className="flex items-center gap-4 p-2 border rounded-md">
                                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                                    <Package className="text-gray-500" />
                                </div>

                                <div className="flex-1">
                                    <p className="text-lg font-medium">{product.product_name}</p>
                                    <p className="text-sm text-gray-500">
                                        Rp {new Intl.NumberFormat("id-ID").format(Number(product.product_price))}
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={watchedProducts.includes(product.id)}
                                    onChange={() => toggleProductSelection(product.id)}
                                />
                            </label>
                        ))}
                    </div>

                    <Button
                        data-aos="fade-up"
                        data-aos-delay="300"
                        className="mt-5 w-full bg-blue-500 text-white"
                        onClick={() => setShowSetProductInput(false)}
                    >
                        Simpan
                    </Button>
                </div>
            )}
        </>
    );
};

export default EditEtalase;

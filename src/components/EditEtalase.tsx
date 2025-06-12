import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleAlert, CircleCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";
import noProduct from "@/images/no-product.png";
import Loading from "./Loading";

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
                product_id: string;
                product_name: string;
                product_price: string;
                product_image: string;
            };
        }[];
    }

    const [etalaseToEdit, setEtalaseToEdit] = useState<Showcase | null>(null);
    const [showSetProductInput, setShowSetProductInput] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<{ product_id: string }[]>([]);
    // HAPUS: State ini adalah penyebab masalah.
    // const [showProductAfterSelected, setShowProductAfterSelected] = useState<{ product_id: string; product_name: string; product_price: number, product_image: string }[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const FormSchema = z.object({
        name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name must be less than 50 characters." }),
        products: z.array(z.object({ product_id: z.string() })),
    });

    const form = useForm<z.infer<typeof FormSchema>>({ // UBAH: Tidak perlu tipe gabungan lagi
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            products: [],
        },
    });

    useEffect(() => {
        const fetchDetailShowcase = async () => {
            try {
                const response = await axiosInstance.get(`/showcase/detail/${editIndex}`);
                const data = response.data.data;
                setEtalaseToEdit(data);

                const initialProducts = data.showcase_product.map((p: any) => ({ product_id: p.product.product_id }));

                form.reset({
                    name: data.showcase_name,
                    products: initialProducts,
                });

                setSelectedProducts(initialProducts);
            } catch (error: any) {
                console.error("Failed to fetch showcase details:", error.message);
            }
        };

        if (editIndex) { // TAMBAH: Pastikan editIndex ada sebelum fetch
            fetchDetailShowcase();
        }
    }, [editIndex, form]);

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoadingSubmit(true);

        const payload = {
            showcase_id: etalaseToEdit?.showcase_id,
            products: data.products,
            showcase_name: data.name,
        }
        try {
            if (etalaseToEdit) {
                const response = await axiosInstance.patch(
                    `/showcase/${etalaseToEdit.showcase_id}/update`, payload
                );
                console.log("API Response:", response.data);
            }
            setShowNotification(true);
        } catch (error) {
            console.error("Error updating showcase:", error);
            alert("Failed to update showcase. Please try again.");
        }

        setLoadingSubmit(false);
    };

    const deleteHandler = async () => {
        try {
            setLoadingSubmit(true);
            await axiosInstance.delete(`/showcase/${editIndex}/delete`);
            setOpen({ id: "", status: false });
            setReset(true);
        } catch (error: any) {
            console.error("Error deleting showcase:", error.message);
        } finally {
            setLoadingSubmit(false);
        }
    };

    // UBAH: Sederhanakan fungsi toggle
    const toggleProductSelection = (productId: string) => {
        const currentSelected = [...selectedProducts];
        const productIndex = currentSelected.findIndex(p => p.product_id === productId);

        let updatedSelected;

        if (productIndex > -1) {
            // Jika sudah ada (uncheck), hapus dari array
            updatedSelected = currentSelected.filter(p => p.product_id !== productId);
        } else {
            // Jika belum ada (check), tambahkan ke array
            updatedSelected = [...currentSelected, { product_id: productId }];
        }

        // Update state dan form value
        setSelectedProducts(updatedSelected);
        form.setValue("products", updatedSelected, { shouldValidate: true });
    };

    return (
        <>
            <div className={`${showSetProductInput || showNotification ? "hidden" : "block"} pt-5`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setOpen({ id: "", status: false })}>
                        <ChevronLeft />
                    </button>
                    <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Edit Etalase</p>
                </div>

                {loadingSubmit && (
                    <div className="fixed top-0 bottom-0 left-0 right-0 z-20 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-10 p-5 bg-white rounded-lg">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="100">
                                    <FormLabel>Nama Etalase</FormLabel> {/* Ubah dari Nama Produk */}
                                    <FormControl>
                                        <Input placeholder="Masukkan Nama Etalase" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <div data-aos="fade-up" data-aos-delay="200" className="flex items-start gap-5 justify-between">
                                <div>
                                    <p>Daftar Produk</p>
                                    {/* UBAH: Gunakan selectedProducts.length untuk jumlah yang akurat */}
                                    <p className="text-sm text-gray-400">{selectedProducts.length} Produk terpilih</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSetProductInput(true)}
                                    className="text-orange-400"
                                >
                                    Atur Produk
                                </button>
                            </div>

                            {/* UBAH: Sederhanakan logika rendering */}
                            <div className="mt-5 space-y-5">
                                {/* Selalu render dari etalaseToEdit.showcase_product */}
                                {(etalaseToEdit?.showcase_product?.length ?? 0) > 0 ? (
                                    etalaseToEdit?.showcase_product.map((item, index) => (
                                        <div data-aos="fade-up" data-aos-delay={index * 100} key={item.product.product_id} className="flex items-center gap-4 p-2 border rounded-md">
                                            <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md ml-4">
                                                <img
                                                    src={`${item.product.product_image ?? noProduct}`}
                                                    alt={item.product.product_name}
                                                    className="h-12 w-12 object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg font-medium">{item.product.product_name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Rp {new Intl.NumberFormat("id-ID").format(Number(item.product.product_price))}
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                // Status checked ditentukan oleh state `selectedProducts`
                                                checked={selectedProducts.some(p => p.product_id === item.product.product_id)}
                                                onChange={() => toggleProductSelection(item.product.product_id)}
                                                className="h-4 w-4" // TAMBAH: Ukuran checkbox agar mudah diklik
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">Belum ada produk di etalase ini.</p>
                                )}
                            </div>
                        </div>

                        <Button data-aos="fade-up" data-aos-delay="300" disabled={loadingSubmit} type="submit" className="w-full bg-blue-500 text-white">
                            Update
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button data-aos="fade-up" data-aos-delay="400" className={`w-full !mt-5 m-auto bg-red-400`}>
                                    Hapus
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                                className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-black bg-opacity-50 backdrop-blur-sm"
                            >
                                <div data-aos="zoom-in" className="bg-white text-center p-5 rounded-lg shadow-lg w-[90%]">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-semibold text-lg">
                                            <CircleAlert className="m-auto mb-2" /> {/* TAMBAH: Margin bottom */}
                                            <p className="text-center">Apakah Anda benar-benar yakin?</p>
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-center">
                                            Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus etalase Anda secara permanen.
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
            </div>

            {loadingSubmit && <Loading />}

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
                            <label data-aos="fade-up" data-aos-delay={index * 100} key={product.id} className="flex items-center gap-4 p-2 border rounded-md cursor-pointer">
                                <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md ml-4">
                                    <img
                                        src={`${product.product_image ?? noProduct}`}
                                        alt={product.product_name}
                                        className="h-12 w-12 object-cover rounded-md"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-medium">{product.product_name}</p>
                                    <p className="text-sm text-gray-500">
                                        Rp {new Intl.NumberFormat("id-ID").format(Number(product.product_price))}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.some(p => p.product_id === product.product_id)}
                                    onChange={() => toggleProductSelection(product.product_id)}
                                    className="h-4 w-4" // TAMBAH: Ukuran checkbox
                                />
                            </label>
                        ))}
                    </div>

                    <Button
                        data-aos="fade-up"
                        data-aos-delay="300"
                        className="mt-5 w-full bg-blue-500 text-white"
                        onClick={() => {
                            // TAMBAH: Ambil produk yang dipilih dan update tampilan utama
                            const updatedProductsInEtalase = products
                                .filter(p => selectedProducts.some(sp => sp.product_id === p.product_id))
                                .map(p => ({
                                    product: {
                                        id: p.id,
                                        product_id: p.product_id,
                                        product_name: p.product_name,
                                        product_price: String(p.product_price),
                                        product_image: p.product_image,
                                    }
                                }));

                            setEtalaseToEdit(prev => prev ? { ...prev, showcase_product: updatedProductsInEtalase } : null);
                            setShowSetProductInput(false);
                        }}
                    >
                        Simpan
                    </Button>
                </div>
            )}

            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />
                    <p data-aos="fade-up" data-aos-delay="100" className="mt-10 font-semibold text-xl text-center">Etalase berhasil diperbarui</p>
                    <Button data-aos="fade-up" data-aos-delay="200" onClick={() => { setOpen({ id: "", status: false }); setReset(true); }} className="w-full bg-green-500 text-white mt-10">
                        Selesai
                    </Button>
                </div>
            )}
        </>
    );
};

export default EditEtalase;
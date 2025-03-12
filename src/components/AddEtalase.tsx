import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axiosInstance from "@/hooks/axiosInstance";
import Notification from "./Notification";
import AOS from "aos";
import "aos/dist/aos.css";

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

interface AddEtalaseProps {
    setAddEtalase: (value: boolean) => void;
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
}

const AddEtalase: React.FC<AddEtalaseProps> = ({ setAddEtalase, etalases, setEtalases }) => {
    const [showNotification, setShowNotification] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const FormSchema = z.object({
        showcase_name: z.string().nonempty("Nama etalase wajib diisi").max(30, "Maksimal 30 karakter"),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            showcase_name: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        try {
            const requestBody = {
                showcase_name: data.showcase_name,
                merchant_id: userData?.merchant?.id,
            };
            const response = await axiosInstance.post(`showcase/create`, requestBody);

            // Agar etalase yang baru ditambahkan langsung muncul di halaman etalase
            setEtalases([...etalases, response.data.data]);

            console.log(response)
            setShowNotification(true);
        } catch (error: any) {
            setShowError(true);
            setErrorMessage("Showcase dengan nama yang sama sudah ada.");
        }
    };

    return (
        <>
            {/* Form Tambah Etalase */}
            <div className={`${showNotification ? "hidden" : "block"} pt-5`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddEtalase(false)}>
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="font-semibold text-xl uppercase">Tambah Etalase</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10 p-5 bg-white rounded-lg">
                        <FormField
                            control={form.control}
                            name="showcase_name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay={100}>
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

                        <Button data-aos="fade-up" data-aos-delay={200} type="submit" className="w-full bg-green-500 text-white">
                            Submit
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Error */}
            {showError && <Notification message={errorMessage} onClose={() => setShowError(false)} status={"error"} />}

            {/* Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p data-aos="fade-up" data-aos-delay="100" className="mt-10 font-semibold text-xl text-center">Etalase berhasil ditambahkan!</p>

                    <Button data-aos="fade-up" data-aos-delay="200" onClick={() => setAddEtalase(false)} className="w-full bg-green-500 text-white mt-10">
                        Selesai
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddEtalase;

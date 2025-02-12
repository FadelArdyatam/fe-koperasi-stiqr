import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import Notification from "@/components/Notification"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const AddCustomer = () => {
    // Sementara ini, karena feature ini belum diimplementasikan
    const [showNotification, setShowNotification] = useState(true);

    const navigate = useNavigate();

    const FormSchema = z.object({
        customerName: z.string().min(3,
            { message: "Nama Pelanggan Tidak Boleh Kosong" }
        ),
        phoneNumber: z.string().min(10,
            { message: "Nomor Telephon harus lebih dari 10 karakter" }
        ),
        email: z.string().email(
            { message: "Email tidak valid" }
        ),
        otherNumber: z.string().min(3,
            { message: "Nomor Lain harus diisi" }
        ),
        address: z.string().min(10,
            { message: "Alamat harus diisi" }
        ),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            customerName: '',
            phoneNumber: '',
            email: '',
            otherNumber: '',
            address: '',
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const formData = new FormData();

        formData.append("customer_name", data.customerName);
        formData.append("phone_number", data.phoneNumber);
        formData.append("email", data.email);
        formData.append("other_number", data.otherNumber);
        formData.append("address", data.address);

        console.log("data", data)
    }

    return (
        <>
            <div className="w-[90%] m-auto p-5 bg-white rounded-lg shadow-lg -translate-y-20">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className={`flex flex-col items-end w-full space-y-7`}>
                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="100">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="200">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="300">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="otherNumber"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="400">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="500">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button data-aos="fade-up" data-aos-delay="600" type="submit" className={`w-full bg-green-400 mt-7`}>Simpan Data</Button>
                    </form>
                </Form>
            </div>

            {showNotification && <Notification message={"Sementara Fitur ini belum tersedia"} onClose={() => { setShowNotification(false); navigate("/dashboard") }} status={"error"} />}
        </>
    )
}

export default AddCustomer
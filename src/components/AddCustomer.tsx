import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import axiosInstance from "@/hooks/axiosInstance"
import { useState } from "react"
import Notification from "./Notification"

interface AddCustomerProps {
    setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ setIsAdding, setReset }) => {
    const [showNotification, setShowNotification] = useState(false)

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
        // address: z.string().min(10,
        //     { message: "Alamat harus diisi" }
        // ),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            customerName: '',
            phoneNumber: '',
            email: '',
            otherNumber: '',
            // address: '',
        },
    })

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const payload = {
            name: data.customerName,
            phone: data.phoneNumber,
            email: data.email,
            other_number: data.otherNumber,
            merchant_id: userData.merchant?.id
        }

        try {
            const response = await axiosInstance.post('/customers/create', payload)
            setShowNotification(true)
            console.log(response)
        } catch (error) {
            console.log(error)
        }
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
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nama</FormLabel>

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
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">No Hp</FormLabel>

                                        <FormControl>
                                            <Input
                                                type="text" // Menghindari spinner di input number
                                                inputMode="numeric" // Menampilkan keyboard angka di mobile
                                                pattern="[0-9]*" // Memastikan hanya angka yang bisa diketik
                                                maxLength={15} // Batasi maksimal 15 digit
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                {...field}
                                                onInput={(e) => {
                                                    (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, ""); // Hanya angka yang bisa diketik
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Email</FormLabel>

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
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nomor Lainnya</FormLabel>

                                        <FormControl>
                                            <Input
                                                type="text" // Menghindari spinner di input number
                                                inputMode="numeric" // Menampilkan keyboard angka di mobile
                                                pattern="[0-9]*" // Memastikan hanya angka yang bisa diketik
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                {...field}
                                                onInput={(e) => {
                                                    (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, ""); // Hanya angka
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Alamat</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                        </div>

                        <Button type="submit" className={`w-full bg-green-400 mt-7`}>Simpan Data</Button>
                    </form>
                </Form>
            </div>

            {showNotification && <Notification message={"Tambah Customer Berhasil!"} onClose={() => { setShowNotification(false); setIsAdding(false); setReset(true) }} status="success" />}
        </>
    )
}

export default AddCustomer

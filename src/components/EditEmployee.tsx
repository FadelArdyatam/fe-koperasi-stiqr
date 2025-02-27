import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key, useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axiosInstance from "@/hooks/axiosInstance";

interface EditEmployeeProps {
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    employees: Array<{
        employee_id: string;
        role_id: string;
        id: number;
        name: string;
        phone_number: string;
        email: string;
        password: string;
        role_description: string;
        role: any;
    }>;
    setEmployees: (employee: Array<{
        employee_id: string;
        role: any;
        role_id: string;
        id: number;
        name: string;
        phone_number: string;
        email: string;
        password: string;
        role_description: string;
    }>) => void;
    editIndex: string;
    setIsSuccess: (value: boolean) => void;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({ setOpen, editIndex, setIsSuccess }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<{
        employee_id: string;
        role_id: string;
        id: number;
        name: string;
        phone_number: string;
        email: string;
        password: string;
        role_description: string;
    } | null>(null);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    console.log("editIndex", editIndex);

    useEffect(() => {
        const fetchDetailEmployee = async () => {
            try {
                const response = await axiosInstance.get(`/employee/${editIndex}`);
                const data = response.data;

                setEmployeeToEdit(data);

                form.reset({
                    name: data.name,
                    phone_number: data.phone_number,
                    email: data.email,
                    role_name: data.role_id,
                    password: data.password
                });
            } catch (error: any) {
                console.error("Failed to fetch Employee details:", error.message);
            }
        };

        fetchDetailEmployee();
    }, [])

    console.log("employeeToEdit", employeeToEdit);

    // Validasi schema untuk form
    const FormSchema = z.object({
        name: z.string().min(3,
            { message: "Nama pegawai Tidak Boleh Kosong" }
        ).max(50),
        phone_number: z.string().min(10,
            { message: "Nomor telepon tidak boleh kurang dari 10 karakter" }
        ).max(13),
        email: z.string().email(),
        role_name: z.string().min(3).max(50),
        password: z.string().min(6,
            { message: "Password minimal 6 karakter" }
        ).max(50,
            { message: "Password maksimal 50 karakter" }
        ),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: employeeToEdit?.name,
            phone_number: employeeToEdit?.phone_number,
            email: employeeToEdit?.email,
            role_name: employeeToEdit?.role_id,
            password: employeeToEdit?.password,
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const updatedEmployee = {
            ...employeeToEdit,
            name: data.name,
            phone_number: data.phone_number,
            email: data.email,
            role_name: data.role_name,
            password: data.password,
            role_description: data.role_name === "Manager" ? "Manager dengan akses penuh" : "Kasir dengan akses terbatas",
        };

        console.log("updatedEmployee", updatedEmployee);

        setOpen({ id: "", status: false });
    }

    const deleteEmployeeHandler = async () => {
        try {
            const response = await axiosInstance.delete(`/employee/deleted/${editIndex}`);

            console.log("Delete Employee Response:", response.data);

            setOpen({ id: "", status: false });

            setIsSuccess(true);
        } catch (error: any) {
            console.error("Failed to delete Employee details:", error.message);
        }
    }

    const accordionData = [
        {
            title: "Manager",
            spoiler: "Manager dengan akses penuh",
            content: ["Mengelola pegawai", "Mengelola keuangan", "Mengelola inventaris"]
        },
        {
            title: "Kasir",
            spoiler: "Kasir dengan akses terbatas",
            content: ["Melakukan transaksi penjualan", "Mencetak struk"]
        }
    ];

    return (
        <div className="p-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: "", status: false })}>
                    <ChevronLeft />
                </button>

                <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Ubah Data Pegawai</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10">
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem data-aos="fade-up" data-aos-delay={100}>
                                <FormLabel>Nama Pegawai</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter product name"
                                            {...field}
                                        />
                                        <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                            {field.value?.length}/50
                                        </p>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem data-aos="fade-up" data-aos-delay={200}>
                                <FormLabel>Nomor Telepon</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter phone number" {...field} disabled={true} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem data-aos="fade-up" data-aos-delay={300}>
                                <FormLabel>Alamat Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter email" {...field} disabled={true} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem data-aos="fade-up" data-aos-delay={400}>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter password"
                                            {...field}
                                        />

                                        <button className="absolute right-5 top-2" type="button" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff /> : <Eye />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Position */}
                    <FormField
                        control={form.control}
                        name="role_name"
                        render={({ field }) => (
                            <FormItem data-aos="fade-up" data-aos-delay={500}>
                                <FormLabel>Peran Pegawai</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        {["Manager", "Kasir"].map((option) => {
                                            const accordionDataItem = accordionData.find((data) => data.title === option);

                                            return (
                                                <div key={option} className="p-5 bg-orange-50 rounded-lg">
                                                    <label className="flex items-center w-full justify-between gap-2">
                                                        <p className="font-semibold">{option}</p>
                                                        <input
                                                            type="radio"
                                                            value={option}
                                                            checked={field.value === option}
                                                            onChange={() => field.onChange(option)}
                                                            className="form-radio scale-125 md:scale-[1.5]"
                                                        />
                                                    </label>

                                                    {/* Spoiler */}
                                                    {accordionDataItem && (
                                                        <p className="mt-5 text-gray-500 text-sm">
                                                            {accordionDataItem.spoiler}
                                                        </p>
                                                    )}

                                                    {/* Accordion */}
                                                    {accordionDataItem && (
                                                        <Accordion type="single" collapsible className="w-full mt-4">
                                                            <AccordionItem value={`item-${option}`}>
                                                                <AccordionTrigger className="text-blue-500">Selengkapnya</AccordionTrigger>
                                                                <AccordionContent>
                                                                    <ul className="list-disc list-inside space-y-2">
                                                                        {accordionDataItem.content.map((task: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, index: Key | null | undefined) => (
                                                                            <li key={index}>{task}</li>
                                                                        ))}
                                                                    </ul>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button data-aos="fade-up" data-aos-delay={600} type="submit" className="w-full bg-blue-500 text-white">
                        Update
                    </Button>

                    <Button data-aos="fade-up" data-aos-delay={600} onClick={deleteEmployeeHandler} type="button" className="w-full bg-red-500 text-white">
                        Delete
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default EditEmployee;

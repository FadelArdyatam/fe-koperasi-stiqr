import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleCheck, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import Notification from "./Notification";

interface AddEmployeeProps {
    setAddEmployee: (value: boolean) => void;
    setIsSuccess: (value: boolean) => void;
}

interface Role {
    role_id: string;
    role_name: string;
    role_description?: string;
}
const AddEmployee: React.FC<AddEmployeeProps> = ({ setAddEmployee, setIsSuccess }) => {
    const [showNotification, setShowNotification] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

    const FormSchema = z.object({
        name: z.string().min(3, {
            message: "Nama Tidak boleh Kosong",
        }),
        phone_number: z.string().min(9, {
            message: "Nomor HP minimal 9 digit",
        }).max(13, {
            message: "Nomor telepon maksimal 13 digit",
        }),
        email: z.string().email({
            message: "Email tidak valid",
        }),
        role_name: z.string().min(2, {
            message: "Role tidak boleh kosong",
        }),
        password: z.string().min(6, {
            message: "Password tidak boleh kurang dari 6 karakter",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            phone_number: "",
            email: "",
            role_name: undefined,
            password: ""
        },
    });

    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axiosInstance.get("/employee/roles/all");
                setRoles(response.data.data);
                console.log(response.data);
            } catch (error: any) {
                console.error(error);
            }
        };

        fetchRoles();
    }, []);

    const handleDone = () => {
        setIsSuccess(true),
            setShowNotification(false),
            setAddEmployee(false)
    }
    const handleAddEmployee = () => {
        setIsSuccess(false),
            setAddEmployee(false)
    }

    const [errorNotification, setErrorNotification] = useState(false);
    const [message, setMessage] = useState("");

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const newEmployeeToAPI = {
            name: data.name,
            email: data.email,
            phone_number: data.phone_number,
            password: data.password,
            role_id: data.role_name,
            merchant_id: userData?.merchant?.id,
            role_description: data.role_name === "Admin" ? "Administrator dengan akses penuh" : "Kasir dengan akses terbatas",
        }

        try {
            const response = await axiosInstance.post("/employee/create", newEmployeeToAPI);
            console.log("Employee added successfully:", response.data);
            setShowNotification(true);
            setIsSuccess(true);
            setMessage(response.data.message)
        } catch (error: any) {
            console.log(error)
            setErrorNotification(true),
                setMessage(error.response.data.message);
        }
    }

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} p-5 w-full mb-32 bg-orange-50`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={handleAddEmployee}>
                        <ChevronLeft />
                    </button>

                    <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Tambah Pegawai</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-10 bg-white p-5 rounded-lg">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="100">
                                    <FormLabel>Nama Pegawai</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Masukkan nama pegawai"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                            {/* Counter */}
                                            <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                                {field.value.length}/50
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
                                <FormItem data-aos="fade-up" data-aos-delay="200">
                                    <FormLabel>Nomor HP</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Masukkan Nomor HP"
                                            type="text" // Gunakan text agar tidak ada spinner di input number
                                            inputMode="numeric" // Menampilkan keyboard angka di mobile
                                            pattern="[0-9]*" // Memastikan hanya angka yang bisa diketik
                                            maxLength={13} // Batasi maksimal 15 digit
                                            {...field}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, ""); // Hanya izinkan angka
                                                if (rawValue.length <= 13) {
                                                    field.onChange(rawValue);
                                                }
                                            }}
                                        />
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
                                <FormItem data-aos="fade-up" data-aos-delay="300">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Masukkan Email"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <span className="text-xs text-gray-500 italic">*Email tidak boleh sama dengan email pemilik</span>

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem data-aos="fade-up" data-aos-delay="400">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Masukkan Password"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                                type={showPassword ? "text" : "password"}
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
                                <FormItem data-aos="fade-up" data-aos-delay="500">
                                    <FormLabel>Peran Pegawai</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {roles.map((role, i) => {
                                                return (
                                                    <div key={i} className="p-5 bg-orange-50 rounded-lg">
                                                        <label className="flex items-center w-full justify-between gap-2">
                                                            <p className="font-semibold">{role.role_name}</p>
                                                            <input
                                                                type="radio"
                                                                value={role.role_id}
                                                                checked={field.value === role.role_id}
                                                                onChange={() => field.onChange(role.role_id)}
                                                                className="form-radio scale-125 md:scale-[1.5]"
                                                            />
                                                        </label>

                                                        {/* Spoiler */}
                                                        {role.role_description && (
                                                            <p className="mt-5 text-gray-500 text-sm">
                                                                {role.role_description}
                                                            </p>
                                                        )}

                                                        {/* Accordion */}
                                                        {/* {role && (
                                                            <Accordion type="single" collapsible className="w-full mt-4">
                                                                <AccordionItem value={`item-${role.role_id}`}>
                                                                    <AccordionTrigger className="text-blue-500">Selengkapnya</AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <ul className="list-disc list-inside space-y-2">
                                                                            {accordionData.content.map((task, index) => (
                                                                                <li key={index}>{task}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </Accordion>
                                                        )} */}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button data-aos="fade-up" data-aos-delay="600" type="submit" className="w-full bg-green-500 text-white">
                            Simpan
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p className="mt-10 font-semibold text-xl text-center">{message}</p>

                    <Button onClick={handleDone} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}

            {
                errorNotification && (
                    <Notification status="error" message={message} onClose={() => setErrorNotification(false)} />
                )
            }
        </>
    );
};

export default AddEmployee;

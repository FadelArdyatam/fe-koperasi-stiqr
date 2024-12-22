import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";

interface AddEmployeeProps {
    setAddEmployee: (value: boolean) => void;
    employees: Array<{
        id: number;
        name: string;
        phone_number: string;
        email: string;
        role_name: string;
        password: string;
        role_description: string;
    }>;
    setEmployees: (employees: Array<{
        id: number;
        name: string;
        phone_number: string;
        email: string;
        role_name: string;
        password: string;
        role_description: string;
    }>) => void;
    accordionDatas: Array<{
        title: string;
        spoiler: string;
        content: string[];
    }>;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ setAddEmployee, employees, setEmployees, accordionDatas }) => {
    const [showNotification, setShowNotification] = useState(false);

    // Validasi schema untuk form
    const FormSchema = z.object({
        name: z.string().min(3).max(50),
        phone_number: z.string().min(10).max(13),
        email: z.string().email(),
        role_name: z.enum(["Admin", "Kasir"], { required_error: "Please select a position." }),
        password: z.string().min(6).max(50),
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

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        // Generate a random 10-digit number
        // const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
        // const roleId = `RLE-${randomDigits}`;

        // Ambil informasi user dari sessionStorage
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const newEmployee = {
            name: data.name,
            email: data.email,
            phone_number: data.phone_number,
            password: data.password,
            role_name: data.role_name,
            role_description: data.role_name === "Admin" ? "Administrator dengan akses penuh" : "Kasir dengan akses terbatas",
        };

        // Prepare FormData to handle file upload
        const newEmployeeToAPI = {
            name: data.name,
            email: data.email,
            phone_number: data.phone_number,
            password: data.password,
            role_id: "RLE-2024120001",
            merchant_id: userData.merchant_id,
        }

        const token = localStorage.getItem("token");

        try {
            // Kirim data ke endpoint API
            const response = await axios.post("https://be-stiqr.dnstech.co.id/api/employee/create", newEmployeeToAPI, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            console.log("Response from API:", response.data);

            // Perbarui state jika berhasil
            setEmployees([...employees, { id: employees.length + 1, ...newEmployee }]);
            setShowNotification(true);
        } catch (error) {
            console.error("Error while adding employee:", error);
            alert("Failed to add employee. Please try again.");
        }
    }

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} p-5 w-full mb-32`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={() => setAddEmployee(false)}>
                        <ChevronLeft />
                    </button>
                    <p className="font-semibold text-xl text-center uppercase">Add Employee</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Pegawai</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter employee name"
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
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter phone number"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            type="number"
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
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter email"
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

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter password"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            type="password"
                                        />
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
                                <FormItem>
                                    <FormLabel>Peran Pegawai</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {["Admin", "Kasir"].map((option) => {
                                                const accordionData = accordionDatas.find((data) => data.title === option);

                                                return (
                                                    <div key={option} className="p-5 bg-orange-50 rounded-lg">
                                                        <label className="flex items-center w-full justify-between gap-2">
                                                            <p className="font-semibold">{option}</p>
                                                            <input
                                                                type="radio"
                                                                value={option}
                                                                checked={field.value === option}
                                                                onChange={() => field.onChange(option)}
                                                                className="form-radio"
                                                            />
                                                        </label>

                                                        {/* Spoiler */}
                                                        {accordionData && (
                                                            <p className="mt-5 text-gray-500 text-sm">
                                                                {accordionData.spoiler}
                                                            </p>
                                                        )}

                                                        {/* Accordion */}
                                                        {accordionData && (
                                                            <Accordion type="single" collapsible className="w-full mt-4">
                                                                <AccordionItem value={`item-${option}`}>
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

                        <Button type="submit" className="w-full bg-green-500 text-white">
                            Submit
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Notification */}
            {showNotification && (
                <div className="p-10">
                    <CircleCheck className="text-green-500 scale-[3] mt-10 m-auto" />

                    <p className="mt-10 font-semibold text-xl text-center">Employee added successfully!</p>

                    <Button onClick={() => setAddEmployee(false)} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddEmployee;

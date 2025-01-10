import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
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


interface EditEmployeeProps {
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    employees: Array<{
        role_id: string;
        id: number;
        name: string;
        phone_number: string;
        email: string;
        password: string;
        role_description: string;
        // role: any;
    }>;
    setEmployees: (employee: Array<{
        role_id: string;
        id: number;
        name: string;
        phone_number: string;
        email: string;
        password: string;
        role_description: string;
    }>) => void;
    editIndex: number;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({ setOpen, employees, setEmployees, editIndex }) => {
    const employeeToEdit = employees[editIndex];

    // Validasi schema untuk form
    const FormSchema = z.object({
        name: z.string().min(3).max(50),
        phone_number: z.string().min(10).max(13),
        email: z.string().email(),
        role_name: z.enum(["Manager", "Kasir"], { required_error: "Please select a position." }),
        password: z.string().min(6).max(50),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: employeeToEdit.name,
            phone_number: employeeToEdit.phone_number,
            email: employeeToEdit.email,
            role_name: employeeToEdit.role_description.includes("Manager") ? "Manager" : "Kasir",
            password: employeeToEdit.password,
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

        const updatedEmployees = [...employees];
        updatedEmployees[editIndex] = updatedEmployee;

        setEmployees(updatedEmployees);

        setOpen({ id: -1, status: false });
    }

    return (
        <div className="p-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: -1, status: false })}>
                    <ChevronLeft />
                </button>
                <p className="font-semibold text-xl text-center uppercase">Ubah Data Pegawai</p>
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
                                            placeholder="Enter product name"
                                            {...field}
                                        />
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
                            <FormItem>
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
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        {...field}
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
                                        {["Manager", "Kasir"].map((option) => {
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

                    <Button type="submit" className="w-full bg-blue-500 text-white">
                        Update
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default EditEmployee;

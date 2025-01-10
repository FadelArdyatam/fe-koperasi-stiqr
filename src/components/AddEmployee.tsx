import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import axiosInstance from "@/hooks/axiosInstance";

interface AddEmployeeProps {
    setAddEmployee: (value: boolean) => void;
    setIsSuccess: (value: boolean) => void;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({ setAddEmployee, setIsSuccess }) => {
    const [showNotification, setShowNotification] = useState(false);

    const FormSchema = z.object({
        name: z.string().min(3).max(50),
        phone_number: z.string().min(10).max(13),
        email: z.string().email(),
        role_name: z.string().min(2).max(50),
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

    interface Role {
        role_id: string;
        role_name: string;
        role_description?: string;
    }

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
            setAddEmployee(true)
    }
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
            if (response.data.status) {
                setShowNotification(true);
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Error while adding employee:", error);
            alert("Failed to add employee. Please try again.");
        }
    }

    return (
        <>
            <div className={`${showNotification ? 'hidden' : 'block'} p-5 w-full mb-32 bg-orange-50`}>
                <div className="flex items-center gap-5 text-black">
                    <button onClick={handleAddEmployee}>
                        <ChevronLeft />
                    </button>
                    <p className="font-semibold text-xl text-center uppercase">Add Employee</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10 bg-white p-5 rounded-lg">
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
                                                                className="form-radio"
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

                    <Button onClick={handleDone} className="w-full bg-green-500 text-white mt-10">
                        Done
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddEmployee;

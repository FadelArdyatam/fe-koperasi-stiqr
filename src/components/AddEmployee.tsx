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
        phone: string;
        email: string;
        position: string;
        outlet: string;
    }>;
    setEmployees: (employees: Array<{
        id: number;
        name: string;
        phone: string;
        email: string;
        position: string;
        outlet: string;
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
        phone: z.string().min(10).max(13),
        email: z.string().email(),
        position: z.enum(["Manager", "Kasir"], { required_error: "Please select a position." }),
        outlet: z.string().min(3).max(255),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            position: undefined,
            outlet: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const newEmployee = {
            id: employees.length + 1,
            name: data.name,
            phone: data.phone,
            email: data.email,
            position: data.position,
            outlet: data.outlet,
        };

        setEmployees([...employees, newEmployee]);

        console.log("New product:", newEmployee);

        setShowNotification(true);
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
                                    <FormLabel>Nama Produk</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter product name"
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
                            name="phone"
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

                        {/* Outlet */}
                        <FormField
                            control={form.control}
                            name="outlet"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Outlet</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter outlet"
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

                        {/* Position */}
                        <FormField
                            control={form.control}
                            name="position"
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
    )
}

export default AddEmployee
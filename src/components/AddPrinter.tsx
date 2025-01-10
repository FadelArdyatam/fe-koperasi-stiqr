import React, { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import axiosInstance from "@/hooks/axiosInstance";
import axios from "axios";

interface AddPrinterProps {
    setShowManualInputPrinter: (showManualInputPrinter: boolean) => void;
    setPrinters: (printers: any[]) => void;
    printers: any[];
}

const AddPrinter: React.FC<AddPrinterProps> = ({ setShowManualInputPrinter, setPrinters, printers }) => {
    // Validasi schema untuk form
    const FormSchema = z.object({
        type: z.literal("bluetooth"),
        macAddress: z.string()
            .regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, "Alamat MAC tidak valid"),
        name: z.string().min(3, "Nama perangkat harus minimal 3 karakter").max(25, "Nama perangkat tidak boleh lebih dari 25 karakter"),
        paperSize: z.enum(["A4", "A5", "Letter", "Legal", "Custom"]).optional(),
        receiptType: z.array(z.enum(["Pembayaran", "Checker", "Tagihan", "Dapur"])).optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            type: "bluetooth",
            macAddress: "",
            name: "",
            paperSize: undefined,
            receiptType: [],
        },
    });

    const inputRefs = useRef<HTMLInputElement[]>([]); // Ref untuk semua slot input

    function handleInputChange(
        index: number,
        value: string,
        field: { value: string; onChange: (value: string) => void }
    ) {
        const sanitizedValue = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase(); // Hanya izinkan hex
        const segments = field.value.split(":");
        segments[index] = sanitizedValue;

        // Update nilai
        field.onChange(segments.join(":"));

        // Auto-focus ke input berikutnya jika sudah 2 karakter
        if (sanitizedValue.length === 2 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (event.key === "Backspace" && event.currentTarget.value === "" && index > 0) {
            inputRefs.current[index - 1]?.focus(); // Pindah ke input sebelumnya jika Backspace ditekan
        }
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
     
        // User information from sessionStorage
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const printerPayload = {
            printer_name: data.name,
            mac_address: data.macAddress,
            is_active: true,
            merchant_id: userData?.merchant?.id || "", 
        };

        try {
            const response = await axiosInstance.post("/printer/create", printerPayload,);

            console.log("Printer successfully added:", response.data);

            setPrinters([
                ...printers,
                {
                    id: printers.length + 1,
                    type: data.type,
                    macAddress: data.macAddress,
                    name: data.name,
                    paperSize: data.paperSize,
                    receiptType: data.receiptType,
                },
            ]);

            // Hide the manual input modal
            setShowManualInputPrinter(false);
        } catch (error:any) {
            console.error("Error while adding printer:", error);

            if (axios.isAxiosError(error) && error.response) {
                alert(`Failed to add printer: ${error.response.data.message || "Unknown error"}`);
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        }
    }

    return (
        <div className="p-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setShowManualInputPrinter(false)}>
                    <ChevronLeft />
                </button>
                <p className="font-semibold text-xl text-center uppercase">
                    Tambah Perangkat Manual
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10">
                    {/* Type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipe Koneksi</FormLabel>
                                <FormControl>
                                    <Input disabled {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Mac Address */}
                    <FormField
                        control={form.control}
                        name="macAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mac Address</FormLabel>
                                <FormControl>
                                    <div className="flex items-center w-full justify-center">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <div key={index} className="flex items-center">
                                                <Input
                                                    type="text"
                                                    maxLength={2}
                                                    className="w-full min-w-12 text-center"
                                                    ref={(el) => (inputRefs.current[index] = el!)} // Simpan ref
                                                    value={field.value.split(":")[index] || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(index, e.target.value, field)
                                                    }
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                />
                                                {index < 5 && (
                                                    <span className="mx-1">:</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Printer</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter Printer Name"
                                            {...field}
                                        />
                                        {/* Counter */}
                                        <p className="absolute right-2 -bottom-7 text-sm text-gray-500">
                                            {field.value.length}/25
                                        </p>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Paper Size */}
                    <FormField
                        control={form.control}
                        name="paperSize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ukuran Kertas</FormLabel>
                                <FormControl>
                                    <select
                                        className="w-full border rounded-md h-10"
                                        {...field}
                                    >
                                        <option value="">Pilih Ukuran Kertas</option>
                                        <option value="A4">58mm</option>
                                        <option value="A5">80mm</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Receipt Type */}
                    <FormField
                        control={form.control}
                        name="receiptType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipe Receipt</FormLabel>
                                <div className="space-y-2">
                                    {["Pembayaran", "Checker", "Tagihan", "Dapur"].map((type) => (
                                        <FormField
                                            key={type}
                                            control={form.control}
                                            name="receiptType"
                                            render={() => (
                                                <FormItem key={type} className="flex items-center space-x-3">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(type as "Pembayaran" | "Checker" | "Tagihan" | "Dapur")}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    field.onChange([...(field.value || []), type]);
                                                                } else {
                                                                    field.onChange(
                                                                        (field.value || []).filter((item) => item !== type)
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>{type}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
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
    );
};

export default AddPrinter;

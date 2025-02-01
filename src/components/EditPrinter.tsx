import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface EditPrinterProps {
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    setPrinters: (printers: any[]) => void;
    printers: any[];
    editIndex: number; // Tambahkan properti ini untuk mengetahui indeks produk yang diedit
}

const EditPrinter: React.FC<EditPrinterProps> = ({ printers, setPrinters, setOpen, editIndex }) => {
    const printerToEdit = printers[editIndex]; // Produk yang sedang diedit
    console.log("Printer to edit:", printerToEdit);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, []);

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
            macAddress: printerToEdit.macAddress,
            name: printerToEdit.name,
            paperSize: printerToEdit.paperSize,
            receiptType: printerToEdit.receiptType,
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const updatedPrinter = {
            ...printerToEdit,
            macAddress: data.macAddress,
            name: data.name,
            paperSize: data.paperSize,
            receiptType: data.receiptType,
        };

        const updatedPrinters = [...printers];
        updatedPrinters[editIndex] = updatedPrinter;

        setPrinters(updatedPrinters);

        console.log("Updated printer:", updatedPrinter);

        // Tutup form
        setOpen({ id: -1, status: false });
    }

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

    return (
        <div className="p-5 w-full mb-32">
            <div className="flex items-center gap-5 text-black">
                <button onClick={() => setOpen({ id: -1, status: false })}>
                    <ChevronLeft />
                </button>

                <p data-aos="zoom-in" className="font-semibold text-xl text-center uppercase">Ubah Data Printer</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-10">
                    {/* Type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem data-aos="fade-up" data-aos-delay="100">
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
                            <FormItem data-aos="fade-up" data-aos-delay="200">
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
                            <FormItem data-aos="fade-up" data-aos-delay="300">
                                <FormLabel>Nama Produk</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter product name"
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
                            <FormItem data-aos="fade-up" data-aos-delay="400">
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
                            <FormItem data-aos="fade-up" data-aos-delay="500">
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
                                                            className="w-6 h-6 border rounded-md flex items-center justify-center bg-white checked:bg-black"
                                                        >
                                                            {field.value?.includes(type as "Pembayaran" | "Checker" | "Tagihan" | "Dapur") && (
                                                                <span className="text-green-500">✓</span>
                                                            )}
                                                        </Checkbox>

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

                    <Button data-aos="fade-up" data-aos-delay="600" type="submit" className="w-full bg-green-500 text-white">
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default EditPrinter
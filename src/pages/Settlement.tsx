import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, History, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { paymentHistory } from "./Dashboard"; // Assuming paymentHistory is a valid dataset
import logo from "../images/logo.jpg";
import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import CodePayment from "@/components/CodePayment";

// Schema untuk validasi data form
const FormSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
    }),
});

const Settlement = () => {
    const [showBill, setShowBill] = useState(false);
    const [showCodePayment, setShowCodePayment] = useState(false);
    const [selectedItems, setSelectedItems] = useState<typeof paymentHistory>([]);
    const [totalSettle, setTotalSettle] = useState(0);
    const [method, setmethod] = useState("");

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: [],
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // Filter data berdasarkan kode item yang dipilih
        const selected = paymentHistory.filter((item) => data.items.includes(item.code));
        setSelectedItems(selected);

        // Hitung total dengan memastikan bahwa nilai amount valid
        const total = selected.reduce((acc, item) => {
            const amount = parseInt(item.amount, 10);
            return acc + (isNaN(amount) ? 0 : amount);
        }, 0);

        setTotalSettle(total);
        setShowBill(true);
    }

    const handleDropdownChange = (value: string) => {
        setmethod(value);
    };

    console.log(selectedItems)

    return (
        <div>
            {/* Header */}
            <div className="fixed w-full top-0 z-10 p-5 flex items-center justify-center bg-orange-400">
                <Link to="/dashboard" className="bg-transparent hover:bg-transparent">
                    <ChevronLeft className="scale-[1.3] text-white" />
                </Link>
                <p className="font-semibold m-auto text-xl text-white text-center uppercase">
                    Settlement
                </p>
            </div>

            {/* Navigation */}
            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to="/dashboard" className="flex gap-3 flex-col items-center">
                    <Home />
                    <p className="uppercase">Home</p>
                </Link>
                <Link to="/" className="flex gap-3 flex-col items-center">
                    <ScanQrCode />
                    <p className="uppercase">Qr Code</p>
                </Link>
                <Link to="/settlement" className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>
                    <p className="uppercase text-orange-400">Penarikan</p>
                </Link>
                <Link to="/" className="flex gap-3 flex-col items-center">
                    <History />
                    <p className="uppercase">Riwayat</p>
                </Link>
                <Link to="/" className="flex gap-3 flex-col items-center">
                    <UserRound />
                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            {/* Form Selection */}
            <div className={`${showBill ? "hidden" : "block"}`}>
                {/* Form */}
                <div className="mt-28 w-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <FormField
                                control={form.control}
                                name="items"
                                render={() => (
                                    <FormItem>
                                        {paymentHistory.map((item, index) => (
                                            <FormField
                                                key={item.code}
                                                control={form.control}
                                                name="items"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-5 w-[90%] m-auto space-y-0">
                                                        <FormControl className={`${index === 0 ? "mt-0" : "mt-10"}`}>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.code)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        field.onChange([...field.value, item.code]);
                                                                    } else {
                                                                        field.onChange(
                                                                            field.value.filter((value) => value !== item.code)
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal w-full m-auto">
                                                            <div>
                                                                <div
                                                                    className={`${index === 0 ? "hidden" : "block"
                                                                        } w-full h-[2px] mb-5 mt-3 bg-gray-300 rounded-full`}
                                                                ></div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-start gap-2">
                                                                        <img
                                                                            src={item.image}
                                                                            className="rounded-full w-10 h-10"
                                                                            alt=""
                                                                        />
                                                                        <div>
                                                                            <p className="uppercase text-sm">{item.title}</p>
                                                                            <p className="text-xs text-gray-400">{item.code}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-end">
                                                                        <p className="text-md font-semibold">Rp {new Intl.NumberFormat('id-ID').format(Number(item.amount))}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                        <FormMessage className="!mt-10 text-center" />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className={`${form.watch("items").length > 0 ? "block" : "hidden"} bg-green-400 uppercase mt-20 w-[90%] m-auto`}
                            >
                                Lanjut
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>

            {/* Bill Display */}
            <div className={`${showBill ? "block" : "hidden"} ${showCodePayment ? 'hidden' : 'block'} w-[90%] m-auto mt-28 mb-32`}>
                <img src={logo} className="w-28 m-auto" alt="" />
                <div>
                    <p className="font-semibold text-xl mt-10 text-center uppercase">
                        Total Jumlah Yang Ingin Anda Settle.
                    </p>

                    <div className="mt-10 text-center p-5 bg-gray-200 rounded-lg">
                        <p className="uppercase font-semibold text-lg">Total</p>
                        <p className="text-3xl font-semibold text-black mt-2">Rp {new Intl.NumberFormat('id-ID').format(totalSettle)}</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="mt-10">
                                <div className="flex items-center gap-5 border mt-2 text-gray-400 border-black rounded-lg p-2 justify-between">
                                    <button>{method || "Pilih Metode Penarikan"}</button>

                                    <ChevronDown />
                                </div>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-white p-5 border mt-3 z-10 rounded-lg w-[400px] flex flex-col gap-3">
                            <DropdownMenuItem onClick={() => handleDropdownChange("Akun Bank")}>
                                Akun Bank
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDropdownChange("Tarik Tunai")}>
                                Tarik Tunai
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="mt-10 flex items-center gap-5">
                        <Button onClick={() => setShowBill(false)} className="w-full p-2 text-center rounded-md bg-white hover:text-white border border-black text-black">Batal</Button>

                        <Button onClick={() => setShowCodePayment(true)} disabled={method.length !== 0 ? false : true} className="w-full bg-orange-400 text-white">Transfer</Button>
                    </div>

                </div>

            </div>

            {showCodePayment && <CodePayment />}
        </div>
    );
};

export default Settlement;

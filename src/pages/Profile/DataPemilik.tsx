import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, CreditCard, Home, Image, ScanQrCode, UserRound, History } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const DataPemilik = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    const FormSchema = z.object({
        NIK: z.string().min(2, {
            message: "NIK must be at least 2 characters.",
        }),
        ownerName: z.string().min(2, {
            message: "ownerName must be at least 2 characters.",
        }),
        email: z.string().email({
            message: "Invalid email address.",
        }),
        phoneNumber: z.string().min(10, {
            message: "Phone number must be at least 10 characters.",
        }).max(15, {
            message: "Phone number must be at most 15 characters.",
        }),
        dateOfBirth: z.string().refine((value) => {
            const date = new Date(value);
            return date instanceof Date && !isNaN(date.getTime());
        }, {
            message: "Invalid date.",
        }),
        photo: z.instanceof(File, {
            message: "Photo must be a valid file.",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            NIK: "",
            ownerName: "",
            email: "",
            phoneNumber: "",
            dateOfBirth: "",
            photo: undefined,
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)

        setShowNotification(true)
    }

    return (
        <>
            <div className={`${showEdit ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>

                    <p className='font-semibold m-auto text-xl text-white text-center'>Data Pemilik</p>
                </div>

                <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                    <Link to={'/dashboard'} className="flex gap-3 flex-col items-center">
                        <Home />

                        <p className="uppercase">Home</p>
                    </Link>

                    <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                        <ScanQrCode />

                        <p className="uppercase">Qr Code</p>
                    </Link>

                    <Link to={'/settlement'} className="flex relative gap-3 flex-col items-center">
                        <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                            <CreditCard />
                        </div>

                        <p className="uppercase">Penarikan</p>
                    </Link>

                    <Link to={'/history'} className="flex gap-3 flex-col items-center">
                        <History />

                        <p className="uppercase">Riwayat</p>
                    </Link>

                    <Link to={'/profile'} className="flex gap-3 flex-col text-orange-400 items-center">
                        <UserRound />

                        <p className="uppercase">Profile</p>
                    </Link>
                </div>

                <div className="bg-white w-[90%] -translate-y-20 p-5 flex flex-col items-center gap-5 rounded-lg shadow-lg z-20">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-sm text-gray-500">NIK</p>

                        <p className="text-sm font-semibold">123203091821833</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nama</p>

                        <p className="text-sm font-semibold">Rani Destrian</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Email</p>

                        <p className="text-sm font-semibold">Rani.destrian@gmail.com</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">No Hp</p>

                        <p className="text-sm font-semibold">08459332332923</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Tanggal Lahir</p>

                        <p className="text-sm font-semibold">23/09/2004</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Photo</p>

                        <Image />
                    </div>
                </div>

                <Button onClick={() => setShowEdit(true)} className="w-[90%] bg-green-400">Edit</Button>
            </div>

            <div className={`${showEdit ? 'flex' : 'hidden'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <button onClick={() => setShowEdit(false)} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </button>

                    <p className='font-semibold m-auto text-xl text-white text-center'>Edit Data Pemilik</p>
                </div>

                <div className="w-[90%] bg-white shadow-lg rounded-lg p-5 -translate-y-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className={'flex flex-col items-end w-full md:w-2/3 space-y-7'}>
                                <FormField
                                    control={form.control}
                                    name="NIK"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">NIK</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" disabled={true} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ownerName"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Name</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
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
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Phone</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="photo"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Photo</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            field.onChange(file); // Update field value with the selected file
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-green-400 mt-7">Simpan Data</Button>
                        </form>
                    </Form>
                </div>

                <div className={`${showNotification ? 'flex' : 'hidden'} fixed items-center justify-center top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50`}>
                    <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5">
                        <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                            <Check />
                        </div>

                        <p className="font-semibold text-xl">Terimakasih</p>

                        <p className='text-base'>Data Pemilik Berhasil Diubah.</p>

                        <Button onClick={() => setShowNotification(false)} className="w-full">Back</Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DataPemilik
import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, Image, ChevronRight, Check, FileText } from "lucide-react"
import { useState } from "react";
import { Link } from "react-router-dom"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";

const dataPayments = [
    {
        title: 'Bpk',
        bankName: 'BCA',
        accountNumber: '1234567890',
        ownerName: 'Bpk. Rani Destrian',
        savingBook: <Image />
    },
    {
        title: 'Ibu',
        bankName: 'BNI',
        accountNumber: '0987654321',
        ownerName: 'Ibu. Rani Destrian',
        savingBook: <Image />
    }
]

const DataPembayaran = () => {
    const [showContent, setShowContent] = useState({ show: false, index: -1 });
    const [isAdding, setIsAdding] = useState(false);
    const [showEdit, setShowEdit] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    const FormSchema = z.object({
        title: z.string().min(3),
        bankName: z.string().min(3),
        accountNumber: z.string().min(10),
        ownerName: z.string().min(3),
        savingBook: z.instanceof(File, {
            message: "Photo must be a valid file.",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: '',
            bankName: '',
            accountNumber: '',
            ownerName: '',
            savingBook: undefined
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)

        // Add new payment to the list
        dataPayments.push({
            title: data.title,
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            ownerName: data.ownerName,
            savingBook: <Image />
        })

        setShowNotification(true)
    }

    const buttonBack = () => {
        setShowContent({ show: false, index: -1 })
        setShowEdit(false)
        setIsAdding(false)
    }

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                {showContent.show === false ? (
                    <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>
                ) : (
                    <button onClick={buttonBack} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </button>
                )}

                <p className='font-semibold m-auto text-xl text-white text-center'>{isAdding ? 'Tambah Data Pembayaran' : showEdit ? 'Edit Data Pembayaran' : 'Data Pembayaran'}</p>
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

                <Link to={'/catalog'} className="flex gap-3 flex-col items-center">
                    <FileText />

                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to={'/profile'} className="flex gap-3 flex-col text-orange-400 items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className={`${showContent.show === false && !isAdding ? 'block' : 'hidden'} bg-white w-[90%] p-5 rounded-lg shadow-lg mt-5 -translate-y-20`}>
                {dataPayments.map((_, index) => (
                    <div key={index}>
                        <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[2px] my-5 bg-gray-200`}></div>

                        <button onClick={() => setShowContent({ show: true, index })} className="flex w-full items-center gap-5 justify-between">
                            <div className="flex flex-col items-start">
                                <p>Data Pembayaran</p>

                                <p className="text-sm text-gray-500">Nama Bank, Nomer Bank</p>
                            </div>

                            <ChevronRight />
                        </button>
                    </div>
                ))}
            </div>

            <Button onClick={() => setIsAdding(true)} className={`${isAdding || showEdit ? 'hidden' : 'block'} w-[90%] bg-green-400`}>Tambah Bank</Button>

            <div className={`${showContent.show === true && !showEdit ? 'block' : 'hidden'} w-[90%] bg-white -translate-y-20 p-5 rounded-lg shadow-lg`}>
                <div className="flex flex-col gap-5">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-sm text-gray-500">Title</p>

                        <p className="text-sm font-semibold">{dataPayments[showContent.index]?.title}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nama Bank</p>

                        <p className="text-sm font-semibold">{dataPayments[showContent.index]?.bankName}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nomor Rekening</p>

                        <p className="text-sm font-semibold">{dataPayments[showContent.index]?.accountNumber}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nama Pemilik</p>

                        <p className="text-sm font-semibold">{dataPayments[showContent.index]?.ownerName}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Buku Tabungan</p>

                        <Image />
                    </div>
                </div>

                <Button onClick={() => setShowEdit(true)} className="mt-7 w-full bg-green-400">Edit</Button>
            </div>

            {/* Add new Bank */}
            <div className={`${isAdding ? 'block' : 'hidden'} w-[90%] p-5 bg-white -translate-y-20 rounded-lg shadow-lg`}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className={'flex flex-col items-end w-full md:w-2/3 space-y-7'}>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Title</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nama Bank</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nomor Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" {...field} />
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
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="savingBook"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Upload Scan Buku Tabungan</FormLabel>
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
            {/*  */}

            {/* Edit Bank */}
            <div className={`${showEdit ? 'block' : 'hidden'} w-[90%] p-5 bg-white -translate-y-20 rounded-lg shadow-lg`}>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((data) => {
                            // Update the dataPayments array
                            dataPayments[showContent.index] = {
                                ...dataPayments[showContent.index],
                                title: data.title,
                                bankName: data.bankName,
                                accountNumber: data.accountNumber,
                                ownerName: data.ownerName,
                                savingBook: <Image />,
                            };

                            setShowEdit(false); // Close the edit form
                            setShowContent({ show: true, index: showContent.index }); // Return to detail view

                            setShowNotification(true); // Show notification
                        })}
                    >
                        <div className="flex flex-col items-end w-full md:w-2/3 space-y-7">
                            <FormField
                                control={form.control}
                                name="title"
                                defaultValue={dataPayments[showContent.index]?.title}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Title</FormLabel>
                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bankName"
                                defaultValue={dataPayments[showContent.index]?.bankName}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nama Bank</FormLabel>
                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="accountNumber"
                                defaultValue={dataPayments[showContent.index]?.accountNumber}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nomor Rekening</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ownerName"
                                defaultValue={dataPayments[showContent.index]?.ownerName}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>
                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="savingBook"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-gray-500">Upload Scan Buku Tabungan</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        field.onChange(file);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-green-400 mt-7">Simpan Perubahan</Button>
                    </form>
                </Form>
            </div>
            {/*  */}

            {/* Notification */}
            <div className={`${showNotification ? 'flex' : 'hidden'} fixed items-center justify-center top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50`}>
                <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5">
                    <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                        <Check />
                    </div>

                    <p className="font-semibold text-xl">Terimakasih</p>

                    <p className='text-base'>{isAdding ? 'Data Bank Berhasil Ditambahkan' : 'Data Bank Berhasil Diubah.'}</p>

                    <Button onClick={() => setShowNotification(false)} className="w-full">Back</Button>
                </div>
            </div>
            {/*  */}
        </div>
    )
}

export default DataPembayaran
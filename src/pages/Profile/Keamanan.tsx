import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, ChevronRight, CreditCard, Home, ScanQrCode, UserRound, History } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"

const Keamanan = () => {
    const [showContent, setShowContent] = useState('')
    const [showNotification, setShowNotification] = useState(false)

    // For password form
    const FormSchema = z.object({
        password: z.string().min(8),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8)
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'], // Fokuskan error pada confirmPassword
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            password: '',
            newPassword: '',
            confirmPassword: ''
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)

        setShowNotification(true)
    }
    // 

    // For PIN form
    const FormSchema2 = z.object({
        PIN: z.string().min(6),
        newPIN: z.string().min(6),
    })

    const form2 = useForm<z.infer<typeof FormSchema2>>({
        resolver: zodResolver(FormSchema2),
        defaultValues: {
            PIN: '',
            newPIN: '',
        },
    })

    function onSubmit2(data: z.infer<typeof FormSchema2>) {
        console.log(data)

        setShowNotification(true)
    }
    //

    return (
        <div className='w-full flex flex-col min-h-screen items-center'>
            <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p className='font-semibold m-auto text-xl text-white text-center'>{showContent === 'Password' ? 'Edit Password' : showContent === 'PIN' ? 'Edit PIN' : 'Keamanan'}</p>
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

            <div className={`${showContent === '' ? 'block' : 'hidden'} bg-white w-[90%] p-5 rounded-lg shadow-lg mt-5 -translate-y-20`}>
                <button onClick={() => setShowContent('Password')} className="flex w-full items-center gap-5 justify-between">
                    <p>Password</p>

                    <ChevronRight />
                </button>

                <div className="w-full h-[2px] my-5 bg-gray-200"></div>

                <button onClick={() => setShowContent('PIN')} className="flex w-full items-center gap-5 justify-between">
                    <p>PIN</p>

                    <ChevronRight />
                </button>
            </div>

            {showContent === 'Password' ? (
                <div className="w-[90%] bg-white p-5 shadow-lg rounded-lg -translate-y-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className={'flex flex-col items-end w-full md:w-2/3 space-y-7'}>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Password Saat Ini</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Password Baru</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">Retype Password Baru</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
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
            ) : showContent === 'PIN' ? (
                <div className="w-[90%] bg-white p-5 shadow-lg rounded-lg -translate-y-20">
                    <Form {...form2}>
                        <form onSubmit={form2.handleSubmit(onSubmit2)}>
                            <div className={'flex flex-col items-end w-full md:w-2/3 space-y-7'}>
                                <FormField
                                    control={form2.control}
                                    name="PIN"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">PIN Saat Ini</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form2.control}
                                    name="newPIN"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="text-gray-500">PIN Baru</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
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
            ) : null}

            <div className={`${showNotification ? 'flex' : 'hidden'} fixed items-center justify-center top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50`}>
                <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5">
                    <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                        <Check />
                    </div>

                    <p className="font-semibold text-xl">Terimakasih</p>

                    <p className='text-base'>{showContent === 'Password' ? 'Password' : 'PIN'} Berhasil Diubah.</p>

                    <Button onClick={() => setShowNotification(false)} className="w-full">Back</Button>
                </div>
            </div>
        </div>
    )
}

export default Keamanan
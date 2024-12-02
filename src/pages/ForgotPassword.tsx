import { Check, ChevronDown, ChevronLeft, MailCheck, Phone } from 'lucide-react'
import logo from '../images/logo.png'
import { Link, redirect, useNavigate } from 'react-router-dom'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

const ForgotPassword = () => {
    const [showInputEmail, setShowInputEmail] = useState(false)
    const [showInputPhone, setShowInputPhone] = useState(false)
    const [showTypeConfirmation, setShowTypeConfirmation] = useState(true)
    const [Notification, setNotification] = useState({ status: false, address: '', notificationSuccess: false })
    const [showAddNewPassword, setShowAddNewPassword] = useState(false)

    const navigate = useNavigate();

    // For form dropDown
    const FormSchema = z.object({
        typeConfirmation: z.enum(["Email", "No Hp"], {
            message: "Please select the type for the confirmation.",
        }),
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            typeConfirmation: undefined,
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)

        if (data.typeConfirmation === "Email") {
            setShowInputEmail(true)
            setShowInputPhone(false)
        } else {
            setShowInputPhone(true)
            setShowInputEmail(false)
        }

        setShowTypeConfirmation(false)
    }
    // 

    // For form email
    const FormEmailSchema = z.object({
        email: z.string().email({
            message: "Please enter a valid email address.",
        }),
    })

    const formEmail = useForm<z.infer<typeof FormEmailSchema>>({
        resolver: zodResolver(FormEmailSchema),
        defaultValues: {
            email: "",
        },
    })

    function onSubmitEmail(data: z.infer<typeof FormEmailSchema>) {
        setNotification({ status: true, address: data.email, notificationSuccess: false })
    }
    // 

    // For form phone
    const FormPhoneSchema = z.object({
        phone: z.string().min(10, {
            message: "Please enter a valid phone number.",
        }),
    })

    const formPhone = useForm<z.infer<typeof FormPhoneSchema>>({
        resolver: zodResolver(FormPhoneSchema),
        defaultValues: {
            phone: "",
        },
    })

    function onSubmitPhone(data: z.infer<typeof FormPhoneSchema>) {
        setNotification({ status: true, address: data.phone, notificationSuccess: false })
    }
    //

    // Form for set new password
    const FormNewPasswordSchema = z.object({
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long.' })
            .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
            .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
            .regex(/\d/, { message: 'Password must contain at least one number.' }),
        confirmPassword: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long.' })
            .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
            .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
            .regex(/\d/, { message: 'Password must contain at least one number.' }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'], // Fokuskan error pada confirmPassword
    })

    const formNewPassword = useForm<z.infer<typeof FormNewPasswordSchema>>({
        resolver: zodResolver(FormNewPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    function onSubmitNewPassword(data: z.infer<typeof FormNewPasswordSchema>) {
        console.log(data)

        setNotification({ status: false, address: '', notificationSuccess: true })
    }
    //

    const closeNotificationHandler = () => {
        setNotification({ status: false, address: '', notificationSuccess: false })

        setShowAddNewPassword(true)
    }

    console.log(Notification.notificationSuccess)

    return (
        <div className='w-full flex flex-col min-h-screen items-center justify-center'>
            <div className='fixed w-full top-0 p-5 flex items-center justify-center bg-orange-400'>
                <Link to={'/'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p className='font-semibold m-auto text-xl text-white text-center'>Lupa Password</p>
            </div>

            <img src={logo} className='w-[80%] mt-32' alt="" />

            <div className='mt-10 text-center p-10'>
                <p className='text-gray-500'>Kami akan mengirimkan konfirmasi ke email Anda untuk mengatur ulang password Anda.</p>

                <div className={`${showTypeConfirmation ? 'block' : 'hidden'}`}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="typeConfirmation"
                                render={({ field }) => (
                                    <FormItem className="w-full mt-10">
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                        <button className="">
                                                            {field.value || "- Pilih -"} {/* Display selected value */}
                                                        </button>

                                                        <ChevronDown />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[250px] bg-white p-5 border mt-3 rounded-lg flex flex-col gap-3">
                                                    <DropdownMenuItem onSelect={() => field.onChange("Email")} className="w-full">Email</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("No Hp")} className="w-full">No Hp</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="bg-[#7ED321] px-5 py-3 mt-10 w-full text-white rounded-lg">
                                Kirim
                            </Button>
                        </form>
                    </Form>
                </div>

                {showInputEmail && !showAddNewPassword && (
                    <>
                        <Form {...formEmail}>
                            <form onSubmit={formEmail.handleSubmit(onSubmitEmail)} className={`${Notification.status ? 'hidden' : 'block'}`}>
                                <FormField
                                    control={formEmail.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="w-full mt-10">
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Masukkan Email Anda"
                                                    className="rounded-sm border border-black px-4 w-full py-3"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="bg-[#7ED321] px-5 py-3 mt-10 w-full text-white rounded-lg">
                                    Kirim
                                </Button>
                            </form>
                        </Form>

                        <div className={`${Notification.status ? 'flex' : 'hidden'} items-center justify-center fixed bg-black bg-opacity-50 left-0 right-0 top-0 bottom-0`}>
                            {Notification.status && (
                                <div className="w-[90%] bg-white p-3 mt-5 rounded-lg flex items-center flex-col gap-5">
                                    <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                                        <MailCheck className='scale-[1.5]' />
                                    </div>

                                    <p className="text-orange-400 font-semibold text-xl">Link telah dikirimkan ke {Notification.address}</p>

                                    <p className='text-sm text-gray-500'>Klik pada link yang telah kami kirimkan ke email Anda untuk mengatur ulang password Anda.</p>

                                    <Button onClick={closeNotificationHandler} className='bg-green-400 text-white'>Saya Mengerti</Button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {showInputPhone && !showAddNewPassword && (
                    <>
                        <Form {...formPhone}>
                            <form onSubmit={formPhone.handleSubmit(onSubmitPhone)} className={`${Notification.status ? 'hidden' : 'block'}`}>
                                <FormField
                                    control={formPhone.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="w-full mt-10">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Masukkan No Hp Anda"
                                                    className="rounded-sm border border-black px-4 w-full py-3"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="bg-[#7ED321] px-5 py-3 mt-10 w-full text-white rounded-lg">
                                    Kirim
                                </Button>
                            </form>
                        </Form>

                        <div className={`${Notification.status ? 'flex' : 'hidden'} items-center justify-center fixed bg-black bg-opacity-50 left-0 right-0 top-0 bottom-0`}>
                            {Notification.status && (
                                <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5">
                                    <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                                        <Phone className='scale-[1.5]' />
                                    </div>

                                    <p className="text-orange-400 font-semibold text-xl">Link telah dikirimkan ke {Notification.address}</p>

                                    <p className='text-sm text-gray-500'>Klik pada link yang telah kami kirimkan ke nomer Anda untuk mengatur ulang password Anda.</p>

                                    <Button onClick={closeNotificationHandler} className='bg-green-400 text-white'>Saya Mengerti</Button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {showAddNewPassword && (
                    <Form {...formNewPassword}>
                        <form onSubmit={formNewPassword.handleSubmit(onSubmitNewPassword)} className={`${Notification.status ? 'hidden' : 'block'}`}>
                            <FormField
                                control={formNewPassword.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="w-full mt-10">
                                        <FormControl>
                                            <input
                                                type="password"
                                                placeholder="Password Baru"
                                                className="rounded-sm border border-black px-4 w-full py-3"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formNewPassword.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="w-full mt-10">
                                        <FormControl>
                                            <input
                                                type="password"
                                                placeholder="Konfirmasi Password Baru"
                                                className="rounded-sm border border-black px-4 w-full py-3"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="bg-[#7ED321] px-5 py-3 mt-10 w-full text-white rounded-lg">
                                Kirim
                            </Button>
                        </form>
                    </Form>
                )}

                <div className={`${Notification.notificationSuccess ? 'flex' : 'hidden'} items-center justify-center fixed bg-black bg-opacity-50 left-0 right-0 top-0 bottom-0`}>
                    <div className="w-[90%] bg-white p-3 mt-5 rounded-lg flex items-center flex-col gap-5">
                        <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                            <Check className='scale-[1.5]' />
                        </div>

                        <p className='text-xl text-orange-400'>Password berhasil di ganti.</p>

                        <Button onClick={() => navigate('/')} className='bg-green-400 text-white'>Login</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
import { Check, ChevronLeft, MailCheck } from 'lucide-react'
import logo from '../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import AOS from "aos";
import "aos/dist/aos.css";

const ForgotPassword = () => {
    const [Notification, setNotification] = useState({ status: false, address: '', notificationSuccess: false })

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const navigate = useNavigate();

    // For form email
    const FormEmailSchema = z.object({
        email: z.string().email({
            message: "Silakan masukkan alamat email yang valid.",
        }),
    })

    const formEmail = useForm<z.infer<typeof FormEmailSchema>>({
        resolver: zodResolver(FormEmailSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmitEmail(data: z.infer<typeof FormEmailSchema>) {
        try {
            // Kirim data ke endpoint menggunakan Axios
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                email: data.email,
            });

            console.log("Success:", response.data);

            setNotification({ status: true, address: data.email, notificationSuccess: false })
        } catch (error) {
            console.error("Error submitting email:", error);

            // Tangani error dengan memeriksa response Axios
            const errorMessage = (error as any).response?.data?.message || "Failed to send the email. Please try again.";

            // Atur notifikasi gagal
            setNotification({
                status: true,
                address: errorMessage,
                notificationSuccess: false,
            });
        }
    }
    //

    // // Form for set new password
    // const FormNewPasswordSchema = z.object({
    //     password: z
    //         .string()
    //         .min(8, { message: 'Password must be at least 8 characters long.' })
    //         .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    //         .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    //         .regex(/\d/, { message: 'Password must contain at least one number.' }),
    //     confirmPassword: z
    //         .string()
    //         .min(8, { message: 'Password must be at least 8 characters long.' })
    //         .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    //         .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    //         .regex(/\d/, { message: 'Password must contain at least one number.' }),
    // }).refine((data) => data.password === data.confirmPassword, {
    //     message: 'Passwords do not match.',
    //     path: ['confirmPassword'], // Fokuskan error pada confirmPassword
    // })

    // const formNewPassword = useForm<z.infer<typeof FormNewPasswordSchema>>({
    //     resolver: zodResolver(FormNewPasswordSchema),
    //     defaultValues: {
    //         password: "",
    //         confirmPassword: "",
    //     },
    // })

    // const onSubmitNewPassword = async (data: z.infer<typeof FormNewPasswordSchema>) => {
    //     console.log("Submitted data:", data);

    //     // Ambil informasi user dari sessionStorage
    //     const userItem = sessionStorage.getItem("user");
    //     const userData = userItem ? JSON.parse(userItem) : null;

    //     try {
    //         // Kirim data ke endpoint menggunakan Axios
    //         const response = await axios.patch(`/api/auth/forgotpassword/${userData.id}`, {
    //             password: data.password,
    //             confirmPassword: data.confirmPassword,
    //         });

    //         console.log("Success:", response.data);

    //         // Atur notifikasi berhasil
    //         setNotification({
    //             status: true,
    //             address: 'Your password has been successfully updated!',
    //             notificationSuccess: true,
    //         });
    //     } catch (error) {
    //         console.error("Error submitting new password:", error);

    //         // Tangani error dengan memeriksa response Axios
    //         const errorMessage = (error as any).response?.data?.message || "Failed to update the password. Please try again.";

    //         // Atur notifikasi gagal
    //         setNotification({
    //             status: true,
    //             address: errorMessage,
    //             notificationSuccess: false,
    //         });
    //     }
    // };
    // //

    const closeNotificationHandler = () => {
        setNotification({ status: false, address: '', notificationSuccess: false })
    }

    console.log(Notification.notificationSuccess)

    return (
        <div className='w-full flex flex-col min-h-screen items-center justify-center'>
            <div className='fixed w-full top-0 p-5 flex items-center justify-center bg-orange-400'>
                <Link to={'/'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>Lupa Password</p>
            </div>

            <img data-aos="fade-up" data-aos-delay="100" src={logo} className='w-[70%] mt-32' alt="" />

            <div className='mt-10 text-center p-10'>
                <p className='text-gray-500' data-aos="fade-up" data-aos-delay="200">Kami akan mengirimkan konfirmasi ke email Anda untuk mengatur ulang password Anda.</p>

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
                                                data-aos="fade-up"
                                                data-aos-delay="300"
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

                            <Button data-aos="fade-up" data-aos-delay="400" type="submit" className="bg-[#7ED321] px-5 py-3 mt-10 w-full text-white rounded-lg">
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

                {/* {showAddNewPassword && (
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
                )} */}

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
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl, FormMessage, Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Deklarasi form di awal
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
        path: ['confirmPassword'],
    });

    const formNewPassword = useForm<z.infer<typeof FormNewPasswordSchema>>({
        resolver: zodResolver(FormNewPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        const token = searchParams.get('token'); // Ambil token dari URL
        if (token) {
            validateToken(token);
        } else {
            setIsValid(false);
            setErrorMessage('Token tidak ditemukan di URL');
        }
    }, []);

    const validateToken = async (token: string) => {
        try {
            const response = await fetch(`https://be-stiqr.dnstech.co.id/api/auth/validate-token?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.isValid) {
                setIsValid(true);
            } else {
                setIsValid(false);
                setErrorMessage('Token tidak valid atau sudah kedaluwarsa');
            }
        } catch (error) {
            console.error('Error validating token:', error);
            setIsValid(false);
            setErrorMessage('Terjadi kesalahan saat memvalidasi token');
        }
    };

    const onSubmitNewPassword = async (data: z.infer<typeof FormNewPasswordSchema>) => {
        console.log("Submitted data:", data);

        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        console.log(userData)

        try {
            const response = await axios.patch(`https://be-stiqr.dnstech.co.id/api/auth/forgotpassword/${userData?.id}`, {
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            console.log("Success:", response.data);
        } catch (error) {
            console.error("Error submitting new password:", error);
            const errorMessage = (error as any).response?.data?.message || "Failed to update the password. Please try again.";
            console.log(errorMessage);
        }
    };

    return (
        <div className="w-full flex flex-col min-h-screen">
            <div className='fixed w-full top-0 p-5 flex items-center justify-center bg-orange-400'>
                <Link to={'/'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                    <ChevronLeft className='scale-[1.3] text-white' />
                </Link>

                <p className='font-semibold m-auto text-xl text-white text-center'>Reset Password</p>
            </div>

            {isValid === null && <p className="mt-20 text-center">Loading...</p>}

            {isValid === false && <p className="mt-20 text-center">{errorMessage}</p>}

            {isValid && (
                <Form {...formNewPassword}>
                    <form onSubmit={formNewPassword.handleSubmit(onSubmitNewPassword)} className={`block w-[90%] m-auto mt-20`}>
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
        </div>
    );
};

export default ResetPassword;

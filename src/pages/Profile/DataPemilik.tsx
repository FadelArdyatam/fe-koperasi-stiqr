import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, CreditCard, Home, Image, ScanQrCode, UserRound, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/hooks/axiosInstance"
import AOS from "aos";
import "aos/dist/aos.css";

const DataPemilik = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [showNotification, setShowNotification] = useState(false)
    const [user, setUser] = useState<any>()

    useEffect(() => {
        AOS.init({ duration: 500, once: false, offset: 100 });
    }, [])

    useEffect(() => {
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }, [showEdit]);

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
        }).optional(),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            NIK: "",
            ownerName: "",
            email: "",
            phoneNumber: "",
            dateOfBirth: "",
        },
    })

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    const [isUpdate, setIsUpdate] = useState(false)
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const response = await axiosInstance.put(`/users/${userData.id}/update`, {
                username: data.ownerName,
                email: data.email,
                phone_number: data.phoneNumber,
                dob: data.dateOfBirth,
            })
            if (response.data.statusCode == 200) {
                console.log(response)
                setShowNotification(true)
                sessionStorage.setItem("user", JSON.stringify(response.data.data));
                setIsUpdate(true)
            }
        } catch (error: any) {
            console.log(error)
        }
    }

    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;
        setUser(userData);
        if (userData) {
            form.reset({
                NIK: userData.nik,
                ownerName: userData.username || userData.name || "",
                email: userData.email || "",
                phoneNumber: userData.phone_number || "",
                dateOfBirth: formatDateForInput(userData.dob) || "",
            });
        }
    }, [isUpdate])

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleEditClick = () => {
        if (user) {
            form.reset({
                NIK: user.nik,
                ownerName: user.username || user.name || "",
                email: user.email || "",
                phoneNumber: user.phone_number || "",
                dateOfBirth: formatDateForInput(user.dob) || "",
            });
        }

        setIsUpdate(false)
        setShowEdit(true);
    };

    const handleBack = () => {
        setShowEdit(false);
        setShowNotification(false)
        setIsUpdate(true)
    }

    const FormatDate = ({ dateString }: { dateString: string }) => {
        const formatDate = (isoDate: string | number | Date) => {
            const date = new Date(isoDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        return <div>{formatDate(dateString)}</div>;
    };

    return (
        <>
            <div className={`${showEdit ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>

                    <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>Data Pemilik</p>
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

                <div className="bg-white w-[90%] -translate-y-20 p-5 flex flex-col items-center gap-5 rounded-lg shadow-lg z-0">
                    <div data-aos="fade-up" data-aos-delay="100" className="flex w-full items-center justify-between">
                        <p className="text-sm text-gray-500">NIK</p>

                        <p className="text-sm font-semibold">{user?.nik}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="200" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nama</p>

                        <p className="text-sm font-semibold">{user?.username || user?.name}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="300" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Email</p>

                        <p className="text-sm font-semibold">{user?.email}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="400" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">No Hp</p>

                        <p className="text-sm font-semibold">{user?.phone_number}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="500" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Tanggal Lahir</p>

                        <FormatDate dateString={user?.dob} />
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="600" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Photo</p>

                        <Image />
                    </div>
                </div>

                <Button data-aos="fade-up" data-aos-delay="700" onClick={handleEditClick} className="w-[90%] bg-green-400 -mt-16 md:mb-20">Edit</Button>
            </div>

            <div key={showEdit ? "edit-mode" : "view-mode"} className={`${showEdit ? 'flex' : 'hidden'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <button onClick={() => setShowEdit(false)} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </button>

                    <p data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>Edit Data Pemilik</p>
                </div>

                <div className="w-[90%] bg-white shadow-lg rounded-lg p-5 -translate-y-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className={'flex flex-col items-end w-full md:w-2/3 space-y-7'}>
                                <FormField
                                    control={form.control}
                                    name="NIK"
                                    render={({ field }) => (
                                        <FormItem data-aos="fade-up" data-aos-delay="100" className="w-full">
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
                                        <FormItem data-aos="fade-up" data-aos-delay="200" className="w-full">
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
                                        <FormItem data-aos="fade-up" data-aos-delay="300" className="w-full">
                                            <FormLabel className="text-gray-500">Email</FormLabel>

                                            <FormControl>
                                                <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" disabled {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem data-aos="fade-up" data-aos-delay="400" className="w-full">
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
                                        <FormItem data-aos="fade-up" data-aos-delay="500" className="w-full">
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
                                        <FormItem data-aos="fade-up" data-aos-delay="600" className="w-full">
                                            <FormLabel className="text-gray-500">Photo</FormLabel>
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

                        <Button onClick={handleBack} className="w-full">Back</Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DataPemilik
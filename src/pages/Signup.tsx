import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, Eye, EyeOff, Smartphone, Store, UserRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import { useEffect, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import OTP from "@/components/OTP"
import TermsandCondition from "@/components/TermsandCondition"
import PinInput from "@/components/PinInput"
import axiosInstance from "@/hooks/axiosInstance"
import Notification from "@/components/Notification"

const Signup = () => {
    const [showTermsandConditions, setShowTermsandConditions] = useState(true)
    const [section, setSection] = useState([true, false, false]);
    const [currentSection, setCurrentSection] = useState(0);
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [createPin, setCreatePin] = useState(false)
    const [allData, setAllData] = useState<{ ownerName?: string } & (z.infer<typeof FormSchemaUser> | z.infer<typeof FormSchemaMerchant>)[]>([])
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const FormSchemaUser = z.object({
        photo: z.union([z.instanceof(File), z.string().url()]),
        ownerName: z.string().min(2, {
            message: "Nama pemilik harus terdiri dari minimal 2 karakter.",
        }),
        gender: z.enum(["Laki - Laki", "Perempuan"], {
            message: "Harap pilih jenis kelamin.",
        }),
        dateOfBirth: z.preprocess((value) => {
            if (typeof value === "string") {
                return new Date(value);
            }
            return value;
        }, z.date().max(new Date(), {
            message: "Tanggal lahir tidak boleh di masa depan.",
        })),
        email: z.string().email({
            message: "Alamat email tidak valid.",
        }),
        nik: z.string().min(16, {
            message: "NIK harus terdiri dari 16 karakter.",
        }).max(16, {
            message: "NIK harus terdiri dari 16 karakter.",
        }),
        phoneNumber: z.string().min(10, {
            message: "Nomor telepon harus terdiri dari minimal 10 karakter.",
        }).max(15, {
            message: "Nomor telepon harus terdiri dari maksimal 15 karakter.",
        }),
        password: z
            .string()
            .min(8, { message: 'Kata sandi harus terdiri dari minimal 8 karakter.' })
            .regex(/[a-z]/, { message: 'Kata sandi harus mengandung setidaknya satu huruf kecil.' })
            .regex(/[A-Z]/, { message: 'Kata sandi harus mengandung setidaknya satu huruf besar.' })
            .regex(/\d/, { message: 'Kata sandi harus mengandung setidaknya satu angka.' }),
        confirmPassword: z
            .string()
            .min(8, { message: 'Kata sandi harus terdiri dari minimal 8 karakter.' })
            .regex(/[a-z]/, { message: 'Kata sandi harus mengandung setidaknya satu huruf kecil.' })
            .regex(/[A-Z]/, { message: 'Kata sandi harus mengandung setidaknya satu huruf besar.' })
            .regex(/\d/, { message: 'Kata sandi harus mengandung setidaknya satu angka.' }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Kata sandi dan konfirmasi kata sandi tidak cocok.',
        path: ['confirmPassword'],
    });

    const formUser = useForm<z.infer<typeof FormSchemaUser>>({
        resolver: zodResolver(FormSchemaUser),
        defaultValues: {
            photo: undefined,
            ownerName: "",
            gender: undefined,
            dateOfBirth: new Date(),
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        },
    })

    function onSubmitUser(data: z.infer<typeof FormSchemaUser>) {
        console.log("Data user yang dikirim:", data);

        // Update allData dengan data baru
        const updatedAllData = [data, ...allData.slice(1)];
        setAllData(updatedAllData);

        handleNext();
    }

    const FormSchemaMerchant = z.object({
        typeBusinessEntity: z.enum(
            ["Perorangan", "CV", "Koperasi", "Firma", "Perseroan Terbatas"],
            {
                message: "Harap pilih jenis badan usaha.",
            }
        ),
        merchantName: z.string().min(2, {
            message: "Nama merchant harus terdiri dari minimal 2 karakter.",
        }),
        merchantProvince: z.string().min(2, {
            message: "Nama provinsi harus terdiri dari minimal 2 karakter.",
        }),
        merchantRegency: z.string().min(2, {
            message: "Nama kabupaten/kota harus terdiri dari minimal 2 karakter.",
        }),
        merchantDistrict: z.string().min(2, {
            message: "Nama kecamatan harus terdiri dari minimal 2 karakter.",
        }),
        merchantVillage: z.string().min(2, {
            message: "Nama desa/kelurahan harus terdiri dari minimal 2 karakter.",
        }),
        merchantCategory: z.enum(
            [
                "Makanan & Minuman",
                "Fashion & Aksesori",
                "Elektronik & Gadget",
                "Kesehatan & Kecantikan",
                "Rumah & Dekorasi",
                "Otomotif",
                "Hobi & Hiburan",
                "Jasa & Layanan",
                "Bahan Pokok & Grosir",
                "Teknologi & Digital",
                "Lainnya",
            ],
            {
                message: "Harap pilih kategori merchant.",
            }
        ),
        postalCode: z.string().min(5, {
            message: "Kode pos harus terdiri dari minimal 5 karakter.",
        }),
        merchantAddress: z.string().min(5, {
            message: "Alamat merchant harus terdiri dari minimal 5 karakter.",
        }),
        phoneNumberMerchant: z
            .string()
            .min(10, {
                message: "Nomor telepon harus terdiri dari minimal 10 karakter.",
            })
            .max(15, {
                message: "Nomor telepon harus terdiri dari maksimal 15 karakter.",
            }),
        merchantEmail: z.string().email({
            message: "Alamat email tidak valid.",
        }),
    });

    const formMerchant = useForm<z.infer<typeof FormSchemaMerchant>>({
        resolver: zodResolver(FormSchemaMerchant),
        defaultValues: {
            typeBusinessEntity: undefined,
            merchantName: "",
            merchantProvince: undefined,
            merchantRegency: undefined,
            merchantDistrict: undefined,
            merchantVillage: undefined,
            merchantCategory: undefined,
            postalCode: "",
            merchantAddress: "",
            phoneNumberMerchant: "",
            merchantEmail: "",
        },
    })

    const onSubmitMerchant = async (data: z.infer<typeof FormSchemaMerchant>) => {
        const userDatas = allData[0] as z.infer<typeof FormSchemaUser>;

        // Debug email user sebelum membuat payload
        console.log("Email user yang digunakan:", userDatas?.email);

        const payload = {
            username: userDatas?.ownerName,
            nik: userDatas?.nik,
            email: userDatas?.email, // Pastikan ini adalah email terbaru
            password: userDatas?.password,
            confirmPassword: userDatas?.confirmPassword,
            phoneNumber: userDatas?.phoneNumber,
            gender: userDatas?.gender,
            dateOfBirth: userDatas?.dateOfBirth,
            merchantAddress: data.merchantAddress,
            merchantCategory: data.merchantCategory,
            merchantProvince: data.merchantProvince,
            merchantRegency: data.merchantRegency,
            merchantDistrict: data.merchantDistrict,
            merchantVillage: data.merchantVillage,
            merchantEmail: data.merchantEmail,
            merchantName: data.merchantName,
            phoneNumberMerchant: data.phoneNumberMerchant,
            postalCode: data.postalCode,
            typeBusinessEntity: data.typeBusinessEntity,
            photo: userDatas.photo instanceof File ? userDatas.photo : "https://via.placeholder.com/150",
        };

        console.log(payload)

        const formData = new FormData();
        formData.append("username", payload.username);
        formData.append("nik", payload.nik);
        formData.append("email", payload.email);
        formData.append("password", payload.password);
        formData.append("confirmPassword", payload.confirmPassword);
        formData.append("phone_number", payload.phoneNumber);
        formData.append("gender", payload.gender);
        formData.append("dateOfBirth", payload.dateOfBirth.toISOString().split('T')[0]);
        formData.append("merchantAddress", payload.merchantAddress);
        formData.append("merchantCategory", payload.merchantCategory);
        formData.append("merchantProvince", payload.merchantProvince);
        formData.append("merchantRegency", payload.merchantRegency);
        formData.append("merchantDistrict", payload.merchantDistrict);
        formData.append("merchantVillage", payload.merchantVillage);
        formData.append("merchantEmail", payload.merchantEmail);
        formData.append("merchantName", payload.merchantName);
        formData.append("phoneNumberMerchant", payload.phoneNumberMerchant);
        formData.append("postalCode", payload.postalCode);
        formData.append("typeBusinessEntity", payload.typeBusinessEntity);

        const userData = allData[0] as z.infer<typeof FormSchemaUser>;
        if (userData.photo instanceof File) {
            formData.append("photo", userData.photo);
        } else {
            formData.append("photo", payload.photo);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.status) {
                handleNext();
                setShowNotification(false)
            } else {
                setShowNotification(true)
                setErrorMessage(result.message)
            }
        } catch (error: any) {
            console.log(error)
            console.error("Error:", error)
            setShowNotification(true)
            setErrorMessage(error.message || "Terjadi Kesalahan")
        }
    };

    const handleNext = () => {
        const isCurrentSectionValid = validateSection(currentSection);

        if (isCurrentSectionValid) {
            const updatedSections = [...section];
            updatedSections[currentSection + 1] = true;
            setSection(updatedSections);

            if (currentSection < section.length - 1) {
                setCurrentSection(currentSection + 1);
            } else {
                console.log("Semua section telah lengkap!");
            }
        } else {
            alert("Harap lengkapi data pada section ini!");
        }
    };

    const validateSection = (sectionIndex: number) => {
        // Contoh logika validasi: Pastikan section ini memiliki input yang lengkap
        // (Untuk simulasi, ini hanya mengembalikan true)
        console.log(sectionIndex)
        return true;
    };

    const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
    const [regencies, setRegencies] = useState<{ id: number; province_id: string, name: string }[]>([]);
    const [districts, setDistricts] = useState<{ id: number; regency_id: string, name: string }[]>([]);
    const [villages, setVillages] = useState<{ id: number; district_id: string, name: string }[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
    const [selectedRegency, setSelectedRegency] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get("/merchant/list/provinces");
                setProvinces(response.data);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            const fetchRegencies = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(
                        `/merchant/list/regencies/${selectedProvince}`
                    );
                    setRegencies(response.data);
                } catch (error) {
                    console.error("Error fetching regencies:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchRegencies();
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedRegency) {
            const fetchDistricts = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(
                        `/merchant/list/districts/${selectedRegency}`
                    );
                    setDistricts(response.data);
                } catch (error) {
                    console.error("Error fetching districts:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDistricts();
        }
    }, [selectedRegency]);

    useEffect(() => {
        if (selectedDistrict) {
            const fetchVillages = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(
                        `/merchant/list/villages/${selectedDistrict}`
                    );
                    setVillages(response.data);
                } catch (error) {
                    console.error("Error fetching villages:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchVillages();
        }
    }, [selectedDistrict]);

    return (
        <div>
            {showTermsandConditions ? <TermsandCondition setShowTermsandConditions={setShowTermsandConditions} backToPageProfile={false} /> : (
                <div>
                    <div className={`${createPin ? 'hidden' : 'flex'} w-full flex-col p-10`}>
                        <p className="uppercase text-center font-semibold text-2xl">{currentSection === 0 ? 'Data Personal' : currentSection === 1 ? 'Data Merchant' : 'Kode Otp'}</p>

                        <div className="mt-10 w-full flex items-center">
                            <div className={`${section[0] ? 'bg-orange-500' : 'bg-gray-500'} transition-all w-12 h-12 rounded-full flex items-center justify-center`}>
                                <UserRound className="text-white" />
                            </div>

                            <div className="w-20 h-[2px] bg-black"></div>

                            <div className={`${section[1] ? 'bg-blue-500' : 'bg-gray-500'} transition-all w-12 h-12 rounded-full flex items-center justify-center`}>
                                <Store className="text-white" />
                            </div>

                            <div className="w-20 h-[2px] bg-black"></div>

                            <div className={`${section[2] ? 'bg-green-500' : 'bg-gray-500'} transition-all w-12 h-12 rounded-full flex items-center justify-center`}>
                                <Smartphone className="text-white" />
                            </div>
                        </div>

                        <div className="w-full mt-10">
                            <Form {...formUser}>
                                <form onSubmit={formUser.handleSubmit(onSubmitUser)}>
                                    <div className={`${currentSection === 0 ? 'block' : 'hidden'} flex flex-col items-end w-full md:w-2/3 space-y-7`}>
                                        <FormField
                                            control={formUser.control}
                                            name="ownerName"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Nama Pemilik" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formUser.control}
                                            name="nik"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <div>
                                                        <FormControl>
                                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" placeholder="Nomor Induk Kewarganegaraan" {...field} />
                                                        </FormControl>

                                                        {/* <p className="text-xs italic text-gray-500 mt-2">Pastikan </p> */}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formUser.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3 m-auto">
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex w-full space-x-7"
                                                        >
                                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="Laki - Laki" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    Laki - Laki
                                                                </FormLabel>
                                                            </FormItem>

                                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="Perempuan" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    Perempuan
                                                                </FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formUser.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input
                                                            className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                            type="date"
                                                            {...field}
                                                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                                                            onChange={(e) => field.onChange(e.target.value)}  // Ensure the value is updated as a string
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formUser.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <div>
                                                        <FormControl>
                                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Email" {...field} />
                                                        </FormControl>

                                                        <p className="text-gray-500 text-xs mt-2 italic">Mohon pastikan email Anda aktif.</p>
                                                    </div>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formUser.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <div>
                                                        <FormControl>
                                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" placeholder="No Hp" {...field} />
                                                        </FormControl>

                                                        <p className="text-xs italic text-gray-500 mt-2">Pastikan nomer Anda aktif.</p>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="photo"
                                            control={formUser.control}
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <>
                                                            <p className="font-bold">
                                                                Photo Profile
                                                            </p>

                                                            <input
                                                                {...field}
                                                                type="file"
                                                                accept="image/*"
                                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                                onChange={(e) => {
                                                                    const file = e.target.files ? e.target.files[0] : null;

                                                                    if (file) {
                                                                        if (file.size > 2 * 1024 * 1024) {
                                                                            alert("File size exceeds 2MB.");
                                                                            return;
                                                                        }

                                                                        const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
                                                                        if (!validImageTypes.includes(file.type)) {
                                                                            alert("Invalid file type. Please upload an image (JPEG, PNG, or GIF).");
                                                                            return;
                                                                        }

                                                                        field.onChange(file);
                                                                    } else {
                                                                        field.onChange(null);
                                                                    }
                                                                }}
                                                                value=""
                                                            />
                                                        </>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />


                                        <FormField
                                            control={formUser.control}
                                            name='password'
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <div className='flex items-center relative'>
                                                        <FormControl>
                                                            <Input
                                                                className='w-full font-sans font-semibold p-3 border bg-[#F4F4F4] border-gray-300 rounded-md'
                                                                placeholder='Password'
                                                                type={showPassword ? 'text' : 'password'}
                                                                {...field}
                                                            />
                                                        </FormControl>

                                                        <button onClick={() => setShowPassword(!showPassword)} type="button" className='absolute right-5'>{showPassword ? <EyeOff /> : <Eye />}</button>
                                                    </div>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formUser.control}
                                            name='confirmPassword'
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <div className='flex items-center relative'>
                                                        <FormControl>
                                                            <Input
                                                                className='w-full font-sans font-semibold p-3 border bg-[#F4F4F4] border-gray-300 rounded-md'
                                                                placeholder='Retype Password'
                                                                type={showPasswordConfirm ? 'text' : 'password'}
                                                                {...field}
                                                            />
                                                        </FormControl>

                                                        <button onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} type="button" className='absolute right-5'>{showPasswordConfirm ? <EyeOff /> : <Eye />}</button>
                                                    </div>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button className={`${currentSection === 0 ? 'block' : 'hidden'} w-full md:w-max mt-10 font-sans font-semibold bg-[#7ED321] rounded-lg`}>NEXT</Button>
                                </form>
                            </Form>

                            <Form {...formMerchant}>
                                <form onSubmit={formMerchant.handleSubmit(onSubmitMerchant)}>
                                    <div className={`${currentSection === 1 ? 'block' : 'hidden'} flex flex-col items-end w-full md:w-2/3 space-y-7`}>
                                        <FormField
                                            control={formMerchant.control}
                                            name="typeBusinessEntity"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button className="">
                                                                        {field.value || "Select Type of Business"} {/* Display selected value */}
                                                                    </button>

                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full">
                                                                <DropdownMenuLabel>Business Entity</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onSelect={() => field.onChange("Perorangan")} className="w-full">Perorangan</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("CV")} className="w-full">CV</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Koperasi")} className="w-full">Koperasi</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Firma")} className="w-full">Firma</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Perseroan Terbatas")} className="w-full">Perseroan Terbatas</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantName"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Nama Merchant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantProvince"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button>
                                                                        {field.value || "Select Province"}
                                                                    </button>
                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                                                                {loading ? (
                                                                    <div>Loading...</div>
                                                                ) : (
                                                                    provinces.map((province) => (
                                                                        <DropdownMenuItem
                                                                            key={province.id}
                                                                            onSelect={() => {
                                                                                field.onChange(province.name); // Store name instead of id
                                                                                setSelectedProvince(province.id); // Keep ID for fetching dependent data
                                                                                // Reset dependent fields
                                                                                formMerchant.setValue('merchantRegency', '');
                                                                                formMerchant.setValue('merchantDistrict', '');
                                                                                formMerchant.setValue('merchantVillage', '');
                                                                                setSelectedRegency(null);
                                                                                setSelectedDistrict(null);
                                                                            }}
                                                                        >
                                                                            {province.name}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantRegency"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button disabled={!selectedProvince}>
                                                                        {field.value || "Select Regency"}
                                                                    </button>
                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                                                                {loading ? (
                                                                    <div>Loading...</div>
                                                                ) : (
                                                                    regencies.map((regency) => (
                                                                        <DropdownMenuItem
                                                                            key={regency.id}
                                                                            onSelect={() => {
                                                                                field.onChange(regency.name); // Store name instead of id
                                                                                setSelectedRegency(regency.id); // Keep ID for fetching dependent data
                                                                                // Reset dependent fields
                                                                                formMerchant.setValue('merchantDistrict', '');
                                                                                formMerchant.setValue('merchantVillage', '');
                                                                                setSelectedDistrict(null);
                                                                            }}
                                                                        >
                                                                            {regency.name}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantDistrict"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button disabled={!selectedRegency}>
                                                                        {field.value || "Select District"}
                                                                    </button>
                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                                                                {loading ? (
                                                                    <div>Loading...</div>
                                                                ) : (
                                                                    districts.map((district) => (
                                                                        <DropdownMenuItem
                                                                            key={district.id}
                                                                            onSelect={() => {
                                                                                field.onChange(district.name); // Store name instead of id
                                                                                setSelectedDistrict(district.id); // Keep ID for fetching dependent data
                                                                                formMerchant.setValue('merchantVillage', '');
                                                                            }}
                                                                        >
                                                                            {district.name}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantVillage"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button disabled={!selectedDistrict}>
                                                                        {field.value || "Select Village"}
                                                                    </button>
                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                                                                {loading ? (
                                                                    <div>Loading...</div>
                                                                ) : (
                                                                    villages.map((village) => (
                                                                        <DropdownMenuItem
                                                                            key={village.id}
                                                                            onSelect={() => {
                                                                                field.onChange(village.name); // Store name instead of id
                                                                            }}
                                                                        >
                                                                            {village.name}
                                                                        </DropdownMenuItem>
                                                                    ))
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantCategory"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button className="">
                                                                        {field.value || "Select Category"} {/* Display selected value */}
                                                                    </button>

                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-full">
                                                                <DropdownMenuLabel>Category</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onSelect={() => field.onChange("Makanan & Minuman")} className="w-full">Makanan & Minuman</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Fashion & Aksesori")} className="w-full">Fashion & Aksesori</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Elektronik & Gadget")} className="w-full">Elektronik & Gadget</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Kesehatan & Kecantikan")} className="w-full">Kesehatan & Kecantikan</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Rumah & Dekorasi")} className="w-full">Rumah & Dekorasi</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Otomotif")} className="w-full">Otomotif</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Hobi & Hiburan")} className="w-full">Hobi & Hiburan</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Jasa & Layanan")} className="w-full">Jasa & Layanan</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Bahan Pokok & Grosir")} className="w-full">Bahan Pokok & Grosir</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Teknologi & Digital")} className="w-full">Teknologi & Digital</DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => field.onChange("Lainnya")} className="w-full">Lainnya</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="postalCode"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input
                                                            className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                            type="number"
                                                            placeholder="Postal Code"
                                                            {...field}
                                                            onInput={(e) => {
                                                                const value = (e.target as HTMLInputElement).value;
                                                                if (value.length > 5) {
                                                                    (e.target as HTMLInputElement).value = value.slice(0, 5); // Limit to 5 digits
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantAddress"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Merchant Address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="phoneNumberMerchant"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" placeholder="No Hp Merchant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={formMerchant.control}
                                            name="merchantEmail"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Email Merchant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <Button type="button" onClick={() => { setCurrentSection(0) }} className={`${currentSection === 1 ? 'block' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] rounded-lg`}>BACK</Button>
                                        <Button type="submit" className={`${currentSection === 1 ? 'block' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] rounded-lg`}>SUBMIT</Button>
                                    </div>
                                </form>
                            </Form>
                        </div>

                        <OTP currentSection={currentSection} setCreatePin={setCreatePin} />
                    </div>
                    {showNotification && (
                        <>
                            <Notification
                                message={errorMessage}
                                onClose={() => setShowNotification(false)}
                                status="error"
                            />
                        </>
                    )}
                    {createPin && <PinInput email={formMerchant.getValues("merchantEmail")} />}</div>
            )}
        </div>
    )
}

export default Signup
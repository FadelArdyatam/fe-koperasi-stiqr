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

const Signup = () => {
    const [showTermsandConditions, setShowTermsandConditions] = useState(false)
    const [section, setSection] = useState([true, false, false]);
    const [currentSection, setCurrentSection] = useState(0);
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [createPin, setCreatePin] = useState(false)
    const [allData, setAllData] = useState<{ ownerName?: string } & (z.infer<typeof FormSchemaUser> | z.infer<typeof FormSchemaMerchant>)[]>([])

    const FormSchemaUser = z.object({
        ownerName: z.string().min(2, {
            message: "ownerName must be at least 2 characters.",
        }),
        gender: z.enum(["Laki - Laki", "Perempuan"], {
            message: "Please select the gender",
        }),
        dateOfBirth: z
        .preprocess((value) => {
            if (typeof value === "string") {
                return new Date(value);
            }
            return value;
        }, z.date().max(new Date(), {
            message: "Date of birth cannot be in the future.",
        })),
        email: z.string().email({
            message: "Invalid email address.",
        }),
        phoneNumber: z.string().min(10, {
            message: "Phone number must be at least 10 characters.",
        }).max(15, {
            message: "Phone number must be at most 15 characters.",
        }),
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

    const formUser = useForm<z.infer<typeof FormSchemaUser>>({
        resolver: zodResolver(FormSchemaUser),
        defaultValues: {
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
        // console.log(data)

        console.log(formUser.formState.errors)

        // Simpan data yang telah diisi
        setAllData([...allData, data]);

        handleNext()
    }
    //

    // Form Merchant
    const FormSchemaMerchant = z.object({
        typeBusinessEntity: z.enum(["Perorangan", "CV", "Koperasi", "Firma", "Perseroan Terbatas"], {
            message: "Please select the type of business entity",
        }),
        merchantName: z.string().min(2, {
            message: "Merchant name must be at least 2 characters.",
        }),
        merchantCity: z.string().min(2, {
            message: "City must be at least 2 characters.",
        }),
        merchantCategory: z.enum(["Makanan & Minuman", "Fashion & Aksesori", "Elektronik & Gadget", "Kesehatan & Kecantikan", "Rumah & Dekorasi", "Otomotif", "Hobi & Hiburan", "Jasa & Layanan", "Bahan Pokok & Grosir", "Teknologi & Digital", "Lainnya"], {
            message: "Please select the category",
        }),
        postalCode: z.string().min(5, {
            message: "Postal code must be at least 5 characters.",
        }),
        merchantAddress: z.string().min(5, {
            message: "Merchant address must be at least 5 characters.",
        }),
        phoneNumberMerchant: z.string().min(10, {
            message: "Phone number must be at least 10 characters.",
        }).max(15, {
            message: "Phone number must be at most 15 characters.",
        }),
        merchantEmail: z.string().email({
            message: "Invalid email address.",
        }),
        photo: z.union([z.instanceof(File), z.string().url()]), // Update to handle either File or URL
    })

    const formMerchant = useForm<z.infer<typeof FormSchemaMerchant>>({
        resolver: zodResolver(FormSchemaMerchant),
        defaultValues: {
            typeBusinessEntity: undefined,
            merchantName: "",
            merchantCity: undefined,
            merchantCategory: undefined,
            postalCode: "",
            merchantAddress: "",
            phoneNumberMerchant: "",
            merchantEmail: "",
            photo: undefined,
        },
    })

    const onSubmitMerchant = async (data: z.infer<typeof FormSchemaMerchant>) => {
        // Constructing the payload with the desired format
        const payload = {
            username: (allData[0] as z.infer<typeof FormSchemaUser>)?.ownerName || "Iyan",
            email: (allData[0] as z.infer<typeof FormSchemaUser>)?.email || "Iyan10@gmail.com",
            password: (allData[0] as z.infer<typeof FormSchemaUser>)?.password || "Iyan123",
            confirmPassword: (allData[0] as z.infer<typeof FormSchemaUser>)?.confirmPassword || "Iyan123",
            phoneNumber: (allData[0] as z.infer<typeof FormSchemaUser>)?.phoneNumber || "081234567999",
            gender: (allData[0] as z.infer<typeof FormSchemaUser>)?.gender || "Male",
            dateOfBirth: (allData[0] as z.infer<typeof FormSchemaUser>)?.dateOfBirth || "1990-05-15T00:00:00Z",
            merchantAddress: data.merchantAddress || "123 Street Name",
            merchantCategory: data.merchantCategory || "Retail",
            merchantCity: data.merchantCity || "Depok",
            merchantEmail: data.merchantEmail || "coba@example.com",
            merchantName: data.merchantName || "Test",
            phoneNumberMerchant: data.phoneNumberMerchant || "081234567999",
            postalCode: data.postalCode || "12378",
            typeBusinessEntity: data.typeBusinessEntity || "CV",
            merchantPin: "12345", // Merchant pin bisa diambil dari input atau didefinisikan di tempat lain
            photo: data.photo instanceof File ? data.photo : "https://via.placeholder.com/150", // Handle photo field (file or fallback URL)
        };
        console.log(payload)

        const formData = new FormData();
        formData.append("username", payload.username);
        formData.append("email", payload.email);
        formData.append("password", payload.password);
        formData.append("confirmPassword", payload.confirmPassword);
        formData.append("phone_number", payload.phoneNumber);
        formData.append("gender", payload.gender);
        formData.append("dateOfBirth", payload.dateOfBirth.toISOString().split('T')[0]);
        formData.append("merchantAddress", payload.merchantAddress);
        formData.append("merchantCategory", payload.merchantCategory);
        formData.append("merchantCity", payload.merchantCity);
        formData.append("merchantEmail", payload.merchantEmail);
        formData.append("merchantName", payload.merchantName);
        formData.append("phoneNumberMerchant", payload.phoneNumberMerchant);
        formData.append("postalCode", payload.postalCode);
        formData.append("typeBusinessEntity", payload.typeBusinessEntity);
        formData.append("merchantPin", payload.merchantPin);

        // Append photo if it's a file
        if (data.photo instanceof File) {
            formData.append("photo", data.photo);
        } else {
            formData.append("photo", payload.photo); // Fallback URL if no file
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: "POST",
                body: formData, // Sending FormData with file
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Success:", result);
            handleNext();
        } catch (error) {
            console.error("Error submitting merchant data:", error);
        }
    };

    const handleNext = () => {
        // Validasi apakah section saat ini valid (ganti logika validasi sesuai kebutuhan)
        const isCurrentSectionValid = validateSection(currentSection);

        if (isCurrentSectionValid) {
            // Tandai section saat ini sebagai true
            const updatedSections = [...section];
            updatedSections[currentSection + 1] = true;
            setSection(updatedSections);

            // Pindah ke section berikutnya jika belum di akhir
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



    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/merchant/list/provinces");
                setCities(response.data);
                console.log(response);
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {showTermsandConditions ? <TermsandCondition setShowTermsandConditions={setShowTermsandConditions} backToPageProfile={false} /> : (
                <div>
                    <div className={`${createPin ? 'hidden' : 'flex'} w-full flex-col p-10`}>
                        <p className="uppercase text-center font-semibold text-2xl">Data Personal</p>

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

                                                        <button onClick={() => setShowPassword(!showPassword)} className='absolute right-5'>{showPassword ? <EyeOff /> : <Eye />}</button>
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

                                                        <button onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className='absolute right-5'>{showPasswordConfirm ? <EyeOff /> : <Eye />}</button>
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
                                            name="merchantCity"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                                    <button className="">
                                                                        {field.value || "Se\lect City"}
                                                                    </button>
                                                                    <ChevronDown />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                className="w-full max-h-64 overflow-y-auto"
                                                                style={{ maxHeight: '256px', overflowY: 'auto' }}
                                                            >
                                                                <DropdownMenuLabel>City</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {loading ? (
                                                                    <div className="p-3">Loading...</div>
                                                                ) : (
                                                                    cities.map((city) => (
                                                                        <DropdownMenuItem
                                                                            key={city?.id}
                                                                            onSelect={() => field.onChange(city?.name)}
                                                                            className="w-full"
                                                                        >
                                                                            {city?.name}
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
                                                        <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" placeholder="Postal Code" {...field} />
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

                                        <FormField
                                            name="photo"
                                            control={formMerchant.control}
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormControl>
                                                        <input
                                                            {...field}  // Spread field props
                                                            type="file"
                                                            accept="image/*"
                                                            className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                            onChange={(e) => {
                                                                const file = e.target.files ? e.target.files[0] : null;

                                                                if (file) {
                                                                    // Validate file size (max 2MB)
                                                                    if (file.size > 2 * 1024 * 1024) {
                                                                        alert("File size exceeds 2MB.");
                                                                        return;
                                                                    }

                                                                    // Validate file type (JPEG, PNG, or GIF)
                                                                    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
                                                                    if (!validImageTypes.includes(file.type)) {
                                                                        alert("Invalid file type. Please upload an image (JPEG, PNG, or GIF).");
                                                                        return;
                                                                    }

                                                                    // If file is valid, pass it to React Hook Form
                                                                    field.onChange(file); // Pass the file to the form state
                                                                } else {
                                                                    field.onChange(null);  // Reset the field if no file is selected
                                                                }
                                                            }}
                                                            // `value` should not be directly bound to `field.value` for file input
                                                            value="" // Clear the value for file input as file input type does not accept string values
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" className={`${currentSection === 1 ? 'block' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] rounded-lg`}>SUBMIT</Button>
                                </form>
                            </Form>
                        </div>

                        <OTP currentSection={currentSection} setCreatePin={setCreatePin} />
                    </div>

                    {createPin && <PinInput email={formMerchant.getValues("merchantEmail")} />}</div>
            )}
        </div>
    )
}

export default Signup
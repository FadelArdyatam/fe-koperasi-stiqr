import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, Eye, EyeOff, Smartphone, Store, UserRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import OTP from "@/components/OTP"

const Signup = () => {
    const [section, setSection] = useState([true, false, false]);
    const [currentSection, setCurrentSection] = useState(0);
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

    const FormSchema = z.object({
        ownerName: z.string().min(2, {
            message: "ownerName must be at least 2 characters.",
        }),
        gender: z.enum(["Laki - Laki", "Perempuan"], {
            message: "Please select the gender",
        }),
        dateOfBirth: z.string().min(10, {
            message: "Date of birth must be at least 10 characters.",
        }).max(10, {
            message: "Date of birth must be at most 10 characters.",
        }),
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
        typeBusinessEntity: z.enum(["PT", "CV", "Firma", "UD"], {
            message: "Please select the type of business entity",
        }),
        merchantName: z.string().min(2, {
            message: "Merchant name must be at least 2 characters.",
        }),
        merchantCity: z.enum(["Jakarta", "Bandung", "Surabaya"], {
            message: "Please select the city",
        }),
        merchantCategory: z.enum(["Fashion", "Food", "Electronics"], {
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
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'], // Fokuskan error pada confirmPassword
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            ownerName: "",
            gender: undefined,
            dateOfBirth: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
            typeBusinessEntity: undefined,
            merchantName: "",
            merchantCity: undefined,
            merchantCategory: undefined,
            postalCode: "",
            merchantAddress: "",
            phoneNumberMerchant: "",
            merchantEmail: "",
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data)

        handleNext()
    }

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
        return true;
    };

    return (
        <div className="w-full flex flex-col p-10">
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className={`${currentSection === 0 ? 'block' : 'hidden'} flex flex-col items-end w-full md:w-2/3 space-y-7`}>
                            <FormField
                                control={form.control}
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
                                control={form.control}
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
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="date" {...field} />
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
                                control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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

                        <div className={`${currentSection === 1 ? 'block' : 'hidden'} flex flex-col items-end w-full md:w-2/3 space-y-7`}>
                            <FormField
                                control={form.control}
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
                                                    <DropdownMenuItem onSelect={() => field.onChange("PT")} className="w-full">PT</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("CV")} className="w-full">CV</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("Firma")} className="w-full">Firma</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("UD")} className="w-full">UD</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="merchantCity"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                        <button className="">
                                                            {field.value || "Select City"} {/* Display selected value */}
                                                        </button>

                                                        <ChevronDown />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-full">
                                                    <DropdownMenuLabel>City</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => field.onChange("Jakarta")} className="w-full">Jakarta</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("Bandung")} className="w-full">Bandung</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("Surabaya")} className="w-full">Surabaya</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
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
                                                    <DropdownMenuItem onSelect={() => field.onChange("Fashion")} className="w-full">Fashion</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("Food")} className="w-full">Food</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => field.onChange("Electronics")} className="w-full">Electronics</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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

                        <Button onClick={handleNext} className={`${currentSection === 0 ? 'block' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] rounded-lg`}>NEXT</Button>

                        <Button type="submit" className={`${currentSection === 1 ? 'block' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] rounded-lg`}>SUBMIT</Button>
                    </form>
                </Form>
            </div>

            <OTP currentSection={currentSection} />
        </div>
    )
}

export default Signup
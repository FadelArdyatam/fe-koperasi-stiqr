import { Button } from "@/components/ui/button"
import { Check, ChevronDown, ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import axiosInstance from "@/hooks/axiosInstance"


interface MerchantData {
  id: number;
  name: string;
  category: "Makanan & Minuman"| "Fashion & Aksesori"| "Elektronik & Gadget"| "Kesehatan & Kecantikan"| "Rumah & Dekorasi"| "Otomotif"| "Hobi & Hiburan"| "Jasa & Layanan"| "Bahan Pokok & Grosir"|"Teknologi & Digital"|"Lainnya"; 
  phone_number: string;
  address: string;
  post_code: string;
  province: string;
  regency: string;
  district: string;
  village: string;
}
const DataMerchant = () => {
    const [showEdit, setShowEdit] = useState(false)
    const [showNotification, setShowNotification] = useState(false)
    const [merchantData, setMerchantData] = useState<MerchantData>();

    const FormSchema = z.object({
        merchantName: z.string().min(2, {
            message: "Merchant name must be at least 2 characters.",
        }),
        merchantCategory: z.enum(["Makanan & Minuman", "Fashion & Aksesori", "Elektronik & Gadget", "Kesehatan & Kecantikan", "Rumah & Dekorasi", "Otomotif", "Hobi & Hiburan", "Jasa & Layanan", "Bahan Pokok & Grosir", "Teknologi & Digital", "Lainnya"], {
            message: "Please select the category",
        }),
        merchantProvince: z.string().min(2, {
            message: "Province must be at least 2 characters.",
        }),
        merchantRegency: z.string().min(2, {
            message: "Regency must be at least 2 characters.",
        }),
        merchantDistrict: z.string().min(2, {
            message: "District must be at least 2 characters.",
        }),
        merchantVillage: z.string().min(2, {
            message: "Village must be at least 2 characters.",
        }),
        phoneNumberMerchant: z.string().min(10, {
            message: "Phone number must be at least 10 characters.",
        }).max(15, {
            message: "Phone number must be at most 15 characters.",
        }),
        merchantAddress: z.string().min(5, {
            message: "Merchant address must be at least 5 characters.",
        }),
        postalCode: z.string().min(5, {
            message: "Postal code must be at least 5 characters.",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            merchantName: '',
            merchantCategory: undefined,
            merchantProvince: undefined,
            merchantRegency: undefined,
            merchantDistrict: undefined,
            merchantVillage: undefined,
            phoneNumberMerchant: '',
            merchantAddress: '',
            postalCode: '',
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const response = await axiosInstance.put(`/merchant/${merchantData?.id}/update`, {
                name: data.merchantName,
                category: data.merchantCategory,
                province: data.merchantProvince,
                regency: data.merchantRegency,
                district: data.merchantDistrict,
                village: data.merchantVillage,
                phone_number: data.phoneNumberMerchant,
                address: data.merchantAddress,
                post_code: data.postalCode,
            });
            console.log("Data merchant berhasil diubah:", response.data);
            setShowNotification(true)
        } catch (error: any) {
            console.log(error)
        }
    }

    const [isUpdate, setIsUpdate] = useState(false)

    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;

        const fetchMerchant = async () => {
            try {
                const response = await axiosInstance.get(
                    `/merchant/${userData?.merchant?.id}`,
                );
                setMerchantData(response.data[0]);
            } catch (err) {
                console.error("Error saat mengambil data merchant:", err);
            }
        };

        fetchMerchant();
    }, [isUpdate]);

    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/merchant/list/provinces");
                setCities(response.data);
            } catch (error:any) {
                console.error("Error fetching cities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEditClick = () => {
        if (merchantData) {
            form.setValue("merchantName", merchantData.name);
            form.setValue("merchantCategory", merchantData.category);
            form.setValue("merchantProvince", merchantData.province);
            form.setValue("merchantRegency", merchantData.regency);
            form.setValue("merchantDistrict", merchantData.district);
            form.setValue("merchantVillage", merchantData.village);
            form.setValue("phoneNumberMerchant", merchantData.phone_number);
            form.setValue("merchantAddress", merchantData.address);
            form.setValue("postalCode", merchantData.post_code);
        }
        setIsUpdate(false)
        setShowEdit(true);
    };

    const handleBack = () => {
        setShowEdit(false);
        setShowNotification(false);
        setIsUpdate(true)
    }

    return (
        <>
            <div className={`${showEdit ? 'hidden' : 'flex'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>

                    <p className='font-semibold m-auto text-xl text-white text-center'>Data Merchant</p>
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

                <div className="bg-white w-[90%] -translate-y-20 p-5 flex flex-col items-center gap-5 rounded-lg shadow-lg z-0 mb-10">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-sm text-gray-500">Nama Merchant</p>

                        <p className="text-sm font-semibold">{merchantData?.name}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Kategori Merchant</p>

                        <p className="text-sm font-semibold">{merchantData?.category}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Provinsi Merchant</p>

                        <p className="text-sm font-semibold">{merchantData?.province}</p>
                    </div>
                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Kota Merchant</p>

                        <p className="text-sm font-semibold">{merchantData?.regency}</p>
                    </div>
                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>


                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Kecamatan Merchant</p>

                        <p className="text-sm font-semibold">{merchantData?.district}</p>
                    </div>
                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Kelurahan Merchant</p>

                        <p className="text-sm font-semibold">{merchantData?.village}</p>
                    </div>
                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">No Hp</p>

                        <p className="text-sm font-semibold">{merchantData?.phone_number}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Alamat</p>

                        <p className="text-sm font-semibold">{merchantData?.address}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Kode Pos</p>

                        <p className="text-sm font-semibold">{merchantData?.post_code}</p>
                    </div>
                </div>

                <Button onClick={handleEditClick} className="w-[90%] block bg-green-400 -mt-12">Edit</Button>
            </div>

            <div className={`${showEdit ? 'flex' : 'hidden'} w-full flex-col min-h-screen items-center`}>
                <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                    <button onClick={() => setShowEdit(false)} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </button>

                    <p className='font-semibold m-auto text-xl text-white text-center'>Edit Data Merchant</p>
                </div>

                <div className="w-[90%] bg-white shadow-lg rounded-lg p-5 -translate-y-20">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className={'flex flex-col items-end w-full md:w-2/3 space-y-7'}>
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
                                                    <DropdownMenuContent className="w-full bg-white shadow-lg p-5 rounded-lg flex flex-col gap-4">
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
                                    control={form.control}
                                    name="merchantProvince"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormControl>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <div className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                            <button className="">
                                                                {field.value || "Select City"}
                                                            </button>
                                                            <ChevronDown />
                                                        </div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-full bg-white shadow-lg p-5 rounded-lg flex flex-col gap-4">
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

export default DataMerchant
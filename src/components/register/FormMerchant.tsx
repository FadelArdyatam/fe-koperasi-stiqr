
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

import { UseFormReturn } from 'react-hook-form';
import mccList from '@/data/mcc.json'
import { useState, useRef, useEffect } from "react";

interface MerchantFormValues {
    formMerchant: UseFormReturn<any>;
    isSubmitting: boolean;
    currentSection: number;
    onSubmitMerchant: (data: any) => void;
    setCurrentSection: (section: number) => void;
    loading: boolean;
    area: {
        provinces: { id: number; name: string }[];
        regencies: { id: number; province_id: string, name: string }[];
        districts: { id: number; regency_id: string, name: string }[];
        villages: { id: number; district_id: string, name: string }[];
    };
    selectedProvince: number | null;
    setSelectedProvince: (val: number | null) => void;
    selectedRegency: number | null;
    setSelectedRegency: (val: number | null) => void;
    selectedDistrict: number | null;
    setSelectedDistrict: (val: number | null) => void;
    setOpenSearch: (open: boolean) => void;
    openSearch: boolean;
    mcc: { code: string; name: string };
    setMcc: (mcc: { code: string; name: string }) => void;
}

export const FormMerchant = ({
    isSubmitting,
    currentSection,
    formMerchant,
    onSubmitMerchant,
    setCurrentSection,
    loading,
    area: { provinces, regencies, districts, villages },
    selectedProvince,
    setSelectedProvince,
    selectedRegency,
    setSelectedRegency,
    selectedDistrict,
    setSelectedDistrict,
    openSearch,
    setOpenSearch,
    mcc,
    setMcc,
}: MerchantFormValues) => {
    const [menuWidth, setMenuWidth] = useState<number | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (triggerRef.current) {
            setMenuWidth(triggerRef.current.offsetWidth);
        }
    }, []);

    return (
        <Form {...formMerchant}>
            <form onSubmit={formMerchant.handleSubmit(onSubmitMerchant)}>
                <div className={`${currentSection === 1 ? 'block' : 'hidden'} flex flex-col items-end w-full space-y-7`}>
                    <FormField
                        control={formMerchant.control}
                        name="typeBusinessEntity"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div>
                                                <p className="font-semibold text-black">Tipe Usaha</p>

                                                <div
                                                    ref={triggerRef}
                                                    className="p-3 mt-2 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between cursor-pointer"
                                                >
                                                    <span>{field.value || "Tipe Usaha"}</span>
                                                    <ChevronDown />
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="start"
                                            style={{ width: menuWidth ?? "auto" }}
                                            className="p-0"
                                        >
                                            <DropdownMenuSeparator />
                                            {["Perorangan", "CV", "Koperasi", "Firma", "Perseroan Terbatas"].map((item) => (
                                                <DropdownMenuItem
                                                    key={item}
                                                    onSelect={() => field.onChange(item)}
                                                    className="w-full"
                                                >
                                                    {item}
                                                </DropdownMenuItem>
                                            ))}
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
                                <FormControl className="flex gap-3">
                                    <div className="flex flex-col w-full">
                                        <p className="font-semibold text-start text-black">Nama Usaha</p>

                                        <Input
                                            className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                            placeholder="Nama Usaha"
                                            {...field}
                                            onChange={(e) => {
                                                const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                                field.onChange(onlyLetters);
                                            }}
                                        />
                                    </div>
                                </FormControl>

                                <p className="text-sm text-gray-500 italic">
                                    *Nama Usaha adalah Nama yang akan di tampilkan di QRIS Anda
                                </p>

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
                                    <Popover open={openSearch} onOpenChange={setOpenSearch}>
                                        <PopoverTrigger asChild>
                                            <div>
                                                <p className="font-semibold text-black">Pilih Kategori Usaha</p>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openSearch}
                                                    className="w-full mt-2 bg-[#F4F4F4] justify-between border border-gray-300 rounded-lg"
                                                >
                                                    {mcc.name || "Pilih Kategori Usaha"}
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </div>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            className="w-[var(--radix-popper-anchor-width)] p-0 border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            align="start"
                                        >
                                            <Command className="w-full">
                                                <CommandInput
                                                    placeholder="Cari kategori usaha..."
                                                    className="h-9 px-4 border-b border-gray-200 focus:outline-none"
                                                />

                                                <CommandList className="max-h-60 overflow-y-auto">
                                                    <CommandEmpty className="p-3 text-gray-500">
                                                        Tidak ditemukan.
                                                    </CommandEmpty>

                                                    <CommandGroup>
                                                        {mccList.map((item, index) => (
                                                            <CommandItem
                                                                key={index}
                                                                onSelect={() => {
                                                                    setMcc({ code: item.mcc_code, name: item.mcc_name });
                                                                    field.onChange(item.mcc_name); // bisa juga simpan kode kalau perlu
                                                                    setOpenSearch(false);
                                                                    console.log("Selected MCC:", item.mcc_name);
                                                                }}
                                                                className="cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-md transition"
                                                            >
                                                                {item.mcc_name} ({item.mcc_code})
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-5 w-full">
                        <FormField
                            control={formMerchant.control}
                            name="rt_number"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div>
                                            <p className="font-semibold text-black">RT</p>
                                            <Input
                                                className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                                placeholder="RT Sesuai Alamat"
                                                {...field}
                                                onChange={(e) => {
                                                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 3);
                                                    field.onChange(onlyDigits);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={formMerchant.control}
                            name="rw_number"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <div>
                                            <p className="font-semibold text-black">RW</p>
                                            <Input
                                                className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                                placeholder="RW Sesuai Alamat"
                                                {...field}
                                                onChange={(e) => {
                                                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 3);
                                                    field.onChange(onlyDigits);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={formMerchant.control}
                        name="block_number"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div>
                                        <p className="font-semibold text-black">Nomor/Blok Tempat Usaha</p>

                                        <Input className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold" placeholder="Nomor/Blok Tempat Usaha" {...field} />
                                    </div>
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
                                    <div>
                                        <p className="font-semibold text-black">Alamat Usaha</p>

                                        <Input className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold" placeholder="Alamat Usaha" {...field} />
                                    </div>
                                </FormControl>

                                <p className="text-sm text-gray-500 italic">*Jika tidak ada Toko Fisik, Anda dapat mengisi alamat sesuai KTP</p>

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
                                            <div>
                                                <p className="font-semibold text-black">Pilih Provinsi</p>

                                                <div
                                                    ref={triggerRef}
                                                    className="p-3 mt-2 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between cursor-pointer"
                                                >
                                                    <span>{field.value || "Pilih Provinsi"}</span>
                                                    <ChevronDown />
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="start"
                                            style={{ width: menuWidth ?? "auto" }}
                                            className="max-h-64 overflow-y-auto p-0 z-50"
                                        >
                                            {loading ? (
                                                <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
                                            ) : (
                                                provinces.map((province) => (
                                                    <DropdownMenuItem
                                                        key={province.id}
                                                        onSelect={() => {
                                                            field.onChange(province.name); // Simpan nama provinsi
                                                            setSelectedProvince(province.id); // Simpan ID untuk kebutuhan API lanjutan
                                                            // Reset field turunan
                                                            formMerchant.setValue('merchantRegency', '');
                                                            formMerchant.setValue('merchantDistrict', '');
                                                            formMerchant.setValue('merchantVillage', '');
                                                            setSelectedRegency(null);
                                                            setSelectedDistrict(null);
                                                        }}
                                                        className="w-full"
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
                                            <div>
                                                <p className="font-semibold text-black">Pilih Kota/Kabupaten</p>

                                                <div
                                                    ref={triggerRef}
                                                    className={`p-3 mt-2 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4] cursor-pointer ${!selectedProvince ? "opacity-50 cursor-not-allowed" : ""
                                                        }`}
                                                >
                                                    <span className="w-full text-left">
                                                        {field.value || "Pilih Kota"}
                                                    </span>
                                                    <ChevronDown />
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>

                                        {selectedProvince && (
                                            <DropdownMenuContent
                                                align="start"
                                                style={{ width: menuWidth ?? "auto" }}
                                                className="max-h-64 overflow-y-auto p-0 z-50"
                                            >
                                                {loading ? (
                                                    <div className="px-4 py-2 text-sm text-muted-foreground">
                                                        Loading...
                                                    </div>
                                                ) : (
                                                    regencies.map((regency) => (
                                                        <DropdownMenuItem
                                                            key={regency.id}
                                                            onSelect={() => {
                                                                field.onChange(regency.name);
                                                                setSelectedRegency(regency.id);
                                                                formMerchant.setValue("merchantDistrict", "");
                                                                formMerchant.setValue("merchantVillage", "");
                                                                setSelectedDistrict(null);
                                                            }}
                                                            className="w-full"
                                                        >
                                                            {regency.name}
                                                        </DropdownMenuItem>
                                                    ))
                                                )}
                                            </DropdownMenuContent>
                                        )}
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
                                            <div>
                                                <p className="font-semibold text-black">Pilih Kecamatan</p>

                                                <div
                                                    ref={triggerRef}
                                                    className={`p-3 mt-2 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4] cursor-pointer ${!selectedRegency ? "opacity-50 cursor-not-allowed" : ""
                                                        }`}
                                                >
                                                    <span className="w-full text-left">
                                                        {field.value || "Pilih Kecamatan"}
                                                    </span>
                                                    <ChevronDown />
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>

                                        {selectedRegency && (
                                            <DropdownMenuContent
                                                align="start"
                                                style={{ width: menuWidth ?? "auto" }}
                                                className="max-h-64 overflow-y-auto p-0 z-50"
                                            >
                                                {loading ? (
                                                    <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
                                                ) : (
                                                    districts.map((district) => (
                                                        <DropdownMenuItem
                                                            key={district.id}
                                                            onSelect={() => {
                                                                field.onChange(district.name);
                                                                setSelectedDistrict(district.id);
                                                                formMerchant.setValue("merchantVillage", "");
                                                            }}
                                                            className="w-full"
                                                        >
                                                            {district.name}
                                                        </DropdownMenuItem>
                                                    ))
                                                )}
                                            </DropdownMenuContent>
                                        )}
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
                                            <div>
                                                <p className="font-semibold text-black">Pilih Kelurahan/Desa</p>

                                                <div
                                                    ref={triggerRef}
                                                    className={`p-3 mt-2 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4] cursor-pointer ${!selectedDistrict ? "opacity-50 cursor-not-allowed" : ""
                                                        }`}
                                                >
                                                    <span className="w-full text-left">
                                                        {field.value || "Pilih Kelurahan"}
                                                    </span>
                                                    <ChevronDown />
                                                </div>
                                            </div>
                                        </DropdownMenuTrigger>

                                        {selectedDistrict && (
                                            <DropdownMenuContent
                                                align="start"
                                                style={{ width: menuWidth ?? "auto" }}
                                                className="max-h-64 overflow-y-auto p-0 z-50"
                                            >
                                                {loading ? (
                                                    <div className="px-4 py-2 text-sm text-muted-foreground">
                                                        Loading...
                                                    </div>
                                                ) : (
                                                    villages.map((village) => (
                                                        <DropdownMenuItem
                                                            key={village.id}
                                                            onSelect={() => {
                                                                field.onChange(village.name);
                                                            }}
                                                            className="w-full"
                                                        >
                                                            {village.name}
                                                        </DropdownMenuItem>
                                                    ))
                                                )}
                                            </DropdownMenuContent>
                                        )}
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
                                    <div>
                                        <p className="font-semibold text-black">Kode Pos</p>

                                        <Input
                                            className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                            type="number"
                                            placeholder="Kode Pos"
                                            {...field}
                                            onInput={(e) => {
                                                const value = (e.target as HTMLInputElement).value;
                                                if (value.length > 5) {
                                                    (e.target as HTMLInputElement).value = value.slice(0, 5); // Limit to 5 digits
                                                }
                                            }}
                                        />
                                    </div>
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
                                    <div>
                                        <p className="font-semibold text-black">Nomor HP Merchant</p>

                                        <Input
                                            className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                            type="tel"
                                            placeholder="0812..."
                                            {...field}
                                            onChange={(e) => {
                                                // Validasi manual untuk panjang dan hanya angka
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                                                field.onChange(value);
                                            }}
                                        />
                                    </div>
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
                                    <div>
                                        <p className="font-semibold text-black">Email Merchant</p>

                                        <Input
                                            className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                            placeholder="Email Merchant"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-center w-full justify-between gap-5">
                    <Button type="button" onClick={() => { setCurrentSection(0) }} className={`${currentSection === 1 ? 'flex' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-orange-400 hover:bg-orange-400 rounded-lg`}> <ChevronLeft /> Kembali</Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${currentSection === 1 ? 'flex' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] hover:bg-[#7ED321] rounded-lg `}>  Selanjutnya <ChevronRight /> </Button>
                </div>
            </form>
        </Form >)
}

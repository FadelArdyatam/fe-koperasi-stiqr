
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
import { ChevronDown, ChevronLeft, ChevronsUpDown, Save } from 'lucide-react';

import { UseFormReturn } from 'react-hook-form';
import mccList from '@/data/mcc.json'


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
                                            <div data-aos="fade-up" className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                <button className="">
                                                    {field.value || "Tipe Usaha"} {/* Display selected value */}
                                                </button>

                                                <ChevronDown />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full sm:min-w-[600px] min-w-max">
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
                                <FormControl className="flex items-center gap-3">
                                    <Input data-aos="fade-up" data-aos-delay="100" className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Nama Usaha" {...field} />
                                </FormControl>

                                <p className="text-sm text-gray-500 italic">*Nama Usaha adalah Nama yang akan di tampilkan di QRIS Anda</p>

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
                                            <Button
                                                type="button"
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openSearch}
                                                className="w-full bg-[#F4F4F4] justify-between border border-gray-300 rounded-lg"
                                            >
                                                {mcc.name || "Pilih Kategori Usaha"}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
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
                                        <Input data-aos="fade-up" className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="RT Sesuai Alamat" {...field} />
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
                                        <Input data-aos="fade-up" className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="RW Sesuai Alamat" {...field} />
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
                                    <Input data-aos="fade-up" className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Nomor/Blok Tempat Usaha" {...field} />
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
                                    <Input data-aos="fade-up" className="w-full bg-[#F4F4F4] font-sans font-semibold" placeholder="Alamat Usaha" {...field} />
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
                                            <div data-aos="fade-up" data-aos-delay="200" className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between">
                                                <button type="button">
                                                    {field.value || "Pilih Provinsi"}
                                                </button>
                                                <ChevronDown />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full sm:min-w-[600px] min-w-max max-h-64 overflow-y-auto">
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
                                            <div
                                                data-aos="fade-up" data-aos-delay="300"
                                                className={`p-3 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4]`}
                                            >
                                                <button
                                                    disabled={!selectedProvince}
                                                    className="w-full text-left"
                                                    type="button"
                                                    style={{ pointerEvents: !selectedProvince ? "none" : "auto" }}
                                                >
                                                    {field.value || "Pilih Kota"}
                                                </button>
                                                <ChevronDown />
                                            </div>
                                        </DropdownMenuTrigger>
                                        {selectedProvince && (
                                            <DropdownMenuContent className="w-full sm:min-w-[600px] min-w-max max-h-64 overflow-y-auto">
                                                {loading ? (
                                                    <div>Loading...</div>
                                                ) : (
                                                    regencies.map((regency) => (
                                                        <DropdownMenuItem
                                                            key={regency.id}
                                                            onSelect={() => {
                                                                field.onChange(regency.name);
                                                                setSelectedRegency(regency.id);
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
                                            <div
                                                data-aos="fade-up" data-aos-delay="400"
                                                className={`p-3 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4]`}
                                            >
                                                <button
                                                    disabled={!selectedRegency}
                                                    className="w-full text-left"
                                                    type="button"
                                                    style={{ pointerEvents: !selectedRegency ? "none" : "auto" }}
                                                >
                                                    {field.value || "Pilih Kecamatan"}
                                                </button>
                                                <ChevronDown />
                                            </div>
                                        </DropdownMenuTrigger>
                                        {selectedRegency && (
                                            <DropdownMenuContent className="w-full sm:min-w-[600px] min-w-max max-h-64 overflow-y-auto">
                                                {loading ? (
                                                    <div>Loading...</div>
                                                ) : (
                                                    districts.map((district) => (
                                                        <DropdownMenuItem
                                                            key={district.id}
                                                            onSelect={() => {
                                                                field.onChange(district.name);
                                                                setSelectedDistrict(district.id);
                                                                formMerchant.setValue('merchantVillage', '');
                                                            }}
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
                                            <div
                                                data-aos="fade-up" data-aos-delay="500"
                                                className={`p-3 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4]`}
                                            >
                                                <button
                                                    disabled={!selectedDistrict}
                                                    className="w-full text-left"
                                                    type="button"
                                                    style={{ pointerEvents: !selectedDistrict ? "none" : "auto" }}

                                                >
                                                    {field.value || "Pilih Kelurahan"}
                                                </button>
                                                <ChevronDown />
                                            </div>
                                        </DropdownMenuTrigger>
                                        {selectedDistrict && ( // Render menu content only if `selectedDistrict` is valid
                                            <DropdownMenuContent className="w-full sm:min-w-[600px] min-w-max max-h-64 overflow-y-auto">
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
                                    <Input
                                        data-aos="fade-up"
                                        className="w-full bg-[#F4F4F4] font-sans font-semibold"
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
                                    <Input
                                        data-aos="fade-up"
                                        className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                        type="tel"
                                        placeholder="0812..."
                                        {...field}
                                        onChange={(e) => {
                                            // Validasi manual untuk panjang dan hanya angka
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                                            field.onChange(value);
                                        }}
                                    />
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
                                    <Input
                                        data-aos="fade-up"
                                        className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                        placeholder="Email Merchant"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div data-aos="fade-up" className="flex items-center w-full justify-between gap-5">
                    <Button type="button" onClick={() => { setCurrentSection(0) }} className={`${currentSection === 1 ? 'flex' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-orange-400 hover:bg-orange-400 rounded-lg`}> <ChevronLeft /> Kembali</Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={`${currentSection === 1 ? 'flex' : 'hidden'} w-full md:w-max mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] hover:bg-[#7ED321] rounded-lg `}> <Save /> Kirim </Button>
                </div>
            </form>
        </Form>)
}

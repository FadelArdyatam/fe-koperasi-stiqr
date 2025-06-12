import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';


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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, Info, Save } from 'lucide-react';
import { Switch } from '../ui/switch';

interface FormPengajuanQrisProps {
    formSubmissionQRIS: UseFormReturn<any>;
    onSubmitSubmissionQRIS: (data: any) => void;
    currentSection: number;
    setCurrentSection: (section: number) => void;
    setShowNotification: (show: boolean) => void;
    setErrorMessage: (message: string) => void;
    isSubmitting: boolean;
    merchant_type: string;
    setUpdateDoc: any;
    updateDoc: any;
}

const omsetPerDays = [
    "< Rp. 800,000",
    "Rp. 800,001 - Rp. 6.500.000",
    "Rp. 6,500,001 - Rp. 135,000,000",
    "> Rp. 135.000.001"
];
const omsetPerYear = [
    "< 300 Juta",
    "> 300 Juta - 2,5 Milyar",
    "> 2,5 Milyar - 50 Milyar",
    "> 50 Milyar"
];


export const FormPengajuanQris: React.FC<FormPengajuanQrisProps> = ({
    formSubmissionQRIS,
    onSubmitSubmissionQRIS,
    currentSection,
    setCurrentSection,
    setShowNotification,
    setErrorMessage,
    isSubmitting,
    merchant_type,
    setUpdateDoc,
    updateDoc
}) => {
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string }>({});

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: any,
        fieldName: string,
        name: string
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setShowNotification(true);
                setErrorMessage(`File ${fieldName} tidak boleh lebih dari 5MB.`);
                e.target.value = '';
                return;
            }

            const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                setShowNotification(true);
                setErrorMessage(`Tipe File ${fieldName} tidak valid. Silakan unggah PNG, JPEG, JPG, GIF, atau PDF.`);
                e.target.value = '';
                return;
            }

            // Simpan ke Form + tandai sebagai "sudah dipilih"
            field.onChange(file);
            setSelectedFiles((prev) => ({
                ...prev,
                [name]: file.name
            }));
        } else {
            field.onChange(null);
            setSelectedFiles((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const FileInput = ({
        name,
        label,
        selectedFiles,
        handleFileChange
    }: {
        name: string,
        label: string,
        selectedFiles: { [key: string]: string },
        handleFileChange: (
            e: React.ChangeEvent<HTMLInputElement>,
            field: any,
            fieldName: string,
            name: string
        ) => void
    }) => {
        return (
            <FormField
                control={formSubmissionQRIS.control}
                name={name}
                render={({ field }) => (
                    <FormItem className="w-full">
                        <p className="font-semibold">{label}</p>
                        <p className="mt-2 text-sm">
                            Unggah foto {label} Anda dalam format PNG, JPEG, JPG, GIF, atau PDF dengan ukuran maksimal 5 MB.{" "}
                            <span className="font-semibold">Pastikan foto terlihat jelas secara keseluruhan</span>
                        </p>
                        {
                            name == 'bussiness_photo' && (
                                <p className='font-semibold text-sm text-red-600'>*Wajib menggunakan aplikasi <a className='underline' target="_blank" href="https://play.google.com/store/apps/details?id=com.gpsmapcamera.geotagginglocationonphoto">geotagging</a></p>
                            )
                        }
                        {
                            merchant_type == 'Perorangan' && name == 'nib' && (
                                <p className='font-semibold text-sm text-red-600'>*Jika ada, wajib   disertakan</p>
                            )
                        }
                        <FormControl>
                            <input
                                className="p-2 w-full border border-orange-500 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/gif,application/pdf"
                                onChange={(e) => handleFileChange(e, field, label, name)}
                            />
                        </FormControl>

                        {selectedFiles[name] && (
                            <p className="text-green-600 text-sm mt-1">✅ {label} Berhasil diunggah</p>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    const DokumenAttachment = () => {
        if (merchant_type === 'Perorangan') {
            return (
                <>
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="ktp" label="KTP" />
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="nib" label="NIB" />
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="bussiness_photo" label="Foto Tempat Usaha" />
                </>
            )
        } else {
            return (
                <>
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="deed_doc" label="Akta Pendirian" />

                    <div className="flex gap-3 flex-col text-orange">
                        <label className="text-sm">Apakah ada Perubahan Akta Pendirian?</label>
                        <div className='flex gap-3 flex-row'>
                            <span>Tidak</span>
                            <Switch color='#f97316' checked={updateDoc.is_update_deed_doc}
                                onCheckedChange={(checked) =>
                                    setUpdateDoc((prev: any) => ({
                                        ...prev,
                                        is_update_deed_doc: checked
                                    }))
                                } />
                            <span>Ya</span>
                        </div>
                    </div>

                    {updateDoc.is_update_deed_doc && (
                        <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="deed_update_doc" label="Perubahan Akta Pendirian" />
                    )}

                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="legal_doc" label="SK Kemenkumham Pendirian" />

                    <div className="flex gap-3 flex-col">
                        <label className="text-sm">Apakah ada Perubahan SK Kemenkumham Pendirian?</label>
                        <div className='flex gap-3 flex-row'>
                            <span>Tidak</span>
                            <Switch color='#f97316' checked={updateDoc.is_update_legal_doc} onCheckedChange={(checked) =>
                                setUpdateDoc((prev: any) => ({
                                    ...prev,
                                    is_update_legal_doc: checked
                                }))
                            } />
                            <span>Ya</span>
                        </div>
                    </div>

                    {updateDoc.is_update_legal_doc && (
                        <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles}
                            name="legal_update_doc"
                            label="Perubahan SK Kemenkumham Pendirian"
                        />
                    )}

                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="nib" label="NIB" />
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="ktp" label="KTP" />
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="npwp" label="NPWP" />
                    <FileInput handleFileChange={handleFileChange} selectedFiles={selectedFiles} name="bussiness_photo" label="Foto Tempat Usaha" />
                </>

            );
        }
    }

    return (
        <>
            {
                currentSection == 2 && (
                    <div className="flex items-center justify-between gap-3 p-4 -mt-10 mb-10 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 min-w-5 h-5 text-blue-500" />

                            <p className="text-sm text-black">
                                Proses pengajuan QRIS memerlukan waktu 2 hingga 4 hari kerja.
                            </p>
                        </div>
                    </div>
                )
            }
            <Form {...formSubmissionQRIS}>
                <form onSubmit={formSubmissionQRIS.handleSubmit(onSubmitSubmissionQRIS)}>
                    <div className={`${currentSection === 2 ? 'block' : 'hidden'} flex flex-col items-start w-full space-y-7`}>
                        <p className="font-semibold text-xl text-orange-500">Kategori Usaha Berdasarkan Omzet Pertahun</p>

                        <FormField
                            control={formSubmissionQRIS.control}
                            name="annual_revenue"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" data-aos="fade-up" data-aos-delay="600" className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between text-left h-auto">
                                                    <span className="flex-1 truncate">
                                                        {field.value || "Omzet /tahun"}
                                                    </span>
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuSeparator />
                                                {omsetPerYear.map(option => (
                                                    <DropdownMenuItem key={option} onSelect={() => field.onChange(option)}>
                                                        {option}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <p className="font-semibold text-xl text-orange-500">Kelengkapan Dokumen Usaha</p>
                        {DokumenAttachment()}

                        <FormField
                            control={formSubmissionQRIS.control}
                            name="daily_income"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" data-aos="fade-up" data-aos-delay="600" className="p-3 bg-[#F4F4F4] font-sans font-semibold flex items-center w-full justify-between text-left h-auto">
                                                    <span className="flex-1 truncate">
                                                        {field.value || "Rata-rata total pendapatan per hari"}
                                                    </span>
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuSeparator />
                                                {/* These options should ideally be income ranges, not business categories */}
                                                {omsetPerDays.map(option => (
                                                    <DropdownMenuItem key={option} onSelect={() => field.onChange(option)}>
                                                        {option}
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
                            control={formSubmissionQRIS.control}
                            name="daily_transaction"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Input
                                            data-aos="fade-up"
                                            className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                            type="number"
                                            placeholder="Rata-rata Total Transaksi per Hari"
                                            {...field}
                                            onInput={(e) => {
                                                let value = (e.target as HTMLInputElement).value;

                                                value = value.replace(/[^0-9]/g, '');
                                                if (value.length > 7) {
                                                    (e.target as HTMLInputElement).value = value.slice(0, 10);
                                                } else {
                                                    (e.target as HTMLInputElement).value = value;
                                                }
                                                field.onChange(value ? parseInt(value) : '');
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div data-aos="fade-up" className="flex items-center w-full justify-between gap-5">
                        <Button
                            type="button"
                            onClick={() => setCurrentSection(1)}
                            className={`${currentSection === 2 ? 'flex' : 'hidden'} w-full md:w-auto mt-10 px-5 py-3 font-sans font-semibold bg-orange-400 hover:bg-orange-500 text-white rounded-lg items-center`}
                        >
                            <ChevronLeft className="mr-2 h-5 w-5" /> Kembali
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${currentSection === 2 ? 'flex' : 'hidden'} w-full md:w-auto mt-10 px-5 py-3 font-sans font-semibold bg-[#7ED321] hover:bg-[#68b317] text-white rounded-lg items-center`}
                        >
                            <Save className="mr-2 h-5 w-5" /> {isSubmitting ? 'Tunggu...' : 'Simpan & Ajukan'}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
};

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronRight, Eye, EyeOff } from "lucide-react";

import { UseFormReturn } from 'react-hook-form';
import { Calendar } from "../ui/calendar";
import { useState, useRef, useEffect } from "react";

interface FormPersonalProps {
    formUser: UseFormReturn<any>;
    currentSection: number;
    onSubmitUser: (data: any) => void;
    setShowNotification: (show: boolean) => void;
    setErrorMessage: (message: string) => void;
    isPhotoUploaded: boolean;
    setIsPhotoUploaded: (status: boolean) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    showPasswordConfirm: boolean;
    setShowPasswordConfirm: (show: boolean) => void;
}

export const FormPersonal = ({
    formUser,
    currentSection,
    onSubmitUser,
    setShowNotification,
    setErrorMessage,
    isPhotoUploaded,
    setIsPhotoUploaded,
    showPassword,
    setShowPassword,
    showPasswordConfirm,
    setShowPasswordConfirm
}: FormPersonalProps) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        }

        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCalendar]);

    function parseLocalDate(dateString: string) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day); // Timezone lokal, tanpa offset UTC
    }

    // Validasi password
    const password = formUser.watch("password");

    const isMinLength = password?.length >= 8;
    const hasNumber = /\d/.test(password || "");
    const hasUppercase = /[A-Z]/.test(password || "");
    const hasSpecialChar = /[@#$%^&*!_]/.test(password || "");
    //

    return (
        <Form {...formUser}>
            <form onSubmit={formUser.handleSubmit(onSubmitUser)}>
                <div className={`${currentSection === 0 ? 'block' : 'hidden'} flex flex-col items-end w-full space-y-7`}>
                    <FormField
                        control={formUser.control}
                        name="ownerName"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div>
                                        <p className="font-semibold text-black">Nama Pemilik</p>

                                        <Input
                                            data-aos="fade-up"
                                            className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                            placeholder="Nama Pemilik"
                                            {...field}
                                            onChange={(e) => {
                                                const onlyLettersAndSpace = e.target.value
                                                    .replace(/[^a-zA-Z\s]/g, '') // hanya huruf dan spasi
                                                    .replace(/\b\w/g, (char) => char.toUpperCase()) // kapitalisasi awal kata
                                                    .slice(0, 60); // batasi panjang

                                                field.onChange(onlyLettersAndSpace);
                                            }}
                                        />
                                    </div>
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
                                <FormControl>
                                    <div>
                                        <p className="font-semibold text-black">NIK</p>

                                        <Input
                                            data-aos="fade-up"
                                            data-aos-delay="100"
                                            className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                            type="number"
                                            placeholder="Nomor Induk Kewarganegaraan"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value.slice(0, 16);
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
                        control={formUser.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col w-full justify-center" data-aos="fade-up" data-aos-delay="200">
                                        <FormLabel>Jenis Kelamin</FormLabel>

                                        <div className="flex sm:flex-row flex-col items-center w-full gap-5 mt-5 m-auto">
                                            {/* Tombol Laki - Laki */}
                                            <Button
                                                type="button"
                                                className={`${field.value === "Laki - Laki" ? 'bg-orange-500' : 'bg-gray-100 text-black'} transition-all px-6 py-2 text-lg w-full`}
                                                onClick={() => field.onChange("Laki - Laki")}
                                            >
                                                Laki - Laki
                                            </Button>

                                            {/* Tombol Perempuan */}
                                            <Button
                                                type="button"
                                                className={`${field.value === "Perempuan" ? 'bg-orange-500' : 'bg-gray-100 text-black'} transition-all px-6 py-2 text-lg w-full`}
                                                onClick={() => field.onChange("Perempuan")}
                                            >
                                                Perempuan
                                            </Button>
                                        </div>
                                    </div>
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
                                <FormLabel className="font-semibold">Tanggal Lahir</FormLabel>
                                <FormControl>
                                    <div>
                                        <Button
                                            onClick={() => setShowCalendar(!showCalendar)}
                                            className="w-full hover:bg-transparent bg-transparent border border-orange-500 text-black flex items-start justify-start"
                                            type="button"
                                        >
                                            {field.value
                                                ? (typeof field.value === "string"
                                                    ? field.value
                                                    : `${field.value.getFullYear()}-${String(field.value.getMonth() + 1).padStart(2, "0")}-${String(field.value.getDate()).padStart(2, "0")}`
                                                )
                                                : "Pilih Tanggal Lahir"}
                                        </Button>

                                        <div ref={calendarRef} className="w-max relative">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={
                                                    typeof field.value === "string"
                                                        ? parseLocalDate(field.value)
                                                        : field.value instanceof Date
                                                            ? field.value
                                                            : undefined
                                                }
                                                onSelect={(date) => {
                                                    if (date instanceof Date && !isNaN(date.getTime())) {
                                                        const yyyy = date.getFullYear();
                                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                                        const dd = String(date.getDate()).padStart(2, '0');
                                                        const localDate = `${yyyy}-${mm}-${dd}`;
                                                        field.onChange(localDate);
                                                    }
                                                }}
                                                className={`${showCalendar ? 'block' : 'hidden'} relative rounded-md border shadow-sm`}
                                            />
                                        </div>
                                    </div>
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
                                <div data-aos="fade-up" data-aos-delay="400">
                                    <FormControl>
                                        <div>
                                            <p className="font-semibold text-black">Email</p>

                                            <Input
                                                className="w-full mt-2 bg-[#F4F4F4] font-sans font-semibold"
                                                placeholder="nama@gmail.com"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                            />
                                        </div>
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
                                <div data-aos="fade-up" data-aos-delay="500">
                                    <FormControl>
                                        <div>
                                            <p className="font-semibold text-black">Nomor HP</p>

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

                                    <p className="text-xs italic text-gray-500 mt-2">Harap pastikan nomor HP yang Anda daftarkan adalah nomor <span className="font-bold text-black">WhatsApp</span> yang aktif untuk pengiriman <span className="font-bold text-black">kode OTP</span>.</p>
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
                                    <div data-aos="fade-up" data-aos-delay="600">
                                        <p className="font-semibold mb-2">
                                            Foto Profil Akun
                                        </p>

                                        <input
                                            {...field}
                                            type="file"
                                            id="fileInput"
                                            accept="image/*"
                                            className="hidden" // Sembunyikan input file bawaan
                                            onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : null;

                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        setShowNotification(true)
                                                        setErrorMessage('File poto profil melebihi 2MB');
                                                        setIsPhotoUploaded(false)
                                                        return;
                                                    }

                                                    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
                                                    if (!validImageTypes.includes(file.type)) {
                                                        setShowNotification(true)
                                                        setErrorMessage('Tipe file tidak valid. Silakan unggah gambar (JPEG, PNG, atau GIF).');
                                                        setIsPhotoUploaded(false)
                                                        return;
                                                    }

                                                    setIsPhotoUploaded(true)
                                                    field.onChange(file);
                                                } else {
                                                    field.onChange(null);
                                                }
                                            }}
                                            value=""
                                        />
                                        <label
                                            htmlFor="fileInput"
                                            className="w-full bg-[#F4F4F4] font-sans font-semibold p-2 rounded-lg inline-flex items-center justify-between cursor-pointer"
                                        >
                                            <span className="text-gray-500">
                                                {field.value
                                                    ? (field.value instanceof File ? field.value.name : field.value)
                                                    : "Tidak ada foto yang dipilih"}
                                            </span>
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded">
                                                Pilih Foto
                                            </span>
                                        </label>


                                        {isPhotoUploaded && <p className="text-xs text-green-500 mt-2">Photo berhasil diupload.</p>}
                                    </div>
                                </FormControl>
                                <FormMessage />

                                <p className="text-xs italic text-gray-500 mt-2">Foto yang diupload akan menjadi foto profile akun STIQR mu</p>

                                <p className="text-xs italic text-gray-500 mt-2">Saran :  Foto Logo Usaha</p>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={formUser.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <div data-aos="fade-up" className='flex items-center relative'>
                                    <FormControl>
                                        <div className="w-full">
                                            <p className='font-semibold text-black'>Password</p>

                                            <Input
                                                className='w-full mt-2 font-sans font-semibold p-3 border bg-[#F4F4F4] border-gray-300 rounded-md'
                                                placeholder='Password'
                                                type={showPassword ? 'text' : 'password'}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <button onClick={() => setShowPassword(!showPassword)} type="button" className='bottom-2 absolute right-5'>{showPassword ? <EyeOff /> : <Eye />}</button>
                                </div>

                                <FormMessage />

                                <div className="text-sm mt-3 space-y-1">
                                    <p className={isMinLength ? "text-green-600" : "text-red-500"}>
                                        {isMinLength ? "✓" : "✗"} Minimal 8 Karakter
                                    </p>
                                    <p className={hasNumber ? "text-green-600" : "text-red-500"}>
                                        {hasNumber ? "✓" : "✗"} Minimal 1 Angka
                                    </p>
                                    <p className={hasUppercase ? "text-green-600" : "text-red-500"}>
                                        {hasUppercase ? "✓" : "✗"} Minimal 1 huruf Kapital
                                    </p>
                                    <p className={hasSpecialChar ? "text-green-600" : "text-red-500"}>
                                        {hasSpecialChar ? "✓" : "✗"} Minimal 1 Spesial Karakter
                                    </p>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={formUser.control}
                        name='confirmPassword'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <div data-aos="fade-up" className='flex items-center relative'>
                                    <FormControl>
                                        <div className="w-full">
                                            <p className='font-semibold text-black'>Konfirmasi Password</p>

                                            <Input
                                                className='w-full mt-2 font-sans font-semibold p-3 border bg-[#F4F4F4] border-gray-300 rounded-md'
                                                placeholder='Retype Password'
                                                type={showPasswordConfirm ? 'text' : 'password'}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <button onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} type="button" className='bottom-2 absolute right-5'>{showPasswordConfirm ? <EyeOff /> : <Eye />}</button>
                                </div>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="w-full flex justify-end mt-10">
                    <Button
                        data-aos="fade-up"
                        className={`${currentSection === 0 ? 'flex' : 'hidden'} font-sans font-semibold bg-[#7ED321] rounded-lg px-6 py-2 `}
                    >
                        Selanjutnya <ChevronRight />
                    </Button>
                </div>
            </form >
        </Form >
    )
}

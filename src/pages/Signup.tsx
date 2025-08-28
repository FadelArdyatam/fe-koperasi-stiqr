import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, QrCode, Smartphone, Store, UserRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import OTP from "@/components/OTP"
import TermsandCondition from "@/components/TermsandCondition"
import PinInput from "@/components/PinInput"
import axiosInstance from "@/hooks/axiosInstance"
import Notification from "@/components/Notification"
import AOS from "aos";
import "aos/dist/aos.css";
import Loading from "@/components/Loading"
import { FormPengajuanQris } from "@/components/register/FormPengajuanQris"
import { FormMerchant } from "@/components/register/FormMerchant"
import { FormPersonal } from '../components/register/FormPersonal';
import { useNavigate } from "react-router-dom"

const Signup = () => {
    const [showTermsandConditions, setShowTermsandConditions] = useState(true)
    const [section, setSection] = useState([true, false, false, false]);
    const [currentSection, setCurrentSection] = useState(0);
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [createPin, setCreatePin] = useState(false)
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isPhotoUploaded, setIsPhotoUploaded] = useState(false);

    const [phone, setPhone] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updateDoc, setUpdateDoc] = useState({
        is_update_deed_doc: false,
        is_update_legal_doc: false,
    });
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    useEffect(() => {
        AOS.refresh();  // Refresh AOS setiap kali currentSection berubah
    }, [currentSection]);

    useEffect(() => {
        const registerID = localStorage.getItem("registerID")

        if (registerID) {
            setCurrentSection(3)
            setShowTermsandConditions(false)
        }
    }, [])

    const FormSchemaUser = z.object({
        photo: z.union([z.instanceof(File, {
            message: "Foto harus di upload.",
        }), z.string().url()]),
        ownerName: z.string().min(2, {
            message: "Nama pemilik harus terdiri dari minimal 2 karakter.",
        }).regex(/^[A-Za-z\s]+$/, {
            message: "Nama hanya boleh mengandung huruf dan spasi.",
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
            .min(8, { message: "Kata sandi harus terdiri dari minimal 8 karakter." })
            .regex(/[a-z]/, { message: "Kata sandi harus mengandung setidaknya satu huruf kecil." })
            .regex(/[A-Z]/, { message: "Kata sandi harus mengandung setidaknya satu huruf besar." })
            .regex(/\d/, { message: "Kata sandi harus mengandung setidaknya satu angka." })
            .regex(/[@#$%^&*!_]/, { message: "Kata sandi harus mengandung setidaknya satu karakter unik (@, #, $, dll.)." }),
        confirmPassword: z
            .string()
            .min(8, { message: "Kata sandi harus terdiri dari minimal 8 karakter." })
            .regex(/[a-z]/, { message: "Kata sandi harus mengandung setidaknya satu huruf kecil." })
            .regex(/[A-Z]/, { message: "Kata sandi harus mengandung setidaknya satu huruf besar." })
            .regex(/\d/, { message: "Kata sandi harus mengandung setidaknya satu angka." })
            .regex(/[@#$%^&*!_]/, { message: "Kata sandi harus mengandung setidaknya satu karakter unik (@, #, $, dll.)." }),
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
            dateOfBirth: new Date("2000-01-01"), // Set default date to 1 January 2000
            email: "",
            nik: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        },
    })

    const FormSchemaMerchant = z.object({
        typeBusinessEntity: z.enum(
            ["Perorangan", "CV", "Koperasi", "Firma", "Perseroan Terbatas"],
            {
                message: "Harap pilih jenis badan usaha.",
            }
        ),
        merchantName: z.string().min(3, {
            message: "Nama merchant harus terdiri dari minimal 3 karakter.",
        }).regex(/^[A-Za-z\s]+$/, {
            message: "Nama hanya boleh mengandung huruf dan spasi.",
        }),
        merchantCategory: z.string().min(1, {
            message: "Harap pilih kategori merchant.",
        }
        ),
        rt_number: z.string().min(1, {
            message: "RT harus terdiri wajib diisi.",
        }),
        rw_number: z.string().min(1, {
            message: "RW harus terdiri wajib diisi.",
        }),
        block_number: z.string().optional(),
        merchantProvince: z.string().min(1, {
            message: "Nama provinsi wajib diisi.",
        }),
        merchantRegency: z.string().min(1, {
            message: "Nama kabupaten/kota wajib diisi.",
        }),
        merchantDistrict: z.string().min(1, {
            message: "Nama kecamatan wajib diisi.",
        }),
        merchantVillage: z.string().min(1, {
            message: "Nama desa/kelurahan wajib diisi.",
        }),
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
        merchantContact: z.string().optional(),
    });

    const formMerchant = useForm<z.infer<typeof FormSchemaMerchant>>({
        resolver: zodResolver(FormSchemaMerchant),
        defaultValues: {
            typeBusinessEntity: undefined, // Nilai default kosong
            merchantName: "",
            merchantCategory: undefined,
            rt_number: "",
            rw_number: "",
            block_number: "",
            merchantProvince: "",
            merchantRegency: "",
            merchantDistrict: "",
            merchantVillage: "",
            postalCode: "",
            merchantAddress: "",
            phoneNumberMerchant: "",
            merchantEmail: "",
        },
    });

    const FormSchemaSubmissionQRIS = z.object({
        annual_revenue: z.string().min(1, {
            message: "Omzet Pertahun harus diisi.",
        }),
        ktp: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File KTP tidak boleh lebih dari 5MB.",
            }),
        nib: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File NIB tidak boleh lebih dari 5MB.",
            }),
        npwp: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File NPWP tidak boleh lebih dari 5MB.",
            }),
        bussiness_photo: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File Foto Usaha tidak boleh lebih dari 5MB.",
            }),
        deed_doc: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File Akta Pendirian tidak boleh lebih dari 5MB.",
            }),
        deed_update_doc: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File Perubahan Akta Pendirian tidak boleh lebih dari 5MB.",
            }),
        legal_doc: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File SK Kemenkumham Pendirian tidak boleh lebih dari 5MB.",
            }),
        legal_update_doc: z
            .instanceof(File)
            .optional()
            .refine(file => !file || file.size <= 5 * 1024 * 1024, {
                message: "File Perubahan SK Kemenkumham Pendirian tidak boleh lebih dari 5MB.",
            }),
        daily_income: z.string().min(1, {
            message: "Penghasilan per hari harus diisi.",
        }),
        daily_transaction: z.string().min(1, {
            message: "Jumlah transaksi per hari harus diisi.",
        }),
    });

    const formSubmissionQRIS = useForm<z.infer<typeof FormSchemaSubmissionQRIS>>({
        resolver: zodResolver(FormSchemaSubmissionQRIS),
        defaultValues: {
            annual_revenue: "",
            ktp: undefined,
            nib: undefined,
            npwp: undefined,
            bussiness_photo: undefined,
            deed_doc: undefined,
            deed_update_doc: undefined,
            legal_doc: undefined,
            legal_update_doc: undefined,
            daily_income: "",
            daily_transaction: "",
        },
    });

    const onSubmitAllForms = async (qrisData: z.infer<typeof FormSchemaSubmissionQRIS>) => {
        console.log("Submitting all forms with data:", qrisData);
        setIsSubmitting(true);
        // 1. Ambil semua data dari setiap form
        const userData = formUser.getValues();
        const merchantData = formMerchant.getValues();

        // 2. Buat objek FormData untuk mengirim file dan data
        const formData = new FormData();

        // 3. Append semua data ke FormData sesuai dengan DTO di backend

        // Data User
        formData.append("username", userData.ownerName);
        formData.append("nik", userData.nik);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("confirmPassword", userData.confirmPassword);
        formData.append("phone_number", userData.phoneNumber);
        formData.append("gender", userData.gender);
        const dateOfBirthValue = userData.dateOfBirth;
        if (dateOfBirthValue) {
            const formattedDate = new Date(dateOfBirthValue).toISOString().split('T')[0];
            formData.append("dateOfBirth", formattedDate);
        }
        if (userData.photo instanceof File) {
            formData.append("photo", userData.photo);
        }

        // Data Merchant
        formData.append("merchantName", merchantData.merchantName);
        formData.append("merchantEmail", merchantData.merchantEmail);
        formData.append("phoneNumberMerchant", merchantData.phoneNumberMerchant);
        formData.append("typeBusinessEntity", merchantData.typeBusinessEntity);
        formData.append("merchantAddress", merchantData.merchantAddress);
        formData.append("postalCode", merchantData.postalCode);
        formData.append("merchantProvince", merchantData.merchantProvince);
        formData.append("merchantRegency", merchantData.merchantRegency);
        formData.append("merchantDistrict", merchantData.merchantDistrict);
        formData.append("merchantVillage", merchantData.merchantVillage);
        formData.append("rt_number", merchantData.rt_number);
        formData.append("rw_number", merchantData.rw_number);
        formData.append("block_number", merchantData.block_number ?? "");
        // Asumsi `mcc` masih ada di state
        formData.append("mcc_code", mcc.code);
        formData.append("mcc_name", mcc.name);

        // Data QRIS Submission
        formData.append("annual_revenue", qrisData.annual_revenue);
        formData.append("daily_income", qrisData.daily_income);
        formData.append("daily_transaction", qrisData.daily_transaction);
        formData.append("type", merchantData.typeBusinessEntity); // type QRIS diambil dari tipe badan usaha
        formData.append("is_update_deed_doc", updateDoc.is_update_deed_doc.toString());
        formData.append("is_update_legal_doc", updateDoc.is_update_legal_doc.toString());

        // Lampirkan file-file QRIS
        if (qrisData.ktp) formData.append("ktp", qrisData.ktp);
        if (qrisData.bussiness_photo) formData.append("bussiness_photo", qrisData.bussiness_photo);
        if (qrisData.npwp) formData.append("npwp", qrisData.npwp);
        if (qrisData.nib) formData.append("nib", qrisData.nib);
        if (qrisData.deed_doc) formData.append("deed_doc", qrisData.deed_doc);
        if (qrisData.deed_update_doc) formData.append("deed_update_doc", qrisData.deed_update_doc);
        if (qrisData.legal_doc) formData.append("legal_doc", qrisData.legal_doc);
        if (qrisData.legal_update_doc) formData.append("legal_update_doc", qrisData.legal_update_doc);


        try {
            // 4. Kirim request ke endpoint gabungan
            // NOTE: Pastikan endpoint ini benar sesuai dengan controller backend Anda
            const response = await axiosInstance.post(
                `/register`, // Menggunakan endpoint baru dari controller
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            console.log(response)

            const result = response.data;
            if (result.status) {
                // Sukses
                localStorage.setItem("registerID", crypto.randomUUID());
                localStorage.setItem("email", userData.email);
                localStorage.removeItem("token");
                const formattedPhone = userData.phoneNumber.replace(/^0/, '');
                setPhone(formattedPhone);
                localStorage.setItem('phone', formattedPhone);
                setShowNotification(false);
                setCurrentSection(3); // Lanjut ke section OTP
            } else {
                // Gagal dari backend
                setShowNotification(true);
                setErrorMessage(result.message || "Terjadi kesalahan pada server.");
            }
        } catch (error: any) {
            console.error("Error submitting all forms:", error);
            setShowNotification(true);
            setErrorMessage(error.response?.data?.message || "Gagal mengirim data. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        let isValid = false;

        if (currentSection === 0) {
            isValid = await formUser.trigger();
        } else if (currentSection === 1) {
            isValid = await formMerchant.trigger();
        }

        if (isValid) {
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
    const [openSearch, setOpenSearch] = useState(false);
    const [mcc, setMcc] = useState({ code: '', name: '' });
    const navigate = useNavigate();

    return (
        <div>
            {showTermsandConditions ? <TermsandCondition setShowTermsandConditions={setShowTermsandConditions} backToPageProfile={false} /> : (
                <div>
                    <div key={currentSection} className={`${createPin ? 'hidden' : 'flex'} w-full flex-col p-10`}>
                        <div className="flex items-center w-full">
                            {
                                currentSection === 0 && (<ChevronLeft className="cursor-pointer" onClick={() => setShowTermsandConditions(true)} />)
                            }

                            {
                                currentSection === 3 && (<ChevronLeft className="cursor-pointer" onClick={() => navigate('/')} />)
                            }

                            <p data-aos="zoom-in" className="uppercase m-auto text-center font-semibold text-2xl">{currentSection === 0 ? 'Data Personal' : currentSection === 1 ? 'Data Merchant' : currentSection === 2 ? 'Pengajuan QRIS' : 'Kode OTP'}</p>
                        </div>

                        <div className="mt-10 w-full flex items-center">
                            <div className={`${section[0] ? 'bg-orange-500' : 'bg-gray-500'} transition-all w-12 min-w-12 h-12 rounded-full flex items-center justify-center`}>
                                <UserRound className="text-white" />
                            </div>

                            <div className="w-full h-[2px] bg-black"></div>

                            <div className={`${section[1] ? 'bg-orange-500' : 'bg-gray-500'} transition-all w-12 min-w-12 h-12 rounded-full flex items-center justify-center`}>
                                <Store className="text-white" />
                            </div>

                            <div className="w-full h-[2px] bg-black"></div>

                            <div className={`${section[2] ? 'bg-orange-500' : 'bg-gray-500'} transition-all w-12 min-w-12 h-12 rounded-full flex items-center justify-center`}>
                                <QrCode className="text-white" />
                            </div>

                            <div className="w-full h-[2px] bg-black"></div>

                            <div className={`${section[3] ? 'bg-orange-500' : 'bg-gray-500'} transition-all w-12 min-w-12 h-12 rounded-full flex items-center justify-center`}>
                                <Smartphone className="text-white" />
                            </div>
                        </div>

                        <div className="w-full mt-10">
                            <FormPersonal
                                currentSection={currentSection}
                                formUser={formUser}
                                onSubmitUser={handleNext}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                showPasswordConfirm={showPasswordConfirm}
                                setShowPasswordConfirm={setShowPasswordConfirm}
                                isPhotoUploaded={isPhotoUploaded}
                                setIsPhotoUploaded={setIsPhotoUploaded}
                                setErrorMessage={setErrorMessage}
                                setShowNotification={setShowNotification}

                            />

                            <FormMerchant
                                formMerchant={formMerchant}
                                isSubmitting={isSubmitting} // atau formMerchant.formState.isSubmitting
                                currentSection={currentSection}
                                setCurrentSection={setCurrentSection}
                                onSubmitMerchant={handleNext}
                                loading={loading}
                                area={{
                                    provinces,
                                    regencies,
                                    districts,
                                    villages,
                                }}
                                selectedProvince={selectedProvince}
                                setSelectedProvince={setSelectedProvince}
                                selectedRegency={selectedRegency}
                                setSelectedRegency={setSelectedRegency}
                                selectedDistrict={selectedDistrict}
                                setSelectedDistrict={setSelectedDistrict}
                                openSearch={openSearch}
                                setOpenSearch={setOpenSearch}
                                mcc={mcc}
                                setMcc={setMcc}
                            />

                            <FormPengajuanQris
                                formSubmissionQRIS={formSubmissionQRIS}
                                onSubmitSubmissionQRIS={onSubmitAllForms}
                                currentSection={currentSection}
                                setCurrentSection={setCurrentSection}
                                setShowNotification={setShowNotification}
                                setErrorMessage={setErrorMessage}
                                isSubmitting={isSubmitting}
                                merchant_type={formMerchant.getValues("typeBusinessEntity")}
                                updateDoc={updateDoc}
                                setUpdateDoc={setUpdateDoc}
                            />
                        </div>

                        <OTP currentSection={currentSection} setCreatePin={setCreatePin} phone={phone} />
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
                    {isSubmitting && <Loading />}
                    {createPin && <PinInput email={formMerchant.getValues("merchantEmail")} />}</div>
            )
            }
        </div >
    )
}

export default Signup
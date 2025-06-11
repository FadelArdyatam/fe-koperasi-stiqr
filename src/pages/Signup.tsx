import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, Sheet, Smartphone, Store, UserRound } from "lucide-react"
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
    const [allData, setAllData] = useState<{ ownerName?: string } & (z.infer<typeof FormSchemaUser> | z.infer<typeof FormSchemaMerchant>)[]>([])
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isPhotoUploaded, setIsPhotoUploaded] = useState(false);

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
            dateOfBirth: new Date(),
            email: "",
            nik: "",
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
        merchantName: z.string().min(3, {
            message: "Nama merchant harus terdiri dari minimal 3 karakter.",
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
        block_number: z.string().min(1, {
            message: "Nomor/Blok Tempat Usaha wajib diisi.",
        }),
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

    const [phone, setPhone] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [merchantId, setMerchantId] = useState("")
    const onSubmitMerchant = async (data: z.infer<typeof FormSchemaMerchant>) => {
        const userDatas = allData[0] as z.infer<typeof FormSchemaUser>;
        setIsSubmitting(true)
        const payload = {
            username: userDatas?.ownerName,
            nik: userDatas?.nik,
            email: userDatas?.email,
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
            rt_number: data.rt_number,
            rw_number: data.rw_number,
            block_number: data.block_number,
            photo: userDatas.photo instanceof File ? userDatas.photo : "https://via.placeholder.com/150",
        };

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
        formData.append("rt_number", payload.rt_number);
        formData.append("rw_number", payload.rw_number);
        formData.append("block_number", payload.block_number);
        formData.append("mcc_name", mcc.name);
        formData.append("mcc_code", mcc.code);

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
            console.log("Hasil response:", result);
            if (result.status) {
                handleNext();
                localStorage.setItem("registerID", crypto.randomUUID());
                localStorage.setItem("email", payload.email)
                setShowNotification(false)
                localStorage.removeItem("token");
                const formattedPhone = payload.phoneNumber.replace(/^0/, '');
                setPhone(formattedPhone);
                localStorage.setItem('phone', formattedPhone);
                setMerchantId(result.merchant_id);
            } else {
                setIsSubmitting(false)
                setShowNotification(true)
                setErrorMessage(result.message)
            }
        } catch (error: any) {
            console.log(error)
            console.error("Error:", error)
            setShowNotification(true)
            setErrorMessage(error.message || "Terjadi Kesalahan")
        } finally {
            setIsSubmitting(false);
        }
    };

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


    const [updateDoc, setUpdateDoc] = useState({
        is_update_deed_doc: false,
        is_update_legal_doc: false,
    });

    const onSubmitSubmissionQRIS = async (data: z.infer<typeof FormSchemaSubmissionQRIS>) => {
        const registerID = localStorage.getItem("registerID");
        if (!registerID) {
            console.error("Register ID tidak ditemukan.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("annual_revenue", data.annual_revenue);
        if (data.ktp) formData.append("ktp", data.ktp);
        if (data.nib) formData.append("nib", data.nib);
        if (data.npwp) formData.append("npwp", data.npwp);
        if (data.deed_doc) formData.append("deed_doc", data.deed_doc);
        if (data.deed_update_doc) formData.append("deed_update_doc", data.deed_update_doc);
        if (data.legal_doc) formData.append("legal_doc", data.legal_doc);
        if (data.legal_update_doc) formData.append("legal_update_doc", data.legal_update_doc);
        if (data.bussiness_photo) formData.append("bussiness_photo", data.bussiness_photo);
        formData.append("daily_income", data.daily_income);
        formData.append("daily_transaction", data.daily_transaction);
        formData.append("merchant_id", merchantId);
        formData.append("type", formMerchant.getValues("typeBusinessEntity"));
        formData.append("is_update_deed_doc", updateDoc.is_update_deed_doc.toString());
        formData.append("is_update_legal_doc", updateDoc.is_update_legal_doc.toString());

        try {
            const response = await axiosInstance.post(
                `${import.meta.env.VITE_API_URL}/register/qris-submission`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            if (response.data.status) {
                console.log("Pengajuan QRIS berhasil:", response.data);
                setShowNotification(false)
                setCurrentSection(3);
            } else {
                setShowNotification(true)
                setErrorMessage(response.data.message)
            }
        } catch (error: any) {
            console.error("Error:", error);
            setShowNotification(true)
            setErrorMessage(error.response.data.message || "Terjadi Kesalahan")
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
                                <Sheet className="text-white" />
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
                                onSubmitUser={onSubmitUser}
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
                                onSubmitMerchant={onSubmitMerchant}
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
                                onSubmitSubmissionQRIS={onSubmitSubmissionQRIS}
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
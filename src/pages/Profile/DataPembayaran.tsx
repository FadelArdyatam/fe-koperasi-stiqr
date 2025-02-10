import { ChevronLeft, CreditCard, Home, ScanQrCode, UserRound, ChevronRight, Check, FileText, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import axiosInstance from "@/hooks/axiosInstance";
import noDataPembayaranImage from "../../images/no-data-image/data-pembayaran.png"
import dataBanks from "../../data/bank.json"
import AOS from "aos";
import "aos/dist/aos.css";

interface Account {
    account_id: string;
    bank_name: string;
    account_number: string;
    owner_name: string;
    // savingBook: string | File;
}

const DataPembayaran = () => {
    const [showContent, setShowContent] = useState({ show: false, index: "" });
    const [isAdding, setIsAdding] = useState({ status: false, section: "bank" });
    const [showEdit, setShowEdit] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [dataForEdit, setDataForEdit] = useState<Account | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    console.log("data banks", dataBanks);

    useEffect(() => {
        AOS.init({ duration: 500, once: true, offset: 100 });
    }, [])

    useEffect(() => {
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }, [showEdit, isAdding, showContent.show]);

    const FormSchemaBank = z.object({
        bankName: z.string().min(3,
            { message: "Nama Bank Tidak Boleh Kosong" }
        ),
        accountNumber: z.string().min(10,
            { message: "Nomor Rekening harus lebih dari 10 karakter" }
        ),
        ownerName: z.string().min(3,
            { message: "Nama Pemilik Tidak Boleh Kosong" }
        ),
        // savingBook: z.union([z.instanceof(File), z.string().url()]), // Update to handle either File or URL
    })

    const formBank = useForm<z.infer<typeof FormSchemaBank>>({
        resolver: zodResolver(FormSchemaBank),
        defaultValues: {
            bankName: '',
            accountNumber: '',
            ownerName: '',
            // savingBook: undefined
        },
    })

    const [accounts, setAccounts] = useState<Account[]>([]);

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    async function fetchData() {
        try {
            const response = await axiosInstance.get(`/account/${userData.merchant.id}`);
            setAccounts(response.data);
        } catch (error: any) {
            console.error("Failed to fetch data:", error.message);
        }
    }

    useEffect(() => {
        fetchData()
    }, []);

    async function getAccountForEdit(accountId: string) {
        try {
            const response = await axiosInstance.get(`/account/${accountId}/detail/${userData.merchant.id}`);
            console.log(response)

            const account = response.data;

            setDataForEdit(account);

            formBank.reset({
                bankName: account.bank_name,
                accountNumber: account.account_number,
                ownerName: account.owner_name,
                // savingBook: account.bank_notes_photo,
            });
        } catch (error: any) {
            console.error("Failed to fetch data:", error.message);
        }
    }

    useEffect(() => {
        if (showContent.show) {
            getAccountForEdit(showContent.index);
        }
    }, [showContent.show])

    async function onSubmitBank(data: z.infer<typeof FormSchemaBank>) {
        const formData = new FormData();
        formData.append("bank_name", data.bankName);
        formData.append("account_number", data.accountNumber);
        formData.append("owner_name", data.ownerName);

        // if (data.savingBook instanceof File) {
        //     formData.append("bank_notes_photo", data.savingBook);
        // } else {
        //     console.warn("No file provided for savingBook.");
        // }

        formData.append("merchant_id", userData.merchant.id);

        try {
            const response = await axiosInstance.post(
                "/account/create",
                formData,
            );

            console.log("Response from API:", response.data);

            setShowNotification(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error while adding Account:", error.response?.data || error.message);
            } else {
                console.error("Error while adding Account:", error);
            }
            alert("Failed to add Account. Please try again.");
            setShowNotification(false);
        }
    }

    async function onSubmitForEditBank(data: z.infer<typeof FormSchemaBank>) {
        const formData = new FormData();

        formData.append("bank_name", data.bankName);
        formData.append("account_number", data.accountNumber);
        formData.append("owner_name", data.ownerName);

        // if (data.savingBook instanceof File) {
        //     formData.append("bank_notes_photo", data.savingBook);
        // } else {
        //     console.warn("No file provided for savingBook.");
        // }

        try {
            const response = await axiosInstance.patch(
                `/account/${showContent.index}/update`,
                formData,
            );

            console.log("Response from API:", response.data);

            setShowNotification(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error while adding Account:", error.response?.data || error.message);
            } else {
                console.error("Error while adding Account:", error);
            }
            alert("Failed to add Account. Please try again.");
            setShowNotification(false);
        }
    }

    const FormSchemaEwallet = z.object({
        ewalletName: z.string().min(3,
            { message: "Nama E-wallet Tidak Boleh Kosong" }
        ),
        accountNumber: z.string().min(10,
            { message: "Nomor Telp E-wallet harus lebih dari 10 karakter" }
        ),
        ownerName: z.string().min(3,
            { message: "Nama Pemilik E-wallet Tidak Boleh Kosong" }
        ),
        // savingBook: z.union([z.instanceof(File), z.string().url()]), // Update to handle either File or URL
    })

    const formEwallet = useForm<z.infer<typeof FormSchemaEwallet>>({
        resolver: zodResolver(FormSchemaEwallet),
        defaultValues: {
            ewalletName: 'DANA',
            accountNumber: '',
            ownerName: '',
            // savingBook: undefined
        },
    })

    async function onSubmitEwallet(data: z.infer<typeof FormSchemaEwallet>) {
        console.log(data)
    }

    const buttonBack = () => {
        setShowContent({ show: false, index: "" })
        setShowEdit(false)
        setIsAdding({ status: false, section: "" })
    }

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            <div className='w-full px-5 pt-5 pb-32 flex items-center justify-center bg-orange-400'>
                {showContent.show === false ? (
                    <Link to={'/profile'} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </Link>
                ) : (
                    <button onClick={buttonBack} className='absolute left-5 bg-transparent hover:bg-transparent'>
                        <ChevronLeft className='scale-[1.3] text-white' />
                    </button>
                )}

                <p key={isAdding.status ? 'adding-mode' : showEdit ? 'edit-mode' : 'view-mode'} data-aos="zoom-in" className='font-semibold m-auto text-xl text-white text-center'>{isAdding.status ? 'Tambah Data Pembayaran' : showEdit ? 'Edit Data Pembayaran' : 'Data Pembayaran'}</p>
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

            <div className={`${showContent.show === false && !isAdding.status ? 'block' : 'hidden'} bg-white w-[90%] p-5 rounded-lg shadow-lg mt-5 -translate-y-20`}>
                {accounts.length === 0 ? (
                    <div data-aos="fade-up" data-aos-delay="100" className="flex items-center flex-col justify-center gap-10">
                        <img src={noDataPembayaranImage} className="mt-5" alt="" />

                        <p className="text-center text-orange-500 font-semibold">Belum ada data pembayaran yang terdaftar</p>
                    </div>) : accounts.map((account, index) => (
                        <div key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                            <div className={`${index === 0 ? 'hidden' : 'block'} w-full h-[2px] my-5 bg-gray-200`}></div>

                            <button onClick={() => setShowContent({ show: true, index: account.account_id })} className="flex w-full items-center gap-5 justify-between">
                                <div className="flex flex-col items-start">
                                    <p>{account.bank_name}</p>

                                    <p className="text-sm text-gray-500">{account.owner_name}, {account.account_number}</p>
                                </div>

                                <ChevronRight />
                            </button>
                        </div>
                    ))}
            </div>

            <div className="w-full flex flex-col gap-5">
                <Button data-aos="fade-up" data-aos-delay="200" onClick={() => setIsAdding({ status: true, section: "bank" })} className={`${isAdding.status || showEdit ? 'hidden' : 'block'} w-[90%] m-auto bg-green-400`}>Tambah Akun Pembayaran</Button>
            </div>

            <div key={showContent.show ? "showContent-mode" : "noShowContent-mode"} className={`${showContent.show === true && !showEdit ? 'block' : 'hidden'} w-[90%] bg-white -translate-y-20 p-5 rounded-lg shadow-lg`}>
                <div className="flex flex-col gap-5">
                    <div data-aos="fade-up" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nama Akun Bank</p>

                        <p className="text-sm font-semibold">{dataForEdit?.bank_name}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="100" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nomor Rekening</p>

                        <p className="text-sm font-semibold">{dataForEdit?.account_number}</p>
                    </div>

                    <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="200" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Nama Pemilik</p>

                        <p className="text-sm font-semibold">{dataForEdit?.owner_name}</p>
                    </div>

                    {/* <div className="w-full h-[2px] my-2 bg-gray-200"></div>

                    <div data-aos="fade-up" data-aos-delay="300" className="flex w-full items-center gap-5 justify-between">
                        <p className="text-sm text-gray-500">Buku Tabungan</p>

                        <Image />
                    </div> */}
                </div>

                <Button data-aos="fade-up" data-aos-delay="400" onClick={() => setShowEdit(true)} className="mt-7 w-full bg-green-400">Edit</Button>
            </div>

            {/* Add new Bank and e-wallet */}
            <div key={isAdding ? 'adding-bank-mode' : 'noAdding-bank-mode'} className={`${isAdding.status ? 'block' : 'hidden'} w-[90%] p-5 bg-white -translate-y-20 rounded-lg shadow-lg`}>
                <div className="flex gap-5 items-center justify-between w-full">
                    <Button className={`${isAdding.section === "bank" ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'} w-full`} onClick={() => setIsAdding({ status: isAdding.status, section: "bank" })}>Bank</Button>

                    <Button className={`${isAdding.section === "e-wallet" ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'} w-full`} onClick={() => setIsAdding({ status: isAdding.status, section: "e-wallet" })}>E-Wallet</Button>
                </div>

                <Form {...formBank}>
                    <form onSubmit={formBank.handleSubmit(onSubmitBank)}>
                        <div className={`${isAdding.section === "bank" ? 'flex' : 'hidden'} flex-col items-end w-full space-y-7 mt-10`}>
                            <FormField
                                control={formBank.control}
                                name="bankName"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="100">
                                        <FormLabel className="text-gray-500">Nama Bank</FormLabel>

                                        <FormControl>
                                            <div className="relative w-full">
                                                <button
                                                    type="button"
                                                    className="p-3 font-sans font-semibold flex items-center w-full justify-between bg-[#F4F4F4] text-left border rounded-md"
                                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                                >
                                                    {field.value || "Select Bank"}
                                                    <ChevronDown />
                                                </button>

                                                {dropdownOpen && (
                                                    <ul className="left-0 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto z-50">
                                                        {dataBanks.banks.map((bank, index) => (
                                                            <li
                                                                key={index}
                                                                className="p-3 hover:bg-gray-200 cursor-pointer"
                                                                onClick={() => {
                                                                    field.onChange(bank.name);
                                                                    setDropdownOpen(false);
                                                                }}
                                                            >
                                                                {bank.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formBank.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="200">
                                        <FormLabel className="text-gray-500">Nomor Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formBank.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="300">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="savingBook"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="400">
                                        <FormLabel className="text-gray-500">Upload Scan Buku Tabungan</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        field.onChange(file); // Update field value with the selected file
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                        </div>

                        <Button data-aos="fade-up" data-aos-delay="500" type="submit" className={`${isAdding.section === "bank" ? 'block' : 'hidden'} w-full bg-green-400 mt-7`}>Simpan Data</Button>
                    </form>
                </Form>

                <Form {...formEwallet}>
                    <form onSubmit={formEwallet.handleSubmit(onSubmitEwallet)}>
                        <div className={`${isAdding.section === "e-wallet" ? 'flex' : 'hidden'} flex-col items-end w-full space-y-7 mt-10`}>
                            <FormField
                                control={formEwallet.control}
                                name="ewalletName"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="100">
                                        <FormLabel className="text-gray-500">Nama E-wallet</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-bg-[#F4F4F4] font-sans font-semibold" disabled={true} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formEwallet.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="200">
                                        <FormLabel className="text-gray-500">Nomor Telp E-wallet</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" type="number" {...field} />
                                        </FormControl>

                                        <p className="text-xs italic text-gray-500 mt-2">Pastikan nomor HP DANA Anda aktif.</p>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formEwallet.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="300">
                                        <FormLabel className="text-gray-500">Nama Pemilik E-wallet</FormLabel>

                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="savingBook"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="400">
                                        <FormLabel className="text-gray-500">Upload Scan Buku Tabungan</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        field.onChange(file); // Update field value with the selected file
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                        </div>

                        <Button data-aos="fade-up" data-aos-delay="500" type="submit" className={`${isAdding.section === "e-wallet" ? 'block' : 'hidden'} w-full bg-green-400 mt-7`}>Simpan Data</Button>
                    </form>
                </Form>
            </div>
            {/*  */}

            {/* Edit Bank */}
            <div key={showEdit ? 'edit-mode' : 'NoEdit-mode'} className={`${showEdit ? 'block' : 'hidden'} w-[90%] p-5 bg-white -translate-y-20 rounded-lg shadow-lg`}>
                <Form {...formBank}>
                    <form
                        onSubmit={formBank.handleSubmit(onSubmitForEditBank)}
                    >
                        <div className="flex flex-col items-end w-full space-y-7">

                            <FormField
                                control={formBank.control}
                                name="bankName"
                                defaultValue={dataForEdit?.bank_name}
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="100">
                                        <FormLabel className="text-gray-500">Nama Bank</FormLabel>
                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formBank.control}
                                name="accountNumber"
                                defaultValue={dataForEdit?.account_number}
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="200">
                                        <FormLabel className="text-gray-500">Nomor Rekening</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                type="number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formBank.control}
                                name="ownerName"
                                defaultValue={dataForEdit?.owner_name}
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="300">
                                        <FormLabel className="text-gray-500">Nama Pemilik Rekening</FormLabel>
                                        <FormControl>
                                            <Input className="w-full bg-[#F4F4F4] font-sans font-semibold" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* <FormField
                                control={form.control}
                                name="savingBook"
                                render={({ field }) => (
                                    <FormItem className="w-full" data-aos="fade-up" data-aos-delay="400">
                                        <FormLabel className="text-gray-500">Upload Scan Buku Tabungan</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="w-full bg-[#F4F4F4] font-sans font-semibold"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        field.onChange(file);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                        </div>

                        <Button data-aos="fade-up" data-aos-delay="500" type="submit" className="w-full bg-green-400 mt-7">Simpan Perubahan</Button>
                    </form>
                </Form>
            </div>
            {/*  */}

            {/* Notification */}
            <div className={`${showNotification ? 'flex' : 'hidden'} fixed items-center justify-center top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50`}>
                <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5">
                    <div className='w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400'>
                        <Check />
                    </div>

                    <p className="font-semibold text-xl">Terimakasih</p>

                    <p className='text-base'>{isAdding ? 'Data Bank Berhasil Ditambahkan' : 'Data Bank Berhasil Diubah.'}</p>

                    <Button onClick={() => setShowNotification(false)} className="w-full">Back</Button>
                </div>
            </div>
            {/*  */}
        </div>
    )
}

export default DataPembayaran
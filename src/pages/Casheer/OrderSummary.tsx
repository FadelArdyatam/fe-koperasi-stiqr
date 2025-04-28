import { ArrowLeft, Trash2, Pencil, ChevronsUpDown } from "lucide-react";
import bayarNanti from "../../images/take-away.png"
import bayarSekarang from "../../images/bayar-sekarang.png"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import OrderProcessed from "./OrderProcessed";
import { bookingDatas } from '@/pages/Booking/Booking';
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import noProduct from '../../images/no-product.png'
import Notification from "@/components/Notification";


interface OrderSummaryProps {
    basket: any[];
    setBasket: React.Dispatch<React.SetStateAction<any[]>>;
    showService: { show: boolean; service: string | null };
    setShowService: React.Dispatch<React.SetStateAction<{ show: boolean; service: string | null }>>;
    references: React.MutableRefObject<HTMLDivElement | null>;
    setSelectedProduct: any;
    setShowDetailProduct: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ setBasket, basket, showService, setShowService, references, setSelectedProduct, setShowDetailProduct }) => {
    const [mergedBasket, setMergedBasket] = useState<any[]>([]);
    const [showOrderProcess, setShowOrderProcess] = useState(false);
    const [noMeja, setNoMeja] = useState("");
    const [responseSalesCreate, setResponseSalesCreate] = useState<any>(null);
    const [openSearch, setOpenSearch] = useState(false);
    // const [value, setValue] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [dataCustomer, setDataCustomer] = useState({ name: "", phone: "", email: "", other_number: "" });
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [phoneNumberError, setPhoneNumberError] = useState("");

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    console.log("Show Service: ", showService);

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;

    useEffect(() => {
        if (!userData) return;

        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(`/customers/${userData.merchant.id}`);
                setCustomers(response.data);
            } catch (error: any) {
                console.error("Failed to fetch data:", error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const mergedBasket = basket.reduce((acc, curr) => {
            const existingProduct = acc.find((item: { product: any }) => item.product === curr.product);

            if (existingProduct) {
                existingProduct.quantity += curr.quantity;
                existingProduct.price += curr.price;
            } else {
                acc.push({ ...curr });
            }

            return acc;
        }, []);

        setMergedBasket(mergedBasket);
    }, [basket]);

    const increaseHandler = (index: number) => {
        const updatedBasket = [...basket];
        const productToUpdate = mergedBasket[index];

        setBasket(
            updatedBasket.map((item) =>
                item.product === productToUpdate.product
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseHandler = (index: number) => {
        setBasket((prevBasket) => {
            const updatedBasket = [...prevBasket];
            const productToUpdate = mergedBasket[index];

            const newBasket = updatedBasket
                .map((item) =>
                    item.product === productToUpdate.product
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0);

            // Pastikan cek `newBasket` bukan `basket`
            if (newBasket.length === 0) {
                setShowService({ show: false, service: null });
            }

            return newBasket;
        });
    };

    const removeHandler = (index: number) => {
        setBasket((prevBasket) => {
            const updatedBasket = prevBasket.filter((_, i) => i !== index);

            if (updatedBasket.length === 0) {
                setShowService({ show: false, service: null });
            }

            return updatedBasket;
        });
    };

    const [orderId, setOrderId] = useState<string | null>(null)
    const [tagih, setTagih] = useState<boolean>(false)

    const [showNotification, setShowNotification] = useState<{
        show: boolean;
        message: string;
        type: "success" | "error";
    }>({
        show: false,
        message: "",
        type: "success",
    });

    const openBillHandler = async (status: any) => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;
        try {
            const modifyBasket = mergedBasket.map(item => ({
                product_id: item.product_id,
                variant_id: item.detail_variant && item.detail_variant.length > 0
                    ? item.detail_variant.map((variant: { variant_id: any; }) => variant.variant_id)[0]
                    : null,
                quantity: item.quantity,
                price: item.price,
                subtotal: (item.price) * (item.quantity),
                detail_variants: item.detail_variants
            }));

            console.log("Modify Basket: ", modifyBasket);

            const generateRandomString = (length = 10) => {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
            };

            const generateOrderId = `S${generateRandomString(15)}`;

            setOrderId(generateOrderId)
            console.log(selectedCustomer)

            const requestBody = {
                customer: {
                    name: selectedCustomer?.customer?.name != null ? selectedCustomer.customer.name : dataCustomer.name,
                    phone: selectedCustomer?.customer?.phone != null ? selectedCustomer.customer.phone : dataCustomer.phone,
                    email: selectedCustomer?.customer?.email != null ? selectedCustomer.customer.email : dataCustomer.email,
                    other_number: selectedCustomer?.customer?.other_number != null ? selectedCustomer.customer.other_number : dataCustomer.other_number,
                },
                status: "inprogress",
                order_type: showService.service === "Dine In" ? "dinein" : "takeaway",
                table_number: noMeja,
                merchant_id: userData.merchant.id,
                quantity: mergedBasket.reduce((acc, curr) => acc + curr.quantity, 0),
                subtotal: mergedBasket.reduce((acc, curr) => acc + curr.price * curr.quantity, 0),
                salesDetails: modifyBasket,
                orderId: generateOrderId,
            };

            const response = await axiosInstance.post('/sales/create', requestBody);

            if (response.data.success) {
                setShowOrderProcess(true);
                bookingDatas.push(mergedBasket);
                setResponseSalesCreate(response.data.data.sales_id);
            } else {
                setShowNotification({ show: true, type: "error", message: response.data.error })
            }
            setLoading(false)
            if (status == 'tagih') {
                setTagih(true)
            }
        } catch (error: any) {
            if (error.response) {
                console.error('Response error:', error.response.data);
            } else if (error.request) {
                console.error('Request error:', error.request);
            } else {
                console.error('Setup error:', error.message);
            }
            setLoading(false)
        }
    };

    return (
        <div ref={references}>
            <div className={`${showOrderProcess ? 'hidden' : 'flex'} w-full flex-col min-h-screen pb-[250px] items-center bg-orange-50`}>
                <div className={`p-5 w-full bg-white`}>
                    <div className="w-full flex items-center gap-5 justify-between">
                        <div className="flex items-center gap-5">
                            <button onClick={() => setShowService({ show: false, service: null })}><ArrowLeft /></button>

                            <p data-aos="zoom-in" className="font-semibold text-2xl">Ringkasan Pesanan</p>
                        </div>
                    </div>
                </div>

                <div data-aos="fade-up" data-aos-delay="100" className="w-[90%] flex items-center justify-between gap-5 mt-5 bg-white p-5 shadow-lg rounded-md">
                    <img className="w-10" src={showService.service === "Pay Now" ? bayarNanti : bayarSekarang} alt="" />

                    <p className="font-semibold text-lg">{showService.service === "Pay Now" ? "Bayar Sekarang" : "Bayar Nanti"}</p>

                    <Button type="button" onClick={() => setShowService({ show: true, service: null })} className="block bg-orange-100 text-orange-400 rounded-full">Ubah</Button>
                </div>

                <Popover open={openSearch} onOpenChange={setOpenSearch}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSearch}
                            className="mt-10 w-[90%] justify-between border border-gray-300 rounded-lg"
                        >
                            {selectedCustomer?.customer?.name || "Select customers..."}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        className="w-[var(--radix-popper-anchor-width)] p-0 border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        align="start"
                    >
                        <Command className="w-full">
                            <CommandInput
                                placeholder="Search customer..."
                                className="h-9 px-4 border-b border-gray-200 focus:outline-none"
                            />

                            <CommandList className="max-h-60 overflow-y-auto">
                                <CommandEmpty className="p-3 text-gray-500">No customer found.</CommandEmpty>

                                <CommandGroup>
                                    {customers.length > 0 && customers?.map((customer) => (
                                        <CommandItem
                                            key={customer.customer.customer_id}
                                            onSelect={() => {
                                                setSelectedCustomer(customer);
                                                setOpenSearch(false);
                                            }}
                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-md transition"
                                        >
                                            {customer.customer.name} - {customer.customer.other_number}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <div className="mt-5 w-[90%]">
                    <div data-aos="fade-up" data-aos-delay="300" className="flex items-center gap-5">
                        <div className="w-[65%]">
                            <p className="font-semibold">Nama Pemesan</p>

                            <Input
                                value={selectedCustomer?.customer?.name !== null ? selectedCustomer?.customer?.name : dataCustomer.name}
                                onChange={(e) => {
                                    setDataCustomer({
                                        name: e.target.value,
                                        phone: dataCustomer.phone,
                                        email: dataCustomer.email,
                                        other_number: dataCustomer.other_number
                                    });
                                    setSelectedCustomer({ ...selectedCustomer, customer: { ...selectedCustomer?.customer, name: null } });
                                }}
                                type="text"
                                placeholder="Nama Pemesan"
                                className="w-full bg-white p-3 rounded-lg mt-2"
                            />
                        </div>

                        <div className="w-[35%]">
                            <p className="font-semibold">No. Meja</p>

                            <Input
                                onChange={(e) => {
                                    setNoMeja(e.target.value);
                                }}
                                placeholder="No. Meja"
                                className="w-full bg-white p-3 rounded-lg mt-2"
                            />
                        </div>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="400" className="mt-5">
                        <p className="font-semibold">No HP</p>

                        <Input
                            value={selectedCustomer?.customer?.phone ? selectedCustomer?.customer?.phone : dataCustomer.phone}
                            onChange={(e) => {
                                if (e.target.value.length < 10) {
                                    setPhoneNumberError("Nomor HP minimal 10 karakter");
                                } else {
                                    setPhoneNumberError("");
                                }

                                // maksimal 15 karakter dan minimal 10 karakter
                                if (e.target.value.length > 15) return;

                                setDataCustomer({ name: dataCustomer.name, phone: e.target.value, email: dataCustomer.email, other_number: dataCustomer.other_number });
                                setSelectedCustomer({ ...selectedCustomer, customer: { ...selectedCustomer?.customer, phone: null } });
                            }}
                            placeholder="No HP"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full bg-white p-3 rounded-lg mt-2"
                        />
                        {phoneNumberError && <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>}
                    </div>

                    <div data-aos="fade-up" data-aos-delay="500" className="mt-5">
                        <p className="font-semibold">Email</p>

                        <Input
                            value={selectedCustomer?.customer?.email ? selectedCustomer?.customer?.email : dataCustomer.email}
                            onChange={(e) => {
                                const email = e.target.value;
                                setDataCustomer({ name: dataCustomer.name, phone: dataCustomer.phone, email, other_number: dataCustomer.other_number });
                                setSelectedCustomer({ ...selectedCustomer, customer: { ...selectedCustomer?.customer, email: null } });

                                // Validate email format
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(email)) {
                                    setEmailError("Invalid email format");
                                } else {
                                    setEmailError("");
                                }
                            }}
                            placeholder="Email"
                            type="email"
                            className="w-full bg-white p-3 rounded-lg mt-2" />

                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>

                    <div data-aos="fade-up" data-aos-delay="600" className="mt-5">
                        <p className="font-semibold">Nomor Lainnya</p>

                        <Input
                            value={selectedCustomer?.customer?.other_number ? selectedCustomer?.customer?.other_number : dataCustomer.other_number}
                            onChange={(e) => {
                                if (e.target.value.length > 20) return;
                                setDataCustomer({ name: dataCustomer.name, phone: dataCustomer.phone, email: dataCustomer.email, other_number: e.target.value });
                                setSelectedCustomer({ ...selectedCustomer, customer: { ...selectedCustomer?.customer, other_number: null } });
                            }}
                            placeholder="Other Number"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full bg-white p-3 rounded-lg mt-2" />
                    </div>

                    <div data-aos="fade-up" className="mt-5 w-full flex items-center gap-5 justify-between bg-white p-5 rounded-lg">
                        <p className="font-semibold">Ada lagi pesanannya?</p>

                        <Button onClick={() => setShowService({ show: false, service: null })} className="bg-orange-400">+ Tambah</Button>
                    </div>
                </div>

                <div className="mt-5 w-[90%]">
                    {mergedBasket.map((item, index) => (
                        <div data-aos="fade-up" key={index} className="w-full mt-5 p-5 rounded-lg bg-white shadow-lg">
                            <div className="flex items-start gap-5 justify-between">
                                <div className="flex items-center gap-5">
                                    <img className="w-10" src={`${item.product_image ?? noProduct}`} alt="" />

                                    <div>
                                        <p className="text-lg font-semibold">{item.product}</p>

                                        <p className="font-semibold text-xl">{Number(item.price).toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        })}</p>
                                    </div>
                                </div>

                                <button onClick={() => removeHandler(index)} className="text-red-500"><Trash2 /></button>
                            </div>

                            <div className="mt-10 flex items-center justify-between gap-5">
                                <button onClick={() => { setShowService({ show: false, service: null }); setShowDetailProduct(true); setSelectedProduct(basket[index]) }} className="flex items-center gap-3 font-semibold text-orange-400 rounded-lg">
                                    <Pencil />

                                    <p>Edit</p>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => decreaseHandler(index)} className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl">-</button>

                                    <span className="font-semibold">{item.quantity}</span>

                                    <button onClick={() => increaseHandler(index)} className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-2xl">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div data-aos="fade-up" data-aos-delay="700" className="fixed bottom-0 w-full bg-white p-5 flex flex-col items-center justify-between">
                    <div className="flex w-full items-center justify-between gap-5">
                        <p className="font-semibold text-xl">Total Tagihan</p>

                        <p className="font-semibold text-xl">{Number(mergedBasket.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                        })}</p>
                    </div>

                    <div className="w-full mt-10 flex items-center gap-5 justify-between">
                        <Button onClick={() => { setBasket([]); setShowService({ show: false, service: null }) }} className="rounded-full w-14 h-14 min-w-14 min-h-14 bg-orange-100 text-orange-400 font-semibold"><Trash2 className="scale-[1.5]" /></Button>

                        <Button disabled={loading || emailError !== '' || phoneNumberError !== '' ? true : false} onClick={() => { openBillHandler('open'); setLoading(true) }} className={`${showService.service === "Pay Now" ? 'hidden' : 'flex'} bg-orange-500 items-center justify-center text-white w-full rounded-full py-6 text-lg font-semibold`}>Open Bill</Button>

                        <Button disabled={loading || emailError !== '' || phoneNumberError !== '' ? true : false} onClick={() => { openBillHandler('tagih'); setLoading(true) }} className="bg-orange-500 text-white w-full rounded-full py-6 text-lg font-semibold">Tagih</Button>
                    </div>
                </div>
            </div >

            {showNotification.show && <Notification message={showNotification.message} onClose={() => setShowNotification({ show: false, message: '', type: 'success' })} status={showNotification.type} />}
            {
                showOrderProcess && <OrderProcessed
                    setShowOrderProcess={setShowOrderProcess}
                    basket={mergedBasket}
                    type=""
                    sales_id={responseSalesCreate}
                    orderId={orderId}
                    tagih={tagih}
                    setTagih={setTagih}
                    selectedCustomer={{
                        customer: {
                            name: selectedCustomer?.customer?.name ?? dataCustomer.name,
                            phone: selectedCustomer?.customer?.phone ?? dataCustomer.phone
                        }
                    }}
                    noMeja={noMeja} />
            }
        </div >
    )
}

export default OrderSummary
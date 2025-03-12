import AddEtalase from "@/components/AddEtalase";
import EditEtalase from "@/components/EditEtalase";
import { Button } from "@/components/ui/button";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import imgNoCatalog from "@/images/no-data-catalog.png";
import { Plus } from "lucide-react";
interface Merchant {
    id: string;
    name: string;
    phone_number: string;
    email: string;
    address: string;
    post_code: string;
    category: string;
    city: string;
    type: string;
    pin: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
}

interface ShowcaseProduct {
    id: number,
    showcase_product_id: string,
    showcase_id: string,
    product_id: string,
    created_at: string,
    updated_at: string
}

interface EtalaseProps {
    etalases: Array<{
        id: number;
        showcase_id: string;
        showcase_name: string;
        created_at: string;
        updated_at: string;
        merchant_id: string;
        showcase_product: ShowcaseProduct[],
        merchant: Merchant,
    }>;
    setEtalases: (etalases: Array<{
        id: number;
        showcase_id: string;
        showcase_name: string;
        created_at: string;
        updated_at: string;
        merchant_id: string;
        showcase_product: ShowcaseProduct[],
        merchant: Merchant,
    }>) => void;
    addEtalase: boolean;
    setAddEtalase: (addEtalase: boolean) => void;
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    products: Array<{
        id: number;
        product_id: string;
        product_name: string;
        product_sku: string;
        product_weight: string;
        product_category: string;
        product_price: number;
        product_status: boolean;
        product_description: string;
        product_image: string;
        created_at: string;
        updated_at: string;
        merchant_id: string;
        product_variant: Array<{
            variant: any;
            variant_id: string;
        }> & { product_variant: Array<{ variant_id: string }> };
    }>;
    setReset: (reset: boolean) => void;
}

const Etalase: React.FC<EtalaseProps> = ({ etalases, setEtalases, addEtalase, setAddEtalase, setOpen, open, products, setReset }) => {
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const handleOpen = (id: string) => {
        setOpen({
            id: id,
            status: true,
        });
        setReset(false)
    };

    return (
        <div className="w-full px-5 mb-32">
            <div className={`${addEtalase || open.status ? 'hidden' : 'block'} w-full`}>
                <div>
                    {etalases?.map((etalase, index) => (
                        <div data-aos="fade-up" data-aos-delay={index * 100} key={etalase.id}
                            onClick={() => {
                                handleOpen(etalase.showcase_id);
                            }}
                            className="shadow-sm mt-5 bg-white p-5 rounded-lg cursor-pointer hover:cursor-pointer hover:bg-orange-100 transition-all">
                            <h3 className="text-lg font-semibold text-start">{etalase?.showcase_name}</h3>
                            <p className="text-sm text-gray-400">{etalase?.showcase_product?.length} Produk</p>
                        </div>
                    ))}
                    {etalases.length === 0 && (
                        <div className="flex justify-center gap-3 flex-col">
                            <img className="md:w-3/12 w-2/3 place-items-center self-center mt-10" src={imgNoCatalog} />
                            <p className="text-center text-orange-400 font-bold md:text-xl">Belum ada etalase yang ditambahkan</p>
                            <Button onClick={() => { setAddEtalase(true); setReset(false) }} className={`bg-orange-500 w-fit self-center`}>
                                <Plus />  Tambah Etalase
                            </Button>
                        </div>
                    )}
                </div>

                <Button onClick={() => { setAddEtalase(true); setReset(false) }} className={`fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500 ${etalases.length === 0 ? 'hidden' : 'block'}`}>
                    Tambah Etalase
                </Button>
            </div>

            {addEtalase && <AddEtalase setAddEtalase={setAddEtalase} etalases={etalases} setEtalases={setEtalases} />}

            {open.status && <EditEtalase setOpen={setOpen} editIndex={open.id} open={open} products={products} setReset={setReset} />}
        </div>
    )
}

export default Etalase
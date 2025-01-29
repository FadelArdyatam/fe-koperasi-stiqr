import AddEtalase from "@/components/AddEtalase";
import EditEtalase from "@/components/EditEtalase";
import { Button } from "@/components/ui/button";

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
        id: number,
        product_id: string,
        product_name: string,
        product_sku: string,
        product_weight: string,
        product_category: string,
        product_price: string,
        product_status: boolean,
        product_description: string,
        product_image: string,
        created_at: string,
        updated_at: string,
        merchant_id: string
    }>;
}

const Etalase: React.FC<EtalaseProps> = ({ etalases, setEtalases, addEtalase, setAddEtalase, setOpen, open, products }) => {
    const handleOpen = (id: string) => {
        setOpen({
            id: id,
            status: true,
        });
    };

    console.log(open)

    return (
        <div className="w-full px-5 mb-32">
            <div className={`${addEtalase || open.status ? 'hidden' : 'block'} w-full`}>
                <div>
                    {etalases?.map((etalase) => (
                        <div key={etalase.id} onClick={() => handleOpen(etalase.showcase_id)} className="shadow-sm mt-5 bg-white p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-start">{etalase?.showcase_name}</h3>

                            <p className="text-sm text-gray-400">{etalase?.showcase_product?.length} Produk</p>
                        </div>
                    ))}
                </div>

                <Button onClick={() => setAddEtalase(true)} className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500">
                    Tambah Etalase
                </Button>
            </div>

            {addEtalase && <AddEtalase setAddEtalase={setAddEtalase} etalases={etalases} setEtalases={setEtalases} />}

            {open.status && <EditEtalase setOpen={setOpen} editIndex={open.id} open={open} products={products} />}
        </div>
    )
}

export default Etalase
import AddEtalase from "@/components/AddEtalase";
import EditEtalase from "@/components/EditEtalase";
import { Button } from "@/components/ui/button";

interface EtalaseProps {
    etalases: Array<{
        id: number;
        name: string;
        products: number[];
    }>;
    setEtalases: (etalases: Array<{
        id: number;
        name: string;
        products: number[];
    }>) => void;
    addEtalase: boolean;
    setAddEtalase: (addEtalase: boolean) => void;
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    products: Array<{
        id: number;
        name: string;
        price: string;
        showProduct: boolean;
        SKU: string;
        weight: string;
        description: string;
        etalase: string[];
        photo: string;
        variants: number[];
    }>;
}

const Etalase: React.FC<EtalaseProps> = ({ etalases, setEtalases, addEtalase, setAddEtalase, setOpen, open, products }) => {
    const handleOpen = (id: number) => {
        setOpen({
            id: id - 1,
            status: true,
        });
    };

    console.log(open)

    return (
        <div className="w-full px-5">
            <div className={`${addEtalase || open.status ? 'hidden' : 'block'} w-full`}>
                <div>
                    {etalases.map((etalase) => (
                        <div key={etalase.id} onClick={() => handleOpen(etalase.id)} className="shadow-sm mt-5 bg-white p-5 rounded-lg">
                            <h3 className="text-lg font-semibold text-start">{etalase.name}</h3>

                            <p className="text-sm text-gray-400">{etalase.products.length} Produk</p>
                        </div>
                    ))}
                </div>

                <Button onClick={() => setAddEtalase(true)} className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500">
                    Tambah Etalase
                </Button>
            </div>

            {addEtalase && <AddEtalase setAddEtalase={setAddEtalase} etalases={etalases} setEtalases={setEtalases} products={products} />}

            {open.status && <EditEtalase setOpen={setOpen} etalases={etalases} setEtalases={setEtalases} editIndex={open.id} open={open} products={products} />}
        </div>
    )
}

export default Etalase
import AddVariant from "@/components/AddVariant";
import EditVariant from "@/components/EditVariant";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface VariantProps {
    variants: Array<{
        id: number;
        name: string;
        choises: { name: string; price: number, show: boolean }[];
        mustBeSelected: boolean;
        methods: string;
        products: number[];
        showVariant: boolean;
    }>;
    setVariants: (variants: Array<{
        id: number;
        name: string;
        choises: { name: string; price: number, show: boolean }[];
        mustBeSelected: boolean;
        methods: string;
        products: number[];
        showVariant: boolean;
    }>) => void;
    addVariant: boolean;
    setAddVariant: (addVariant: boolean) => void;
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
        outlet: string;
        etalase: string;
        photo: string;
        variants: number[];
    }>;
}

const Variant: React.FC<VariantProps> = ({ variants, setVariants, addVariant, setAddVariant, setOpen, open, products }) => {
    const handleSwitchChange = (id: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();


        // Perbarui status showProduct pada produk tertentu
        const updatedVariants = variants.map((variant) => {
            if (variant.id === id) {
                return {
                    ...variant,
                    showVariant: !variant.showVariant,
                };
            }
            return variant;
        });

        setVariants(updatedVariants); // Perbarui state di Catalog
    };

    const handleOpen = (id: number) => {
        setOpen({
            id: id - 1,
            status: true,
        });
    };

    console.log(open)

    return (
        <div className="mb-32">
            <div className={`${addVariant || open.status ? 'hidden' : 'block'}`}>
                <div>
                    {variants.map((variant) => (
                        <div key={variant.id} className="shadow-sm">
                            <div
                                className="flex w-full justify-between items-center p-4 bg-white rounded-md mt-3"
                            >
                                <h3 className="text-lg font-semibold">{variant.name}</h3>

                                {/* Custom Switch */}
                                <button
                                    className={`flex items-center justify-center w-14 h-8 p-1 rounded-full cursor-pointer 
                                    ${variant.showVariant ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                    onClick={(event) => handleSwitchChange(variant.id, event)}
                                >
                                    <div
                                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                        ${variant.showVariant ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                    ></div>
                                </button>
                            </div>

                            <div onClick={() => handleOpen(variant.id)} className="w-full flex p-4 items-center gap-5 justify-between">
                                <p>1 Pilihan Aktif</p>

                                <ChevronRight />
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={() => setAddVariant(true)} className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500">
                    Tambah Varian
                </Button>
            </div>

            {addVariant && <AddVariant setAddVariant={setAddVariant} variants={variants} setVariants={setVariants} products={products} />}

            {open.status && <EditVariant setOpen={setOpen} variants={variants} setVariants={setVariants} editIndex={open.id} open={open} products={products} />}
        </div>
    )
}

export default Variant
import AddVariant from "@/components/AddVariant";
import EditVariant from "@/components/EditVariant";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface VariantProps {
    variants: Array<{
        id: number;
        variant_id: string;
        variant_name: string;
        product_id: string;
        variant_description: string;
        is_multiple: boolean;
        merchant_id: string;
        products: number[];
        mustBeSelected: boolean;
        methods: string;
        choises: [];
        showVariant: boolean;
    }>;
    setVariants: (variants: Array<{
        id: number;
        variant_id: string;
        variant_name: string;
        product_id: string;
        variant_description: string;
        is_multiple: boolean;
        merchant_id: string;
        products: number[];
        mustBeSelected: boolean;
        methods: string;
        choises: [];
        showVariant: boolean;
    }>) => void;
    addVariant: boolean;
    setAddVariant: (addVariant: boolean) => void;
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
        merchant_id: string,
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

    const handleOpen = (id: string) => {
        setOpen({
            id: id,
            status: true,
        });
    };

    console.log(open)

    return (
        <div className="mb-32 px-5">
            <div className={`${addVariant || open.status ? 'hidden' : 'block'}`}>
                <div>
                    {variants.map((variant) => (
                        <div key={variant.id} className="shadow-sm">
                            <div
                                className="flex w-full justify-between items-center p-4 bg-white rounded-md mt-3"
                            >
                                <h3 className="text-lg font-semibold">{variant.variant_name}</h3>

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

                            <div onClick={() => handleOpen(variant.variant_id)} className="w-full flex p-4 bg-white rounded-md items-center gap-5 justify-between">
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

            {addVariant && <AddVariant setAddVariant={setAddVariant} variants={variants} products={products} />}

            {open.status && <EditVariant setOpen={setOpen} variants={variants} setVariants={setVariants} editIndex={open.id} open={open} products={products} />}
        </div>
    )
}

export default Variant
import AddVariant from "@/components/AddVariant";
import EditVarianProduct from "@/components/EditVarianProduct";
import EditVariant from "@/components/EditVariant";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/hooks/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import imgNoCatalog from "@/images/no-data-catalog.png";
import { Info, Plus } from "lucide-react";

interface VariantProps {
    variants: Array<{
        variant_status: any;
        product_variant: any;
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
        variant_status: any;
        product_variant: any;
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
        detail_product: {
            is_stok: boolean;
            stok: number;
        }
        product_variant: Array<{
            variant: any;
            variant_id: string;
        }> & { product_variant: Array<{ variant_id: string }> };
    }>;
    setShowVariantProductHandler: (showVariantProductHandler: { id: string; status: boolean }) => void;
    showVariantProductHandler: { id: string; status: boolean };
    setReset: (reset: boolean) => void;
}

const Variant: React.FC<VariantProps> = ({ variants, setVariants, addVariant, setAddVariant, setOpen, open, products, setShowVariantProductHandler, showVariantProductHandler, setReset }) => {
    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);

    const handleSwitchChange = async (id: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();

        const currentVariant = variants.find((variant) => variant.variant_id === id);

        console.log("id", id)

        if (!currentVariant) return;

        try {
            const response = await axiosInstance.patch(`/varian/${id}/update-status`, {});
            console.log(response);

            // Perbarui status showVariant pada produk tertentu
            setVariants(variants.map((variant) =>
                variant.variant_id === id
                    ? { ...variant, variant_status: !variant.variant_status }
                    : variant
            ));
        } catch (error) {
            console.error('Error updating variant status:', error);
        }

        // // Perbarui status showProduct pada produk tertentu
        // const updatedVariants = variants.map((variant) => {
        //     if (variant.id === id) {
        //         return {
        //             ...variant,
        //             showVariant: !variant.showVariant,
        //         };
        //     }
        //     return variant;
        // });

        // setVariants(updatedVariants); // Perbarui state di Catalog
    };

    const handleOpen = (id: string) => {
        setOpen({
            id: id,
            status: true,
        });

        setReset(false);
    };

    console.log("variant", variants)
    const isHide = false;

    return (
        <div className="mb-32 px-5">
            <div className={`${addVariant || open.status || showVariantProductHandler.status ? 'hidden' : 'block'}`}>
                {
                    isHide && (
                        <div data-aos="fade-up" data-aos-delay="100" className="flex items-center justify-between gap-3 p-4 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 min-w-5 h-5 text-blue-500" />

                                <p className="text-sm text-black">
                                    Fitur varian masih dalam proses pengembangan dan akan segera tersedia
                                </p>
                            </div>
                        </div>
                    )
                }
                <div className={`${isHide ? 'hidden' : 'block'}`}>
                    {variants.map((variant, index) => (
                        <div data-aos="fade-up" data-aos-delay={index * 100} key={variant.id} className="shadow-sm flex flex-col mb-3 bg-white hover:cursor-pointer hover:bg-orange-100 transition-all rounded-md duration-500">
                            <div onClick={() => handleOpen(variant.variant_id)} className="">
                                <div
                                    className="flex w-full justify-between items-center p-4 rounded-md mt-3 hover:cursor-pointer"
                                >
                                    <button type="button" className="text-lg font-semibold">{variant?.variant_name?.length > 25
                                        ? variant?.variant_name?.slice(0, 25) + "..."
                                        : variant.variant_name}

                                    </button>

                                    {/* Custom Switch */}
                                    <button
                                        className={`flex items-center justify-center w-14 h-8 p-1 rounded-full cursor-pointer 
                                    ${variant.variant_status ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                        onClick={(event) => handleSwitchChange(variant.variant_id, event)}
                                    >
                                        <div
                                            className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                        ${variant.variant_status ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                        ></div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-row justify-between w-full p-4">
                                {/* Elemen kiri */}
                                <div className="w-auto">
                                    <p>Diterapkan ke {variant?.product_variant?.length ?? 0} produk</p>
                                </div>

                                {/* Elemen kanan */}
                                <div
                                    onClick={() => {
                                        setShowVariantProductHandler({ id: variant.variant_id, status: true });
                                        setReset(false);
                                    }}
                                    className="w-auto hover:cursor-pointer text-orange-500"
                                >
                                    Atur Produk
                                </div>
                            </div>
                        </div>
                    ))}
                    {variants?.length === 0 && (
                        <div className="flex justify-center gap-3 flex-col">
                            <img className="md:w-3/12 w-2/3 place-items-center self-center mt-10" src={imgNoCatalog} />
                            <p className="text-center text-orange-400 font-bold md:text-xl">Belum ada varian yang ditambahkan</p>
                            <Button onClick={() => { setAddVariant(true); setReset(false) }} className={` bg-orange-500 w-fit self-center`}>
                                <Plus /> Tambah Varian
                            </Button>
                        </div>

                    )}
                </div>

                <Button  onClick={() => { setAddVariant(true); setReset(false) }} className={`${variants?.length === 0 ? 'hidden' : 'block'} fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500`}>
                    Tambah Varian
                </Button>
            </div>

            {addVariant && <AddVariant setAddVariant={setAddVariant} products={products} variants={variants} setVariants={setVariants} />}

            {open.status && <EditVariant setOpen={setOpen} editIndex={open.id} open={open} products={products} setReset={setReset} />}

            {showVariantProductHandler.status && <EditVarianProduct setShowVariantProductHandler={setShowVariantProductHandler} variantId={showVariantProductHandler.id} products={products} setReset={setReset} />}
        </div>
    )
}

export default Variant
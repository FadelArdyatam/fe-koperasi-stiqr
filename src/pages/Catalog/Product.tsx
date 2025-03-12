import AddProduct from '@/components/AddProduct';
import EditProduct from '@/components/EditProduct';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/hooks/axiosInstance';
import React, { useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";
import noProduct from '../../images/no-product.png'
import imgNoCatalog from "@/images/no-data-catalog.png";
import { Plus } from 'lucide-react';


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
    id: number;
    showcase_product_id: string;
    showcase_id: string;
    product_id: string;
    created_at: string;
    updated_at: string;
}

interface ProductType {
    id: number;
    detail_product: any;
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
}

interface Etalase {
    id: number;
    showcase_id: string;
    showcase_name: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
    showcase_product: ShowcaseProduct[];
    merchant: Merchant;
}

interface Variant {
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
}

interface ProductProps {
    products: ProductType[];
    setProducts: (products: ProductType[]) => void;
    addProduct: boolean;
    setAddProduct: (addProduct: boolean) => void;
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    setEtalases: (etalases: Etalase[]) => void;
    etalases: Etalase[];
    variants: Variant[];
    setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
    setReset: (reset: boolean) => void;
}

const Product: React.FC<ProductProps> = ({
    products,
    setProducts,
    addProduct,
    setAddProduct,
    setOpen,
    open,
    etalases,
    setEtalases,
    variants,
    setVariants,
    setReset
}) => {

    useEffect(() => {
        AOS.init({ duration: 500, once: true });
    }, []);
    const handleSwitchChange = async (id: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // Menangani perubahan status untuk masing-masing produk
        event.stopPropagation();

        const currentProduct = products.find((product) => product.product_id === id);
        if (!currentProduct) return;

        try {
            const response = await axiosInstance.patch(`/product/${id}/update/status`, {});
            console.log(response);

            setProducts(products.map((product) =>
                product.product_id === id
                    ? { ...product, product_status: !product.product_status }
                    : product
            ));
        } catch (error) {
            console.error('Error updating product status:', error);
        }
    };

    const handleOpen = (id: string) => {
        setOpen({
            id,
            status: true,
        });

        setReset(false);
    };

    return (
        <div className='mb-32 px-5'>
            <div className={`${addProduct || open.status ? 'hidden' : 'block'}`}>
                <div>
                    {products?.map((product, index) => (
                        <div
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            key={product.id}
                            className="flex w-full justify-between items-center p-4 gap-4 bg-white rounded-md shadow-sm mt-5 cursor-pointer hover:cursor-pointer hover:bg-orange-100 transition-all"
                            onClick={() => handleOpen(product.product_id)}
                        >
                            {/* Kiri: Gambar & Detail Produk */}
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Gambar Produk */}
                                <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={product.product_image ?? noProduct}
                                        alt={product.product_name}
                                        className="h-full w-full object-cover rounded-md"
                                    />
                                </div>

                                {/* Informasi Produk */}
                                <div className="flex flex-col items-start min-w-0">
                                    <h3 className="text-lg font-semibold text-start truncate w-full">
                                        {product.product_name}
                                    </h3>

                                    <p className="text-sm text-gray-600">
                                        Rp {new Intl.NumberFormat('id-ID').format(Number(product.product_price))}
                                    </p>

                                    {product?.detail_product?.is_stok && (
                                        <span className="bg-orange-100 px-3 py-1 mt-1 rounded-full text-orange-500 font-normal text-xs">
                                            Stok: {product.detail_product.stok}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Kanan: Switch Button */}
                            <button
                                className={`flex items-center justify-center w-14 min-w-14 h-8 p-1 rounded-full cursor-pointer 
                            ${product.product_status ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={(event) => {
                                    event.stopPropagation(); // Hindari trigger handleOpen saat klik switch
                                    handleSwitchChange(product.product_id, event);
                                }}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                ${product.product_status ? 'translate-x-3' : '-translate-x-3'}`}
                                />
                            </button>
                        </div>
                    ))}
                    {products?.length === 0 && (
                        <div className="flex justify-center gap-3 flex-col">
                            <img className="md:w-3/12 w-2/3 place-items-center self-center mt-10" src={imgNoCatalog} />
                            <p className="text-center text-orange-400 font-bold md:text-xl">Belum ada produk yang ditambahkan</p>
                            <Button
                                onClick={() => { setAddProduct(true); setReset(false) }}
                                className={`bg-orange-500 w-fit self-center`}
                            >
                                <Plus /> Tambah Produk
                            </Button>
                        </div>
                    )}
                </div>

                <Button
                    onClick={() => { setAddProduct(true); setReset(false) }}
                    className={`fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500 ${products?.length === 0 ? 'hidden' : 'block'}`}
                >
                    Tambah Produk
                </Button>
            </div>

            {addProduct && (
                <AddProduct
                    setProducts={setProducts}
                    products={products}
                    setAddProduct={setAddProduct}
                    setEtalases={setEtalases}
                    etalases={etalases}
                    setVariants={setVariants}
                    variants={variants}
                />
            )}

            {open.status && (
                <EditProduct
                    setOpen={setOpen}
                    products={products}
                    editIndex={open.id}
                    open={open}
                    etalases={etalases}
                    setVariants={setVariants}
                    variants={variants}
                    setReset={setReset}
                />
            )}
        </div>
    );
}

export default Product;
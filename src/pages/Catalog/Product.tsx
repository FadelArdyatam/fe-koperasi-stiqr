import AddProduct from '@/components/AddProduct';
import EditProduct from '@/components/EditProduct';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/hooks/axiosInstance';
import React, { useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";

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
    product_id: string;
    product_name: string;
    product_sku: string;
    product_weight: string;
    product_category: string;
    product_price: string;
    product_status: boolean;
    product_description: string;
    product_image: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
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

interface ProductProps {
    products: ProductType[];
    setProducts: (products: ProductType[]) => void;
    addProduct: boolean;
    setAddProduct: (addProduct: boolean) => void;
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
    setEtalases: (etalases: Etalase[]) => void;
    etalases: Etalase[];
}

const Product: React.FC<ProductProps> = ({
    products,
    setProducts,
    addProduct,
    setAddProduct,
    setOpen,
    open,
    etalases,
    setEtalases
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
    };

    const urlImage = `${import.meta.env.VITE_API_URL.replace('/api', '')}`;

    return (
        <div className='mb-32 px-5'>
            <div className={`${addProduct || open.status ? 'hidden' : 'block'}`}>
                <div>
                    {products?.map((product, index) => (
                        <div
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            key={product.id}
                            className="flex w-full justify-between items-center p-4 gap-2 bg-white rounded-md shadow-sm mt-5"
                            onClick={() => handleOpen(product.product_id)}
                        >
                            <button className="flex items-center">
                                <div className="h-12 w-12 min-w-12 bg-gray-200 rounded-md mr-4">
                                    <img
                                        src={`${urlImage}/uploads/products/${product.product_image}`}
                                        alt={product.product_name}
                                        className="h-12 w-12 object-cover rounded-md"
                                    />
                                </div>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-lg font-semibold text-start text-wrap">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Rp {new Intl.NumberFormat('id-ID').format(Number(product.product_price))}
                                    </p>
                                </div>
                            </button>

                            <button
                                className={`flex items-center justify-center w-14 min-w-14 h-8 p-1 rounded-full cursor-pointer 
                                ${product.product_status ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={(event) => handleSwitchChange(product.product_id, event)}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${product.product_status ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={() => setAddProduct(true)}
                    className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500"
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
                />
            )}

            {open.status && (
                <EditProduct
                    setOpen={setOpen}
                    products={products}
                    editIndex={open.id}
                    open={open}
                    etalases={etalases}
                />
            )}
        </div>
    );
}

export default Product;
import AddProduct from '@/components/AddProduct';
import EditProduct from '@/components/EditProduct';
import { Button } from '@/components/ui/button';
import React from 'react';

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

interface ProductProps {
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
    setProducts: (products: Array<{
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
    }>) => void;
    addProduct: boolean;
    setAddProduct: (addProduct: boolean) => void;
    setOpen: (open: { id: string; status: boolean }) => void;
    open: { id: string; status: boolean };
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
}

const Product: React.FC<ProductProps> = ({ products, setProducts, addProduct, setAddProduct, setOpen, open, etalases }) => {
    // Menangani perubahan status untuk masing-masing produk
    const handleSwitchChange = (id: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();

        // Perbarui status showProduct pada produk tertentu
        const updatedProducts = products.map((product) => {
            if (product.id === id) {
                return {
                    ...product,
                    product_status: !product.product_status,
                };
            }
            return product;
        });

        setProducts(updatedProducts); // Perbarui state di Catalog
    };

    const handleOpen = (id: string) => {
        setOpen({
            id: id,
            status: true,
        });
    };

    const urlImage = `${import.meta.env.VITE_API_URL.replace('/api', '')}`;
    return (
        <div className='mb-32 px-5'>
            <div className={`${addProduct || open.status ? 'hidden' : 'block'}`}>
                <div>
                    {products?.map((product) => (
                        <div
                            key={product.id}
                            className="flex w-full justify-between items-center p-4 bg-white rounded-md shadow-sm mt-5"
                            onClick={() => handleOpen(product.product_id)}
                        >
                            <button className="flex items-center">
                                <div className="h-12 w-12 bg-gray-200 rounded-md mr-4">
                                    <img src={`${urlImage}/uploads/products/${product.product_image}`} alt={product?.product_name} className="h-12 w-12 object-cover rounded-md" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-lg font-semibold">{product?.product_name}</h3>
                                    <p className="text-sm text-gray-600">Rp{product?.product_price}</p>
                                </div>
                            </button>

                            {/* Custom Switch */}
                            <button
                                className={`flex items-center justify-center w-14 h-8 p-1 rounded-full cursor-pointer 
                                ${product?.product_status ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={(event) => handleSwitchChange(product.id, event)}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${product?.product_status ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                ></div>
                            </button>
                        </div>
                    ))}
                </div>

                <Button onClick={() => setAddProduct(true)} className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500">
                    Tambah Produk
                </Button>
            </div>

            {addProduct && <AddProduct setAddProduct={setAddProduct} etalases={etalases} />}

            {open.status && <EditProduct setOpen={setOpen} products={products} editIndex={open.id} open={open} etalases={etalases} />}
        </div>
    );
};

export default Product;

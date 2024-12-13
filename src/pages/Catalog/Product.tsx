import AddProduct from '@/components/AddProduct';
import EditProduct from '@/components/EditProduct';
import { Button } from '@/components/ui/button';
import React from 'react';

interface ProductProps {
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
    setProducts: (products: Array<{
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
    }>) => void;
    addProduct: boolean;
    setAddProduct: (addProduct: boolean) => void;
    setOpen: (open: { id: number; status: boolean }) => void;
    open: { id: number; status: boolean };
    etalases: Array<{
        id: number;
        name: string;
        products: number[];
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
                    showProduct: !product.showProduct,
                };
            }
            return product;
        });

        setProducts(updatedProducts); // Perbarui state di Catalog
    };

    const handleOpen = (id: number) => {
        setOpen({
            id: id - 1,
            status: true,
        });
    };

    console.log(open);

    return (
        <div className='mb-32 px-5'>
            <div className={`${addProduct || open.status ? 'hidden' : 'block'}`}>
                <div>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex w-full justify-between items-center p-4 bg-white rounded-md shadow-sm mt-5"
                            onClick={() => handleOpen(product.id)}
                        >
                            <button className="flex items-center">
                                <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
                                <div className="flex flex-col items-start">
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600">Rp{product.price}</p>
                                </div>
                            </button>

                            {/* Custom Switch */}
                            <button
                                className={`flex items-center justify-center w-14 h-8 p-1 rounded-full cursor-pointer 
                                ${product.showProduct ? 'bg-orange-500' : 'bg-gray-300'} transition-colors`}
                                onClick={(event) => handleSwitchChange(product.id, event)}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform 
                                    ${product.showProduct ? 'transform translate-x-3' : 'transform -translate-x-3'}`}
                                ></div>
                            </button>
                        </div>
                    ))}
                </div>

                <Button onClick={() => setAddProduct(true)} className="fixed bottom-32 left-[50%] -translate-x-[50%] bg-orange-500">
                    Tambah Produk
                </Button>
            </div>

            {addProduct && <AddProduct setAddProduct={setAddProduct} products={products} setProducts={setProducts} etalases={etalases} />}

            {open.status && <EditProduct setOpen={setOpen} products={products} setProducts={setProducts} editIndex={open.id} open={open} etalases={etalases} />}
        </div>
    );
};

export default Product;

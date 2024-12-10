import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, FileText, Home, ScanQrCode, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { useState } from "react";
import Product from "./Product";
import Variant from "./Variant";
import Etalase from "./Etalase";
import { Link } from "react-router-dom";

const initialProducts = [
    { id: 1, photo: '', name: 'Ayam', SKU: 'GAG10131', price: '15000', weight: '6g', variants: [] as number[], description: '', outlet: 'Jl. Palmerah', etalase: '', showProduct: false },
    { id: 2, photo: '', name: 'Soda', SKU: 'GAG10121', price: '10000', weight: '6g', variants: [] as number[], description: '', outlet: 'Jl. Palmerah', etalase: '', showProduct: false },
    { id: 3, photo: '', name: 'Kentang', SKU: 'GAG10731', price: '21000', weight: '6g', variants: [] as number[], description: '', outlet: 'Jl. Palmerah', etalase: '', showProduct: false },
];

const initialVariants = [
    { id: 1, name: 'Topping', choises: [] as Array<{ name: string; price: number, show: boolean }>, mustBeSelected: false, methods: 'single', products: [] as number[], showVariant: false },
    { id: 2, name: 'Size', choises: [{ name: 'small', price: 12000, show: true }, { name: 'medium', price: 20000, show: false }], mustBeSelected: true, methods: 'single', products: [] as number[], showVariant: false },
    { id: 3, name: 'Rasa', choises: [{ name: 'manis', price: 12000, show: false }, { name: 'asin', price: 20000, show: true }], mustBeSelected: true, methods: 'single', products: [] as number[], showVariant: false },
];

const initialEtalases = [
    { id: 1, name: 'makanan', products: [] as number[] },
    { id: 2, name: 'minuman', products: [] as number[] },
];

const Catalog = () => {
    const [show, setShow] = useState('Produk');
    const [products, setProducts] = useState(initialProducts); // State untuk data produk
    const [variants, setVariants] = useState(initialVariants); // State untuk data varian
    const [etalases, setEtalases] = useState(initialEtalases); // State untuk data etalase
    const [addProduct, setAddProduct] = useState(false);
    const [addVariant, setAddVariant] = useState(false);
    const [addEtalase, setAddEtalase] = useState(false);
    const [open, setOpen] = useState({
        id: -1,
        status: false,
    });
    const [searchTerm, setSearchTerm] = useState(''); // State untuk input pencarian

    // Filter produk berdasarkan input pencarian
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.SKU.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredVariants = variants.filter(variant =>
        variant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEtalases = etalases.filter(etalase =>
        etalase.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(products, variants, etalases);

    return (
        <div className="w-full flex flex-col min-h-screen items-center">
            <div className={`${addProduct || addVariant || addEtalase || open.status ? 'hidden' : 'block'} p-5 w-full`}>
                <div className="w-full flex items-center gap-5 justify-between">
                    <p className="font-semibold text-2xl">Katalog</p>

                    <Button className="bg-orange-100 rounded-full text-orange-500">Impor Produk</Button>
                </div>

                <div className="mt-10 relative">
                    {/* Ikon Pencarian */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <Search />
                    </div>

                    {/* Input */}
                    <Input
                        placeholder={show === 'Produk' ? 'Cari produk' : show === 'Varian' ? 'Cari varian' : 'Cari etalase'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-12 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500"
                    />

                    {/* Ikon Pengaturan */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                        <SlidersHorizontal />
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-5 justify-between">
                    <Button onClick={() => setShow('Produk')} className={`${show === 'Produk' ? 'bg-orange-50' : 'bg-transparent'} transition-all text-orange-500 rounded-full w-full`}>Produk</Button>

                    <Button onClick={() => setShow('Varian')} className={`${show === 'Varian' ? 'bg-orange-50' : 'bg-transparent'} transition-all text-orange-500 rounded-full w-full`}>Varian</Button>

                    <Button onClick={() => setShow('Etalase')} className={`${show === 'Etalase' ? 'bg-orange-50' : 'bg-transparent'} transition-all text-orange-500 rounded-full w-full`}>Etalase</Button>
                </div>
            </div>

            <div className="w-full flex items-end gap-5 justify-between px-3 py-2 bg-white text-xs fixed bottom-0 border z-10">
                <Link to={'/dashboard'} className="flex gap-3 flex-col items-center">
                    <Home />

                    <p className="uppercase">Home</p>
                </Link>

                <Link to={'/qr-code'} className="flex gap-3 flex-col items-center">
                    <ScanQrCode />

                    <p className="uppercase">Qr Code</p>
                </Link>

                <Link to={'/settlement'} className="flex relative gap-3 flex-col items-center">
                    <div className="absolute -top-20 shadow-md text-white w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center">
                        <CreditCard />
                    </div>

                    <p className="uppercase">Penarikan</p>
                </Link>

                <Link to={'/catalog'} className="flex gap-3 text-orange-400 flex-col items-center">
                    <FileText />

                    <p className="uppercase">Catalog</p>
                </Link>

                <Link to={'/profile'} className="flex gap-3 flex-col items-center">
                    <UserRound />

                    <p className="uppercase">Profile</p>
                </Link>
            </div>

            <div className="w-full">
                {show === 'Produk' && <Product products={searchTerm !== '' ? filteredProducts : products} setProducts={setProducts} addProduct={addProduct} setAddProduct={setAddProduct} setOpen={setOpen} open={open} etalases={etalases} />}
            </div>

            <div className="w-full">
                {show === 'Varian' && <Variant variants={searchTerm !== '' ? filteredVariants : variants} setVariants={setVariants} addVariant={addVariant} setAddVariant={setAddVariant} setOpen={setOpen} open={open} products={products} />}
            </div>

            {show === 'Etalase' && <Etalase etalases={searchTerm !== '' ? filteredEtalases : etalases} setEtalases={setEtalases} addEtalase={addEtalase} setAddEtalase={setAddEtalase} setOpen={setOpen} open={open} products={products} />}
        </div>
    );
};

export default Catalog;

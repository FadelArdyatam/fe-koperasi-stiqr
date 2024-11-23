import React from 'react';
import { Button } from './ui/button';
import { Check } from 'lucide-react';

interface BillProps {
    data: {
        product: string;
        amount: string;
        date: string;
        time: string;
    };
    marginTop?: boolean;
}

const Bill: React.FC<BillProps> = ({ data, marginTop }) => {

    return (
        <>
            <div className={`${marginTop ? 'mt-[130px]' : 'mt-[-90px] bg-white'} w-[90%] m-auto shadow-lg p-10 rounded-lg`}>
                <div className='w-16 h-16 flex items-center justify-center border-2 border-black bg-orange-400 rounded-full m-auto'>
                    <Check className='scale-[2] text-white' />
                </div>

                <p className='font-semibold text-xl text-center text-orange-400 uppercase mt-7'>Detail Tagihan</p>

                <div className='mt-10 w-full'>
                    <p className='font-medium'>Produk Yang Dibeli</p>

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-start gap-5 justify-between'>
                        <div>
                            <p>{data.product} {data.amount}</p>

                            <p className='text-sm text-gray-400 mt-2'>1 x Rp {data.amount}</p>
                        </div>

                        <p>Rp {data.amount}</p>
                    </div>

                    <div className='mt-10 flex items-center gap-5 justify-between'>
                        <p>Total Belanja</p>

                        <p>Rp {data.amount}</p>
                    </div>

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-center gap-5 justify-between'>
                        <p>Total Bayar</p>

                        <p className='text-orange-400'>Rp {data.amount}</p>
                    </div>

                    <div className='w-full my-5 h-[2px] bg-gray-200'></div>

                    <div className='flex items-center gap-5 justify-between'>
                        <p>Date:</p>

                        <p>{data.date} | {data.time}</p>
                    </div>
                </div>
            </div>

            <Button className='uppercase translate-y-10 block text-center w-[90%] m-auto bg-green-500 text-white'>Bayar</Button>
        </>
    )
}

export default Bill;
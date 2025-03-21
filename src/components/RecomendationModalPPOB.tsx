
import axiosInstance from "@/hooks/axiosInstance";
import "aos/dist/aos.css";
import { X } from "lucide-react";
import { useEffect, useState } from "react";


interface IRecomendation {
    category: string;
    setAccountNumber: (value: string) => void;
    setShowRecomendation: (value: boolean) => void;
}
interface Account {
    account_number: string;
    customer_name: string;
}
const RecomendationModalPPOB: React.FC<IRecomendation> = ({ category, setAccountNumber, setShowRecomendation }) => {
    const [accountNumbers, setAccountNumbers] = useState<Account[]>([]);
    useEffect(() => {
        const userItem = sessionStorage.getItem("user");
        const userData = userItem ? JSON.parse(userItem) : null;
        const fetchAccountNumber = async () => {
            try {
                const response = await axiosInstance.get(`history/purchases/${userData.merchant.id}/latest`, {
                    params: {
                        category: category
                    }
                });
                setAccountNumbers(response.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchAccountNumber()
    }, [category]);

    const handleSelectAccountNumber = (account: string) => {
        setAccountNumber(account)
        setShowRecomendation(false);
    }
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
                <div data-aos="zoom-in" className="bg-white w-[90%] md:max-w-md max-w-sm rounded-lg shadow-lg p-5">
                    <div className="text-end flex justify-between ">
                        <p className="text-lg font-semibold">Rekomendasi</p>
                        <X className="hover:cursor-pointer" onClick={() => setShowRecomendation(false)} />
                    </div>
                    <div className="flex flex-col text-black">
                        {accountNumbers.map((account, index) => (
                            <>
                                <div key={index} onClick={() => handleSelectAccountNumber(account.account_number)} className="hover:bg-orange-100 p-2 hover:cursor-pointer rounded-md flex justify-between mt-2 transition duration-300 ease-in-out">
                                    <p className="md:text-base text-xs">{account.account_number} {category != 'Pulsa' ? `- ${account.customer_name}` : ''} </p>
                                </div>
                                <div className="w-full h-[2px] bg-gray-50"></div>
                            </>
                        ))}
                        {
                            accountNumbers.length == 0 && <p className="text-center my-8">Belum ada rekomendasi</p>
                        }
                    </div>

                </div>
            </div>
        </>
    );
};

export default RecomendationModalPPOB;

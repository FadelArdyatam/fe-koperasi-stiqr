import { useState } from "react";
import { Delete } from "lucide-react";
import { evaluate } from "mathjs";


interface CalculatorProps {
    setAmount: React.Dispatch<React.SetStateAction<string>>;
    amount: string;
    setShowCalculator: React.Dispatch<React.SetStateAction<boolean>>;
}

const CalculatorComponent: React.FC<CalculatorProps> = ({ setAmount, amount, setShowCalculator }) => {
    const [isCalculated, setIsCalculated] = useState(false);

    const handleClick = (value: string) => {
        if (value === "." && amount.includes(".")) return; // Mencegah lebih dari 1 titik

        if (amount === "0" && value !== ".") {
            setAmount(value);
        } else {
            setAmount(amount + value);
        }
        setIsCalculated(false);
    };

    const handleClear = () => {
        setAmount("0");
        setIsCalculated(false);
    };

    const handleBackspace = () => {
        setAmount(amount.length > 1 ? amount.slice(0, -1) : "0");
        setIsCalculated(false);
    };

    const handleCalculate = () => {
        try {
            const result = evaluate(amount);
            if (!isNaN(result)) {
                setAmount(parseFloat(result.toFixed(2)).toString()); // Menampilkan 2 angka desimal
                setIsCalculated(true);
            } else {
                setAmount("Error");
            }
        } catch (error) {
            setAmount("Error");
        }
    };

    const handlePercentage = () => {
        try {
            setAmount((parseFloat(amount) / 100).toString());
        } catch (error) {
            setAmount("Error");
        }
        setIsCalculated(false);
    };

    const handleToggleSign = () => {
        if (amount.startsWith("-")) {
            setAmount(amount.substring(1));
        } else {
            setAmount("-" + amount);
        }
        setIsCalculated(false);
    };

    const formatExpression = (expression: string) => {
        return expression.replace(/(\d+(\.\d+)?)/g, (match) => {
            const number = parseFloat(match);
            return isNaN(number)
                ? match
                : new Intl.NumberFormat("id-ID", {
                    minimumFractionDigits: 0, // Tidak menampilkan ,00 jika angka bulat
                    maximumFractionDigits: 2, // Menampilkan maksimal 2 angka desimal jika ada
                }).format(number);
        });
    };

    return (
        <div className="py-[400px] flex flex-col items-center justify-center absolute top-0 left-[50%] bg-black w-full h-screen bg-opacity-50 -translate-x-[50%] text-white">
            <div className="w-[90%] md:w-[40%] p-4 bg-white rounded-lg shadow-lg text-black ">
                <div className="mb-4 p-3 break-words text-right bg-transparent text-3xl font-semibold text-orange-600">{formatExpression(amount)}</div>

                <div className="grid grid-cols-4 gap-2">
                    {["C", "±", "%", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", ".", "0", "⌫", "="]
                        .map((char, index) => (
                            <button
                                key={index}
                                className={`p-4 text-xl font-bold rounded shadow ${["C", "±", "%", "⌫"].includes(char)
                                    ? "bg-gray-700 text-white flex justify-center items-center"
                                    : ["/", "*", "-", "+", "="].includes(char)
                                        ? "bg-green-500 text-white"
                                        : "bg-orange-500 text-white"
                                    } hover:opacity-80`}
                                onClick={() =>
                                    char === "="
                                        ? handleCalculate()
                                        : char === "C"
                                            ? handleClear()
                                            : char === "⌫"
                                                ? handleBackspace()
                                                : char === "%"
                                                    ? handlePercentage()
                                                    : char === "±"
                                                        ? handleToggleSign()
                                                        : handleClick(char)
                                }
                            >
                                {char === "⌫" ? <Delete /> : char}
                            </button>
                        ))}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    <p className="text-sm text-gray-500 italic">*Pastikan angka sudah bilangan bulat dengan menekan "="</p>

                    <button
                        type="button"
                        onClick={() => setShowCalculator(false)}
                        disabled={!isCalculated}
                        className={`w-full p-3 font-bold rounded ${isCalculated ? "bg-green-500 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
                    >
                        Gunakan
                    </button>

                    <button type="button" onClick={() => { setShowCalculator(false); setAmount("0"); setIsCalculated(false); }} className="w-full p-3 bg-red-500 text-white font-bold rounded">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculatorComponent;

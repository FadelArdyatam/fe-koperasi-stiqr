import { useState } from "react";
import { Delete } from "lucide-react";

interface CalculatorProps {
    setAmount: React.Dispatch<React.SetStateAction<string>>;
    amount: string;
    setShowCalculator: React.Dispatch<React.SetStateAction<boolean>>;
}

const CalculatorComponent: React.FC<CalculatorProps> = ({ setAmount, amount, setShowCalculator }) => {
    const [isCalculated, setIsCalculated] = useState(false);

    const handleClick = (value: string) => {
        if (amount === "0") {
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
            setAmount(eval(amount).toString());
            setIsCalculated(true);
        } catch (error) {
            setAmount("Error");
            setIsCalculated(false);
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

    return (
        <div className="py-[400px] flex flex-col items-center justify-center absolute top-0 left-[50%] bg-black w-full h-screen bg-opacity-50 -translate-x-[50%] text-white">
            <div className="md:w-[40%] p-4 bg-white rounded-lg shadow-lg text-black ">
                <div className="mb-4 p-3 break-words text-right bg-transparent text-3xl font-semibold text-orange-600">{amount}</div>

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

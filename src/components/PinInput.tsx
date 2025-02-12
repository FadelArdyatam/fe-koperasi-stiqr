import { Check, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const PinInput = ({ email }: { email: string }) => {
    const [step, setStep] = useState(1);
    const [pin, setPin] = useState<string[]>([]);
    const [confirmPin, setConfirmPin] = useState<string[]>([]);
    const [notification, setNotification] = useState({ showRetype: false, showSuccess: false });

    const navigate = useNavigate();

    const handleNumberClick = (number: string) => {
        if (step === 1 && pin.length < 6) {
            setPin([...pin, number]);
        } else if (step === 2 && confirmPin.length < 6) {
            setConfirmPin([...confirmPin, number]);
        }
    };

    const handleDelete = () => {
        if (step === 1) {
            setPin(pin.slice(0, -1));
        } else if (step === 2) {
            setConfirmPin(confirmPin.slice(0, -1));
        }
    };

    // Menangani input dari keyboard
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const key = event.key;

            if (/^[0-9]$/.test(key)) {
                handleNumberClick(key);
            } else if (key === "Backspace") {
                handleDelete();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [pin, confirmPin, step]);

    useEffect(() => {
        if (step === 1 && pin.length === 6) {
            setNotification({ showRetype: true, showSuccess: false });
            setStep(2);
        }
    }, [pin]);

    const handleSetPin = async () => {
        const pinValue = pin.join("");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/register/set-pin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pin: pinValue, email }),
            });

            if (response.ok) {
                setNotification({ showRetype: false, showSuccess: true });
            } else {
                alert("Failed to set PIN. Please try again.");
                setStep(1);
                setPin([]);
                setConfirmPin([]);
            }
        } catch (error) {
            console.error("Error setting PIN:", error);
            alert("An error occurred. Please try again.");
            setStep(1);
            setPin([]);
            setConfirmPin([]);
        }
    };

    const handleSubmit = async () => {
        if (pin.join("") === confirmPin.join("")) {
            await handleSetPin();
        } else {
            alert("PINs do not match. Please try again.");
            setStep(1);
            setPin([]);
            setConfirmPin([]);
        }
    };

    useEffect(() => {
        if (step === 2 && confirmPin.length === 6) {
            handleSubmit();
        }
    }, [confirmPin, step]);

    const handleCloseNotification = () => {
        setNotification({ showRetype: false, showSuccess: false });
    };

    return (
        <div className="w-full h-screen flex flex-col items-center p-5 justify-center bg-orange-400">
            <h1 className="text-white text-xl font-semibold mb-2">
                {step === 1 ? "Masukkan 6 Digit PIN" : "Konfirmasi PIN Anda"}
            </h1>
            <p className="text-white text-center mb-6 text-sm">
                {step === 1
                    ? "Siapkan 6 digit PIN Anda sekarang. Anda harus memasukkan pin ini untuk melanjutkan transaksi online di masa mendatang."
                    : "Masukkan kembali PIN untuk konfirmasi."}
            </p>

            <div className="flex items-center justify-center mb-10">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className={`w-4 h-4 mx-1 rounded-full ${step === 1
                            ? pin[index]
                                ? "bg-orange-800"
                                : "bg-orange-300"
                            : confirmPin[index]
                                ? "bg-orange-800"
                                : "bg-orange-300"
                            }`}
                    ></div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((number) => (
                    <button
                        key={number}
                        onClick={() => handleNumberClick(number)}
                        className="w-16 h-16 rounded-full bg-white text-orange-500 text-2xl font-bold"
                    >
                        {number}
                    </button>
                ))}
                <div className="w-16 h-16"></div>
                <button
                    onClick={() => handleNumberClick("0")}
                    className="w-16 h-16 rounded-full bg-white text-orange-500 text-2xl font-bold"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full bg-gray-500 text-white text-xl font-bold"
                >
                    ⌫
                </button>
            </div>

            {/* Notification Retype */}
            {notification.showRetype && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseNotification}>
                    <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5" onClick={(e) => e.stopPropagation()}>
                        <div className="w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400">
                            <RotateCw className="scale-[1.5]" />
                        </div>
                        <p className="text-xl text-orange-400">Masukkan ulang pin Anda.</p>
                    </div>
                </div>
            )}

            {/* Notification Success */}
            {notification.showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseNotification}>
                    <div className="w-[90%] bg-white p-5 mt-5 rounded-lg flex items-center flex-col gap-5" onClick={(e) => e.stopPropagation()}>
                        <div className="w-20 h-20 flex items-center justify-center text-white rounded-full bg-green-400">
                            <Check className="scale-[1.5]" />
                        </div>
                        <p className="text-xl text-black font-semibold">PIN Sukses Dibuat.</p>
                        <p className="text-gray-500 text-sm text-center">
                            Mohon untuk tidak memberitahukan PIN Anda kepada siapapun demi keamanan Anda.
                        </p>
                        <Button onClick={() => navigate('/dashboard')} className="uppercase text-white bg-green-400">
                            Saya, Mengerti
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PinInput;

import { useState, useEffect } from "react";

const ModalExpired = () => {
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    useEffect(() => {
        const handleSessionExpired = () => setIsSessionExpired(true);
        window.addEventListener("session-expired", handleSessionExpired);
        console.log(isSessionExpired);
        return () => {
            window.removeEventListener("session-expired", handleSessionExpired);
        };
    }, []);

    const handleLogout = () => {
        setIsSessionExpired(false);
        window.location.href = "/";
        localStorage.clear();
    };

    return (
        <>
            {isSessionExpired && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
                    <div className="bg-white rounded-lg p-6 shadow-lg text-center w-96">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Sesi Anda telah habis
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Silakan login kembali untuk melanjutkan.
                        </p>
                        <button
                            onClick={handleLogout}
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ModalExpired;

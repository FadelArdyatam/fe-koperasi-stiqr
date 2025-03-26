import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const useMarginPPOB = () => {
    const [margin, setMargin] = useState<Record<string, any>>({}); // Gunakan objek, bukan array

    const userItem = sessionStorage.getItem("user");
    const userData = userItem ? JSON.parse(userItem) : null;
    const merchant_id = userData?.merchant?.id;

    const fetchMargin = async () => {
        try {
            const response = await axiosInstance.get(`/margin-ppob/${merchant_id}`);
            setMargin(response.data);
        } catch (err: any) {
            console.error("Error fetching margin:", err);
        }
    };

    useEffect(() => {
        fetchMargin();
    }, []);

    return { margin, fetchMargin };
};

export default useMarginPPOB;

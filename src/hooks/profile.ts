import { useState } from "react";
import axiosInstance from "./axiosInstance";



const useProfile = () => {
    const [profile, setProfile] = useState<[]>([]);

    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get("/auth/profile");
            setProfile(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    return { profile, fetchProfile };
};

export default useProfile;

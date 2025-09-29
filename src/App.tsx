import { useState, useEffect } from "react";
import Signin from "./components/Signin";
import Onboarding from "./components/Onboarding";
import ModalExpired from "./components/ModalExpired";
import axiosInstance from "./hooks/axiosInstance";

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [, setAffiliation] = useState<any>(null);
  const [, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAffiliation();
    }
  }, []);

  const fetchAffiliation = async () => {
    setLoading(true);
    try {
      // fetch affiliation for status purposes
      const response = await axiosInstance.get('/koperasi/affiliation/me');
      setAffiliation(response.data);
    } catch (err: any) {
      console.error('[App] Error fetching affiliation:', err);
      // Fallback: try to get affiliation from JWT token
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setAffiliation({
            affiliation: payload.affiliation || 'UMUM',
            approval_status: payload.approval_status || 'APPROVED',
            koperasi: payload.koperasi_id ? {
              id: payload.koperasi_id,
              nama_koperasi: payload.koperasi_name
            } : null
          });
        }
      } catch (jwtErr) {
        console.error('[App] JWT decode error:', jwtErr);
        setAffiliation(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // no UI rendering here; App only hosts Signin/Onboarding

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Komponen ModalExpired untuk mendeteksi sesi habis */}
      <ModalExpired />

      {/* Konten utama aplikasi */}
      {showOnboarding ? (
        <Onboarding setShowOnboarding={setShowOnboarding} />
      ) : (
        <>
          <Signin />
          {typeof window !== 'undefined' && localStorage.getItem('token') ? (
            <div className="pb-20" />
          ) : null}
        </>
      )}
    </div>
  );
};

export default App;

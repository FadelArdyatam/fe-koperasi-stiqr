import { useState } from "react";
import Signin from "./components/Signin";
import Onboarding from "./components/Onboarding";
import ModalExpired from "./components/ModalExpired";

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div>
      {/* Komponen ModalExpired untuk mendeteksi sesi habis */}
      <ModalExpired />

      {/* Konten utama aplikasi */}
      {showOnboarding ? (
        <Onboarding setShowOnboarding={setShowOnboarding} />
      ) : (
        <Signin />
      )}
    </div>
  );
};

export default App;

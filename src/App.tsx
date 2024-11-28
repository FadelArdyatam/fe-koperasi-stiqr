import { useState } from 'react';
import Signin from './components/Signin';
import Onboarding from './components/Onboarding';

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div>
      {showOnboarding ? (
        <Onboarding setShowOnboarding={setShowOnboarding} />
      ) : (
        <Signin />
      )}
    </div>
  );
};

export default App;

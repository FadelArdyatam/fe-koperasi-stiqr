import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Signup from './pages/Signup.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Pulsa from './pages/Pulsa.tsx'
import PAM from './pages/PAM.tsx'
import Listrik from './pages/Listrik.tsx'
import BPJS from './pages/BPJS.tsx'
import Inbox from './pages/Inbox.tsx'
import Settlement from './pages/Settlement.tsx'
import QRCode from './pages/QRCode.tsx'
import Riwayat from './pages/Riwayat.tsx'
import Profile from './pages/Profile/Profile.tsx'
import Keamanan from './pages/Profile/Keamanan.tsx'
import DataPemilik from './pages/Profile/DataPemilik.tsx'
import DataMerchant from './pages/Profile/DataMerchant.tsx'
import DataPembayaran from './pages/Profile/DataPembayaran.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/pulsa',
    element: <Pulsa />
  },
  {
    path: '/pam',
    element: <PAM />
  },
  {
    path: '/listrik',
    element: <Listrik />
  },
  {
    path: '/bpjs',
    element: <BPJS />
  },
  {
    path: '/inbox',
    element: <Inbox />
  },
  {
    path: '/settlement',
    element: <Settlement />
  },
  {
    path: '/qr-code',
    element: <QRCode />
  },
  {
    path: '/history',
    element: <Riwayat />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/profile/security',
    element: <Keamanan />
  },
  {
    path: '/profile/owner-data',
    element: <DataPemilik />
  },
  {
    path: '/profile/merchant-data',
    element: <DataMerchant />
  },
  {
    path: '/profile/payment-data',
    element: <DataPembayaran />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  } as any,
}
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
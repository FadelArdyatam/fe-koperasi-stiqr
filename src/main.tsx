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
import Riwayat from './pages/Profile/Riwayat.tsx'
import Profile from './pages/Profile/Profile.tsx'
import Keamanan from './pages/Profile/Keamanan.tsx'
import DataPemilik from './pages/Profile/DataPemilik.tsx'
import DataMerchant from './pages/Profile/DataMerchant.tsx'
import DataPembayaran from './pages/Profile/DataPembayaran.tsx'
import Catalog from './pages/Catalog/Catalog.tsx'
import Employee from './pages/Profile/Employee.tsx'
// import Printer from './pages/Profile/Printer.tsx'
import ResetPassword from './pages/ResetPassword.tsx'
import Casheer from './pages/Casheer/Casheer.tsx'
import Booking from './pages/Booking/Booking.tsx'
import PaymentSuccess from './components/PaymentSuccess.tsx'
import ModalExpired from './components/ModalExpired.tsx'
import DataCustomer from './pages/Profile/DataCustomer.tsx'
import Customer from './pages/Customer.tsx'
import NotFound from './pages/NotFound.tsx'
import HelpCenter from './pages/Profile/HelpCenter.tsx'
import RegisterKoperasi from './pages/RegisterKoperasi.tsx'
import KoperasiDashboard from './pages/KoperasiDashboard.tsx'
import EReceipt from './pages/Casheer/EReceipt.tsx'
import EReceiptCustomer from './pages/Casheer/EReceiptCustomer.tsx'
import { RequireAnggotaKoperasiSimple, RequireIndukKoperasiSimple } from './routes/guards-simple.tsx'
import KoperasiMembers from './pages/KoperasiMembers'
import KoperasiMemberDetail from './pages/KoperasiMemberDetail'
import LoansProducts from './pages/LoansProducts'
import LoansApplications from './pages/LoansApplications'
import LoansInstallments from './pages/LoansInstallments'
import KoperasiMargins from './pages/KoperasiMargins'
import KoperasiCatalog from './pages/KoperasiCatalog'

const router = createBrowserRouter([
  {
    path: '/koperasi-margins',
    element: (
      <RequireIndukKoperasiSimple>
        <KoperasiMargins />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/koperasi-catalog',
    element: (
      <RequireIndukKoperasiSimple>
        <KoperasiCatalog />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/register-koperasi',
    element: <RegisterKoperasi />,
  },
  // Koperasi routes (protected by guards)
  {
    path: '/koperasi-dashboard',
    element: (
      <RequireIndukKoperasiSimple>
        <KoperasiDashboard />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/koperasi-members',
    element: (
      <RequireIndukKoperasiSimple>
        <KoperasiMembers />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/koperasi-members/:id',
    element: (
      <RequireIndukKoperasiSimple>
        <KoperasiMemberDetail />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/koperasi-loans/products',
    element: (
      <RequireIndukKoperasiSimple>
        <LoansProducts />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/koperasi-loans/applications',
    element: (
      <RequireIndukKoperasiSimple>
        <LoansApplications />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/koperasi-loans/installments',
    element: (
      <RequireIndukKoperasiSimple>
        <LoansInstallments />
      </RequireIndukKoperasiSimple>
    ),
  },
  {
    path: '/anggota',
    element: (
      <RequireAnggotaKoperasiSimple>
        <Dashboard />
      </RequireAnggotaKoperasiSimple>
    ),
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
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
    element: <QRCode type={''} />
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
    path: '/profile/customer-data',
    element: <DataCustomer />
  },
  {
    path: '/profile/payment-data',
    element: <DataPembayaran />
  },
  {
    path: '/profile/history',
    element: <Riwayat />
  },
  {
    path: '/profile/help-center',
    element: <HelpCenter />
  },
  {
    path: '/profile/employee',
    element: <Employee />
  },
  // {
  //   path: '/profile/printer',
  //   element: <Printer />
  // },
  {
    path: '/catalog',
    element: <Catalog />
  },
  {
    path: '/casheer',
    element: <Casheer />
  },
  {
    path: '/booking',
    element: <Booking />
  },
  {
    path: '/payment-success',
    element: <PaymentSuccess />
  },
  {
    path: '/customer',
    element: <Customer />
  },
  {
    path: '*',
    element: <NotFound />
  },
  {
    path: '/order',
    element: <EReceipt />
  },
  {
    path: '/orderCustomer',
    element: <EReceiptCustomer />
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
    <ModalExpired />
  </React.StrictMode>
)
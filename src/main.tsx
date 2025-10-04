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
import EReceipt from './pages/Casheer/EReceipt.tsx'
import EReceiptCustomer from './pages/Casheer/EReceiptCustomer.tsx'
import { RequireAnggotaKoperasiSimple, RequireIndukKoperasiSimple } from './routes/guards-simple.tsx'

// Old Koperasi imports for loan routes that are kept
import LoansProducts from './pages/LoansProducts'
import LoansApplications from './pages/LoansApplications'
import LoansInstallments from './pages/LoansInstallments'

// Koperasi Induk Imports
import DashboardInduk from './pages/Induk/DashboardInduk.tsx';
import ManajemenAnggota from './pages/Induk/ManajemenAnggota.tsx';
import DetailAnggota from './pages/Induk/DetailAnggota.tsx';
import ManajemenKeuangan from './pages/Induk/ManajemenKeuangan.tsx';
import ManajemenKatalog from './pages/Induk/ManajemenKatalog.tsx';
import ManajemenSimpanan from './pages/Induk/ManajemenSimpanan.tsx';
import KasirKoperasi from './pages/Induk/KasirKoperasi.tsx';

// Koperasi Anggota Imports
import DashboardAnggota from './pages/Anggota/DashboardAnggota.tsx';
import KasirAnggota from './pages/Anggota/KasirAnggota.tsx';
import Simpanan from './pages/Anggota/Simpanan.tsx';

// Koperasi Umum/Public Imports
import PilihKoperasi from './pages/Umum/PilihKoperasi.tsx';
import KatalogPublik from './pages/Umum/KatalogPublik.tsx';

const router = createBrowserRouter([
  // Koperasi Induk Routes
  {
    path: '/induk/dashboard',
    element: <RequireIndukKoperasiSimple><DashboardInduk /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/induk/manajemen-anggota',
    element: <RequireIndukKoperasiSimple><ManajemenAnggota /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/induk/detail-anggota/:id',
    element: <RequireIndukKoperasiSimple><DetailAnggota /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/induk/manajemen-keuangan',
    element: <RequireIndukKoperasiSimple><ManajemenKeuangan /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/induk/manajemen-katalog',
    element: <RequireIndukKoperasiSimple><ManajemenKatalog /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/induk/manajemen-simpanan',
    element: <RequireIndukKoperasiSimple><ManajemenSimpanan /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/induk/kasir',
    element: <RequireIndukKoperasiSimple><KasirKoperasi /></RequireIndukKoperasiSimple>,
  },

  // Koperasi Anggota Routes
  {
    path: '/anggota/dashboard',
    element: <RequireAnggotaKoperasiSimple><DashboardAnggota /></RequireAnggotaKoperasiSimple>,
  },
  {
    path: '/anggota/kasir',
    element: <RequireAnggotaKoperasiSimple><KasirAnggota /></RequireAnggotaKoperasiSimple>,
  },
  {
    path: '/anggota/simpanan',
    element: <RequireAnggotaKoperasiSimple><Simpanan /></RequireAnggotaKoperasiSimple>,
  },

  // Koperasi Umum/Public Routes
  {
    path: '/pilih-koperasi',
    element: <PilihKoperasi />,
  },
  {
    path: '/koperasi/:koperasiId/katalog',
    element: <KatalogPublik />,
  },

  // Kept old loan routes as requested
  {
    path: '/koperasi-loans/products',
    element: <RequireIndukKoperasiSimple><LoansProducts /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/koperasi-loans/applications',
    element: <RequireIndukKoperasiSimple><LoansApplications /></RequireIndukKoperasiSimple>,
  },
  {
    path: '/koperasi-loans/installments',
    element: <RequireIndukKoperasiSimple><LoansInstallments /></RequireIndukKoperasiSimple>,
  },

  // General Routes
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
  {
    path: '/anggota',
    element: <RequireAnggotaKoperasiSimple><Dashboard /></RequireAnggotaKoperasiSimple>,
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
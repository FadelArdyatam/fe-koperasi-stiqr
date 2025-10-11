import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NavBottom from './components/NavBottom.tsx';
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
import ManajemenJatuhTempo from './pages/Induk/ManajemenJatuhTempo.tsx';
import KasirKoperasi from './pages/Induk/KasirKoperasi.tsx';
import RiwayatTransaksi from './pages/Induk/RiwayatTransaksi.tsx';
import TambahProdukInduk from './pages/Induk/TambahProduk.tsx';

// Koperasi Anggota Imports
import DashboardAnggota from './pages/Anggota/DashboardAnggota.tsx';
import KatalogProduk from './pages/Anggota/KatalogProduk.tsx';
import Simpanan from './pages/Anggota/Simpanan.tsx';
import JatuhTempo from './pages/Anggota/JatuhTempo.tsx';
import QRPayment from './pages/Anggota/QRPayment.tsx';

// Koperasi Umum/Public Imports
import PilihKoperasi from './pages/Umum/PilihKoperasi.tsx';
import KatalogPublik from './pages/Umum/KatalogPublik.tsx';
import QRPaymentUmum from './pages/Umum/QRPayment.tsx';
// import MemberSimpanPinjam from './pages/KoperasiSimpanPinjam/Member/MemberSimpanPinjam.tsx';

const router = createBrowserRouter(
  [
    // == Routes WITHOUT NavBottom ==
    { path: "/", element: <App /> },
    { path: "/signup", element: <Signup /> },
    { path: "/register-koperasi", element: <RegisterKoperasi /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/payment-success", element: <PaymentSuccess /> },
    { path: "/order", element: <EReceipt /> },
    { path: "/orderCustomer", element: <EReceiptCustomer /> },
    { path: "/pilih-koperasi", element: <PilihKoperasi /> },
    { path: "/koperasi/:koperasiId/katalog", element: <KatalogPublik /> },
    { path: "/umum/qr-payment", element: <QRPaymentUmum /> },

    // == Induk Koperasi ==
    {
      path: "/induk/dashboard",
      element: (
        <RequireIndukKoperasiSimple>
          <DashboardInduk />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/manajemen-anggota",
      element: (
        <RequireIndukKoperasiSimple>
          <ManajemenAnggota />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/detail-anggota/:id",
      element: (
        <RequireIndukKoperasiSimple>
          <DetailAnggota />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/manajemen-keuangan",
      element: (
        <RequireIndukKoperasiSimple>
          <ManajemenKeuangan />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/tambah-produk",
      element: (
        <RequireIndukKoperasiSimple>
          <TambahProdukInduk />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/manajemen-simpanan",
      element: (
        <RequireIndukKoperasiSimple>
          <ManajemenSimpanan />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/manajemen-jatuh-tempo",
      element: (
        <RequireIndukKoperasiSimple>
          <ManajemenJatuhTempo />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/kasir",
      element: (
        <RequireIndukKoperasiSimple>
          <KasirKoperasi />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/induk/riwayat",
      element: (
        <RequireIndukKoperasiSimple>
          <RiwayatTransaksi />
        </RequireIndukKoperasiSimple>
      ),
    },

    // == Anggota Koperasi ==
    {
      path: "/anggota/dashboard",
      element: (
        <RequireAnggotaKoperasiSimple>
          <DashboardAnggota />
        </RequireAnggotaKoperasiSimple>
      ),
    },
    {
      path: "/anggota/katalog",
      element: (
        <RequireAnggotaKoperasiSimple>
          <KatalogProduk />
        </RequireAnggotaKoperasiSimple>
      ),
    },
    {
      path: "/anggota/simpanan",
      element: (
        <RequireAnggotaKoperasiSimple>
          <Simpanan />
        </RequireAnggotaKoperasiSimple>
      ),
    },
    {
      path: "/anggota/jatuh-tempo",
      element: (
        <RequireAnggotaKoperasiSimple>
          <JatuhTempo />
        </RequireAnggotaKoperasiSimple>
      ),
    },
    {
      path: "/anggota",
      element: (
        <RequireAnggotaKoperasiSimple>
          <Dashboard />
        </RequireAnggotaKoperasiSimple>
      ),
    },

    // == Koperasi Loans ==
    {
      path: "/koperasi-loans/products",
      element: (
        <RequireIndukKoperasiSimple>
          <LoansProducts />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/koperasi-loans/applications",
      element: (
        <RequireIndukKoperasiSimple>
          <LoansApplications />
        </RequireIndukKoperasiSimple>
      ),
    },
    {
      path: "/koperasi-loans/installments",
      element: (
        <RequireIndukKoperasiSimple>
          <LoansInstallments />
        </RequireIndukKoperasiSimple>
      ),
    },

    // == Layanan Umum ==
    { path: "/pulsa", element: <Pulsa /> },
    { path: "/pam", element: <PAM /> },
    { path: "/listrik", element: <Listrik /> },
    { path: "/bpjs", element: <BPJS /> },

    // == Lainnya ==
    { path: "/inbox", element: <Inbox /> },
    { path: "/casheer", element: <Casheer /> },
    { path: "/booking", element: <Booking /> },
    { path: "/customer", element: <Customer /> },
    { path: "*", element: <NotFound /> },

    // == Routes WITH NavBottom ==
    {
      element: <NavBottom />,
      children: [
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/qr-code", element: <QRCode type={""} /> },
        { path: "/settlement", element: <Settlement /> },
        { path: "/catalog", element: <Catalog /> },
        { path: "/profile", element: <Profile /> },
        { path: "/profile/security", element: <Keamanan /> },
        { path: "/profile/owner-data", element: <DataPemilik /> },
        { path: "/profile/merchant-data", element: <DataMerchant /> },
        { path: "/profile/customer-data", element: <DataCustomer /> },
        { path: "/profile/payment-data", element: <DataPembayaran /> },
        { path: "/profile/history", element: <Riwayat /> },
        { path: "/profile/help-center", element: <HelpCenter /> },
        { path: "/profile/employee", element: <Employee /> },
        {
          path: "/anggota/qr-payment",
          element: (
            <RequireAnggotaKoperasiSimple>
              <QRPayment />
            </RequireAnggotaKoperasiSimple>
          ),
        },
        {
          path: "/induk/manajemen-katalog",
          element: (
            <RequireIndukKoperasiSimple>
              <ManajemenKatalog />
            </RequireIndukKoperasiSimple>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    } as any,
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ModalExpired />
  </React.StrictMode>
);

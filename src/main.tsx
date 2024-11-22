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
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
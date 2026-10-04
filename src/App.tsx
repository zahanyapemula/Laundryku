import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import RequireRole from './components/guards'
import ActionDialog from './components/ActionDialog'
import { OrderDraftProvider } from './pages/customer/OrderDraftContext'

import Login from './pages/Login'
import Profile from './pages/Profile'

import CustomerDashboard from './pages/customer/CustomerDashboard'
import OrderForm from './pages/customer/OrderForm'
import OrderConfirm from './pages/customer/OrderConfirm'
import OrderSuccess from './pages/customer/OrderSuccess'
import CustomerOrders from './pages/customer/CustomerOrders'
import CustomerOrderDetail from './pages/customer/CustomerOrderDetail'
import LaundryStatus from './pages/customer/LaundryStatus'
import Payment from './pages/customer/Payment'
import Delivery from './pages/customer/Delivery'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'

import CourierDashboard from './pages/courier/CourierDashboard'
import CourierTaskDetail from './pages/courier/CourierTaskDetail'
import Invoice from './pages/customer/Invoice'

export default function App() {
  return (
    <OrderDraftProvider>
      <AppLayout>
        <ActionDialog />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Pelanggan */}
          <Route
            path="/pelanggan"
            element={
              <RequireRole role="customer">
                <CustomerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pemesanan"
            element={
              <RequireRole role="customer">
                <OrderForm />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/konfirmasi"
            element={
              <RequireRole role="customer">
                <OrderConfirm />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan/berhasil"
            element={
              <RequireRole role="customer">
                <OrderSuccess />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan"
            element={
              <RequireRole role="customer">
                <CustomerOrders />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan/:id"
            element={
              <RequireRole role="customer">
                <CustomerOrderDetail />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan/:id/status"
            element={
              <RequireRole role="customer">
                <LaundryStatus />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan/:id/pembayaran"
            element={
              <RequireRole role="customer">
                <Payment />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/status"
            element={
              <RequireRole role="customer">
                <LaundryStatus />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pembayaran"
            element={
              <RequireRole role="customer">
                <Payment />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan/:id/pengantaran"
            element={
              <RequireRole role="customer">
                <Delivery />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pesanan/:id/invoice"
            element={
              <RequireRole role="customer">
                <Invoice />
              </RequireRole>
            }
          />
          <Route
            path="/pelanggan/pengantaran"
            element={
              <RequireRole role="customer">
                <Delivery />
              </RequireRole>
            }
          />

          {/* Admin/Kasir */}
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/pesanan"
            element={
              <RequireRole role="admin">
                <AdminOrders />
              </RequireRole>
            }
          />
          <Route
            path="/admin/pesanan/:id"
            element={
              <RequireRole role="admin">
                <AdminOrderDetail />
              </RequireRole>
            }
          />

          {/* Kurir */}
          <Route
            path="/kurir"
            element={
              <RequireRole role="courier">
                <CourierDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/kurir/tugas"
            element={
              <RequireRole role="courier">
                <CourierDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/kurir/tugas/:id"
            element={
              <RequireRole role="courier">
                <CourierTaskDetail />
              </RequireRole>
            }
          />
          <Route
            path="/kurir/tugas/:id/:leg"
            element={
              <RequireRole role="courier">
                <CourierTaskDetail />
              </RequireRole>
            }
          />

          {/* Profil (semua role) */}
          <Route path="/profil" element={<Profile />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppLayout>
    </OrderDraftProvider>
  )
}
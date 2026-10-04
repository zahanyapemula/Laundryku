import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import type { Role } from '../types'

const homeFor = (role: Role) =>
  role === 'admin' ? '/admin' : role === 'courier' ? '/kurir' : '/pelanggan'

export default function RequireRole({
  role,
  children,
}: {
  role: Role
  children: ReactNode
}) {
  const { user } = useStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (user.role !== role) {
    return <Navigate to={homeFor(user.role)} replace />
  }
  return <>{children}</>
}
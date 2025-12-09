import type { ReactNode } from "react"
import type { UserRole } from "./types"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  userRole: UserRole
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, userRole, fallback = null }: RoleGuardProps) {
  if (!allowedRoles.includes(userRole)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

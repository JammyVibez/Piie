import type { ReactNode } from "react"
import type { UserRole } from "./types"

interface PermissionGateProps {
  children: ReactNode
  userRole: UserRole
  requiredPermissions: UserRole[]
  fallback?: ReactNode
}

// Define permission hierarchy
const permissionHierarchy: Record<UserRole, number> = {
  helper: 1,
  contributor: 2,
  support: 3,
  mod: 4,
  admin: 5,
  explorer: 1,
  creator: 2,
  entertainer: 2,
  educator: 2,
  analyst: 2,
}

export function PermissionGate({ children, userRole, requiredPermissions, fallback }: PermissionGateProps) {
  const hasPermission =
    requiredPermissions.includes(userRole) ||
    permissionHierarchy[userRole] >= Math.max(...requiredPermissions.map((r) => permissionHierarchy[r]))

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

import { useMemo } from 'react'
import useAuthStore from '../store/authStore'
import { hasActionPermission, hasRoutePermission } from '../utils/roles'

export function usePermissions() {
  const { user } = useAuthStore()
  const userRole = user?.role

  const permissions = useMemo(() => ({
    canAccess: (path) => hasRoutePermission(userRole, path),
    can: (action) => hasActionPermission(userRole, action)
  }), [userRole])

  return permissions
}
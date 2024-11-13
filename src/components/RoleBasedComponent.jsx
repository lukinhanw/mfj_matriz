import { usePermissions } from '../hooks/usePermissions'

function RoleBasedComponent({ action, fallback = null, children }) {
  const { can } = usePermissions()

  if (!can(action)) {
    return fallback
  }

  return children
}

export default RoleBasedComponent
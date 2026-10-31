import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If customer tries to access admin/staff routes, redirect to portal or 403
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'CUSTOMER') {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/403" replace />;
  }

  return children;
}


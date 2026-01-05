import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./auth/authContext";

/**
 * ProtectedRoute component - protects routes based on user role
 * @param {JSX.Element} element - Component to render if authorized
 * @param {string | string[]} requiredRole - Single role or array of roles allowed
 * @param {string} fallbackRoute - Route to redirect to if not authorized (default: "/login")
 */
export function ProtectedRoute({ element, requiredRole, fallbackRoute = "/login" }) {
  const { loggedIn, role, hasRole } = useContext(AuthContext);

  // Not logged in
  if (!loggedIn) {
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check if user has required role
  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(role)) {
        return <Navigate to="/" replace />;
      }
    } else {
      if (role !== requiredRole) {
        return <Navigate to="/" replace />;
      }
    }
  }

  // User is authorized
  return element;
}

/**
 * Component to conditionally render content based on user role
 * @param {string | string[]} allowedRoles - Role(s) that can see this content
 * @param {JSX.Element} children - Content to show if authorized
 * @param {JSX.Element} fallback - Content to show if not authorized
 */
export function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { role } = useContext(AuthContext);

  const hasAccess = Array.isArray(allowedRoles) 
    ? allowedRoles.includes(role)
    : role === allowedRoles;

  return hasAccess ? children : fallback;
}

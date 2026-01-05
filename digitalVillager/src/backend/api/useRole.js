import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useRole() {
  const { loggedIn, role, hasRole, hasPermission } = useContext(AuthContext);

  return {
    loggedIn,
    role,
    isAdmin: () => hasRole("kplbHQ"),
    isOfficial: () => hasRole("official"),
    isCitizen: () => hasRole("citizen"),
    hasRole: hasRole,
    hasPermission: hasPermission,
    hasAnyRole: (roles) => hasRole(roles),
  };
}

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * useAuth Hook
 * Provides access to the current authenticated user, loading status, and logout handler.
 *
 * @returns {Object} { user, loading, logout }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
